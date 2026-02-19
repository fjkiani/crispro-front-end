import React from 'react';
import { Card, Typography, Divider, Grid, Chip } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

/**
 * Patient Profile Card component
 * Displays case data including mutations, biomarkers, and treatment history
 */
export default function PatientProfileCard({ caseData }) {
  if (!caseData) return null;

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalHospital color="primary" />
        Patient Profile
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Patient ID:</strong> {caseData.patient_id || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Disease:</strong> {caseData.disease?.type?.replace(/_/g, ' ') || caseData.disease || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Stage:</strong> {caseData.disease?.stage || caseData.stage || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>HRD Score:</strong> {caseData.biomarkers?.hrd_score || caseData.biomarkers?.hrd || 'Not available'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Mutations:</strong>
          </Typography>
          {caseData.mutations?.map((mut, idx) => {
            const variant = mut.hgvs_p || mut.protein_change || mut.hgvs_c || mut.variant || '';
            const label = `${mut.gene || 'Unknown'} ${variant}`.trim() || 'Variant details not available';
            return (
              <Chip
                key={idx}
                label={label}
                color="error"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            );
          })}
          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
            <strong>Treatment Line:</strong> {caseData.treatment_history?.current_line || 'Not specified'}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {caseData.treatment_history?.prior_therapies?.length
              ? `Prior: ${caseData.treatment_history.prior_therapies.join(', ')}`
              : 'Prior: None documented'}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
