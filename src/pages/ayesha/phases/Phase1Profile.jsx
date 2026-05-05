/**
 * Phase 1 — Patient Snapshot (Orchestrator)
 *
 * Zero hardcoded patient data. Zero inline hex colors.
 * All data computed from hooks → formatted → passed as props.
 *
 * Layout:
 *   1. SnapshotHeader (hero — identity, biomarkers, engine lights, completeness)
 *   2. WeeklyStrategyLoop (care cycle — moved to top per UX request)
 *   3. ThreatRadar (SL, Velocity, Immune, Resistance)
 *   4. PrimaryDirective (auto-prioritized action)
 *   5. Opportunities (trials + data gaps)
 *   6. Intelligence (DDR + SOC)
 *   7. NextMovePanel
 *   8. SignalTeaser
 *   9. JourneyCards
 */
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from '@mui/material';

// ── Hooks ───────────────────────────────────────────────────────────────────
import { useAyeshaProfile } from '../../../hooks/ayesha/useAyeshaProfile';
import useRepurposingArsenal from '../../../hooks/ayesha/useRepurposingArsenal';
import { useKillChainSignals } from '../../../hooks/ayesha/useKillChainSignals';
import { useProfileEditor } from '../../../hooks/ayesha/useProfileEditor';
import { useAyeshaCareData } from '../../../hooks/ayesha/useAyeshaCareData';
import { useAyeshaTherapyFitBundle } from '../../../hooks/useAyeshaTherapyFitBundle';
import { useDDRStatus } from '../../../hooks/useDDRStatus';
import { usePatientStatus } from '../../../hooks/usePatientStatus';

// ── Layout & existing components ────────────────────────────────────────────
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import NextMovePanel from '../../../components/ayesha/command-center/NextMovePanel';
import SignalTeaser from '../../../components/ayesha/command-center/SignalTeaser';
import JourneyCards from '../../../components/ayesha/command-center/JourneyCards';
import WeeklyStrategyLoop from '../../../components/ayesha/WeeklyStrategyLoop';
import CA125EntryForm from '../../../components/ayesha/CA125EntryForm';
import HRDEntryForm from '../../../components/ayesha/inputs/HRDEntryForm';

// ── Decomposed components ───────────────────────────────────────────────────
import SnapshotHeader from '../../../components/ayesha/profile/SnapshotHeader';
import ThreatRadarSection from '../../../components/ayesha/profile/ThreatRadarSection';
import PrimaryDirectiveSection from '../../../components/ayesha/profile/PrimaryDirectiveSection';
import OpportunitiesSection from '../../../components/ayesha/profile/OpportunitiesSection';
import IntelligenceSection from '../../../components/ayesha/profile/IntelligenceSection';

// ── Pure utilities ──────────────────────────────────────────────────────────
import {
    computeArsenalCounts, computeMissingFields, formatBiomarkerChips,
    buildSignalDots, buildSignalRows, splitActions, buildJourneyCards,
    computeSignalCounts,     getPrimaryDirective,
    normalizeTherapyBundleSyntheticLethality,
} from '../../../components/ayesha/profile/profileUtils';

// ══════════════════════════════════════════════════════════════════════════════
// Page Orchestrator
// ══════════════════════════════════════════════════════════════════════════════

