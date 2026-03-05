/**
 * Phase 1 — Zeta Central Command (Orchestrator v7)
 *
 * Zero hardcoded patient data. Zero inline hex colors.
 * All data computed from hooks → formatted → passed as props.
 *
 * Components: CommandBanner, NextMovePanel, JourneyCards, SignalTeaser
 * Data: useAyeshaProfile(), useRepurposingArsenal(), useKillChainSignals()
 * Reuses: PFICategoryBadge, CA125EntryForm, HRDEntryForm
 */
import React, { useMemo } from 'react';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import { useAyeshaProfile } from '../../../hooks/ayesha/useAyeshaProfile';
import useRepurposingArsenal from '../../../hooks/ayesha/useRepurposingArsenal';
import { useKillChainSignals } from '../../../hooks/ayesha/useKillChainSignals';
import { useProfileEditor } from '../../../hooks/ayesha/useProfileEditor';
import { SIGNAL_DEFINITIONS } from '../../../constants/kill-chain/signalDefinitions';

import CommandBanner from '../../../components/ayesha/command-center/CommandBanner';
import NextMovePanel from '../../../components/ayesha/command-center/NextMovePanel';
import JourneyCards from '../../../components/ayesha/command-center/JourneyCards';
import SignalTeaser from '../../../components/ayesha/command-center/SignalTeaser';
import CA125EntryForm from '../../../components/ayesha/inputs/CA125EntryForm';
import HRDEntryForm from '../../../components/ayesha/inputs/HRDEntryForm';
import '../../../components/ayesha/command-center/commandCenter.css';

// ── Signal → test slug mapping ──────────────────────────────────────────────
const SIGNAL_TEST_SLUG = {
    REPAIR_SHIFT: 'hr_proficiency',
    CTDNA_MRD: 'ctdna_mrd',
    SLC31A1_LOSS: 'rnaseq_expression',
    SLFN11_PRIOR: 'slfn11_methylation',
};

// ── Arsenal count helper ────────────────────────────────────────────────────
function computeArsenalCounts(drugs) {
    if (!drugs?.length) return { total: 0, viable: 0, investigate: 0, quarantined: 0 };
    return {
        total: drugs.length,
        viable: drugs.filter(d => d.feasibility?.verdict === 'PASS' && d.kill_chain_action !== 'QUARANTINE').length,
        investigate: drugs.filter(d => d.feasibility?.verdict === 'CONDITIONAL_PASS' && d.kill_chain_action !== 'QUARANTINE').length,
        quarantined: drugs.filter(d => d.kill_chain_action === 'QUARANTINE' || d.score_floor === 0).length,
    };
}

// ── Missing fields calculator ───────────────────────────────────────────────
function computeMissingFields(profile) {
    const missing = [];
    if (!profile?.tumor_context?.hrd_score) missing.push('HRD');
    if (!profile?.tumor_context?.tmb) missing.push('TMB');
    if (!profile?.labs?.ca125_value) missing.push('CA-125');
    if (!profile?.tumor_context?.somatic_mutations?.length) missing.push('Somatic NGS');
    return missing;
}

// ── Format biomarker chips ──────────────────────────────────────────────────
function formatBiomarkerChips(biomarkerChips = []) {
    return biomarkerChips.map(chip => ({
        label: chip.label || chip,
        cssVar: chip.color === 'success' ? '--signal-clear' :
            chip.color === 'error' ? '--signal-fired' :
                chip.color === 'warning' ? '--signal-watching' :
                    '--zeta-slate',
    }));
}

// ── Build signal dots for CommandBanner ──────────────────────────────────────
function buildSignalDots(signals) {
    return Object.keys(SIGNAL_DEFINITIONS).map(id => ({
        name: SIGNAL_DEFINITIONS[id].name,
        state: signals[id]?.state?.key || 'NO_DATA',
    }));
}

