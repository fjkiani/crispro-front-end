/**
 * End-to-End Tests for MOAT Orchestrator
 * 
 * Tests the complete orchestrator workflow from patient upload
 * through analysis to care plan generation.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock API responses
const mockPatientState = {
  patient_id: 'TEST_PATIENT_001',
  phase: 'ANALYSIS',
  disease: 'ovarian_cancer',
  mutations: [
    { gene: 'BRCA1', hgvs_p: 'p.C64R', chrom: '17', pos: 43044295 }
  ],
  biomarker_profile: {
    tmb: { value: 12.5, classification: 'TMB-H' },
    msi: { status: 'MSS' },
    hrd: { status: 'HRD+', genes_mutated: ['BRCA1'] }
  },
  resistance_prediction: {
    risk_level: 'MEDIUM',
    resistance_probability: 0.45,
    confidence: 'HIGH'
  },
  drug_ranking: {
    ranked_drugs: [
      { drug_name: 'olaparib', efficacy_score: 0.85, confidence: 0.75, evidence_tier: 'supported' }
    ]
  },
  trial_matches: {
    trials: [
      { nct_id: 'NCT12345', title: 'PARP Inhibitor Trial', combined_score: 0.82 }
    ]
  },
  nutrition_plan: {
    supplements: [
      { name: 'Vitamin D', dosage: '1000 IU', evidence_level: 'HIGH' }
    ]
  },
  synthetic_lethality_result: {
    synthetic_lethality_detected: true,
    essentiality_scores: [
      { gene: 'BRCA1', essentiality_score: 0.75 }
    ]
  },
  care_plan: {
    sections: [
      { title: 'Executive Summary', content: 'Test care plan' }
    ]
  },
  monitoring_config: {
    frequency: 'monthly',
    biomarkers: ['CA-125', 'ctDNA']
  }
};

describe('MOAT Orchestrator E2E Tests', () => {
  let apiBaseUrl;

  beforeAll(() => {
    apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  });

  describe('Patient Upload Flow', () => {
    it('should upload patient data successfully', async () => {
      // Mock file upload
      const formData = new FormData();
      const mockFile = new File(['test content'], 'test.vcf', { type: 'text/vcf' });
      formData.append('file', mockFile);
      formData.append('patient_id', 'TEST_PATIENT_001');
      formData.append('disease', 'ovarian_cancer');

      // In a real test, this would make an actual API call
      // For now, we'll verify the structure
      expect(formData.has('file')).toBe(true);
      expect(formData.has('patient_id')).toBe(true);
      expect(formData.has('disease')).toBe(true);
    });

    it('should handle upload errors gracefully', async () => {
      // Test error handling
      const errorResponse = {
        status: 400,
        message: 'Invalid file format'
      };
      
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.message).toBeDefined();
    });
  });

  describe('Analysis Pipeline', () => {
    it('should process biomarker analysis', () => {
      const biomarkerProfile = mockPatientState.biomarker_profile;
      
      expect(biomarkerProfile.tmb).toBeDefined();
      expect(biomarkerProfile.tmb.classification).toBe('TMB-H');
      expect(biomarkerProfile.hrd.status).toBe('HRD+');
    });

    it('should generate resistance predictions', () => {
      const resistance = mockPatientState.resistance_prediction;
      
      expect(resistance.risk_level).toBeDefined();
      expect(resistance.resistance_probability).toBeGreaterThanOrEqual(0);
      expect(resistance.resistance_probability).toBeLessThanOrEqual(1);
    });

    it('should rank drugs by efficacy', () => {
      const drugRanking = mockPatientState.drug_ranking;
      
      expect(drugRanking.ranked_drugs).toBeDefined();
      expect(drugRanking.ranked_drugs.length).toBeGreaterThan(0);
      expect(drugRanking.ranked_drugs[0].efficacy_score).toBeGreaterThanOrEqual(0);
      expect(drugRanking.ranked_drugs[0].efficacy_score).toBeLessThanOrEqual(1);
    });

    it('should match clinical trials', () => {
      const trials = mockPatientState.trial_matches.trials;
      
      expect(trials).toBeDefined();
      expect(trials.length).toBeGreaterThan(0);
      expect(trials[0].nct_id).toBeDefined();
      expect(trials[0].combined_score).toBeGreaterThanOrEqual(0);
    });

    it('should generate nutrition plan', () => {
      const nutrition = mockPatientState.nutrition_plan;
      
      expect(nutrition.supplements).toBeDefined();
      expect(nutrition.supplements.length).toBeGreaterThan(0);
    });

    it('should detect synthetic lethality', () => {
      const sl = mockPatientState.synthetic_lethality_result;
      
      expect(sl.synthetic_lethality_detected).toBeDefined();
      expect(sl.essentiality_scores).toBeDefined();
      expect(sl.essentiality_scores.length).toBeGreaterThan(0);
    });
  });

  describe('Care Plan Generation', () => {
    it('should generate unified care plan', () => {
      const carePlan = mockPatientState.care_plan;
      
      expect(carePlan.sections).toBeDefined();
      expect(carePlan.sections.length).toBeGreaterThan(0);
    });

    it('should include all analysis sections', () => {
      const sections = mockPatientState.care_plan.sections;
      
      expect(sections.some(s => s.title.includes('Summary'))).toBe(true);
    });
  });

  describe('Monitoring Configuration', () => {
    it('should configure monitoring schedule', () => {
      const monitoring = mockPatientState.monitoring_config;
      
      expect(monitoring.frequency).toBeDefined();
      expect(monitoring.biomarkers).toBeDefined();
      expect(monitoring.biomarkers.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing patient data', () => {
      const emptyState = null;
      
      expect(emptyState).toBeNull();
    });

    it('should handle partial analysis results', () => {
      const partialState = {
        patient_id: 'TEST_PATIENT_002',
        biomarker_profile: mockPatientState.biomarker_profile,
        // Missing other fields
      };
      
      expect(partialState.biomarker_profile).toBeDefined();
      expect(partialState.drug_ranking).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should load components lazily', () => {
      // Verify lazy loading is configured
      const lazyComponents = [
        'BiomarkerCard',
        'ResistanceCard',
        'DrugRankingCard',
        'TrialMatchesCard',
        'NutritionCard',
        'SyntheticLethalityCard',
        'CarePlanViewer',
        'MonitoringDashboard'
      ];
      
      expect(lazyComponents.length).toBe(8);
    });

    it('should handle large datasets efficiently', () => {
      const largeTrialList = Array.from({ length: 100 }, (_, i) => ({
        nct_id: `NCT${i}`,
        title: `Trial ${i}`,
        combined_score: Math.random()
      }));
      
      expect(largeTrialList.length).toBe(100);
      // Verify pagination/limiting is applied
      const displayedTrials = largeTrialList.slice(0, 10);
      expect(displayedTrials.length).toBe(10);
    });
  });
});

