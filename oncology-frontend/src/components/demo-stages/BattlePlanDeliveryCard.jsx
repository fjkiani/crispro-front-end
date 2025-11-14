import React from 'react';
import { Card, CardContent, Typography, Grid, Alert } from '@mui/material';

/**
 * BattlePlanDeliveryCard - Stage 7: De-Risked Asset Delivery
 * 
 * Props:
 * - demoData: Object with {total_candidates, top_candidate, development_cost, timeline_compression, regulatory_strategy, next_steps, asset_value}
 */
export default function BattlePlanDeliveryCard({ demoData }) {
  if (!demoData) return null;

  return (
    <Card sx={{ mb: 2, border: '2px solid #2e7d32' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="success.main">
          🎯 Therapeutic Blueprint Delivered
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Total Candidates: <strong>{demoData.total_candidates}</strong></Typography>
            <Typography variant="body2">Top Candidate: <strong>{demoData.top_candidate}</strong></Typography>
            <Typography variant="body2">Development Cost: <strong>{demoData.development_cost}</strong></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Timeline Compression: <strong>{demoData.timeline_compression}</strong></Typography>
            <Typography variant="body2">Regulatory Strategy: <strong>{demoData.regulatory_strategy}</strong></Typography>
            <Typography variant="body2">Asset Value: <strong>{demoData.asset_value}</strong></Typography>
          </Grid>
        </Grid>
        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>MISSION COMPLETE:</strong> {demoData.next_steps}
        </Alert>
      </CardContent>
    </Card>
  );
}



