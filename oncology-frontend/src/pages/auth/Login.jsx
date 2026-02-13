import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SimpleLoginCard } from '../../components/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, profile, authenticated, profileLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect after profile loads or after a short delay if profile doesn't load
  useEffect(() => {
    if (authenticated && !profileLoading) {
      const redirect = () => {
        const intendedPath = new URLSearchParams(window.location.search).get('redirect');
        // Check profile role, or default based on email (ak@ak.com = patient)
        const isPatient = profile?.role === 'patient' || email?.toLowerCase().includes('ak@ak.com');
        if (isPatient) {
          navigate('/ayesha-trials', { replace: true });
        } else if (intendedPath) {
          navigate(intendedPath, { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      };

      // If profile is loaded, redirect immediately
      if (profile) {
        redirect();
      } else {
        // If no profile after 2 seconds, redirect anyway (profile might be loading or not available)
        const timeout = setTimeout(() => {
          redirect();
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [authenticated, profile, profileLoading, navigate, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔵 Login form submitted for:', email);

    // EMERGENCY BYPASS FOR AK
    if (email.toLowerCase() === 'ak@ak.com' || email.toLowerCase() === 'ak@aol.com') {
      console.log('🚀 Activating MARS MODE Bypass for AK...');

      const mockSession = {
        access_token: `mock-token-${Date.now()}-ak`,
        refresh_token: `mock-refresh-${Date.now()}`,
        expires_in: 7 * 24 * 60 * 60,
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000),
        token_type: 'bearer',
        user: {
          id: 'mock_user_001',
          email: email,
          user_metadata: { email: email, role: 'patient' },
          role: 'patient'
        }
      };

      try {
        localStorage.setItem('mock_auth_session', JSON.stringify(mockSession));
        localStorage.setItem(`user_profile_${email}`, JSON.stringify({
          user_id: 'mock_user_001',
          email: email,
          role: 'patient',
          full_name: 'Ayesha K.',
          is_mock: true
        }));

        console.log('✅ Bypass session written. Forcing reload...');
        // Force reload to ensure AuthContext picks up the new session from fresh state
        window.location.href = '/ayesha-trials';
        return;
      } catch (bypassErr) {
        console.error('❌ Bypass failed:', bypassErr);
      }
    }

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        console.error('❌ Login error:', error);
        setError(error.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Profile will be loaded asynchronously by AuthContext
        // Redirect will happen via useEffect when profile is available
        // Just wait here - don't navigate yet
        console.log('✅ Login successful, waiting for profile to load...');
      }
    } catch (err) {
      console.error('❌ Login exception:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      // Only set loading false if we aren't redirecting (i.e. on error)
      // If success, we want to keep loading state until redirect
      if (!email.toLowerCase().includes('ak@')) {
        setLoading(false);
      }
    }
  };

  // If already authenticated, show manual continue button (Stop the loop)
  if (authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Already Logged In</h3>
          <p className="text-gray-500 mb-6">
            Session valid for {profile?.email || email || 'User'}.
          </p>
          <button
            onClick={() => navigate('/ayesha-trials', { replace: true })}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue to Dashboard
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Logout & Reset
          </button>
        </div>
      </div>
    );
  }

  // Show loading while profile is being fetched after login
  if (authenticated && profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <SimpleLoginCard
      email={email}
      password={password}
      error={error}
      loading={loading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onSignupClick={() => navigate('/signup')}
      onForgotPasswordClick={() => navigate('/forgot-password')}
    />
  );
};

export default Login;








