import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePersona } from '../../context/PersonaContext';
import { useAuth } from '../../context/AuthContext';

/**
 * PersonaRoute - Route guard based on persona access
 * 
 * @param {React.ReactNode} children - Child components to render
 * @param {string[]} allowedPersonas - Array of personas allowed to access this route
 * @param {string} redirectTo - Path to redirect unauthorized users (default: '/home')
 */
const PersonaRoute = ({ children, allowedPersonas = [], redirectTo = '/home' }) => {
  const { persona, hasPageAccess } = usePersona();
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Require authentication
  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If no persona, deny access
  if (!persona) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">Unable to determine user persona. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Check if persona is in allowed list
  if (allowedPersonas.length > 0 && !allowedPersonas.includes(persona)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This page is only accessible to: {allowedPersonas.join(', ')}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your current role: <span className="font-semibold">{persona}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check page-level access (if persona has access to this specific page)
  if (!hasPageAccess(location.pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.location.href = redirectTo}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return children;
};

export default PersonaRoute;

