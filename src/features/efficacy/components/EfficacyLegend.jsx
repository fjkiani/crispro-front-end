import React from 'react';
import { Box, Stack, Chip, Typography } from '@mui/material';

export default function EfficacyLegend() {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Legend</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Chip size="small" label="PathwayAligned" color="success" />
        <Chip size="small" label="ClinVar-Strong" color="secondary" />
        <Chip size="small" label="RCT" />
        <Chip size="small" label="Guideline" />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Evidence Gates: Supported requires RCT/Guideline or ClinVar-Strong + PathwayAligned; Consider otherwise; Insufficient when sequence/pathway/evidence are all low.
      </Typography>
    </Box>
  );
}
 