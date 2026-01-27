import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * PatientContext - State management for patient data
 * 
 * Manages:
 * - Current patient information
 * - Patient profile data
 * - Patient-specific settings
 */

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update current patient
  const updatePatient = useCallback((patientData) => {
    setCurrentPatient(patientData);
    console.log('✅ Patient updated:', patientData?.id || patientData?.patientId);
  }, []);

  // Clear patient data
  const clearPatient = useCallback(() => {
    setCurrentPatient(null);
    setPatientProfile(null);
    console.log('🗑️  Patient data cleared');
  }, []);

  const value = {
    // State
    currentPatient,
    patientProfile,
    loading,
    
    // Actions
    setCurrentPatient: updatePatient,
    setPatientProfile,
    setLoading,
    clearPatient,
    
    // Computed
    hasPatient: !!currentPatient,
    patientId: currentPatient?.id || currentPatient?.patientId,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

