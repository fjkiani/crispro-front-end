import React, { createContext, useContext, useState } from 'react';
import { useAyeshaProfile } from '../../../../hooks/ayesha/useAyeshaProfile';

/**
 * CoPilot Context for sharing state across components
 */
export const CoPilotContext = createContext();

export const CoPilotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [currentVariant, setCurrentVariant] = useState(null);
  const [currentDisease, setCurrentDisease] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ⚔️ DEEP CONTEXT INTEGRATION (Phase 7)
  // Source of Truth: useAyeshaProfile (matches Dashboard)
  const { profile, patient, disease, tumorContext, germline } = useAyeshaProfile();

  // Projection: Patient Context (Safe for CoPilot)
  const patientContext = {
    patient_id: "ayesha_11_17_25",
    display_name: patient?.demographics?.name || "Ayesha Kiani",
    age: patient?.demographics?.age,
    sex: patient?.demographics?.sex,
    disease: {
      type: disease?.type,
      histology: disease?.histology,
      stage: disease?.stage
    },
    biomarkers: {
      mmr_status: tumorContext?.biomarkers?.mmr_status,
      msi_status: tumorContext?.biomarkers?.msi_status,
      folr1_status: tumorContext?.biomarkers?.folr1_status,
      pd_l1_cps: tumorContext?.biomarkers?.pd_l1_cps,
      hrd_score: tumorContext?.hrd_score
    },
    treatment_history: profile?.treatment_history || []
  };

  // Projection: Session Context
  const sessionContext = {
    mode: isOpen ? 'active' : 'idle',
    current_route: typeof window !== 'undefined' ? window.location.pathname : '',
    last_action: null
  };

  // Projection: Runtime Context
  const runtimeContext = {
    api_contract_version: 'v2',
    preview_status: 'stable'
  };

  const value = {
    isOpen,
    setIsOpen,
    currentPage,
    setCurrentPage,
    currentVariant,
    setCurrentVariant,
    currentDisease,
    setCurrentDisease,
    chatHistory,
    setChatHistory,
    isLoading,
    setIsLoading,
    unreadCount,
    setUnreadCount,

    // ⚔️ Deep Context Objects
    patient: patientContext,
    session: sessionContext,
    runtime: runtimeContext,

    // Legacy support (to avoid breaking existing logic immediately)
    treatmentHistory: patientContext.treatment_history,
  };

  return (
    <CoPilotContext.Provider value={value}>
      {children}
    </CoPilotContext.Provider>
  );
};

// Hook to use CoPilot context
export const useCoPilot = () => {
  const context = useContext(CoPilotContext);
  if (!context) {
    throw new Error('useCoPilot must be used within a CoPilotProvider');
  }
  return context;
};
