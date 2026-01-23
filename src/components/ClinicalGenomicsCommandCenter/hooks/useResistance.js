/**
 * ⚔️ useResistance Hook - Drug Resistance Prediction ⚔️
 * 
 * Calls POST /api/resistance/predict
 * Uses Evo2 scoring + pathway analysis + known mutations
 * 
 * Returns: resistance risk, mechanisms, confidence, evidence
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import { useState, useCallback } from 'react';
import { apiPost, parseError } from '../utils/genomicsUtils';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';

export const useResistance = () => {
  const { updateResult, setLoadingState, setError } = useClinicalGenomicsContext();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState(null);

  const predictResistance = useCallback(async (drugClass, mutations, options = {}) => {
    setLoading(true);
    setLoadingState('resistance', true);
    setErrorState(null);
    setError('resistance', null);

    try {
      const payload = {
        drug_class: drugClass,
        mutations: Array.isArray(mutations) ? mutations : [mutations]
      };

      const data = await apiPost('/api/resistance/predict', payload, {
        useCache: options.useCache !== false
      });

      setResult(data);
      updateResult('resistance', data);
      return data;

    } catch (err) {
      const errorMsg = parseError(err);
      setErrorState(errorMsg);
      setError('resistance', errorMsg);
      throw err;

    } finally {
      setLoading(false);
      setLoadingState('resistance', false);
    }
  }, [updateResult, setLoadingState, setError]);

  const clear = useCallback(() => {
    setResult(null);
    setErrorState(null);
    updateResult('resistance', null);
    setError('resistance', null);
  }, [updateResult, setError]);

  return {
    result,
    loading,
    error,
    predictResistance,
    clear
  };
};

export default useResistance;


