/**
 * useDDRStatus Hook
 *
 * DDR status via POST /api/resistance/ddr-status.
 * Caches identical payloads with @tanstack/react-query (5 min) so remounts
 * and duplicate callers do not hammer the backend.
 */
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_ROOT } from '../lib/apiConfig';

/** @param {unknown} mutations */
function normalizeMutationsForKey(mutations) {
  if (!Array.isArray(mutations)) return '';
  return JSON.stringify(
    [...mutations]
      .map((m) => ({
        gene: m.gene || m.gene_symbol,
        hgvs_p: m.hgvs_p || m.protein_change || null,
      }))
      .sort((a, b) => `${a.gene}:${a.hgvs_p}`.localeCompare(`${b.gene}:${b.hgvs_p}`)),
  );
}

/** @param {Record<string, unknown> | null | undefined} requestData */
export function ddrQueryKey(requestData) {
  if (!requestData) return ['ddr-status', 'none'];
  return [
    'ddr-status',
    requestData.patient_id || 'unknown',
    requestData.disease_site || '',
    requestData.tumor_subtype || '',
    normalizeMutationsForKey(requestData.mutations),
  ];
}

async function fetchDDRStatusRequest(requestData) {
  const response = await fetch(`${API_ROOT}/api/resistance/ddr-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const useDDRStatus = () => {
  const queryClient = useQueryClient();
  const [ddrStatus, setDdrStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDDRStatus = useCallback(async (requestData) => {
    setLoading(true);
    setError(null);

    try {
      const key = ddrQueryKey(requestData);
      const data = await queryClient.fetchQuery({
        queryKey: key,
        queryFn: () => fetchDDRStatusRequest(requestData),
        staleTime: 5 * 60 * 1000,
        retry: false,
      });
      setDdrStatus(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to calculate DDR status';
      setError(errorMessage);
      console.error('[useDDRStatus] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  const reset = useCallback(() => {
    setDdrStatus(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    ddrStatus,
    loading,
    error,
    calculateDDRStatus,
    reset,
  };
};
