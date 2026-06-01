/**
 * useRepurposingArsenal — Hook for fetching SPE Repurposing Arsenal data
 *
 * Primary: fetches from /api/therapy-fit/repurposing-arsenal (backend)
 * Fallback: loads ovarian.json directly and computes client-side SPE gate
 *           (used when backend is not running — e.g. dev mode)
 *
 * NO HARD-CODED LOGIC — all computation happens server-side when available
 *
 * FE-AK-005 (2026-05-10): Server response meta.deprecated and meta.use_instead
 *   are now passed through in the returned `meta` object. Previously the hook
 *   only returned meta.engine and meta.version, silently dropping deprecation
 *   signals from the backend.
 */

import { useState, useEffect, useCallback } from 'react';
import { API_ROOT } from '../../lib/apiConfig';

const API_BASE = API_ROOT;
/** Vite public asset base (e.g. `/` or `/app/`); keeps `/data/ovarian.json` correct for subpath deploys */
const PUBLIC_BASE = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');

/**
 * Minimal client-side SPE gate for fallback mode only.
 * Mirrors feasibility_gate.py logic exactly.
 */
const computeFeasibilityClientSide = (drug) => {
    const gate = drug.feasibility_gate || {};
    const ic50 = gate.ic50_um;
    const cmax = gate.cmax_um;
    const ppb = gate.plasma_protein_binding;

    if (ic50 == null || cmax == null || ppb == null) {
        return { verdict: 'INSUFFICIENT_DATA', gap_ratio: null, free_cmax_um: null, ic50_um: ic50, ppb, cmax_um: cmax };
    }

    const freeCmax = cmax * (1 - ppb);
    const gap = freeCmax > 0 ? ic50 / freeCmax : 99999;
    const gapRounded = Math.round(gap * 10) / 10;

    let verdict;
    if (gap < 5) verdict = 'PASS';
    else if (gap <= 50) verdict = 'CONDITIONAL_PASS';
    else verdict = 'FAIL_EXPOSURE_MISMATCH';

    return { verdict, gap_ratio: gapRounded, free_cmax_um: Math.round(freeCmax * 1000) / 1000, ic50_um: ic50, ppb, cmax_um: cmax, source: gate.source || '' };
};

/**
 * Transform raw ovarian.json drug into the API response shape.
 */
const transformDrug = (drug) => {
    // GAP-FIX: feasibility_gate is optional — don't drop drugs that lack PK data.
    // evidence_tier is still required (drugs without it are not evaluable).
    if (!drug.evidence_tier) return null;
    const feas = drug.feasibility_gate
        ? computeFeasibilityClientSide(drug)
        : { verdict: 'INSUFFICIENT_DATA', gap_ratio: null, free_cmax_um: null, ic50_um: null, ppb: null, cmax_um: null };
    // Merge client-computed feasibility with raw gate fields (source, pk_note)
    const gate = drug.feasibility_gate || {};
    const feasMerged = { ...feas, source: gate.source || '', pk_note: gate.pk_note || '' };

    return {
        drug_name: drug.drug_name,
        name: drug.name || drug.drug_name,
        slug: (drug.drug_name || '').toLowerCase().replace(/ /g, '-'),
        class: drug.class || '',
        moa: drug.moa || '',
        mechanism: drug.mechanism || '',
        rationale: drug.rationale || '',
        targets: drug.targets || [],
        patient_summary: drug.patient_summary || '',
        target_tooltips: drug.target_tooltips || {},
        biomarkers_positive: drug.biomarkers_positive || [],
        biomarkers_negative: drug.biomarkers_negative || [],
        feasibility: feasMerged,
        evidence_tier: drug.evidence_tier,
        evidence_manifest: drug.evidence_manifest || {},
        kill_chain_action: drug.kill_chain_action || 'WATCH',
        kill_chain_rule: drug.kill_chain_rule || '',
        kill_chain_note: drug.kill_chain_note || '',
        watch_historical_note: drug.watch_historical_note || '',
        score_floor: drug.score_floor,
        ruo_reasons: drug.ruo_reasons || [],
        pathway_alignment: drug.pathway_alignment || {},
        trial_autopsy: drug.trial_autopsy || null,
    };
};

