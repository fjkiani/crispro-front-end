
import { useQuery } from '@tanstack/react-query';
import { API_ROOT } from '../lib/apiConfig';


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
 * STRICT CONTRACT ENFORCEMENT
 * Replaces bundle endpoint with parallel calls to:
 * 1. POST /analyze (Core Efficacy)
 * 2. GET /scenarios (Previews)
 * 
 * Returns a composite object matching the UI's expectation.
 */
/**
 * @param {{
 *   level?: string,
 *   scenario_id?: (string|null),
 *   l3_scenario_id?: (string|null),
 * }} params
 */
const fetchStrictBundle = async ({ level = 'all', scenario_id = null, l3_scenario_id = null, efficacy_mode = 'comprehensive' }) => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // 1. Prepare /analyze params
  const analyzeParams = new URLSearchParams();
  if (level) analyzeParams.append('level', level);
  if (scenario_id) analyzeParams.append('scenario_id', scenario_id);
  if (l3_scenario_id) analyzeParams.append('l3_scenario_id', l3_scenario_id);
  if (efficacy_mode) analyzeParams.append('efficacy_mode', efficacy_mode);

  // 2. Execute Parallel Calls
  const [analyzeRes, scenariosRes] = await Promise.all([
    fetch(`${API_ROOT}/api/ayesha/therapy-fit/analyze?${analyzeParams.toString()}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    }),
    fetch(`${API_ROOT}/api/ayesha/therapy-fit/scenarios`, { headers })
  ]);

  if (!analyzeRes.ok) throw new Error(`Analyze failed: ${analyzeRes.statusText}`);
  if (!scenariosRes.ok) throw new Error(`Scenarios failed: ${scenariosRes.statusText}`);

  const analyzeData = await analyzeRes.json();
  const scenariosData = await scenariosRes.json();

  // 3. Adapter Layer: Reconstruct "Bundle" Shape
  // UI expects: { patient_context, levels, l2_scenarios, ... }

  // Extract patient context from L1 (patched backend)
  const l1Data = analyzeData.L1 || analyzeData.l1 || {};
  const patientContext = l1Data.inputs_used?.tumor_context || {};

  // Ensure completeness score is available for the UI
  if (l1Data.completeness) {
    patientContext.completeness_score = l1Data.completeness.completeness_score;
  }

  return {
    patient_context: patientContext,
    levels: analyzeData,
    l2_scenarios: scenariosData.l2_scenarios,
    l3_scenarios: scenariosData.l3_scenarios,
    preview_cache: scenariosData.preview_cache,
    contract_version: "v2.0-strict"
  };
};

/**
 * @param {{
 *   level?: string,
 *   scenario_id?: (string|null),
 *   l3_scenario_id?: (string|null),
 * }} params
 */
export function useAyeshaTherapyFitBundle({ level = 'all', scenario_id = null, l3_scenario_id = null, efficacy_mode = 'comprehensive' } = {}, options = {}) {
  return useQuery({
    queryKey: ['ayesha-therapy-fit-strict', { level, scenario_id, l3_scenario_id, efficacy_mode }],
    queryFn: () => fetchStrictBundle({ level, scenario_id, l3_scenario_id, efficacy_mode }),
    // Default caching: avoid constant refetch spam in dev.
    staleTime: 30 * 1000, // 30s
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // But when previews are computing, poll until they become available.
    refetchInterval: (query) => {
      const st = query?.state?.data?.preview_cache?.status;
      return st === 'computing' ? 3000 : false;
    },
    retry: 1,
    keepPreviousData: true,
    ...options,
  });
}

// Keep standalone hook if needed
export function useAyeshaScenarios(options = {}) {
  return useQuery({
    queryKey: ['ayesha-scenarios'],
    queryFn: async () => {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_ROOT}/api/ayesha/therapy-fit/scenarios`, { headers });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    ...options
  });
}
