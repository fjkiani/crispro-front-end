/**
 * Centralized API Configuration
 *
 * Single source of truth for the backend API and WebSocket URLs.
 *
 * Local backend without CORS friction:
 * - `vite.config.js` proxies `/api` → `http://localhost:8000`.
 * - In DEV, `API_ROOT` is `''` if `VITE_API_ROOT` is unset or points at
 *   `localhost` / `127.0.0.1` (so typical `.env.local` still uses the proxy).
 * - In DEV, set `VITE_API_ROOT` to a non-loopback URL to hit a remote API.
 *
 * Production:
 * - Prefer `VITE_API_ROOT` (REST). `VITE_WS_ROOT` is used for WebSockets and,
 *   when set, also backs REST if `VITE_API_ROOT` is missing or points at a
 *   retired Render host still present in some dashboards.
 *
 * Usage:
 *   import { API_ROOT, WS_ROOT } from '@/lib/apiConfig';
 *   fetch(`${API_ROOT}/api/...`)
 */

const LOCAL_BACKEND = 'http://localhost:8000';
const LOCAL_WS = 'ws://localhost:8000';

/** Live production backend (Railway). */
const DEFAULT_PRODUCTION_API =
  'https://crispro-backend-v2-production.up.railway.app';

/** Retired Render backends — may still be set in Render dashboard env. */
const DEPRECATED_BACKEND_HOSTS = new Set([
  'crispro-backend-v2.onrender.com',
  'crispro-backend-v2-1.onrender.com',
]);

function normalizeHttpRoot(raw) {
  const url = (raw || '').trim().replace(/\/$/, '');
  if (!url) return '';
  try {
    if (url.startsWith('ws://')) return `http://${new URL(url).host}`;
    if (url.startsWith('wss://')) return `https://${new URL(url).host}`;
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

function normalizeWsRoot(httpRoot, explicitWs) {
  const ws = (explicitWs || '').trim();
  if (ws) {
    try {
      if (ws.startsWith('ws://') || ws.startsWith('wss://')) {
        const u = new URL(ws);
        return `${u.protocol}//${u.host}`;
      }
      const http = normalizeHttpRoot(ws);
      if (!http) return LOCAL_WS;
      return http.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
    } catch {
      return ws;
    }
  }
  if (httpRoot) {
    return httpRoot.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
  }
  return LOCAL_WS;
}

/** True when explicit base is clearly “this machine”. */
function isLoopbackApiUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function isDeprecatedBackend(url) {
  if (!url) return false;
  try {
    return DEPRECATED_BACKEND_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

const explicitApi = normalizeHttpRoot(import.meta.env.VITE_API_ROOT);
const wsDerivedApi = normalizeHttpRoot(import.meta.env.VITE_WS_ROOT);
const legacyBackendApi = normalizeHttpRoot(import.meta.env.VITE_BACKEND_API_URL);

function resolveProductionApiRoot() {
  if (explicitApi && !isDeprecatedBackend(explicitApi)) {
    return explicitApi;
  }
  if (wsDerivedApi) {
    if (explicitApi && isDeprecatedBackend(explicitApi)) {
      console.warn(
        '[apiConfig] Ignoring deprecated VITE_API_ROOT; using VITE_WS_ROOT for API:',
        wsDerivedApi,
      );
    }
    return wsDerivedApi;
  }
  if (legacyBackendApi && !isDeprecatedBackend(legacyBackendApi)) {
    return legacyBackendApi;
  }
  if (explicitApi) {
    console.warn(
      '[apiConfig] VITE_API_ROOT points at a retired host; update Render env and redeploy.',
    );
    return explicitApi;
  }
  return DEFAULT_PRODUCTION_API;
}

/**
 * DEV: same-origin `/api/*` via Vite proxy when unset OR loopback URL.
 * PROD: resolved chain above (never localhost).
 */
export const API_ROOT = import.meta.env.DEV
  ? !explicitApi || isLoopbackApiUrl(explicitApi)
    ? ''
    : explicitApi
  : resolveProductionApiRoot();

export const WS_ROOT = normalizeWsRoot(API_ROOT, import.meta.env.VITE_WS_ROOT);

export default API_ROOT;
