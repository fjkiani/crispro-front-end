import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Evidence Tier Indicator Component
 * Shows S/P/E evidence tier (supported/consider/insufficient) with color coding
 */
export const EvidenceTier = ({ tier }) => {
  if (!tier) return null;

  const getTierColor = (tierValue) => {
    switch (tierValue) {
      case 'supported': return '#4caf50';
      case 'consider': return '#ff9800';
      case 'insufficient': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
        Evidence Tier:
      </Typography>
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.7rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          color: 'white',
          backgroundColor: getTierColor(tier)
        }}
      >
        {tier}
      </Box>
    </Box>
  );
};

