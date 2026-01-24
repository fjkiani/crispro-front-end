// Supabase client with delayed initialization to prevent response.headers errors
// Try to initialize immediately, but retry after delay if it fails

// Get environment variables - ensure they are strings before calling trim()
const supabaseUrl = (typeof import.meta.env.VITE_SUPABASE_URL === 'string' 
  ? import.meta.env.VITE_SUPABASE_URL.trim() 
  : null) || null;
const supabaseAnonKey = (typeof import.meta.env.VITE_SUPABASE_ANON_KEY === 'string' 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim() 
  : null) || null;

// Debug logging (works in both dev and production)
console.log('🔍 Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0,
  urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
  urlValue: supabaseUrl || 'MISSING',
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
  rawUrl: import.meta.env.VITE_SUPABASE_URL,
  rawKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
  isEnabled: !!(supabaseUrl && supabaseAnonKey),
});

// DISABLE SUPABASE FOR NOW - Use mock authentication instead
// Check if environment variables are present
export const isSupabaseEnabled = false; // Temporarily disabled to bypass Supabase initialization errors

// Initialize Supabase client with retry logic
let supabaseClient = null;

// Custom fetch that ensures response.headers is always defined
function createSafeFetch() {
  const originalFetch = window.fetch.bind(window);
  
  return async function safeFetch(...args) {
    try {
      const response = await originalFetch(...args);
      
      // Ensure headers is accessible
      if (response && !response.headers) {
        Object.defineProperty(response, 'headers', {
          value: new Headers(),
          writable: false,
          configurable: true
        });
      }
      
      return response;
    } catch (error) {
      console.error('[SafeFetch] Error:', error);
      throw error;
    }
  };
}

async function tryInitializeSupabase() {
  if (!isSupabaseEnabled) {
    console.warn('⚠️ Supabase initialization skipped - not enabled. Check:', {
      supabaseUrl: supabaseUrl || 'MISSING',
      supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING',
    });
    return null;
  }

  // CRITICAL: Polyfill Response.headers BEFORE importing Supabase
  // This must happen before any Supabase code runs
  if (typeof Response !== 'undefined' && Response.prototype) {
    try {
      const originalDescriptor = Object.getOwnPropertyDescriptor(Response.prototype, 'headers');
      
      // Only override if it doesn't exist or is broken
      if (!originalDescriptor || !originalDescriptor.get) {
        Object.defineProperty(Response.prototype, 'headers', {
          get: function() {
            if (!this || typeof this !== 'object') {
              return new Headers();
            }
            try {
              // Try to get original headers if available
              if (originalDescriptor && originalDescriptor.get) {
                const headers = originalDescriptor.get.call(this);
                if (headers) return headers;
              }
              // Check for internal headers property
              if (this._headers) {
                return this._headers;
              }
            } catch (e) {
              // Silently handle errors
            }
            // Always return a valid Headers object
            return new Headers();
          },
          configurable: true,
          enumerable: true
        });
        console.log('✅ Response.headers polyfill installed');
      }
    } catch (e) {
      console.warn('⚠️ Could not install Response.headers polyfill:', e);
    }
  }

  try {
    console.log('🔄 Attempting to initialize Supabase client...');
    
    // Use dynamic import with error handling
    let createClient;
    try {
      const supabaseModule = await import('@supabase/supabase-js');
      createClient = supabaseModule.createClient;
    } catch (importError) {
      console.error('❌ Failed to import Supabase module:', importError);
      throw importError;
    }
    
    // Create client with minimal config first
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          fetch: createSafeFetch(),
        },
      });
      
      // Test the client by getting session (this will trigger any initialization issues)
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError && sessionError.message?.includes('headers')) {
        throw new Error('Headers error detected in getSession');
      }
      
      console.log('✅ Supabase client initialized successfully');
      return supabaseClient;
    } catch (createError) {
      console.error('❌ Error creating Supabase client:', createError);
      throw createError;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack?.substring(0, 500), // Limit stack trace
      url: supabaseUrl,
      keyLength: supabaseAnonKey?.length,
      errorName: error.name,
    });
    
    return null;
  }
}

// Try to initialize immediately (will fail if Response.headers protection not ready)
if (isSupabaseEnabled && typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'complete') {
    // DOM already ready, try initializing after a small delay
    setTimeout(() => {
      tryInitializeSupabase();
    }, 200);
  } else {
    // Wait for DOM to be ready
    window.addEventListener('load', () => {
      setTimeout(() => {
        tryInitializeSupabase();
      }, 200);
    }, { once: true });
  }
}

// Create a chainable mock query builder that supports all methods
function createMockQueryBuilder() {
  const mockResult = { data: [], error: null };
  const mockSingleResult = { data: null, error: null };
  
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    is: () => builder,
    in: () => builder,
    lt: () => builder,
    lte: () => builder,
    gt: () => builder,
    gte: () => builder,
    like: () => builder,
    ilike: () => builder,
    match: () => builder,
    not: () => builder,
    or: () => builder,
    filter: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => Promise.resolve(mockSingleResult),
    maybeSingle: () => Promise.resolve(mockSingleResult),
    then: (callback) => Promise.resolve(mockResult).then(callback),
    catch: (callback) => Promise.resolve(mockResult).catch(callback),
  };
  
  return builder;
}

// Mock client for when Supabase is not available
const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    refreshSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
  from: () => createMockQueryBuilder(),
  rpc: () => Promise.resolve({ data: null, error: null }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      download: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      list: () => Promise.resolve({ data: [], error: null }),
      remove: () => Promise.resolve({ data: null, error: null }),
    }),
  },
  channel: () => ({
    on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    subscribe: () => ({ unsubscribe: () => {} }),
  }),
};

// Export client - use real client if available, mock otherwise
// The client will be initialized asynchronously after DOM is ready
export const supabase = new Proxy({}, {
  get(target, prop) {
    // Always check if client is initialized (it may have been initialized since last access)
    if (supabaseClient) {
      return supabaseClient[prop];
    }

    // If Supabase is enabled but not yet initialized, try to initialize now
    if (isSupabaseEnabled && !supabaseClient) {
      // Try to initialize (non-blocking)
      tryInitializeSupabase().then(() => {
        // Client will be available on next access
      });
    }

    // Return mock client property for now
    // Once supabaseClient is initialized, this proxy will return the real client
    const mockProp = mockSupabaseClient[prop];
    
    // If it's a function, wrap it to check for real client first
    if (typeof mockProp === 'function') {
      return function(...args) {
        // Check again if client is now available
        if (supabaseClient) {
          const realMethod = supabaseClient[prop];
          if (typeof realMethod === 'function') {
            return realMethod.apply(supabaseClient, args);
          }
          return supabaseClient[prop];
        }
        // Use mock
        return mockProp.apply(mockSupabaseClient, args);
      };
    }
    
    // Return mock property
    return mockProp;
  }
});

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
        if (error.code === 'PGRST202' || error.code === '42P01' || error.message?.includes('does not exist')) {
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
