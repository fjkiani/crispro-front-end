/**
 * BiomarkerCard Component
 * 
 * Displays biomarker analysis results (TMB, MSI, HRD).
 * Modular, self-contained component.
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Grid,
} from '@mui/material';
import { Science, CheckCircle, Cancel } from '@mui/icons-material';

export const BiomarkerCard = ({ biomarkerProfile, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading biomarkers...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!biomarkerProfile) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No biomarker data available</Typography>
        </CardContent>
      </Card>
    );
  }

  const tmb = biomarkerProfile.tmb || {};
  const msi = biomarkerProfile.msi || {};
  const hrd = biomarkerProfile.hrd || {};

  const getTmbColor = (classification) => {
    if (classification === 'TMB-H') return 'error';
    if (classification === 'TMB-M') return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader
        avatar={<Science />}
        title="Biomarker Analysis"
        subheader="TMB, MSI, HRD Status"
      />
      <CardContent>
        <Grid container spacing={2}>
          {/* TMB */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Tumor Mutational Burden
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="h6">
                  {tmb.value?.toFixed(2) || '0.00'} mut/Mb
                </Typography>
                <Chip
                  label={tmb.classification || 'TMB-L'}
                  color={getTmbColor(tmb.classification)}
                  size="small"
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {tmb.mutation_count || 0} mutations detected
              </Typography>
            </Box>
          </Grid>

          {/* MSI */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Microsatellite Instability
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="h6">
                  {msi.status || 'MSS'}
                </Typography>
                {msi.status === 'MSI-H' ? (
                  <CheckCircle color="error" />
                ) : (
                  <Cancel color="disabled" />
                )}
              </Box>
              {msi.dmmr_genes_mutated?.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  dMMR: {msi.dmmr_genes_mutated.join(', ')}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* HRD */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Homologous Recombination Deficiency
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="h6">
                  {hrd.status || 'HRD-'}
                </Typography>
                {hrd.status === 'HRD+' ? (
                  <CheckCircle color="success" />
                ) : (
                  <Cancel color="disabled" />
                )}
              </Box>
              {hrd.genes_mutated?.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Genes: {hrd.genes_mutated.join(', ')}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Eligibility */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Treatment Eligibility
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {biomarkerProfile.io_eligible && (
              <Chip label="IO Eligible" color="info" size="small" />
            )}
            {biomarkerProfile.parp_eligible && (
              <Chip label="PARP Eligible" color="success" size="small" />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};


