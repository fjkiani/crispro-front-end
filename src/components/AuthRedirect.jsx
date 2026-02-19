/**
 * AuthRedirect - Redirects to /login if not authenticated, or appropriate page if authenticated
 * 
 * Usage: Use as the element for the root route ("/")
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';

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

  // If not authenticated, redirect to login
  if (!authenticated) {
    console.log('🔐 Not authenticated - redirecting to /login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If authenticated as patient (Ayesha), redirect to trials page
  if (persona === 'patient' || profile?.role === 'patient') {
    console.log('✅ Patient authenticated - redirecting to /ayesha-trials');
    return <Navigate to="/ayesha-trials" replace />;
  }

  // Otherwise, redirect to home
  console.log('✅ Authenticated - redirecting to /home');
  return <Navigate to="/home" replace />;
};

export default AuthRedirect;
