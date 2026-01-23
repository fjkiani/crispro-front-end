import React, { useEffect, useRef, useState } from 'react';
import { Box, Chip, Typography, Stack, Tooltip, Button } from '@mui/material';

const LiveJobBanner = () => {
  const API_BASE_URL = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';
  const [elapsed, setElapsed] = useState(0);
  const [warmStatus, setWarmStatus] = useState(null); // {status, selected_model, upstream_service, elapsed_sec}
  const [isWarming, setIsWarming] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const start = Date.now();
    intervalRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const queued = (window.__mdt_mutations || []).length || 0;
  const modelId = window.__mdt_model_id || 'evo2_7b';

  const doWarmup = async () => {
    try {
      setIsWarming(true);
      setWarmStatus(null);
      const r = await fetch(`${API_BASE_URL}/api/evo/warmup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.detail || 'Warmup failed');
      setWarmStatus(j);
    } catch (e) {
      setWarmStatus({ status: 'error', detail: String(e) });
    } finally {
      setIsWarming(false);
    }
  };

  return (
    <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip label="Mode: live" color="success" size="small" />
        <Tooltip title="Public backend forwarding to Evo2 service">
          <Chip label={API_BASE_URL} variant="outlined" size="small" />
        </Tooltip>
        <Chip label={`Elapsed: ${mins}:${secs.toString().padStart(2, '0')}`} size="small" />
        <Chip label={`Model: ${modelId}`} size="small" />
        <Chip label={`Queued: ${queued}`} size="small" />
        <Button variant="contained" size="small" onClick={doWarmup} disabled={isWarming}>
          {isWarming ? 'Warming…' : 'Confirm & Warm Up'}
        </Button>
        {warmStatus?.status === 'ready' && (
          <Tooltip title={`Upstream: ${warmStatus.upstream_service}`}>
            <Chip color="success" label={`Ready (${warmStatus.selected_model}, ${warmStatus.elapsed_sec}s)`} size="small" />
          </Tooltip>
        )}
        {warmStatus?.status === 'error' && (
          <Tooltip title={warmStatus.detail}>
            <Chip color="default" label={`Warmup failed`} size="small" />
          </Tooltip>
        )}
      </Stack>
      {elapsed >= 30 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Warming model (cold start). Large models can take up to a few minutes on first call.
        </Typography>
      )}
    </Box>
  );
};

export default LiveJobBanner; 