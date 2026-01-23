import { useState, useCallback } from 'react';

/**
 * useTrialRefresh Hook
 * 
 * Custom React hook for calling /api/trials/refresh_status endpoint.
 * 
 * @returns {Object} Hook return object
 * @returns {boolean} refreshing - Loading state
 * @returns {string|null} error - Error message if any
 * @returns {Function} refreshStatus - Function to refresh trial status
 * 
 * @example
 * const { refreshing, error, refreshStatus } = useTrialRefresh();
 * 
 * const handleRefresh = async () => {
 *   try {
 *     const data = await refreshStatus(['NCT12345'], 'NY');
 *     console.log('Refreshed:', data);
 *   } catch (err) {
 *     console.error('Refresh failed:', err);
 *   }
 * };
 */
export const useTrialRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const refreshStatus = useCallback(async (nctIds, stateFilter = null) => {
    setRefreshing(true);
    setError(null);

    const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

    try {
      const response = await fetch(`${API_ROOT}/api/trials/refresh_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nct_ids: nctIds,
          state_filter: stateFilter
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh trial status';
      setError(errorMessage);
      throw err;
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    refreshing,
    error,
    refreshStatus
  };
};

export default useTrialRefresh;

