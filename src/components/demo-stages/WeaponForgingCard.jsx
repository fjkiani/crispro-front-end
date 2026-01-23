import React from 'react';
import { Card, CardContent, Typography, Grid, Alert } from '@mui/material';

/**
 * WeaponForgingCard - Stage 4: Weapon Forging
 * 
 * Props:
 * - demoData: Object with {small_molecule_leads, protac_candidates, sirna_sequences, allosteric_modulators, total_candidates, selectivity_ratio, ip_landscape}
 */
export default function WeaponForgingCard({ demoData }) {
  if (!demoData) return null;

  return (
    <Card sx={{ mb: 2, border: '2px solid #9c27b0' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="secondary">
          ⚔️ Therapeutic Arsenal Forged
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Small Molecules: <strong>{demoData.small_molecule_leads}</strong></Typography>
            <Typography variant="body2">PROTAC Degraders: <strong>{demoData.protac_candidates}</strong></Typography>
            <Typography variant="body2">siRNA Sequences: <strong>{demoData.sirna_sequences}</strong></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Allosteric Modulators: <strong>{demoData.allosteric_modulators}</strong></Typography>
            <Typography variant="body2">Total Candidates: <strong>{demoData.total_candidates}</strong></Typography>
            <Typography variant="body2">Selectivity: <strong>{demoData.selectivity_ratio}</strong></Typography>
          </Grid>
        </Grid>
        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>IP Status:</strong> {demoData.ip_landscape}
        </Alert>
      </CardContent>
    </Card>
  );
}



