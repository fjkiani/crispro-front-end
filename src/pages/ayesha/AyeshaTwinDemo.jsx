import React from 'react';
import { Box, Alert, CircularProgress, Typography, Grid, Card, CardContent } from '@mui/material';

// Custom hooks
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';
import { useAyeshaCareData } from '../../hooks/ayesha/useAyeshaCareData';

// Utility functions
import { transformToDigitalTwin } from '../../utils/ayesha/digitalTwinTransform';

// Ayesha clinical components (SOC / CA-125 / SAE Phase-1)
import { SOCRecommendationCard, CA125Tracker, NextTestCard, HintTilesPanel, MechanismChips } from '../../components/ayesha';
import EssentialityScoreDisplay from '../../components/ayesha/EssentialityScoreDisplay';

// Modular components
import {
  TwinDemoHeader,
  TwinDemoControls,
  PatientProfileCard,
  FoodRecommendationsCard,
  DrugRecommendationsCard,
  ProvenanceCard,
  DigitalTwinSection
} from '../../components/ayesha/twin';

/**
 * Ayesha Digital Twin - Real Patient Data
 * 
 * Shows Ayesha's actual Digital Twin using her real patient profile.
 * Uses /api/ayesha/complete_care_v2 endpoint with AYESHA_11_17_25_PROFILE.
 * 
 * Modularized for scalability:
 * - Hooks: API calls and state management
 * - Utils: Data transformation logic
 * - Components: Reusable UI sections
 */
export default function AyeshaTwinDemo() {
  const { profile, buildRequest } = useAyeshaProfile();

  // Load complete care data with all features enabled for Digital Twin
  const { result: careData, loading, error, refresh } = useAyeshaCareData({
    include_trials: true,
    include_wiwfm: true,  // Enable WIWFM for drug recommendations
    include_food: true,   // Enable food validation
    include_resistance: true,  // Enable resistance prediction
    include_resistance_prediction: true,
    include_soc: true,
    include_ca125: true,
    include_biomarker: true,
    max_trials: 200,
  });

  // Transform care data to Digital Twin format using REAL API data
  const digitalTwinData = careData ? transformToDigitalTwin({
    case_data: {
      patient_id: profile.patient?.patient_id || 'AK',
      disease: profile.disease,
      mutations: [
        ...(profile.germline?.mutations || []),
        ...(profile.tumor_context?.somatic_mutations || [])
      ],
      biomarkers: profile.tumor_context?.biomarkers || {},
    },
    food_recommendations: careData.food_validation?.recommendations || careData.food_recommendations || [],
    drug_recommendations: careData.wiwfm?.drugs || careData.wiwfm?.recommendations || [],
    mechanism_map: careData.mechanism_map || {},
    sae_features: careData.sae_features || {},
    synthetic_lethality: careData.synthetic_lethality || null,
    resistance_prediction: careData.resistance_prediction || null,
    analysis_summary: careData.summary || {},
    provenance: careData.provenance || {},
  }) : null;

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <TwinDemoHeader />

      {/* Controls - Refresh button */}
      <TwinDemoControls
        onRun={() => refresh && refresh()}
        loading={loading}
      />

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading Ayesha's Digital Twin analysis...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Failed to load Digital Twin:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* Results */}
      {careData && digitalTwinData && (
        <Box>
          {/* Patient Profile Card */}
          <PatientProfileCard caseData={{
            patient_id: profile.patient?.patient_id || 'AK',
            disease: profile.disease,
            mutations: [
              ...(profile.germline?.mutations || []),
              ...(profile.tumor_context?.somatic_mutations || [])
            ],
            biomarkers: profile.tumor_context?.biomarkers || {},
          }} />

          {/* 🧬 DIGITAL TWIN MOAT COMPONENTS */}
          <DigitalTwinSection digitalTwinData={digitalTwinData} />

          {/* 🧪 Gene Essentiality Analysis */}
          {((careData.essentiality_scores && careData.essentiality_scores.length > 0) || (careData.synthetic_lethality?.essentiality_scores && careData.synthetic_lethality.essentiality_scores.length > 0)) && (
            <Box sx={{ mb: 3 }}>
              <EssentialityScoreDisplay
                essentialityScores={(careData.essentiality_scores && careData.essentiality_scores.length > 0) ? careData.essentiality_scores : careData.synthetic_lethality.essentiality_scores}
                title="Gene Essentiality Analysis"
              />
            </Box>
          )}

          {/* High-signal clinical context for Ayesha (SOC + CA-125 + Next tests + Hints + Mechanism map) */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              {careData.soc_recommendation && (
                <Grid item xs={12} md={6}>
                  <SOCRecommendationCard {...careData.soc_recommendation} />
                </Grid>
              )}

              {careData.ca125_intelligence && (
                <Grid item xs={12} md={6}>
                  <CA125Tracker
                    current_value={careData.ca125_intelligence.current_value}
                    burden_class={careData.ca125_intelligence.burden_class}
                    forecast={careData.ca125_intelligence.forecast}
                    resistance_rule={careData.ca125_intelligence.resistance_rule}
                    monitoring_strategy={careData.ca125_intelligence.monitoring_strategy}
                  />
                </Grid>
              )}

              {careData.next_test_recommender?.recommendations && (
                <Grid item xs={12} md={6}>
                  <NextTestCard recommendations={careData.next_test_recommender.recommendations} />
                </Grid>
              )}

              {careData.hint_tiles?.tiles && (
                <Grid item xs={12} md={6}>
                  <HintTilesPanel tiles={careData.hint_tiles.tiles} />
                </Grid>
              )}

              {careData.mechanism_map && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Mechanism map (pre/post‑NGS)
                      </Typography>
                      <MechanismChips mechanism_map={careData.mechanism_map} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Research Use Only (RUO). Mechanism chips reflect model emphasis and available biomarkers—not medical advice.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Food Recommendations */}
          <FoodRecommendationsCard
            foodRecommendations={careData.food_recommendations || []}
            analysisSummary={careData.summary || {}}
          />

          {/* 💊 Therapy Fit Rankings */}
          <DrugRecommendationsCard
            drugRecommendations={careData.wiwfm || careData.drug_recommendations || []}
          />

          {/* Provenance */}
          <ProvenanceCard provenance={careData.provenance || {}} />
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && !careData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Click "Run Analysis" to generate your Digital Twin.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

