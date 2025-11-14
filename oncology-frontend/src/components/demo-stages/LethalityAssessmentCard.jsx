import React from 'react';
import { Card, CardContent, Typography, Grid, Alert } from '@mui/material';

/**
 * LethalityAssessmentCard - Stage 6: Efficacy Prediction
 * 
 * Props:
 * - demoData: Object with {assassin_score, clinical_success_probability, development_timeline, efficacy_prediction, safety_prediction, market_potential}
 */
export default function LethalityAssessmentCard({ demoData }) {
  if (!demoData) return null;

  return (
    <Card sx={{ mb: 2, border: '2px solid #673ab7' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="secondary">
          📊 Clinical Success Prediction
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Assassin Score: <strong style={{color: '#673ab7'}}>{demoData.assassin_score}%</strong></Typography>
            <Typography variant="body2">Success Probability: <strong>{demoData.clinical_success_probability}%</strong></Typography>
            <Typography variant="body2">Timeline: <strong>{demoData.development_timeline}</strong></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Efficacy: <strong>{demoData.efficacy_prediction}</strong></Typography>
            <Typography variant="body2">Safety: <strong>{demoData.safety_prediction}</strong></Typography>
            <Typography variant="body2">Market Potential: <strong>{demoData.market_potential}</strong></Typography>
          </Grid>
        </Grid>
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>{demoData.clinical_success_probability}% success rate beats industry average by 5X!</strong>
        </Alert>
      </CardContent>
    </Card>
  );
}



