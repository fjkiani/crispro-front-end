import { useCoPilot } from '../context/CoPilotContext';

/**
 * Hook for proactive insights
 */
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

