import { useState, useCallback } from 'react';
import { API_ROOT } from '../lib/apiConfig';


/**
 * useHolisticValidation Hook
 * 
 * Manages holistic validation with:
 * - Natural language parsing (LLM-powered)
 * - Batch validation
 * - Grounded LLM insights (based on our results)
 * - Progress tracking
 */
export function useHolisticValidation() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({
    completed: 0,
    current: null,
    errors: []
  });
  const [error, setError] = useState(null);
  const [llmInsights, setLlmInsights] = useState(null);

  /**
   * Parse natural language query with LLM
   * Extracts compounds and disease context from natural language
   */
  const parseNaturalLanguage = useCallback(async (query) => {
    try {
      const response = await fetch(`${API_ROOT}/api/hypothesis/parse_natural_language`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        // Fallback to simple parsing if endpoint doesn't exist
        return fallbackParse(query);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('LLM parsing failed, using fallback:', err);
      return fallbackParse(query);
    }
  }, []);

  /**
   * Fallback parsing when LLM endpoint unavailable
   */
  const fallbackParse = (query) => {
    // Simple regex-based extraction
    const compoundPatterns = [
      /(?:test|validate|analyze|check)\s+(?:these|the|following)\s+([^:]+?)(?::|$)/i,
      /(?:compounds?|foods?|supplements?)[:\s]+([^,]+(?:,\s*[^,]+)*)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ];

    const compounds = [];
    for (const pattern of compoundPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        const extracted = matches[1] || matches[0];
        const parsed = extracted
          .split(/[,\n;and]+/)
          .map(item => item.trim())
          .filter(item => item.length > 2 && item.length < 50);
        compounds.push(...parsed);
      }
    }

    // Extract disease if mentioned
    const diseasePattern = /(?:for|against|with)\s+([a-z_]+(?:\s+cancer)?)/i;
    const diseaseMatch = query.match(diseasePattern);
    const disease = diseaseMatch ? diseaseMatch[1].toLowerCase().replace(/\s+/g, '_') : null;

    return {
      compounds: [...new Set(compounds)].slice(0, 20), // Limit to 20
      disease: disease || 'ovarian_cancer_hgs',
      diseaseContext: {
        disease: disease || 'ovarian_cancer_hgs',
        mutations: [{ gene: 'TP53', hgvs_p: 'R248Q' }],
        biomarkers: { HRD: 'POSITIVE', TMB: 8.2 }
      }
    };
  };

  /**
   * Test compounds holistically
   */
  const testHolistic = useCallback(async (compounds, diseaseContext, options = {}) => {
    if (compounds.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setProgress({ completed: 0, current: null, errors: [] });

    const { parallel = true, maxConcurrent = 5 } = options;
    const batchResults = [];
    const batchErrors = [];

    try {
      if (parallel) {
        // Parallel processing with concurrency limit
        const batches = [];
        for (let i = 0; i < compounds.length; i += maxConcurrent) {
          batches.push(compounds.slice(i, i + maxConcurrent));
        }

        for (const batch of batches) {
          const batchPromises = batch.map(async (compound) => {
            setProgress(prev => ({ ...prev, current: compound }));

            try {
              const payload = {
                compound: compound.trim(),
                disease_context: diseaseContext,
                treatment_history: {
                  current_line: 'L3',
                  prior_therapies: []
                },
                patient_medications: [],
                use_evo2: false
              };

              const response = await fetch(`${API_ROOT}/api/hypothesis/validate_food_dynamic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `API error: ${response.status}`);
              }

              const data = await response.json();

              if (data.status === 'ERROR') {
                throw new Error(data.error || 'Validation failed');
              }

              const result = {
                ...data,
                compound: compound.trim(),
                timestamp: new Date().toISOString()
              };

              batchResults.push(result);
              setProgress(prev => ({
                ...prev,
                completed: prev.completed + 1,
                current: null
              }));

              return result;
            } catch (err) {
              const errorObj = {
                compound: compound.trim(),
                message: err.message || 'Validation failed',
                timestamp: new Date().toISOString()
              };
              batchErrors.push(errorObj);
              setProgress(prev => ({
                ...prev,
                completed: prev.completed + 1,
                current: null,
                errors: [...prev.errors, errorObj]
              }));
              return null;
            }
          });

          await Promise.all(batchPromises);
        }
      } else {
        // Sequential processing
        for (const compound of compounds) {
          setProgress(prev => ({ ...prev, current: compound }));

          try {
            const payload = {
              compound: compound.trim(),
              disease_context: diseaseContext,
              treatment_history: {
                current_line: 'L3',
                prior_therapies: []
              },
              patient_medications: [],
              use_evo2: false
            };

            const response = await fetch(`${API_ROOT}/api/hypothesis/validate_food_dynamic`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
              throw new Error(errorData.error || `API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'ERROR') {
              throw new Error(data.error || 'Validation failed');
            }

            const result = {
              ...data,
              compound: compound.trim(),
              timestamp: new Date().toISOString()
            };

            batchResults.push(result);
            setProgress(prev => ({
              ...prev,
              completed: prev.completed + 1,
              current: null
            }));
          } catch (err) {
            const errorObj = {
              compound: compound.trim(),
              message: err.message || 'Validation failed',
              timestamp: new Date().toISOString()
            };
            batchErrors.push(errorObj);
            setProgress(prev => ({
              ...prev,
              completed: prev.completed + 1,
              current: null,
              errors: [...prev.errors, errorObj]
            }));
          }
        }
      }

      setResults(batchResults);

      // Generate grounded LLM insights from our actual results
      if (batchResults.length > 0) {
        const insights = await generateGroundedInsights(batchResults);
        setLlmInsights(insights);
      }

      if (batchErrors.length > 0) {
        setError(`${batchErrors.length} compound(s) failed validation. See details below.`);
      }
    } catch (err) {
      setError(err.message || 'Holistic validation failed');
    } finally {
      setLoading(false);
      setProgress(prev => ({ ...prev, current: null }));
    }
  }, []);

  /**
   * Generate grounded LLM insights from our validation results
   * LLM only synthesizes our actual data, doesn't hallucinate
   */
  const generateGroundedInsights = useCallback(async (results) => {
    try {
      // Prepare grounded context from our actual results
      const context = {
        total_tested: results.length,
        results: results.map(r => ({
          compound: r.compound,
          overall_score: r.overall_score,
          confidence: r.confidence,
          verdict: r.verdict,
          evidence_grade: r.evidence?.evidence_grade,
          mechanisms: r.mechanisms || [],
          pathways: r.pathways || []
        }))
      };

      const response = await fetch(`${API_ROOT}/api/hypothesis/generate_insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      });

      if (!response.ok) {
        // Fallback to simple insights if endpoint doesn't exist
        return generateFallbackInsights(results);
      }

      const data = await response.json();
      return data.insights || generateFallbackInsights(results);
    } catch (err) {
      console.warn('LLM insights generation failed, using fallback:', err);
      return generateFallbackInsights(results);
    }
  }, []);

  /**
   * Fallback insights when LLM endpoint unavailable
   */
  const generateFallbackInsights = (results) => {
    const sorted = [...results].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
    const top3 = sorted.slice(0, 3).map(r => r.compound);

    return {
      overall_summary: `Validated ${results.length} compounds. ${top3.length > 0 ? `Top performers: ${top3.join(', ')}.` : ''} Results range from ${(sorted[sorted.length - 1]?.overall_score || 0) * 100}% to ${(sorted[0]?.overall_score || 0) * 100}% overall score.`,
      key_findings: [
        `${sorted[0]?.compound || 'Unknown'} has the highest overall score (${((sorted[0]?.overall_score || 0) * 100).toFixed(1)}%)`,
        `${results.filter(r => r.verdict === 'SUPPORTED').length} compounds show SUPPORTED verdict`,
        `${results.filter(r => r.evidence?.evidence_grade === 'STRONG').length} compounds have STRONG evidence`
      ],
      top_performers: top3,
      recommendations: [
        'Consider focusing on compounds with SUPPORTED verdict and STRONG evidence',
        'Review pathway alignments for compounds with high pathway scores',
        'Validate top performers through additional literature review'
      ]
    };
  };

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setLlmInsights(null);
    setProgress({ completed: 0, current: null, errors: [] });
  }, []);

  const exportResults = useCallback((resultsToExport, filename = 'holistic_results') => {
    if (resultsToExport.length === 0) {
      return;
    }

    const headers = ['Compound', 'Overall Score', 'Confidence', 'Verdict', 'Evidence Grade', 'Mechanisms', 'Targets', 'Pathways'];
    const rows = resultsToExport.map(result => [
      result.compound || '',
      (result.overall_score * 100).toFixed(1) + '%',
      (result.confidence * 100).toFixed(1) + '%',
      result.verdict || '',
      result.evidence?.evidence_grade || '',
      (result.mechanisms || []).join('; '),
      (result.targets || []).join('; '),
      (result.pathways || []).join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    results,
    loading,
    progress,
    error,
    llmInsights,
    testHolistic,
    parseNaturalLanguage,
    clearResults,
    exportResults
  };
}







