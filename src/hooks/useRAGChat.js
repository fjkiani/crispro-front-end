/**
 * useRAGChat - hook that manages a Brenus RAG chat session.
 *
 * Supports both one-shot HTTP (POST /api/rag/chat) and streaming
 * (WS /ws/rag/stream). Automatically attaches a fresh Clerk token
 * on each request.
 *
 * Event shape from the WebSocket:
 *   {type: 'meta',       citations: [...]}         — retrieved chunks
 *   {type: 'token',      text: '...'}              — incremental token
 *   {type: 'correction', answer, guardrail_notes}  — guardrails rewrote output
 *   {type: 'final',      answer, guardrail_notes, latency_ms}
 *   {type: 'error',      message}
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ROOT } from '../lib/apiConfig';

function buildWsUrl(token) {
  // Convert API_ROOT (https://...) → wss://.../ws/rag/stream
  const base = API_ROOT || '';
  const wsBase = base.replace(/^http/i, 'ws');
  const url = new URL(`${wsBase}/ws/rag/stream`);
  if (token) url.searchParams.set('token', token);
  return url.toString();
}

export default function useRAGChat({ persona = 'pharma', collections = null } = {}) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]); // array of {role, text, citations, guardrail_notes, id}
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const currentAssistantIdRef = useRef(null);

  useEffect(() => () => {
    // cleanup on unmount
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (_) {}
      wsRef.current = null;
    }
  }, []);

  const sendOneShot = useCallback(
    async (question) => {
      setError(null);
      const userMsg = { id: `u-${Date.now()}`, role: 'user', text: question };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);
      try {
        const token = await getToken?.();
        const res = await fetch(`${API_ROOT}/api/rag/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ question, persona, collections }),
        });
        if (!res.ok) throw new Error(`RAG chat failed (${res.status})`);
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: data.answer,
            citations: data.citations || [],
            guardrail_notes: data.guardrail_notes || [],
            latency_ms: data.latency_ms,
          },
        ]);
      } catch (err) {
        setError(err.message);
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', text: `Error: ${err.message}`, isError: true },
        ]);
      } finally {
        setStreaming(false);
      }
    },
    [getToken, persona, collections],
  );

  const sendStreaming = useCallback(
    async (question) => {
      setError(null);
      const userMsg = { id: `u-${Date.now()}`, role: 'user', text: question };
      const assistantId = `a-${Date.now()}`;
      currentAssistantIdRef.current = assistantId;
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', text: '', citations: [], guardrail_notes: [] },
      ]);
      setStreaming(true);

      try {
        const token = await getToken?.();
        // Close existing socket
        if (wsRef.current) {
          try { wsRef.current.close(); } catch (_) {}
        }
        const ws = new WebSocket(buildWsUrl(token));
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ question, persona, collections }));
        };
        ws.onmessage = (event) => {
          let payload;
          try {
            payload = JSON.parse(event.data);
          } catch (_) {
            return;
          }
          const id = currentAssistantIdRef.current;
          if (!id) return;

          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== id) return m;
              switch (payload.type) {
                case 'meta':
                  return { ...m, citations: payload.citations || m.citations };
                case 'token':
                  return { ...m, text: (m.text || '') + (payload.text || '') };
                case 'correction':
                  return { ...m, text: payload.answer, guardrail_notes: payload.guardrail_notes || [] };
                case 'final':
                  return {
                    ...m,
                    text: payload.answer ?? m.text,
                    guardrail_notes: payload.guardrail_notes || m.guardrail_notes,
                    latency_ms: payload.latency_ms,
                  };
                case 'error':
                  return { ...m, text: `${m.text}\n\n**Error:** ${payload.message}`, isError: true };
                default:
                  return m;
              }
            }),
          );

          if (payload.type === 'final' || payload.type === 'error') {
            setStreaming(false);
            try { ws.close(); } catch (_) {}
          }
        };
        ws.onerror = (e) => {
          setError('WebSocket error');
          setStreaming(false);
        };
        ws.onclose = () => {
          setStreaming(false);
        };
      } catch (err) {
        setError(err.message);
        setStreaming(false);
      }
    },
    [getToken, persona, collections],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (_) {}
    }
  }, []);

  return {
    messages,
    streaming,
    error,
    sendOneShot,
    sendStreaming,
    clear,
  };
}
