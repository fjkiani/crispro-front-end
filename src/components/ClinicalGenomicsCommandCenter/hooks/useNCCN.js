/**
 * ⚔️ useNCCN Hook - NCCN Guideline Compliance ⚔️
 * 
 * Calls POST /api/nccn/check_guideline
 * Returns: compliance status, category, evidence, recommendations
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import { useState, useCallback } from 'react';
import { apiPost, parseError } from '../utils/genomicsUtils';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';

export const useNCCN = () => {
  const { updateResult, setLoadingState, setError } = useClinicalGenomicsContext();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState(null);

  const checkGuideline = useCallback(async (cancerType, therapy, mutations = [], options = {}) => {
    setLoading(true);
    setLoadingState('nccn', true);
    setErrorState(null);
    setError('nccn', null);

    try {
      const payload = {
        cancer_type: cancerType,
        therapy,
        mutations: Array.isArray(mutations) ? mutations : [mutations]
      };

      const data = await apiPost('/api/nccn/check_guideline', payload, {
        useCache: options.useCache !== false
      });

      setResult(data);
      updateResult('nccn', data);
      return data;

    } catch (err) {
      const errorMsg = parseError(err);
      setErrorState(errorMsg);
      setError('nccn', errorMsg);
      throw err;

    } finally {
      setLoading(false);
      setLoadingState('nccn', false);
    }
  }, [updateResult, setLoadingState, setError]);

  const clear = useCallback(() => {
    setResult(null);
    setErrorState(null);
    updateResult('nccn', null);
    setError('nccn', null);
  }, [updateResult, setError]);

  return {
    result,
    loading,
    error,
    checkGuideline,
    clear
  };
};

export default useNCCN;


