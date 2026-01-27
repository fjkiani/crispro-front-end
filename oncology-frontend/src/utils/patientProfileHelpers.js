/**
 * Patient Profile Helper Functions
 * 
 * Utilities for extracting patient data for Research Intelligence
 */

/**
 * Extract biomarkers from patient profile for research context
 */
export function extractBiomarkersForResearch(profile) {
  if (!profile) return {};
  const biomarkers = profile?.tumor_context?.biomarkers || {};
  const tumorContext = profile?.tumor_context || {};
  const result = {};
  if (tumorContext.hrd_score !== undefined) {
    result.HRD = tumorContext.hrd_score > 0.5 ? 'POSITIVE' : 'NEGATIVE';
  }
  if (tumorContext.tmb !== undefined && tumorContext.tmb !== null) {
    result.TMB = tumorContext.tmb;
  }
  if (biomarkers.pd_l1_status) result.PD_L1 = biomarkers.pd_l1_status;
  if (biomarkers.pd_l1_cps !== undefined && biomarkers.pd_l1_cps !== null) {
    result.PD_L1_CPS = biomarkers.pd_l1_cps;
  }
  if (biomarkers.mmr_status) result.MMR = biomarkers.mmr_status;
  if (biomarkers.msi_status) result.MSI = biomarkers.msi_status;
  if (biomarkers.er_status) result.ER = biomarkers.er_status;
  if (biomarkers.er_percent !== undefined && biomarkers.er_percent !== null) {
    result.ER_PERCENT = biomarkers.er_percent;
  }
  if (biomarkers.pr_status) result.PR = biomarkers.pr_status;
  if (biomarkers.her2_status) result.HER2 = biomarkers.her2_status;
  if (biomarkers.folr1_status) result.FOLR1 = biomarkers.folr1_status;
  if (biomarkers.ntrk_status) result.NTRK = biomarkers.ntrk_status;
  return result;
}

/**
 * Build research context object from patient profile
 */
export function buildResearchContext(profile) {
  if (!profile) {
    return { disease: 'ovarian_cancer_hgs', treatment_line: 'L1', biomarkers: {} };
  }
  const disease = profile?.disease?.type || 'ovarian_cancer_hgs';
  const treatmentLine = profile?.treatment?.line || profile?.treatment?.line_number || 'L1';
  const biomarkers = extractBiomarkersForResearch(profile);
  return {
    disease,
    treatment_line: treatmentLine,
    biomarkers,
    patient_profile: profile,
    patient_id: profile?.patient?.patient_id
  };
}

/**
 * Format patient context for display
 */
export function formatPatientContext(profile) {
  if (!profile) return null;
  const patient = profile.patient || {};
  const disease = profile.disease || {};
  const biomarkers = profile?.tumor_context?.biomarkers || {};
  const keyBiomarkers = [];
  if (biomarkers.pd_l1_status) {
    keyBiomarkers.push(`PD-L1: ${biomarkers.pd_l1_status}${biomarkers.pd_l1_cps ? ` (CPS ${biomarkers.pd_l1_cps})` : ''}`);
  }
  if (biomarkers.mmr_status) keyBiomarkers.push(`MMR: ${biomarkers.mmr_status}`);
  if (biomarkers.er_status) {
    keyBiomarkers.push(`ER: ${biomarkers.er_status}${biomarkers.er_percent ? ` (${biomarkers.er_percent}%)` : ''}`);
  }
  if (biomarkers.her2_status) keyBiomarkers.push(`HER2: ${biomarkers.her2_status}`);
  if (profile?.tumor_context?.hrd_score !== undefined) {
    keyBiomarkers.push(`HRD: ${profile.tumor_context.hrd_score > 0.5 ? 'POSITIVE' : 'NEGATIVE'}`);
  }
  return {
    displayName: patient.display_name || patient.patient_id || 'Patient',
    disease: disease.type ? disease.type.replace(/_/g, ' ').toUpperCase() : 'Unknown',
    stage: disease.stage || 'Unknown',
    biomarkers: keyBiomarkers,
    treatmentLine: profile?.treatment?.line || profile?.treatment?.line_number || 'L1'
  };
}
