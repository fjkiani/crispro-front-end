import React from 'react';
import { Card, CardContent, Typography, Grid, Alert } from '@mui/material';

/**
 * TargetAcquisitionCard - Stage 1: Target Acquisition
 * 
 * Props:
 * - demoData: Object with {gene, variant, target_class, therapeutic_area, current_pipeline_status, mutation_type, clinical_significance}
 */
export default function TargetAcquisitionCard({ demoData }) {
  if (!demoData) return null;

  return (
    <Card sx={{ mb: 2, border: '2px solid #1976d2' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          🎯 Target Acquired: {demoData.gene} {demoData.variant}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Gene: <strong>{demoData.gene}</strong></Typography>
            <Typography variant="body2">Variant: <strong>{demoData.variant}</strong></Typography>
            <Typography variant="body2">Target Class: <strong>{demoData.target_class}</strong></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Therapeutic Area: <strong>{demoData.therapeutic_area}</strong></Typography>
            <Typography variant="body2">Status: <strong>{demoData.current_pipeline_status}</strong></Typography>
            <Typography variant="body2">Mutation Type: <strong>{demoData.mutation_type}</strong></Typography>
          </Grid>
        </Grid>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>R&D Question:</strong> Is {demoData.gene} {demoData.variant} worth a $200M investment? Let's find out...
        </Alert>
      </CardContent>
    </Card>
  );
}



