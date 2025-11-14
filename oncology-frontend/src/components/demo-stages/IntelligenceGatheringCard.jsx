import React from 'react';
import { Card, CardContent, Typography, Grid, Alert } from '@mui/material';

/**
 * IntelligenceGatheringCard - Stage 2: Target Validation
 * 
 * Props:
 * - demoData: Object with {zeta_score, confidence, functional_impact, target_validation, mechanism, kinase_activity, oncogenic_potential}
 */
export default function IntelligenceGatheringCard({ demoData }) {
  if (!demoData) return null;

  return (
    <Card sx={{ mb: 2, border: '2px solid #f44336' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="error">
          🔍 ZETA ORACLE VERDICT: PATHOGENIC
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Zeta Score: <strong style={{color: '#f44336'}}>{demoData.zeta_score}</strong></Typography>
            <Typography variant="body2">Confidence: <strong>{demoData.confidence}%</strong></Typography>
            <Typography variant="body2">Kinase Activity: <strong>{demoData.kinase_activity}</strong></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Functional Impact: <strong>{demoData.functional_impact}</strong></Typography>
            <Typography variant="body2">Mechanism: <strong>{demoData.mechanism}</strong></Typography>
            <Typography variant="body2">Oncogenic Potential: <strong>{demoData.oncogenic_potential}</strong></Typography>
          </Grid>
        </Grid>
        <Alert severity="error" sx={{ mt: 2 }}>
          <strong>VERDICT:</strong> {demoData.target_validation} - Mission is GO!
        </Alert>
      </CardContent>
    </Card>
  );
}



