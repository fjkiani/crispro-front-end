/**
 * Insights React Hooks (S/P/E Framework)
 * Provides insights data fetching with TTL caching and provenance tracking
 * 
 * Hooks:
 * - useInsightsBundle: Fetches all 4 insights in parallel
 * - useFunctionalityChange: Individual functionality insight
 * - useChromatin: Individual chromatin accessibility insight
 * - useEssentiality: Individual essentiality insight
 * - useRegulatoryImpact: Individual regulatory/splicing insight
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { API_ROOT as API_BASE_URL } from '../lib/apiConfig';

// TTL Cache implementation (reuse pattern from useKb)
class TTLCache {
  constructor(ttlMinutes = 10) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instance (10 min TTL for insights)
const insightsCache = new TTLCache(10);


/**
 * @typedef {Object} InsightResponse
 * @property {number} score - Insight score [0,1]
 * @property {Object} provenance - Provenance information
 * @property {string} [run_id] - Run ID for tracking
 */

/**
 * @typedef {Object} InsightHookState
 * @property {InsightResponse|null} data - Insight data
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 * @property {Function} refetch - Manual refetch function
 */

/**
 * Base fetch function with caching
 */
async function fetchInsightData(url, payload, cacheKey) {
  // Check cache first
  const cached = insightsCache.get(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the result
    insightsCache.set(cacheKey, data);

    return { ...data, fromCache: false };
  } catch (error) {
    console.error(`Insights fetch error for ${url}:`, error);
    throw error;
  }
}

/**
 * Hook for fetching protein functionality change
 * @param {Object} params
 * @param {string} params.gene - Gene symbol
 * @param {string} params.hgvs_p - HGVS protein notation
 * @param {Array} [params.variants] - Optional genomic coordinates
 * @param {string} [params.modelId] - Model ID (default: evo2_7b)
 * @returns {InsightHookState}
 */
export function useFunctionalityChange({ gene, hgvs_p, variants = null, modelId = 'evo2_7b' }) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!gene || !hgvs_p) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `func:${gene}:${hgvs_p}:${modelId}`;
      const payload = { gene, hgvs_p, model_id: modelId };
      if (variants) payload.variants = variants;

      const result = await fetchInsightData(
        `${API_BASE_URL}/api/insights/predict_protein_functionality_change`,
        payload,
        cacheKey
      );

      setState({
        data: {
          score: result.functionality_change_score,
          affected_domains: result.affected_domains || [],
          provenance: result.provenance,
          fromCache: result.fromCache
        },
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message
      });
    }
  }, [gene, hgvs_p, variants, modelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Hook for fetching chromatin accessibility
 * @param {Object} params
 * @param {string} params.chrom - Chromosome
 * @param {number} params.pos - Position
 * @param {number} [params.radius] - Radius (default: 500)
 * @returns {InsightHookState}
 */
export function useChromatin({ chrom, pos, radius = 500 }) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!chrom || !pos) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `chrom:${chrom}:${pos}:${radius}`;
      const payload = { chrom, pos, radius };

      const result = await fetchInsightData(
        `${API_BASE_URL}/api/insights/predict_chromatin_accessibility`,
        payload,
        cacheKey
      );

      setState({
        data: {
          score: result.accessibility_score,
          method: result.provenance?.method || 'heuristic',
          confidence: result.confidence,
          provenance: result.provenance,
          fromCache: result.fromCache
        },
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message
      });
    }
  }, [chrom, pos, radius]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Hook for fetching gene essentiality
 * @param {Object} params
 * @param {string} params.gene - Gene symbol
 * @param {Array} params.variants - Variants array with coords
 * @param {string} [params.modelId] - Model ID (default: evo2_7b)
 * @returns {InsightHookState}
 */
