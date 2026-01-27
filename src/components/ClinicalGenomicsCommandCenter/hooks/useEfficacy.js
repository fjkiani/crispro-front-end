import { useState } from 'react';
import { apiPost } from '../utils/genomicsUtils';

/**
 * Hook for Clinical Genomics efficacy prediction (S/P/E analysis)
 * Calls the unified /api/clinical_genomics/analyze_variant endpoint
 */
export const useEfficacy = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const predict = async (mutations, disease, profile = 'baseline') => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost('/api/clinical_genomics/analyze_variant', {
        mutations,
        disease,
        profile
      });
      setResult(data);
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  
  return { result, loading, error, predict };
};
