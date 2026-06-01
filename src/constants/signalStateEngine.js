/**
 * Signal State Engine — Deterministic Frontend Kill Chain Evaluator
 * ==================================================================
 * MODULAR: signal definitions and gene maps live in kill-chain/ subdirectory.
 * This file handles evaluation logic only, re-exporting constants for consumers.
 *
 * Sources:
 *   models.py  L55-101  — 8 signal constants, BASELINE/ACTIVE frozensets
 *   models.py  L67-70   — detection thresholds
 *   vectors.py L131-174 — GENE_TO_RESISTANCE_CLASS (26 genes)
 *   policy.py  L574-633 — 2-of-N detection rules
 *
 * Authored: 2026-03-04 | Modularized: 2026-03-04
 * Doctrine: ENGINE_LIGHT_DASHBOARD.mdc
 */

// Re-export from modular files for backward compatibility
export { LIGHT_STATES, SIGNAL_DEFINITIONS } from './kill-chain/signalDefinitions';
export { GENE_COVERAGE_MAP, GENE_DISPLAY_ORDER } from './kill-chain/geneCoverageMap';

// Import for internal use
import { LIGHT_STATES, SIGNAL_DEFINITIONS } from './kill-chain/signalDefinitions';
import { GENE_COVERAGE_MAP, GENE_DISPLAY_ORDER } from './kill-chain/geneCoverageMap';

// ── Signal Evaluators ────────────────────────────────────────────────────────

function evaluateCA125(profile) {
    const ca125Values = profile?.labs?.ca125_values;
    const singleValue = profile?.labs?.ca125_value;

    if (!ca125Values && !singleValue) {
        return { state: LIGHT_STATES.NO_DATA, reason: 'No CA-125 data loaded' };
    }

    if (!ca125Values || ca125Values.length < 3) {
        return {
            state: LIGHT_STATES.MONITORING, reason: singleValue
                ? `Single value: ${singleValue} U/mL — need serial draws for trend`
                : `Only ${(ca125Values || []).length} values — need ≥3 for trend detection`
        };
    }

    const last3 = ca125Values.slice(-3);
    const isRising = last3[0] < last3[1] && last3[1] < last3[2];

    if (isRising) {
        return { state: LIGHT_STATES.FIRED, reason: `3 consecutive rises: ${last3.join(' → ')} U/mL` };
    }
    return { state: LIGHT_STATES.CLEAR, reason: 'CA-125 trend stable or falling' };
}

function evaluateHRDShift(profile) {
    const hrdScore = profile?.tumor_context?.hrd_score;
    if (hrdScore == null) {
        return { state: LIGHT_STATES.NO_DATA, reason: 'HRD score not available' };
    }
    return { state: LIGHT_STATES.MONITORING, reason: `HRD score: ${hrdScore} — need paired measurement for shift detection` };
}

function evaluateHRDBaseline(profile) {
    const hrdScore = profile?.tumor_context?.hrd_score;
    if (hrdScore == null) {
        return { state: LIGHT_STATES.NO_DATA, reason: 'HRD score not available — test not ordered' };
    }
    if (hrdScore < 42) {
        // GAP-13 FIX: HRD < 42 means HR-proficient; don't frame as PARPi-specific.
        return { state: LIGHT_STATES.BASELINE_NOTED, reason: `HRD score ${hrdScore} < 42 — HR-proficient. HR pathway likely intact; DDR-targeted therapy benefit uncertain.` };
    }
    // GAP-13 FIX: HRD-high implies HR deficiency broadly — not just PARPi eligibility.
    return { state: LIGHT_STATES.CLEAR, reason: `HRD score ${hrdScore} ≥ 42 — HRD-positive. HR deficiency confirmed; DDR-targeted therapy (PARPi, platinum) may be indicated.` };
}

function evaluateRepairShift() {
    return { state: LIGHT_STATES.NO_DATA, reason: 'Repair capacity assay not available — rarely tested in standard care' };
}

function evaluateCTDNA() {
    return { state: LIGHT_STATES.NO_DATA, reason: 'ctDNA / MRD not tested — liquid biopsy not ordered' };
}

function evaluateNRF2(profile) {
    const somaticMuts = profile?.tumor_context?.somatic_mutations || [];
    if (somaticMuts.length === 0) {
        return { state: LIGHT_STATES.NO_DATA, reason: 'No somatic NGS panel — NRF2 genes unchecked' };
    }

    const nrf2Genes = ['KEAP1', 'CUL3', 'RBX1'];
    const hits = somaticMuts.filter(m => nrf2Genes.includes(m.gene?.toUpperCase()));

    if (hits.length > 0) {
        const geneNames = hits.map(h => h.gene).join(', ');
        return { state: LIGHT_STATES.FIRED, reason: `NRF2 pathway disrupted: ${geneNames} mutation(s) detected` };
    }
    return { state: LIGHT_STATES.CLEAR, reason: 'NRF2 pathway genes intact (KEAP1, CUL3, RBX1 — no mutations)' };
}

function evaluateSLC31A1() {
    return { state: LIGHT_STATES.NO_DATA, reason: 'SLC31A1 expression not measured — requires RNA-seq' };
}

function evaluateSLFN11() {
    return { state: LIGHT_STATES.NO_DATA, reason: 'SLFN11 methylation not tested — requires HM450K/EPIC array' };
}

const SIGNAL_EVALUATORS = {
    CA125_RISING: evaluateCA125,
    HRD_SHIFT: evaluateHRDShift,
    REPAIR_SHIFT: evaluateRepairShift,
    CTDNA_MRD: evaluateCTDNA,
    NRF2_ACTIVATION: evaluateNRF2,
    SLC31A1_LOSS: evaluateSLC31A1,
    HRD_BASELINE: evaluateHRDBaseline,
    SLFN11_PRIOR: evaluateSLFN11,
};

