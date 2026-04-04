/**
 * Signal Definitions — 8 Kill Chain Signal metadata
 * ===================================================
 * Metadata for each of the 8 Kill Chain signals.
 * Separated from evaluators for maintainability.
 *
 * Sources:
 *   models.py  L55-101  — signal constants
 *   models.py  L67-70   — detection thresholds
 *
 * Authored: 2026-03-04 (ENGINE_LIGHT_DASHBOARD.mdc §3)
 *
 * Updated: 2026-03-05 (Sprint 5 — added `slug` field for test-page navigation)
 *   slug → used by IntakeRiskWarning CTA and any signal → test page link.
 *   Format: kebab-case, matches clinicalTestRegistry entries.
 */

// ── Engine Light States ──────────────────────────────────────────────────────
export const LIGHT_STATES = {
    NO_DATA: { key: 'NO_DATA', color: '#94a3b8', label: 'No Data', emoji: '⚫' },
    BASELINE_NOTED: { key: 'BASELINE_NOTED', color: '#2563eb', label: 'Baseline', emoji: '🔵' },
    MONITORING: { key: 'MONITORING', color: '#d97706', label: 'Watching', emoji: '🟡' },
    FIRED: { key: 'FIRED', color: '#dc2626', label: 'Alert', emoji: '🔴' },
    CLEAR: { key: 'CLEAR', color: '#16a34a', label: 'Clear', emoji: '🟢' },
};

// ── Signal Definitions (from models.py L55-101) ──────────────────────────────
export const SIGNAL_DEFINITIONS = {
    CA125_RISING: {
        id: 'CA125_RISING',
        slug: 'ca-125',                          // → /ayesha/tests/ca-125
        name: 'CA-125 Rising',
        shortName: 'CA-125',
        type: 'ACTIVE',
        triggerCondition: '3 consecutive strictly-rising values',
        plainLanguage: 'Your CA-125 tumor marker is tracked over time. Three consecutive rises triggers this alert — it may indicate the cancer is growing or becoming resistant to treatment.',
        testRequired: 'CA-125 serial blood draws',
        dataPath: 'labs.ca125_values',
        icon: '📈',
    },
    HRD_SHIFT: {
        id: 'HRD_SHIFT',
        slug: 'hrd',                             // → /ayesha/tests/hrd
        name: 'HRD Score Shift',
        shortName: 'HRD',
        type: 'ACTIVE',
        triggerCondition: 'HRD score drops >10 points from baseline',
        plainLanguage: 'Your tumor\'s DNA repair "scar" score is monitored. A significant drop means the repair machinery may be changing, which can affect how well certain drugs work.',
        testRequired: 'HRD scoring (Myriad myChoice or equivalent)',
        dataPath: 'tumor_context.hrd_score',
        threshold: 10.0,
        icon: '🧬',
    },
    REPAIR_SHIFT: {
        id: 'REPAIR_SHIFT',
        slug: 'rad51',                           // → /ayesha/tests/rad51
        name: 'Repair Capacity Shift',
        shortName: 'Repair',
        type: 'ACTIVE',
        triggerCondition: 'Repair capacity changes >0.2 from baseline',
        plainLanguage: 'This measures whether your tumor is learning to repair its DNA again. If repair capacity increases, drugs that work by damaging tumor DNA may become less effective.',
        testRequired: 'RAD51 foci / functional HR assay',
        dataPath: null,
        threshold: 0.2,
        icon: '🔧',
    },
    CTDNA_MRD: {
        id: 'CTDNA_MRD',
        slug: 'ctdna',                           // → /ayesha/tests/ctdna
        name: 'ctDNA / MRD',
        shortName: 'ctDNA',
        type: 'ACTIVE',
        triggerCondition: 'ctDNA detected or rising tier/trend',
        plainLanguage: 'Tiny fragments of tumor DNA floating in your blood are tracked. Rising levels can flag cancer comeback months before scans show it.',
        testRequired: 'ctDNA liquid biopsy (Guardant / Foundation)',
        dataPath: null,
        icon: '💧',
    },
    NRF2_ACTIVATION: {
        id: 'NRF2_ACTIVATION',
        slug: 'somatic-ngs',                     // → /ayesha/tests/somatic-ngs
        name: 'NRF2 Activation',
        shortName: 'NRF2',
        type: 'ACTIVE',
        triggerCondition: 'KEAP1/CUL3/RBX1 inactivating mutation detected',
        plainLanguage: 'The NRF2 pathway is like a shield that tumors can activate to pump drugs out. When the genes controlling this shield (KEAP1, CUL3, RBX1) break, the tumor becomes harder to treat with platinum and PARP drugs.',
        testRequired: 'Somatic NGS panel',
        geneSet: ['KEAP1', 'CUL3', 'RBX1'],
        dataPath: 'tumor_context.somatic_mutations',
        icon: '🛡️',
    },
    SLC31A1_LOSS: {
        id: 'SLC31A1_LOSS',
        slug: 'rna-seq',                         // → /ayesha/tests/rna-seq
        name: 'SLC31A1 (CTR1) Loss',
        shortName: 'SLC31A1',
        type: 'ACTIVE',
        triggerCondition: 'log2FC < -1.5 (loss of expression)',
        plainLanguage: 'SLC31A1 is the doorway that lets platinum drugs enter cancer cells. When the door closes (gene is silenced), platinum can\'t get in and stops working.',
        testRequired: 'Bulk RNA-seq',
        dataPath: null,
        threshold: -1.5,
        icon: '🚪',
    },
    HRD_BASELINE: {
        id: 'HRD_BASELINE',
        slug: 'hrd',                             // → /ayesha/tests/hrd
        name: 'HRD Baseline',
        shortName: 'HRD-BL',
        type: 'BASELINE',
        triggerCondition: 'HRD_sum < 42 at intake',
        plainLanguage: 'At diagnosis, your tumor\'s DNA repair scar score was checked. A score below 42 means the tumor can repair its own DNA well — which predicts PARP inhibitors may not work as effectively.',
        testRequired: 'HRD scoring (once at intake)',
        dataPath: 'tumor_context.hrd_score',
        threshold: 42,
        icon: '📋',
    },
    SLFN11_PRIOR: {
        id: 'SLFN11_PRIOR',
        slug: 'methylation',                     // → /ayesha/tests/methylation
        name: 'SLFN11 Silencing',
        shortName: 'SLFN11',
        type: 'BASELINE',
        triggerCondition: 'Methylation β > 0.5 or population prior applied',
        plainLanguage: 'SLFN11 normally helps drugs kill cancer cells by blocking DNA repair. When this gene is silenced (~34% of ovarian patients), both platinum and PARP drugs become less effective at the same time.',
        testRequired: 'HM450K / EPIC methylation array',
        dataPath: null,
        populationRate: 0.336,
        icon: '🔇',
    },
};
