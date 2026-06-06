/**
 * AyeshaTwinDemo — Digital Twin page (/ayesha-digital-twin)
 *
 * Clean single-pass layout. One SL instance. No duplicate sections.
 *
 * Layout:
 *   Header → Controls → [loading/error] → PatientProfileCard
 *   → OpportunityPanel (SL + resistance gate + tests needed — ONE instance)
 *   → DrugRankingPanel
 *   → ProvenanceCard
 *
 * Removed: DigitalTwinSection (duplicated OpportunityPanel), EssentialityScoreDisplay,
 *   SOCRecommendationCard, CA125Tracker, MechanismInsightPanel, HintTilesPanel,
 *   MechanismChips, FoodRecommendationsCard — all legacy/duplicate.
 */
import React from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';

import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';
import { useAyeshaCareData } from '../../hooks/ayesha/useAyeshaCareData';

import DrugRankingPanel from '../../components/ayesha/DrugRankingPanel';
import OpportunityPanel from '../../components/ayesha/tumor-board/OpportunityPanel';

import {
  TwinDemoHeader,
  TwinDemoControls,
  PatientProfileCard,
  ProvenanceCard,
} from '../../components/ayesha/twin';

export default function AyeshaTwinDemo() {
  const { profile } = useAyeshaProfile();

  const { result: careData, loading, error, refresh } = useAyeshaCareData({
    include_trials: false,
    include_wiwfm: true,
    include_food: false,
    include_resistance: true,
    include_resistance_prediction: true,
    include_soc: false,
    include_ca125: false,
    include_biomarker: true,
    max_trials: 0,
  });

  const slPayload = careData?.synthetic_lethality || null;
  const resistanceGate = careData?.resistance_gate || careData?.resistance_prediction?.resistance_gate || null;
  const drugs = careData?.wiwfm?.drugs || careData?.wiwfm?.recommendations || careData?.drug_recommendations || [];
  const testsNeeded = careData?.tests_needed || [];

  const caseData = {
    patient_id: profile?.patient?.patient_id || 'AK',
    disease: profile?.disease,
    mutations: [
      ...(profile?.germline?.mutations || []),
      ...(profile?.tumor_context?.somatic_mutations || []),
    ],
    biomarkers: profile?.tumor_context?.biomarkers || {},
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <TwinDemoHeader />

      <TwinDemoControls
        onRun={() => refresh?.()}
        loading={loading}
      />

      {loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading digital twin analysis…
          </Typography>
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Analysis failed:</strong> {error}
        </Alert>
      )}

      {!loading && !error && !careData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Click "Run Demo Analysis" to generate the digital twin.
        </Alert>
      )}

      {careData && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <PatientProfileCard caseData={caseData} />

          {/* Single SL + resistance + tests instance */}
          <OpportunityPanel
            slPayload={slPayload}
            resistanceGate={resistanceGate}
            levelKey="L1"
            testsNeeded={testsNeeded}
            missing={[]}
          />

          {/* Drug rankings — only when data present */}
          {drugs.length > 0 && (
            <DrugRankingPanel
              drugs={drugs}
              context={{ level: 'L1', scenario: 'Digital Twin', provenance: careData.provenance }}
              title="Therapy Fit Rankings"
            />
          )}

          <ProvenanceCard provenance={careData.provenance || {}} />
        </Box>
      )}
    </Box>
  );
}
