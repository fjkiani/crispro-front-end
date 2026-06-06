/**
 * SourceSlug — Data lineage micro-component.
 *
 * Renders a small, unobtrusive label showing where a value came from.
 * Use on every card/section that displays a computed or derived value.
 *
 * Props:
 *   source  — string or { engine, version, runId } object
 *   label   — optional override for the "Source:" prefix
 *   compact — if true, renders inline without the "Source:" prefix
 */
import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function formatSource(source) {
  if (!source) return null;
  if (typeof source === 'string') return source;
  const parts = [];
  if (source.engine) parts.push(source.engine);
  if (source.version) parts.push(`v${source.version}`);
  if (source.runId) parts.push(`run:${source.runId.slice(0, 8)}`);
  return parts.join(' · ') || null;
}

export default function SourceSlug({ source, label = 'Source', compact = false }) {
  const text = formatSource(source);
  if (!text) return null;

  if (compact) {
    return (
      <Tooltip title={`${label}: ${text}`} arrow placement="top">
        <InfoOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled', verticalAlign: 'middle', ml: 0.5, cursor: 'help' }} />
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
      <InfoOutlinedIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.62rem', fontWeight: 600, letterSpacing: 0.3 }}>
        {label}: {text}
      </Typography>
    </Box>
  );
}
