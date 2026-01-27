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

const API_BASE_URL = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

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
      
      // Enhance essentiality report with pathway impacts
      const enhancedEssentiality = (data.essentiality_report || []).map(ess => ({
        gene: ess.gene,
        score: ess.result?.essentiality_score || 0,
        flags: ess.result?.flags || {},
        rationale: ess.result?.rationale || '',
        confidence: ess.result?.confidence || 0.5,
        pathwayImpact: getPathwayImpact(ess.gene, ess.result?.flags)
      }));

      // Step 5: Generate recommendations
      setStepProgress(5);

      // Analyze pathway dependencies
      const pathwayAnalysis = analyzePathways(mutations, enhancedEssentiality);

      // Generate ranked therapy recommendations
      const recommendedTherapies = generateTherapyRecommendations(
        data.suggested_therapy,
        pathwayAnalysis,
        enhancedEssentiality
      );

      const fullResults = {
        ...data,
        essentiality: enhancedEssentiality,
        pathway_analysis: pathwayAnalysis,
        recommended_therapies: recommendedTherapies,
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

// Helper: Determine pathway impact based on gene and flags
function getPathwayImpact(gene, flags = {}) {
  const geneUpper = (gene || '').toUpperCase();
  
  // DNA Repair genes
  if (['BRCA1', 'BRCA2', 'PALB2', 'RAD51', 'RAD51C', 'RAD51D'].includes(geneUpper)) {
    return 'HR pathway deficient';
  }
  if (['MBD4', 'MUTYH', 'OGG1', 'NTHL1'].includes(geneUpper)) {
    return 'BER pathway non-functional';
  }
  if (['MLH1', 'MSH2', 'MSH6', 'PMS2'].includes(geneUpper)) {
    return 'MMR pathway deficient';
  }
  if (['ATM', 'ATR', 'CHEK1', 'CHEK2'].includes(geneUpper)) {
    return 'DDR checkpoint impaired';
  }
  
  // Tumor suppressors
  if (geneUpper === 'TP53') {
    return 'Checkpoint pathway bypassed';
  }
  if (geneUpper === 'RB1') {
    return 'Cell cycle control lost';
  }
  if (geneUpper === 'PTEN') {
    return 'PI3K pathway dysregulated';
  }

  // Frameshift/truncation = likely loss-of-function
  if (flags.frameshift || flags.truncation) {
    return 'Gene function lost (LoF)';
  }

  return 'Function altered';
}

// Helper: Analyze pathway dependencies
function analyzePathways(mutations, essentialityResults) {
  const brokenPathways = [];
  const essentialPathways = [];
  const doubleHitDetected = mutations.length >= 2;

  // Check which pathways are broken
  for (const ess of essentialityResults) {
    const gene = (ess.gene || '').toUpperCase();
    const score = ess.score || 0;
    
    if (score >= 0.7) {
      // High essentiality = pathway is broken, backups become essential
      if (['MBD4', 'MUTYH', 'OGG1'].includes(gene)) {
        brokenPathways.push('BER');
        essentialPathways.push('HR');
        essentialPathways.push('NER');
      }
      if (['BRCA1', 'BRCA2', 'PALB2', 'RAD51'].includes(gene)) {
        brokenPathways.push('HR');
        essentialPathways.push('NHEJ');
      }
      if (gene === 'TP53') {
        brokenPathways.push('G1/S Checkpoint');
        essentialPathways.push('ATR/CHK1');
        essentialPathways.push('G2/M Checkpoint');
      }
    }
  }

  return {
    broken_pathways: [...new Set(brokenPathways)],
    essential_pathways: [...new Set(essentialPathways)],
    double_hit_detected: doubleHitDetected && brokenPathways.length >= 2,
    synthetic_lethality_score: calculateSyntheticLethalityScore(essentialityResults)
  };
}

// Helper: Calculate combined synthetic lethality score
function calculateSyntheticLethalityScore(essentialityResults) {
  if (!essentialityResults || essentialityResults.length === 0) return 0;
  
  // Average of high essentiality scores, boosted for multiple hits
  const highScores = essentialityResults.filter(e => e.score >= 0.7);
  if (highScores.length === 0) return 0;
  
  const avgScore = highScores.reduce((sum, e) => sum + e.score, 0) / highScores.length;
  const multiHitBoost = Math.min(0.15, (highScores.length - 1) * 0.05);
  
  return Math.min(1.0, avgScore + multiHitBoost);
}

// Helper: Generate therapy recommendations
function generateTherapyRecommendations(suggestedTherapy, pathwayAnalysis, essentialityResults) {
  const recommendations = [];
  const { broken_pathways, essential_pathways, double_hit_detected } = pathwayAnalysis;

  // PARP inhibitors for DNA repair deficiency
  if (broken_pathways.includes('BER') || broken_pathways.includes('HR')) {
    recommendations.push({
      drug: 'Olaparib',
      target: 'PARP1/2',
      confidence: double_hit_detected ? 0.89 : 0.82,
      mechanism: 'Blocks backup single-strand break repair',
      evidence_tier: 'I',
      fda_approved: true,
      sensitivity: 'VERY_HIGH'
    });
    recommendations.push({
      drug: 'Niraparib',
      target: 'PARP1/2',
      confidence: double_hit_detected ? 0.87 : 0.80,
      mechanism: 'PARP trapping causes replication fork collapse',
      evidence_tier: 'I',
      fda_approved: true,
      sensitivity: 'VERY_HIGH'
    });
    recommendations.push({
      drug: 'Rucaparib',
      target: 'PARP1/2',
      confidence: double_hit_detected ? 0.85 : 0.78,
      mechanism: 'PARP inhibition exploits HR deficiency',
      evidence_tier: 'I',
      fda_approved: true,
      sensitivity: 'HIGH'
    });
  }

  // ATR inhibitors for checkpoint deficiency
  if (broken_pathways.includes('G1/S Checkpoint') || essential_pathways.includes('ATR/CHK1')) {
    recommendations.push({
      drug: 'Ceralasertib',
      target: 'ATR',
      confidence: 0.72,
      mechanism: 'Blocks ATR checkpoint - only remaining checkpoint after TP53 loss',
      evidence_tier: 'II',
      fda_approved: false,
      sensitivity: 'HIGH'
    });
    recommendations.push({
      drug: 'Berzosertib',
      target: 'ATR',
      confidence: 0.68,
      mechanism: 'ATR kinase inhibition induces replication catastrophe',
      evidence_tier: 'II',
      fda_approved: false,
      sensitivity: 'HIGH'
    });
  }

  // WEE1 inhibitors for G2/M checkpoint dependency
  if (essential_pathways.includes('G2/M Checkpoint')) {
    recommendations.push({
      drug: 'Adavosertib',
      target: 'WEE1',
      confidence: 0.65,
      mechanism: 'Blocks G2/M checkpoint - forces damaged cells into mitosis',
      evidence_tier: 'II',
      fda_approved: false,
      sensitivity: 'HIGH'
    });
  }

  // Platinum for general DNA repair deficiency
  if (suggestedTherapy === 'platinum' || broken_pathways.length > 0) {
    // Check if platinum is already in list or should be added
    const hasPlatinum = recommendations.some(r => r.target === 'DNA');
    if (!hasPlatinum) {
      recommendations.push({
        drug: 'Carboplatin',
        target: 'DNA',
        confidence: 0.75,
        mechanism: 'DNA crosslinks require HR for repair',
        evidence_tier: 'I',
        fda_approved: true,
        sensitivity: 'HIGH'
      });
    }
  }

  // Sort by confidence
  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

export default useSyntheticLethality;




