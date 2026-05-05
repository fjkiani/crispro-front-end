import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveToStorage, loadFromStorage, removeFromStorage, isSessionValid, extendSession, SESSION_KEYS } from '../utils/sessionPersistence';
import { API_ROOT } from '../lib/apiConfig';
// Auth: Supabase-backed in production. Mock auth available in dev via VITE_ENABLE_MOCK_AUTH=true.

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);


  // Fetch user profile - try with email if no token, fallback to mock if backend unavailable
  const fetchUserProfile = async (email, sessionToken = null) => {
    setProfileLoading(true);
    try {
      // Try to get profile - backend may need JWT, but we'll try email first
      let response;
      if (sessionToken) {
        response = await fetch(`${API_ROOT}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (email) {
        // Try without auth first (may not work, but worth trying)
        response = await fetch(`${API_ROOT}/api/auth/profile?email=${encodeURIComponent(email)}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        setProfileLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data || data);
        console.log('✅ User profile loaded:', data.data || data);
      } else if (response.status === 404) {
        // FIX-5c: Mock profile fallback is now gated behind VITE_ENABLE_MOCK_AUTH.
        if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
          console.log('ℹ️ Backend auth endpoint not found - using mock profile (VITE_ENABLE_MOCK_AUTH=true)');
          const mockProfile = {
            user_id: `mock-user-${email?.replace('@', '-at-')}`,
            email: email || 'ak@ak.com',
            tier: 'free',
            role: 'patient',
            full_name: email?.split('@')[0] || 'Test User',
            is_mock: true
          };
          setProfile(mockProfile);
        } else {
          console.warn('⚠️ Profile endpoint returned 404. User profile unavailable.');
          setProfile(null);
        }
      } else {
        console.warn('⚠️ Could not fetch profile (may need backend auth endpoint):', response.status);
        // FIX-5c: Mock profile fallback is now gated behind VITE_ENABLE_MOCK_AUTH.
        if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
          const mockProfile = {
            user_id: `mock-user-${email?.replace('@', '-at-')}`,
            email: email || 'ak@ak.com',
            tier: 'free',
            role: 'patient',
            full_name: email?.split('@')[0] || 'Test User',
            is_mock: true
          };
          setProfile(mockProfile);
        } else {
          setProfile(null);
        }
      }
    } catch (error) {
      console.warn('⚠️ Profile fetch failed (backend may require auth):', error.message);
      // FIX-5c: Mock profile fallback is now gated behind VITE_ENABLE_MOCK_AUTH.
      if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
        const mockProfile = {
          user_id: `mock-user-${email?.replace('@', '-at-')}`,
          email: email || 'ak@ak.com',
          tier: 'free',
          role: 'patient',
          full_name: email?.split('@')[0] || 'Test User',
          is_mock: true
        };
        setProfile(mockProfile);
      } else {
        setProfile(null);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Check for existing session in localStorage and restore on app startup
  useEffect(() => {
    const checkMockSession = async () => {
      try {
        const sessionData = loadFromStorage(SESSION_KEYS.AUTH_SESSION);

        if (sessionData && isSessionValid(sessionData)) {
          // Session is valid - restore it
          console.log('✅ Restoring valid session from localStorage');
          setSession(sessionData);
          setUser(sessionData.user);

          // If session is close to expiring, refresh it proactively
          const now = Date.now();
          const expiresAt = sessionData.expires_at;
          const timeUntilExpiry = expiresAt - now;
          const refreshThreshold = 24 * 60 * 60 * 1000; // Refresh if less than 24 hours remaining

          if (timeUntilExpiry < refreshThreshold) {
            console.log('🔄 Session expiring soon, refreshing proactively...');
            const refreshedSession = extendSession(sessionData, 7);
            if (refreshedSession) {
              setSession(refreshedSession);
            }
          }

          if (sessionData.user?.email) {
            // Don't await profile fetch - let it happen in background so we don't block app render
            fetchUserProfile(sessionData.user.email, sessionData.access_token).catch(e =>
              console.warn('Background profile fetch failed:', e)
            );
          }
        } else if (sessionData) {
          // Session exists but is expired - clear it
          console.log('⚠️ Session expired, clearing...');
          removeFromStorage(SESSION_KEYS.AUTH_SESSION);
        } else {
          // FIX-5a: MARS MODE is now gated behind VITE_ENABLE_MOCK_AUTH.
          // In production (VITE_ENABLE_MOCK_AUTH unset or "false"), no session is auto-created.
          // Users are redirected to /login by ProtectedRoute as expected.
          if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
            console.log('ℹ️ No stored session found. MARS MODE active (VITE_ENABLE_MOCK_AUTH=true): Auto-regenerating session for AK.');

            const mockUser = {
              id: 'mock_user_001',
              email: 'ak@ak.com',
              user_metadata: { email: 'ak@ak.com', role: 'patient' },
              created_at: new Date().toISOString(),
              is_mock: true
            };

            const mockSession = {
              access_token: `mock-token-${Date.now()}-auto`,
              refresh_token: `mock-refresh-${Date.now()}`,
              expires_in: 7 * 24 * 60 * 60,
              expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000),
              token_type: 'bearer',
              user: mockUser,
            };

            saveToStorage(SESSION_KEYS.AUTH_SESSION, mockSession);
            setSession(mockSession);
            setUser(mockUser);

            // Background fetch profile
            fetchUserProfile('ak@ak.com', mockSession.access_token).catch(console.warn);
          } else {
            console.log('ℹ️ No stored session found. Redirecting to login.');
            // Leave user/session null — ProtectedRoute will redirect to /login.
          }
        }
      } catch (error) {
        console.error('❌ Error checking mock session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMockSession();
  }, []);

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Attempting authentication:', email);

      // Try backend authentication first
      try {
        console.log('📡 Contacting backend for auth...');
        const response = await fetch(`${API_ROOT}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Backend authentication successful');

          const user = {
            id: result.data?.user_id || result.data?.user?.id,
            email: result.data?.email || email,
            user_metadata: result.data?.profile || {},
            created_at: new Date().toISOString(),
          };

          const session = {
            access_token: result.data?.session?.access_token || result.data?.session?.token,
            refresh_token: result.data?.session?.refresh_token,
            expires_in: result.data?.session?.expires_in || (7 * 24 * 60 * 60), // Default 7 days
            expires_at: result.data?.session?.expires_at || (Date.now() + (7 * 24 * 60 * 60 * 1000)), // Default 7 days
            token_type: 'bearer',
            user: user,
          };

          // Store session in localStorage using utility
          saveToStorage(SESSION_KEYS.AUTH_SESSION, session);

          // Set state
          setSession(session);
          setUser(user);

          // Fetch profile
          await fetchUserProfile(email, session.access_token);

          return { data: { user, session }, error: null };
        } else {
          // Check for 404 (endpoint not found) vs 401 (unauthorized)
          if (response.status === 404 || response.status === 405) {
            console.warn('⚠️ Backend auth endpoint missing, falling back to mock.');
            throw new Error('Backend auth endpoint missing');
          }

          const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
          console.warn('⚠️ Backend login failed:', errorData);

          // FIX-5b: AK hardcoded bypass is now gated behind VITE_ENABLE_MOCK_AUTH.
          // In production, any failed login returns an error — no mock fallback for specific emails.
          if (import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'true') {
            return { data: null, error: new Error(errorData.detail || 'Login failed') };
          }
          if (email !== 'ak@ak.com' && email !== 'ak@aol.com') {
            return { data: null, error: new Error(errorData.detail || 'Login failed') };
          }
          throw new Error('Fallback to mock for test user (VITE_ENABLE_MOCK_AUTH=true)');
        }
      } catch (backendError) {
        // Only fall back to mock when explicitly enabled (local dev only).
        // In production (VITE_ENABLE_MOCK_AUTH != 'true'), propagate the real error.
        if (import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'true') {
          console.error('❌ Backend authentication failed:', backendError.message);
          return { data: null, error: new Error(backendError.message || 'Authentication failed. Please try again.') };
        }

        console.warn('⚠️ Backend unavailable/failed, using mock authentication (dev mode):', backendError.message);

        // Fallback to mock authentication (dev only)
        const mockUser = {
          id: `mock-user-${email.replace('@', '-at-')}`,
          email: email,
          user_metadata: {
            email: email,
          },
          created_at: new Date().toISOString(),
          is_mock: true
        };

        const mockSession = {
          access_token: `mock-token-${Date.now()}-${email}`,
          refresh_token: `mock-refresh-${Date.now()}`,
          expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days in milliseconds
          token_type: 'bearer',
          user: mockUser,
        };

        console.log('💾 Saving mock session to storage...');
        saveToStorage(SESSION_KEYS.AUTH_SESSION, mockSession);

        setSession(mockSession);
        setUser(mockUser);

        console.log('👤 Fetching mock profile...');
        await fetchUserProfile(email, mockSession.access_token);

        console.log('✅ Mock authentication successful (backend unavailable)');
        return { data: { user: mockUser, session: mockSession }, error: null };
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    // Try backend signup first, then fallback to mock
    try {
      const response = await fetch(`${API_ROOT}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, ...metadata }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backend signup successful');
        // Sign in with the new account
        return await signIn(email, password);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Signup failed' }));
        if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
          console.warn('⚠️ Backend signup failed, using mock (dev mode):', errorData);
          return await signIn(email, password);
        }
        return { data: null, error: new Error(errorData.detail || 'Signup failed') };
      }
    } catch (error) {
      if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
        console.warn('⚠️ Backend signup unavailable, using mock (dev mode):', error.message);
        return await signIn(email, password);
      }
      return { data: null, error: new Error('Signup service unavailable. Please try again.') };
    }
  };

  const signOut = async () => {
    try {
      // Try backend logout if we have a real token
      if (session?.access_token && !session.access_token.startsWith('mock-token-')) {
        try {
          await fetch(`${API_ROOT}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (e) {
          console.warn('Backend logout failed:', e);
        }
      }

      removeFromStorage(SESSION_KEYS.AUTH_SESSION);
      localStorage.removeItem('mock_auth_session');
      setUser(null);
      setSession(null);
      setProfile(null);
      console.log('✅ Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    console.log('🔐 Password reset requested for:', email);
    // TODO: Implement backend password reset
    return { error: null };
  };

  const updateProfile = async (updates) => {
    if (!user?.email) {
      throw new Error('Not authenticated');
    }

    try {
      const url = session?.access_token
        ? `${API_ROOT}/api/auth/profile`
        : `${API_ROOT}/api/auth/profile?email=${encodeURIComponent(user.email)}`;

      const headers = session?.access_token
        ? {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
        : {
          'Content-Type': 'application/json'
        };

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        // If backend fails, update local state
        setProfile(prev => ({ ...prev, ...updates }));
        return { data: { ...profile, ...updates }, error: null };
      }

      const data = await response.json();
      setProfile(data.data);
      return { data, error: null };
    } catch (error) {
      // If backend fails, update local state
      setProfile(prev => ({ ...prev, ...updates }));
      return { data: { ...profile, ...updates }, error: null };
    }
  };

  // Auto-refresh session before expiration (runs every 5 minutes)
  useEffect(() => {
    if (!session || !session.expires_at) return;

    const checkAndRefreshSession = () => {
      if (!isSessionValid(session)) {
        console.log('⚠️ Session expired, clearing...');
        removeFromStorage(SESSION_KEYS.AUTH_SESSION);
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      const now = Date.now();
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      const refreshThreshold = 24 * 60 * 60 * 1000; // Refresh if less than 24 hours remaining

      if (timeUntilExpiry > 0 && timeUntilExpiry < refreshThreshold) {
        console.log('🔄 Auto-refreshing session (expires soon)...');
        const refreshedSession = extendSession(session, 7);
        if (refreshedSession) {
          setSession(refreshedSession);
        }
      }
    };

    // Check immediately
    checkAndRefreshSession();

    // Check every 5 minutes
    const interval = setInterval(checkAndRefreshSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Persist profile to localStorage when it changes
  useEffect(() => {
    if (profile && user?.email) {
      try {
        const profileKey = `user_profile_${user.email}`;
        localStorage.setItem(profileKey, JSON.stringify(profile));
        console.log('💾 Saved user profile to localStorage');
      } catch (error) {
        console.warn('⚠️ Failed to save profile to localStorage:', error);
      }
    }
  }, [profile, user]);

  // Restore profile from localStorage on mount if available
  useEffect(() => {
    if (user?.email && !profile && !profileLoading) {
      try {
        const profileKey = `user_profile_${user.email}`;
        const storedProfile = localStorage.getItem(profileKey);
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          console.log('✅ Restored user profile from localStorage');
          setProfile(parsed);
        }
      } catch (error) {
        console.warn('⚠️ Failed to restore profile from localStorage:', error);
      }
    }
  }, [user?.email, profile, profileLoading]);

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    authenticated: !!user,
    isSupabaseEnabled: true, // Supabase-backed in production
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile: async () => {
      if (user?.email) {
        await fetchUserProfile(user.email, session?.access_token);
      }
    },
    refreshSession: () => {
      if (session) {
        const refreshedSession = extendSession(session, 7);
        if (refreshedSession) {
          setSession(refreshedSession);
          console.log('✅ Session refreshed manually');
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
