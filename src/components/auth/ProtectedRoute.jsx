import React, { useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_ROOT } from '../../lib/apiConfig';

/**
 * ProtectedRoute — guards routes behind authentication.
 *
 * In production (VITE_ENABLE_MOCK_AUTH != 'true'):
 *   On first mount, verifies the stored token against GET /api/auth/profile.
 *   If the backend returns 401, clears storage and redirects to /login.
 *   This catches stale tokens that pass the localStorage validity check but
 *   are rejected by the backend (e.g. after a Supabase secret rotation).
 *
 * In dev (VITE_ENABLE_MOCK_AUTH=true):
 *   Skips the backend verification call — mock tokens would always fail it.
 */
const ProtectedRoute = ({ children }) => {
  const { authenticated, loading, session, signOut } = useAuth();
  const navigate = useNavigate();
  const verifiedRef = useRef(false);

  useEffect(() => {
    // Only verify once per mount, only in production, only when authenticated
    if (
      verifiedRef.current ||
      import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true' ||
      !authenticated ||
      !session?.access_token
    ) return;

    verifiedRef.current = true;

    // Skip verification for mock tokens (dev tokens that slipped through)
    if (session.access_token.startsWith('mock-token-')) return;

    fetch(`${API_ROOT}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          console.warn('⚠️ Stored token rejected by backend — clearing session and redirecting to login.');
          await signOut();
          navigate('/login', { replace: true });
        }
        // 200 or other errors: leave session intact
      })
      .catch(() => {
        // Network error — backend may be down. Don't sign out; let the user stay.
        console.warn('⚠️ Token verification network error — keeping session.');
      });
  }, [authenticated, session, signOut, navigate]);

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

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
