/**
 * useAyeshaCareData - Hook for loading Ayesha's care data
 * 
 * Wraps useCompleteCareOrchestrator with Ayesha-specific defaults
 * Uses AYESHA_11_17_25_PROFILE as single source of truth
 */

import { useEffect } from 'react';
import { useCompleteCareOrchestrator } from '../useCompleteCareOrchestrator';
import { useAyeshaProfile } from './useAyeshaProfile';

/**
 * Custom hook for Ayesha's care data
 * Automatically loads data on mount using Ayesha's profile
 */
export const useAyeshaCareData = (options = {}) => {
  const { profile, buildRequest } = useAyeshaProfile();
  const { result, loading, error, generatePlan } = useCompleteCareOrchestrator();

  // Auto-load on mount
  useEffect(() => {
    // IMPORTANT: pass requested include_* flags / max_trials through to the orchestrator.
    // MARS RULE: Show EVERYTHING. No filtered views.
    // Without this, pages (e.g. /ayesha-digital-twin) appear to "miss context" even though
    // the backend supports it.
    const requestBody = buildRequest({
      ...options,
      include_io_selection: true,
      max_trials: 50,
    });
    generatePlan(profile, requestBody);
  }, [profile, buildRequest, generatePlan, options.include_trials, options.include_soc]); // Re-run when profile/options change

  return {
    result,
    loading,
    error,
    refresh: () => generatePlan(profile, buildRequest(options)),
  };
};

export default useAyeshaCareData;
