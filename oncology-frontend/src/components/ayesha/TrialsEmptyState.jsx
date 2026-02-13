/**
 * TrialsEmptyState - Empty state display for clinical trials
 * 
 * Shows message when no trials are found.
 */

import React from 'react';
import { Card, Typography, Box } from '@mui/material';

export default function TrialsEmptyState({ trials }) {
  if (!trials) return null;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Clinical Trials
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {trials.summary?.note || "No trials found. This may be due to strict eligibility criteria or database limitations."}
      </Typography>
      {trials.summary && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Candidates:</strong> {trials.summary.total_candidates || 0} | 
            <strong> Top results:</strong> {trials.summary.top_results || 0}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
