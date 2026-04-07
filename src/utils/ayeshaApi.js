import { API_ROOT } from '../lib/apiConfig';

export const AYESHA_DEFAULT_CONTRACT_VERSION = 'v3.0';

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
