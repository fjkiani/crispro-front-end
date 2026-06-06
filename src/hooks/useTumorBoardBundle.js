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

const TB_BUNDLE_STORAGE_PREFIX = 'tumor_board_bundle_v1:';

const getAuthToken = () => {
  const t = localStorage.getItem('supabase_auth_token');
  if (t && t !== 'null' && t !== 'undefined') return t;
  return null;
};

// ─── localStorage helpers (canonical keys, mirrors DataEntryPanel exports) ────
function readCA125History() {
  try {
    const raw = localStorage.getItem('ayesha_ca125_history_v1');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch { return null; }
}

function readHRD() {
  try { return JSON.parse(localStorage.getItem('ayesha_hrd_v1') || 'null'); }
  catch { return null; }
}

function readRSSInputs() {
  // Written by RSSEntryForm.jsx under key 'ayesha_rss_inputs_v1'
  try { return JSON.parse(localStorage.getItem('ayesha_rss_inputs_v1') || 'null'); }
  catch { return null; }
}

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

  // Read locally-stored patient data and attach to request body.
  // Backend expects these in tumor_context_additions or directly in the body.
  // Fields are optional — only attach when present to avoid polluting baseline.
  const ca125History = readCA125History();
  const hrdEntry = readHRD();
  const body = {};
  const localSources = [];
  if (ca125History) {
    body.ca125_history = ca125History;
    // Most recent value as single-reading shortcut
    const last = ca125History[ca125History.length - 1];
    if (last?.value) {
      body.ca125_value = last.value;
      body.ca125_date = last.date;
    }
    localSources.push('ca125_history');
  }
  if (hrdEntry?.hrd_score != null) {
    body.hrd_score = hrdEntry.hrd_score;
    body.hrd_status = hrdEntry.hrd_status;
    localSources.push('hrd');
  }

  // Replication Stress Score inputs — enables 8th vector axis (PMID 34552099)
  const rssInputs = readRSSInputs();
  if (rssInputs && Object.keys(rssInputs).length > 0) {
    body.rss_inputs = rssInputs;
    localSources.push('rss');
  }

  // Tag the request with local-data provenance so the UI can label it honestly
  if (localSources.length > 0) {
    body._local_data_sources = localSources;
  }

  const [bundleRes, scenariosRes] = await Promise.all([
    fetch(buildAyeshaTherapyFitBundleUrl({
      level,
      scenarioId,
      l3ScenarioId,
      includeSyntheticLethality,
      ctdnaStatusOverride,
      efficacyMode,
    }), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),
    fetch(getAyeshaTherapyFitScenariosUrl(), { headers }),
  ]);

  if (!bundleRes.ok) {
    const txt = await bundleRes.text().catch(() => '');
    throw new Error(`Failed to load tumor board bundle: ${bundleRes.status} ${bundleRes.statusText}${txt ? ` — ${txt}` : ''}`);
  }
  if (!scenariosRes.ok) {
    const txt = await scenariosRes.text().catch(() => '');
    throw new Error(`Failed to load therapy-fit scenarios: ${scenariosRes.status} ${scenariosRes.statusText}${txt ? ` — ${txt}` : ''}`);
  }

  const bundleJson = await bundleRes.json();
  const scenariosJson = await scenariosRes.json();
  return mergeTherapyFitBundleWithScenarios(bundleJson, scenariosJson);
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
  const queryKeyPayload = {
    level,
    scenarioId,
    l3ScenarioId,
    includeSyntheticLethality,
    ctdnaStatusOverride,
    efficacyMode,
  };

  const persistKey = useMemo(
    () => storageKeyForBundle(TB_BUNDLE_STORAGE_PREFIX, queryKeyPayload),
    [
      level,
      scenarioId,
      l3ScenarioId,
      includeSyntheticLethality,
      ctdnaStatusOverride,
      efficacyMode,
    ]
  );

  const persisted = useMemo(() => readPersistedBundle(persistKey), [persistKey]);

  return useQuery({
    queryKey: ['tumor-board-bundle', queryKeyPayload],
    queryFn: async () => {
      const data = await fetchTumorBoardBundle({
        level,
        scenarioId,
        l3ScenarioId,
        includeSyntheticLethality,
        ctdnaStatusOverride,
        efficacyMode,
      });
      writePersistedBundle(persistKey, data);
      return data;
    },
    // Instant paint when returning to Tumor Board / Therapy Fit in the same session
    initialData: persisted?.data,
    initialDataUpdatedAt: persisted?.updatedAt,
    // Prefer long warm cache: app default is 5m stale / 10m cache; tumor board is heavy
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    ...options,
  });
}

