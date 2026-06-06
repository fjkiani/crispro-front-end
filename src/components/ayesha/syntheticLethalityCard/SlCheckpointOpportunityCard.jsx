import React from 'react';
import { Box, Button, Chip, Stack, Tooltip, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import LaunchIcon from '@mui/icons-material/Launch';
import { pct, prettyJson, safeArray } from './slUtils';

export function SlCheckpointOpportunityCard({
  missingPayload,
  hasCheckpointAxis,
  checkpointDepMap,
  checkpointDrugs,
  depmapLines,
  levelKey,
  onShowTrials,
}) {
  if (missingPayload) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography sx={{ fontWeight: 900 }}>Checkpoint-axis opportunity</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Cannot evaluate: SL payload missing.
        </Typography>
      </Box>
    );
  }
  if (!hasCheckpointAxis) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography sx={{ fontWeight: 900 }}>Checkpoint-axis opportunity</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Not present in this SL payload’s `essential_pathways`.
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 900 }}>Checkpoint-axis opportunity</Typography>
        <Chip size="small" label="Mechanism-aligned (RUO)" color="primary" variant="outlined" />
        <Chip size="small" label="UI-derived" variant="outlined" />
        {depmapLines.length > 0 ? (
          <Tooltip title={prettyJson(depmapLines)} placement="top" arrow>
            <Chip size="small" label="DepMap boost (verbatim)" variant="outlined" />
          </Tooltip>
        ) : null}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        Axis: Checkpoint (ATR/CHK1/WEE1) — rendered because these pathways appear in `essential_pathways`.
      </Typography>

      {checkpointDepMap?.length > 0 && (
        <Box sx={{ mt: 1.5, p: 1, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px dashed #cbd5e1' }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScienceIcon fontSize="inherit" /> DepMap Quantitative Proof
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
            {checkpointDepMap.map((line, idx) => (
              <li key={idx}>
                <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic' }}>
                  {line}
                </Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}

      {checkpointDrugs.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
            Recommended drugs (verbatim)
          </Typography>
          <Stack spacing={1} sx={{ mt: 0.75 }}>
            {checkpointDrugs.slice(0, 3).map((d, i) => (
              <Box key={`${String(d?.drug_name)}-${i}`} sx={{ p: 1, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 900 }}>{String(d?.drug_name || 'Drug')}</Typography>
                  <Chip size="small" label={`conf ${pct(d?.confidence)}`} variant="outlined" />
                  <Chip size="small" label={String(d?.approval_status || 'UNKNOWN')} variant="outlined" />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {`Bundle path: \`levels.${levelKey}.synthetic_lethality.recommended_drugs[*].confidence\` (this row is filtered to ATR/WEE1 targets)`}
                </Typography>
                {d?.mechanism ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    MoA: {String(d.mechanism)}
                  </Typography>
                ) : null}
                {safeArray(d?.rationale).length ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {safeArray(d.rationale).slice(0, 2).join(' · ')}
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="contained"
          endIcon={<LaunchIcon />}
          onClick={() => (typeof onShowTrials === 'function' ? onShowTrials('checkpoint_axis') : null)}
          disabled={typeof onShowTrials !== 'function'}
        >
          Show trials matching ATR/WEE1 axis
        </Button>
        {typeof onShowTrials !== 'function' ? (
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
            (Hook not provided on this page)
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