// ── Build signal rows for SignalTeaser ───────────────────────────────────────
function buildSignalRows(signals) {
    return Object.keys(SIGNAL_DEFINITIONS).map(id => {
        const def = SIGNAL_DEFINITIONS[id];
        const sig = signals[id] || {};
        return {
            id,
            name: def.name,
            emoji: def.icon,
            state: sig.state?.key || 'NO_DATA',
            stateLabel: sig.state?.label || 'No Data',
            reason: sig.reason || `Needs ${def.testRequired}`,
            type: def.type,
            plainLanguage: def.plainLanguage,
            testRequired: def.testRequired,
            testSlug: SIGNAL_TEST_SLUG[id] || null,
            actionLabel: id === 'CA125_RISING' ? 'Log CA-125' :
                id === 'HRD_SHIFT' || id === 'HRD_BASELINE' ? 'Score HRD' : null,
        };
    });
}

// ── Split actions into clinical / data ──────────────────────────────────────
function splitActions(actions) {
    const clinical = [];
    const data = [];
    for (const a of actions) {
        const item = {
            icon: a.icon || '📋',
            label: a.label,
            reason: a.unlocks || '',
            priority: (a.priority || 'medium').toLowerCase(),
        };
        // Actions about ordering tests or data entry are "data" tier
        if (a.label?.includes('Order') || a.label?.includes('Request') ||
            a.label?.includes('Start') || a.label?.includes('Consider') ||
            a.label?.includes('methylation')) {
            data.push(item);
        } else {
            clinical.push(item);
        }
    }
    return { clinical, data };
}

// ── Build journey cards ─────────────────────────────────────────────────────
function buildJourneyCards(summary, arsenalCounts) {
    return [
        {
            icon: '🧪',
            label: 'Tests & Gaps',
            teaser: summary?.total_genes
                ? `${summary.covered_genes || 0} of ${summary.total_genes} genes covered`
                : 'Review recommended tests',
            cta: 'View tests',
            route: '/ayesha/journey/tests',
            accentVar: '--zeta-blue',
            bgVar: '--zeta-blue-light',
        },
        {
            icon: '💊',
            label: 'Treatment Options',
            teaser: arsenalCounts.total > 0
                ? `${arsenalCounts.viable} viable · ${arsenalCounts.investigate} investigate · ${arsenalCounts.quarantined} quarantined`
                : 'No repurposing candidates loaded',
            cta: 'View arsenal',
            route: '/ayesha/journey/treatment',
            accentVar: '--zeta-green',
            bgVar: '--zeta-green-light',
        },
        {
            icon: '📡',
            label: 'Monitoring',
            teaser: summary.fired > 0
                ? `${summary.fired} signal${summary.fired > 1 ? 's' : ''} fired — review required`
                : `${summary.no_data || 0} signals awaiting data`,
            cta: 'View dashboard',
            route: '/ayesha/journey/monitoring',
            accentVar: '--zeta-amber',
            bgVar: '--zeta-amber-light',
        },
        {
            icon: '🛡️',
            label: 'Resistance Plan',
            teaser: summary.state_estimate === 'RESISTANCE_DETECTED'
                ? 'Resistance detected — contingency plan active'
                : summary.state_estimate === 'MONITORING'
                    ? 'Monitoring — watching active signals'
                    : 'Baseline — no active resistance',
            cta: 'View plan',
            route: '/ayesha/journey/resistance',
            accentVar: '--zeta-red',
            bgVar: '--zeta-red-light',
        },
    ];
}

// ── Compute signal counts for SignalTeaser ───────────────────────────────────
function computeSignalCounts(signals) {
    const counts = { fired: 0, monitoring: 0, noData: 0, clear: 0, baseline: 0 };
    for (const id of Object.keys(SIGNAL_DEFINITIONS)) {
        const key = signals[id]?.state?.key || 'NO_DATA';
        if (key === 'FIRED') counts.fired++;
        else if (key === 'MONITORING') counts.monitoring++;
        else if (key === 'NO_DATA') counts.noData++;
        else if (key === 'CLEAR') counts.clear++;
        else if (key === 'BASELINE_NOTED') counts.baseline++;
    }
    return counts;
}

