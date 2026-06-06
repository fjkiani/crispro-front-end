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
import { useQuery } from '@tanstack/react-query';
import { API_ROOT } from '../lib/apiConfig';

function tumorContextFingerprint(tc) {
    if (!tc || typeof tc !== 'object') return 'none';
    try {
        return JSON.stringify({
            stage: tc.stage,
            germline_status: tc.germline_status,
            msi_status: tc.msi_status,
            hrd_score: tc.hrd_score,
            tmb_score: tc.tmb_score,
        });
    } catch {
        return 'err';
    }
}

function buildMechanismVector(pathwayScores) {
    const ps = pathwayScores || {};
    const v = {
        ddr: ps.ddr ?? null,
        mapk: ps.mapk ?? null,
        pi3k: ps.pi3k ?? null,
        vegf: ps.vegf ?? null,
        her2: ps.her2 ?? null,
        io: ps.io ?? null,
        efflux: ps.efflux ?? null,
    };
    if (ps.rss != null) v.rss = ps.rss;
    return v;
}

/**
 * @param {Object} opts
 * @param {Object} opts.bundle - Therapy fit / tumor board bundle (merged shape)
 * @param {string} [opts.levelKey='L1'] - Active level key: L1 | L2 | L3
 * @param {boolean} [opts.autoFetch=true]
 * @param {number} [opts.maxResults=5]
 * @param {string} [opts.treatmentLine='either'] - first-line | recurrent | either
 */
export function useAyeshaTrials({
    bundle,
    levelKey = 'L1',
    autoFetch = true,
    maxResults = 5,
    treatmentLine = 'either',
} = {}) {
    const key = String(levelKey || 'L1').toUpperCase();

    const levelData = bundle?.levels?.[key] || {};
    const tumorContext =
        bundle?.patient_context?.tumor_context ||
        levelData?.inputs_used?.tumor_context ||
        {};
    const pathwayScores = levelData?.efficacy?.pathway_scores || {};
    const tcFp = tumorContextFingerprint(tumorContext);
    let vecFp = '';
    try {
        vecFp = JSON.stringify(buildMechanismVector(pathwayScores));
    } catch {
        vecFp = '';
    }

    const query = useQuery({
        queryKey: ['ayesha-trials', key, tcFp, vecFp, treatmentLine, maxResults],
        queryFn: async () => {
            const ld = bundle?.levels?.[key] || {};
            const ps = ld?.efficacy?.pathway_scores || {};
            const mechanismVector = buildMechanismVector(ps);
            const tc =
                bundle?.patient_context?.tumor_context ||
                ld?.inputs_used?.tumor_context ||
                {};

            const payload = {
                stage: tc.stage || null,
                treatment_line: treatmentLine,
                germline_status: tc.germline_status || null,
                location_state: null,
                max_results: maxResults,
                tumor_context: tc,
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
            return res.json();
        },
        enabled: Boolean(autoFetch && bundle),
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const data = query.data;

    return {
        data,
        trials: data?.trials || [],
        socRecommendation: data?.soc_recommendation || null,
        killChainOutput: data?.kill_chain_output || null,
        summary: data?.summary || null,
        provenance: data?.provenance || null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export default useAyeshaTrials;
