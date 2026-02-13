import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { saveToStorage, loadFromStorage, removeFromStorage, SESSION_KEYS } from '../utils/sessionPersistence';

/**
 * SporadicContext - State management for sporadic cancer workflow
 * 
 * Manages:
 * - Germline status
 * - Tumor context (from Quick Intake or NGS Upload)
 * - Integration with WIWFM efficacy prediction
 * 
 * Day 4 Phase 2 - Module M5
 * 
 * PERSISTENCE: All state is saved to localStorage and restored on app startup
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
  // Initialize state from localStorage or defaults
  const loadPersistedState = () => {
    try {
      // Use the correct session key
      const stored = loadFromStorage(SESSION_KEYS.SPORADIC_CONTEXT);
      if (stored) {
        // If loaded via helper, it's already parsed
        const parsed = stored;
        console.log('✅ Restored SporadicContext from localStorage:', parsed);
        return {
          germlineStatus: parsed.germlineStatus || 'unknown',
          tumorContext: parsed.tumorContext || null,
          contextId: parsed.contextId || null,
          dataLevel: parsed.dataLevel || 'L0',
        };
      }
    } catch (error) {
      console.warn('⚠️ Failed to restore SporadicContext from localStorage:', error);
    }
    return {
      germlineStatus: 'unknown',
      tumorContext: null,
      contextId: null,
      dataLevel: 'L0',
    };
  };

  const initialState = loadPersistedState();
  const [germlineStatus, setGermlineStatusState] = useState(initialState.germlineStatus);
  const [tumorContext, setTumorContextState] = useState(initialState.tumorContext);
  const [contextId, setContextIdState] = useState(initialState.contextId);
  const [dataLevel, setDataLevelState] = useState(initialState.dataLevel);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      germlineStatus,
      tumorContext,
      contextId,
      dataLevel,
      lastUpdated: new Date().toISOString(),
    };
    saveToStorage(SESSION_KEYS.SPORADIC_CONTEXT, stateToSave);
  }, [germlineStatus, tumorContext, contextId, dataLevel]);

  // Wrapped setters that also persist
  const setGermlineStatus = useCallback((status) => {
    setGermlineStatusState(status);
  }, []);

  const setTumorContext = useCallback((context) => {
    setTumorContextState(context);
  }, []);

  const setContextId = useCallback((id) => {
    setContextIdState(id);
  }, []);

  const setDataLevel = useCallback((level) => {
    setDataLevelState(level);
  }, []);

  // Update tumor context from Quick Intake or Upload
  const updateTumorContext = useCallback((data) => {
    if (data?.tumor_context) {
      setTumorContextState(data.tumor_context);
      setContextIdState(data.context_id);

      // Determine data level from completeness score
      const completeness = data.tumor_context.completeness_score || 0;
      let newLevel = 'L0';
      if (completeness >= 0.7) {
        newLevel = 'L2';
      } else if (completeness >= 0.3) {
        newLevel = 'L1';
      }
      setDataLevelState(newLevel);

      console.log('✅ Tumor context updated:', {
        contextId: data.context_id,
        level: newLevel,
        completeness: completeness.toFixed(2),
      });
    }
  }, []);

  // Clear tumor context (start fresh)
  const clearTumorContext = useCallback(() => {
    setTumorContextState(null);
    setContextIdState(null);
    setDataLevelState('L0');
    // Clear from localStorage
    removeFromStorage(SESSION_KEYS.SPORADIC_CONTEXT);
    console.log('🗑️  Tumor context cleared from memory and localStorage');
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



