import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const PersonaContext = createContext({});

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return context;
};

// -----------------------------------------------------------------------------
// Persona access matrix — 5 personas (patient, oncologist, hospital, pharma, researcher)
// -----------------------------------------------------------------------------
const PERSONA_ACCESS = {
  patient: {
    pages: [
      '/patient/profile',
      '/patient/onboarding',
      '/ayesha-complete-care',
      '/ayesha-trials',
      '/patient/tasks',
      '/home',
      '/profile',
      // Read-only access to select tools
      '/research-intelligence',
      '/clinical-genomics',
      '/synthetic-lethality',
      '/dosing-guidance',
      '/metastasis',
      '/ddr-status',
      '/sentinel',
    ],
    features: [
      'view_own_profile',
      'view_own_care_plan',
      'view_own_trials',
      'basic_drug_efficacy',
      'view_own_complete_care',
    ],
  },
  oncologist: {
    pages: [
      '/patient/profile',
      '/patient/onboarding',
      '/ayesha-complete-care',
      '/ayesha-trials',
      '/patient/tasks',
      '/medical-records',
      '/research',
      '/research-intelligence',
      '/clinical-genomics',
      '/validate',
      '/myeloma-digital-twin',
      '/metastasis',
      '/synthetic-lethality',
      '/dosing-guidance',
      '/threat-assessor',
      '/radonc-co-pilot',
      '/universal-dossiers',
      '/universal-trial-intelligence',
      '/universal-complete-care',
      '/doctor-dashboard',
      '/workload-dashboard',
      '/screening-schedules',
      '/outreach',
      '/mutation-explorer',
      '/agent-dashboard',
      '/agents',
      '/home',
      '/profile',
      '/dashboard',
      '/sentinel',
      // NEW: hospital tumor-board access shared with oncologist role
      '/hospital/tumor-board',
      '/hospital/onboarding',
      '/hospital/patients',
    ],
    features: [
      'view_patient_profiles',
      'manage_patients',
      'clinical_tools',
      'treatment_planning',
      'trial_matching',
      'dosing_guidance',
      'mutation_analysis',
      'agent_dashboard',
      'orchestrator_pipeline',
      'file_upload',
      'status_polling',
      'resistance_playbook',
      'sae_features',
      'mechanism_fit',
      'complete_care_plan',
      'tumor_board',
    ],
  },
  hospital: {
    // Hospital persona = same as oncologist plus tumor-board tooling.
    // Kept as a distinct persona so navigation can be tailored.
    pages: [
      '/hospital/tumor-board',
      '/hospital/onboarding',
      '/hospital/patients',
      '/universal-dossiers',
      '/universal-trial-intelligence',
      '/universal-complete-care',
      '/patient/profile',
      '/patient/onboarding',
      '/ayesha-complete-care',
      '/ayesha-trials',
      '/doctor-dashboard',
      '/workload-dashboard',
      '/home',
      '/profile',
    ],
    features: [
      'view_patient_profiles',
      'manage_patients',
      'tumor_board',
      'clinical_tools',
      'treatment_planning',
      'trial_matching',
      'complete_care_plan',
    ],
  },
  pharma: {
    // Pharma persona: Brenus / partner BD, RAG chat, CEACAM5 dossier
    pages: [
      '/pharma/dashboard',
      '/pharma/onboarding',
      '/pharma/rag-chat',
      '/pharma/ceacam5',
      '/pharma/fit-gap',
      '/profile',
      '/home',
    ],
    features: [
      'brenus_rag',
      'ceacam5_dossier',
      'fit_gap_analysis',
      'pharma_bd_view',
    ],
  },
  researcher: {
    pages: ['*'], // All pages
    features: ['*'], // All features
  },
};

// -----------------------------------------------------------------------------
// Role → persona mapping (5 roles supported now)
// -----------------------------------------------------------------------------
const ROLE_TO_PERSONA = {
  patient: 'patient',
  clinician: 'oncologist',
  oncologist: 'oncologist',
  hospital: 'hospital',
  pharma: 'pharma',
  researcher: 'researcher',
  admin: 'researcher',
  enterprise: 'researcher',
};

export const PersonaProvider = ({ children }) => {
  const { profile, user, loading, profileLoading } = useAuth();

  const persona = useMemo(() => {
    if (!profile && !user) return null;
    // Priority: profile.role → user.role → user.metadata.role
    const role =
      (profile?.role || user?.role || user?.metadata?.role || '').toLowerCase();
    return ROLE_TO_PERSONA[role] || 'patient';
  }, [profile, user]);

  const personaLoading = Boolean(loading || profileLoading);

  // ---- Access helpers -------------------------------------------------------
  const hasPageAccess = (pagePath) => {
    if (!persona) return false;
    const access = PERSONA_ACCESS[persona];
    if (!access) return false;

    if (access.pages.includes('*')) return true;
    if (access.pages.includes(pagePath)) return true;
    return access.pages.some((allowedPage) => {
      if (allowedPage.endsWith('/*')) {
        const prefix = allowedPage.slice(0, -2);
        return pagePath.startsWith(prefix);
      }
      return false;
    });
  };

  const hasFeatureAccess = (featureName) => {
    if (!persona) return false;
    const access = PERSONA_ACCESS[persona];
    if (!access) return false;
    if (access.features.includes('*')) return true;
    return access.features.includes(featureName);
  };

  const getAccessiblePages = () => {
    if (!persona) return [];
    const access = PERSONA_ACCESS[persona];
    if (!access) return [];
    if (access.pages.includes('*')) return ['*'];
    return access.pages;
  };

  const getAccessibleFeatures = () => {
    if (!persona) return [];
    const access = PERSONA_ACCESS[persona];
    if (!access) return [];
    if (access.features.includes('*')) return ['*'];
    return access.features;
  };

  const value = {
    persona,
    personaLoading,
    hasPageAccess,
    hasFeatureAccess,
    getAccessiblePages,
    getAccessibleFeatures,
    isPatient: persona === 'patient',
    isOncologist: persona === 'oncologist',
    isHospital: persona === 'hospital',
    isPharma: persona === 'pharma',
    isResearcher: persona === 'researcher',
  };

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
};

export default PersonaContext;
