import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Import components
import DrugRankingPanel from '../../components/ayesha/DrugRankingPanel';
import FoodRankingPanel from '../../components/ayesha/FoodRankingPanel';
import IntegratedConfidenceBar from '../../components/ayesha/IntegratedConfidenceBar';
import SOCRecommendationCard from '../../components/ayesha/SOCRecommendationCard';
import SOCSPEAnalysisCard from '../../components/ayesha/SOCSPEAnalysisCard';
import NextTestCard from '../../components/ayesha/NextTestCard';
import HintTilesPanel from '../../components/ayesha/HintTilesPanel';
import MechanismChips from '../../components/ayesha/MechanismChips';
import CA125Tracker from '../../components/ayesha/CA125Tracker';
import ResistancePlaybook from '../../components/ayesha/ResistancePlaybook';
import ResistanceProphetCard from '../../components/ayesha/ResistanceProphetCard';
import { TrialMatchesCard } from '../../components/orchestrator/Analysis/TrialMatchesCard';
// Sprint 2.5: Wire validated SAE components for resistance monitoring
import AyeshaSAEFeaturesCard from '../../components/ayesha/AyeshaSAEFeaturesCard';
import ResistanceAlertBanner from '../../components/ayesha/ResistanceAlertBanner';
import ProvenancePanel from '../../components/food/ProvenancePanel';
import { CompleteCareLoadingSkeleton } from '../../components/LoadingSkeleton';
// PLUMBER 8: Import SyntheticLethalityCard
import { SyntheticLethalityCard } from '../../components/orchestrator/Analysis';
// Phase 3: Import new components
import EssentialityScoreDisplay from '../../components/ayesha/EssentialityScoreDisplay';
import IOSafestSelectionCard from '../../components/ayesha/IOSafestSelectionCard';
// Phase 3: Import modularized UI components
import PatientProfileSummary from '../../components/ayesha/PatientProfileSummary';
import CarePlanActionButtons from '../../components/ayesha/CarePlanActionButtons';
import GermlinePathogenicAlert from '../../components/ayesha/GermlinePathogenicAlert';
import AwaitingNGSAlert from '../../components/ayesha/AwaitingNGSAlert';
import PartialResultsAlert from '../../components/ayesha/PartialResultsAlert';
import Genomics101Explanations from '../../components/ayesha/Genomics101Explanations';
import CarePlanSummaryStats from '../../components/ayesha/CarePlanSummaryStats';
import VUSResolutionSection from '../../components/ayesha/VUSResolutionSection';
import TrialsEmptyState from '../../components/ayesha/TrialsEmptyState';

// Import REAL patient profile - single source of truth
import { AYESHA_11_17_25_PROFILE } from '../../constants/patients';

// Import custom hook for API orchestration
import { useCompleteCareOrchestrator } from '../../hooks/useCompleteCareOrchestrator';

// Import utility functions
import { buildProvenance } from '../../utils/carePlan/buildProvenance';
import { exportCarePlanJSON } from '../../utils/export/exportCarePlanJSON';
import { exportClinicalDossier } from '../../utils/export/exportClinicalDossier';

/**
 * AyeshaCompleteCare - Unified page for complete care plan (drugs + foods)
 * 
 * Shows side-by-side drug efficacy and food/supplement recommendations
 * orchestrated by unified backend endpoint.
 * 
 * Uses AYESHA_11_17_25_PROFILE as single source of truth for patient data.
 * 
 * REFACTORED: Uses useCompleteCareOrchestrator hook for API orchestration
 */
