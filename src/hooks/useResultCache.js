import { useRef, useCallback } from 'react';

export default function useResultCache() {
  const storeRef = useRef(new Map());

  const makeKey = useCallback((parts) => String(parts.join('|')), []);

  const get = useCallback((key) => storeRef.current.get(key), []);
  const set = useCallback((key, value) => { storeRef.current.set(key, value); }, []);
  const has = useCallback((key) => storeRef.current.has(key), []);
  const clear = useCallback(() => storeRef.current.clear(), []);

  return { get, set, has, clear, makeKey };
} 