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
 * Production: set `VITE_API_ROOT` in `.env.production` / CI (e.g. Railway URL).
 *
 * Usage:
 *   import { API_ROOT, WS_ROOT } from '@/lib/apiConfig';
 *   fetch(`${API_ROOT}/api/...`)
 */

const LOCAL_BACKEND = 'http://localhost:8000';
const LOCAL_WS = 'ws://localhost:8000';

// Production backend — Render deployment (crispro-backend-v2.onrender.com).
// Railway project b8b59448-403c-4b89-96f2-eede807ac867 was the original
// target but the generated domain returns 404 as of 2026-07-08. Update
// PRODUCTION_BACKEND back to the Railway URL once it is confirmed live.
const PRODUCTION_BACKEND = 'https://crispro-backend-v2.onrender.com';
const PRODUCTION_WS = 'https://crispro-backend-v2.onrender.com';

const _rawApi = (import.meta.env.VITE_API_ROOT || '').trim();
const _rawWs = (import.meta.env.VITE_WS_ROOT || '').trim();

/** Normalise a URL string: add https:// if protocol is missing. */
function normaliseUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (/^wss?:\/\//i.test(url)) return url;
  // bare hostname — add https://
  return `https://${url}`;
}

/** True when URL points at localhost / 127.0.0.1. */
function isLoopbackUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/** True when URL points at a known-dead backend (currently the Railway URL — see .env.production). */
function isStaleBackend(url) {
  return url.includes('crispro-backend-v2-production.up.railway.app');
}

const explicitApi = normaliseUrl(_rawApi);
const explicitWs = normaliseUrl(_rawWs);

/**
 * DEV: same-origin proxy when unset or loopback.
 * PROD: VITE_API_ROOT (normalised) unless it is stale/missing → PRODUCTION_BACKEND.
 */
export const API_ROOT = import.meta.env.DEV
  ? !explicitApi || isLoopbackUrl(explicitApi)
    ? ''
    : explicitApi
  : explicitApi && !isLoopbackUrl(explicitApi) && !isStaleBackend(explicitApi)
    ? explicitApi
    : PRODUCTION_BACKEND;

export const WS_ROOT =
  explicitWs && !isLoopbackUrl(explicitWs) && !isStaleBackend(explicitWs)
    ? explicitWs
    : import.meta.env.DEV
      ? LOCAL_WS
      : PRODUCTION_WS;

export default API_ROOT;
