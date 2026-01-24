import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// TEMPORARY: Supabase authentication disabled - using mock authentication
const BYPASS_AUTH = true; // Set to false to re-enable Supabase

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

  useEffect(() => {
    if (BYPASS_AUTH) {
      // Mock authentication - auto-login with default user
      console.log('🔓 Auth bypass enabled - using mock authentication');
      
      const mockUser = {
        id: 'mock-user-id',
        email: 'ak@ak.com',
      };
      
      const mockSession = {
        access_token: 'mock-token',
        user: mockUser,
      };
      
      setUser(mockUser);
      setSession(mockSession);
      
      // Try to fetch profile
      fetchUserProfile(null, mockUser.id, mockUser.email);
      
      setLoading(false);
      return;
    }

    // Original Supabase auth code (disabled)
    // if (!isSupabaseEnabled) {
    //   console.warn('Supabase not configured - auth disabled');
    //   setLoading(false);
    //   setProfileLoading(false);
    //   return;
    // }
    // ... rest of Supabase code
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    if (BYPASS_AUTH) {
      // Mock login - always succeeds
      console.log('🔓 Auth bypass: Mock login for', email);
      
      const mockUser = {
        id: 'mock-user-id',
        email: email || 'ak@ak.com',
      };
      
      const mockSession = {
        access_token: 'mock-token',
        user: mockUser,
      };
      
      setUser(mockUser);
      setSession(mockSession);
      
      // Fetch profile
      await fetchUserProfile(null, mockUser.id, mockUser.email);
      
      return { data: { user: mockUser, session: mockSession }, error: null };
    }

    // Original Supabase signIn code would go here
    return { data: null, error: { message: 'Supabase authentication disabled' } };
  };

  const signUp = async (email, password, metadata = {}) => {
    if (BYPASS_AUTH) {
      // Mock signup - always succeeds
      console.log('🔓 Auth bypass: Mock signup for', email);
      return signIn(email, password);
    }

    return { data: null, error: { message: 'Supabase authentication disabled' } };
  };

  const signOut = async () => {
    if (BYPASS_AUTH) {
      console.log('🔓 Auth bypass: Mock signout');
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    // Original Supabase signOut code would go here
  };

  const resetPassword = async (email) => {
    if (BYPASS_AUTH) {
      console.log('🔓 Auth bypass: Mock password reset for', email);
      return { error: null };
    }

    return { error: { message: 'Supabase authentication disabled' } };
  };

  const updateProfile = async (updates) => {
    if (BYPASS_AUTH) {
      console.log('🔓 Auth bypass: Mock profile update', updates);
      // Update local profile state
      setProfile(prev => ({ ...prev, ...updates }));
      return { data: { ...profile, ...updates }, error: null };
    }

    // Original Supabase updateProfile code would go here
    return { data: null, error: { message: 'Supabase authentication disabled' } };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    authenticated: BYPASS_AUTH ? !!user : !!user, // Always true when bypassed and user is set
    isSupabaseEnabled: !BYPASS_AUTH, // Return false when bypassed
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile: async () => {
      if (user && session?.access_token) {
        await fetchUserProfile(session.access_token, user.id);
      } else if (user) {
        await fetchUserProfile(null, user.id, user.email);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
