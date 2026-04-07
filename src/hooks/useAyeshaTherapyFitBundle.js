
import { useQuery } from '@tanstack/react-query';
import {
  AYESHA_DEFAULT_CONTRACT_VERSION,
  buildAyeshaTherapyFitBundleUrl,
  getAyeshaTherapyFitScenariosUrl,
} from '../utils/ayeshaApi';


// Helper to get auth token directly from storage
const getAuthToken = () => {
  try {
    const sessionStr = localStorage.getItem('mock_auth_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const t = session?.access_token;
      if (t && t !== 'null' && t !== 'undefined') return t;
    }
  } catch (e) {
    console.warn('Failed to parse auth session', e);
  }
  const t2 = localStorage.getItem('supabase_auth_token'); // Fallback
  if (t2 && t2 !== 'null' && t2 !== 'undefined') return t2;
  return null;
};

/**
 * Fetch from /bundle (returns full data including 10+ drugs)
 * and /scenarios in parallel.
 * 
 * Returns a composite object matching the UI's expectation.
 */
const fetchStrictBundle = async ({ level = 'all', scenario_id = null, l3_scenario_id = null, efficacy_mode = 'comprehensive' }) => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Build query params
  const params = new URLSearchParams();
  if (level) params.append('level', level);
  if (scenario_id) params.append('scenario_id', scenario_id);
  if (l3_scenario_id) params.append('l3_scenario_id', l3_scenario_id);
  if (efficacy_mode) params.append('efficacy_mode', efficacy_mode);
  params.append('include_synthetic_lethality', 'true');

  // Execute parallel calls — /bundle returns drugs correctly
  const [bundleRes, scenariosRes] = await Promise.all([
    fetch(buildAyeshaTherapyFitBundleUrl({
      level,
      scenarioId: scenario_id,
      l3ScenarioId: l3_scenario_id,
      includeSyntheticLethality: true,
      efficacyMode: efficacy_mode,
    }), {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    }),
    fetch(getAyeshaTherapyFitScenariosUrl(), { headers })
  ]);

  if (!bundleRes.ok) throw new Error(`Bundle failed: ${bundleRes.statusText}`);
  if (!scenariosRes.ok) throw new Error(`Scenarios failed: ${scenariosRes.statusText}`);

  const bundleData = await bundleRes.json();
  const scenariosData = await scenariosRes.json();

  // Adapter: /bundle returns { levels: { L1: { efficacy: { drugs } } } }
  // Phase3Treatment reads bundle.levels.L1.efficacy.drugs — keep shape as-is
  const levelsObj = bundleData.levels || {};

  // Extract patient context from L1
  const l1Data = levelsObj.L1 || levelsObj.l1 || {};
  const patientContext = l1Data?.inputs_used?.tumor_context || {};
  if (l1Data?.completeness) {
    patientContext.completeness_score = l1Data.completeness.completeness_score;
  }

  return {
    patient_context: patientContext,
    levels: levelsObj,
    l2_scenarios: scenariosData.l2_scenarios,
    l3_scenarios: scenariosData.l3_scenarios,
    preview_cache: scenariosData.preview_cache,
    contract_version: bundleData.contract_version || AYESHA_DEFAULT_CONTRACT_VERSION,
    io_harm_prevention: l1Data?.io_harm_prevention || null,
    tests_needed: bundleData.tests_needed || [],
    synthetic_lethality: bundleData.synthetic_lethality || l1Data?.synthetic_lethality || null,
  };
};

export function useAyeshaTherapyFitBundle({ level = 'all', scenario_id = null, l3_scenario_id = null, efficacy_mode = 'comprehensive' } = {}, options = {}) {
  return useQuery({
    queryKey: ['ayesha-therapy-fit-strict', { level, scenario_id, l3_scenario_id, efficacy_mode, include_synthetic_lethality: true }],
    queryFn: () => fetchStrictBundle({ level, scenario_id, l3_scenario_id, efficacy_mode }),
    staleTime: 5 * 60 * 1000,   // 5 minutes — bundle endpoint is ~10s; cache aggressively
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: (query) => {
      const st = query?.state?.data?.preview_cache?.status;
      return st === 'computing' ? 3000 : false;
    },
    retry: 2,
    keepPreviousData: true,
    ...options,
  });
}

export function useAyeshaScenarios(options = {}) {
  return useQuery({
    queryKey: ['ayesha-scenarios'],
    queryFn: async () => {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(getAyeshaTherapyFitScenariosUrl(), { headers });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    ...options
  });
}
