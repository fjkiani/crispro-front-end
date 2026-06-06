/**
 * Session-scoped persistence for heavy therapy-fit bundle + scenarios merges.
 * Survives SPA remounts and normal/hard reload in the same tab (sessionStorage).
 * Invalidates when local patient inputs (CA-125 / HRD / RSS) change.
 */

export const AYESHA_BUNDLE_SESSION_MAX_AGE_MS = 10 * 60 * 1000;

export function fingerprintLocalInputs() {
  try {
    const ca = localStorage.getItem('ayesha_ca125_history_v1') || '';
    const hrd = localStorage.getItem('ayesha_hrd_v1') || '';
    const rss = localStorage.getItem('ayesha_rss_inputs_v1') || '';
    // Written by useBiomarkerUpdate on every successful PATCH — busts the bundle cache
    const biomarkerTs = localStorage.getItem('ayesha_biomarker_updated_at') || '';
    const blob = `${ca}\n${hrd}\n${rss}\n${biomarkerTs}`;
    let h = 5381;
    for (let i = 0; i < blob.length; i += 1) {
      h = ((h << 5) + h) ^ blob.charCodeAt(i);
    }
    return `${blob.length}:${h >>> 0}`;
  } catch {
    return '0';
  }
}

export function storageKeyForBundle(storagePrefix, queryKeyPayload) {
  const fp = fingerprintLocalInputs();
  return `${storagePrefix}${fp}:${JSON.stringify(queryKeyPayload)}`;
}

export function readPersistedBundle(key, maxAgeMs = AYESHA_BUNDLE_SESSION_MAX_AGE_MS) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const t = typeof parsed.t === 'number' ? parsed.t : 0;
    if (!parsed.data || Date.now() - t > maxAgeMs) return null;
    return { data: parsed.data, updatedAt: t };
  } catch {
    return null;
  }
}

export function writePersistedBundle(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data }));
  } catch {
    // quota / private mode
  }
}
