/**
 * Hook for dosing guidance API
 * 
 * Calls /api/dosing/guidance with gene, variant, drug, and treatment history.
 * Returns dosing recommendations with adjustment factors, CPIC levels, and monitoring.
 * 
 * Research Use Only (RUO)
 */

import { useState, useCallback } from 'react';
import { apiPost } from '../../components/ClinicalGenomicsCommandCenter/utils/genomicsUtils';

export const useDosingGuidance = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getGuidance = useCallback(async (gene, variant, drug, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        gene,
        variant: variant || null,
        drug,
        standard_dose: options.standard_dose || null,
        treatment_line: options.treatment_line || null,
        prior_therapies: options.prior_therapies || [],
        disease: options.disease || null
      };
      
      const data = await apiPost('/api/dosing/guidance', payload, {
        useCache: true  // 10-min TTL cache
      });
      
      setResult(data);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Dosing guidance failed';
      setError(errorMsg);
      console.error('[useDosingGuidance] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);
  
  return {
    result,
    loading,
    error,
    getGuidance,
    reset
  };
};

