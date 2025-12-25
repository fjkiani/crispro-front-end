/**
 * Performance Utilities for Orchestrator Components
 * 
 * Provides utilities for optimizing component rendering and data handling.
 */

/**
 * Debounce function to limit function calls
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function calls
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoize expensive computations
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Paginate large arrays for efficient rendering
 */
export const paginate = (array, pageSize = 10, page = 1) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: array.slice(start, end),
    total: array.length,
    page,
    pageSize,
    totalPages: Math.ceil(array.length / pageSize),
  };
};

/**
 * Virtual scrolling helper for large lists
 */
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
  const start = Math.floor(scrollTop / itemHeight);
  const end = Math.min(
    start + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  return {
    start,
    end,
    visibleItems: items.slice(start, end),
    offsetY: start * itemHeight,
  };
};

/**
 * Batch API requests to reduce network overhead
 */
export const batchRequests = async (requests, batchSize = 5) => {
  const results = [];
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(req => req()));
    results.push(...batchResults);
  }
  return results;
};

/**
 * Image lazy loading helper
 */
export const lazyLoadImage = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
};

/**
 * Intersection Observer for lazy loading components
 */
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Performance monitoring
 */
export const measurePerformance = (label, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  };
};

