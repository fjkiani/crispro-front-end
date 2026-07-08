/**
 * ClerkAuthContext — Clerk-backed replacement for the legacy Supabase AuthContext.
 *
 * Exposes the SAME shape as the previous AuthContext so downstream consumers
 * (PersonaContext, AuthRedirect, ProtectedRoute, etc.) do not need to change.
 *
 * Exports:
 *   <ClerkAuthProvider> — top-level provider (wrap under <ClerkProvider>)
 *   useAuth()           — hook returning { user, session, profile, loading,
 *                                          profileLoading, authenticated,
 *                                          signIn, signUp, signOut, refreshProfile,
 *                                          getToken }
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useSession, useAuth as useClerkAuth, useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import { API_ROOT } from '../lib/apiConfig';

const AuthContext = createContext({});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within ClerkAuthProvider');
  }
  return ctx;
};

/**
 * Map a Clerk user → the legacy user shape we already use everywhere.
 */
function mapClerkUser(clerkUser) {
  if (!clerkUser) return null;
  const primaryEmail =
    clerkUser.primaryEmailAddress?.emailAddress ||
    (clerkUser.emailAddresses?.[0]?.emailAddress ?? null);
  return {
    id: clerkUser.id,
    email: primaryEmail,
    full_name: clerkUser.fullName || clerkUser.firstName || primaryEmail?.split('@')[0],
    role: clerkUser.publicMetadata?.role || null,
    metadata: clerkUser.publicMetadata || {},
    imageUrl: clerkUser.imageUrl,
  };
}

export const ClerkAuthProvider = ({ children }) => {
  const { isLoaded: userLoaded, isSignedIn, user: clerkUser } = useUser();
  const { isLoaded: sessionLoaded, session: clerkSession } = useSession();
  const { getToken, signOut: clerkSignOut } = useClerkAuth();
  const clerk = useClerk();
  const { signIn: clerkSignIn } = useSignIn();
  const { signUp: clerkSignUp } = useSignUp();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const user = mapClerkUser(clerkUser);
  const authenticated = Boolean(isSignedIn && clerkUser);
  const loading = !userLoaded || !sessionLoaded;

  // Session object exposed downstream
  const session = clerkSession
    ? {
        id: clerkSession.id,
        status: clerkSession.status,
        expireAt: clerkSession.expireAt,
        // Provide a getToken shim compatible with the old Supabase session shape
        access_token_getter: () => getToken(),
      }
    : null;

  /**
   * Fetch profile from backend after Clerk auth is ready.
   * Also triggers /api/auth/clerk-sync to upsert a Supabase profile row.
   */
  const fetchAndSyncProfile = useCallback(async () => {
    if (!authenticated || !clerkUser) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setProfileLoading(false);
        return;
      }
      // Upsert profile row via clerk-sync (idempotent)
      const syncRes = await fetch(`${API_ROOT}/api/auth/clerk-sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: clerkUser.publicMetadata?.role || undefined,
          full_name: clerkUser.fullName || undefined,
        }),
      });
      if (syncRes.ok) {
        const data = await syncRes.json();
        if (data?.data) {
          setProfile(data.data);
        } else {
          setProfile({
            user_id: clerkUser.id,
            email: user?.email,
            role: clerkUser.publicMetadata?.role || 'patient',
            full_name: user?.full_name,
          });
        }
      } else {
        // Non-fatal — Clerk still authoritative for auth
        console.warn('clerk-sync returned', syncRes.status);
        setProfile({
          user_id: clerkUser.id,
          email: user?.email,
          role: clerkUser.publicMetadata?.role || 'patient',
          full_name: user?.full_name,
        });
      }
    } catch (err) {
      console.warn('clerk-sync failed:', err.message);
      setProfile({
        user_id: clerkUser.id,
        email: user?.email,
        role: clerkUser.publicMetadata?.role || 'patient',
        full_name: user?.full_name,
      });
    } finally {
      setProfileLoading(false);
    }
  }, [authenticated, clerkUser, getToken, user?.email, user?.full_name]);

  useEffect(() => {
    fetchAndSyncProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, clerkUser?.id]);

  // ---- Auth actions (exposed to preserve old API surface) --------------

  const signIn = useCallback(
    async ({ email, password }) => {
      if (!clerkSignIn) return { error: 'Clerk not ready' };
      try {
        const attempt = await clerkSignIn.create({ identifier: email, password });
        if (attempt.status === 'complete') {
          await clerk.setActive({ session: attempt.createdSessionId });
          return { user: attempt, session: attempt };
        }
        return { user: attempt, session: attempt };
      } catch (err) {
        return { error: err.errors?.[0]?.longMessage || err.message };
      }
    },
    [clerkSignIn, clerk],
  );

  const signUp = useCallback(
    async ({ email, password, fullName, role }) => {
      if (!clerkSignUp) return { error: 'Clerk not ready' };
      try {
        const attempt = await clerkSignUp.create({
          emailAddress: email,
          password,
          ...(fullName ? { firstName: fullName.split(' ')[0], lastName: fullName.split(' ').slice(1).join(' ') } : {}),
          ...(role ? { unsafeMetadata: { role } } : {}),
        });
        // If email verification required
        if (attempt.status === 'missing_requirements' || attempt.unverifiedFields?.length) {
          await clerkSignUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          return { user: attempt, needsVerification: true };
        }
        if (attempt.status === 'complete') {
          await clerk.setActive({ session: attempt.createdSessionId });
        }
        return { user: attempt };
      } catch (err) {
        return { error: err.errors?.[0]?.longMessage || err.message };
      }
    },
    [clerkSignUp, clerk],
  );

  const signOut = useCallback(async () => {
    setProfile(null);
    await clerkSignOut();
  }, [clerkSignOut]);

  const refreshProfile = useCallback(async () => {
    await fetchAndSyncProfile();
  }, [fetchAndSyncProfile]);

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    authenticated,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    getToken, // for authenticated fetches downstream
    isClerk: true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Backwards-compatible aliases so `import { AuthProvider }` from AuthContext still works.
export const AuthProvider = ClerkAuthProvider;
export default ClerkAuthProvider;
