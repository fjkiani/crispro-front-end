import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

/**
 * StructuralValidationCard - Stage 5: Structural Validation
 * 
 * Props:
 * - demoData: Object with {binding_affinity, selectivity_window, admet_score, blood_brain_barrier, metabolic_stability, toxicity_prediction}
 */
export default function StructuralValidationCard({ demoData }) {
  if (!demoData) return null;

  return (
    <Card sx={{ mb: 2, border: '2px solid #4caf50' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="success.main">
          🧬 Structural Gauntlet Results
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Binding Affinity: <strong>{demoData.binding_affinity}</strong></Typography>
            <Typography variant="body2">ADMET Score: <strong>{demoData.admet_score}/10</strong></Typography>
            <Typography variant="body2">BBB Permeability: <strong>{demoData.blood_brain_barrier}</strong></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Selectivity Window: <strong>{demoData.selectivity_window}</strong></Typography>
            <Typography variant="body2">Metabolic Stability: <strong>{demoData.metabolic_stability}</strong></Typography>
            <Typography variant="body2">Toxicity Risk: <strong>{demoData.toxicity_prediction}</strong></Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}



