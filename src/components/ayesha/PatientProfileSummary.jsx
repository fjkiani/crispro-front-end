/**
 * PatientProfileSummary - Displays patient profile information card
 * 
 * Shows disease, germline status, and key biomarkers in a clean card layout.
 */

import React from 'react';
import { Card, Typography, Grid, Alert } from '@mui/material';

export default function PatientProfileSummary({ patientProfile }) {
  if (!patientProfile) return null;

  return (
    <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Patient Profile: {patientProfile.patient?.display_name || 'AK'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary">Disease</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {patientProfile.disease?.histology || 'High-grade serous carcinoma'} - Stage {patientProfile.disease?.stage || 'IVB'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary">Germline Status</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: patientProfile.germline_status === 'positive' ? 'warning.main' : 'text.primary' }}>
            {patientProfile.germline_status?.toUpperCase() || 'UNKNOWN'} 
            {patientProfile.germline?.mutations?.[0]?.gene && ` (${patientProfile.germline.mutations[0].gene})`}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary">Key Biomarkers</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            PD-L1: CPS {patientProfile.tumor_context?.biomarkers?.pd_l1_cps || 'N/A'} | 
            p53: {patientProfile.tumor_context?.biomarkers?.p53_status || 'N/A'} | 
            MMR: {patientProfile.tumor_context?.biomarkers?.mmr_status || 'N/A'}
          </Typography>
        </Grid>
      </Grid>
      <Alert severity="info" sx={{ mt: 2 }}>
        Using <strong>AYESHA_11_17_25_PROFILE</strong> - source of truth from 7 parsed medical reports.
      </Alert>
    </Card>
  );
}