// ── Public API ───────────────────────────────────────────────────────────────

export function evaluateAllSignals(profile) {
    const results = {};
    Object.entries(SIGNAL_EVALUATORS).forEach(([signalId, evaluator]) => {
        const result = evaluator(profile);
        results[signalId] = {
            ...SIGNAL_DEFINITIONS[signalId],
            ...result,
        };
    });
    return results;
}

export function evaluateGeneCoverage(profile) {
    const coverage = {};
    const germlineMuts = profile?.germline?.mutations || [];
    const somaticMuts = profile?.tumor_context?.somatic_mutations || [];
    const germlinePanel = profile?.germline?.panel;

    GENE_DISPLAY_ORDER.forEach(gene => {
        coverage[gene] = { covered: false, source: null, result: null, classification: null };
    });

    germlineMuts.forEach(mut => {
        const gene = mut.gene?.toUpperCase();
        if (coverage[gene] !== undefined) {
            coverage[gene] = {
                covered: true,
                source: 'germline',
                result: mut.classification || 'detected',
                classification: mut.classification,
            };
        }
    });

    if (germlinePanel) {
        ['BRCA1', 'BRCA2', 'RAD51C', 'RAD51D', 'PALB2'].forEach(gene => {
            if (!coverage[gene].covered) {
                coverage[gene] = {
                    covered: true,
                    source: 'germline_panel_negative',
                    result: 'negative',
                    classification: 'negative',
                };
            }
        });
    }

    somaticMuts.forEach(mut => {
        const gene = mut.gene?.toUpperCase();
        if (coverage[gene] !== undefined) {
            coverage[gene] = {
                covered: true,
                source: 'somatic',
                result: mut.consequence || 'detected',
                classification: mut.classification || 'somatic',
            };
        }
    });

    return coverage;
}

export function computeSummary(signals, geneCoverage) {
    const signalEntries = Object.values(signals);
    const geneEntries = Object.values(geneCoverage);

    const fired = signalEntries.filter(s => s.state?.key === 'FIRED').length;
    const monitoring = signalEntries.filter(s => s.state?.key === 'MONITORING').length;
    const noData = signalEntries.filter(s => s.state?.key === 'NO_DATA').length;
    const baselineNoted = signalEntries.filter(s => s.state?.key === 'BASELINE_NOTED').length;
    const clear = signalEntries.filter(s => s.state?.key === 'CLEAR').length;

    const coveredGenes = geneEntries.filter(g => g.covered).length;
    const totalGenes = geneEntries.length;

    const activeSignalsFired = signalEntries.filter(
        s => s.state?.key === 'FIRED' && s.type === 'ACTIVE'
    ).length;

    let stateEstimate = 'BASELINE';
    let confidence = null;
    let intakeRisk = false;

    if (fired >= 2 && activeSignalsFired >= 1) {
        stateEstimate = 'RESISTANCE_DETECTED';
        confidence = 'HIGH';
    } else if ((fired + baselineNoted) >= 2 && activeSignalsFired === 0) {
        stateEstimate = 'MONITORING';
        intakeRisk = true;
        confidence = 'INTAKE_RISK';
    } else if (fired === 1 || baselineNoted === 1) {
        stateEstimate = 'MONITORING';
        confidence = 'WATCH';
    }

    return {
        total_signals: 8,
        fired,
        monitoring,
        no_data: noData,
        baseline_noted: baselineNoted,
        clear,
        covered_genes: coveredGenes,
        total_genes: totalGenes,
        uncovered_genes: totalGenes - coveredGenes,
        state_estimate: stateEstimate,
        confidence,
        intake_risk: intakeRisk,
    };
}

export function generateActions(signals, geneCoverage) {
    const actions = [];

    const somaticUncovered = GENE_DISPLAY_ORDER.filter(g => {
        const entry = geneCoverage[g];
        const def = GENE_COVERAGE_MAP[g];
        return !entry?.covered && !['BRCA_REVERSION'].includes(def?.resistanceClass);
    });

    if (somaticUncovered.length > 5) {
        actions.push({
            priority: 'HIGH',
            label: 'Order somatic NGS panel',
            unlocks: `${somaticUncovered.length}/26 gene coverage`,
            genes: somaticUncovered,
            icon: '🧬',
        });
    }

    if (signals.CA125_RISING?.state?.key === 'NO_DATA') {
        actions.push({
            priority: 'HIGH',
            label: 'Start CA-125 serial monitoring',
            unlocks: 'CA125_RISING temporal signal',
            icon: '📈',
        });
    }

    if (signals.HRD_SHIFT?.state?.key === 'NO_DATA') {
        actions.push({
            priority: 'MEDIUM',
            label: 'Request HRD score',
            unlocks: 'HRD_SHIFT + HRD_BASELINE signals (2 signals)',
            icon: '🧬',
        });
    }

    if (signals.CTDNA_MRD?.state?.key === 'NO_DATA') {
        actions.push({
            priority: 'MEDIUM',
            label: 'Consider ctDNA baseline draw',
            unlocks: 'CTDNA_MRD molecular residual disease tracking',
            icon: '💧',
        });
    }

    if (signals.SLFN11_PRIOR?.state?.key === 'NO_DATA') {
        actions.push({
            priority: 'LOW',
            label: 'SLFN11 methylation testing',
            unlocks: 'Dual resistance prediction (platinum + PARP)',
            icon: '🔇',
        });
    }

    return actions;
}