// ── Format timestamp ────────────────────────────────────────────────────────
function formatTimestamp(ts) {
    if (!ts) return null;
    try {
        return new Date(ts).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    } catch { return ts; }
}

// ══════════════════════════════════════════════════════════════════════════════
// Page Orchestrator
// ══════════════════════════════════════════════════════════════════════════════

export default function Phase1Profile() {
    const { profile, disease, tumorContext, germline, labs, biomarkerChips } = useAyeshaProfile();
    const { drugs } = useRepurposingArsenal();
    const { signals, summary, actions, geneCoverage } = useKillChainSignals();
    const { editState } = useProfileEditor();

    // ── Compute all props ────────────────────────────────────────────────
    const arsenalCounts = useMemo(() => computeArsenalCounts(drugs), [drugs]);
    const missingFields = useMemo(() => computeMissingFields(profile), [profile]);
    const signalDots = useMemo(() => buildSignalDots(signals), [signals]);
    const signalRows = useMemo(() => buildSignalRows(signals), [signals]);
    const signalCounts = useMemo(() => computeSignalCounts(signals), [signals]);
    const { clinical: clinicalActions, data: dataActions } = useMemo(() => splitActions(actions), [actions]);
    const journeyCards = useMemo(() => buildJourneyCards(summary, arsenalCounts), [summary, arsenalCounts]);
    const formattedChips = useMemo(() => formatBiomarkerChips(biomarkerChips), [biomarkerChips]);

    // PFI from profile editor (stored as months, convert to days for PFICategoryBadge)
    const pfiDays = editState?.pfi_months != null ? Math.round(editState.pfi_months * 30.44) : null;

    // ── Inline entry forms (passed to SignalTeaser + NextMovePanel) ───────
    const entryForms = {
        CA125_RISING: <CA125EntryForm />,
        HRD_SHIFT: <HRDEntryForm />,
        HRD_BASELINE: <HRDEntryForm />,
    };

    // Add entry forms to data actions where applicable
    const dataActionsWithForms = dataActions.map(a => {
        if (a.label?.includes('CA-125')) return { ...a, entryForm: <CA125EntryForm /> };
        if (a.label?.includes('HRD')) return { ...a, entryForm: <HRDEntryForm /> };
        return a;
    });

    return (
        <JourneyLayout>
            <div className="cc-page">
                <CommandBanner
                    identity={{
                        name: profile?.patient?.display_name,
                        age: profile?.patient?.demographics?.age,
                        histology: disease?.histology,
                    }}
                    disease={{
                        stage: editState?.stage || disease?.stage,
                        primarySite: disease?.primary_site,
                    }}
                    germline={{
                        gene: germline?.mutations?.[0]?.gene,
                        classification: germline?.mutations?.[0]?.classification,
                    }}
                    biomarkerChips={formattedChips}
                    stateEstimate={summary?.state_estimate || 'BASELINE'}
                    pfiDays={pfiDays}
                    signalDots={signalDots}
                    geneCoverage={{
                        covered: summary?.covered_genes || 0,
                        total: summary?.total_genes || 26,
                    }}
                    completeness={{
                        score: tumorContext?.completeness_score || 0,
                        missing: missingFields,
                    }}
                    timestamp={formatTimestamp(profile?.meta?.last_updated)}
                />

                <NextMovePanel
                    clinicalActions={clinicalActions}
                    dataActions={dataActionsWithForms}
                    defaultVisible={3}
                />

                <JourneyCards cards={journeyCards} />

                <SignalTeaser
                    signals={signalRows}
                    counts={signalCounts}
                    entryForms={entryForms}
                />

                <footer className="cc-ruo">
                    ⓘ Research Use Only — Not medical advice. Missing data is shown clearly.
                </footer>
            </div>
        </JourneyLayout>
    );
}
