/**
 * useSyntheticLethality Hook
 * 
 * Orchestrates synthetic lethality analysis by calling:
 * 1. /api/guidance/synthetic_lethality - Main analysis endpoint
 * 2. Individual essentiality scores per gene
 * 
 * Returns structured results for clinical display
 */

import { useState, useCallback } from 'react';
import { API_ROOT as API_BASE_URL } from '../../../lib/apiConfig';


/**
 * @typedef {Object} Mutation
 * @property {string} gene - Gene symbol (e.g., "MBD4")
 * @property {string} hgvs_p - Protein change (e.g., "p.Ile413Serfs*2")
 * @property {string} [chrom] - Chromosome
 * @property {number} [pos] - Position
 * @property {string} [ref] - Reference allele
 * @property {string} [alt] - Alternate allele
 * @property {string} [consequence] - VEP consequence (e.g., "frameshift_variant")
 * @property {string} [germline_status] - "germline" or "somatic"
 */

/**
 * @typedef {Object} EssentialityResult
 * @property {string} gene - Gene symbol
 * @property {number} score - Essentiality score [0,1]
 * @property {Object} flags - {truncation, frameshift, hotspot}
 * @property {string} rationale - Explanation
 * @property {number} confidence - Confidence in score
 * @property {string} pathwayImpact - Which pathway is affected
 */

/**
 * @typedef {Object} SyntheticLethalityResult
 * @property {string} suggested_therapy - Top recommended therapy
 * @property {Array} damage_report - Functionality analysis per variant
 * @property {Array} essentiality_report - Essentiality per gene
 * @property {Object} guidance - Chemo guidance payload
 * @property {Object} pathway_analysis - Broken vs essential pathways
 * @property {Array} recommended_therapies - Ranked drug list
 */

/**
 * Hook for synthetic lethality analysis
 * @param {Object} params
 * @param {string} params.disease - Disease type (e.g., "ovarian_cancer")
 * @param {string} [params.subtype] - Disease subtype
 * @param {string} [params.stage] - Disease stage
 * @param {Array<Mutation>} params.mutations - Array of mutations
 * @param {string} [params.modelId] - Evo2 model ID
 */
export function useSyntheticLethality({
  disease = '',
  subtype = '',
  stage = '',
  mutations = [],
  modelId = 'evo2_1b'
} = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [stepProgress, setStepProgress] = useState(0); // 0-5 for UI steps

  /**
   * Run the full synthetic lethality analysis
   */
  const analyze = useCallback(async () => {
    if (!mutations || mutations.length === 0) {
      setError('At least one mutation is required');
      return null;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setStepProgress(0);

    try {
      // Step 1: Damage Assessment
      setStepProgress(1);
      await sleep(300); // Brief delay for UI feedback

      // Step 2: Pathway Mapping
      setStepProgress(2);
      await sleep(300);

      // Step 3: Call main synthetic lethality endpoint
      setStepProgress(3);
      
      const response = await fetch(`${API_BASE_URL}/api/guidance/synthetic_lethality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: disease || 'cancer',
          mutations: mutations.map(m => ({
            gene: m.gene,
            hgvs_p: m.hgvs_p,
            chrom: m.chrom,
            pos: m.pos,
            ref: m.ref,
            alt: m.alt,
            consequence: m.consequence,
            build: m.build || 'GRCh38'
          })),
          model_id: modelId,
          api_base: API_BASE_URL
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();

      // Step 4: Process essentiality results
      setStepProgress(4);
      
      // Use real backend essentiality scores
      const enhancedEssentiality = (data.essentiality_scores || []).map(ess => ({
        gene: ess.gene,
        score: ess.score || 0,
        flags: ess.flags || {},
        rationale: ess.rationale || '',
        confidence: ess.confidence || 0.5,
        pathwayImpact: ess.pathwayImpact || ''
      }));

      // Step 5: Finalize response
      setStepProgress(5);

      const fullResults = {
        ...data,
        essentiality: enhancedEssentiality,
        // Map backend schema to what the UI expects
        pathway_analysis: {
          broken_pathways: data.broken_pathways || [],
          essential_pathways: data.essential_pathways || [],
          double_hit_detected: data.synthetic_lethality_detected || false,
          synthetic_lethality_score: data.synthetic_lethality_score !== undefined ? data.synthetic_lethality_score : (data.synthetic_lethality_detected ? 0.9 : 0.0)
        },
        // Normalize drug objects to the UI schema
        recommended_therapies: (data.recommended_drugs || []).map((d) => ({
          drug: d.drug_name || d.name || "Therapy",
          target: d.target || "SL Target",
          confidence: d.confidence || 0.8,
          mechanism: d.mechanism || "Synthetic lethality derived mechanism.",
          evidence_tier: d.tier?.replace(/[^IV]/g, '') || "II", // Strip down "IIA" -> "II" or keep "II" if backend matches
          fda_approved: d.fda_approved || false,
          sensitivity: d.sensitivity || "HIGH"
        })),
        disease_context: { disease, subtype, stage },
        analysis_timestamp: new Date().toISOString()
      };

      setResults(fullResults);
      return fullResults;

    } catch (err) {
      console.error('Synthetic lethality analysis failed:', err);
      setError(err.message || 'Analysis failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [disease, subtype, stage, mutations, modelId]);

  /**
   * Reset the analysis state
   */
  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setStepProgress(0);
  }, []);

  return {
    analyze,
    reset,
    loading,
    error,
    results,
    stepProgress
  };
}

// Helper: Sleep for UI feedback
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default useSyntheticLethality;




