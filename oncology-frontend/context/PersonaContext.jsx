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

// Persona access matrix
const PERSONA_ACCESS = {
  patient: {
    pages: [
      '/patient/profile',
      '/patient/onboarding',
      '/patient/dashboard',
      '/patient/settings',
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
    ],
  },
  researcher: {
    pages: [
      '*', // All pages
    ],
    features: [
      '*', // All features
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
  const { profile, user, profileLoading, loading } = useAuth();

  // Determine persona from profile
  const persona = useMemo(() => {
    // Wait for profile to load
    if (loading || profileLoading) {
      return null; // Still loading
    }

    if (!profile && !user) {
      return null;
    }

    // Check profile persona field first
    if (profile?.persona) {
      return profile.persona;
    }

    // Fall back to role mapping
    const role = profile?.role || user?.role || 'researcher';
    const mappedPersona = ROLE_TO_PERSONA[role] || 'researcher';
    
    console.log('🎭 Persona determined:', {
      role,
      mappedPersona,
      profileRole: profile?.role,
      userRole: user?.role,
      profile: profile
    });
    
    return mappedPersona;
  }, [profile, user, profileLoading, loading]);

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
    personaLoading: loading || profileLoading,
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
