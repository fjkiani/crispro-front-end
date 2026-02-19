/**
 * useTestsPageState — all state + derived values for TestsPage.
 * Extracted from TestsPage.tsx monolith.
 * Mars rules: one hook, all state, clean contract.
 */
import { useMemo, useState } from "react";
import {
    CANONICAL_MISSING_STRINGS,
    computeAxisCoverage,
    getCanonicalAxesFromMechanismPanel,
    type AxisCoverage,
    type ExpectedMechanismLike,
} from "../../logic/axisCoverage";
import { useAyeshaTherapyFitBundle, useAyeshaScenarios } from "../useAyeshaTherapyFitBundle";
import { safeArray } from "../../components/ayesha/tests/testsConstants";

// ---------------------------------------------------------------------------
// Completeness derivation from inputs_used
// ---------------------------------------------------------------------------
function computeCompletenessMissingFromInputs(inputsUsed: any): string[] {
    const missing: string[] = [];
    const mutations = safeArray(inputsUsed?.mutations);
    const tumorContext = inputsUsed?.tumor_context || {};

    // 1) NGS somatic genomic coordinates
    if (mutations.length) {
        const anyMissingCoords = mutations.some((m: any) => {
            const hasChrom = m?.chrom !== undefined && m?.chrom !== null && String(m?.chrom).length > 0;
            const hasPos = typeof m?.pos === "number" && Number.isFinite(m.pos);
            const hasRef = m?.ref !== undefined && m?.ref !== null && String(m?.ref).length > 0;
            const hasAlt = m?.alt !== undefined && m?.alt !== null && String(m?.alt).length > 0;
            return !(hasChrom && hasPos && hasRef && hasAlt);
        });
        if (anyMissingCoords) missing.push(CANONICAL_MISSING_STRINGS.NGS_COORDS);
    } else {
        missing.push(CANONICAL_MISSING_STRINGS.NGS_COORDS);
    }

    // 2) HRD score (L2 gate)
    if (typeof tumorContext?.hrd_score !== "number") missing.push(CANONICAL_MISSING_STRINGS.HRD);

    // 3) TMB score (L2 gate)
    if (typeof tumorContext?.tmb_score !== "number") missing.push(CANONICAL_MISSING_STRINGS.TMB);

    // 4) RNA expression data (L3 gate)
    const expr = tumorContext?.expression;
    const hasExprDict = expr && typeof expr === "object" && Object.keys(expr).length > 0;
    if (!hasExprDict) missing.push(CANONICAL_MISSING_STRINGS.RNA);

    // 5) CA-125 lab values (L3 gate)
    if (typeof tumorContext?.ca125_value !== "number") missing.push(CANONICAL_MISSING_STRINGS.CA125);

    return missing;
}

function applyScenarioOverridesToMissing({
    baseMissing,
    requires,
}: {
    baseMissing: string[];
    requires: string[];
}): string[] {
    const req = safeArray<string>(requires).map((s) => String(s || ""));
    const out = new Set(baseMissing);

    const has = (needle: string) => req.some((r) => r.toLowerCase().includes(needle.toLowerCase()));

    if (has("hrd")) out.delete(CANONICAL_MISSING_STRINGS.HRD);
    if (has("tmb")) out.delete(CANONICAL_MISSING_STRINGS.TMB);
    if (has("rna") || has("expression")) out.delete(CANONICAL_MISSING_STRINGS.RNA);
    if (has("ca-125") || has("ca125")) out.delete(CANONICAL_MISSING_STRINGS.CA125);
    if (has("coord") || has("ngs")) out.delete(CANONICAL_MISSING_STRINGS.NGS_COORDS);

    return Array.from(out);
}

