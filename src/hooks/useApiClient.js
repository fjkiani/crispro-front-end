import { useMemo } from 'react';
import { API_ROOT as API_BASE_URL } from '../lib/apiConfig';

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export default function useApiClient(modelId) {

  const client = useMemo(() => {
    const post = async (endpoint, payload = {}, opts = {}) => {
      const controller = new AbortController();
      const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : DEFAULT_TIMEOUT_MS;
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const body = JSON.stringify({ ...(payload || {}), model_id: modelId || 'evo2_7b' });
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.detail || `HTTP ${res.status}`;
          throw new Error(msg);
        }
        return json;
      } finally {
        clearTimeout(timer);
      }
    };
    return { post };
  }, [API_BASE_URL, modelId]);

  return client;
} 