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
 * Production: set `VITE_API_ROOT` in `.env.production` / CI (e.g. Render URL).
 *
 * Usage:
 *   import { API_ROOT, WS_ROOT } from '@/lib/apiConfig';
 *   fetch(`${API_ROOT}/api/...`)
 */

const LOCAL_BACKEND = 'http://localhost:8000';
const LOCAL_WS = 'ws://localhost:8000';

const explicitApi = (import.meta.env.VITE_API_ROOT || '').trim();

/** True when explicit base is clearly “this machine” — still cross-origin vs 127.0.0.1:5174 if used as full URL. */
function isLoopbackApiUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * DEV: always same-origin `/api/*` via Vite proxy when unset OR when VITE_API_ROOT is
 * localhost/127.0.0.1 (common .env.local). That avoids CORS from 127.0.0.1:5174 → localhost:8000.
 * Use a non-loopback URL (e.g. staging) to call a remote API from dev.
 * PROD: VITE_API_ROOT or LOCAL_BACKEND fallback.
 */
export const API_ROOT = import.meta.env.DEV
  ? !explicitApi || isLoopbackApiUrl(explicitApi)
    ? ''
    : explicitApi
  : explicitApi || LOCAL_BACKEND;

export const WS_ROOT =
  (import.meta.env.VITE_WS_ROOT || '').trim() || LOCAL_WS;

export default API_ROOT;
