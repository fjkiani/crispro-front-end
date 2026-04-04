/**
 * Centralized API Configuration
 *
 * Single source of truth for the backend API and WebSocket URLs.
 * Production backend is hosted on Render; set VITE_API_ROOT / VITE_WS_ROOT
 * in .env or .env.production to override (e.g. for local dev use .env.development
 * with http://localhost:8000).
 *
 * Usage:
 *   import { API_ROOT, WS_ROOT } from '@/lib/apiConfig';
 *   fetch(`${API_ROOT}/api/...`)
 */

/** Fallback when VITE_* unset (e.g. fresh clone). Production builds must set env via .env.production / CI. */
const LOCAL_BACKEND = 'http://localhost:8000';
const LOCAL_WS = 'ws://localhost:8000';

export const API_ROOT = import.meta.env.VITE_API_ROOT || LOCAL_BACKEND;
export const WS_ROOT = import.meta.env.VITE_WS_ROOT || LOCAL_WS;

export default API_ROOT;
