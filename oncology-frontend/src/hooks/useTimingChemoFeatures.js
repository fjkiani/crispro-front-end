/**
 * useTimingChemoFeatures Hook
 * 
 * React hook for fetching timing & chemosensitivity features from backend API.
 * 
 * Purpose: Compute PFI, PTPI, TFI, PFS, OS, and KELIM/CA-125 features from treatment history
 * API Endpoint: POST /api/resistance/timing-chemo-features
 * 
 * Returns: { data, loading, error, refetch }
 */
import { useState, useCallback } from 'react';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

export const useTimingChemoFeatures = () => {
  const [timingFeatures, setTimingFeatures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const computeTimingFeatures = useCallback(async ({
    regimenTable = [],
    survivalTable = [],
    clinicalTable = [],
    ca125FeaturesTable = null,
    ca125MeasurementsTable = null,
    config = null
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Validate required inputs
      if (!regimenTable || regimenTable.length === 0) {
        throw new Error('regimen_table is required and must not be empty');
      }
      if (!survivalTable || survivalTable.length === 0) {
        throw new Error('survival_table is required and must not be empty');
      }
      if (!clinicalTable || clinicalTable.length === 0) {
        throw new Error('clinical_table is required and must not be empty');
      }

      const requestBody = {
        regimen_table: regimenTable,
        survival_table: survivalTable,
        clinical_table: clinicalTable,
        ...(ca125FeaturesTable && { ca125_features_table: ca125FeaturesTable }),
        ...(ca125MeasurementsTable && { ca125_measurements_table: ca125MeasurementsTable }),
        ...(config && { config })
      };

      console.log('[useTimingChemoFeatures] Request:', {
        regimenCount: regimenTable.length,
        survivalCount: survivalTable.length,
        clinicalCount: clinicalTable.length,
        hasCa125Features: !!ca125FeaturesTable,
        hasCa125Measurements: !!ca125MeasurementsTable
      });

      // Add timeout controller (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${API_ROOT}/api/resistance/timing-chemo-features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[useTimingChemoFeatures] Response:', {
        timingFeaturesCount: data.timing_features_table?.length || 0,
        provenance: data.provenance
      });

      setTimingFeatures(data);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Timing features computation timed out after 60 seconds. The backend may be slow or unresponsive.');
      } else {
        setError(err.message || 'Failed to compute timing and chemosensitivity features');
      }
      console.error('[useTimingChemoFeatures] Error:', err);
      setTimingFeatures(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTimingFeatures(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    timingFeatures,
    loading,
    error,
    computeTimingFeatures,
    reset
  };
};
