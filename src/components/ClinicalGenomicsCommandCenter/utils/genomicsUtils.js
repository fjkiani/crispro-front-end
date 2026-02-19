import { API_ROOT as API_BASE } from '../../../lib/apiConfig';

/**
 * ⚔️ CLINICAL GENOMICS - API CLIENT UTILITIES ⚔️
 * 
 * Lightweight fetch wrapper with:
 * - Base URL from env (VITE_API_ROOT)
 * - 60-second timeout
 * - Exponential backoff retry (2 attempts: 1s, 2s delays)
 * - Proper error extraction from backend `detail` field
 * - Simple 10-minute cache (variant hash → result)
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

const DEFAULT_TIMEOUT = 60000; // 60 seconds
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Simple in-memory cache
const cache = new Map();

/**
 * Generate cache key from request payload
 */
export const getCacheKey = (path, body) => {
  const payload = JSON.stringify({ path, body });
  return btoa(payload); // Simple base64 encoding as hash
};

/**
 * Get cached result if valid
 */
export const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

/**
 * Store result in cache
 */
export const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Clear all cache entries
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Main API POST helper with retry and timeout
 * 
 * @param {string} path - API endpoint path (e.g., '/api/acmg/classify_variant')
 * @param {object} body - Request payload
 * @param {object} options - { signal, useCache, skipRetry }
 * @returns {Promise<object>} API response data
 * @throws {Error} Network or API error
 */
export async function apiPost(path, body, { signal, useCache = true, skipRetry = false } = {}) {
  const url = `${API_BASE}${path}`;

  // Check cache first
  if (useCache) {
    const cacheKey = getCacheKey(path, body);
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] ${path}`);
      return cached;
    }
  }

  const controller = new AbortController();
  const abortSignal = signal || controller.signal;

  // Timeout handler
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  const doFetch = async (attempt = 1) => {
    try {
      // Get auth token from localStorage if available
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Add Authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: abortSignal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Cache successful result
      if (useCache) {
        const cacheKey = getCacheKey(path, body);
        setCache(cacheKey, data);
      }

      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic (exponential backoff)
      if (!skipRetry && attempt < 3 && error.name !== 'AbortError') {
        const delay = attempt * 1000; // 1s, 2s
        console.log(`[Retry ${attempt}] ${path} after ${delay}ms: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return doFetch(attempt + 1);
      }

      // Re-throw after retries exhausted or abort
      throw error;
    }
  };

  return doFetch();
}

/**
 * API GET helper (for health checks, etc.)
 */
export async function apiGet(path, { signal } = {}) {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const abortSignal = signal || controller.signal;

  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    // Get auth token from localStorage if available
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const headers = {
      'Accept': 'application/json'
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: abortSignal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Variant validation helpers
 */
export const validateVariant = (variant) => {
  const errors = {};

  if (!variant.gene) {
    errors.gene = 'Gene symbol required';
  }

  if (!variant.chrom && !variant.hgvs_p && !variant.hgvs_c) {
    errors.variant = 'Either genomic coordinates (chrom/pos/ref/alt) or HGVS notation required';
  }

  if (variant.chrom && !variant.pos) {
    errors.pos = 'Position required when chromosome specified';
  }

  if (variant.pos && (!variant.ref || !variant.alt)) {
    errors.ref_alt = 'REF and ALT alleles required when position specified';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format variant for display
 */
export const formatVariant = (variant) => {
  if (variant.hgvs_p) {
    return `${variant.gene} ${variant.hgvs_p}`;
  }
  if (variant.hgvs_c) {
    return `${variant.gene} ${variant.hgvs_c}`;
  }
  if (variant.chrom && variant.pos) {
    return `${variant.gene} ${variant.chrom}:${variant.pos} ${variant.ref}>${variant.alt}`;
  }
  return variant.gene || 'Unknown variant';
};

/**
 * Generate unique run ID for provenance
 */
export const generateRunId = () => {
  return `cgcc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse error message for user-friendly display
 */
export const parseError = (error) => {
  if (error.name === 'AbortError') {
    return 'Request timeout - please try again';
  }

  if (error.message.includes('Failed to fetch')) {
    return 'Network error - check backend server is running';
  }

  return error.message || 'Unknown error occurred';
};

export default {
  apiPost,
  apiGet,
  getCacheKey,
  getCached,
  setCache,
  clearCache,
  validateVariant,
  formatVariant,
  generateRunId,
  parseError
};


