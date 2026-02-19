import { useQuery } from '@tanstack/react-query';
import { API_ROOT } from '../lib/apiConfig';


const getAuthToken = () => {
  try {
    const sessionStr = localStorage.getItem('mock_auth_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const t = session?.access_token;
      if (t && t !== 'null' && t !== 'undefined') return t;
    }
  } catch (e) {
    // ignore
  }
  const t2 = localStorage.getItem('supabase_auth_token');
  if (t2 && t2 !== 'null' && t2 !== 'undefined') return t2;
  return null;
};

async function fetchTumorBoardBundle({
  level = 'l1',
  scenarioId = null,
  l3ScenarioId = null,
  includeSyntheticLethality = true,
  ctdnaStatusOverride = null,
  efficacyMode = 'comprehensive', // 'fast' | 'comprehensive'
} = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const params = new URLSearchParams();
  params.set('level', String(level || 'l1'));
  if (scenarioId) params.set('scenario_id', String(scenarioId));
  if (l3ScenarioId) params.set('l3_scenario_id', String(l3ScenarioId));
  params.set('include_synthetic_lethality', includeSyntheticLethality ? 'true' : 'false');
  if (ctdnaStatusOverride) params.set('ctdna_status_override', String(ctdnaStatusOverride));
  if (efficacyMode) params.set('efficacy_mode', String(efficacyMode));

  const res = await fetch(`${API_ROOT}/api/ayesha/therapy-fit/bundle?${params.toString()}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Failed to load tumor board bundle: ${res.status} ${res.statusText}${txt ? ` — ${txt}` : ''}`);
  }

  return res.json();
}

export function useTumorBoardBundle(
  {
    level = 'l1',
    scenarioId = null,
    l3ScenarioId = null,
    includeSyntheticLethality = true,
    ctdnaStatusOverride = null,
    efficacyMode = 'comprehensive',
  } = {},
  options = {}
) {
  return useQuery({
    queryKey: [
      'tumor-board-bundle',
      { level, scenarioId, l3ScenarioId, includeSyntheticLethality, ctdnaStatusOverride, efficacyMode },
    ],
    queryFn: () =>
      fetchTumorBoardBundle({
        level,
        scenarioId,
        l3ScenarioId,
        includeSyntheticLethality,
        ctdnaStatusOverride,
        efficacyMode,
      }),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    ...options,
  });
}

