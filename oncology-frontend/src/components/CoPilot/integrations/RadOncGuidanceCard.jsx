import React from 'react';
import { Box, Paper, Chip, Typography, Divider, Stack } from '@mui/material';

export const RadOncGuidanceCard = ({ guidance }) => {
  if (!guidance) return null;

  const isRad = guidance?.modality === 'radiation';
  const score = guidance?.radiosensitivity_score ?? guidance?.efficacy_score;
  const tier = guidance?.tier || guidance?.evidence_tier;
  const confidence = guidance?.confidence;
  const strength = guidance?.strength;
  const onLabel = guidance?.on_label;
  const citations = guidance?.citations || [];
  const insights = guidance?.insights || {};

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1">
          {isRad ? 'RadOnc Guidance' : 'Guidance'}
        </Typography>
        {tier && <Chip size="small" label={`Tier ${tier}`} color={tier === 'I' ? 'success' : tier === 'II' ? 'warning' : 'default'} />}
        {typeof onLabel === 'boolean' && (
          <Chip size="small" label={onLabel ? 'On‑label' : 'Off‑label'} color={onLabel ? 'primary' : 'default'} variant={onLabel ? 'filled' : 'outlined'} />
        )}
        {strength && <Chip size="small" label={strength} variant="outlined" />}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {guidance?.disease || '—'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">{isRad ? 'Radiosensitivity' : 'Efficacy'}</Typography>
          <Typography variant="h6">{typeof score === 'number' ? score.toFixed(2) : '—'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Confidence</Typography>
          <Typography variant="h6">{typeof confidence === 'number' ? confidence.toFixed(2) : '—'}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Insight chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        {['functionality','chromatin','essentiality','regulatory'].map(key => (
          typeof insights[key] === 'number' ? (
            <Chip key={key} label={`${key[0].toUpperCase()}${key.slice(1)}: ${insights[key].toFixed(2)}`} size="small" />
          ) : null
        ))}
      </Box>

      {/* Citations */}
      {citations.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Citations</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {citations.slice(0, 6).map((pmid) => (
              <Chip key={pmid} label={pmid} size="small" component="a" clickable href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} target="_blank" />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};


