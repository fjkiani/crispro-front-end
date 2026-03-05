/**
 * arsenalTokens.js — Central design system for the Repurposing Arsenal UI.
 *
 * SINGLE SOURCE OF TRUTH for colors, radii, spacing, typography, shadows.
 * Every Arsenal component imports from here. No inline hex codes anywhere else.
 *
 * Also exports shared helper functions: verdictMeta, marsMeta, gapColor.
 */

// ── Colors ───────────────────────────────────────────────────────────────────
export const colors = {
    pass: '#059669',
    cond: '#d97706',
    fail: '#dc2626',
    blue: '#0284c7',
    accent: '#6366f1',
    muted: '#64748b',
    text: '#0f172a',
    textSec: '#334155',
    textTer: '#475569',
    caption: '#94a3b8',
    bg: '#f8fafc',
    bgCard: '#ffffff',
    bgMuted: '#fafafa',
    bgSubtle: '#f1f5f9',
    border: '#e2e8f0',
    borderMuted: '#e5e7eb',
    // Semantic
    warning: '#92400e',
    warningBg: '#fef3c7',
    warningBorder: '#fde68a',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
    errorText: '#b91c1c',
    successBg: '#f0fdf4',
    successBorder: '#bbf7d0',
    successText: '#166534',
    infoBg: '#f0f9ff',
    infoBorder: '#bae6fd',
    infoText: '#0369a1',
    chipBg: '#eef2ff',
    chipColor: '#4338ca',
    chipBorder: '#c7d2fe',
};

// ── Border Radii ─────────────────────────────────────────────────────────────
export const radii = {
    card: '18px',
    section: '16px',
    inner: '12px',
    chip: '24px',
    badge: '6px',
    gauge: '4px',
    gaugeLg: '6px',
    pill: '8px',
    small: '5px',
};

// ── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
    cardPad: '1.5rem',
    sectionPad: '1.5rem',
    chipGap: '0.35rem',
    chipGapLg: '0.4rem',
    sectionGap: '1.25rem',
    cardGap: '0.75rem',
    pageMax: '1400px',
    detailMax: '900px',
};

// ── Typography ───────────────────────────────────────────────────────────────
export const typography = {
    drugName: { fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 },
    drugNameLg: { fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em' },
    gapNumber: { fontSize: '1.8rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 },
    gapNumberLg: { fontSize: '3rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 },
    sectionTitle: { fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' },
    sectionLabel: { fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' },
    label: { fontSize: '0.72rem', fontWeight: 600 },
    body: { fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.5 },
    bodyLg: { fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.6 },
    caption: { fontSize: '0.78rem', fontWeight: 500, lineHeight: 1.3 },
    captionSm: { fontSize: '0.7rem', fontWeight: 600 },
    chip: { fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace' },
    chipLg: { fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace' },
    verdictBadge: { fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' },
    verdictBadgeLg: { fontSize: '0.82rem', fontWeight: 800 },
    pkValue: { fontSize: '1.3rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' },
    provenance: { fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
};

// ── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
    card: '0 1px 3px rgba(0,0,0,0.04)',
    cardHover: '0 15px 45px rgba(0,0,0,0.08)',
    section: '0 1px 3px rgba(0,0,0,0.03)',
};

// ── Transitions ──────────────────────────────────────────────────────────────
export const transitions = {
    card: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    gauge: 'width 0.6s ease',
    gaugePos: 'left 0.6s ease',
    disclosure: 'transform 0.15s',
};

// ── Shared Helpers ───────────────────────────────────────────────────────────

/** Verdict code → patient-friendly label, color, icon, and description. */
export const verdictMeta = (v) => {
    if (!v) return { label: 'Unknown', color: colors.muted, icon: '?', patientLabel: 'Unknown', sub: '' };
    const map = {
        PASS: { label: 'VIABLE', color: colors.pass, icon: '✓', patientLabel: 'Viable', sub: 'Drug reaches cancer cells at safe doses' },
        CONDITIONAL_PASS: { label: 'INVESTIGATE', color: colors.cond, icon: '⚡', patientLabel: 'Worth Investigating', sub: 'Possible with formulation or dose adjustment' },
        FAIL_EXPOSURE_MISMATCH: { label: 'NOT VIABLE', color: colors.fail, icon: '✕', patientLabel: 'Not Viable', sub: 'Cannot reach effective concentration safely' },
        INSUFFICIENT_DATA: { label: 'NO DATA', color: colors.muted, icon: '—', patientLabel: 'Insufficient Data', sub: 'Insufficient pharmacokinetic data' },
    };
    return map[v] || { label: v, color: colors.muted, icon: '?', patientLabel: v, sub: '' };
};

/** Mars verdict code → human label + accent color. */
export const marsMeta = (mv) => {
    const map = {
        SABOTAGED_BY_DESIGN: { label: 'Sabotaged by Design', color: '#e11d48' },
        DELIVERY_FAILURE: { label: 'Delivery Failure', color: '#ea580c' },
        MISSING_CATALYST: { label: 'Missing Catalyst', color: '#ea580c' },
        FORMULATION_FAILURE: { label: 'Formulation Failure', color: '#ea580c' },
        EXPOSURE_IMPOSSIBLE: { label: 'Exposure Impossible', color: '#dc2626' },
        UNDERPOWERED_WRONG_PARTNER: { label: 'Underpowered + Wrong Partner', color: '#d97706' },
    };
    return map[mv] || { label: mv?.replace(/_/g, ' ') || 'Unknown', color: colors.muted };
};

/** Gap ratio → appropriate color from the design system. */
export const gapColor = (gap) => {
    if (gap == null) return colors.muted;
    if (gap < 5) return colors.pass;
    if (gap < 50) return colors.cond;
    return colors.fail;
};

/** Gap ratio → log-scale percentage for gauge rendering. */
export const gapToPercent = (gap) => {
    const logMin = Math.log10(0.01);
    const logMax = Math.log10(1000);
    return Math.max(0, Math.min(100,
        ((Math.log10(Math.max(gap, 0.01)) - logMin) / (logMax - logMin)) * 100
    ));
};

/** Threshold line positions on log scale. */
export const THRESHOLD_5X = gapToPercent(5);
export const THRESHOLD_50X = gapToPercent(50);
