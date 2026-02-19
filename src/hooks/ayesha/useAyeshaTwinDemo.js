import { useState } from 'react';
import { API_ROOT } from '../../lib/apiConfig';


/**
 * Custom hook for Ayesha Twin Demo API calls
 * Handles state management and API communication
 */
export function useAyeshaTwinDemo() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDemo = async (useLLM = true) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${API_ROOT}/api/demo/ayesha_twin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          use_llm: useLLM
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      return data;
    } catch (err) {
      // Silently handle 404s (endpoint not implemented yet)
      if (!err.message?.includes('404') && !err.message?.includes('Not Found')) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Demo endpoint not available yet');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
    setLoading(false);
  };

  return {
    results,
    loading,
    error,
    runDemo,
    reset
  };
}
