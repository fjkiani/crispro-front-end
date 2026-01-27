/**
 * Orchestrator Data Transformation Utilities
 * 
 * Functions to transform data between UniversalCompleteCare format and MOAT Orchestrator format.
 */

/**
 * Transform UniversalCompleteCare patient profile to Orchestrator request format.
 * 
 * @param {Object} patientProfile - Patient profile from UniversalCompleteCare format
 * @returns {Object} Orchestrator request object
 */
export const transformPatientProfileToOrchestrator = (patientProfile) => {
  if (!patientProfile) {
    throw new Error('Patient profile is required');
  }

  // Extract disease - handle both object and string formats
  let disease = 'ovarian'; // default
  if (patientProfile.disease) {
    if (typeof patientProfile.disease === 'string') {
      disease = patientProfile.disease;
    } else if (patientProfile.disease.type) {
      // Map disease types to orchestrator format
      const diseaseType = patientProfile.disease.type;
      if (diseaseType.includes('ovarian')) {
        disease = 'ovarian';
      } else if (diseaseType.includes('myeloma')) {
        disease = 'myeloma';
      } else if (diseaseType.includes('lung')) {
        disease = 'lung';
      } else if (diseaseType.includes('breast')) {
        disease = 'breast';
      } else if (diseaseType.includes('colorectal')) {
        disease = 'colorectal';
      } else {
        disease = 'other';
      }
    }
  }

  // Extract mutations from tumor_context.somatic_mutations
  const mutations = [];
  if (patientProfile.tumor_context?.somatic_mutations) {
    for (const mut of patientProfile.tumor_context.somatic_mutations) {
      mutations.push({
        gene: mut.gene || '',
        hgvs_p: mut.hgvs_p || mut.hgvs_c || null,
        hgvs_c: mut.hgvs_c || null,
        chromosome: mut.chrom || mut.chromosome || null,
        position: mut.pos || mut.position || null,
        ref: mut.ref || null,
        alt: mut.alt || null,
        consequence: mut.consequence || null,
        zygosity: mut.zygosity || 'unknown',
        vaf: mut.vaf || null,
        coverage: mut.coverage || null,
      });
    }
  }

  // Extract treatment line - convert "first-line" -> 1, "second-line" -> 2, etc.
  let treatment_line = 1; // default
  if (patientProfile.treatment?.line) {
    const lineStr = String(patientProfile.treatment.line).toLowerCase();
    if (lineStr.includes('first') || lineStr === '1' || lineStr === '1-line') {
      treatment_line = 1;
    } else if (lineStr.includes('second') || lineStr === '2' || lineStr === '2-line') {
      treatment_line = 2;
    } else if (lineStr.includes('third') || lineStr === '3' || lineStr === '3-line') {
      treatment_line = 3;
    } else if (lineStr.includes('fourth') || lineStr === '4' || lineStr === '4-line') {
      treatment_line = 4;
    } else {
      // Try to extract number
      const match = lineStr.match(/(\d+)/);
      if (match) {
        treatment_line = parseInt(match[1], 10);
      }
    }
  }

  // Extract prior therapies from treatment.history
  const prior_therapies = [];
  if (patientProfile.treatment?.history) {
    for (const therapy of patientProfile.treatment.history) {
      if (typeof therapy === 'string') {
        prior_therapies.push(therapy);
      } else if (therapy.name || therapy.drug || therapy.regimen) {
        prior_therapies.push(therapy.name || therapy.drug || therapy.regimen);
      }
    }
  }

  // Extract current regimen
  const current_regimen = patientProfile.treatment?.current_regimen || 
                          patientProfile.treatment?.regimen || 
                          null;

  // Build orchestrator request
  const request = {
    disease,
    mutations,
    treatment_line,
    patient_id: patientProfile.patient_id || null,
  };

  if (prior_therapies.length > 0) {
    request.prior_therapies = prior_therapies;
  }

  if (current_regimen) {
    request.current_regimen = current_regimen;
  }

  return request;
};

/**
 * Map Orchestrator response to legacy format for backward compatibility.
 * 
 * @param {Object} orchestratorResponse - Response from /api/orchestrate/full
 * @returns {Object} Legacy format compatible with UniversalCompleteCare components
 */
