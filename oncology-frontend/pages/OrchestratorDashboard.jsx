/**
 * OrchestratorDashboard Page
 * 
 * Main dashboard for MOAT Orchestrator.
 * Modular layout with patient upload and analysis results.
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Container, Grid, Typography, Box, Tabs, Tab, LinearProgress, Chip } from '@mui/material';
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

// Pipeline phases for progress tracking
const PIPELINE_PHASES = [
  'initialized',
  'extracting',
  'analyzing',
  'ranking',
  'matching',
  'planning',
  'monitoring',
  'complete'
];

const getPhaseIndex = (phase) => {
  if (!phase) return 0;
  const normalizedPhase = phase.toLowerCase();
  const index = PIPELINE_PHASES.indexOf(normalizedPhase);
  return index >= 0 ? index : 0;
};

const getPhaseColor = (phase) => {
  if (!phase) return 'default';
  const normalizedPhase = phase.toLowerCase();
  if (normalizedPhase === 'complete') return 'success';
  if (normalizedPhase === 'error') return 'error';
  return 'primary';
};

export const OrchestratorDashboard = () => {
  const [patientId, setPatientId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { state, status, loading, error, refreshState } = useOrchestrator(patientId);
  const pollingIntervalRef = useRef(null);

  // Real-time status polling (Phase 1.1: Enhanced Status Tracking)
  useEffect(() => {
    if (!patientId) {
      // Clear polling if no patient ID
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Don't poll if pipeline is complete or in error state
    const currentPhase = state?.phase?.toLowerCase() || status?.phase?.toLowerCase() || '';
    if (currentPhase === 'complete' || currentPhase === 'error') {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Start polling every 2 seconds
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        refreshState(patientId);
      }, 2000);
    }

    // Cleanup on unmount or patientId change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [patientId, state?.phase, status?.phase, refreshState]);

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
              
              {/* 7-Phase Progress Bar (Phase 1.2: Enhanced Status Tracking) */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pipeline Progress
                  </Typography>
                  <Chip 
                    label={state.phase || status?.phase || 'initialized'} 
                    size="small" 
                    color={getPhaseColor(state.phase || status?.phase)}
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={((getPhaseIndex(state.phase || status?.phase) + 1) / PIPELINE_PHASES.length) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                  {PIPELINE_PHASES.slice(0, 7).map((phase, idx) => {
                    const currentIdx = getPhaseIndex(state.phase || status?.phase);
                    return currentIdx >= idx ? `✓ ${phase}` : `○ ${phase}`;
                  }).join(' → ')}
                  {getPhaseIndex(state.phase || status?.phase) >= 7 && ' → ✓ complete'}
                </Typography>
              </Box>

              {/* Progress Percent (if available from status) */}
              {status?.progress !== undefined && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progress: {status.progress}%
                  </Typography>
                </Box>
              )}
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
