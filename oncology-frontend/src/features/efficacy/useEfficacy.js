import { useMemo, useRef } from 'react';
import { useEfficacyApi } from './api';

export default function useEfficacy(modelId) {
  const api = useEfficacyApi(modelId);
  const cacheRef = useRef(new Map());

  const key = (obj) => JSON.stringify(obj || {});

  const getConfig = async () => {
    const k = 'config';
    if (cacheRef.current.has(k)) return cacheRef.current.get(k);
    const res = await api.getConfig();
    cacheRef.current.set(k, res);
    return res;
  };

  const getCalibrationStatus = async () => {
    const k = 'calibration_status';
    if (cacheRef.current.has(k)) return cacheRef.current.get(k);
    const res = await api.getCalibrationStatus();
    cacheRef.current.set(k, res);
    return res;
  };

  const predict = async (payload) => {
    const k = 'predict:' + key(payload);
    if (cacheRef.current.has(k)) return cacheRef.current.get(k);
    const res = await api.predict(payload);
    cacheRef.current.set(k, res);
    return res;
  };

  const explain = async (payload) => {
    const k = 'explain:' + key(payload);
    if (cacheRef.current.has(k)) return cacheRef.current.get(k);
    const res = await api.explain(payload);
    cacheRef.current.set(k, res);
    return res;
  };

  return useMemo(() => ({ getConfig, getCalibrationStatus, predict, explain }), []);
} 