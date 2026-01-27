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

// Persona access matrix - Finalized based on MOAT Frontend Design
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
    ],
    features: [
      'view_own_profile',
      'view_own_care_plan',
      'view_own_trials',
      'basic_drug_efficacy',
      // Patient can view their own complete care plan (read-only)
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
      '/universal-complete-care', // MOAT: Complete care plan for any patient
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
      // MOAT: Oncologist has full access to orchestrator capabilities for their patients
      'orchestrator_pipeline', // Full MOAT pipeline execution for patient care
      'file_upload', // VCF/PDF/MAF upload for patient data
      'status_polling', // Real-time pipeline progress tracking
      'resistance_playbook', // Resistance prediction and management
      'sae_features', // SAE feature display for mechanism understanding
      'mechanism_fit', // Mechanism-based trial matching
      'complete_care_plan', // Generate and view complete care plans
    ],
  },
  researcher: {
    pages: [
      '*', // All pages (includes /orchestrator, /universal-complete-care, /universal-trial-intelligence)
    ],
    features: [
      '*', // All features (includes all MOAT capabilities)
    ],
  },
};

// Map database roles to personas
const ROLE_TO_PERSONA = {
  patient: 'patient',
  clinician: 'oncologist',
  oncologist: 'oncologist',
  researcher: 'researcher',
  admin: 'researcher', // Admins get researcher access
  enterprise: 'researcher',
};

export const PersonaProvider = ({ children }) => {
  const { profile, user } = useAuth();

  // Determine persona from profile
  const persona = useMemo(() => {
    if (!profile && !user) {
      return null;
    }

    // Check profile persona field first
    if (profile?.persona) {
      return profile.persona;
    }

    // Fall back to role mapping
    const role = profile?.role || user?.role || 'researcher';
    return ROLE_TO_PERSONA[role] || 'researcher';
  }, [profile, user]);

  // Check if persona has access to a page
  const hasPageAccess = (pagePath) => {
    if (!persona) return false;

    const access = PERSONA_ACCESS[persona];
    if (!access) return false;

    // Researcher has access to all pages
    if (access.pages.includes('*')) return true;

    // Check exact match
    if (access.pages.includes(pagePath)) return true;

    // Check prefix match (e.g., '/medical-records' matches '/medical-records/:id')
    return access.pages.some((allowedPage) => {
      if (allowedPage.endsWith('/*')) {
        const prefix = allowedPage.slice(0, -2);
        return pagePath.startsWith(prefix);
      }
      return false;
    });
  };

  // Check if persona has access to a feature
  const hasFeatureAccess = (featureName) => {
    if (!persona) return false;

    const access = PERSONA_ACCESS[persona];
    if (!access) return false;

    // Researcher has access to all features
    if (access.features.includes('*')) return true;

    return access.features.includes(featureName);
  };

  // Get all accessible pages for current persona
  const getAccessiblePages = () => {
    if (!persona) return [];

    const access = PERSONA_ACCESS[persona];
    if (!access) return [];

    if (access.pages.includes('*')) {
      return ['*']; // All pages
    }

    return access.pages;
  };

  // Get all accessible features for current persona
  const getAccessibleFeatures = () => {
    if (!persona) return [];

    const access = PERSONA_ACCESS[persona];
    if (!access) return [];

    if (access.features.includes('*')) {
      return ['*']; // All features
    }

    return access.features;
  };

  const value = {
    persona,
    hasPageAccess,
    hasFeatureAccess,
    getAccessiblePages,
    getAccessibleFeatures,
    isPatient: persona === 'patient',
    isOncologist: persona === 'oncologist',
    isResearcher: persona === 'researcher',
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
};

