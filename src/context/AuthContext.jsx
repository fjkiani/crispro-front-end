/**
 * AuthContext — shim.
 *
 * The auth implementation moved to ClerkAuthContext (Clerk-backed).
 * This shim re-exports the same API so the ~60 files that already import
 * `useAuth` / `AuthProvider` from '../context/AuthContext' keep working
 * unchanged.
 *
 * TODO(migration): once every import is updated to `./ClerkAuthContext`,
 * this file can be deleted.
 */
export { useAuth, AuthProvider, ClerkAuthProvider } from './ClerkAuthContext';
export { default } from './ClerkAuthContext';
