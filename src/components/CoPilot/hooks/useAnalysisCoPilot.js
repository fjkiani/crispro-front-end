import { useEffect } from 'react';
import { useCoPilot } from '../context/CoPilotContext';

/**
 * Hook for integrating with analysis results
 */
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