export default function Phase1Profile() {
    const navigate = useNavigate();
    const { profile, patient, disease, tumorContext, germline, labs, biomarkerChips, getDDRMutations } = useAyeshaProfile();
    const { drugs } = useRepurposingArsenal();
    const { signals, summary, actions, geneCoverage } = useKillChainSignals();
    const { editState } = useProfileEditor();

    // ── Data hooks ──────────────────────────────────────────────────────────
    const { result: careData, loading: careLoading } = useAyeshaCareData({
        include_trials: true, max_trials: 10, include_sl: true,
        include_ca125: true, include_resistance: true,
        include_soc: true, include_io_selection: true,
        skip_synthetic_lethality_parallel: true,
    });
    const { data: therapyBundle, isLoading: tbLoading, error: tbError } = useAyeshaTherapyFitBundle({ level: 'l1' });
    const slResult = useMemo(
        () => normalizeTherapyBundleSyntheticLethality(therapyBundle),
        [therapyBundle]
    );
    const { missingTests } = usePatientStatus(profile);
    const { ddrStatus, loading: ddrLoading, calculateDDRStatus } = useDDRStatus();
    const ddrCalculationInitiated = React.useRef(false);

    // Fire DDR calculation (once)
    useEffect(() => {
        if (ddrStatus || ddrLoading || ddrCalculationInitiated.current || !getDDRMutations) return;
        const mutations = getDDRMutations();
        if (mutations.length > 0) {
            ddrCalculationInitiated.current = true;
            calculateDDRStatus({
                patient_id: patient?.patient_id || 'AK',
                disease_site: 'ovary', tumor_subtype: 'HGSOC', mutations,
            }).catch(() => {
                // Do not clear ddrCalculationInitiated: that re-enters the effect and spams
                // POST /api/resistance/ddr-status on every failure (see Janitor HAR ×23 post-mortem).
            });
        }
    }, [getDDRMutations, patient, calculateDDRStatus, ddrStatus, ddrLoading]);

    // ── Derived data ────────────────────────────────────────────────────────
    const ca125 = careData?.ca125_intelligence;
    const resistance = careData?.resistance_alert;
    const io = careData?.io_selection;
    const trials = careData?.trials?.trials || [];

    const arsenalCounts = useMemo(() => computeArsenalCounts(drugs), [drugs]);
    const missingFields = useMemo(() => computeMissingFields(profile), [profile]);
    const signalRows = useMemo(() => buildSignalRows(signals), [signals]);
    const signalCounts = useMemo(() => computeSignalCounts(signals), [signals]);
    const { clinical: clinicalActions, data: dataActions } = useMemo(() => splitActions(actions), [actions]);
    const journeyCards = useMemo(() => buildJourneyCards(summary, arsenalCounts), [summary, arsenalCounts]);
    const formattedChips = useMemo(() => formatBiomarkerChips(biomarkerChips), [biomarkerChips]);
    const directive = useMemo(() =>
        getPrimaryDirective(slResult, resistance, trials.length, careData?.soc_recommendation, profile),
        [slResult, resistance, trials.length, careData, profile]);

    // ── Entry forms ─────────────────────────────────────────────────────────
    const entryForms = {
        CA125_RISING: <CA125EntryForm />,
        HRD_SHIFT: <HRDEntryForm />,
        HRD_BASELINE: <HRDEntryForm />,
    };
    const dataActionsWithForms = dataActions.map(a => {
        if (a.label?.includes('CA-125')) return { ...a, entryForm: <CA125EntryForm /> };
        if (a.label?.includes('HRD')) return { ...a, entryForm: <HRDEntryForm /> };
        return a;
    });

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <JourneyLayout hideRail>
            <div className="cc-page">
                {/* 1. Snapshot Header */}
                <SnapshotHeader
                    profile={profile} disease={disease} germline={germline}
                    editState={editState} tumorContext={tumorContext}
                    formattedChips={formattedChips} signalRows={signalRows}
                    summary={summary} missingFields={missingFields} navigate={navigate}
                />

                {/* 2. Weekly Strategy Loop (moved to top — UX request) */}
                <WeeklyStrategyLoop
                    bundle={therapyBundle}
                    bundleLoading={tbLoading}
                    bundleError={tbError}
                    dataGaps={missingTests || []}
                />

                {/* 3. Threat Radar */}
                <ThreatRadarSection
                    careLoading={careLoading} slResult={slResult}
                    ca125={ca125} io={io} resistance={resistance}
                    profile={profile} navigate={navigate}
                />

                {/* 4. Primary Directive */}
                <PrimaryDirectiveSection
                    careLoading={careLoading} directive={directive}
                    slResult={slResult} trials={trials} navigate={navigate}
                />

                {/* 5. Opportunities */}
                <OpportunitiesSection
                    careLoading={careLoading} trials={trials}
                    missingTests={missingTests} navigate={navigate}
                />

                {/* 6. Intelligence (DDR + SOC) */}
                <IntelligenceSection
                    ddrLoading={ddrLoading} ddrStatus={ddrStatus}
                    careData={careData} therapyBundle={therapyBundle}
                    tbLoading={tbLoading} tbError={tbError}
                />

                <Divider sx={{ my: 2, borderColor: 'var(--zeta-rule)' }} />

                {/* 7. Next Moves */}
                <NextMovePanel
                    clinicalActions={clinicalActions}
                    dataActions={dataActionsWithForms}
                    defaultVisible={3}
                />

                {/* 8. Signal Teaser */}
                <SignalTeaser
                    signals={signalRows}
                    counts={signalCounts}
                    entryForms={entryForms}
                />

                {/* 9. Journey Cards */}
                <JourneyCards cards={journeyCards} />
            </div>
        </JourneyLayout>
    );
}
