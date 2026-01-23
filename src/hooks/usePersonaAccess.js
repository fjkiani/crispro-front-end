import { usePersona } from '../context/PersonaContext';

/**
 * Hook for persona-based access control
 * 
 * @returns {Object} Access control functions and persona info
 */
export const usePersonaAccess = () => {
  const {
    persona,
    hasPageAccess,
    hasFeatureAccess,
    getAccessiblePages,
    getAccessibleFeatures,
    isPatient,
    isOncologist,
    isResearcher,
  } = usePersona();

  /**
   * Check if current persona can access a page
   * @param {string} pagePath - Path to check
   * @returns {boolean}
   */
  const canAccess = (pagePath) => {
    return hasPageAccess(pagePath);
  };

  /**
   * Check if current persona can access a feature
   * @param {string} featureName - Feature name to check
   * @returns {boolean}
   */
  const canAccessFeature = (featureName) => {
    return hasFeatureAccess(featureName);
  };

  /**
   * Check if current persona is one of the allowed personas
   * @param {string[]} allowedPersonas - Array of allowed personas
   * @returns {boolean}
   */
  const isPersonaAllowed = (allowedPersonas = []) => {
    if (!persona) return false;
    if (allowedPersonas.length === 0) return true; // No restriction
    return allowedPersonas.includes(persona);
  };

  return {
    persona,
    canAccess,
    canAccessFeature,
    isPersonaAllowed,
    getAccessiblePages,
    getAccessibleFeatures,
    isPatient,
    isOncologist,
    isResearcher,
  };
};

