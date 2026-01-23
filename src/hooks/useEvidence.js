/**
 * Evidence React Hooks (ClinVar, AlphaMissense Fusion Coverage)
 * Provides evidence data fetching with TTL caching
 * 
 * Hooks:
 * - useClinVar: ClinVar classification and review status
 * - useFusionCoverage: AlphaMissense (Fusion Engine) coverage check
 */

import { useState, useEffect, useCallback } from 'react';

// TTL Cache implementation
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

// Global cache instance (30 min TTL for evidence as it's slow-changing)
const evidenceCache = new TTLCache(30);

const API_BASE_URL = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

/**
 * Build query string from coords
 */
function buildVariantQuery({ chrom, pos, ref, alt }) {
  if (!chrom || !pos || !ref || !alt) return null;
  const params = new URLSearchParams({
    chrom: String(chrom),
    pos: String(pos),
    ref: String(ref).toUpperCase(),
    alt: String(alt).toUpperCase()
  });
  return params.toString();
}

/**
 * Base fetch function with caching
 */
async function fetchEvidenceData(url, cacheKey) {
  // Check cache first
  const cached = evidenceCache.get(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the result
    evidenceCache.set(cacheKey, data);

    return { ...data, fromCache: false };
  } catch (error) {
    console.error(`Evidence fetch error for ${url}:`, error);
    throw error;
  }
}

/**
 * Hook for fetching ClinVar classification
 * @param {Object} params
 * @param {string} params.chrom - Chromosome
 * @param {number} params.pos - Position
 * @param {string} params.ref - Reference allele
 * @param {string} params.alt - Alternate allele
 * @returns {Object} - { data, loading, error, refetch }
 */
export function useClinVar({ chrom, pos, ref, alt }) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    const query = buildVariantQuery({ chrom, pos, ref, alt });
    if (!query) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `clinvar:${chrom}:${pos}:${ref}:${alt}`;
      const result = await fetchEvidenceData(
        `${API_BASE_URL}/api/evidence/clinvar?${query}`,
        cacheKey
      );

      setState({
        data: {
          classification: result.classification || null,
          review_status: result.review_status || null,
          variant_id: result.variant_id || null,
          last_evaluated: result.last_evaluated || null,
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
  }, [chrom, pos, ref, alt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Hook for checking AlphaMissense (Fusion Engine) coverage
 * @param {Object} params
 * @param {string} params.chrom - Chromosome
 * @param {number} params.pos - Position
 * @param {string} params.ref - Reference allele
 * @param {string} params.alt - Alternate allele
 * @returns {Object} - { data: { eligible: boolean }, loading, error, refetch }
 */
export function useFusionCoverage({ chrom, pos, ref, alt }) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    const query = buildVariantQuery({ chrom, pos, ref, alt });
    if (!query) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `fusion:${chrom}:${pos}:${ref}:${alt}`;
      const result = await fetchEvidenceData(
        `${API_BASE_URL}/api/fusion/coverage?${query}`,
        cacheKey
      );

      setState({
        data: {
          eligible: result.am_covered === true,
          am_covered: result.am_covered,
          message: result.message || null,
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
  }, [chrom, pos, ref, alt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Utility function to clear evidence cache
 */
export function clearEvidenceCache() {
  evidenceCache.clear();
}

/**
 * Utility function to get cache statistics
 */
export function getEvidenceCacheStats() {
  return {
    size: evidenceCache.cache.size,
    ttl: evidenceCache.ttl
  };
}

