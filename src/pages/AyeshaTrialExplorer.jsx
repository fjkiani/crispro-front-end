/**
 * Ayesha Trial Explorer Page (Refactored Orchestrator)
 * 
 * Precision trial matching for Stage IVB ovarian cancer.
 * Orchestrates data fetching via useAyeshaCarePlan and renders lazy-loaded tabs.
 * 
 * @architect Zo (Antigravity Agent)
 * @date 2026-01-28
 */
import React, { useState, Suspense, lazy } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper, Tabs, Tab, Chip } from '@mui/material';
import ResistanceAlertBanner from '../components/ayesha/ResistanceAlertBanner';
import SLOpportunityBanner from '../components/ayesha/SLOpportunityBanner';
import { useAyeshaCarePlan } from '../hooks/useAyeshaCarePlan';
import { AYESHA_11_17_25_PROFILE } from '../constants/patients/ayesha_11_17_25';

// Lazy Load Tabs
const OverviewTab = lazy(() => import('../components/ayesha/tabs/OverviewTab'));
const TrialsTab = lazy(() => import('../components/ayesha/tabs/TrialsTab'));
const TreatmentTab = lazy(() => import('../components/ayesha/tabs/TreatmentTab'));
const MonitoringTab = lazy(() => import('../components/ayesha/tabs/MonitoringTab'));
const ResistanceTab = lazy(() => import('../components/ayesha/tabs/ResistanceTab'));
const SyntheticLethalityTab = lazy(() => import('../components/ayesha/tabs/SyntheticLethalityTab'));

const AyeshaTrialExplorer = () => {
  // UI State
  const [activeTab, setActiveTab] = useState(0);

  // Data Layer (The Central Nervous System)
  const {
    trials,
    ca125Intelligence,
    socRecommendation,
    nextTestRecommender,
    hintTiles,
    mechanismMap,
    resistanceAlert,
    resistancePlaybook,
    resistancePrediction,
    saeFeatures,
    wiwfm,
    foodValidation,
    provenance,
    summary,
    opportunityScore,
    isLoading,
    error,
    // Sub-hooks
    slResult, slLoading, slError,
    timingFeatures, timingLoading, timingError
  } = useAyeshaCarePlan(AYESHA_11_17_25_PROFILE);

  // Profile Shortcut (for header rendering)
  const profile = AYESHA_11_17_25_PROFILE;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading Ayesha's Care Plan...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load care plan: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header with Opportunity Score */}
      <Box mb={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {profile.patient?.display_name || 'Ayesha'}'s Complete Care Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stage {profile.disease?.stage || 'IVB'} {profile.disease?.histology?.replace(/_/g, ' ') || 'High-Grade Serous Carcinoma'} •
            {profile.tumor_context?.biomarkers?.pd_l1_status === 'POSITIVE'
              ? ` PD-L1+ (CPS ${profile.tumor_context.biomarkers.pd_l1_cps || 'N/A'})`
              : ' PD-L1-'} •
            {profile.tumor_context?.biomarkers?.p53_status === 'MUTANT_TYPE' ? ' p53 mutant type' : ''}
          </Typography>
        </Box>
        <Paper sx={{ p: 2, bgcolor: opportunityScore >= 70 ? 'success.light' : opportunityScore >= 40 ? 'warning.light' : 'error.light' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            {opportunityScore}%
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
            Opportunity Score
          </Typography>
        </Paper>
      </Box>

      {/* Profile Summary Chips */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Patient Profile ({profile.meta?.last_updated?.split('-').slice(1).join('/') || 'Current'})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip label={`Stage ${profile.disease?.stage || 'IVB'}`} color="error" size="small" />
          <Chip
            label={profile.labs?.ca125_value
              ? `CA-125: ${profile.labs.ca125_value.toLocaleString()} U/mL`
              : "CA-125: not provided"}
            color={profile.labs?.ca125_value ? "success" : "warning"}
            size="small"
          />
          <Chip
            label={`Germline: ${profile.germline_status === 'positive' ? 'Positive (MBD4)' : 'Negative'}`}
            color={profile.germline_status === 'positive' ? 'error' : 'default'}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          <strong>Components Loaded:</strong> {summary?.components_included?.join(', ') || 'Standard Suite'}
        </Typography>
      </Paper>

      {/* SYSTEM OVERRIDE: Resistance Alert (Always Visible) */}
      {resistanceAlert && resistanceAlert.alert_triggered && (
        <Box mb={3}>
          <ResistanceAlertBanner resistance_alert={resistanceAlert} />
        </Box>
      )}

      {/* SYSTEM OVERRIDE: SL Opportunity Banner */}
      <SLOpportunityBanner
        slDetected={slResult?.synthetic_lethality_detected}
        suggestedTherapy={slResult?.suggested_therapy}
        doubleHitDescription={slResult?.double_hit_description}
        confidence={slResult?.recommended_drugs?.[0]?.confidence}
        onViewDetails={() => setActiveTab(5)}
      />

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label={`Overview`} />
          <Tab label={`Trials (${trials.length})`} />
          <Tab label="Treatment" />
          <Tab label="Monitoring" />
          <Tab label="Resistance" />
          <Tab label={`Synthetic Lethality${slResult?.synthetic_lethality_detected ? ' ⚡' : ''}`} />
        </Tabs>
      </Paper>

      {/* Lazy Loaded Tab Content */}
      <Suspense fallback={
        <Box py={10} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      }>
        {activeTab === 0 && (
          <OverviewTab
            profile={profile}
            slResult={slResult}
            socRecommendation={socRecommendation}
            nextTestRecommender={nextTestRecommender}
            hintTiles={hintTiles}
            mechanismMap={mechanismMap}
            saeFeatures={saeFeatures}
          />
        )}
        {activeTab === 1 && (
          <TrialsTab
            trials={trials}
            patientName={profile.patient?.display_name}
          />
        )}
        {activeTab === 2 && (
          <TreatmentTab
            socRecommendation={socRecommendation}
            wiwfm={wiwfm}
            foodValidation={foodValidation}
            timingFeatures={timingFeatures}
            timingLoading={timingLoading}
            timingError={timingError}
            treatmentHistory={profile.treatment_history}
          />
        )}
        {activeTab === 3 && (
          <MonitoringTab
            ca125Intelligence={ca125Intelligence}
            nextTestRecommender={nextTestRecommender}
            ca125Value={profile.labs?.ca125_value}
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
          <SyntheticLethalityTab
            slResult={slResult}
            slLoading={slLoading}
            slError={slError}
          />
        )}
      </Suspense>

      {/* Provenance Footer */}
      {provenance && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Run ID:</strong> {provenance.run_id} •
            <strong> Components:</strong> {provenance.endpoints_called?.join(', ')} •
            <strong> NGS Source:</strong> {provenance.ngs_status}
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
