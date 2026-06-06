import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  buildAyeshaTherapyFitBundleUrl,
  getAyeshaTherapyFitScenariosUrl,
  mergeTherapyFitBundleWithScenarios,
} from '../utils/ayeshaApi';
import {
  storageKeyForBundle,
  readPersistedBundle,
  writePersistedBundle,
} from '../utils/ayeshaBundleSessionPersistence';
import { getAuthToken } from '../utils/sessionPersistence';

const THERAPY_FIT_BUNDLE_STORAGE_PREFIX = 'therapy_fit_bundle_v1:';

/**
 * Fetch from /bundle (returns full data including 10+ drugs)
 * and /scenarios in parallel.
 *
 * Returns a composite object matching the UI's expectation.
 * Auth token is read via shared getAuthToken() from sessionPersistence.
 */
const fetchStrictBundle = async ({ level = 'all', scenario_id = null, l3_scenario_id = null, efficacy_mode = 'fast' }) => {
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
  return mergeTherapyFitBundleWithScenarios(bundleData, scenariosData);
};

export function useAyeshaTherapyFitBundle({ level = 'all', scenario_id = null, l3_scenario_id = null, efficacy_mode = 'fast' } = {}, options = {}) {
  const queryKeyPayload = useMemo(
    () => ({
      level,
      scenario_id,
      l3_scenario_id,
      efficacy_mode,
      include_synthetic_lethality: true,
    }),
    [level, scenario_id, l3_scenario_id, efficacy_mode]
  );

  const persistKey = useMemo(
    () => storageKeyForBundle(THERAPY_FIT_BUNDLE_STORAGE_PREFIX, queryKeyPayload),
    [queryKeyPayload]
  );

  const persisted = useMemo(() => readPersistedBundle(persistKey), [persistKey]);

  return useQuery({
    queryKey: ['ayesha-therapy-fit-strict', queryKeyPayload],
    queryFn: async () => {
      const data = await fetchStrictBundle({
        level,
        scenario_id,
        l3_scenario_id,
        efficacy_mode,
      });
      writePersistedBundle(persistKey, data);
      return data;
    },
    initialData: persisted?.data,
    initialDataUpdatedAt: persisted?.updatedAt,
    staleTime: 5 * 60 * 1000,   // 5 minutes — bundle endpoint is ~10s; cache aggressively
    cacheTime: 15 * 60 * 1000,
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