const useRepurposingArsenal = () => {
    const [arsenal, setArsenal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArsenal = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try backend API first (with 8s timeout — Render cold starts take 5-7s)
            // Retry once on 502/503 (transient hibernate-wake-error) before falling back.
            try {
                let res = null;
                for (let attempt = 0; attempt < 2; attempt++) {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000);
                    try {
                        res = await fetch(`${API_BASE}/api/ayesha/therapy-fit/repurposing-arsenal`, {
                            signal: controller.signal,
                        });
                        clearTimeout(timeoutId);
                        if (res.ok) {
                            const data = await res.json();
                            setArsenal(data);
                            return;
                        }
                        // 502/503 = Render waking up — wait 3s and retry once
                        if ((res.status === 502 || res.status === 503) && attempt === 0) {
                            console.warn(`⚡ Backend returning ${res.status} (cold start) — retrying in 3s`);
                            await new Promise(r => setTimeout(r, 3000));
                            continue;
                        }
                        break; // Non-retryable error
                    } catch (fetchErr) {
                        clearTimeout(timeoutId);
                        if (attempt === 0) {
                            console.warn('⚡ Backend fetch failed (attempt 1) — retrying in 3s', fetchErr?.name);
                            await new Promise(r => setTimeout(r, 3000));
                        } else {
                            throw fetchErr;
                        }
                    }
                }
            } catch (e) {
                // Backend unavailable after retry — fall through to JSON fallback
                console.warn('⚡ Backend API unavailable after retry — loading arsenal from static JSON', e?.name);
            }

            // Fallback: load ovarian.json from static public/ (must exist in frontend public/data/)
            const jsonRes = await fetch(`${PUBLIC_BASE}data/ovarian.json`);
            if (!jsonRes.ok) {
                const altRes = await fetch(`${PUBLIC_BASE}ovarian.json`);
                if (!altRes.ok) throw new Error('Could not load ovarian.json from any path');
                const rawDrugs = await altRes.json();
                const drugs = rawDrugs.map(transformDrug).filter(Boolean);
                drugs.sort((a, b) => {
                    const aq = a.kill_chain_action === 'QUARANTINE' || a.kill_chain_action === 'WATCH_HISTORICAL' || a.score_floor === 0;
                    const bq = b.kill_chain_action === 'QUARANTINE' || b.kill_chain_action === 'WATCH_HISTORICAL' || b.score_floor === 0;
                    if (aq !== bq) return aq ? 1 : -1;
                    return (a.feasibility.gap_ratio || 99999) - (b.feasibility.gap_ratio || 99999);
                });
                setArsenal({ total: drugs.length, drugs, meta: { engine: 'SPE (Client Fallback)', version: '1.0.0-fallback' } });
                return;
            }
            const rawDrugs = await jsonRes.json();
            const drugs = rawDrugs.map(transformDrug).filter(Boolean);
            drugs.sort((a, b) => {
                const aq = a.kill_chain_action === 'QUARANTINE' || a.kill_chain_action === 'WATCH_HISTORICAL' || a.score_floor === 0;
                const bq = b.kill_chain_action === 'QUARANTINE' || b.kill_chain_action === 'WATCH_HISTORICAL' || b.score_floor === 0;
                if (aq !== bq) return aq ? 1 : -1;
                return (a.feasibility.gap_ratio || 99999) - (b.feasibility.gap_ratio || 99999);
            });
            setArsenal({ total: drugs.length, drugs, meta: { engine: 'SPE (Client Fallback)', version: '1.0.0-fallback' } });
        } catch (err) {
            console.error('❌ Failed to fetch repurposing arsenal:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArsenal();
    }, [fetchArsenal]);

    // Separate evaluable vs quarantined
    const evaluable = arsenal?.drugs?.filter(
        (d) =>
            d.kill_chain_action !== 'QUARANTINE' &&
            d.kill_chain_action !== 'WATCH_HISTORICAL' &&
            d.score_floor !== 0
    ) || [];

    const quarantined = arsenal?.drugs?.filter(
        (d) =>
            d.kill_chain_action === 'QUARANTINE' ||
            d.kill_chain_action === 'WATCH_HISTORICAL' ||
            d.score_floor === 0
    ) || [];

    return {
        arsenal,
        drugs: arsenal?.drugs || [],
        evaluable,
        quarantined,
        meta: arsenal?.meta || {},
        total: arsenal?.total || 0,
        loading,
        error,
        refetch: fetchArsenal,
    };
};

export default useRepurposingArsenal;