export const mapOrchestratorToLegacy = (orchestratorResponse) => {
  if (!orchestratorResponse) {
    return null;
  }

  // Transform drug ranking
  const drugRanking = orchestratorResponse.drug_ranking || [];
  const wiwfm = {
    drugs: drugRanking.map(d => ({
      name: d.drug_name,
      drug_name: d.drug_name,
      moa: d.mechanism || d.drug_class || d.moa || '',
      efficacy_score: d.efficacy_score || 0.0,
      confidence: d.confidence || d.efficacy_score || 0.0,
      evidence_tier: d.tier || d.evidence_tier || 'insufficient',
      badges: d.badges || [],
      rationale: d.rationale || [],
      drug_class: d.drug_class || '',
    })),
    evidence_tier: drugRanking.length > 0 ? (drugRanking[0].tier || drugRanking[0].evidence_tier || 'Supported') : 'Supported',
    run_signature: orchestratorResponse.patient_id || 'orchestrator',
  };

  // Transform trial matches
  const trialMatches = orchestratorResponse.trial_matches || [];
  const trials = {
    trials: trialMatches.map(t => ({
      nct_id: t.nct_id || '',
      title: t.title || '',
      phase: t.phase || null,
      status: t.status || null,
      mechanism_fit_score: t.mechanism_fit_score || 0.0,
      eligibility_score: t.eligibility_score || 0.0,
      combined_score: t.combined_score || 0.0,
      why_matched: t.why_matched || '',
      url: t.url || '',
      brief_summary: t.brief_summary || null,
      locations: t.locations || [],
      contact: t.contact || null,
    })),
  };

  // Transform mechanism vector
  const mechanism_map = {
    vector: orchestratorResponse.mechanism_vector || [0, 0, 0, 0, 0, 0, 0],
  };

  // Transform resistance playbook from next_line_options
  let resistance_playbook = null;
  if (orchestratorResponse.resistance_prediction?.next_line_options) {
    const nextLineOptions = orchestratorResponse.resistance_prediction.next_line_options;
    resistance_playbook = {
      risks: orchestratorResponse.resistance_prediction.detected_genes?.map(g => ({
        mechanism: g.gene || '',
        confidence: g.risk_ratio || g.confidence || 0.0,
        risk_ratio: g.risk_ratio || 0.0,
      })) || [],
      combo_strategies: [],
      next_line_switches: nextLineOptions.alternatives?.map(alt => ({
        drug: alt.drug || alt.name || '',
        rationale: alt.rationale || '',
        evidence_tier: alt.evidence_tier || 'VALIDATED',
      })) || [],
      trial_keywords: [],
      provenance: orchestratorResponse.resistance_prediction.provenance || {},
    };
  }

  // Build legacy response
  return {
    // Core mappings
    biomarker_intelligence: orchestratorResponse.biomarker_profile || null,
    resistance_prediction: orchestratorResponse.resistance_prediction || null,
    wiwfm,
    trials,
    mechanism_map,
    resistance_playbook,
    care_plan: orchestratorResponse.care_plan || null,
    nutrition_plan: orchestratorResponse.nutrition_plan || null,
    synthetic_lethality: orchestratorResponse.synthetic_lethality_result || null,
    monitoring_config: orchestratorResponse.monitoring_config || null,
    
    // Fields not in orchestrator (set to null)
    sae_features: null,
    soc_recommendation: null,
    next_test_recommender: null,
    hint_tiles: null,
    toxicity_assessments: null,
    resistance_alert: null,
    
    // Provenance
    provenance: {
      orchestrator: 'MOAT Orchestrator',
      run_id: orchestratorResponse.patient_id,
      generated_at: orchestratorResponse.updated_at || orchestratorResponse.created_at,
      phase: orchestratorResponse.phase,
      completed_agents: orchestratorResponse.completed_agents || [],
    },
    
    // Summary
    summary: {
      components_included: orchestratorResponse.completed_agents || [],
      ngs_status: orchestratorResponse.mutation_count > 0 ? 'available' : 'pending',
      confidence_level: 'moderate-high (70-90%)',
      pipeline_version: '2.0',
    },
  };
};

