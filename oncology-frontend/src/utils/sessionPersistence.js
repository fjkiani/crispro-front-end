/**
 * Session Persistence Utility
 * 
 * Centralized utilities for managing session persistence across the application.
 * Handles localStorage operations, session validation, and state restoration.
 */

const SESSION_KEYS = {
  AUTH_SESSION: 'mock_auth_session',
  SPORADIC_CONTEXT: 'sporadic_context_state',
  USER_PROFILE: (email) => `user_profile_${email}`,
  ANALYSIS_HISTORY: 'myeloma_digital_twin_history',
  ACTIVITIES: 'globalActivities',
};

/**
 * Save data to localStorage with error handling
 */
export const saveToStorage = (key, data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    console.log(`💾 Saved to localStorage: ${key}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Failed to save to localStorage (${key}):`, error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.error('❌ localStorage quota exceeded - clearing old data');
      clearOldStorageData();
      // Retry once
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        return false;
      }
    }
    return false;
  }
};

/**
 * Load data from localStorage with error handling
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log(`✅ Loaded from localStorage: ${key}`);
      return parsed;
    }
    return defaultValue;
  } catch (error) {
    console.warn(`⚠️ Failed to load from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️  Removed from localStorage: ${key}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Failed to remove from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Clear old storage data to free up space
 * Keeps only the most recent 10 items for each key
 */
const clearOldStorageData = () => {
  try {
    // Clear old analysis history (keep only last 10)
    const history = loadFromStorage(SESSION_KEYS.ANALYSIS_HISTORY, []);
    if (Array.isArray(history) && history.length > 10) {
      saveToStorage(SESSION_KEYS.ANALYSIS_HISTORY, history.slice(0, 10));
    }

    // Clear old activities (keep only last 20)
    const activities = loadFromStorage(SESSION_KEYS.ACTIVITIES, []);
    if (Array.isArray(activities) && activities.length > 20) {
      saveToStorage(SESSION_KEYS.ACTIVITIES, activities.slice(0, 20));
    }
  } catch (error) {
    console.error('❌ Error clearing old storage data:', error);
  }
};

/**
 * Check if a session is valid (not expired)
 */
export const isSessionValid = (session) => {
  if (!session || !session.expires_at) {
    return false;
  }
  const now = Date.now();
  const expiresAt = session.expires_at;
  const gracePeriod = 5 * 60 * 1000; // 5 minutes grace period
  return now < (expiresAt + gracePeriod);
};

/**
 * Extend session expiration
 */
export const extendSession = (session, days = 7) => {
  if (!session) return null;
  
  const extended = {
    ...session,
    expires_at: Date.now() + (days * 24 * 60 * 60 * 1000),
    expires_in: days * 24 * 60 * 60,
  };
  
  saveToStorage(SESSION_KEYS.AUTH_SESSION, extended);
  return extended;
};

/**
 * Get all stored session keys (for debugging)
 */
export const getAllSessionKeys = () => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('mock_') ||
      key.startsWith('sporadic_') ||
      key.startsWith('user_profile_') ||
      key.startsWith('myeloma_') ||
      key.startsWith('global')
    )) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Clear all session data (logout)
 */
export const clearAllSessions = () => {
  const keys = getAllSessionKeys();
  keys.forEach(key => removeFromStorage(key));
  console.log('🗑️  Cleared all session data');
};

/**
 * Export session keys for use in other modules
 */
export { SESSION_KEYS };
