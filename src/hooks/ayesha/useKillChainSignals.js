/**
 * useKillChainSignals — React hook connecting patient profile to Engine Light system.
 *
 * Reads patient data from useAyeshaProfile and runs all 8 signal evaluators
 * + gene coverage analysis from signalStateEngine.js.
 *
 * Returns: { signals, geneCoverage, summary, actions }
 *
 * Source doctrine: ENGINE_LIGHT_DASHBOARD.mdc §7 Layer 2
 */
import { useMemo } from 'react';
import { useAyeshaProfile } from './useAyeshaProfile';
import {
    evaluateAllSignals,
    evaluateGeneCoverage,
    computeSummary,
    generateActions,
} from '../../constants/signalStateEngine';

export function useKillChainSignals() {
    const { profile } = useAyeshaProfile();

    return useMemo(() => {
        const signals = evaluateAllSignals(profile);
        const geneCoverage = evaluateGeneCoverage(profile);
        const summary = computeSummary(signals, geneCoverage);
        const actions = generateActions(signals, geneCoverage);

        return { signals, geneCoverage, summary, actions };
    }, [profile]);
}

export default useKillChainSignals;
