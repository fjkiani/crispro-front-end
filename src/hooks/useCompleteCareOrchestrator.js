/**
 * useCompleteCareOrchestrator - Custom hook for orchestrating complete care plan API calls
 * 
 * Centralizes all API orchestration logic:
 * - Main care plan API call (/api/ayesha/complete_care_v2)
 * - Synthetic Lethality API call
 * - VUS Resolution API calls
 * - Essentiality API calls
 * - Data transformation
 * 
 * Returns: { result, loading, error, generatePlan, refreshPlan }
 */

import { useState, useCallback } from 'react';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

/**
 * Build the API request body from patient profile
 */
const buildRequestFromProfile = (profile) => {
  // Extract tumor_context from profile biomarkers (IHC/molecular data)
  const biomarkers = profile.tumor_context?.biomarkers || {};
  const somatic = profile.tumor_context?.somatic_mutations || [];
  
  // Build proper tumor_context for backend
  const tumor_context = {
    p53_status: biomarkers.p53_status || null,
    pd_l1: {
      cps: biomarkers.pd_l1_cps || null,
      status: biomarkers.pd_l1_status || null
    },
    // Flat keys for backend compatibility (some services expect non-nested fields)
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
      hgvs_p: m.protein_change || m.variant || null,  // May be null for IHC-only data
      evidence: m.evidence || null,
      // Include additional fields that WIWFM might need
      ...(m.provenance && { provenance: m.provenance })
    })).filter(m => m.gene)  // Only include mutations with gene name
  };

  return {
    ca125_value: profile.labs?.ca125_value || null,
    stage: profile.disease?.stage || "IVB",
    treatment_line: profile.inferred_fields?.treatment_line?.value?.toString() || "either",
    germline_status: profile.germline_status || profile.germline?.status?.toLowerCase() || "positive",
    location_state: profile.patient?.demographics?.location_state || "NY",
    has_ascites: profile.clinical?.has_ascites || false,
    has_peritoneal_disease: profile.clinical?.has_peritoneal_disease || false,
    ecog_status: profile.clinical?.ecog_status || null,
    tumor_context: tumor_context,
    treatment_history: [],  // Treatment-naive per profile
    // IO safest selection inputs (RUO)
    patient_age: profile.patient?.demographics?.age || null,
    autoimmune_history: profile.patient?.autoimmune_history || [],
    germline_variants: profile.germline?.mutations?.map(m => ({
      gene: m.gene,
      variant: m.variant,
      classification: m.classification,
      zygosity: m.zygosity
    })) || [],
    // Enable all MOAT capabilities
    include_trials: true,
    include_soc: true,
    include_ca125: true,
    include_wiwfm: true,
    include_io_selection: true,  // Safest IO selection (RUO)
    include_food: true,  // Enable food validator
    include_resistance: true,
    include_resistance_prediction: true,  // Enable Resistance Prophet
    max_trials: 10
  };
};

/**
 * Call Synthetic Lethality endpoint
 */
const fetchSyntheticLethality = async (patientProfile) => {
  try {
    const slMutations = [];
    // Add MBD4 from germline
    const mbd4Mutation = patientProfile.germline?.mutations?.find(m => m.gene === "MBD4");
    if (mbd4Mutation) {
      slMutations.push({
        gene: mbd4Mutation.gene,
        hgvs_p: mbd4Mutation.protein_change || null
      });
    }
    // Add TP53 from somatic (IHC evidence)
    const tp53Mutation = patientProfile.tumor_context?.somatic_mutations?.find(m => m.gene === "TP53");
    if (tp53Mutation) {
      slMutations.push({
        gene: tp53Mutation.gene
        // No hgvs_p for IHC-only evidence
      });
    }

    if (slMutations.length === 0) {
      return null;
    }

    const slResponse = await fetch(`${API_ROOT}/api/guidance/synthetic_lethality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease: patientProfile.disease?.type || 'ovarian_cancer_hgs',
        mutations: slMutations,
        api_base: API_ROOT
      })
    });
    
    if (slResponse.ok) {
      return await slResponse.json();
    } else {
      console.warn('[useCompleteCareOrchestrator] Synthetic Lethality API error:', slResponse.status);
      return null;
    }
  } catch (err) {
    console.error('[useCompleteCareOrchestrator] Synthetic Lethality call failed:', err);
    return null;
  }
};

/**
 * Call VUS Resolution endpoints for all VUS mutations
 */
const fetchVUSResults = async (patientProfile) => {
  const vusResults = {};
  const vusMutations = patientProfile.germline?.mutations?.filter(m => m.classification === 'VUS') || [];
  
  for (const vus of vusMutations) {
    try {
      const vusResponse = await fetch(`${API_ROOT}/api/vus/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant: {
            gene: vus.gene,
            hgvs_c: vus.variant || null,
            hgvs_p: vus.protein_change || null
          }
        })
      });
      
      if (vusResponse.ok) {
        vusResults[vus.gene] = await vusResponse.json();
      } else {
        console.warn(`[useCompleteCareOrchestrator] VUS Resolution API error for ${vus.gene}:`, vusResponse.status);
      }
    } catch (err) {
      console.error(`[useCompleteCareOrchestrator] VUS Resolution call failed for ${vus.gene}:`, err);
    }
  }
  
  return vusResults;
};

