import React, { createContext, useContext, useEffect, useState } from 'react';
import { analysisHistoryService } from '../services/supabaseClient';

// Analysis History Context
const AnalysisHistoryContext = createContext();

const MAX_SAVED_ANALYSES = 20; // Limit to prevent database bloat

export const AnalysisHistoryProvider = ({ children }) => {
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved analyses from Supabase on mount
  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        setIsLoading(true);
        if (analysisHistoryService.enabled) {
          console.log('Loading analyses from Supabase...');
          const analyses = await analysisHistoryService.loadAllAnalyses(MAX_SAVED_ANALYSES);
          console.log('Loaded analyses from Supabase:', analyses);
          setSavedAnalyses(analyses);
        } else {
          // Fallback to localStorage if Supabase is not enabled
          console.log('Supabase not enabled, loading from localStorage...');
          try {
            const stored = localStorage.getItem('myeloma_digital_twin_history');
            if (stored) {
              const parsed = JSON.parse(stored);
              console.log('Loaded analyses from localStorage:', parsed);
              if (Array.isArray(parsed)) {
                setSavedAnalyses(parsed);
              }
            } else {
              console.log('No analyses found in localStorage');
            }
          } catch (error) {
            console.warn('Failed to load saved analyses from localStorage:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load analyses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyses();
  }, []);

  // Generate a unique key for an analysis based on its parameters
  const generateAnalysisKey = (modelId, mutations, options = {}) => {
    const mutationString = JSON.stringify(
      mutations
        .filter(m => m && m.variant_info)
        .sort((a, b) => (a.variant_info || '').localeCompare(b.variant_info || ''))
    );
    const optionsString = JSON.stringify(options);
    return btoa(`${modelId}:${mutationString}:${optionsString}`).slice(0, 32);
  };

  // Save a new analysis
  const saveAnalysis = async (analysisData) => {
    const {
      modelId,
      mutations,
      results,
      options = {},
      timestamp = new Date().toISOString(),
      name = null
    } = analysisData;

    const key = generateAnalysisKey(modelId, mutations, options);

    const newAnalysis = {
      key,
      name: name || `Analysis ${new Date().toLocaleString()}`,
      modelId,
      mutations: [...mutations], // Deep copy
      options: { ...options },
      results: { ...results }, // Deep copy
      timestamp,
      metadata: {
        mutationCount: mutations.length,
        hasResults: !!results,
        useCase: options.use_case_id || 'myeloma'
      }
    };

    try {
      if (analysisHistoryService.enabled) {
        // Save to Supabase
        await analysisHistoryService.saveAnalysis(newAnalysis);
        console.log('Analysis saved to Supabase:', key);
      } else {
        // Fallback to localStorage
        const existingIndex = savedAnalyses.findIndex(analysis => analysis.key === key);

        if (existingIndex >= 0) {
          // Update existing analysis
          const updated = [...savedAnalyses];
          updated[existingIndex] = newAnalysis;
          setSavedAnalyses(updated);
          // Save to localStorage
          localStorage.setItem('myeloma_digital_twin_history', JSON.stringify(updated));
        } else {
          // Add new analysis (keep only most recent MAX_SAVED_ANALYSES)
          const updated = [newAnalysis, ...savedAnalyses].slice(0, MAX_SAVED_ANALYSES);
          setSavedAnalyses(updated);
          // Save to localStorage
          localStorage.setItem('myeloma_digital_twin_history', JSON.stringify(updated));
        }
        console.log('Analysis saved to localStorage:', key);
      }
    } catch (error) {
      console.error('Failed to save analysis:', error);
      // Still update local state for UI consistency
      const existingIndex = savedAnalyses.findIndex(analysis => analysis.key === key);
      if (existingIndex >= 0) {
        const updated = [...savedAnalyses];
        updated[existingIndex] = newAnalysis;
        setSavedAnalyses(updated);
      } else {
        const updated = [newAnalysis, ...savedAnalyses].slice(0, MAX_SAVED_ANALYSES);
        setSavedAnalyses(updated);
      }
    }

    return key;
  };

  // Load a saved analysis
  const loadAnalysis = async (key) => {
    console.log('loadAnalysis called with key:', key);
    console.log('Current savedAnalyses:', savedAnalyses);

    const analysis = savedAnalyses.find(a => a.key === key);
    if (analysis) {
      console.log('Found analysis in local state:', analysis);
      setCurrentAnalysis(analysis);
      return analysis;
    }

    // Try to load from Supabase if not in local state
    if (analysisHistoryService.enabled) {
      try {
        console.log('Trying to load from Supabase...');
        const remoteAnalysis = await analysisHistoryService.loadAnalysis(key);
        console.log('Remote analysis from Supabase:', remoteAnalysis);
        if (remoteAnalysis) {
          setCurrentAnalysis(remoteAnalysis);
          return remoteAnalysis;
        }
      } catch (error) {
        console.error('Failed to load analysis from Supabase:', error);
      }
    } else {
      console.log('Supabase not enabled, trying localStorage fallback');
      // Try localStorage fallback
      try {
        const stored = localStorage.getItem('myeloma_digital_twin_history');
        if (stored) {
          const parsed = JSON.parse(stored);
          const localAnalysis = parsed.find(a => a.key === key);
          if (localAnalysis) {
            console.log('Found analysis in localStorage:', localAnalysis);
            setCurrentAnalysis(localAnalysis);
            return localAnalysis;
          }
        }
      } catch (error) {
        console.error('Failed to load analysis from localStorage:', error);
      }
    }

    console.log('No analysis found for key:', key);
    return null;
  };

  // Delete a saved analysis
  const deleteAnalysis = async (key) => {
    try {
      if (analysisHistoryService.enabled) {
        await analysisHistoryService.deleteAnalysis(key);
        console.log('Analysis deleted from Supabase:', key);
      } else {
        // Remove from localStorage
        localStorage.setItem('myeloma_digital_twin_history',
          JSON.stringify(savedAnalyses.filter(a => a.key !== key)));
      }
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }

    const updated = savedAnalyses.filter(a => a.key !== key);
    setSavedAnalyses(updated);
    if (currentAnalysis?.key === key) {
      setCurrentAnalysis(null);
    }
  };

  // Clear all saved analyses
  const clearAllAnalyses = async () => {
    try {
      if (analysisHistoryService.enabled) {
        await analysisHistoryService.clearAllAnalyses();
        console.log('All analyses cleared from Supabase');
      } else {
        localStorage.removeItem('myeloma_digital_twin_history');
      }
    } catch (error) {
      console.error('Failed to clear analyses:', error);
    }

    setSavedAnalyses([]);
    setCurrentAnalysis(null);
  };

  // Get analysis by key (without setting as current)
  const getAnalysis = (key) => {
    return savedAnalyses.find(a => a.key === key);
  };

  // Check if an analysis exists for given parameters
  const hasAnalysis = async (modelId, mutations, options = {}) => {
    const key = generateAnalysisKey(modelId, mutations, options);

    // Check local state first
    const localExists = savedAnalyses.some(a => a.key === key);
    if (localExists) return true;

    // Check Supabase if enabled
    if (analysisHistoryService.enabled) {
      try {
        return await analysisHistoryService.hasAnalysis(key);
      } catch (error) {
        console.error('Failed to check analysis in Supabase:', error);
        return false;
      }
    }

    return false;
  };

  // Get recent analyses (last N)
  const getRecentAnalyses = (count = 5) => {
    return savedAnalyses.slice(0, count);
  };

  const value = {
    savedAnalyses,
    currentAnalysis,
    setCurrentAnalysis,
    saveAnalysis,
    loadAnalysis,
    deleteAnalysis,
    clearAllAnalyses,
    getAnalysis,
    hasAnalysis,
    getRecentAnalyses,
    generateAnalysisKey
  };

  return (
    <AnalysisHistoryContext.Provider value={value}>
      {children}
    </AnalysisHistoryContext.Provider>
  );
};

// Custom hook to use the analysis history context
export const useAnalysisHistory = () => {
  const context = useContext(AnalysisHistoryContext);
  if (!context) {
    throw new Error('useAnalysisHistory must be used within an AnalysisHistoryProvider');
  }
  return context;
};

export default AnalysisHistoryContext;
