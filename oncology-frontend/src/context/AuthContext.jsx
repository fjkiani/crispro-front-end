import React, { createContext, useContext, useState, useEffect } from 'react';
// Supabase disabled - using mock authentication
// import { supabase, isSupabaseEnabled } from '../services/supabaseClient';

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

  // Fetch user profile with session token (or email for mock auth)
  const fetchUserProfile = async (sessionToken, userId, email) => {
    setProfileLoading(true);
    try {
      // Try to get profile by email if no token
      const url = sessionToken 
        ? `${API_ROOT}/api/auth/profile`
        : `${API_ROOT}/api/auth/profile?email=${encodeURIComponent(email)}`;
      
      const headers = sessionToken 
        ? {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        : {
            'Content-Type': 'application/json'
          };

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data || data);
        console.log('✅ User profile loaded:', data.data || data);
      } else if (response.status === 404) {
        // Profile doesn't exist yet - that's okay
        console.log('ℹ️ User profile not found - may need onboarding');
        setProfile(null);
      } else {
        console.error('Failed to fetch profile:', response.status, response.statusText);
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setProfile(null);
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
          // Check if session is still valid (not expired)
          if (sessionData.expires_at && Date.now() < sessionData.expires_at) {
            setSession(sessionData);
            setUser(sessionData.user);
            if (sessionData.user?.email) {
              await fetchUserProfile(null, sessionData.user.id, sessionData.user.email);
            }
          } else {
            // Session expired, clear it
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

      // Create mock session
      const mockSession = {
        access_token: `mock-token-${Date.now()}`,
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

      // Fetch profile from backend using email
      await fetchUserProfile(null, mockUser.id, email);

      console.log('✅ Mock authentication successful');
      return { data: { user: mockUser, session: mockSession }, error: null };
    } catch (error) {
      console.error('❌ Mock authentication failed:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      console.log('🔐 Mock signup - creating account:', email);
      
      // For mock, signup is same as signin
      return await signIn(email, password);
    } catch (error) {
      return { data: null, error };
    }
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
    // Mock implementation - just return success
    console.log('🔐 Mock password reset requested for:', email);
    return { error: null };
  };

  const updateProfile = async (updates) => {
    if (!session?.access_token && !user?.email) {
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
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
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
        await fetchUserProfile(session?.access_token, user.id, user.email);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
