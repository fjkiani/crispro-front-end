/**
 * buildProvenance - Build unified provenance object from care plan results
 * 
 * @param {Object} result - Care plan result object
 * @param {Object} patientProfile - Patient profile object
 * @returns {Object|null} Provenance object or null if result is missing
 */

export const buildProvenance = (result, patientProfile) => {
  if (!result) return null;

  // Handle new API structure (complete_care_v2) vs old structure
  const drugCount = (result.drug_recommendations?.length || result.wiwfm?.drugs?.length || 0);
  const foodCount = (result.food_recommendations?.length || result.food_validation?.recommendations?.length || 0);
  const trialCount = (result.trials?.trials?.length || 0);

  return {
    run_id: result.provenance?.run_id || result.run_id,
    timestamp: result.provenance?.generated_at || result.timestamp,
    data_sources: {
      pubmed_papers: (result.provenance?.drug_analysis?.papers_reviewed || 0) + 
                     (result.provenance?.food_analysis?.papers_reviewed || 0),
      chembl_targets: drugCount + foodCount,
      clinical_trials: trialCount,
      treatment_lines: patientProfile?.diagnostic_timeline?.length || 0
    },
    models_used: [
      { name: "Complete Care Orchestrator", version: "v2" },
      { name: "Drug Efficacy (WIWFM)", version: result.wiwfm ? "v2" : "v1" },
      { name: "Food Validator", version: result.food_validation ? "v2" : "v1" },
      { name: "SAE Feature Analysis", version: "v2.1" },
      { name: "Resistance Detection", version: "v2" }
    ],
    confidence_breakdown: {
      evidence_quality: result.confidence_breakdown?.drug_component || 0.7,
      pathway_match: result.confidence_breakdown?.food_component || 0.6,
      safety_profile: (result.integrated_confidence || result.summary?.confidence_level || 0.7) * 0.9
    }
  };
};

export default buildProvenance;
