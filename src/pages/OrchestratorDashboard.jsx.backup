/**
 * OrchestratorDashboard Page
 * 
 * Main dashboard for MOAT Orchestrator.
 * Modular layout with patient upload and analysis results.
 */

import React, { useState, lazy, Suspense } from 'react';
import { Container, Grid, Typography, Box, Tabs, Tab } from '@mui/material';
import { PatientUpload } from '../components/orchestrator/Patient/PatientUpload';
import { useOrchestrator } from '../hooks/useOrchestrator';
import { LoadingState, ErrorState, EmptyState } from '../components/orchestrator/Common';

// Lazy load analysis cards for performance
const BiomarkerCard = lazy(() => import('../components/orchestrator/Analysis/BiomarkerCard').then(m => ({ default: m.BiomarkerCard })));
const ResistanceCard = lazy(() => import('../components/orchestrator/Analysis/ResistanceCard').then(m => ({ default: m.ResistanceCard })));
const DrugRankingCard = lazy(() => import('../components/orchestrator/Analysis/DrugRankingCard').then(m => ({ default: m.DrugRankingCard })));
const TrialMatchesCard = lazy(() => import('../components/orchestrator/Analysis/TrialMatchesCard').then(m => ({ default: m.TrialMatchesCard })));
const NutritionCard = lazy(() => import('../components/orchestrator/Analysis/NutritionCard').then(m => ({ default: m.NutritionCard })));
const SyntheticLethalityCard = lazy(() => import('../components/orchestrator/Analysis/SyntheticLethalityCard').then(m => ({ default: m.SyntheticLethalityCard })));
const CarePlanViewer = lazy(() => import('../components/orchestrator/CarePlan/CarePlanViewer').then(m => ({ default: m.CarePlanViewer })));
const MonitoringDashboard = lazy(() => import('../components/orchestrator/Monitoring/MonitoringDashboard').then(m => ({ default: m.MonitoringDashboard })));

export const OrchestratorDashboard = () => {
  const [patientId, setPatientId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { state, loading, error, refreshState } = useOrchestrator(patientId);

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
          {loading && <LoadingState message="Loading analysis..." />}
          
          {error && (
            <ErrorState
              title="Error Loading Analysis"
              message={error.message}
              onRetry={() => refreshState(patientId)}
            />
          )}

          {state && !loading && !error && (
            <>
              {/* Tab Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Analysis" />
                  <Tab label="Care Plan" />
                  <Tab label="Monitoring" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Suspense fallback={<LoadingState />}>
                      <BiomarkerCard
                        biomarkerProfile={state.biomarker_profile}
                        loading={loading}
                      />
                    </Suspense>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Suspense fallback={<LoadingState />}>
                      <ResistanceCard
                        resistancePrediction={state.resistance_prediction}
                        loading={loading}
                      />
                    </Suspense>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Suspense fallback={<LoadingState />}>
                      <DrugRankingCard
                        drugRanking={state.drug_ranking}
                        mechanismVector={state.mechanism_vector}
                        loading={loading}
                      />
                    </Suspense>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Suspense fallback={<LoadingState />}>
                      <TrialMatchesCard
                        trialMatches={state.trial_matches?.trials || state.trial_matches || []}
                        loading={loading}
                      />
                    </Suspense>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Suspense fallback={<LoadingState />}>
                      <NutritionCard
                        nutritionPlan={state.nutrition_plan}
                        loading={loading}
                      />
                    </Suspense>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Suspense fallback={<LoadingState />}>
                      <SyntheticLethalityCard
                        slResult={state.synthetic_lethality_result}
                        loading={loading}
                      />
                    </Suspense>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Suspense fallback={<LoadingState />}>
                  <CarePlanViewer
                    carePlan={state.care_plan}
                    loading={loading}
                  />
                </Suspense>
              )}

              {activeTab === 2 && (
                <Suspense fallback={<LoadingState />}>
                  <MonitoringDashboard
                    monitoringConfig={state.monitoring_config}
                    loading={loading}
                  />
                </Suspense>
              )}
            </>
          )}

          {!state && !loading && !error && (
            <EmptyState
              title="No Patient Data"
              message="Upload patient data to see analysis results"
              actionLabel="Upload Data"
              onAction={() => setActiveTab(0)}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};


