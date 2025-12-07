/**
 * Orchestrator API Client
 * 
 * Modular API client for MOAT Orchestrator endpoints.
 * Provides type-safe methods for all orchestrator operations.
 */

const API_BASE = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

// Types
export interface PipelineRequest {
  patient_profile?: Record<string, any>;
  patient_id?: string;
  options?: Record<string, any>;
}

export interface PipelineResponse {
  job_id: string;
  patient_id: string;
  status: string;
  phase: string;
  progress: number;
  estimated_time_seconds?: number;
  alerts: Array<Record<string, any>>;
}

export interface StatusResponse {
  patient_id: string;
  phase: string;
  progress: number;
  updated_at: string;
  alerts: Array<Record<string, any>>;
  care_plan?: Record<string, any>;
}

export interface PatientState {
  patient_id: string;
  phase: string;
  created_at: string;
  updated_at: string;
  mutations: Array<Record<string, any>>;
  biomarker_profile?: Record<string, any>;
  resistance_prediction?: Record<string, any>;
  drug_ranking?: Array<Record<string, any>>;
  trial_matches?: Array<Record<string, any>>;
  nutrition_plan?: Record<string, any>;
  care_plan?: Record<string, any>;
  monitoring_config?: Record<string, any>;
  alerts: Array<Record<string, any>>;
}

export interface EventRequest {
  event_type: string;
  data: Record<string, any>;
  patient_id: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  timestamp: string;
  version?: string;
  components?: Record<string, boolean>;
  error?: string;
}

/**
 * Orchestrator API Client
 */
export const orchestratorApi = {
  /**
   * Run full patient care pipeline
   */
  async runPipeline(
    request: PipelineRequest,
    file?: File,
    fileType?: string
  ): Promise<PipelineResponse> {
    const formData = new FormData();
    
    if (file) {
      formData.append('file', file);
      if (fileType) {
        formData.append('file_type', fileType);
      }
    }
    
    formData.append('request', JSON.stringify(request));
    
    const response = await fetch(`${API_BASE}/api/orchestrate/full`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Pipeline execution failed');
    }
    
    return response.json();
  },

  /**
   * Get pipeline status for a patient
   */
  async getStatus(patientId: string): Promise<StatusResponse> {
    const response = await fetch(`${API_BASE}/api/orchestrate/status/${patientId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get status');
    }
    
    return response.json();
  },

  /**
   * Get full patient state
   */
  async getState(patientId: string): Promise<PatientState> {
    const response = await fetch(`${API_BASE}/api/orchestrate/state/${patientId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get patient state');
    }
    
    return response.json();
  },

  /**
   * Process an event (trigger system)
   */
  async processEvent(event: EventRequest): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE}/api/orchestrate/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Event processing failed');
    }
    
    return response.json();
  },

  /**
   * List all patient states
   */
  async listStates(limit = 50, phase?: string): Promise<Array<PatientState>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (phase) {
      params.append('phase', phase);
    }
    
    const response = await fetch(`${API_BASE}/api/orchestrate/states?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to list states');
    }
    
    return response.json();
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE}/api/orchestrate/health`);
    
    if (!response.ok) {
      return {
        status: 'unhealthy',
        service: 'orchestrator',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      };
    }
    
    return response.json();
  },
};

