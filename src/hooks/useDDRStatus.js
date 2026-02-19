/**
 * useDDRStatus Hook
 * 
 * Custom hook for DDR_bin status calculation and management.
 * Handles API calls to POST /api/resistance/ddr-status endpoint.
 */
import { useState, useCallback } from 'react';
import { API_ROOT } from '../lib/apiConfig';


export const useDDRStatus = () => {
  const [ddrStatus, setDdrStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDDRStatus = useCallback(async (requestData) => {
    setLoading(true);
    setError(null);

    try {
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

      const data = await response.json();
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
  }, []);

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
