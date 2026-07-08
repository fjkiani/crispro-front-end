/**
 * AuthRedirect - Redirect to /login if not authenticated, or to the persona
 * landing page if authenticated. Extended for the 5-persona matrix
 * (patient, oncologist, hospital, pharma, researcher).
 *
 * Usage: Use as the element for the root route ("/")
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';

const PERSONA_LANDING = {
  patient: '/ayesha-trials',
  oncologist: '/home',
  hospital: '/hospital/tumor-board',
  pharma: '/pharma/dashboard',
  researcher: '/home',
};

const AuthRedirect = () => {
  const { authenticated, loading, profileLoading, profile } = useAuth();
  const { persona, personaLoading } = usePersona();
  const location = useLocation();

  // Show loading while auth/profile/persona is loading
  if (loading || profileLoading || personaLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    console.log('🔐 Not authenticated - redirecting to /login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const landing = PERSONA_LANDING[persona] || PERSONA_LANDING[profile?.role] || '/home';
  console.log(`✅ Authenticated (persona=${persona || profile?.role || 'unknown'}) → ${landing}`);
  return <Navigate to={landing} replace />;
};

export default AuthRedirect;
