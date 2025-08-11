import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for agent context
const initialState = {
  agents: [],
  isLoading: false,
  error: null
};

// Actions
const ACTIONS = {
  SET_AGENTS: 'SET_AGENTS',
  ADD_AGENT: 'ADD_AGENT',
  UPDATE_AGENT: 'UPDATE_AGENT',
  DELETE_AGENT: 'DELETE_AGENT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Reducer function
const agentReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_AGENTS:
      return { ...state, agents: action.payload };
    case ACTIONS.ADD_AGENT:
      return { ...state, agents: [...state.agents, action.payload] };
    case ACTIONS.UPDATE_AGENT:
      return {
        ...state,
        agents: state.agents.map(agent => 
          agent.id === action.payload.id ? action.payload : agent
        )
      };
    case ACTIONS.DELETE_AGENT:
      return {
        ...state,
        agents: state.agents.filter(agent => agent.id !== action.payload)
      };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Create context
const AgentContext = createContext();

// Provider component
export const AgentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  // Load agents from localStorage on initial render
  useEffect(() => {
    const loadAgents = () => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        const storedAgents = localStorage.getItem('agentDefinitions');
        
        if (storedAgents) {
          dispatch({ 
            type: ACTIONS.SET_AGENTS, 
            payload: JSON.parse(storedAgents) 
          });
        }
      } catch (error) {
        dispatch({ 
          type: ACTIONS.SET_ERROR, 
          payload: 'Failed to load saved agents' 
        });
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadAgents();
  }, []);

  // Save agents to localStorage whenever they change
  useEffect(() => {
    if (state.agents.length > 0) {
      localStorage.setItem('agentDefinitions', JSON.stringify(state.agents));
    }
  }, [state.agents]);

  // Actions
  const addAgent = (agent) => {
    const newAgent = {
      ...agent,
      id: `agent-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    
    dispatch({ type: ACTIONS.ADD_AGENT, payload: newAgent });
    return newAgent;
  };

  const updateAgent = (agent) => {
    const updatedAgent = {
      ...agent,
      updatedAt: new Date().toISOString()
    };
    
    dispatch({ type: ACTIONS.UPDATE_AGENT, payload: updatedAgent });
    return updatedAgent;
  };

  const deleteAgent = (agentId) => {
    dispatch({ type: ACTIONS.DELETE_AGENT, payload: agentId });
  };

  const value = {
    agents: state.agents,
    isLoading: state.isLoading,
    error: state.error,
    addAgent,
    updateAgent,
    deleteAgent
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

// Custom hook for using the context
export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
}; 