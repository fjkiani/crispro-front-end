/**
 * RAGMessage - a single chat bubble for the Brenus RAG UI.
 * Renders assistant/user text with markdown + citation chips + guardrail badges.
 */
import React from 'react';
import { Box, Paper, Typography, Chip, Divider, Tooltip, Stack } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GavelIcon from '@mui/icons-material/Gavel';

const roleStyles = {
  user: { alignSelf: 'flex-end', bg: '#0279EE', fg: '#fff' },
  assistant: { alignSelf: 'flex-start', bg: '#ECE9E2', fg: '#000' },
};

export default function RAGMessage({ message }) {
  const style = roleStyles[message.role] || roleStyles.assistant;
  const isErr = Boolean(message.isError);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ...(message.role === 'user' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }) }}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '85%',
          bgcolor: isErr ? '#fef2f2' : style.bg,
          color: isErr ? '#7f1d1d' : style.fg,
          borderRadius: 2,
          '& p': { m: 0, mb: 1 },
          '& p:last-child': { mb: 0 },
          '& pre': {
            bgcolor: 'rgba(0,0,0,0.08)',
            p: 1.2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.85em',
          },
          '& code': { fontFamily: 'monospace', fontSize: '0.9em' },
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text || '…'}</ReactMarkdown>
      </Paper>

      {message.role === 'assistant' && (message.citations?.length > 0 || message.guardrail_notes?.length > 0) && (
        <Box sx={{ mt: 1, maxWidth: '85%' }}>
          {message.citations?.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
              {message.citations.slice(0, 6).map((c, i) => (
                <Tooltip
                  key={i}
                  title={
                    <Box>
                      <Typography variant="caption" fontWeight="bold">
                        {c.collection} · score={Number(c.score).toFixed(3)}
                      </Typography>
                      <Divider sx={{ my: 0.5 }} />
                      <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
                        {c.text?.slice(0, 400) || '(empty)'}
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Chip
                    label={`[${i + 1}] ${c.collection?.replace('brenus_p', 'P')}`}
                    size="small"
                    variant="outlined"
                    sx={{ cursor: 'help' }}
                  />
                </Tooltip>
              ))}
              {message.citations.length > 6 && (
                <Chip label={`+${message.citations.length - 6} more`} size="small" variant="outlined" />
              )}
            </Stack>
          )}
          {message.guardrail_notes?.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
              {message.guardrail_notes.map((n, i) => (
                <Tooltip key={i} title={n} arrow>
                  <Chip
                    icon={n.includes('BLOCK') ? <GavelIcon /> : <WarningAmberIcon />}
                    label={n.match(/\[([A-Z]+)/)?.[1] || 'GUARDRAIL'}
                    size="small"
                    color={n.includes('BLOCK') ? 'error' : 'warning'}
                    variant="outlined"
                  />
                </Tooltip>
              ))}
            </Stack>
          )}
          {message.latency_ms != null && (
            <Typography variant="caption" color="text.secondary">
              {message.latency_ms} ms
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
