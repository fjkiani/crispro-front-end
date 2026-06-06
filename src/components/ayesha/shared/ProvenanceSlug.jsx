/**
 * ProvenanceSlug — Shared provenance footer replacing all fake engine names.
 *
 * Reads real provenance from the bundle/levelData. Falls back to honest
 * "local" labeling when API provenance is unavailable.
 *
 * Props:
 *   bundle     — the full bundle object (has contract_version, generated_at)
 *   levelData  — the active level data (has efficacy.provenance)
 *   engineName — optional override; if omitted, reads from levelData.efficacy.provenance.engine_used
 *   suffix     — optional extra text after the provenance line
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function ProvenanceSlug({ bundle, levelData, engineName, suffix }) {
  const prov = levelData?.efficacy?.provenance;
  const engine = engineName || prov?.engine_used || null;
  const runId = prov?.run_id || null;
  const contractVersion = bundle?.contract_version || bundle?.contractVersion || null;
  const generatedAt = bundle?.generated_at || bundle?.generatedAt || null;

  // Build the provenance line from real data
  const parts = [];
  if (engine) parts.push(`Engine: ${engine}`);
  if (runId) parts.push(`Run: ${String(runId).slice(0, 12)}`);
  if (contractVersion) parts.push(`Contract: ${contractVersion}`);
  if (generatedAt) parts.push(`Generated: ${generatedAt}`);

  // If we have zero real provenance fields, be honest
  const provenanceText = parts.length > 0
    ? parts.join(' · ')
    : 'Source: patient profile (local)';

  return (
    <Box sx={{
      textAlign: 'center', pt: 4, pb: 2,
      display: 'flex', flexDirection: 'column', gap: 0.5,
      '@media print': { display: 'block', pt: 4, mt: 'auto' }
    }}>
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1,
        mx: 'auto', px: 2.5, py: 1, borderRadius: 2,
        bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
      }}>
        <TrendingUpIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.6rem', textTransform: 'uppercase' }}>
          PROVENANCE LOG
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.65rem' }}>
        {provenanceText}
        {suffix ? ` · ${suffix}` : ''}
      </Typography>
    </Box>
  );
}
