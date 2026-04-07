export function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

export function safeObj(v) {
  return v && typeof v === 'object' ? v : {};
}

export function pct(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return `${Math.round(v * 100)}%`;
}

export function prettyJson(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export const SL_DEBUG =
  typeof import.meta !== 'undefined' &&
  (import.meta.env?.DEV === true ||
    import.meta.env?.VITE_THERAPY_FIT_SL_DEBUG === 'true' ||
    import.meta.env?.VITE_THERAPY_FIT_SL_DEBUG === '1');

export const SL_ACCORDION_OUTLINED_SX = {
  mb: 1.5,
  '&:before': { display: 'none' },
  boxShadow: 'none',
  border: '1px solid #e2e8f0',
  borderRadius: '12px !important',
};
