import { useState, useEffect, useCallback } from 'react';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * React hook for metastatic cascade assessment
 * Calls POST /api/metastasis/assess
 * Returns 8-step risk assessment with target lock scores
 */
export function useMetastasisAssess(params, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const cacheKey = JSON.stringify(params);

  const fetchAssessment = useCallback(async () => {
    if (!enabled || !params.mutations || params.mutations.length === 0) {
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
      const response = await fetch(`${API_ROOT}/api/metastasis/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mutations: params.mutations,
          disease: params.disease || 'PanCancer',
          patient_id: params.patientId || 'DEMO_PATIENT',
          options: params.options || {}
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Assessment failed (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      setData(result);
      setLastFetch(now);
      setError(null);
    } catch (err) {
      console.error('Metastasis assessment error:', err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, enabled, lastFetch, data]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const refetch = useCallback(() => {
    setLastFetch(null); // Force fresh fetch
    fetchAssessment();
  }, [fetchAssessment]);

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
export default useMetastasisAssess;
