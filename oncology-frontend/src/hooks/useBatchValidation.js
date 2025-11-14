import { useState, useCallback } from 'react';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

/**
 * useBatchValidation Hook
 * 
 * Manages batch validation state and API calls.
 * Handles:
 * - Parallel/sequential API calls
 * - Progress tracking
 * - Error handling
 * - Result aggregation
 */
export function useBatchValidation() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({
    completed: 0,
    current: null,
    errors: []
  });
  const [error, setError] = useState(null);

  const testBatch = useCallback(async (compounds, diseaseContext, options = {}) => {
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
      
      if (batchErrors.length > 0) {
        setError(`${batchErrors.length} compound(s) failed validation. See details below.`);
      }
    } catch (err) {
      setError(err.message || 'Batch validation failed');
    } finally {
      setLoading(false);
      setProgress(prev => ({ ...prev, current: null }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setProgress({ completed: 0, current: null, errors: [] });
  }, []);

  const exportResults = useCallback((resultsToExport, filename = 'batch_results') => {
    if (resultsToExport.length === 0) {
      return;
    }

    // Prepare CSV data
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

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
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
    testBatch,
    clearResults,
    exportResults
  };
}






