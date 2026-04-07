import React from 'react';
import { Box, Typography } from '@mui/material';

export function SuggestedTherapyBanner({ text, isSuperseded = false }) {
  if (!text) return null;
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: isSuperseded ? '#fffbeb' : '#ecfdf5',
        border: isSuperseded ? '1px solid #fcd34d' : '1px solid #6ee7b7',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 900,
          color: isSuperseded ? '#92400e' : '#047857',
          display: 'block',
          mb: 0.5,
        }}
      >
        {isSuperseded ? 'Legacy suggested therapy (noncanonical)' : 'Suggested therapy (bundle)'}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 800, color: isSuperseded ? '#78350f' : '#065f46' }}
      >
        {String(text)}
      </Typography>
      {isSuperseded ? (
        <Typography variant="caption" sx={{ display: 'block', color: '#92400e', mt: 0.75 }}>
          Kept only for bundle compatibility. UI should prefer the canonical evidence-matrix recommendation spine above.
        </Typography>
      ) : null}
    </Box>
  );
}
