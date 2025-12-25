/**
 * usePerformance Hook
 * 
 * React hook for performance monitoring and optimization.
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { measurePerformance, debounce, throttle, memoize } from '../utils/performance';

/**
 * Hook to measure component render performance
 */
export const useRenderPerformance = (componentName) => {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);

  useEffect(() => {
    const start = performance.now();
    renderCount.current += 1;

    return () => {
      const end = performance.now();
      const renderTime = end - start;
      renderTimes.current.push(renderTime);

      // Log if render time is concerning
      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }

      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
    };
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      : 0,
  };
};

/**
 * Hook for debounced callbacks
 */
export const useDebounce = (callback, delay) => {
  const debouncedCallback = useCallback(
    debounce(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook for throttled callbacks
 */
export const useThrottle = (callback, limit) => {
  const throttledCallback = useCallback(
    throttle(callback, limit),
    [callback, limit]
  );

  return throttledCallback;
};

/**
 * Hook for lazy loading with intersection observer
 */
export const useLazyLoad = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return [elementRef, isVisible];
};

/**
 * Hook for memoizing expensive computations
 */
export const useMemoizedValue = (computeFn, dependencies) => {
  const memoizedFn = useMemo(
    () => memoize(computeFn),
    dependencies
  );

  return useMemo(
    () => memoizedFn(),
    [memoizedFn, ...dependencies]
  );
};

