/**
 * ⚔️ useClinicalTrials Hook - Clinical Trial Matching ⚔️
 * 
 * Calls:
 * - POST /api/clinical_trials/match
 * - POST /api/clinical_trials/eligibility_check
 * 
 * Returns: matched trials with eligibility scores, phase, status, location
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import { useState, useCallback } from 'react';
import { apiPost, parseError } from '../utils/genomicsUtils';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';

export const useClinicalTrials = () => {
  const { updateResult, setLoadingState, setError } = useClinicalGenomicsContext();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState(null);

  const matchTrials = useCallback(async (mutations, cancerType, options = {}) => {
    setLoading(true);
    setLoadingState('trials', true);
    setErrorState(null);
    setError('trials', null);

    try {
      const payload = {
        mutations,
        cancer_type: cancerType,
        max_results: options.maxResults || 10
      };

      const data = await apiPost('/api/clinical_trials/match', payload, {
        useCache: options.useCache !== false
      });

      setResult(data);
      updateResult('trials', data);
      return data;

    } catch (err) {
      const errorMsg = parseError(err);
      setErrorState(errorMsg);
      setError('trials', errorMsg);
      throw err;

    } finally {
      setLoading(false);
      setLoadingState('trials', false);
    }
  }, [updateResult, setLoadingState, setError]);

  const checkEligibility = useCallback(async (trialId, patientProfile, options = {}) => {
    setLoading(true);
    setLoadingState('trials', true);

    try {
      const payload = {
        trial_id: trialId,
        patient_profile: patientProfile
      };

      const data = await apiPost('/api/clinical_trials/eligibility_check', payload, {
        useCache: options.useCache !== false
      });

      return data;

    } catch (err) {
      const errorMsg = parseError(err);
      setErrorState(errorMsg);
      setError('trials', errorMsg);
      throw err;

    } finally {
      setLoading(false);
      setLoadingState('trials', false);
    }
  }, [setLoadingState, setError]);

  const clear = useCallback(() => {
    setResult(null);
    setErrorState(null);
    updateResult('trials', null);
    setError('trials', null);
  }, [updateResult, setError]);

  return {
    result,
    loading,
    error,
    matchTrials,
    checkEligibility,
    clear
  };
};

export default useClinicalTrials;


