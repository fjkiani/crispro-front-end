import { useState, useEffect } from 'react';
import { apiPost } from '../../ClinicalGenomicsCommandCenter/utils/genomicsUtils';

/**
 * Custom hook for Clinical Dossier API integration
 * Handles fetching, validation, transformation, and error handling
 * 
 * @param {Array} mutations - Array of mutation objects
 * @param {string} disease - Disease type
 * @returns {Object} { dossier, loading, error, refetch }
 */
export const useClinicalDossier = (mutations = [], disease = '') => {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Validate inputs before API call
   */
  const validateInputs = (mutations, disease) => {
    const errors = [];
    
    if (!mutations || mutations.length === 0) {
      errors.push('At least one mutation is required');
    }
    
    mutations.forEach((mut, idx) => {
      if (!mut.gene) {
        errors.push(`Mutation ${idx + 1}: Missing gene symbol`);
      }
      if (!mut.hgvs_p && (!mut.chrom || !mut.pos)) {
        errors.push(`Mutation ${idx + 1}: Missing variant coordinates`);
      }
    });
    
    if (!disease) {
      errors.push('Disease type is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  /**
   * Validate dossier data structure after API response
   * Note: Relaxed validation - only required field is executive_summary
   * Other fields are optional and will use defaults if missing
   */
  const validateDossierData = (data) => {
    try {
      if (!data) throw new Error('No data received');
      
      // Only executive_summary is strictly required
      if (!data.executive_summary) {
        console.warn('Missing executive_summary, using defaults');
        data.executive_summary = {
          ddr_pathway_burden: 0,
          top_drug: 'N/A',
          top_drug_alignment: 0,
          tmb: 0,
          actionability: 'LOW'
        };
      }
      
      // Ensure arrays exist (use empty arrays as defaults)
      if (!data.variants) data.variants = [];
      if (!data.drugs) data.drugs = [];
      
      // Validate numeric ranges (warn but don't fail)
      if (data.pathway_disruption) {
        const pathwayScores = [
          data.pathway_disruption.ddr,
          data.pathway_disruption.tp53,
          data.pathway_disruption.dna_repair_capacity
        ].filter(score => score !== undefined);
        
        pathwayScores.forEach(score => {
          if (score < 0 || score > 1) {
            console.warn('Pathway score out of range:', score);
          }
        });
      }
      
      return data;
    } catch (error) {
      console.error('Dossier data validation failed:', error);
      return null;
    }
  };

  /**
   * Transform API response to dossier format
   * CRITICAL: Transform efficacy_score to alignment_score
   */
  const transformApiResponse = (apiResponse) => {
    // Extract data from API response structure
    const efficacy = apiResponse.efficacy || {};
    const drugs = efficacy.drugs || [];
    const provenance = apiResponse.provenance || {};
    const tumorContext = apiResponse.tumor_context || {};
    
    // Transform drugs - CRITICAL: use alignment_score, not efficacy_score
    const transformedDrugs = drugs.map(drug => ({
      name: drug.name || 'Unknown',
      class: drug.class || 'Unknown',
      mechanism: drug.mechanism || 'Unknown',
      // CRITICAL: Use alignment_score, fallback to efficacy_score if alignment_score not present
      alignment_score: drug.alignment_score !== undefined 
        ? drug.alignment_score 
        : (drug.efficacy_score !== undefined ? drug.efficacy_score : 0),
      confidence: drug.confidence || 0,
      evidence_tier: drug.evidence_tier || 'INSUFFICIENT',
      clinical_badges: drug.clinical_badges || [],
      rationale: drug.rationale || ''
    }));
    
    // Calculate actionability
    const calculateActionability = (response) => {
      const topDrug = transformedDrugs[0];
      const ddrPathway = provenance.confidence_breakdown?.pathway_disruption?.ddr || 0;
      const tmb = tumorContext.tmb || 0;
      
      if (ddrPathway >= 0.8 && topDrug?.alignment_score >= 0.7) {
        return 'HIGH';
      } else if (ddrPathway >= 0.5 || topDrug?.alignment_score >= 0.5 || tmb >= 20) {
        return 'MODERATE';
      }
      return 'LOW';
    };
    
    return {
      executive_summary: {
        ddr_pathway_burden: provenance.confidence_breakdown?.pathway_disruption?.ddr || 0,
        top_drug: transformedDrugs[0]?.name || 'N/A',
        top_drug_alignment: transformedDrugs[0]?.alignment_score || 0,
        tmb: tumorContext.tmb || 0,
        actionability: calculateActionability(apiResponse)
      },
      variants: (apiResponse.variants || []).map(v => ({
        gene: v.gene || '',
        hgvs_p: v.hgvs_p || '',
        classification: v.classification || 'Unknown',
        inheritance: v.inheritance || 'Unknown',
        functional_impact: v.functional_impact || {},
        rationale: v.rationale || '',
        affects_drug_response: v.affects_drug_response || 0
      })),
      pathway_disruption: {
        ddr: provenance.confidence_breakdown?.pathway_disruption?.ddr || 0,
        tp53: provenance.confidence_breakdown?.pathway_disruption?.tp53 || 0,
        dna_repair_capacity: apiResponse.dna_repair_capacity || 0.6
      },
      drugs: transformedDrugs,
      clinical_trials: apiResponse.clinical_trials || [],
      resistance_surveillance: apiResponse.resistance_surveillance || {},
      immunotherapy_eligibility: {
        tmb: tumorContext.tmb || 0,
        msi_status: tumorContext.msi_status || 'MSS',
        eligible: (tumorContext.tmb || 0) >= 20 || tumorContext.msi_status === 'MSI-H'
      },
      clinical_action_plan: apiResponse.clinical_action_plan || [],
      evidence_quality: apiResponse.evidence_quality || {},
      report_id: apiResponse.report_id || `dossier-${Date.now()}`,
      analysis_date: apiResponse.analysis_date || new Date().toISOString()
    };
  };

  /**
   * Fetch dossier from API
   */
  const fetchDossier = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      const validated = validateInputs(mutations, disease);
      if (!validated.valid) {
        throw new Error(validated.errors.join(', '));
      }
      
      // Make API call using existing apiPost utility
      const data = await apiPost('/api/efficacy/predict', {
        mutations,
        disease,
        tumor_context: mutations[0]?.tumor_context || {}
      }, {
        signal: AbortSignal.timeout(30000) // 30s timeout
      });
      const transformed = transformApiResponse(data);
      const validatedData = validateDossierData(transformed);
      
      if (!validatedData) {
        throw new Error('Invalid dossier data structure');
      }
      
      setDossier(validatedData);
    } catch (err) {
      const errorMessage = err.name === 'AbortError' 
        ? 'Request timed out. Please try again.'
        : err.message || 'Analysis failed. Please check your inputs and try again.';
      
      setError(errorMessage);
      console.error('Dossier fetch failed:', err);
      
      // Try to load from cache if available
      const cacheKey = `dossier-${JSON.stringify(mutations)}-${disease}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setDossier(cachedData);
          setError('Using cached results (API unavailable)');
        } catch (cacheErr) {
          console.error('Failed to load cached data:', cacheErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when mutations and disease are available
  useEffect(() => {
    if (mutations.length > 0 && disease) {
      fetchDossier();
    }
  }, [JSON.stringify(mutations), disease]); // Note: Using JSON.stringify for deep comparison

  return { 
    dossier, 
    loading, 
    error, 
    refetch: fetchDossier 
  };
};

