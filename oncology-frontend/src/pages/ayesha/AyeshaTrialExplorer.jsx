/**
 * Ayesha Trial Explorer Page - MODULARIZED
 * 
 * Precision trial matching for Ayesha's Stage IVB ovarian cancer.
 * Displays top 10 ranked trials with transparent reasoning.
 * 
 * REFACTORED: Uses universal components and modular tab architecture.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Alert, Paper, Grid, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import hooks (single source of truth)
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';
import { useAyeshaCareData } from '../../hooks/ayesha/useAyeshaCareData';

import { useSyntheticLethality } from '../../hooks/useSyntheticLethality';
import { useTimingChemoFeatures } from '../../hooks/useTimingChemoFeatures';

// Import modular tab components
import {
  OverviewTab,
  TrialsTab,
  TreatmentTab,
  MonitoringTab,
  ResistanceTab,
  SyntheticLethalityTab,
} from '../../components/ayesha/tabs';

// Import section components
import { OpportunityScoreCard } from '../../components/ayesha/sections';
import PatientProfileSummary from '../../components/ayesha/PatientProfileSummary';
import ResistanceAlertBanner from '../../components/ayesha/ResistanceAlertBanner';
import { SLOpportunityBanner } from '../../components/ayesha';

// Import universal components
import { LoadingState, ErrorState } from '../../components/orchestrator/Common/index';
import { CompleteCareLoadingSkeleton } from '../../components/LoadingSkeleton';
// Import additional dashboard components
// Import additional dashboard components
// Import additional dashboard components
import PatientJourneyEnhanced from '../../components/patient/PatientJourneyEnhanced';
import IOSafestSelectionCard from '../../components/ayesha/IOSafestSelectionCard';

// Modular Dashboard Components
import WhereAmI from '../../components/patient/dashboard/WhereAmI';
import WhatsNext from '../../components/patient/dashboard/WhatsNext';
import WhatCanIDo from '../../components/patient/dashboard/WhatCanIDo';
import { usePatientStatus } from '../../hooks/usePatientStatus';

const AyeshaTrialExplorer = () => {
  const navigate = useNavigate();
  // Use hooks - single source of truth
  const { profile, getDDRMutations } = useAyeshaProfile();

  // Calculate status and missing tests
  const { missingTests } = usePatientStatus(profile);

  // Use universal care data hook (replaces manual loadTrials)
  const { result, loading, error, refresh } = useAyeshaCareData({
    include_trials: true,
    include_soc: true,
    include_ca125: true,
    include_wiwfm: true,
    include_food: true,
    include_resistance: true,
    include_resistance_prediction: true,
    include_io_selection: true, // Configured in hook, but explicit here for clarity
    // MARS RULE: Show EVERYTHING. No filtered views.
    max_trials: 1200,
  });

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Synthetic Lethality (SL) analysis
  const { slResult, loading: slLoading, error: slError, analyzeSL } = useSyntheticLethality();

  // Timing & Chemosensitivity Features
  const {
    timingFeatures,
    loading: timingLoading,
    error: timingError,
    computeTimingFeatures,
  } = useTimingChemoFeatures();

  // Trigger SL analysis on page load
  useEffect(() => {
    analyzeSL(profile);
  }, [profile, analyzeSL]);

  const handleUploadTest = (testName) => {
    const q = testName ? `?upload=${encodeURIComponent(String(testName))}` : '';
    navigate(`/ayesha/tests${q}`);
  };



  // Extract data from result
  const trials = result?.trials?.trials || [];
  const ca125Intelligence = result?.ca125_intelligence;
  const socRecommendation = result?.soc_recommendation;
  const nextTestRecommender = result?.next_test_recommender;
  const hintTiles = result?.hint_tiles?.hint_tiles || [];
  const mechanismMap = result?.mechanism_map;
  const resistanceAlert = result?.resistance_alert;
  const resistancePlaybook = result?.resistance_playbook;
  const saeFeatures = result?.sae_features;
  const wiwfm = result?.wiwfm;
  const foodValidation = result?.food_validation;
  const resistancePrediction = result?.resistance_prediction;
  const ioSelection = result?.io_selection; // Validated from backend
  const provenance = result?.provenance;
  const summary = result?.summary;

  // Loading state
  if (loading) {
    return <CompleteCareLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header with Opportunity Score */}
      <OpportunityScoreCard profile={profile} result={result} />

      {/* MODULAR DASHBOARD: Side-by-Side Layout */}
      <Grid container spacing={3} mb={3} alignItems="stretch">
        {/* Column 1: Where Am I? */}
        <Grid item xs={12} lg={4}>
          <WhereAmI patientProfile={profile} />
        </Grid>

        {/* Column 2: What's Next? */}
        <Grid item xs={12} lg={4}>
          <WhatsNext
            missingTests={missingTests}
            onUploadTest={handleUploadTest}
          />
        </Grid>

        {/* Column 3: What Can I Do? (Includes SL Logic) */}
        <Grid item xs={12} lg={4}>
          <WhatCanIDo
            carePlan={result}
            trialCount={trials.length}
            missingTestsCount={missingTests.length}
            slResult={slResult}
            onViewTrials={() => setActiveTab(1)}
            onViewCarePlan={() => setActiveTab(2)}
            onUploadTest={handleUploadTest}
          />
        </Grid>
      </Grid>

      {/* Profile Summary (Legacy view, still useful for deep details) */}
      <PatientProfileSummary patientProfile={profile} />

      {/* SL Opportunity Banner (if detected) */}
      {slResult?.synthetic_lethality_detected && (
        <Box mb={3}>
          <SLOpportunityBanner
            slDetected={slResult.synthetic_lethality_detected}
            suggestedTherapy={slResult.suggested_therapy}
            doubleHitDescription={slResult.double_hit_description}
            confidence={slResult.recommended_drugs?.[0]?.confidence}
            onViewDetails={() => setActiveTab(6)} // Updated index
          />
        </Box>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label={`Trials (${trials.length})`} />
          <Tab label="Treatment" />
          <Tab label="Monitoring" />
          <Tab label="Resistance" />
          <Tab label="My Journey" /> {/* New Tab */}
          <Tab label={`Synthetic Lethality${slResult?.synthetic_lethality_detected ? ' ⚡' : ''}`} />
        </Tabs>
      </Paper>

      {/* Resistance Alert Banner (always visible if triggered) */}
      {resistanceAlert && resistanceAlert.alert_triggered && (
        <Box mb={3}>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Resistance Alert:</strong> {resistanceAlert.message}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Tab Content - Using Modular Components */}
      {activeTab === 0 && (
        <React.Fragment>
          <OverviewTab
            profile={profile}
            socRecommendation={socRecommendation}
            nextTestRecommender={nextTestRecommender}
            hintTiles={hintTiles}
            mechanismMap={mechanismMap}
            saeFeatures={saeFeatures}
            slResult={slResult}
            onViewTrials={() => setActiveTab(1)}
          />
          {/* NEW: Immunotherapy Safest Option (RUO) */}
          {ioSelection && (
            <Box mt={3}>
              <IOSafestSelectionCard ioSelection={ioSelection} />
            </Box>
          )}
        </React.Fragment>
      )}

      {activeTab === 1 && (
        <TrialsTab
          trials={trials}
          loading={loading}
          error={error}
          profile={profile}
          onRetry={refresh}
        />
      )}

      {activeTab === 2 && (
        <TreatmentTab
          profile={profile}
          socRecommendation={socRecommendation}
          wiwfm={wiwfm}
          foodValidation={foodValidation}
          timingFeatures={timingFeatures}
          timingLoading={timingLoading}
          timingError={timingError}
          computeTimingFeatures={computeTimingFeatures}
        />
      )}

      {activeTab === 3 && (
        <MonitoringTab
          profile={profile}
          ca125Intelligence={ca125Intelligence}
          nextTestRecommender={nextTestRecommender}
          onCA125Update={(newValue) => {
            console.log('[Ayesha] New CA-125:', newValue);
            // TODO: update state / trigger refetch when persistence exists
          }}
        />
      )}

      {activeTab === 4 && (
        <ResistanceTab
          resistanceAlert={resistanceAlert}
          resistancePlaybook={resistancePlaybook}
          resistancePrediction={resistancePrediction}
          saeFeatures={saeFeatures}
        />
      )}

      {activeTab === 5 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Patient Journey Timeline
          </Typography>
          <PatientJourneyEnhanced patientProfile={profile} />
        </Paper>
      )}

      {activeTab === 6 && (
        <SyntheticLethalityTab
          slResult={slResult}
          slLoading={slLoading}
          slError={slError}
          onShowTrials={() => setActiveTab(1)}
        />
      )}

      {/* Provenance Bar */}
      {provenance && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Run ID:</strong> {provenance.run_id} •
            <strong> Components:</strong> {provenance.endpoints_called?.join(', ')} •
            <strong> NGS Status:</strong> {provenance.ngs_status}
          </Typography>
        </Paper>
      )}

      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="caption">
          <strong>Research Use Only (RUO):</strong> This tool is for research purposes only.
          All trial recommendations should be reviewed by a qualified oncologist before making treatment decisions.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AyeshaTrialExplorer;

