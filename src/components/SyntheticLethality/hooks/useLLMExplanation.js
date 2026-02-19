/**
 * useLLMExplanation Hook
 * 
 * Hook for AI-powered explanations using LLM API.
 * Provides natural language interpretation of synthetic lethality analysis results.
 */

import { useState, useCallback } from 'react';
import { API_ROOT as API_BASE_URL } from '../../../lib/apiConfig';


/**
 * Hook for AI-powered explanations using LLM
 */
export function useLLMExplanation() {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Generate explanation for synthetic lethality results
   * @param {Object} results - Analysis results
   * @param {string} audienceType - "clinician" | "patient" | "researcher"
   */
  const generateExplanation = useCallback(async (results, audienceType = 'clinician') => {
    if (!results) {
      setError('No results provided');
      return null;
    }

    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const prompt = buildExplanationPrompt(results, audienceType);

      const response = await fetch(`${API_BASE_URL}/api/llm/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'gemini',
          context: 'synthetic_lethality'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      setExplanation(data.explanation);
      return data.explanation;
    } catch (err) {
      console.error('LLM explanation error:', err);
      setError(err.message || 'Failed to generate explanation');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ask a follow-up question about the analysis
   */
  const askQuestion = useCallback(async (question, context) => {
    if (!question || !question.trim()) {
      setError('Question is required');
      return null;
    }

    setLoading(true);
    setError(null);

    const prompt = `
Given this synthetic lethality analysis context:
${JSON.stringify(context, null, 2)}

User question: ${question}

Provide a clear, evidence-based answer suitable for a clinical oncologist. Be concise but thorough.
`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/llm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          provider: 'gemini' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (err) {
      console.error('LLM chat error:', err);
      setError(err.message || 'Failed to get answer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear current explanation
   */
  const clearExplanation = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return {
    generateExplanation,
    askQuestion,
    explanation,
    loading,
    error,
    clearExplanation
  };
}

/**
 * Build prompt based on audience type
 */
function buildExplanationPrompt(results, audienceType) {
  const { essentiality = [], pathway_analysis = {}, recommended_therapies = [] } = results;

  const baseContext = `
## Synthetic Lethality Analysis Results

### Essentiality Scores:
${essentiality.length > 0 
  ? essentiality.map(e => `- ${e.gene}: ${(e.score * 100).toFixed(0)}% (${e.pathwayImpact || 'Unknown impact'})`).join('\n')
  : 'None available'}

### Pathway Analysis:
- Broken Pathways: ${pathway_analysis?.broken_pathways?.join(', ') || 'None'}
- Essential Backups: ${pathway_analysis?.essential_pathways?.join(', ') || 'None'}
- Double-Hit Effect: ${pathway_analysis?.double_hit_detected ? 'Yes - Multiple pathway deficiencies detected' : 'No'}

### Top Therapies:
${recommended_therapies.length > 0
  ? recommended_therapies.slice(0, 3).map((t, i) => 
      `${i + 1}. ${t.drug} (${t.target}) - ${(t.confidence * 100).toFixed(0)}% confidence${t.fda_approved ? ' [FDA Approved]' : ''}`
    ).join('\n')
  : 'None available'}
`;

  const audienceInstructions = {
    clinician: `
Explain these results for a practicing oncologist. Include:
1. Clinical significance of each gene's essentiality score
2. Mechanism of synthetic lethality (how broken pathways create vulnerabilities)
3. Rationale for drug recommendations (why these drugs work)
4. Key monitoring considerations and potential resistance mechanisms
5. Confidence in recommendations based on evidence tier

Use medical terminology appropriately. Be concise but comprehensive.
`,
    patient: `
Explain these results for a cancer patient with no medical background. Include:
1. What the genetic mutations mean in simple terms
2. Why certain treatments might work better for their specific cancer
3. What "synthetic lethality" means (use a simple analogy like "two broken safety systems")
4. What to expect from recommended treatments
5. Reassuring but honest tone about treatment options

Avoid jargon. Use 8th-grade reading level. Be empathetic and clear.
`,
    researcher: `
Provide a detailed scientific explanation including:
1. Molecular mechanisms of pathway disruption for each gene
2. Evidence from literature supporting synthetic lethality relationships
3. Potential resistance mechanisms to monitor
4. Suggestions for combination therapy rationale
5. Research gaps and opportunities for further investigation

Include relevant gene/pathway references. Be thorough and cite mechanisms.
`
  };

  return `${baseContext}\n\n${audienceInstructions[audienceType] || audienceInstructions.clinician}`;
}

export default useLLMExplanation;




