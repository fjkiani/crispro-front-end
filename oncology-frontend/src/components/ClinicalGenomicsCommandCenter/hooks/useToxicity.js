/**
 * Hook for toxicity risk assessment
 * 
 * Calls /api/safety/toxicity_risk with germline variants, drug MoA, and clinical context.
 * Returns risk score, confidence, factors, and provenance.
 * 
 * Research Use Only (RUO)
 */

import { useState, useCallback } from 'react';
import { apiPost } from '../utils/genomicsUtils';

export const useToxicity = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const assessRisk = useCallback(async (germlineVariants, somaticVariants, moa, disease, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        patient: { 
          germlineVariants: germlineVariants || []
        },
        candidate: { 
          type: 'drug',
          moa: moa
        },
        context: { 
          disease: disease,
          somaticVariants: somaticVariants || []
        },
        options: { profile: 'baseline', ...options }
      };
      
      const data = await apiPost('/api/safety/toxicity_risk', payload, {
        useCache: true  // 10-min TTL cache
      });
      
      setResult(data);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Toxicity assessment failed';
      setError(errorMsg);
      console.error('[useToxicity] Error:', err);
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
    assessRisk,
    reset
  };
};


/**
 * Hook for off-target preview
 * 
 * Calls /api/safety/off_target_preview with guide RNAs.
 * Returns heuristic safety scores for each guide.
 * 
 * P1: Heuristics only (no genome alignment yet)
 */
export const useOffTarget = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const previewGuides = useCallback(async (guides, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        guides,
        options: { profile: 'baseline', ...options }
      };
      
      const data = await apiPost('/api/safety/off_target_preview', payload, {
        useCache: true  // 10-min TTL cache
      });
      
      setResult(data);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Off-target preview failed';
      setError(errorMsg);
      console.error('[useOffTarget] Error:', err);
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
    previewGuides,
    reset
  };
};

















