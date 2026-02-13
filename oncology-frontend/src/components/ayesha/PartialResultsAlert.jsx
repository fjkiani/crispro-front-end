/**
 * PartialResultsAlert - Alert for partial results with errors
 * 
 * Displays warning when API returns partial results with errors.
 */

import React from 'react';
import { Alert, Typography } from '@mui/material';

export default function PartialResultsAlert({ result }) {
  if (!result?.errors || result.errors.length === 0) {
    return null;
  }

  return (
    <Alert severity="warning" sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Partial Results Available:
      </Typography>
      {result.errors.map((err, idx) => (
        <Typography key={idx} variant="body2">
          • {err}
        </Typography>
      ))}
    </Alert>
  );
}
