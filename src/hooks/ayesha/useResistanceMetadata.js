/**
 * useResistanceMetadata
 *
 * Fetches the Kill Chain resistance class metadata from:
 *   GET /api/resistance/metadata
 *
 * Caching strategy:
 *   - sessionStorage ('resistance_metadata') — survives navigation within the
 *     tab, cleared when the tab closes or the user starts a new session.
 *   - Backend sends Cache-Control: max-age=3600, so browser also caches.
 *
 * This data never changes during a user session (only on backend deploy),
 * so one fetch per session is the correct tradeoff.
 *
 * Returns:
 *   {
 *     classes:  { [classId]: { id, name, icon, genes[], whatHappens, treatmentShift } }
 *     vectors:  { axes[], baseline, deltas: { [classId]: { ddr, mapk, ... } } }
 *     priority: string[]          // severity order, lowest → highest
 *     geneMap:  { [gene]: classId }
 *     meta:     { version, class_count, gene_count, axis_count }
 *     loading:  boolean
 *     error:    string | null
 *   }
 *
 * Consumers:
 *   - resistanceDisplayHelpers.js (buildResistanceClassProps, buildActiveAxes, buildConcordanceStatus)
 *   - MultiMechanismPanel, KillChainAxisMap, ConcordanceStatusBanner (via Phase 5 orchestrator)
 */

import { useState, useEffect } from 'react';

const CACHE_KEY = 'resistance_metadata';
const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

export function useResistanceMetadata() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            // 1. Check sessionStorage cache first
            try {
                const cached = sessionStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (!cancelled) {
                        setData(parsed);
                        setLoading(false);
                    }
                    return;
                }
            } catch {
                // sessionStorage unavailable or parse error — fall through to fetch
            }

            // 2. Fetch from backend
            try {
                const res = await fetch(`${API_ROOT}/api/resistance/metadata`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                // 3. Persist in sessionStorage
                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(json));
                } catch {
                    // sessionStorage full — proceed without caching
                }

                if (!cancelled) {
                    setData(json);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Failed to load resistance metadata');
                    setLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, []); // empty deps — fetch once per mount, sessionStorage handles re-use

    return {
        classes: data?.classes ?? {},
        vectors: data?.vectors ?? { axes: [], baseline: {}, deltas: {} },
        priority: data?.priority ?? [],
        geneMap: data?.gene_map ?? {},
        meta: data?.meta ?? {},
        loading,
        error,
    };
}
