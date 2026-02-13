/**
 * CarePlanSummaryStats - Summary statistics card
 * 
 * Displays key metrics: drug recommendations count, food recommendations count, trials found, confidence level.
 */

import React from 'react';
import { Card, Typography, Grid } from '@mui/material';

export default function CarePlanSummaryStats({ result }) {
  if (!result) return null;

  return (
    <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Drug Recommendations:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {result.drug_recommendations?.length || 0}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Food/Supplement Recommendations:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {result.food_recommendations?.length || 0}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Trials Found:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {result.trials?.trials?.length || 0}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Confidence Level:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {result.integrated_confidence 
              ? `${Math.round(result.integrated_confidence * 100)}%`
              : result.summary?.confidence_level || "N/A"}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
