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

const RENDER_BACKEND = 'https://crispro-backend-v2.onrender.com';
const RENDER_WS = 'wss://crispro-backend-v2.onrender.com';

export const API_ROOT = import.meta.env.VITE_API_ROOT || RENDER_BACKEND;
export const WS_ROOT = import.meta.env.VITE_WS_ROOT || RENDER_WS;

export default API_ROOT;
