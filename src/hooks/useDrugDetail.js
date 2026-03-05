import { useQuery } from '@tanstack/react-query';
import { API_ROOT } from '../lib/apiConfig';

/**
 * Helper — get auth token from storage.
 */
const getAuthToken = () => {
    try {
        const sessionStr = localStorage.getItem('mock_auth_session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            const t = session?.access_token;
            if (t && t !== 'null' && t !== 'undefined') return t;
        }
    } catch (e) { /* ignore */ }
    const t2 = localStorage.getItem('supabase_auth_token');
    return (t2 && t2 !== 'null' && t2 !== 'undefined') ? t2 : null;
};

/**
 * Slug → backend drug name (lowercase, hyphens → spaces kept as-is for the API).
 * The API normalises internally, so we just pass the slug verbatim.
 */
const slugToDrugName = (slug) => (slug || '').replace(/-/g, ' ');

/**
 * Drug name → URL slug (lowercase, spaces → hyphens, strip non-alphanumerics).
 */
export const drugToSlug = (name) =>
    (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/**
 * Fetch everything needed for the drug detail page.
 *
 * 1. GET /drug/{name}?level=l1 — exact match + scoring data
 * 2. POST /bundle?level=l1     — completeness, pathway scores, provenance context
 */
const fetchDrugDetail = async (slug) => {
    const drugName = slugToDrugName(slug);
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const [drugRes, bundleRes] = await Promise.all([
        fetch(`${API_ROOT}/api/ayesha/therapy-fit/drug/${encodeURIComponent(drugName)}?level=l1`, { headers }),
        fetch(`${API_ROOT}/api/ayesha/therapy-fit/bundle?level=l1&include_synthetic_lethality=true&efficacy_mode=comprehensive`, {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
        }),
    ]);

    if (!drugRes.ok) throw new Error(`Drug query failed: ${drugRes.statusText}`);
    if (!bundleRes.ok) throw new Error(`Bundle failed: ${bundleRes.statusText}`);

    const drugData = await drugRes.json();
    const bundleData = await bundleRes.json();

    // Extract L1 match
    const l1Match = drugData?.L1 || {};
    const drug = l1Match.found ? l1Match.drug : null;

    // Bundle context
    const l1Bundle = bundleData?.levels?.L1 || {};
    const completeness = l1Bundle?.completeness || {};
    const allDrugs = l1Bundle?.efficacy?.drugs || [];
    const pathwayScores = l1Bundle?.efficacy?.pathway_scores || {};
    const provenance = l1Bundle?.efficacy?.provenance || {};

    // Find rank (1-indexed)
    const rank = drug
        ? allDrugs.findIndex(d => (d.name || '').toLowerCase() === drugName.toLowerCase()) + 1
        : null;

    return {
        found: !!drug,
        drug_query: drugData.drug_query,
        drug,
        rank: rank > 0 ? rank : null,
        totalDrugs: allDrugs.length,
        completeness,
        pathwayScores,
        provenance,
        allDrugs,
        // SL lives at the TOP level of the bundle response, not inside levels.L1
        synthetic_lethality: bundleData?.synthetic_lethality || l1Bundle?.synthetic_lethality,
    };
};

/**
 * React Query hook for the drug detail page.
 *
 * @param {string} slug — URL slug (e.g. "adavosertib")
 * @param {object} options — extra react-query options
 */
export function useDrugDetail(slug, options = {}) {
    return useQuery({
        queryKey: ['drug-detail', slug],
        queryFn: () => fetchDrugDetail(slug),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,   // 5 minutes — backend SL call is ~10s; cache aggressively
        gcTime: 10 * 60 * 1000,     // Keep in memory for 10 min
        retry: 1,
        ...options,
    });
}
