/**
 * useAyeshaTrials — Reusable hook for clinical trial search
 *
 * Calls POST /api/ayesha/trials/search with patient-derived parameters.
 * Used by Phase 3 (Treatment Fit) and Phase 6 (Tumor Board).
 *
 * API contract (from ayesha_trials/schemas.py):
 *   Request:  { stage, treatment_line, germline_status, tumor_context, sae_mechanism_vector, ... }
 *   Response: { trials[], soc_recommendation, ca125_intelligence, ngs_fast_track, summary, provenance }
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { API_ROOT } from '../lib/apiConfig';

/**
 * @param {Object} opts
 * @param {Object} opts.bundle - The therapy fit bundle (from useAyeshaTherapyFitBundle)
 * @param {boolean} [opts.autoFetch=true] - Whether to auto-fetch on mount
 * @param {number} [opts.maxResults=5] - Max trials to return
 * @param {string} [opts.treatmentLine='either'] - first-line | recurrent | either
 */
export function useAyeshaTrials({ bundle, autoFetch = true, maxResults = 5, treatmentLine = 'either' } = {}) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchedRef = useRef(false);

    const levelData = bundle?.levels?.L1 || {};
    const tumorContext = bundle?.patient_context?.tumor_context || levelData?.inputs_used?.tumor_context || {};
    const pathwayScores = levelData?.efficacy?.pathway_scores || {};

    // Build mechanism vector from pathway scores
    const mechanismVector = {
        ddr: pathwayScores.ddr ?? null,
        mapk: pathwayScores.mapk ?? null,
        pi3k: pathwayScores.pi3k ?? null,
        vegf: pathwayScores.vegf ?? null,
        her2: pathwayScores.her2 ?? null,
        io: pathwayScores.io ?? null,
        efflux: pathwayScores.efflux ?? null,
    };

    const fetchTrials = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                stage: tumorContext.stage || 'IVB',
                treatment_line: treatmentLine,
                germline_status: tumorContext.germline_status || 'negative',
                location_state: 'NY',
                max_results: maxResults,
                tumor_context: tumorContext,
                sae_mechanism_vector: mechanismVector,
            };

            const res = await fetch(`${API_ROOT}/api/ayesha/trials/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Trial search failed: ${res.status} — ${text.slice(0, 200)}`);
            }

            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [tumorContext, mechanismVector, treatmentLine, maxResults]);

    // Auto-fetch once when bundle is ready
    useEffect(() => {
        if (autoFetch && bundle && !fetchedRef.current && !isLoading) {
            fetchedRef.current = true;
            fetchTrials();
        }
    }, [autoFetch, bundle, fetchTrials, isLoading]);

    return {
        data,
        trials: data?.trials || [],
        socRecommendation: data?.soc_recommendation || null,
        killChainOutput: data?.kill_chain_output || null,
        summary: data?.summary || null,
        provenance: data?.provenance || null,
        isLoading,
        error,
        refetch: fetchTrials,
    };
}

export default useAyeshaTrials;
