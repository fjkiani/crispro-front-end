/**
 * Knowledge Base React Hooks
 * Provides KB data fetching with TTL caching and provenance tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// TTL Cache implementation
class TTLCache {
  constructor(ttlMinutes = 10) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
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

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  // Persist to localStorage for slow-changing items
  persist(key, value) {
    try {
      const storageKey = `kb:v1:${key}`;
      const item = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to persist KB data to localStorage:', error);
    }
  }

  // Load from localStorage
  load(key) {
    try {
      const storageKey = `kb:v1:${key}`;
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const item = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - item.timestamp > this.ttl) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn('Failed to load KB data from localStorage:', error);
      return null;
    }
  }
}

// Global cache instance
const kbCache = new TTLCache(10); // 10 minute TTL

/**
 * @typedef {Object} KBResponse
 * @property {any} data - The KB data
 * @property {Object} provenance - Provenance information
 * @property {string} run_id - Run ID for tracking
 */

/**
 * @typedef {Object} KBHookState
 * @property {KBResponse|null} data - KB data
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 * @property {Object} provenance - Provenance information
 */

/**
 * Base KB fetch function with caching
 * @param {string} url - API endpoint URL
 * @param {string} cacheKey - Cache key for this request
 * @param {boolean} persist - Whether to persist to localStorage
 * @returns {Promise<KBResponse>}
 */
async function fetchKBData(url, cacheKey, persist = false) {
  // Check cache first
  let cached = kbCache.get(cacheKey);
  if (!cached && persist) {
    cached = kbCache.load(cacheKey);
  }
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // Safely get run_id from headers (may not be available due to CORS or missing header)
    let runId = null;
    try {
      if (response && response.headers) {
        runId = response.headers.get('x-run-id');
      }
    } catch (headerError) {
      console.warn('Could not access response headers:', headerError);
    }
    
    const provenance = {
      source: 'KB',
      run_id: runId,
      cached: false,
      timestamp: new Date().toISOString()
    };

    const result = { data, provenance };

    // Cache the result
    kbCache.set(cacheKey, result);
    if (persist) {
      kbCache.persist(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error(`KB fetch error for ${url}:`, error);
    throw error;
  }
}

/**
 * Hook for fetching gene information from KB
 * @param {string} gene - Gene symbol
 * @returns {KBHookState}
 */
export function useKbGene(gene) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    provenance: null
  });

  const fetchGene = useCallback(async () => {
    if (!gene) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `gene:${gene.toUpperCase()}`;
      const result = await fetchKBData(
        `/api/kb/client/gene/${encodeURIComponent(gene)}`,
        cacheKey,
        true // Persist gene data as it's slow-changing
      );

      setState({
        data: result.data,
        loading: false,
        error: null,
        provenance: result.provenance
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message,
        provenance: null
      });
    }
  }, [gene]);

  useEffect(() => {
    fetchGene();
  }, [fetchGene]);

  return state;
}

/**
 * Hook for fetching variant information from KB
 * @param {string} gene - Gene symbol
 * @param {string} [hgvs_p] - HGVS protein notation
 * @param {string} [chrom] - Chromosome
 * @param {number} [pos] - Position
 * @returns {KBHookState}
 */
export function useKbVariant(gene, hgvs_p = null, chrom = null, pos = null) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    provenance: null
  });

  const fetchVariant = useCallback(async () => {
    if (!gene) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({ gene });
      if (hgvs_p) params.append('hgvs_p', hgvs_p);
      if (chrom) params.append('chrom', chrom);
      if (pos) params.append('pos', pos.toString());

      const cacheKey = `variant:${gene}:${hgvs_p || chrom || pos || 'unknown'}`;
      const result = await fetchKBData(
        `/api/kb/client/variant?${params.toString()}`,
        cacheKey
      );

      setState({
        data: result.data,
        loading: false,
        error: null,
        provenance: result.provenance
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message,
        provenance: null
      });
    }
  }, [gene, hgvs_p, chrom, pos]);

  useEffect(() => {
    fetchVariant();
  }, [fetchVariant]);

  return state;
}

/**
 * Hook for fetching pathway information for genes
 * @param {string[]} genes - Array of gene symbols
 * @returns {KBHookState}
 */
export function useKbPathways(genes) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    provenance: null
  });

  const fetchPathways = useCallback(async () => {
    if (!genes || genes.length === 0) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const genesParam = genes.join(',');
      const cacheKey = `pathways:${genes.sort().join(',')}`;
      const result = await fetchKBData(
        `/api/kb/client/pathways?genes=${encodeURIComponent(genesParam)}`,
        cacheKey,
        true // Persist pathway data as it's slow-changing
      );

      setState({
        data: result.data,
        loading: false,
        error: null,
        provenance: result.provenance
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message,
        provenance: null
      });
    }
  }, [genes]);

  useEffect(() => {
    fetchPathways();
  }, [fetchPathways]);

  return state;
}

/**
 * Hook for fetching cohort coverage information
 * @param {string} gene - Gene symbol
 * @returns {KBHookState}
 */
export function useKbCohortCoverage(gene) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    provenance: null
  });

  const fetchCoverage = useCallback(async () => {
    if (!gene) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `coverage:${gene.toUpperCase()}`;
      const result = await fetchKBData(
        `/api/kb/client/cohort-coverage/${encodeURIComponent(gene)}`,
        cacheKey,
        true // Persist coverage data as it's slow-changing
      );

      setState({
        data: result.data,
        loading: false,
        error: null,
        provenance: result.provenance
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message,
        provenance: null
      });
    }
  }, [gene]);

  useEffect(() => {
    fetchCoverage();
  }, [fetchCoverage]);

  return state;
}

/**
 * Hook for searching curated facts
 * @param {string} query - Search query
 * @param {string[]} [types] - Types to search
 * @returns {KBHookState}
 */
export function useKbSearch(query, types = null) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    provenance: null
  });

  const fetchSearch = useCallback(async () => {
    if (!query) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({ q: query });
      if (types && types.length > 0) {
        params.append('types', types.join(','));
      }

      const cacheKey = `search:${query}:${types ? types.join(',') : 'all'}`;
      const result = await fetchKBData(
        `/api/kb/search?${params.toString()}`,
        cacheKey
      );

      setState({
        data: result.data,
        loading: false,
        error: null,
        provenance: result.provenance
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message,
        provenance: null
      });
    }
  }, [query, types]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return state;
}

/**
 * Utility function to clear KB cache
 */
export function clearKbCache() {
  kbCache.clear();
}

/**
 * Utility function to get cache statistics
 * @returns {Object} Cache statistics
 */
export function getKbCacheStats() {
  return {
    size: kbCache.cache.size,
    ttl: kbCache.ttl
  };
}


