/**
 * usePipelineStatus Hook
 * 
 * Polls orchestrator status endpoint for real-time pipeline progress.
 * Automatically stops polling when pipeline completes or errors.
 */

import { useState, useEffect, useRef } from 'react';
import { API_ROOT } from '../lib/apiConfig';


export const usePipelineStatus = (patientId, enabled = true) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!patientId || !enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ROOT}/api/orchestrate/status/${patientId}`);
        
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
          setError(null);
          
          // Stop polling if complete or error
          if (data.phase === 'complete' || data.phase === 'error') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        } else {
          // If 404, patient might not exist yet - don't treat as error
          if (response.status === 404) {
            setStatus(null);
          } else {
            const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
            throw new Error(errorData.detail || `Status check failed: ${response.status}`);
          }
        }
      } catch (err) {
        setError(err.message);
        // Don't stop polling on transient errors
      } finally {
        setLoading(false);
      }
    };

    // Poll immediately, then every 2 seconds
    pollStatus();
    intervalRef.current = setInterval(pollStatus, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [patientId, enabled]);

  return { status, loading, error };
};