export default function AyeshaCompleteCare() {
  // Use real patient profile - no hard-coding
  const [patientProfile] = useState(AYESHA_11_17_25_PROFILE);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);

  // Use custom hook for API orchestration
  const { result, loading, error, generatePlan } = useCompleteCareOrchestrator();

  // Handle generate plan - delegate to hook
  const handleGeneratePlan = useCallback(() => {
    generatePlan(patientProfile);
  }, [generatePlan, patientProfile]);

  // Load default results on mount
  useEffect(() => {
    handleGeneratePlan();
  }, [handleGeneratePlan]);

  // Export handlers using utility functions
  const handleExportJSON = useCallback(() => {
    exportCarePlanJSON(result);
  }, [result]);

  const handleExportClinicalDossier = useCallback(() => {
    exportClinicalDossier(result, patientProfile, buildProvenance);
  }, [result, patientProfile]);

  const handleShare = () => {
    // Future: Share functionality (email, link, etc.)
    alert('Share functionality coming soon!');
  };

  // Build unified provenance using utility function
  const buildUnifiedProvenance = useCallback(() => {
    return buildProvenance(result, patientProfile);
  }, [result, patientProfile]);

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospitalIcon color="primary" fontSize="large" />
          Ayesha Complete Care - Integrated Drug + Food Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Comprehensive care planning combining drug efficacy predictions and supportive food/supplement recommendations
          for personalized, holistic treatment guidance.
        </Typography>
        <Alert severity="info" icon={<LocalHospitalIcon />} sx={{ mb: 2 }}>
          <strong>Research Use Only</strong> - This integrated analysis supports, not replaces, clinical judgment.
          Always consult oncologist before making treatment decisions.
        </Alert>
      </Box>

      {/* Patient Profile Summary */}
      <PatientProfileSummary patientProfile={patientProfile} />

      {/* Action Buttons */}
      <CarePlanActionButtons
        loading={loading}
        result={result}
        onGenerate={handleGeneratePlan}
        onExportJSON={handleExportJSON}
        onExportDossier={handleExportClinicalDossier}
        onShare={handleShare}
        onViewProvenance={() => setProvenanceModalOpen(true)}
      />

      {/* Loading */}
      {loading && <CompleteCareLoadingSkeleton />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Alert Stack - Consolidated Clinical Signals */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <GermlinePathogenicAlert patientProfile={patientProfile} />
        <AwaitingNGSAlert result={result} />
        <PartialResultsAlert result={result} />
        {/* Sprint 2.5: Resistance Alert Banner - 2-of-3 Triggers (Validated) */}
        {result?.resistance_alert && (
          <ResistanceAlertBanner resistance_alert={result.resistance_alert} />
        )}
      </Stack>

      {/* Results */}
      {result && (
        <Box>
          {/* Integrated Confidence Bar - Only show if not awaiting NGS */}
          {result.wiwfm_status !== "awaiting_ngs" && (result.integrated_confidence || result.summary?.confidence_level) && (
            <IntegratedConfidenceBar
              integratedConfidence={result.integrated_confidence || 0.7}
              confidenceBreakdown={result.confidence_breakdown || {
                drug_component: 0.7,
                food_component: 0.6,
                safety_component: 0.8
              }}
            />
          )}

          {/* Standard of Care Section (Clinical + Biological Validation) */}
          <Box sx={{ mb: 3 }}>
            {result.soc_recommendation && (
              <Box sx={{ mb: 2 }}>
                <SOCRecommendationCard {...result.soc_recommendation} />
              </Box>
            )}
            {/* SOC S/P/E Analysis - Uses same source */}
            {result.soc_recommendation && (
              <SOCSPEAnalysisCard socRecommendation={result.soc_recommendation} />
            )}
          </Box>

          {/* CA-125 Intelligence */}
          {result.ca125_intelligence && (
            <Box sx={{ mb: 3 }}>
              <CA125Tracker {...result.ca125_intelligence} />
            </Box>
          )}

          {/* Sprint 2.5: SAE Features Card - DDR_bin, DNA Repair Capacity, Pathway Burden (Validated) */}
          {result.sae_features && (
            <Box sx={{ mb: 3 }}>
              <AyeshaSAEFeaturesCard sae_features={result.sae_features} />
            </Box>
          )}

          {/* PLUMBER 8: Synthetic Lethality Analysis */}
          {result.synthetic_lethality && (
            <Box sx={{ mb: 3 }}>
              <SyntheticLethalityCard
                slResult={result.synthetic_lethality}
                loading={false}
              />
            </Box>
          )}

          {/* VUS Resolution Section */}
          <VUSResolutionSection
            vusResults={result.vus_results}
            patientProfile={patientProfile}
          />

          {/* Phase 3: Essentiality Score Display */}
          {((result.essentiality_scores && result.essentiality_scores.length > 0) || (result.synthetic_lethality?.essentiality_scores && result.synthetic_lethality.essentiality_scores.length > 0)) && (
            <Box sx={{ mb: 3 }}>
              <EssentialityScoreDisplay
                essentialityScores={(result.essentiality_scores && result.essentiality_scores.length > 0) ? result.essentiality_scores : result.synthetic_lethality.essentiality_scores}
                title="Gene Essentiality Analysis"
              />
            </Box>
          )}

          {/* Next Test Recommender + Hint Tiles */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              {result.next_test_recommender && (
                <NextTestCard recommendations={result.next_test_recommender.recommendations || []} />
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              {result.hint_tiles?.hint_tiles && result.hint_tiles.hint_tiles.length > 0 && (
                <HintTilesPanel tiles={result.hint_tiles.hint_tiles} />
              )}
            </Grid>
          </Grid>

          {/* Mechanism Map */}
          {result.mechanism_map && (
            <Box sx={{ mb: 3 }}>
              <MechanismChips mechanismMap={result.mechanism_map} />
            </Box>
          )}

          {/* IO Safest Selection (RUO) */}
          {result.io_selection && (
            <Box sx={{ mb: 3 }}>
              <IOSafestSelectionCard ioSelection={result.io_selection} />
            </Box>
          )}

          {/* Clinical Trials - Show even if empty */}
          {result.trials && (
            <Box sx={{ mb: 3 }}>
              {result.trials.trials && result.trials.trials.length > 0 ? (
                <TrialMatchesCard
                  trialMatches={result.trials.trials}
                  loading={false}
                />
              ) : (
                <TrialsEmptyState trials={result.trials} />
              )}
            </Box>
          )}

          {/* Drug + Food Panels Side-by-Side */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <DrugRankingPanel
                drugs={result.drug_recommendations || []}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FoodRankingPanel
                foods={result.food_recommendations || []}
              />
            </Grid>
          </Grid>

          {/* Resistance Prophet (V2) */}
          {result.resistance_prediction && (
            <Box sx={{ mb: 3 }}>
              <ResistanceProphetCard resistance_prediction={result.resistance_prediction} />
            </Box>
          )}

          {/* Resistance Playbook */}
          {result.resistance_playbook && (
            <Box sx={{ mb: 3 }}>
              <ResistancePlaybook resistance_playbook={result.resistance_playbook} />
            </Box>
          )}

          {/* Genomics 101 - Patient-Friendly Explanations */}
          <Box sx={{ mb: 3 }}>
            <Genomics101Explanations patientProfile={patientProfile} result={result} />
          </Box>

          {/* Summary Stats */}
          <CarePlanSummaryStats result={result} />
        </Box>
      )}

      {/* Provenance Modal */}
      <Dialog
        open={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Analysis Provenance</DialogTitle>
        <DialogContent>
          {result && buildUnifiedProvenance() && (
            <ProvenancePanel provenance={buildUnifiedProvenance()} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProvenanceModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

