/**
 * OrchestratorDashboard Page
 * 
 * Main dashboard for MOAT Orchestrator.
 * Modular layout with patient upload and analysis results.
 */

import React, { useState } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { PatientUpload } from '../components/orchestrator/Patient/PatientUpload';
import { BiomarkerCard } from '../components/orchestrator/Analysis/BiomarkerCard';
import { useOrchestrator } from '../hooks/useOrchestrator';

export const OrchestratorDashboard = () => {
  const [patientId, setPatientId] = useState(null);
  const { state, loading, refreshState } = useOrchestrator(patientId);

  const handleUploadComplete = () => {
    if (state?.patient_id) {
      setPatientId(state.patient_id);
      refreshState(state.patient_id);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        MOAT Patient Care Orchestrator
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload patient data to run the complete care pipeline
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column: Upload & Patient Info */}
        <Grid item xs={12} md={4}>
          <PatientUpload
            patientId={patientId}
            onUploadComplete={handleUploadComplete}
          />
          
          {state && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Patient: {state.patient_id}</Typography>
              <Typography variant="body2" color="text.secondary">
                Phase: {state.phase}
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Right Column: Analysis Results */}
        <Grid item xs={12} md={8}>
          {loading && (
            <Box>
              <Typography>Loading analysis...</Typography>
            </Box>
          )}

          {state && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <BiomarkerCard
                  biomarkerProfile={state.biomarker_profile}
                  loading={loading}
                />
              </Grid>
              
              {/* Add more analysis cards here */}
              {/* <Grid item xs={12} md={6}>
                <ResistanceCard resistance={state.resistance_prediction} />
              </Grid>
              <Grid item xs={12} md={6}>
                <DrugRankingCard drugs={state.drug_ranking} />
              </Grid> */}
            </Grid>
          )}

          {!state && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">
                Upload patient data to see analysis results
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

