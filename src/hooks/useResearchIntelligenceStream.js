/**
 * useResearchIntelligenceStream - Hook for streaming research intelligence
 *
 * Foundation hook ready for SSE connection when backend supports streaming
 */

import { useState, useCallback } from 'react';
import { API_ROOT } from '../lib/apiConfig';


export const useResearchIntelligenceStream = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [stepData, setStepData] = useState({});
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [streaming, setStreaming] = useState(false);

  const startStream = useCallback(async (question, context, options) => {
    setStreaming(true);
    setProgress(0);
    setCurrentStep(null);
    setStepData({});
    setError(null);
    setResult(null);

    try {
      // TODO: Connect to SSE endpoint when backend supports streaming
      // const eventSource = new EventSource(`${API_ROOT}/api/research/intelligence/stream`, {
      //   method: 'POST',
      //   body: JSON.stringify({ question, context, ...options })
      // });

      // For now, return placeholder
      // When backend streaming is ready, this will connect to SSE

      return null;
    } catch (err) {
      setError(err.message);
      setStreaming(false);
      throw err;
    }
  }, []);

  const stopStream = useCallback(() => {
    setStreaming(false);
    // TODO: Close SSE connection
  }, []);

  return {
    progress,
    currentStep,
    stepData,
    error,
    result,
    streaming,
    startStream,
    stopStream,
  };
};

export default useResearchIntelligenceStream;
