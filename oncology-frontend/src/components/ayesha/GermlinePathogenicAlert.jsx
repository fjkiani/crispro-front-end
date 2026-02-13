/**
 * GermlinePathogenicAlert - Alert for germline pathogenic mutations
 * 
 * Displays warning when pathogenic germline mutations are detected.
 */

import React from 'react';
import { Alert, AlertTitle, Typography, Box } from '@mui/material';

export default function GermlinePathogenicAlert({ patientProfile }) {
  if (
    !patientProfile?.germline?.status === 'POSITIVE' ||
    !patientProfile?.germline?.mutations?.some(m => m.classification === 'pathogenic')
  ) {
    return null;
  }

  const pathogenicMutations = patientProfile.germline.mutations.filter(
    m => m.classification === 'pathogenic'
  );

  return (
    <Alert severity="warning" sx={{ mb: 3 }}>
      <AlertTitle>Germline Pathogenic Mutation Detected</AlertTitle>
      {pathogenicMutations.map((mutation, idx) => (
        <Box key={idx}>
          <Typography>
            <strong>{mutation.gene}</strong>
            {mutation.syndrome && ` (${mutation.syndrome})`}
          </Typography>
          {mutation.risk_increases && mutation.risk_increases.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Risk increases:</strong> {mutation.risk_increases.join(', ')}
            </Typography>
          )}
        </Box>
      ))}
    </Alert>
  );
}
