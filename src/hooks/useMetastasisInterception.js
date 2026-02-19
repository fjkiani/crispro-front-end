import { useState, useEffect, useCallback } from 'react';
import { API_ROOT } from '../lib/apiConfig';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * React hook for CRISPR weapon design (metastasis interception)
 * Calls POST /api/metastasis_interception/intercept
 * Returns ranked guide candidates with efficacy/safety/assassin scores
 */
export function useMetastasisInterception(params, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const cacheKey = JSON.stringify(params);

  const fetchWeaponDesign = useCallback(async () => {
    if (!enabled || !params.missionStep || !params.mutations || params.mutations.length === 0) {
      return;
    }

    // Check cache freshness
    const now = Date.now();
    if (lastFetch && (now - lastFetch) < CACHE_TTL_MS && data) {
      return; // Use cached data
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/metastasis_interception/intercept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_step: params.missionStep,
          mutations: params.mutations,
          disease: params.disease || 'PanCancer',
          patient_id: params.patientId || 'DEMO_PATIENT',
          options: params.options || {}
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Weapon design failed (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      setData(result);
      setLastFetch(now);
      setError(null);
    } catch (err) {
      console.error('Metastasis interception error:', err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, enabled, lastFetch, data]);

  useEffect(() => {
    fetchWeaponDesign();
  }, [fetchWeaponDesign]);

  const refetch = useCallback(() => {
    setLastFetch(null); // Force fresh fetch
    fetchWeaponDesign();
  }, [fetchWeaponDesign]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

/**
 * Default export for backward compatibility
 */
export default useMetastasisInterception;