// ---------------------------------------------------------------------------
// The hook
// ---------------------------------------------------------------------------
export function useTestsPageState() {
    // Scenario selection state
    const [scenarioId, setScenarioId] = useState<string>("");
    const [l3ScenarioId, setL3ScenarioId] = useState<string>("");
    const [pairedL2ForL3, setPairedL2ForL3] = useState<string>("");

    // View toggle
    const [mechanismViewMode, setMechanismViewMode] = useState<"expected" | "model">("expected");

    // Data fetching
    const scenariosQ = useAyeshaScenarios();
    const bundleQ = useAyeshaTherapyFitBundle({
        level: "all",
        scenario_id: scenarioId || null,
        l3_scenario_id: l3ScenarioId || null,
    });

    const scenariosData: any = scenariosQ.data;
    const l2Scenarios = safeArray(scenariosData?.l2_scenarios);
    const l3Scenarios = safeArray(scenariosData?.l3_scenarios);

    const bundle: any = bundleQ.data;
    const levels: any = bundle?.levels || {};
    const testsNeeded: any[] = safeArray(bundle?.tests_needed);

    // Active level
    const activeLevelKey: "L1" | "L2" | "L3" = l3ScenarioId ? "L3" : scenarioId ? "L2" : "L1";
    const activeLevel: any = levels?.[activeLevelKey] || null;

    // Completeness
    const l1InputsUsed: any = levels?.L1?.inputs_used || levels?.l1?.inputs_used || {};
    const baseMissing = useMemo(() => computeCompletenessMissingFromInputs(l1InputsUsed), [l1InputsUsed]);

    // Selected cards
    const selectedL2Card: any = scenarioId ? l2Scenarios.find((s: any) => s?.id === scenarioId) : null;
    const selectedL3Card: any = l3ScenarioId ? l3Scenarios.find((s: any) => s?.id === l3ScenarioId) : null;

    const effectivePairedL2 = useMemo(() => {
        if (!l3ScenarioId) return "";
        if (pairedL2ForL3) return pairedL2ForL3;
        const first = l2Scenarios[0]?.id;
        return first ? String(first) : "";
    }, [l2Scenarios, l3ScenarioId, pairedL2ForL3]);

    const previewEntry: any = useMemo(() => {
        if (!selectedL3Card || !effectivePairedL2) return null;
        return selectedL3Card?.preview_matrix?.by_l2?.[effectivePairedL2] || null;
    }, [effectivePairedL2, selectedL3Card]);

    // Mechanism panels
    const mechanismPanel: any = useMemo(() => {
        if (activeLevelKey === "L2") return selectedL2Card?.mechanism_panel || null;
        if (activeLevelKey === "L3") return previewEntry?.mechanism_panel || null;
        return null;
    }, [activeLevelKey, previewEntry, selectedL2Card]);

    const expectedMechanism: ExpectedMechanismLike | null = useMemo(() => {
        if (activeLevelKey === "L2") return selectedL2Card?.expected_mechanism || null;
        if (activeLevelKey === "L3") return previewEntry?.expected_mechanism || null;
        return null;
    }, [activeLevelKey, previewEntry, selectedL2Card]);

    const axes = useMemo(() => getCanonicalAxesFromMechanismPanel(mechanismPanel || null), [mechanismPanel]);

    // Scenario requirements
    const scenarioRequires = useMemo(() => {
        if (activeLevelKey === "L2") return safeArray<string>(selectedL2Card?.requires);
        if (activeLevelKey === "L3") return safeArray<string>(selectedL3Card?.requires);
        return [];
    }, [activeLevelKey, selectedL2Card, selectedL3Card]);

    const completenessMissing = useMemo(() => {
        if (activeLevelKey === "L1") return baseMissing;
        return applyScenarioOverridesToMissing({ baseMissing, requires: scenarioRequires });
    }, [activeLevelKey, baseMissing, scenarioRequires]);

    // Pathway scores (model vs scenario alignment)
    const scenarioAlignment: Record<string, number> | null = useMemo(() => {
        const card = activeLevelKey === "L2" ? selectedL2Card : activeLevelKey === "L3" ? selectedL3Card : null;
        const mp = card?.mechanism_panel;
        if (!mp) return null;
        const align = mp.mechanism_alignment;
        if (align && typeof align === "object") return align;
        return null;
    }, [activeLevelKey, selectedL2Card, selectedL3Card]);

    const pathwayScores: any = activeLevel?.pathway_scores || null;
    const isPreview = activeLevelKey === "L2" || activeLevelKey === "L3";

    const effectivePathwayScores: any = useMemo(() => {
        if (isPreview && scenarioAlignment) {
            const merged = { ...(pathwayScores || {}) };
            for (const [k, v] of Object.entries(scenarioAlignment)) {
                const lk = k.toLowerCase();
                if (merged[lk] === null || merged[lk] === undefined) {
                    merged[lk] = v;
                }
            }
            return merged;
        }
        return pathwayScores;
    }, [isPreview, scenarioAlignment, pathwayScores]);

    // Coverage computation
    const coverage = useMemo(
        () =>
            computeAxisCoverage({
                mechanismPanel,
                pathwayScores: effectivePathwayScores,
                completeness: { missing: completenessMissing },
                expectedMechanism: mechanismViewMode === "expected" ? expectedMechanism : null,
            }),
        [completenessMissing, mechanismPanel, effectivePathwayScores, expectedMechanism, mechanismViewMode]
    );

    // Active scenario card
    const activeScenarioCard: any = useMemo(() => {
        if (activeLevelKey === "L2") return selectedL2Card;
        if (activeLevelKey === "L3") return selectedL3Card;
        return null;
    }, [activeLevelKey, selectedL2Card, selectedL3Card]);

    // Alerts
    const axisUnknownAlerts = useMemo(() => {
        return coverage
            .filter((r) => r.status === "Unknown")
            .map((r) => ({
                axis: r.axis,
                reason: "Insufficient structured data",
                missingData: r.missingData,
                recommendedTest: r.recommendedTest,
            }));
    }, [coverage]);

    const monitoringBaselineMissing = completenessMissing.includes(CANONICAL_MISSING_STRINGS.CA125);

    const expressionTripwireError = useMemo(() => {
        if (activeLevelKey !== "L3") return null;
        const err =
            previewEntry?.error ??
            previewEntry?.mechanism_panel?.provenance?.error ??
            previewEntry?.mechanism_panel?.provenance?.tripwire_error ??
            null;
        if (typeof err === "string" && err.trim().length) return err;
        return null;
    }, [activeLevelKey, previewEntry]);

    // Options for selectors
    const l2Options = l2Scenarios.map((s: any) => ({ id: String(s?.id || ""), name: String(s?.name || s?.id || "") }));
    const l3Options = l3Scenarios.map((s: any) => ({ id: String(s?.id || ""), name: String(s?.name || s?.id || "") }));

    // Mode setters
    const setModeL1 = () => {
        setScenarioId("");
        setL3ScenarioId("");
        setPairedL2ForL3("");
    };
    const setModeL2 = (id: string) => {
        setScenarioId(id);
        setL3ScenarioId("");
        setPairedL2ForL3("");
    };
    const setModeL3 = (id: string) => {
        setL3ScenarioId(id);
    };
    const setPairedL2 = (id: string) => {
        setPairedL2ForL3(id);
        setScenarioId(id);
    };

    return {
        // Loading/error
        isLoading: scenariosQ.isLoading || bundleQ.isLoading,
        error: scenariosQ.error || bundleQ.error,

        // Scenario selection
        activeLevelKey,
        scenarioId,
        l3ScenarioId,
        effectivePairedL2,
        l2Options,
        l3Options,
        setModeL1,
        setModeL2,
        setModeL3,
        setPairedL2,

        // Data
        coverage,
        expectedMechanism,
        mechanismPanel,
        scenarioAlignment,
        activeScenarioCard,
        completenessMissing,
        scenarioRequires,
        axes,
        isPreview,
        testsNeeded,

        // Alerts
        axisUnknownAlerts,
        monitoringBaselineMissing,
        expressionTripwireError,

        // View mode
        mechanismViewMode,
        setMechanismViewMode,
    };
}

export type TestsPageState = ReturnType<typeof useTestsPageState>;
