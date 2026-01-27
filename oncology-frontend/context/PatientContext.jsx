/**
 * PatientContext - Patient-specific data management
 * 
 * Provides patient profile, session, and care plan data to components.
 * Only loads when user role is "patient".
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PatientContext = createContext({});

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const { user, profile, session } = useAuth();
  const [patientProfile, setPatientProfile] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [carePlan, setCarePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

  // Load patient context when user is authenticated and role is patient
  useEffect(() => {
    if (user && profile?.role === 'patient' && session?.access_token) {
      loadPatientContext();
    } else {
      setLoading(false);
    }
  }, [user, profile, session]);

  const loadPatientContext = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load patient profile
      const profileRes = await fetch(`${API_ROOT}/api/patient/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setPatientProfile(profileData);
      } else if (profileRes.status === 404) {
        // Profile doesn't exist yet - will need onboarding
        setPatientProfile(null);
      }

      // Load active session
      const sessionRes = await fetch(`${API_ROOT}/api/patient/sessions/active`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setCurrentSession(sessionData);

        // Load latest care plan if session exists
        if (sessionData?.id) {
          const carePlanRes = await fetch(
            `${API_ROOT}/api/patient/care-plans/latest?session_id=${sessionData.id}`,
            {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (carePlanRes.ok) {
            const carePlanData = await carePlanRes.json();
            setCarePlan(carePlanData);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load patient context:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session, API_ROOT]);

  const updateCA125 = useCallback(async (newValue) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_ROOT}/api/patient/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ca125_value: newValue,
          ca125_last_updated: new Date().toISOString()
        })
      });

      if (response.ok) {
        await loadPatientContext(); // Reload
      } else {
        throw new Error('Failed to update CA-125');
      }
    } catch (err) {
      console.error('Failed to update CA-125:', err);
      throw err;
    }
  }, [session, API_ROOT, loadPatientContext]);

  const uploadNGS = useCallback(async (ngsData) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_ROOT}/api/patient/profile/ngs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ngsData)
      });

      if (response.ok) {
        await loadPatientContext(); // Reload with new NGS data
      } else {
        throw new Error('Failed to upload NGS report');
      }
    } catch (err) {
      console.error('Failed to upload NGS:', err);
      throw err;
    }
  }, [session, API_ROOT, loadPatientContext]);

  const saveCarePlan = useCallback(async (carePlanData) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_ROOT}/api/patient/care-plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          care_plan_data: carePlanData,
          session_id: currentSession?.id
        })
      });

      if (response.ok) {
        const saved = await response.json();
        setCarePlan(saved);
      } else {
        throw new Error('Failed to save care plan');
      }
    } catch (err) {
      console.error('Failed to save care plan:', err);
      throw err;
    }
  }, [session, API_ROOT, currentSession]);

  const updatePatientProfile = useCallback(async (updates) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_ROOT}/api/patient/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await loadPatientContext(); // Reload
      } else {
        throw new Error('Failed to update patient profile');
      }
    } catch (err) {
      console.error('Failed to update patient profile:', err);
      throw err;
    }
  }, [session, API_ROOT, loadPatientContext]);

  const createNewSession = useCallback(async (sessionData) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_ROOT}/api/patient/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const newSession = await response.json();
        setCurrentSession(newSession);
        return newSession;
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
    }
  }, [session, API_ROOT]);

  // Helper flags
  const hasProfile = patientProfile !== null;
  const isPatient = profile?.role === 'patient';

  return (
    <PatientContext.Provider
      value={{
        patientProfile,
        currentSession,
        carePlan,
        loading,
        error,
        hasProfile,
        isPatient,
        loadPatientContext,
        updateCA125,
        uploadNGS,
        saveCarePlan,
        updatePatientProfile,
        createNewSession
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};
