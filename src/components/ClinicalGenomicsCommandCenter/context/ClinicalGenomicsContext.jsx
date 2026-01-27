/**
 * ⚔️ CLINICAL GENOMICS COMMAND CENTER - CONTEXT ⚔️
 * 
 * Global state management for Clinical Genomics capabilities:
 * - Variant input (gene, chrom, pos, ref, alt, hgvs)
 * - Patient profile (cancer type, current drugs, history)
 * - Analysis results (ACMG, PharmGKB, Trials, Resistance, NCCN)
 * - Loading states and error handling
 * - Provenance tracking (run_id, timestamps, API versions)
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const ClinicalGenomicsContext = createContext(null);

export const useClinicalGenomicsContext = () => {
  const context = useContext(ClinicalGenomicsContext);
  if (!context) {
    throw new Error('useClinicalGenomicsContext must be used within ClinicalGenomicsProvider');
  }
  return context;
};

export const ClinicalGenomicsProvider = ({ children }) => {
  // === VARIANT STATE ===
  const [variant, setVariant] = useState({
    gene: '',
    chrom: '',
    pos: '',
    ref: '',
    alt: '',
    hgvs_p: '',
    hgvs_c: '',
    consequence: '',
    transcript_id: ''
  });

  // === PATIENT PROFILE STATE ===
  const [patientProfile, setPatientProfile] = useState({
    cancer_type: '',
    stage: '',
    current_drugs: [],
    prior_therapies: [],
    biomarkers: {},
    age: null,
    ethnicity: ''
  });

  // === ANALYSIS RESULTS STATE ===
  const [results, setResults] = useState({
    acmg: null,
    pharmgkb: null,
    trials: null,
    resistance: null,
    nccn: null
  });

  // === LOADING STATES ===
  const [loading, setLoading] = useState({
    acmg: false,
    pharmgkb: false,
    trials: false,
    resistance: false,
    nccn: false
  });

  // === ERROR STATES ===
  const [errors, setErrors] = useState({
    acmg: null,
    pharmgkb: null,
    trials: null,
    resistance: null,
    nccn: null
  });

  // === ACTIVE TAB STATE ===
  const [activeTab, setActiveTab] = useState(0); // 0: Interpretation, 1: Treatment, 2: Trials

  // === PROVENANCE TRACKING ===
  const [provenance, setProvenance] = useState({
    run_id: null,
    timestamp: null,
    variant_hash: null,
    api_versions: {}
  });

  // === ACTIONS ===

  const updateVariant = useCallback((updates) => {
    setVariant(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePatientProfile = useCallback((updates) => {
    setPatientProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const updateResult = useCallback((category, data) => {
    setResults(prev => ({ ...prev, [category]: data }));
  }, []);

  const setLoadingState = useCallback((category, isLoading) => {
    setLoading(prev => ({ ...prev, [category]: isLoading }));
  }, []);

  const setError = useCallback((category, error) => {
    setErrors(prev => ({ ...prev, [category]: error }));
  }, []);

  const clearResults = useCallback(() => {
    setResults({
      acmg: null,
      pharmgkb: null,
      trials: null,
      resistance: null,
      nccn: null
    });
    setErrors({
      acmg: null,
      pharmgkb: null,
      trials: null,
      resistance: null,
      nccn: null
    });
  }, []);

  const clearAll = useCallback(() => {
    setVariant({
      gene: '',
      chrom: '',
      pos: '',
      ref: '',
      alt: '',
      hgvs_p: '',
      hgvs_c: '',
      consequence: '',
      transcript_id: ''
    });
    setPatientProfile({
      cancer_type: '',
      stage: '',
      current_drugs: [],
      prior_therapies: [],
      biomarkers: {},
      age: null,
      ethnicity: ''
    });
    clearResults();
    setProvenance({
      run_id: null,
      timestamp: null,
      variant_hash: null,
      api_versions: {}
    });
  }, [clearResults]);

  const updateProvenance = useCallback((updates) => {
    setProvenance(prev => ({ ...prev, ...updates }));
  }, []);

  const value = {
    // State
    variant,
    patientProfile,
    results,
    loading,
    errors,
    activeTab,
    provenance,
    
    // Actions
    updateVariant,
    updatePatientProfile,
    updateResult,
    setLoadingState,
    setError,
    clearResults,
    clearAll,
    setActiveTab,
    updateProvenance
  };

  return (
    <ClinicalGenomicsContext.Provider value={value}>
      {children}
    </ClinicalGenomicsContext.Provider>
  );
};

export default ClinicalGenomicsContext;

