import { API_ROOT } from '../lib/apiConfig';

export const AYESHA_DEFAULT_CONTRACT_VERSION = 'v3.0';

/**
 * Merge raw /bundle JSON with /scenarios JSON into the composite shape
 * consumed by Therapy Fit + Tumor Board (single source of truth).
 */
export function mergeTherapyFitBundleWithScenarios(bundleData, scenariosData) {
  if (!bundleData || typeof bundleData !== 'object') {
    return null;
  }
  const scenarios = scenariosData && typeof scenariosData === 'object' ? scenariosData : {};
  const levelsObj = bundleData.levels || {};
  const l1Data = levelsObj.L1 || levelsObj.l1 || {};
  const patientContext = l1Data?.inputs_used?.tumor_context || {};
  if (l1Data?.completeness) {
    patientContext.completeness_score = l1Data.completeness.completeness_score;
  }

  return {
    ...bundleData,
    patient_context: patientContext,
    levels: levelsObj,
    l2_scenarios: scenarios.l2_scenarios,
    l3_scenarios: scenarios.l3_scenarios,
    preview_cache: scenarios.preview_cache,
    contract_version: bundleData.contract_version || AYESHA_DEFAULT_CONTRACT_VERSION,
    io_harm_prevention: l1Data?.io_harm_prevention || bundleData.io_harm_prevention || null,
    tests_needed: bundleData.tests_needed || [],
    synthetic_lethality:
      bundleData.synthetic_lethality || l1Data?.synthetic_lethality || null,
  };
}

export function buildAyeshaTherapyFitBundleUrl({
  level = 'l1',
  scenarioId = null,
  l3ScenarioId = null,
  includeSyntheticLethality = true,
  ctdnaStatusOverride = null,
  efficacyMode = null,
} = {}) {
  const params = new URLSearchParams();
  if (level) params.set('level', String(level));
  if (scenarioId) params.set('scenario_id', String(scenarioId));
  if (l3ScenarioId) params.set('l3_scenario_id', String(l3ScenarioId));
  params.set('include_synthetic_lethality', includeSyntheticLethality ? 'true' : 'false');
  if (ctdnaStatusOverride) params.set('ctdna_status_override', String(ctdnaStatusOverride));
  if (efficacyMode) params.set('efficacy_mode', String(efficacyMode));
  return `${API_ROOT}/api/ayesha/therapy-fit/bundle?${params.toString()}`;
}

export function getAyeshaTherapyFitScenariosUrl() {
  return `${API_ROOT}/api/ayesha/therapy-fit/scenarios`;
}

export function buildAyeshaTherapyFitDrugUrl(drugName, { level = 'l1' } = {}) {
  const params = new URLSearchParams();
  if (level) params.set('level', String(level));
  return `${API_ROOT}/api/ayesha/therapy-fit/drug/${encodeURIComponent(drugName)}?${params.toString()}`;
}

export function getSyntheticLethalityUrl() {
  return `${API_ROOT}/api/guidance/synthetic_lethality`;
}
