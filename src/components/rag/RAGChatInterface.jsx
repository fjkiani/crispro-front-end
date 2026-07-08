/**
 * RAGChatInterface - port of Verba's ChatInterface to MUI/JSX for the CrisPRO
 * front-end. Talks to the backend RAG endpoints registered by rag.py:
 *   POST /api/rag/chat        (one-shot)
 *   WS   /ws/rag/stream       (streaming)
 *
 * Props:
 *   persona: 'pharma' | 'oncologist' | 'patient' (default 'pharma')
 *   collections: optional array of Qdrant collection names
 *   streaming: default true (use WebSocket)
 *   suggestions: optional array of starter prompts
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Paper, Stack, Typography, TextField, IconButton, Button,
  Divider, Tooltip, Chip, Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import BoltIcon from '@mui/icons-material/Bolt';
import useRAGChat from '../../hooks/useRAGChat';
import RAGMessage from './RAGMessage';

const DEFAULT_SUGGESTIONS = [
  'What is STC-1010\'s mechanism vs. tusamitamab?',
  'How does CrisPRO score compare to Brenus fit?',
  'What guardrails are active on the PATH A formula?',
  'Summarize the BreAK CRC-001 primary endpoint.',
];

export default function RAGChatInterface({
  persona = 'pharma',
  collections = null,
  streaming = true,
  suggestions = DEFAULT_SUGGESTIONS,
  title = 'Brenus Intelligence',
  subtitle = 'Ask about STC-1010, CEACAM5, competitive positioning, and CrisPRO fit-gap.',
}) {
  const {
    messages, streaming: busy, error, sendOneShot, sendStreaming, clear,
  } = useRAGChat({ persona, collections });
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    // auto-scroll on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const submit = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    if (streaming) {
      await sendStreaming(q);
    } else {
      await sendOneShot(q);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '80vh', maxHeight: '80vh' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<BoltIcon />}
            label={streaming ? 'Streaming' : 'One-shot'}
            size="small"
            color={streaming ? 'primary' : 'default'}
            variant="outlined"
          />
          <Tooltip title="Clear conversation">
            <IconButton onClick={clear} disabled={busy || messages.length === 0} size="small">
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.length === 0 && !busy && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Try a starter prompt:
            </Typography>
            <Stack spacing={1} sx={{ width: '100%', maxWidth: 640 }}>
              {suggestions.map((s) => (
                <Button
                  key={s}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setInput(s);
                  }}
                >
                  {s}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
        <Stack spacing={2}>
          {messages.map((m) => (
            <RAGMessage key={m.id} message={m} />
          ))}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 1 }}>
          {error}
        </Alert>
      )}

      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={busy ? 'Waiting for response…' : 'Ask Brenus…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={busy}
        />
        <IconButton color="primary" onClick={submit} disabled={busy || !input.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
