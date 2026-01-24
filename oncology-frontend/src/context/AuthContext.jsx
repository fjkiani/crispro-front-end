import React, { createContext, useContext, useState, useEffect } from 'react';
// Supabase disabled - using mock authentication that bypasses Supabase

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

  const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

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
        // Backend auth endpoint doesn't exist - use mock profile
        console.log('ℹ️ Backend auth endpoint not found - using mock profile');
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
        console.warn('⚠️ Could not fetch profile (may need backend auth endpoint):', response.status);
        // Use mock profile as fallback
        const mockProfile = {
          user_id: `mock-user-${email?.replace('@', '-at-')}`,
          email: email || 'ak@ak.com',
          tier: 'free',
          role: 'patient',
          full_name: email?.split('@')[0] || 'Test User',
          is_mock: true
        };
        setProfile(mockProfile);
      }
    } catch (error) {
      console.warn('⚠️ Profile fetch failed (backend may require auth):', error.message);
      // Use mock profile as fallback
      const mockProfile = {
        user_id: `mock-user-${email?.replace('@', '-at-')}`,
        email: email || 'ak@ak.com',
        tier: 'free',
        role: 'patient',
        full_name: email?.split('@')[0] || 'Test User',
        is_mock: true
      };
      setProfile(mockProfile);
    } finally {
      setProfileLoading(false);
    }
  };

  // Check for existing mock session in localStorage
  useEffect(() => {
    const checkMockSession = async () => {
      try {
        const storedSession = localStorage.getItem('mock_auth_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          // Check if session is still valid
          if (sessionData.expires_at && Date.now() < sessionData.expires_at) {
            setSession(sessionData);
            setUser(sessionData.user);
            if (sessionData.user?.email) {
              await fetchUserProfile(sessionData.user.email, sessionData.access_token);
            }
          } else {
            localStorage.removeItem('mock_auth_session');
          }
        }
      } catch (error) {
        console.error('Error checking mock session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMockSession();
  }, []);

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Mock authentication - signing in:', email);
      
      // Create mock user object
      const mockUser = {
        id: `mock-user-${email.replace('@', '-at-')}`,
        email: email,
        user_metadata: {
          email: email,
        },
        created_at: new Date().toISOString(),
      };

      // Create mock session with a simple token
      // Backend may not accept this, but it allows the app to work
      const mockSession = {
        access_token: `mock-token-${Date.now()}-${email}`,
        refresh_token: `mock-refresh-${Date.now()}`,
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockUser,
      };

      // Store session in localStorage
      localStorage.setItem('mock_auth_session', JSON.stringify(mockSession));

      // Set state
      setSession(mockSession);
      setUser(mockUser);

      // Try to fetch profile from backend (may fail if backend requires real JWT)
      await fetchUserProfile(email, mockSession.access_token);

      console.log('✅ Mock authentication successful');
      return { data: { user: mockUser, session: mockSession }, error: null };
    } catch (error) {
      console.error('❌ Mock authentication failed:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    // For mock, signup is same as signin
    return await signIn(email, password);
  };

  const signOut = async () => {
    try {
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
    console.log('🔐 Mock password reset requested for:', email);
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

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    authenticated: !!user,
    isSupabaseEnabled: false, // Supabase disabled
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile: async () => {
      if (user?.email) {
        await fetchUserProfile(user.email, session?.access_token);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
