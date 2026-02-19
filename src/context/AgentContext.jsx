/**
 * AgentContext - Global agent state management
 * 
 * Provides:
 * - Agent list (all user agents)
 * - Agent creation/update/delete
 * - Agent execution (manual triggers)
 * - Agent results and alerts
 * - Real-time status updates
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_ROOT as API_BASE } from '../lib/apiConfig';

const AgentContext = createContext();

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within AgentProvider');
  }
  return context;
};

export const AgentProvider = ({ children }) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [pollingEnabled, setPollingEnabled] = useState(true);


  // Helper to get auth token
  const _getAuthToken = () => {
    try {
      const sessionStr = localStorage.getItem('mock_auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return session.access_token;
      }
    } catch (e) {
      console.warn('Failed to parse auth session', e);
    }
    return localStorage.getItem('supabase_auth_token'); // Fallback
  };

  // Fetch all agents for current user
  const fetchAgents = useCallback(async () => {
    if (!user) {
      setAgents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionStr = localStorage.getItem('mock_auth_session');
      let token = null;
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          token = session.access_token;
        } catch (e) {
          console.warn('Failed to parse auth session', e);
        }
      }

      // Try fallback if mock session token is missing
      if (!token) {
        token = localStorage.getItem('supabase_auth_token');
      }

      if (!token) {
        // Silent return to avoid 401 spam
        setAgents([]);
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE}/api/agents`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('AgentContext: 401 Unauthorized - stopping polling');
          // Start fresh
          setAgents([]);
          setPollingEnabled(false);
          return;
        }
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }

      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, API_BASE]);

  // Fetch alerts for current user
  const fetchAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setUnreadAlertsCount(0);
      return;
    }

    try {
      const token = _getAuthToken();

      if (!token) {
        setAlerts([]);
        setUnreadAlertsCount(0);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE}/api/agents/alerts?unread_only=true&limit=50`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setPollingEnabled(false);
          return;
        }
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
      setUnreadAlertsCount(data.alerts?.filter(a => !a.is_read).length || 0);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, [user, API_BASE]);

  // Create new agent
  const createAgent = async (agentData) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const token = _getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/agents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create agent: ${response.statusText}`);
      }

      const newAgent = await response.json();
      setAgents(prev => [newAgent, ...prev]);
      return newAgent;
    } catch (err) {
      console.error('Error creating agent:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update agent
  const updateAgent = async (agentId, updates) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const token = _getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/agents/${agentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to update agent: ${response.statusText}`);
      }

      const updatedAgent = await response.json();
      setAgents(prev => prev.map(a => a.id === agentId ? updatedAgent : a));
      return updatedAgent;
    } catch (err) {
      console.error('Error updating agent:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete agent
  const deleteAgent = async (agentId) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const token = _getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/agents/${agentId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete agent: ${response.statusText}`);
      }

      setAgents(prev => prev.filter(a => a.id !== agentId));
    } catch (err) {
      console.error('Error deleting agent:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Pause agent
  const pauseAgent = async (agentId) => {
    return updateAgent(agentId, { status: 'paused' });
  };

  // Resume agent
  const resumeAgent = async (agentId) => {
    const sessionStr = localStorage.getItem('mock_auth_session');
    let token = null;
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        token = session.access_token;
      } catch (e) {
        console.warn('Failed to parse auth session', e);
      }
    }

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/agents/${agentId}/resume`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to resume agent: ${response.statusText}`);
    }

    const updatedAgent = await response.json();
    setAgents(prev => prev.map(a => a.id === agentId ? updatedAgent : a));
    return updatedAgent;
  };

  // Trigger manual agent run
  const runAgent = async (agentId) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const token = _getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/agents/${agentId}/run`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to run agent: ${response.statusText}`);
      }

      const result = await response.json();

      // Refresh agents to get updated last_run_at
      await fetchAgents();

      // Refresh alerts (new results may have generated alerts)
      await fetchAlerts();

      return result;
    } catch (err) {
      console.error('Error running agent:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark alert as read
  const markAlertRead = async (alertId) => {
    if (!user) {
      return;
    }

    try {
      const token = _getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/agents/alerts/${alertId}/read`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to mark alert as read: ${response.statusText}`);
      }

      // Update local state
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
      setUnreadAlertsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  // Fetch agent runs
  const fetchAgentRuns = async (agentId, limit = 20) => {
    if (!user) {
      return [];
    }

    try {
      const token = _getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/agents/${agentId}/runs?limit=${limit}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch agent runs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.runs || [];
    } catch (err) {
      console.error('Error fetching agent runs:', err);
      return [];
    }
  };

  // Fetch agent results
  const fetchAgentResults = async (agentId, unreadOnly = false, limit = 50) => {
    if (!user) {
      return [];
    }

    try {
      const token = _getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE}/api/agents/${agentId}/results?unread_only=${unreadOnly}&limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch agent results: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (err) {
      console.error('Error fetching agent results:', err);
      return [];
    }
  };

  // Initial fetch on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchAgents();
      fetchAlerts();
    }
  }, [user, fetchAgents, fetchAlerts]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!user || !pollingEnabled) return;

    const interval = setInterval(() => {
      fetchAgents();
      fetchAlerts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchAgents, fetchAlerts, pollingEnabled]);

  const value = {
    agents,
    alerts,
    unreadAlertsCount,
    loading,
    error,
    fetchAgents,
    fetchAlerts,
    createAgent,
    updateAgent,
    deleteAgent,
    pauseAgent,
    resumeAgent,
    runAgent,
    markAlertRead,
    fetchAgentRuns,
    fetchAgentResults,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};
