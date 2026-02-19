/**
 * useCompleteCarePlan - Custom hook for fetching complete care plan data
 * 
 * Centralizes the logic for:
 * - Building request from patient profile
 * - Fetching from /api/ayesha/complete_care_v2
 * - Transforming API response to match component expectations
 * - Error handling and loading states
 */

import { useState, useCallback } from 'react';
import { API_ROOT } from '../lib/apiConfig';


/**
 * Build the API request body from patient profile
 */
const buildRequestFromProfile = (profile) => {
  const biomarkers = profile.tumor_context?.biomarkers || {};
  const somatic = profile.tumor_context?.somatic_mutations || [];
  
  const tumor_context = {
    p53_status: biomarkers.p53_status || null,
    pd_l1: {
      cps: biomarkers.pd_l1_cps || null,
      status: biomarkers.pd_l1_status || null
    },
    pd_l1_cps: biomarkers.pd_l1_cps || null,
    pd_l1_status: biomarkers.pd_l1_status || null,
    msi_status: biomarkers.msi_status || null,
    er_percent: biomarkers.er_percent || null,
    er_status: biomarkers.er_status || null,
    pr_status: biomarkers.pr_status || null,
    mmr_status: biomarkers.mmr_status || null,
    her2_status: biomarkers.her2_status || null,
    folr1_status: biomarkers.folr1_status || null,
    ntrk_status: biomarkers.ntrk_status || null,
    hrd_score: profile.tumor_context?.hrd_score || null,
    tmb: profile.tumor_context?.tmb || null,
    somatic_mutations: somatic.map(m => ({
      gene: m.gene,
      variant: m.variant || null,
      hgvs_p: m.protein_change || m.variant || null,
      evidence: m.evidence || null,
    })).filter(m => m.gene),
    completeness_score: profile.tumor_context?.completeness_score || null,
  };

  return {
    patient_age: profile.patient?.age || 40,
    stage: profile.disease?.stage || 'IVB',
    treatment_line: profile.treatment?.line || 'first-line',
    germline_status: profile.biomarkers?.germline_status || profile.germline_status || 'unknown',
    location_state: profile.demographics?.location || profile.demographics?.location_state || 'NY',
    has_ascites: profile.biomarkers?.ascites || profile.clinical?.has_ascites || false,
    has_peritoneal_disease: profile.biomarkers?.peritoneal_disease || profile.clinical?.has_peritoneal_disease || false,
    tumor_context: tumor_context,
    ca125_value: profile.biomarkers?.ca125 || profile.labs?.ca125_value || null,
    ecog_status: profile.clinical?.ecog_status || null,
    treatment_history: profile.treatment?.history || [],
    germline_variants: profile.germline?.mutations || profile.germline_variants || [],
    organ_risk_flags: profile.clinical?.organ_risk_flags || [],
    autoimmune_history: profile.clinical?.autoimmune_history || [],
    include_trials: true,
    include_soc: true,
    include_ca125: true,
    include_wiwfm: true,
    include_resistance: true,
    include_food: true,
    include_resistance_prediction: true,
    include_io_selection: true,
    max_trials: 10
  };
};

/**
 * Transform API response to match component expectations
 */
const transformApiResponse = (data) => {
  const wiwfmDrugs = data.wiwfm?.status === "awaiting_ngs" 
    ? []  // No drugs if awaiting NGS
    : (data.wiwfm?.drugs || data.wiwfm?.recommendations || []);
  
  return {
    ...data,
    drug_recommendations: wiwfmDrugs,
    food_recommendations: data.food_validation?.recommendations || data.food_recommendations || [],
    integrated_confidence: data.wiwfm?.status === "awaiting_ngs" 
      ? null 
      : (data.wiwfm?.confidence || data.integrated_confidence || 0.7),
    confidence_breakdown: data.wiwfm?.status === "awaiting_ngs"
      ? null
      : (data.wiwfm?.confidence_breakdown || data.confidence_breakdown || {
          drug_component: data.wiwfm?.confidence || 0.7,
          food_component: data.food_validation?.confidence || 0.6,
          safety_component: 0.8
        }),
    wiwfm_status: data.wiwfm?.status,  // Pass through status for UI handling
  };
};

/**
 * Custom hook for fetching complete care plan
 */
export const useCompleteCarePlan = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCarePlan = useCallback(async (patientProfile) => {
    if (!patientProfile) {
      setError('Patient profile is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody = buildRequestFromProfile(patientProfile);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      try {
        const response = await fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const transformedData = transformApiResponse(data);
        
        setResult(transformedData);
        setError(null);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 60 seconds');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Failed to generate care plan:', err);
      setError(err.message || 'Failed to generate care plan');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    result,
    loading,
    error,
    fetchCarePlan,
    setResult,
    setError
  };
};

export default useCompleteCarePlan;
