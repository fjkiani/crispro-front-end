import useApiClient from '../../hooks/useApiClient';

export const useEfficacyApi = (modelId) => {
  const api = useApiClient(modelId);
  const getConfig = async () => api.get('/api/efficacy/config');
  const getCalibrationStatus = async () => api.get('/api/efficacy/calibration/status');
  const predict = async (payload) => api.post('/api/efficacy/predict', payload);
  const explain = async (payload) => api.post('/api/efficacy/explain', payload);
  return { getConfig, getCalibrationStatus, predict, explain };
}; 