/**
 * SLDetectionAlert Component
 * 
 * Displays synthetic lethality detection alerts (success + info).
 */
import React from 'react';
import { Alert, Typography, Box } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

export const SLDetectionAlert = ({ slDetected, doubleHitDescription }) => {
  if (!slDetected) return null;

  return (
    <Box>
      {/* Success Alert */}
      {doubleHitDescription && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            SYNTHETIC LETHALITY DETECTED
          </Typography>
          <Typography variant="body2">
            {doubleHitDescription}
          </Typography>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Synthetic Lethality Opportunity Detected
        </Typography>
        {doubleHitDescription && (
          <Typography variant="body2">
            {doubleHitDescription}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};
