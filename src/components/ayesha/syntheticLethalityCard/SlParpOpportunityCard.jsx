import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';

export function SlParpOpportunityCard({
  missingPayload,
  hasParpAxis,
  parpDepMap,
  parpRequires,
  parpDrugs,
}) {
  if (missingPayload) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography sx={{ fontWeight: 900 }}>PARP axis</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Cannot evaluate: SL payload missing.
        </Typography>
      </Box>
    );
  }
  if (!hasParpAxis) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography sx={{ fontWeight: 900 }}>PARP axis</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Not present in this SL payload’s `essential_pathways`.
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff7ed' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 900 }}>PARP axis</Typography>
        <Chip size="small" label="GATED — requires HRD/platinum phenotype" color="warning" variant="outlined" />
        <Chip size="small" label="UI-derived" variant="outlined" />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        Even if HR/PARP appear in `essential_pathways`, patient-level interpretation should be gated by missing data.
      </Typography>

      {parpDepMap?.length > 0 && (
        <Box sx={{ mt: 1.5, mb: 1.5, p: 1, borderRadius: 2, bgcolor: '#fffbed', border: '1px dashed #fcd34d' }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: '#92400e', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScienceIcon fontSize="inherit" /> DepMap Quantitative Proof
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
            {parpDepMap.map((line, idx) => (
              <li key={idx}>
                <Typography variant="body2" sx={{ color: '#92400e', fontStyle: 'italic' }}>
                  {line}
                </Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}

      {parpRequires.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
            Request missing data (from backend `gating.parp_axis.requires`)
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
            {parpRequires.map((req) => (
              <li key={req}>
                <Typography variant="body2">{req}</Typography>
              </li>
            ))}
          </Box>
        </Box>
      ) : null}

      {parpDrugs.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
            Drugs surfaced in this axis (verbatim; RUO)
          </Typography>
          <Stack spacing={1} sx={{ mt: 0.75 }}>
            {parpDrugs.slice(0, 2).map((d) => (
              <Box key={String(d?.drug_name)} sx={{ p: 1, borderRadius: 2, bgcolor: '#fff', border: '1px solid #fed7aa' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 900 }}>{String(d?.drug_name || 'Drug')}</Typography>
                  <Chip size="small" label={String(d?.approval_status || 'UNKNOWN')} variant="outlined" />
                </Stack>
                {d?.clinical_context ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Clinical context (gated): {String(d.clinical_context)}
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
