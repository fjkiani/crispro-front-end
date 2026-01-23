/**
 * Research Intelligence Hook
 * 
 * Calls POST /api/research/intelligence for LLM-based research intelligence
 * with full-text parsing, keyword hotspot analysis, and MOAT integration.
 * 
 * Production Quality Features:
 * - Retry logic with exponential backoff (handled by apiPost)
 * - Error categorization (network, API, validation)
 * - Detailed error messages
 * - Loading state management
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import { useState, useCallback } from 'react';
import { apiPost } from '../components/ClinicalGenomicsCommandCenter/utils/genomicsUtils';

/**
 * Categorize error type for better UX
 */
const categorizeError = (error) => {
  const message = error.message || String(error);
  
  // Network errors
  if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('network')) {
    return {
      type: 'network',
      message: 'Network connection error. Please check your internet connection and try again.',
      actionable: 'Check your internet connection and retry.'
    };
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('aborted') || message.includes('AbortError')) {
    return {
      type: 'timeout',
      message: 'Request timed out. The research query may be too complex or the server is busy.',
      actionable: 'Try simplifying your question or wait a moment and retry.'
    };
  }
  
  // API errors (4xx, 5xx)
  if (message.includes('HTTP 4') || message.includes('HTTP 5')) {
    const statusMatch = message.match(/HTTP (\d+)/);
    const status = statusMatch ? statusMatch[1] : 'unknown';
    
    if (status.startsWith('4')) {
      return {
        type: 'client_error',
        message: `Invalid request (${status}). Please check your question and context.`,
        actionable: 'Review your question format and patient context, then try again.'
      };
    } else {
      return {
        type: 'server_error',
        message: `Server error (${status}). The research intelligence service is temporarily unavailable.`,
        actionable: 'Please wait a moment and try again. If the problem persists, contact support.'
      };
    }
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      type: 'validation',
      message: 'Invalid input. Please check your question and context.',
      actionable: 'Ensure your question is at least 10 characters and context is properly formatted.'
    };
  }
  
  // Default
  return {
    type: 'unknown',
    message: message || 'An unexpected error occurred.',
    actionable: 'Please try again. If the problem persists, contact support.'
  };
};

export const useResearchIntelligence = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  
  const researchQuestion = useCallback(async (question, context, options = {}) => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      const payload = {
        question,
        context: context || {},
        portals: options.portals || ["pubmed"],
        synthesize: options.synthesize !== false,
        run_moat_analysis: options.run_moat_analysis !== false,
        persona: options.persona || "patient" // NEW: Include persona in request
      };
      
      // Note: apiPost already has retry logic with exponential backoff
      const data = await apiPost('/api/research/intelligence', payload, {
        useCache: options.useCache !== false,
        skipRetry: options.skipRetry || false
      });
      
      setResult(data);
      setError(null);
      setErrorDetails(null);
      return data;
    } catch (err) {
      const categorized = categorizeError(err);
      setError(categorized.message);
      setErrorDetails(categorized);
      console.error('[useResearchIntelligence] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setErrorDetails(null);
    setLoading(false);
  }, []);
  
  return {
    result,
    loading,
    error,
    errorDetails, // Categorized error with actionable message
    researchQuestion,
    reset
  };
};

export default useResearchIntelligence;



