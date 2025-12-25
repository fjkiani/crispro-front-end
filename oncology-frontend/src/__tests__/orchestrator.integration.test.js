/**
 * Integration Tests for MOAT Orchestrator
 * 
 * Tests the actual integration between frontend and backend.
 * These tests require a running backend server.
 * 
 * Run with: npm test -- orchestrator.integration.test.js
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

describe('MOAT Orchestrator Integration Tests', () => {
  let testPatientId = null;

  beforeAll(async () => {
    // Verify backend is running
    try {
      const healthResponse = await fetch(`${API_BASE}/api/orchestrate/health`);
      if (!healthResponse.ok) {
        throw new Error('Backend not available');
      }
      console.log('✅ Backend is running');
    } catch (error) {
      console.warn('⚠️ Backend not available, skipping integration tests');
      // Skip tests if backend not available
      return;
    }
  });

  describe('Backend Endpoint: /api/orchestrate/full', () => {
    it('should accept pipeline request with patient profile', async () => {
      const request = {
        patient_profile: {
          disease: 'ovarian_cancer',
          treatment_line: 1,
          mutations: [
            {
              gene: 'BRCA1',
              hgvs_p: 'p.C64R',
              chrom: '17',
              pos: 43044295,
              ref: 'C',
              alt: 'T'
            }
          ]
        },
        options: {
          skip_agents: []
        }
      };

      const formData = new FormData();
      formData.append('request', JSON.stringify(request));

      const response = await fetch(`${API_BASE}/api/orchestrate/full`, {
        method: 'POST',
        body: formData,
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('patient_id');
      expect(data).toHaveProperty('phase');
      expect(data).toHaveProperty('status');
      
      testPatientId = data.patient_id;
    });

    it('should accept file upload with pipeline request', async () => {
      // Create a mock VCF file
      const vcfContent = `##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
17	43044295	.	C	T	.	.	.
`;
      const blob = new Blob([vcfContent], { type: 'text/vcf' });
      const file = new File([blob], 'test.vcf', { type: 'text/vcf' });

      const request = {
        patient_profile: {
          disease: 'ovarian_cancer',
          treatment_line: 1
        },
        options: {}
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', 'vcf');
      formData.append('request', JSON.stringify(request));

      const response = await fetch(`${API_BASE}/api/orchestrate/full`, {
        method: 'POST',
        body: formData,
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('patient_id');
      testPatientId = data.patient_id;
    });

    it('should handle errors gracefully', async () => {
      const invalidRequest = {
        patient_profile: null, // Invalid
      };

      const formData = new FormData();
      formData.append('request', JSON.stringify(invalidRequest));

      const response = await fetch(`${API_BASE}/api/orchestrate/full`, {
        method: 'POST',
        body: formData,
      });

      // Should return error status
      expect(response.ok).toBe(false);
    });
  });

  describe('Backend Endpoint: /api/orchestrate/status/{patient_id}', () => {
    it('should return pipeline status for valid patient', async () => {
      if (!testPatientId) {
        // Create a test patient first
        const request = {
          patient_profile: {
            disease: 'ovarian_cancer',
            patient_id: `TEST_${Date.now()}`
          }
        };
        const formData = new FormData();
        formData.append('request', JSON.stringify(request));
        
        const createResponse = await fetch(`${API_BASE}/api/orchestrate/full`, {
          method: 'POST',
          body: formData,
        });
        const createData = await createResponse.json();
        testPatientId = createData.patient_id;
      }

      const response = await fetch(`${API_BASE}/api/orchestrate/status/${testPatientId}`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('patient_id');
      expect(data).toHaveProperty('phase');
      expect(data).toHaveProperty('progress');
      expect(data).toHaveProperty('updated_at');
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await fetch(`${API_BASE}/api/orchestrate/status/NONEXISTENT_PATIENT`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('Backend Endpoint: /api/orchestrate/state/{patient_id}', () => {
    it('should return full patient state', async () => {
      if (!testPatientId) {
        // Create a test patient first
        const request = {
          patient_profile: {
            disease: 'ovarian_cancer',
            patient_id: `TEST_${Date.now()}`
          }
        };
        const formData = new FormData();
        formData.append('request', JSON.stringify(request));
        
        const createResponse = await fetch(`${API_BASE}/api/orchestrate/full`, {
          method: 'POST',
          body: formData,
        });
        const createData = await createResponse.json();
        testPatientId = createData.patient_id;
      }

      const response = await fetch(`${API_BASE}/api/orchestrate/state/${testPatientId}`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('patient_id');
      expect(data).toHaveProperty('phase');
      expect(data).toHaveProperty('mutations');
      expect(Array.isArray(data.mutations)).toBe(true);
    });
  });

  describe('Backend Endpoint: /api/orchestrate/health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_BASE}/api/orchestrate/health`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
      expect(data).toHaveProperty('service');
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('Frontend-Backend Integration Flow', () => {
    it('should complete full pipeline workflow', async () => {
      // Step 1: Run pipeline
      const request = {
        patient_profile: {
          disease: 'ovarian_cancer',
          treatment_line: 1,
          mutations: [
            {
              gene: 'BRCA1',
              hgvs_p: 'p.C64R',
              chrom: '17',
              pos: 43044295
            },
            {
              gene: 'TP53',
              hgvs_p: 'p.R175H',
              chrom: '17',
              pos: 7577120
            }
          ]
        },
        options: {
          skip_agents: [] // Run all agents
        }
      };

      const formData = new FormData();
      formData.append('request', JSON.stringify(request));

      const pipelineResponse = await fetch(`${API_BASE}/api/orchestrate/full`, {
        method: 'POST',
        body: formData,
      });

      expect(pipelineResponse.ok).toBe(true);
      const pipelineData = await pipelineResponse.json();
      const patientId = pipelineData.patient_id;

      // Step 2: Poll for status
      let statusData;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max

      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const statusResponse = await fetch(`${API_BASE}/api/orchestrate/status/${patientId}`);
        statusData = await statusResponse.json();
        attempts++;
      } while (statusData.phase !== 'COMPLETE' && attempts < maxAttempts);

      // Step 3: Verify state has all expected fields
      const stateResponse = await fetch(`${API_BASE}/api/orchestrate/state/${patientId}`);
      expect(stateResponse.ok).toBe(true);
      const stateData = await stateResponse.json();

      // Verify all agents ran
      expect(stateData).toHaveProperty('biomarker_profile');
      expect(stateData).toHaveProperty('resistance_prediction');
      expect(stateData).toHaveProperty('drug_ranking');
      expect(stateData).toHaveProperty('trial_matches');
      expect(stateData).toHaveProperty('nutrition_plan');
      expect(stateData).toHaveProperty('care_plan');
      expect(stateData).toHaveProperty('monitoring_config');
    }, 60000); // 60 second timeout for full pipeline
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      // Try to connect to non-existent server
      try {
        await fetch('http://localhost:9999/api/orchestrate/health');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle malformed requests', async () => {
      const formData = new FormData();
      formData.append('request', 'invalid json');

      const response = await fetch(`${API_BASE}/api/orchestrate/full`, {
        method: 'POST',
        body: formData,
      });

      expect(response.ok).toBe(false);
    });
  });
});

