/**
 * SLSuggestedTherapy Component
 * 
 * Displays suggested therapy chip.
 */
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

export const SLSuggestedTherapy = ({ suggestedTherapy }) => {
  if (!suggestedTherapy) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Suggested Therapy
      </Typography>
      <Chip
        label={suggestedTherapy}
        color="primary"
        size="medium"
      />
    </Box>
  );
};
