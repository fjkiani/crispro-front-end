// Supabase client with safe initialization
// The Response.headers protection in index.html should prevent initialization errors

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log('🔍 Supabase Config Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
  });
}

// Check if environment variables are present
export const isSupabaseEnabled = false; // FORCE DISABLED due to connection errors (Mars Rules: Minimal Viable Proof)

// Initialize Supabase client with error handling
let supabaseClient = null;

if (isSupabaseEnabled) {
  try {
    // Create client - Response.headers protection in index.html should prevent errors
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    supabaseClient = null;
  }
}

// Mock client for when Supabase is not available
const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        then: (callback) => Promise.resolve({ data: [], error: null }).then(callback),
      }),
      is: () => ({
        then: (callback) => Promise.resolve({ data: [], error: null }).then(callback),
      }),
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
      then: (callback) => Promise.resolve({ data: [], error: null }).then(callback),
    }),
    insert: () => ({
      select: () => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null }),
      neq: () => Promise.resolve({ error: null }),
    }),
  }),
};

// Export client - use real client if available, mock otherwise
export const supabase = supabaseClient || mockSupabaseClient;

// Analysis history table
const ANALYSIS_HISTORY_TABLE = 'analysis_history';

export class AnalysisHistoryService {
  constructor() {
    // Check if table exists before enabling
    this.enabled = isSupabaseEnabled;
    this._tableChecked = false; // Track if we've checked table existence
  }

  async saveAnalysis(analysisData) {
    if (!this.enabled) {
      console.warn('Supabase not configured, analysis not saved');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from(ANALYSIS_HISTORY_TABLE)
        .insert([{
          key: analysisData.key,
          name: analysisData.name,
          model_id: analysisData.modelId,
          mutations: JSON.stringify(analysisData.mutations),
          options: JSON.stringify(analysisData.options),
          results: JSON.stringify(analysisData.results),
          timestamp: analysisData.timestamp,
          metadata: JSON.stringify(analysisData.metadata),
          user_id: userId, // Use authenticated user ID
        }])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Failed to save analysis:', error);
      return null;
    }
  }

  async loadAnalysis(key) {
    if (!this.enabled) {
      console.warn('Supabase not configured, cannot load analysis');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from(ANALYSIS_HISTORY_TABLE)
        .select('*')
        .eq('key', key)
        .single();

      if (error) throw error;

      if (data) {
        return {
          key: data.key,
          name: data.name,
          modelId: data.model_id,
          mutations: JSON.parse(data.mutations),
          options: JSON.parse(data.options),
          results: JSON.parse(data.results),
          timestamp: data.timestamp,
          metadata: JSON.parse(data.metadata || '{}'),
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to load analysis:', error);
      return null;
    }
  }

  async loadAllAnalyses(limit = 20, userId = null) {
    if (!this.enabled) {
      console.warn('Supabase not configured, cannot load analyses');
      return [];
    }

    try {
      let query = supabase
        .from(ANALYSIS_HISTORY_TABLE)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      // Filter by user_id if authenticated
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // Anonymous users only see their own (null user_id)
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      // Handle 404/table not found gracefully (PGRST202 = relation not found)
      if (error) {
        if (error.code === 'PGRST202' || error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('⚠️ analysis_history table does not exist yet - using localStorage fallback');
          this.enabled = false; // Disable service to avoid repeated 404s
          return [];
        }
        throw error;
      }

      return (data || []).map(item => ({
        key: item.key,
        name: item.name,
        modelId: item.model_id,
        mutations: JSON.parse(item.mutations),
        options: JSON.parse(item.options),
        results: JSON.parse(item.results),
        timestamp: item.timestamp,
        metadata: JSON.parse(item.metadata || '{}'),
      }));
    } catch (error) {
      // Silently fail - table doesn't exist yet
      if (error.code === 'PGRST202' || error.code === '42P01') {
        this.enabled = false; // Disable to prevent repeated 404s
        return [];
      }
      console.error('Failed to load analyses:', error);
      return [];
    }
  }

  async deleteAnalysis(key) {
    if (!this.enabled) {
      console.warn('Supabase not configured, cannot delete analysis');
      return false;
    }

    try {
      const { error } = await supabase
        .from(ANALYSIS_HISTORY_TABLE)
        .delete()
        .eq('key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete analysis:', error);
      return false;
    }
  }

  async clearAllAnalyses() {
    if (!this.enabled) {
      console.warn('Supabase not configured, cannot clear analyses');
      return false;
    }

    try {
      const { error } = await supabase
        .from(ANALYSIS_HISTORY_TABLE)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to clear analyses:', error);
      return false;
    }
  }

  async hasAnalysis(key) {
    if (!this.enabled) return false;

    try {
      const { data, error } = await supabase
        .from(ANALYSIS_HISTORY_TABLE)
        .select('key')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return !!data;
    } catch (error) {
      console.error('Failed to check analysis:', error);
      return false;
    }
  }
}

export const analysisHistoryService = new AnalysisHistoryService();
