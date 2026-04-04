/**
 * profileUtils.js — Pure utility functions for Phase1Profile
 *
 * Extracted from the monolith to keep the orchestrator lean.
 * All functions are pure (no hooks, no side effects).
 */
import { SIGNAL_DEFINITIONS } from '../../../constants/kill-chain/signalDefinitions';

// ── Signal → test slug mapping ──────────────────────────────────────────────
export const SIGNAL_TEST_SLUG = {
    REPAIR_SHIFT: 'hr_proficiency',
    CTDNA_MRD: 'ctdna_mrd',
    SLC31A1_LOSS: 'rnaseq_expression',
    SLFN11_PRIOR: 'slfn11_methylation',
};

// ── Histology display map ───────────────────────────────────────────────────
const HISTOLOGY_DISPLAY = {
    high_grade_serous_carcinoma: 'High-Grade Serous Carcinoma',
    low_grade_serous_carcinoma: 'Low-Grade Serous Carcinoma',
    endometrioid_carcinoma: 'Endometrioid Carcinoma',
    clear_cell_carcinoma: 'Clear Cell Carcinoma',
    mucinous_carcinoma: 'Mucinous Carcinoma',
};

export function formatHistology(raw) {
    if (!raw) return '';
    return HISTOLOGY_DISPLAY[raw] || raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Translate unlocks to plain language ──────────────────────────────────────
const UNLOCK_TRANSLATIONS = {
    'CA125_RISING temporal signal': 'CA-125 trend tracking',
    'HRD_SHIFT signal': 'HRD status tracking',
    'HRD_BASELINE signal': 'HRD baseline measurement',
    'CTDNA_MRD signal': 'Circulating tumor DNA monitoring',
    'REPAIR_SHIFT signal': 'DNA repair capacity tracking',
    'SLC31A1_LOSS signal': 'Platinum transporter expression',
    'SLFN11_PRIOR signal': 'Topoisomerase inhibitor sensitivity',
};

export function translateUnlocks(raw) {
    if (!raw) return raw;
    let result = raw;
    Object.entries(UNLOCK_TRANSLATIONS).forEach(([key, value]) => {
        result = result.replace(key, value);
    });
    // Replace remaining ALL_CAPS_SNAKE patterns
    result = result.replace(/([A-Z]{2,}_[A-Z_]+)/g, match =>
        match.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );
    return result;
}

// ── Arsenal count helper ────────────────────────────────────────────────────
export function computeArsenalCounts(drugs) {
    if (!drugs?.length) return { total: 0, approved: 0, repurposed: 0 };
    return {
        total: drugs.length,
        approved: drugs.filter(d => d.regulatory_status === 'FDA Approved').length,
        repurposed: drugs.filter(d => d.regulatory_status !== 'FDA Approved').length,
    };
}

// ── Missing fields calculator ───────────────────────────────────────────────
export function computeMissingFields(profile) {
    if (!profile) return [];
    const tc = profile.tumor_context || {};
    const fields = [];
    if (!tc.hrd_score) fields.push('HRD');
    if (!tc.tmb) fields.push('TMB');
    if (!profile.labs?.ca125_value) fields.push('CA-125');
    return fields;
}

// ── Format biomarker chips ─────────────────────────────────────────────────
const CHIP_PRIORITY = {
    'BRCA1': 1, 'BRCA2': 1, 'HRD': 1,
    'TP53': 2, 'MBD4': 2,
    'TMB': 3, 'PD-L1': 3, 'MSI': 3,
};

export function formatBiomarkerChips(biomarkerChips = []) {
    return biomarkerChips
        .map(chip => ({
            ...chip,
            priority: CHIP_PRIORITY[chip.gene || chip.label?.split(' ')[0]] || 99,
        }))
        .sort((a, b) => a.priority - b.priority);
}

// ── Build signal dots ───────────────────────────────────────────────────────
export function buildSignalDots(signals) {
    if (!signals) return [];
    return Object.entries(signals).map(([id, val]) => ({ id, state: val?.state || 'NO_DATA' }));
}

// ── Build signal rows for engine lights ─────────────────────────────────────
export function buildSignalRows(signals) {
    if (!signals) return [];
    return Object.entries(SIGNAL_DEFINITIONS).map(([id, def]) => {
        const sig = signals[id];
        return {
            id,
            name: def.name || id,
            shortName: def.shortName || def.name || id,
            state: sig?.state || 'NO_DATA',
            fired: sig?.fired || false,
            detail: sig?.detail || null,
            testSlug: SIGNAL_TEST_SLUG[id] || null,
        };
    });
}

// ── Split actions into clinical / data ──────────────────────────────────────
export function splitActions(actions) {
    if (!actions?.length) return { clinical: [], data: [] };
    const clinical = [];
    const data = [];
    actions.forEach(a => {
        const mapped = {
            ...a,
            unlocks: translateUnlocks(a.unlocks),
        };
        if (a.type === 'clinical' || a.label?.includes('Refer') || a.label?.includes('Consult')) {
            clinical.push(mapped);
        } else {
            data.push(mapped);
        }
    });
    return { clinical, data };
}

// ── Build journey cards ─────────────────────────────────────────────────────
export function buildJourneyCards(summary, arsenalCounts) {
    return [
        {
            key: 'tests',
            icon: '🧪',
            title: 'Tests & Gaps',
            desc: `${summary?.covered_genes || 0} of ${summary?.total_genes || 26} genes covered`,
            route: '/ayesha/journey/tests',
            cta: 'View tests',
        },
        {
            key: 'monitoring',
            icon: '📡',
            title: 'Monitoring',
            desc: summary?.state_estimate === 'RESISTANCE_DETECTED'
                ? 'Resistance signal detected'
                : `${summary?.active_signals || 0} active signal(s)`,
            route: '/ayesha/journey/monitoring',
            cta: 'View signals',
        },
        {
            key: 'treatment',
            icon: '💊',
            title: 'Treatment Fit',
            desc: `${arsenalCounts.total} drug candidates ranked`,
            route: '/ayesha/journey/treatment',
            cta: 'View rankings',
        },
        {
            key: 'trials',
            icon: '🏥',
            title: 'Clinical Trials',
            desc: 'Pathway-aligned trial matching',
            route: '/ayesha/trials-full',
            cta: 'Search trials',
        },
        {
            key: 'resistance',
            icon: '🛡️',
            title: 'Resistance',
            desc: `${summary?.covered_genes || 0}/${summary?.total_genes || 26} gene coverage`,
            route: '/ayesha/journey/resistance',
            cta: 'View resistance',
        },
    ];
}

// ── Compute signal counts ───────────────────────────────────────────────────
export function computeSignalCounts(signals) {
    if (!signals) return { total: 0, active: 0, clear: 0, noData: 0 };
    const dots = buildSignalDots(signals);
    return {
        total: dots.length,
        active: dots.filter(d => d.state === 'FIRED' || d.state === 'MONITORING').length,
        clear: dots.filter(d => d.state === 'CLEAR').length,
        noData: dots.filter(d => d.state === 'NO_DATA').length,
    };
}

// ── Format timestamp ────────────────────────────────────────────────────────
export function formatTimestamp(ts) {
    if (!ts) return '';
    try {
        return new Date(ts).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    } catch { return ''; }
}

// ── Primary Directive Logic ─────────────────────────────────────────────────
export function getPrimaryDirective(slResult, resistanceAlert, trialCount, socRecommendation, profile) {
    // 1. Resistance detected → highest priority
    if (resistanceAlert?.alert_triggered) {
        return {
            headline: 'RESISTANCE DETECTED',
            subheadline: resistanceAlert.message || 'Treatment resistance signal detected',
            reasoning: [
                'Genomic or kinetic resistance signal detected',
                'Immediate regimen re-evaluation recommended',
                'Trial re-ranking triggered',
            ],
            receipts: {
                level: 'L3',
                inputs: ['ctDNA Trend', 'Kill Chain Signals', 'Genomic Profiling'],
                missing: [],
            },
            actionLabel: 'VIEW RESISTANCE LAB',
            actionRoute: '/ayesha/journey/resistance',
            color: 'error',
        };
    }

    // 2. Synthetic lethality detected
    if (slResult?.synthetic_lethality_detected) {
        return {
            headline: 'EXPLOIT SYNTHETIC LETHALITY',
            subheadline: slResult.double_hit_description || 'Mechanistic vulnerability detected',
            reasoning: [
                'Double-hit pattern detected in tumor genome',
                'PARP inhibitor sensitivity predicted',
                'Pathway-level drug optimization available',
            ],
            receipts: {
                level: 'L3',
                inputs: ['NGS Panel', 'Germline Testing', 'Pathway Analysis'],
                missing: [],
            },
            actionLabel: 'VIEW DIGITAL TWIN',
            actionRoute: '/ayesha-digital-twin',
            color: 'secondary',
        };
    }

    // 3. SOC available
    if (socRecommendation) {
        return {
            headline: 'FOLLOW STANDARD OF CARE',
            subheadline: socRecommendation.regimen || 'NCCN-aligned first-line therapy',
            reasoning: [
                'Standard of care regimen identified',
                `Evidence level: ${socRecommendation.evidence_level || 'Category 1'}`,
                trialCount > 0 ? `${trialCount} clinical trial alternatives available` : 'No clinical trials matched',
            ],
            receipts: {
                level: 'L1',
                inputs: ['Stage', 'Histology', 'Biomarkers'],
                missing: profile?.tumor_context?.hrd_score ? [] : ['HRD Score'],
            },
            actionLabel: 'VIEW THERAPY FIT',
            actionRoute: '/ayesha/therapy-fit',
            color: 'primary',
        };
    }

    // 4. Default
    return {
        headline: 'COMPLETE DATA COLLECTION',
        subheadline: 'Additional tests needed for treatment ranking',
        reasoning: [
            'Insufficient data for confident treatment recommendation',
            'Key biomarkers missing for pathway analysis',
        ],
        receipts: {
            level: 'L0',
            inputs: ['Clinical History'],
            missing: ['NGS Panel', 'HRD Score', 'TMB'],
        },
        actionLabel: 'VIEW TESTS',
        actionRoute: '/ayesha/journey/tests',
        color: 'default',
    };
}

// ── State label map ─────────────────────────────────────────────────────────
export const STATE_LABELS = {
    BASELINE: 'Baseline — Monitoring',
    MONITORING: 'Monitoring — Watching',
    RESISTANCE_DETECTED: 'Resistance Detected',
};
