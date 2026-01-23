import { useEffect } from 'react';
import { useCoPilot } from '../components/CoPilot';

// Hook for integrating CoPilot with different pages
export const useCoPilotIntegration = (pageConfig) => {
  const {
    setCurrentPage,
    setCurrentVariant,
    setCurrentDisease,
    setUnreadCount
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

    // Reset unread count when page changes
    setUnreadCount(0);

  }, [pageConfig, setCurrentPage, setCurrentVariant, setCurrentDisease, setUnreadCount]);

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

// Hook for integrating with analysis results
export const useAnalysisCoPilot = (analysisResults, variant) => {
  const { setUnreadCount } = useCoPilot();

  useEffect(() => {
    if (analysisResults && variant) {
      // Notify CoPilot about new analysis results
      setUnreadCount(prev => prev + 1);
    }
  }, [analysisResults, variant, setUnreadCount]);

  return {
    getAnalysisInsights: () => {
      if (!analysisResults || !variant) return [];

      const insights = [];

      // Add insights based on analysis results
      if (analysisResults.efficacy_score !== undefined) {
        insights.push({
          type: 'analysis',
          title: 'Drug Efficacy Analysis',
          content: `Analysis completed for ${variant.gene} ${variant.hgvs_p} with efficacy score: ${analysisResults.efficacy_score?.toFixed(2) || 'N/A'}`
        });
      }

      if (analysisResults.confidence !== undefined) {
        insights.push({
          type: 'confidence',
          title: 'Analysis Confidence',
          content: `Model confidence: ${(analysisResults.confidence * 100).toFixed(1)}%`
        });
      }

      return insights;
    },

    suggestFollowUpQuestions: () => {
      if (!variant) return [];

      return [
        `Based on this analysis, what treatment options should be considered for ${variant.gene} ${variant.hgvs_p}?`,
        `What clinical trials might be relevant for ${variant.gene} ${variant.hgvs_p}?`,
        `How do these results compare to other variants in ${variant.gene}?`,
        `What are the next steps after seeing these results?`
      ];
    }
  };
};

// Hook for proactive insights
export const useProactiveInsights = (currentState) => {
  const { currentVariant, currentDisease, currentPage } = useCoPilot();

  // Generate proactive insights based on current state
  const getProactiveInsights = () => {
    const insights = [];

    if (currentVariant && currentPage === 'myeloma-digital-twin') {
      insights.push({
        type: 'proactive',
        priority: 'high',
        title: 'Variant Analysis Available',
        content: `I can help you understand the clinical significance of ${currentVariant.gene} ${currentVariant.hgvs_p}`,
        action: 'Ask me about this variant'
      });
    }

    if (currentDisease && currentVariant) {
      insights.push({
        type: 'proactive',
        priority: 'medium',
        title: 'Disease-Specific Information',
        content: `I have information about ${currentVariant.gene} ${currentVariant.hgvs_p} in the context of ${currentDisease}`,
        action: 'Get disease-specific insights'
      });
    }

    if (currentPage === 'myeloma-digital-twin') {
      insights.push({
        type: 'proactive',
        priority: 'low',
        title: 'General Assistance',
        content: 'I can help with variant interpretation, treatment options, and clinical research questions',
        action: 'Ask me anything'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  return {
    getProactiveInsights,
    hasHighPriorityInsights: () => getProactiveInsights().some(i => i.priority === 'high')
  };
};

// Utility functions for CoPilot integration
export const CoPilotUtils = {
  // Extract variant information from different sources
  extractVariantFromUrl: (pathname) => {
    // Extract from URL patterns
    const patterns = [
      /\/variant\/([^\/]+)\/([^\/]+)/,  // /variant/GENE/VARIANT
      /\/gene\/([^\/]+).*?([cp]\.\w+\d+\w+)/, // /gene/GENE/.../p.Val600Glu
    ];

    for (const pattern of patterns) {
      const match = pathname.match(pattern);
      if (match) {
        return {
          gene: match[1],
          hgvs_p: match[2]
        };
      }
    }

    return null;
  },

  // Format variant for display
  formatVariant: (variant) => {
    if (!variant) return '';
    return `${variant.gene} ${variant.hgvs_p}`;
  },

  // Generate CoPilot-friendly descriptions
  generateVariantDescription: (variant, disease) => {
    let description = `Analyzing ${variant.gene} ${variant.hgvs_p}`;

    if (disease) {
      description += ` in the context of ${disease}`;
    }

    return description;
  },

  // Create search queries for CoPilot
  createSearchQuery: (variant, disease, type) => {
    const variantStr = `${variant.gene} ${variant.hgvs_p}`;

    const queries = {
      'functional_impact': `What is the functional impact of ${variantStr}?`,
      'clinical_outcomes': `What are the clinical outcomes for ${variantStr}?`,
      'treatment_options': `What treatment options are available for ${variantStr}?`,
      'population_frequency': `How common is ${variantStr} in the population?`,
      'research_papers': `What research papers discuss ${variantStr}?`,
      'disease_specific': `How does ${variantStr} affect ${disease} treatment and prognosis?`
    };

    return queries[type] || queries['functional_impact'];
  }
};

export default useCoPilotIntegration;