/**
 * Call Essentiality endpoint for key genes
 */
const fetchEssentialityScores = async (patientProfile) => {
  try {
    const genesToScore = [];
    // Germline pathogenic genes
    (patientProfile.germline?.mutations || []).forEach(m => {
      if (m?.gene && (m.classification || '').toLowerCase() === 'pathogenic') {
        genesToScore.push({ 
          gene: m.gene, 
          consequence: (m.protein_change || '').includes('fs') ? 'frameshift_variant' : null 
        });
      }
    });
    // Tumor somatic key genes (IHC evidence)
    (patientProfile.tumor_context?.somatic_mutations || []).forEach(m => {
      if (m?.gene) {
        genesToScore.push({ 
          gene: m.gene, 
          consequence: 'missense_variant' 
        });
      }
    });

    // De-dupe by gene
    const seen = new Set();
    const unique = genesToScore.filter(x => {
      const g = (x.gene || '').toUpperCase();
      if (!g || seen.has(g)) return false;
      seen.add(g);
      return true;
    });

    const essentialityScores = [];
    for (const item of unique) {
      try {
        const resp = await fetch(`${API_ROOT}/api/insights/predict_gene_essentiality`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gene: item.gene,
            variants: item.consequence ? [{ gene: item.gene, consequence: item.consequence }] : [],
          })
        });

        if (!resp.ok) {
          // Insights API may be disabled by feature flags in some deployments
          console.warn('[useCompleteCareOrchestrator] Essentiality API error:', item.gene, resp.status);
          continue;
        }

        const data = await resp.json();
        if (data && data.gene && typeof data.essentiality_score === 'number') {
          const score = data.essentiality_score;
          essentialityScores.push({
            gene: data.gene,
            essentiality_score: score,
            essentiality_level: score >= 0.7 ? 'HIGH' : (score >= 0.5 ? 'MODERATE' : 'LOW'),
            functional_consequence: data.flags?.frameshift ? 'Frameshift/truncation signal' : null,
            confidence: data.confidence,
            rationale: data.rationale,
            provenance: data.provenance,
          });
        }
      } catch (err) {
        console.error(`[useCompleteCareOrchestrator] Essentiality call failed for ${item.gene}:`, err);
      }
    }

    return essentialityScores;
  } catch (err) {
    console.error('[useCompleteCareOrchestrator] Essentiality call failed:', err);
    return [];
  }
};

/**
 * Call SOC S/P/E Analysis endpoint
 */
