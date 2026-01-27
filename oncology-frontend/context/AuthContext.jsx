import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseEnabled } from '../services/supabaseClient';

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

  // Fetch user profile with session token
  const fetchUserProfile = async (sessionToken, userId) => {
    if (!sessionToken) {
      console.warn('No session token available for profile fetch');
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const response = await fetch(`${API_ROOT}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

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
    if (!isSupabaseEnabled) {
      console.warn('Supabase not configured - auth disabled');
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && session?.access_token) {
        await fetchUserProfile(session.access_token, session.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && session?.access_token) {
          await fetchUserProfile(session.access_token, session.user.id);
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseEnabled) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch profile after login
      if (data.user && data.session?.access_token) {
        await fetchUserProfile(data.session.access_token, data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    if (!isSupabaseEnabled) {
      throw new Error('Supabase not configured');
    }

    try {
      // Sign up via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      // Also create profile via backend (handles quota creation)
      if (data.user) {
        try {
          await fetch(`${API_ROOT}/api/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              password,
              ...metadata
            })
          });
        } catch (backendError) {
          console.warn('Backend profile creation failed:', backendError);
          // Continue anyway - profile might be created by trigger
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseEnabled) {
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    if (!isSupabaseEnabled) {
      throw new Error('Supabase not configured');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_ROOT}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
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
    isSupabaseEnabled,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile: async () => {
      if (user && session?.access_token) {
        await fetchUserProfile(session.access_token, user.id);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
