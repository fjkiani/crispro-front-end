import { useState, useCallback } from 'react';
import { useCoPilot } from '../context/CoPilotContext';

/**
 * useRadOncGuidance
 * Minimal hook to fetch radiation guidance and expose loading/data/error state.
 */
export const useRadOncGuidance = () => {
  const { currentVariant, currentDisease } = useCoPilot();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guidance, setGuidance] = useState(null);

  const API_ROOT = import.meta.env.VITE_API_ROOT || '';

  const fetchGuidance = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    setGuidance(null);

    try {
      const disease = overrides.disease || currentDisease || undefined;
      const variant = overrides.variant || currentVariant || {};

      const payload = {
        disease,
        mutations: [
          {
            gene: variant.gene,
            hgvs_p: variant.hgvs_p,
            chrom: variant.chrom,
            pos: variant.pos,
            ref: variant.ref,
            alt: variant.alt,
            build: variant.build
          }
        ].filter(v => v.gene && v.hgvs_p),
        options: { adaptive: true, ensemble: true },
        api_base: API_ROOT || undefined
      };

      const res = await fetch(`${API_ROOT}/api/guidance/radonc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.detail) message = data.detail;
        } catch {}
        throw new Error(message);
      }

      const data = await res.json();
      setGuidance(data);
      return data;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_ROOT, currentDisease, currentVariant]);

  return { loading, error, guidance, fetchGuidance };
};