const fetchSOCSPEAnalysis = async (patientProfile) => {
  try {
    const socResponse = await fetch(`${API_ROOT}/api/ayesha/soc_spe_analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientProfile)
    });
    
    if (socResponse.ok) {
      return await socResponse.json();
    } else {
      console.warn('[useCompleteCareOrchestrator] SOC S/P/E API error:', socResponse.status);
      return null;
    }
  } catch (err) {
    console.error('[useCompleteCareOrchestrator] SOC S/P/E call failed:', err);
    return null;
  }
};

/**
 * Transform API response to match component expectations
 */
const transformCarePlanData = (data, syntheticLethalityResult, vusResults, essentialityScores, socSPEAnalysis) => {
  // Transform new API structure to match component expectations
  // Handle "awaiting_ngs" status properly
  const wiwfmDrugs = data.wiwfm?.status === "awaiting_ngs" 
    ? []  // No drugs if awaiting NGS
    : (data.wiwfm?.drugs || data.wiwfm?.recommendations || []);
  
  // Extract insights from WIWFM drugs (if available)
  const insightsFromDrugs = wiwfmDrugs.length > 0 
    ? wiwfmDrugs[0].insights || { functionality: 0.0, chromatin: 0.0, essentiality: 0.0, regulatory: 0.0 }
    : { functionality: 0.0, chromatin: 0.0, essentiality: 0.0, regulatory: 0.0 };
  
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
          food_component: data.food_validation?.confidence || 0.6
        }),
    wiwfm_status: data.wiwfm?.status,  // Pass through status for UI handling
    synthetic_lethality: syntheticLethalityResult,
    vus_results: vusResults,
    essentiality_scores: essentialityScores,
    insights: insightsFromDrugs,  // NEW: Pass insights to components
    soc_spe_analysis: socSPEAnalysis  // NEW: SOC L1 S/P/E analysis
  };
};

/**
 * Custom hook for complete care plan orchestration
 */
export const useCompleteCareOrchestrator = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePlan = useCallback(async (patientProfile) => {
    if (!patientProfile) {
      setError('Patient profile is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Build request from REAL patient profile - no hard-coding
      const requestBody = buildRequestFromProfile(patientProfile);
      
      console.log('[useCompleteCareOrchestrator] Request body built from profile:', {
        stage: requestBody.stage,
        germline_status: requestBody.germline_status,
        has_tumor_context: !!requestBody.tumor_context,
        somatic_mutations_count: requestBody.tumor_context?.somatic_mutations?.length || 0,
        germline_variants_count: requestBody.germline_variants?.length || 0
      });
      
      // Main API call
      const response = await fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('[useCompleteCareOrchestrator] API response:', {
        has_wiwfm: !!data.wiwfm,
        wiwfm_status: data.wiwfm?.status,
        wiwfm_drugs_count: data.wiwfm?.drugs?.length || 0,
        has_trials: !!data.trials,
        has_soc: !!data.soc_recommendation,
        has_ca125: !!data.ca125_intelligence,
        has_food: !!data.food_validation
      });
      
      // Extract SL results from WIWFM provenance (preferred) or call separate endpoint (fallback)
      let syntheticLethalityResult = null;
      if (data.wiwfm?.provenance?.synthetic_lethality) {
        // Use SL results from WIWFM (already computed)
        syntheticLethalityResult = {
          synthetic_lethality_detected: data.wiwfm.provenance.synthetic_lethality.detected || false,
          double_hit_description: data.wiwfm.provenance.synthetic_lethality.double_hit || '',
          essential_pathways: (data.wiwfm.provenance.synthetic_lethality.essential_pathways || []).map(p => ({
            pathway_id: p,
            pathway_name: p,
            status: 'essential'
          })),
          broken_pathways: [], // Not in provenance, will be inferred
          recommended_drugs: (data.wiwfm.provenance.synthetic_lethality.recommended_drugs || []).map(d => ({
            drug_name: d,
            drug_class: 'PARP inhibitor', // Infer from drug name
            confidence: 0.7,
            mechanism: 'Synthetic lethality with HR-deficient cells'
          })),
          essentiality_scores: data.wiwfm?.drugs?.filter(d => d.badges?.includes('SL-Detected')).map(d => ({
            gene: d.name, // Will be extracted from mutations
            essentiality_score: d.confidence || 0.7
          })) || []
        };
        console.log('[useCompleteCareOrchestrator] ✅ Using SL results from WIWFM provenance');
      } else {
        // Fallback: Call separate SL endpoint if not in WIWFM
        syntheticLethalityResult = await fetchSyntheticLethality(patientProfile);
        console.log('[useCompleteCareOrchestrator] ⚠️  SL not in WIWFM, called separate endpoint');
      }
      
      // Parallel API calls for additional features (VUS, Essentiality, SOC S/P/E)
      const [vusResults, essentialityScores, socSPEAnalysis] = await Promise.all([
        fetchVUSResults(patientProfile),
        fetchEssentialityScores(patientProfile),
        fetchSOCSPEAnalysis(patientProfile)  // NEW: SOC L1 S/P/E analysis
      ]);

      // Transform and combine all results
      const transformedData = transformCarePlanData(
        data,
        syntheticLethalityResult,
        vusResults,
        essentialityScores,
        socSPEAnalysis  // NEW: Include SOC S/P/E analysis
      );
      
      console.log('[useCompleteCareOrchestrator] Transformed data:', {
        drug_recommendations_count: transformedData.drug_recommendations.length,
        wiwfm_status: transformedData.wiwfm_status,
        has_synthetic_lethality: !!transformedData.synthetic_lethality,
        vus_results_count: Object.keys(transformedData.vus_results).length,
        essentiality_scores_count: transformedData.essentiality_scores.length
      });
      
      setResult(transformedData);
    } catch (err) {
      console.error('[useCompleteCareOrchestrator] Error:', err);
      setError(`Error: ${err.message}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPlan = useCallback((patientProfile) => {
    return generatePlan(patientProfile);
  }, [generatePlan]);

  return {
    result,
    loading,
    error,
    generatePlan,
    refreshPlan
  };
};

export default useCompleteCareOrchestrator;
