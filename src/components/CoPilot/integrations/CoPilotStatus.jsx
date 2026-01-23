import React from 'react';
import { Box, Chip } from '@mui/material';
import { useProactiveInsights } from '../hooks/useProactiveInsights';

/**
 * CoPilot status indicator
 */
export const CoPilotStatus = ({ variant, analysisResults }) => {
  const { hasHighPriorityInsights } = useProactiveInsights();

  return (
    <Box sx={{ position: 'fixed', top: 100, right: 24, zIndex: 999 }}>
      {hasHighPriorityInsights() && (
        <Chip
          label="AI Insights Available"
          color="success"
          onClick={() => {
            // This would open CoPilot
            console.log('Open CoPilot for insights');
          }}
          sx={{ cursor: 'pointer' }}
        />
      )}
    </Box>
  );
};

