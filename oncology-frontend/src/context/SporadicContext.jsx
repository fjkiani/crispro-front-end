import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * SporadicContext - State management for sporadic cancer workflow
 * 
 * Manages:
 * - Germline status
 * - Tumor context (from Quick Intake or NGS Upload)
 * - Integration with WIWFM efficacy prediction
 * 
 * Day 4 Phase 2 - Module M5
 */

const SporadicContext = createContext();

export const useSporadic = () => {
  const context = useContext(SporadicContext);
  if (!context) {
    throw new Error('useSporadic must be used within SporadicProvider');
  }
  return context;
};

export const SporadicProvider = ({ children }) => {
  const [germlineStatus, setGermlineStatus] = useState('unknown'); // "positive", "negative", "unknown"
  const [tumorContext, setTumorContext] = useState(null); // TumorContext from API
  const [contextId, setContextId] = useState(null); // Unique ID for this context
  const [dataLevel, setDataLevel] = useState('L0'); // "L0", "L1", "L2"

  // Update tumor context from Quick Intake or Upload
  const updateTumorContext = useCallback((data) => {
    if (data?.tumor_context) {
      setTumorContext(data.tumor_context);
      setContextId(data.context_id);
      
      // Determine data level from completeness score
      const completeness = data.tumor_context.completeness_score || 0;
      if (completeness >= 0.7) {
        setDataLevel('L2');
      } else if (completeness >= 0.3) {
        setDataLevel('L1');
      } else {
        setDataLevel('L0');
      }
      
      console.log('✅ Tumor context updated:', {
        contextId: data.context_id,
        level: dataLevel,
        completeness: completeness.toFixed(2),
      });
    }
  }, [dataLevel]);

  // Clear tumor context (start fresh)
  const clearTumorContext = useCallback(() => {
    setTumorContext(null);
    setContextId(null);
    setDataLevel('L0');
    console.log('🗑️  Tumor context cleared');
  }, []);

  // Get efficacy request payload with tumor context
  const getEfficacyPayload = useCallback((basePayload) => {
    return {
      ...basePayload,
      germline_status: germlineStatus,
      tumor_context: tumorContext,
    };
  }, [germlineStatus, tumorContext]);

  const value = {
    // State
    germlineStatus,
    tumorContext,
    contextId,
    dataLevel,
    
    // Actions
    setGermlineStatus,
    updateTumorContext,
    clearTumorContext,
    getEfficacyPayload,
    
    // Computed
    hasTumorContext: !!tumorContext,
    isSporadic: germlineStatus === 'negative' || germlineStatus === 'unknown',
  };

  return (
    <SporadicContext.Provider value={value}>
      {children}
    </SporadicContext.Provider>
  );
};

