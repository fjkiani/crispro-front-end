/**
 * exportClinicalDossier - Export comprehensive clinical dossier as JSON file
 * 
 * @param {Object} result - Care plan result object
 * @param {Object} patientProfile - Patient profile object
 * @param {Function} buildProvenance - Function to build provenance object
 * @param {string} filename - Optional filename
 */

export const exportClinicalDossier = (result, patientProfile, buildProvenance, filename = null) => {
  if (!result || !patientProfile) return;

  // Build comprehensive clinical dossier
  const dossier = {
    patient_id: patientProfile.patient?.patient_id || 'AK',
    generated_date: new Date().toISOString(),
    dossier_type: 'complete_care_plan',
    patient_profile: {
      demographics: patientProfile.patient?.demographics,
      disease: patientProfile.disease,
      germline_status: patientProfile.germline_status,
      tumor_context: patientProfile.tumor_context
    },
    care_plan: {
      standard_of_care: result.soc_recommendation,
      drug_recommendations: result.drug_recommendations,
      food_recommendations: result.food_recommendations,
      clinical_trials: result.trials,
      ca125_intelligence: result.ca125_intelligence
    },
    genetic_analysis: {
      synthetic_lethality: result.synthetic_lethality,
      vus_results: result.vus_results,
      essentiality_scores: result.essentiality_scores || result.synthetic_lethality?.essentiality_scores || []
    },
    monitoring: {
      next_tests: result.next_test_recommender?.recommendations || [],
      resistance_playbook: result.resistance_playbook,
      mechanism_map: result.mechanism_map
    },
    provenance: {
      run_id: result.run_id || result.provenance?.run_id,
      generated_at: result.provenance?.generated_at || new Date().toISOString(),
      data_sources: buildProvenance?.(result, patientProfile)?.data_sources || {}
    }
  };

  // Export as JSON
  const dataStr = JSON.stringify(dossier, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `clinical_dossier_${patientProfile.patient?.patient_id || 'AK'}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export default exportClinicalDossier;
