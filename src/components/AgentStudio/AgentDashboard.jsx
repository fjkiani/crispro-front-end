import React from 'react';
import { useAgents } from '../../context/AgentContext';
import AgentCard from './AgentCard';

const AgentDashboard = ({ onCreateNew }) => {
  const { agents, isLoading, error } = useAgents();

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-600">Loading your agents...</p>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  // If no agents, show empty state
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No agents created yet</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Create your first custom agent to automate monitoring, research, and analysis tasks tailored to your workflow.
        </p>
        <button
          onClick={onCreateNew}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Create Your First Agent
        </button>
      </div>
    );
  }

  // Group agents by status for organization
  const activeAgents = agents.filter(agent => agent.status === 'active');
  const inactiveAgents = agents.filter(agent => agent.status === 'inactive');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Your Custom Agents</h2>
        <button
          onClick={onCreateNew}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition text-sm"
        >
          Create New Agent
        </button>
      </div>

      {/* Display active agents */}
      {activeAgents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Active Agents</h3>
          <div className="space-y-4">
            {activeAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {/* Display inactive agents */}
      {inactiveAgents.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-3">Inactive Agents</h3>
          <div className="space-y-4">
            {inactiveAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard; 