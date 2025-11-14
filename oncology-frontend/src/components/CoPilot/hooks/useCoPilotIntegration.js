import { useEffect } from 'react';
import { useCoPilot } from '../context/CoPilotContext';

/**
 * Hook for integrating CoPilot with different pages
 */
export const useCoPilotIntegration = (pageConfig) => {
  const {
    setCurrentPage,
    setCurrentVariant,
    setCurrentDisease,
    setUnreadCount,
    // ⚔️ TREATMENT LINE INTEGRATION - Add treatment history setter
    setTreatmentHistory
  } = useCoPilot();

  useEffect(() => {
    // Set page context
    if (pageConfig.page) {
      setCurrentPage(pageConfig.page);
    }

    // Set variant context
    if (pageConfig.variant) {
      setCurrentVariant(pageConfig.variant);
    }

    // Set disease context
    if (pageConfig.disease) {
      setCurrentDisease(pageConfig.disease);
    }

    // ⚔️ TREATMENT LINE INTEGRATION - Set treatment history context
    if (pageConfig.treatmentHistory !== undefined) {
      setTreatmentHistory(pageConfig.treatmentHistory);
    }

    // Reset unread count when page changes
    setUnreadCount(0);

  }, [pageConfig, setCurrentPage, setCurrentVariant, setCurrentDisease, setUnreadCount, setTreatmentHistory]);

  return {
    // Helper functions for specific actions
    askAboutVariant: (variant) => {
      const question = `What is the functional impact of ${variant.gene} ${variant.hgvs_p}?`;
      return question;
    },

    askAboutTreatment: (variant, disease) => {
      const question = `What treatment options are available for ${variant.gene} ${variant.hgvs_p} in ${disease}?`;
      return question;
    },

    askAboutEvidence: (variant) => {
      const question = `What is the clinical evidence level for ${variant.gene} ${variant.hgvs_p}?`;
      return question;
    },

    // Context-aware question generators
    getSuggestedQuestions: (variant, disease) => {
      if (!variant) return [];

      const baseQuestions = [
        `What is the functional impact of ${variant.gene} ${variant.hgvs_p}?`,
        `How common is ${variant.gene} ${variant.hgvs_p} in the population?`,
        `What are the clinical outcomes associated with ${variant.gene} ${variant.hgvs_p}?`,
        `Are there targeted therapies for ${variant.gene} ${variant.hgvs_p}?`,
        `What research papers discuss ${variant.gene} ${variant.hgvs_p}?`
      ];

      if (disease) {
        baseQuestions.push(
          `How does ${variant.gene} ${variant.hgvs_p} affect ${disease} treatment?`,
          `What is the prognosis for patients with ${variant.gene} ${variant.hgvs_p} in ${disease}?`,
          `Are there clinical trials for ${variant.gene} ${variant.hgvs_p} in ${disease}?`
        );
      }

      return baseQuestions;
    }
  };
};

