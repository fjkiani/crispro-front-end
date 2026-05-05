import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

export function SlPi3kOpportunityCard({
  missingPayload,
  pi3kPathway,
  pi3kDrugs,
}) {
  if (missingPayload) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography sx={{ fontWeight: 900 }}>PI3K/AKT/mTOR axis</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Cannot evaluate: SL payload missing.
        </Typography>
      </Box>
    );
  }

  if (!pi3kPathway) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography sx={{ fontWeight: 900 }}>PI3K/AKT/mTOR axis</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Not present in this SL payload’s `essential_pathways`.
        </Typography>
      </Box>
    );
  }

  const score = Number(pi3kPathway?.disruption_score);
  const genes = Array.isArray(pi3kPathway?.genes_affected) ? pi3kPathway.genes_affected : [];

  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f5f3ff' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 900 }}>PI3K/AKT/mTOR axis</Typography>
        <Chip size="small" label="Consider-tier pathway opportunity" color="warning" variant="outlined" />
        <Chip size="small" label="UI-derived" variant="outlined" />
        {Number.isFinite(score) ? (
          <Chip size="small" label={`disruption ${score.toFixed(2)}`} variant="outlined" />
        ) : null}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        This pathway is present in `essential_pathways`, so the UI should surface a mechanistic opportunity even when legacy `recommended_drugs` is empty.
      </Typography>

      {genes.length > 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Genes affected: {genes.join(', ')}
        </Typography>
      ) : null}

      {pi3kDrugs.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
            Mechanistic inhibitors to surface
          </Typography>
          <Stack spacing={1} sx={{ mt: 0.75 }}>
            {pi3kDrugs.slice(0, 3).map((drug, index) => (
              <Box key={`${String(drug?.drug_name)}-${index}`} sx={{ p: 1, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #ddd6fe' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 900 }}>{String(drug?.drug_name || 'Drug')}</Typography>
                  <Chip size="small" label={String(drug?.drug_class || 'Pathway inhibitor')} variant="outlined" />
                  <Chip size="small" label={String(drug?.evidence_tier || 'mechanistic')} variant="outlined" />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
