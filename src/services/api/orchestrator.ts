import { API_ROOT as API_BASE } from '../../lib/apiConfig';

/**
 * Orchestrator API Client
 * 
 * Modular API client for MOAT Orchestrator endpoints.
 * Provides type-safe methods for all orchestrator operations.
 */


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
    if (file) {
      // File upload: use dedicated upload endpoint
      const formData = new FormData();
      formData.append('file', file);

      if (fileType) {
        formData.append('file_type', fileType);
      }

      // Add request metadata as form fields
      if (request.patient_id) {
        formData.append('patient_id', request.patient_id);
      }
      if (request.options?.disease) {
        formData.append('disease', request.options.disease);
      }
      if (request.options?.treatment_line) {
        formData.append('treatment_line', request.options.treatment_line.toString());
      }
      if (request.options?.prior_therapies) {
        formData.append('prior_therapies', JSON.stringify(request.options.prior_therapies));
      }
      if (request.options?.current_regimen) {
        formData.append('current_regimen', request.options.current_regimen);
      }
      if (request.options?.skip_agents) {
        formData.append('skip_agents', JSON.stringify(request.options.skip_agents));
      }

      const response = await fetch(`${API_BASE}/api/orchestrate/full/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header for FormData - browser will set it with boundary
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(error.detail || 'Pipeline execution failed');
      }

      return response.json();
    } else {
      // No file: send JSON body to standard endpoint
      // Build proper request format from PipelineRequest
      const requestBody = {
        disease: request.options?.disease || 'ovarian_cancer',
        mutations: request.patient_profile?.mutations || [],
        patient_id: request.patient_id,
        treatment_line: request.options?.treatment_line || 1,
        prior_therapies: request.options?.prior_therapies,
        current_regimen: request.options?.current_regimen,
        skip_agents: request.options?.skip_agents,
      };

      const response = await fetch(`${API_BASE}/api/orchestrate/full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(error.detail || 'Pipeline execution failed');
      }

      return response.json();
    }
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


