/**
 * useHolisticClinicalBenefit Hook
 *
 * React hook for fetching Holistic Clinical Benefit Score from backend API.
 *
 * Purpose: Compute unified D/P/M/T/S score for patient-regimen pairs
 * API Endpoint: POST /api/resistance/holistic-clinical-benefit
 *
 * Returns: { data, isLoading, error, refetch }
 */
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_ROOT } from '../lib/apiConfig';


export const useHolisticClinicalBenefit = ({
  patientId,
  regimenId,
  useCase, // "trial_enrollment" | "next_line" | "monitoring"
  ddrFeatures = null,
  timingFeatures = null,
  kineticFeatures = null,
  safetyFeatures = null,
  clinicalFeatures = null,
  csiOutputs = null,
  patientProfile = null,
  regimen = null,
  config = null,
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      'holistic_clinical_benefit',
      patientId,
      regimenId,
      useCase,
      ddrFeatures,
      timingFeatures,
      kineticFeatures,
      safetyFeatures,
      clinicalFeatures,
      csiOutputs,
      patientProfile,
      regimen,
      config,
    ],
    queryFn: async () => {
      // Basic input validation
      if (!patientId || !regimenId || !useCase) {
        throw new Error('patientId, regimenId, and useCase are required.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

      try {
        const response = await fetch(`${API_ROOT}/api/resistance/holistic-clinical-benefit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: patientId,
            regimen_id: regimenId,
            use_case: useCase,
            ddr_features: ddrFeatures,
            timing_features: timingFeatures,
            kinetic_features: kineticFeatures,
            safety_features: safetyFeatures,
            clinical_features: clinicalFeatures,
            csi_outputs: csiOutputs,
            patient_profile: patientProfile,
            regimen: regimen,
            config: config,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: response.statusText }));
          throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Holistic score API request timed out after 60 seconds.');
        }
        throw error;
      }
    },
    enabled: enabled && !!patientId && !!regimenId && !!useCase,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Retry once on failure
  });
};
