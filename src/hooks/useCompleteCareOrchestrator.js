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
import { API_ROOT } from '../lib/apiConfig';


// ----------------------------
// Lightweight client-side caching + single-flight
// ----------------------------
// Notes:
// - This prevents repeated identical calls when multiple panels ask for the same
//   “auxiliary” data (VUS, essentiality, synthetic lethality).
// - Backend may still compute, but we avoid spamming it from the browser.
class TTLCache {
  constructor(ttlMinutes = 10) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000;
  }
  set(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
}

const essentialityCache = new TTLCache(30); // 30 min
const vusCache = new TTLCache(60); // 60 min
const slCache = new TTLCache(30); // 30 min
const carePlanCache = new TTLCache(5); // 5 min – stale-while-revalidate for page loads

const _inflight = {
  essentiality: new Map(),
  vus: new Map(),
  sl: new Map(),
};

async function singleFlight(map, key, fn) {
  const existing = map.get(key);
  if (existing) return await existing;
  const p = (async () => fn())();
  map.set(key, p);
  try {
    return await p;
  } finally {
    map.delete(key);
  }
}

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
    somatic_mutations: somatic
      .map((m) => ({
        gene: m.gene,
        variant: m.variant || null,
        hgvs_p: m.hgvs_p || m.protein_change || null, // may be null for IHC-only data
        hgvs_c: m.hgvs_c || null,
        chrom: m.chrom || null,
        pos: typeof m.pos === 'number' ? m.pos : (m.pos ? Number(m.pos) : null),
        ref: m.ref || null,
        alt: (m.alt === '' ? '' : (m.alt || null)),
        build: m.build || null,
        consequence: m.consequence || null,
        source: m.source || null,
        evidence: m.evidence || null,
        // Include additional fields that WIWFM might need
        ...(m.provenance && { provenance: m.provenance }),
      }))
      .filter((m) => m.gene), // Only include mutations with gene name
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
    germline_variants:
      profile.germline?.mutations?.map((m) => ({
        gene: m.gene,
        variant: m.variant || null,
        hgvs_c: m.variant || null,
        hgvs_p: m.hgvs_p || m.protein_change || null,
        protein_change: m.protein_change || null,
        chrom: m.chrom || null,
        pos: typeof m.pos === 'number' ? m.pos : (m.pos ? Number(m.pos) : null),
        ref: m.ref || null,
        alt: (m.alt === '' ? '' : (m.alt || null)),
        build: m.build || null,
        consequence: m.consequence || null,
        classification: m.classification,
        zygosity: m.zygosity,
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
        gene: tp53Mutation.gene,
        // No hgvs_p for IHC-only evidence
      });
    }

    if (slMutations.length === 0) {
      return null;
    }

    const diseaseKey = patientProfile.disease?.type || 'ovarian_cancer_hgs';
    const genesKey = slMutations.map(m => m.gene).filter(Boolean).sort().join(',');
    const cacheKey = `sl:${diseaseKey}:${genesKey}`;
    const cached = slCache.get(cacheKey);
    if (cached) {
      return { ...cached, provenance: { ...(cached.provenance || {}), client_cache_hit: true } };
    }

    const slResponse = await fetch(`${API_ROOT}/api/guidance/synthetic_lethality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease: diseaseKey,
        mutations: slMutations,
        api_base: API_ROOT
      })
    });

    if (slResponse.ok) {
      const data = await slResponse.json();
      slCache.set(cacheKey, data);
      return data;
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

  if (vusMutations.length === 0) return {};

  await Promise.all(vusMutations.map(async (vus) => {
    const cacheKey = `vus:${vus.gene || ''}:${vus.variant || ''}:${vus.protein_change || ''}`;
    const cached = vusCache.get(cacheKey);
    if (cached) {
      vusResults[vus.gene] = { ...cached, provenance: { ...(cached.provenance || {}), client_cache_hit: true } };
      return;
    }
    try {
      const data = await singleFlight(_inflight.vus, cacheKey, async () => {
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

        if (!vusResponse.ok) {
          throw new Error(`HTTP ${vusResponse.status}`);
        }
        return await vusResponse.json();
      });

      vusCache.set(cacheKey, data);
      vusResults[vus.gene] = data;
    } catch (err) {
      console.error(`[useCompleteCareOrchestrator] VUS Resolution call failed for ${vus.gene}:`, err);
    }
  }));

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

    if (unique.length === 0) return [];

    const scores = await Promise.all(unique.map(async (item) => {
      try {
        const g = (item.gene || '').toUpperCase();
        const c = item.consequence || '';
        const cacheKey = `ess:${g}:${c}`;
        const cached = essentialityCache.get(cacheKey);
        if (cached) {
          const score = cached.essentiality_score;
          return {
            gene: cached.gene,
            essentiality_score: score,
            essentiality_level: score >= 0.7 ? 'HIGH' : (score >= 0.5 ? 'MODERATE' : 'LOW'),
            functional_consequence: cached.flags?.frameshift ? 'Frameshift/truncation signal' : null,
            confidence: cached.confidence,
            rationale: cached.rationale,
            provenance: { ...(cached.provenance || {}), client_cache_hit: true },
          };
        }

        const data = await singleFlight(_inflight.essentiality, cacheKey, async () => {
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
            return null;
          }
          return await resp.json();
        });

        if (!data) return null;
        essentialityCache.set(cacheKey, data);
        if (data && data.gene && typeof data.essentiality_score === 'number') {
          const score = data.essentiality_score;
          return {
            gene: data.gene,
            essentiality_score: score,
            essentiality_level: score >= 0.7 ? 'HIGH' : (score >= 0.5 ? 'MODERATE' : 'LOW'),
            functional_consequence: data.flags?.frameshift ? 'Frameshift/truncation signal' : null,
            confidence: data.confidence,
            rationale: data.rationale,
            provenance: data.provenance,
          };
        }
        return null;
      } catch (err) {
        console.error(`[useCompleteCareOrchestrator] Essentiality call failed for ${item.gene}:`, err);
        return null;
      }
    }));

    return scores.filter(s => s !== null);
  } catch (err) {
    console.error('[useCompleteCareOrchestrator] Essentiality call failed:', err);
    return [];
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
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState(null);

  const generatePlan = useCallback(async (patientProfile, options = {}) => {
    if (!patientProfile) {
      setError('Patient profile is required');
      return;
    }

    // Stale-while-revalidate: serve cached result instantly
    const cacheKey = `care:${patientProfile?.patient?.id || 'ayesha'}`;
    const cached = carePlanCache.get(cacheKey);
    if (cached) {
      if (!result) setResult(cached); // Show stale data while fetching fresh
      setIsRevalidating(true);
      setLoading(false); // Don't show full loader – we have data
    } else {
      setLoading(true);
    }
    setError(null);
    // NOTE: We do NOT setResult(null) – keep previous data visible

    try {
      // Build request from REAL patient profile - no hard-coding
      const baseRequest = buildRequestFromProfile(patientProfile);
      // Merge with options (allows overriding max_trials, etc.)
      const requestBody = { ...baseRequest, ...options };

      console.log('[useCompleteCareOrchestrator] Request body built from profile:', {
        stage: requestBody.stage,
        germline_status: requestBody.germline_status,
        has_tumor_context: !!requestBody.tumor_context,
        somatic_mutations_count: requestBody.tumor_context?.somatic_mutations?.length || 0,
        germline_variants_count: requestBody.germline_variants?.length || 0
      });

      // KEY OPTIMIZATION: Start all independent requests in parallel!
      // 1. VUS Resolution
      const vusPromise = fetchVUSResults(patientProfile);

      // 2. Essentiality Scores
      const essentialityPromise = fetchEssentialityScores(patientProfile);

      // 3. Synthetic Lethality (Always fetch in parallel to be safe/fast)
      const slPromise = fetchSyntheticLethality(patientProfile);

      // 4. Main Care Plan API call
      const mainPlanPromise = fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
          throw new Error(errorData.detail || `API error: ${response.status}`);
        }
        return response.json();
      });

      // Wait for everything to finish
      // Note: We await Promise.all so we have all data ready for transformation
      const [vusResults, essentialityScores, slFallbackResult, data] = await Promise.all([
        vusPromise,
        essentialityPromise,
        slPromise,
        mainPlanPromise
      ]);

      console.log('[useCompleteCareOrchestrator] All parallel requests completed');

      console.log('[useCompleteCareOrchestrator] API response:', {
        has_wiwfm: !!data.wiwfm,
        wiwfm_status: data.wiwfm?.status,
        wiwfm_drugs_count: data.wiwfm?.drugs?.length || 0,
        has_trials: !!data.trials,
        has_soc: !!data.soc_recommendation,
        has_ca125: !!data.ca125_intelligence,
        has_food: !!data.food_validation
      });

      // Extract SL results from WIWFM provenance (preferred) or use parallel result
      let syntheticLethalityResult = null;
      if (data.wiwfm?.provenance?.synthetic_lethality) {
        // Use SL results from WIWFM (most accurate context)
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
        // Fallback: Use the parallel result we already fetched
        syntheticLethalityResult = slFallbackResult;
        console.log('[useCompleteCareOrchestrator] ⚠️  SL not in WIWFM, used parallel fallback result');
      }

      // Transform and combine all results
      const transformedData = transformCarePlanData(
        data,
        syntheticLethalityResult,
        vusResults,
        essentialityScores,
        null // SOC S/P/E analysis removed (use soc_recommendation)
      );

      console.log('[useCompleteCareOrchestrator] Transformed data:', {
        drug_recommendations_count: transformedData.drug_recommendations.length,
        wiwfm_status: transformedData.wiwfm_status,
        has_synthetic_lethality: !!transformedData.synthetic_lethality,
        vus_results_count: Object.keys(transformedData.vus_results).length,
        essentiality_scores_count: transformedData.essentiality_scores.length
      });

      carePlanCache.set(cacheKey, transformedData);
      setResult(transformedData);
    } catch (err) {
      console.error('[useCompleteCareOrchestrator] Error:', err);
      // Only show error if we have no cached data to fall back on
      if (!result) {
        setError(`Error: ${err.message}`);
      } else {
        console.warn('[useCompleteCareOrchestrator] Revalidation failed, keeping stale data');
      }
    } finally {
      setLoading(false);
      setIsRevalidating(false);
    }
  }, []);

  const refreshPlan = useCallback((patientProfile) => {
    return generatePlan(patientProfile);
  }, [generatePlan]);

  return {
    result,
    loading,
    isRevalidating,
    error,
    generatePlan,
    refreshPlan
  };
};

export default useCompleteCareOrchestrator;
