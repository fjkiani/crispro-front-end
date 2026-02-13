/**
 * SLPARPInhibitors Component
 * 
 * Displays top 3 PARP inhibitors ranked by confidence.
 */
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

export const SLPARPInhibitors = ({ recommendedDrugs, slDetected }) => {
  if (!slDetected || !recommendedDrugs || recommendedDrugs.length === 0) {
    return null;
  }

  // Filter and rank PARP inhibitors
  const parpCandidates = (recommendedDrugs || []).filter((d) => {
    const cls = String(d?.drug_class || '').toLowerCase();
    const name = String(d?.drug_name || '').toLowerCase();
    return cls.includes('parp') || 
           name.includes('olaparib') || 
           name.includes('niraparib') || 
           name.includes('rucaparib') || 
           name.includes('talazoparib');
  });

  const topParps = parpCandidates
    .slice()
    .sort((a, b) => {
      const confDiff = Number(b?.confidence || 0) - Number(a?.confidence || 0);
      if (confDiff !== 0) return confDiff;
      return String(a?.drug_name || '').localeCompare(String(b?.drug_name || ''));
    })
    .slice(0, 3);

  if (topParps.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Top PARP Inhibitors (ranked)
      </Typography>
      {topParps.map((drug, idx) => (
        <Box key={`${drug?.drug_name || 'parp'}-${idx}`} sx={{ mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={drug.drug_name} color={idx === 0 ? 'primary' : 'default'} />
            {typeof drug.confidence === 'number' && (
              <Chip label={`${Math.round(drug.confidence * 100)}% confidence`} size="small" />
            )}
            {drug.evidence_tier && (
              <Chip label={`tier ${drug.evidence_tier}`} size="small" variant="outlined" />
            )}
            {drug.fda_approved && (
              <Chip label="FDA Approved" size="small" color="success" />
            )}
          </Box>
          {drug.mechanism && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {drug.mechanism}
            </Typography>
          )}
          {drug.rationale && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
              {Array.isArray(drug.rationale) ? drug.rationale.join('; ') : drug.rationale}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};
