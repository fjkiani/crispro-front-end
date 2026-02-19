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
        <strong>Provenance:</strong> {provenance.method || 'Not available'}
        {provenance.data_source ? ` | Data Source: ${provenance.data_source}` : ''}
        {provenance.case_id ? ` | Case: ${provenance.case_id}` : ''}
        {provenance.orchestrator ? ` | Engine: ${provenance.orchestrator}` : ''}
        {provenance.run_id ? ` | Run: ${provenance.run_id}` : ''}
      </Typography>
      {provenance.ruo_disclaimer && (
        <Typography variant="caption" color="error.main" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
          {provenance.ruo_disclaimer}
        </Typography>
      )}
    </Card>
  );
}
