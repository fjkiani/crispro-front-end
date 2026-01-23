/**
 * useOrchestrator Hook
 * 
 * React hook for orchestrator operations.
 * Provides state management and methods for pipeline execution.
 */

import { useState, useCallback } from 'react';
import { orchestratorApi, PipelineRequest, PatientState, StatusResponse } from '../services/api/orchestrator';

export interface UseOrchestratorReturn {
  state: PatientState | null;
  status: StatusResponse | null;
  loading: boolean;
  error: Error | null;
  runPipeline: (request: PipelineRequest, file?: File, fileType?: string) => Promise<void>;
  refreshStatus: (patientId: string) => Promise<void>;
  refreshState: (patientId: string) => Promise<void>;
  clearError: () => void;
}

export const useOrchestrator = (patientId?: string): UseOrchestratorReturn => {
  const [state, setState] = useState<PatientState | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Run full pipeline
   */
  const runPipeline = useCallback(async (
    request: PipelineRequest,
    file?: File,
    fileType?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orchestratorApi.runPipeline(request, file, fileType);
      
      // If patient ID provided, fetch state
      if (response.patient_id) {
        const patientState = await orchestratorApi.getState(response.patient_id);
        setState(patientState);
        
        const statusResponse = await orchestratorApi.getStatus(response.patient_id);
        setStatus(statusResponse);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Pipeline execution failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh pipeline status
   */
  const refreshStatus = useCallback(async (patientId: string) => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const statusResponse = await orchestratorApi.getStatus(patientId);
      setStatus(statusResponse);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh status');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh full patient state
   */
  const refreshState = useCallback(async (patientId: string) => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const patientState = await orchestratorApi.getState(patientId);
      setState(patientState);
      
      const statusResponse = await orchestratorApi.getStatus(patientId);
      setStatus(statusResponse);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh state');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh if patientId provided
  // useEffect(() => {
  //   if (patientId) {
  //     refreshState(patientId);
  //   }
  // }, [patientId, refreshState]);

  return {
    state,
    status,
    loading,
    error,
    runPipeline,
    refreshStatus,
    refreshState,
    clearError,
  };
};


