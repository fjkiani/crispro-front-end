import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create the context
const ActivityContext = createContext();

// Event types constants
export const ACTIVITY_TYPES = {
  GENOMIC_ANALYSIS: 'genomic_analysis',
  SUMMARY: 'summary',
  DEEP_DIVE: 'deep_dive',
  AGENT_STATUS: 'agent_status', // General agent messages
  // New, more granular types:
  GENOMIC_QUERY_SUBMITTED: 'genomic_query_submitted',
  GENOMIC_ANALYSIS_SUCCESS: 'genomic_analysis_success',
  GENOMIC_ANALYSIS_ERROR: 'genomic_analysis_error',
  CRISPR_DESIGN_INITIATED: 'crispr_design_initiated',
  DEEP_DIVE_REQUESTED: 'deep_dive_requested',
  DEEP_DIVE_SUCCESS: 'deep_dive_success',
  DEEP_DIVE_ERROR: 'deep_dive_error',
  AGENT_ACTION_REQUESTED: 'agent_action_requested', // For placeholder actions
  AGENT_ACTION_SUCCESS: 'agent_action_success',
  AGENT_ACTION_ERROR: 'agent_action_error',
  CONSULTATION_EVENT: 'consultation_event', // For chat messages, joining, etc.
  // Target Dossier Analysis Types:
  TARGET_ANALYSIS_STARTED: 'target_analysis_started',
  TARGET_VALIDATION: 'target_validation',
  DEPENDENCY_ANALYSIS: 'dependency_analysis',
  DRUGGABILITY_ASSESSMENT: 'druggability_assessment',
  CRISPR_FORGE: 'crispr_forge',
  INHIBITOR_FORGE: 'inhibitor_forge',
  IN_SILICO_TRIAL: 'in_silico_trial',
  DOSSIER_COMPLETE: 'dossier_complete',
  MISSION_GO_DECISION: 'mission_go_decision',
  MISSION_NO_GO_DECISION: 'mission_no_go_decision'
};

// The provider component
export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  // Load activities from localStorage on mount
  useEffect(() => {
    const storedActivities = JSON.parse(localStorage.getItem('globalActivities') || '[]');
    setActivities(storedActivities);
  }, []);

  // Save activities to localStorage when they change
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('globalActivities', JSON.stringify(activities.slice(0, 50)));
    } else if (activities.length === 0 && localStorage.getItem('globalActivities')) {
      // Clear localStorage if activities are cleared
      localStorage.removeItem('globalActivities');
    }
  }, [activities]);

  // Add a new activity
  const addActivity = useCallback((type, message, details = {}) => {
    const newActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Added random suffix for better uniqueness
      timestamp: new Date(),
      type,
      message,
      details,
      patientId: currentPatientId
    };
    
    setActivities(prev => [newActivity, ...prev].slice(0, 50)); // Ensure we don't exceed 50
    return newActivity;
  }, [currentPatientId]); // Depends on currentPatientId

  // Clear all activities
  const clearActivities = useCallback(() => {
    setActivities([]);
    // localStorage removal is handled by the useEffect above
  }, []);

  // Filter activities by current patient (no need for useCallback if not passed as prop/dependency)
  const getPatientActivities = () => {
    return activities.filter(activity => 
      !currentPatientId || activity.patientId === currentPatientId
    );
  };
  
  const stableSetCurrentPatientId = useCallback((pid) => {
    setCurrentPatientId(pid);
  }, []);

  // Value object with state and functions
  const value = {
    activities,
    addActivity,
    clearActivities,
    getPatientActivities, // This is fine as is, it's called, not passed as dependency
    currentPatientId,
    setCurrentPatientId: stableSetCurrentPatientId // Use the stable version
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

// Custom hook for using the activity context
export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export default ActivityContext; 