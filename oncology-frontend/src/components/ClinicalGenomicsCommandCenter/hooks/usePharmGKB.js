/**
 * ⚔️ usePharmGKB Hook - Pharmacogenomics Analysis ⚔️
 * 
 * Calls:
 * - POST /api/pharmgkb/metabolizer_status (CYP2D6, CYP2C19)
 * - POST /api/pharmgkb/drug_interaction
 * 
 * Returns: metabolizer status, drug interactions, recommendations
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import { useState, useCallback } from 'react';
import { apiPost, parseError } from '../utils/genomicsUtils';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';

export const usePharmGKB = () => {
  const { updateResult, setLoadingState, setError } = useClinicalGenomicsContext();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState(null);

  const analyzeMetabolizer = useCallback(async (gene, diplotype, options = {}) => {
    setLoading(true);
    setLoadingState('pharmgkb', true);
    setErrorState(null);
    setError('pharmgkb', null);

    try {
      const payload = {
        gene,
        diplotype
      };

      const data = await apiPost('/api/pharmgkb/metabolizer_status', payload, {
        useCache: options.useCache !== false
      });

      setResult(prev => ({ ...prev, metabolizer: data }));
      updateResult('pharmgkb', { ...result, metabolizer: data });
      return data;

    } catch (err) {
      const errorMsg = parseError(err);
      setErrorState(errorMsg);
      setError('pharmgkb', errorMsg);
      throw err;

    } finally {
      setLoading(false);
      setLoadingState('pharmgkb', false);
    }
  }, [result, updateResult, setLoadingState, setError]);

  const analyzeDrugInteraction = useCallback(async (drug, gene, mutations = [], options = {}) => {
    setLoading(true);
    setLoadingState('pharmgkb', true);
    setErrorState(null);
    setError('pharmgkb', null);

    try {
      const payload = {
        drug,
        gene,
        mutations
      };

      const data = await apiPost('/api/pharmgkb/drug_interaction', payload, {
        useCache: options.useCache !== false
      });

      setResult(prev => ({ ...prev, drug_interaction: data }));
      updateResult('pharmgkb', { ...result, drug_interaction: data });
      return data;

    } catch (err) {
      const errorMsg = parseError(err);
      setErrorState(errorMsg);
      setError('pharmgkb', errorMsg);
      throw err;

    } finally {
      setLoading(false);
      setLoadingState('pharmgkb', false);
    }
  }, [result, updateResult, setLoadingState, setError]);

  const clear = useCallback(() => {
    setResult(null);
    setErrorState(null);
    updateResult('pharmgkb', null);
    setError('pharmgkb', null);
  }, [updateResult, setError]);

  return {
    result,
    loading,
    error,
    analyzeMetabolizer,
    analyzeDrugInteraction,
    clear
  };
};

export default usePharmGKB;


