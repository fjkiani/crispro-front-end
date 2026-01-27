/**
 * ⚔️ useACMG Hook - ACMG/AMP Variant Classification ⚔️
 * 
 * Calls POST /api/acmg/classify_variant
 * Returns: classification, confidence, evidence_codes, rationale, provenance
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import { useState, useCallback } from 'react';
import { apiPost, parseError } from '../utils/genomicsUtils';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';

export const useACMG = () => {
  const { updateResult, setLoadingState, setError } = useClinicalGenomicsContext();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState(null);

  const classify = useCallback(async (variant, options = {}) => {
    setLoading(true);
    setLoadingState('acmg', true);
    setErrorState(null);
    setError('acmg', null);

    try {
      const payload = {
        gene: variant.gene,
        chrom: variant.chrom,
        pos: variant.pos ? parseInt(variant.pos) : null,
        ref: variant.ref,
        alt: variant.alt,
        hgvs_p: variant.hgvs_p,
        consequence: variant.consequence,
        transcript_id: variant.transcript_id
      };

      const data = await apiPost('/api/acmg/classify_variant', payload, {
        useCache: options.useCache !== false
      });

      setResult(data);
      updateResult('acmg', data);
      return data;

    } catch (err) {
      const errorMsg = parseError(err);
      setErrorState(errorMsg);
      setError('acmg', errorMsg);
      throw err;

    } finally {
      setLoading(false);
      setLoadingState('acmg', false);
    }
  }, [updateResult, setLoadingState, setError]);

  const clear = useCallback(() => {
    setResult(null);
    setErrorState(null);
    updateResult('acmg', null);
    setError('acmg', null);
  }, [updateResult, setError]);

  return {
    result,
    loading,
    error,
    classify,
    clear
  };
};

export default useACMG;

