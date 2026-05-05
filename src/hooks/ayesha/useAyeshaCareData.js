/**
 * useAyeshaCareData - Hook for loading Ayesha's care data
 * 
 * Wraps useCompleteCareOrchestrator with react-query caching.
 * Uses AYESHA_11_17_25_PROFILE as single source of truth.
 * 
 * Cache: 5-minute staleTime via @tanstack/react-query — shared
 * across all components that call this hook.
 */

import { useQuery } from '@tanstack/react-query';
import { useAyeshaProfile } from './useAyeshaProfile';
import { useCompleteCareOrchestrator } from '../useCompleteCareOrchestrator';
import { useRef, useCallback } from 'react';

/**
 * Custom hook for Ayesha's care data — cached with react-query.
 * 
 * Unlike the old implementation (which created a fresh useState/useEffect
 * per mount), this shares cached data across all consumers via the
 * shared react-query cache.
 */
export const useAyeshaCareData = (options = {}) => {
  const {
    skip_auxiliary_parallel_requests,
    skip_synthetic_lethality_parallel,
    ...careOptions
  } = options;
  const { profile, buildRequest } = useAyeshaProfile();
  const orchestrator = useCompleteCareOrchestrator();
  const orchestratorRef = useRef(orchestrator);
  orchestratorRef.current = orchestrator;

  const patientKey =
    profile?.patient?.patient_id ||
    profile?.patient_id ||
    'ayesha-default';

  const stableOptions = JSON.stringify({
    ...careOptions,
    patientKey,
    skip_auxiliary_parallel_requests: !!skip_auxiliary_parallel_requests,
    skip_synthetic_lethality_parallel: !!skip_synthetic_lethality_parallel,
  });

  const fetchCareData = useCallback(async () => {
    if (!profile) return null;
    const requestBody = buildRequest({
      ...careOptions,
      include_io_selection: true,
      max_trials: 50,
    });
    // Use the orchestrator's generatePlan (parallel aux + main plan, or lite mode).
    await orchestratorRef.current.generatePlan(profile, {
      ...requestBody,
      ...(skip_auxiliary_parallel_requests
        ? { skip_auxiliary_parallel_requests: true }
        : {}),
      ...(skip_synthetic_lethality_parallel
        ? { skip_synthetic_lethality_parallel: true }
        : {}),
    });
    // After generatePlan resolves, the result is in orchestrator.result
    // but we can't read it synchronously. Return a resolved value instead.
    return orchestratorRef.current.result;
  }, [
    profile,
    buildRequest,
    stableOptions,
    skip_auxiliary_parallel_requests,
    skip_synthetic_lethality_parallel,
  ]);

  const query = useQuery({
    queryKey: ['ayesha-care-data', stableOptions],
    queryFn: fetchCareData,
    enabled: !!profile,
    staleTime: 5 * 60 * 1000,      // 5 min — matches therapy bundle cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  });

  // Prefer orchestrator's result (always up-to-date after generatePlan)
  // but fall back to react-query cache for cross-mount sharing.
  const result = orchestrator.result || query.data;

  return {
    result,
    loading: orchestrator.loading || query.isLoading,
    error: orchestrator.error || query.error,
    refresh: () => query.refetch(),
  };
};

export default useAyeshaCareData;
