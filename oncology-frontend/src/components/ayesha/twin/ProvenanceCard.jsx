import React from 'react';
import { Card, Typography } from '@mui/material';

/**
 * Provenance Card component
 * Displays data source, method, and RUO disclaimer
 */
export default function ProvenanceCard({ provenance }) {
  if (!provenance) return null;

  return (
    <Card sx={{ p: 2, bgcolor: 'grey.100' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        <strong>Provenance:</strong> {provenance.method} |
        Data Source: {provenance.data_source} |
        Case: {provenance.case_id}
      </Typography>
      <Typography variant="caption" color="error.main" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
        {provenance.ruo_disclaimer}
      </Typography>
    </Card>
  );
}
