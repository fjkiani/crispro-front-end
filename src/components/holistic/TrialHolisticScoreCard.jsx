/**
 * TrialHolisticScoreCard Component
 *
 * Wrapper component that fetches and displays Holistic Clinical Benefit Score for a trial.
 * Integrates with useHolisticClinicalBenefit hook.
 *
 * Props:
 * - trial: Trial object with nct_id, interventions, etc.
 * - patientId: Patient ID (optional, defaults to Ayesha profile)
 * - patientProfile: Patient profile object (optional)
 * - useCase: "trial_enrollment" | "next_line" | "monitoring" (default: "trial_enrollment")
 * - showDetails: boolean (default: true)
 */
import React from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useHolisticClinicalBenefit } from '../../hooks/useHolisticClinicalBenefit';
import HolisticClinicalBenefitCard from './HolisticClinicalBenefitCard';
import { AYESHA_11_17_25_PROFILE } from '../../constants/patients/ayesha_11_17_25';

export default function TrialHolisticScoreCard({
  trial,
  patientId = null,
  patientProfile = null,
  useCase = 'trial_enrollment',
  showDetails = true,
}) {
  // Extract trial information
  const regimenId = trial?.nct_id || trial?.regimen_id || `trial_${trial?.id || 'unknown'}`;
  const actualPatientId = patientId || AYESHA_11_17_25_PROFILE.patient?.patient_id || 'ayesha_11_17_25';
  const actualPatientProfile = patientProfile || AYESHA_11_17_25_PROFILE;

  // Extract regimen information from trial
  const regimen = {
    drugs: trial?.interventions || [],
    regimen_type: trial?.phase || 'unknown',
  };

  // Extract clinical features from patient profile
  const clinicalFeatures = {
    disease_site: actualPatientProfile?.disease?.primary_site || 'ovary',
    tumor_subtype: actualPatientProfile?.disease?.histology || null,
    stage: actualPatientProfile?.disease?.stage || null,
    performance_status: actualPatientProfile?.clinical?.ecog_ps || null,
  };

  // Fetch holistic score
  const {
    data: holisticScore,
    isLoading,
    error,
  } = useHolisticClinicalBenefit({
    patientId: actualPatientId,
    regimenId,
    useCase,
    patientProfile: actualPatientProfile,
    regimen,
    clinicalFeatures,
    enabled: !!trial && !!regimenId,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <CircularProgress size={20} />
        <Alert severity="info" sx={{ flex: 1 }}>
          Computing holistic clinical benefit score...
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <strong>Holistic Score Unavailable:</strong> {error.message || 'Could not compute holistic clinical benefit score for this trial.'}
      </Alert>
    );
  }

  if (!holisticScore) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <HolisticClinicalBenefitCard
        holisticScore={holisticScore}
        useCase={useCase}
        showDetails={showDetails}
        showWeights={false}
        showCaveats={true}
      />
    </Box>
  );
}
