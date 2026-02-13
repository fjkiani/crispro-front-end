/**
 * AwaitingNGSAlert - Alert when NGS data is required
 * 
 * Displays information about required NGS tests for personalized drug recommendations.
 */

import React from 'react';
import { Alert, Typography, Box } from '@mui/material';

export default function AwaitingNGSAlert({ result }) {
  if (result?.wiwfm_status !== "awaiting_ngs") {
    return null;
  }

  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        NGS Data Required for Personalized Drug Recommendations
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {result.wiwfm?.message || "Personalized drug efficacy predictions require tumor NGS data (somatic mutations, HRD, TMB, MSI)"}
      </Typography>
      {result.wiwfm?.ngs_fast_track && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Recommended NGS Tests:
          </Typography>
          {Object.entries(result.wiwfm.ngs_fast_track).map(([key, value]) => (
            <Typography key={key} variant="body2" sx={{ pl: 2 }}>
              • <strong>{key}:</strong> {value}
            </Typography>
          ))}
        </Box>
      )}
    </Alert>
  );
}