export function useEssentiality({ gene, variants, modelId = 'evo2_7b' }) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!gene || !variants || variants.length === 0) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `ess:${gene}:${variants.length}:${modelId}`;
      const payload = { gene, variants, model_id: modelId };

      const result = await fetchInsightData(
        `${API_BASE_URL}/api/insights/predict_gene_essentiality`,
        payload,
        cacheKey
      );

      setState({
        data: {
          score: result.essentiality_score,
          flags: result.flags || {},
          rationale: result.rationale,
          confidence: result.confidence,
          calibration: result.provenance?.calibration,
          provenance: result.provenance,
          fromCache: result.fromCache
        },
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message
      });
    }
  }, [gene, variants, modelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Hook for fetching regulatory/splicing impact
 * @param {Object} params
 * @param {string} params.chrom - Chromosome
 * @param {number} params.pos - Position
 * @param {string} params.ref - Reference allele
 * @param {string} params.alt - Alternate allele
 * @param {string} [params.modelId] - Model ID (default: evo2_7b)
 * @returns {InsightHookState}
 */
export function useRegulatoryImpact({ chrom, pos, ref, alt, modelId = 'evo2_7b' }) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!chrom || !pos || !ref || !alt) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `reg:${chrom}:${pos}:${ref}:${alt}:${modelId}`;
      const payload = { chrom, pos, ref, alt, model_id: modelId };

      const result = await fetchInsightData(
        `${API_BASE_URL}/api/insights/predict_splicing_regulatory`,
        payload,
        cacheKey
      );

      setState({
        data: {
          score: result.regulatory_impact_score,
          provenance: result.provenance,
          fromCache: result.fromCache
        },
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message
      });
    }
  }, [chrom, pos, ref, alt, modelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Hook for fetching all 4 insights in parallel (Bundle)
 * @param {Object} params
 * @param {string} params.gene - Gene symbol
 * @param {string} [params.hgvs_p] - HGVS protein notation
 * @param {Object} [params.coords] - Genomic coordinates {chrom, pos, ref, alt}
 * @param {Array} [params.variants] - Full variants array for essentiality
 * @param {string} [params.modelId] - Model ID (default: evo2_7b)
 * @returns {Object} - { functionality, chromatin, essentiality, regulatory, loading, error, refetchAll }
 */
export function useInsightsBundle({ gene, hgvs_p = null, coords = null, variants = null, modelId = 'evo2_7b' }) {
  const functionality = useFunctionalityChange({ 
    gene, 
    hgvs_p, 
    variants, 
    modelId 
  });

  const chromatin = useChromatin({ 
    chrom: coords?.chrom, 
    pos: coords?.pos 
  });

  const essentiality = useEssentiality({ 
    gene, 
    variants: variants || (coords ? [{gene, ...coords, consequence: 'missense_variant'}] : []), 
    modelId 
  });

  const regulatory = useRegulatoryImpact({ 
    chrom: coords?.chrom, 
    pos: coords?.pos, 
    ref: coords?.ref, 
    alt: coords?.alt, 
    modelId 
  });

  const loading = functionality.loading || chromatin.loading || essentiality.loading || regulatory.loading;
  const hasAnyError = functionality.error || chromatin.error || essentiality.error || regulatory.error;

  const refetchAll = useCallback(() => {
    functionality.refetch();
    chromatin.refetch();
    essentiality.refetch();
    regulatory.refetch();
  }, [functionality, chromatin, essentiality, regulatory]);

  return useMemo(() => ({
    functionality: functionality.data,
    chromatin: chromatin.data,
    essentiality: essentiality.data,
    regulatory: regulatory.data,
    loading,
    error: hasAnyError,
    refetchAll
  }), [functionality.data, chromatin.data, essentiality.data, regulatory.data, loading, hasAnyError, refetchAll]);
}

/**
 * Utility function to clear insights cache
 */
export function clearInsightsCache() {
  insightsCache.clear();
}

/**
 * Utility function to get cache statistics
 */
export function getInsightsCacheStats() {
  return {
    size: insightsCache.cache.size,
    ttl: insightsCache.ttl
  };
}

