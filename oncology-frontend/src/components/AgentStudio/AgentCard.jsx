import React, { useState } from 'react';
import { useAgents } from '../../context/AgentContext';
import { executeAgent } from '../../utils/mockExecution';
import { EXECUTION_STATUS } from '../../utils/mockExecution';
import MockResultView from './MockResultView';

const AgentCard = ({ agent }) => {
  const { updateAgent, deleteAgent } = useAgents();
  const [isExpanded, setIsExpanded] = useState(false);
  const [executionStatus, setExecutionStatus] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Format dates in a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to toggle agent active status
  const toggleStatus = () => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    updateAgent({ ...agent, status: newStatus });
  };

  // Function to handle mock execution
  const handleRunNow = () => {
    setExecutionStatus(EXECUTION_STATUS.RUNNING);
    setExecutionResult(null);
    
    executeAgent(agent)
      .then(result => {
        setExecutionResult(result);
        setExecutionStatus(EXECUTION_STATUS.COMPLETED);
      })
      .catch(error => {
        console.error('Error executing agent:', error);
        setExecutionStatus(EXECUTION_STATUS.FAILED);
      });
  };

  // Function to confirm agent deletion
  const handleDelete = () => {
    if (isConfirmingDelete) {
      deleteAgent(agent.id);
    } else {
      setIsConfirmingDelete(true);
      // Auto-reset confirmation state after 5 seconds
      setTimeout(() => setIsConfirmingDelete(false), 5000);
    }
  };

  // Render different action buttons based on execution status
  const renderActionButtons = () => {
    if (executionStatus === EXECUTION_STATUS.RUNNING) {
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500 mr-2"></div>
          <span className="text-sm">Running...</span>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        <button
          onClick={handleRunNow}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
          disabled={agent.status !== 'active'}
        >
          Run Now (Mock)
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
        <button
          onClick={handleDelete}
          className={`px-3 py-1 rounded text-sm ${
            isConfirmingDelete 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          {isConfirmingDelete ? 'Confirm Delete' : 'Delete'}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Agent Card Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{agent.name}</h3>
            <p className="text-sm text-gray-600">Created: {formatDate(agent.createdAt)}</p>
          </div>
          <div className="flex items-center">
            <div className="mr-4">
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id={`toggle-${agent.id}`}
                  checked={agent.status === 'active'}
                  onChange={toggleStatus}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor={`toggle-${agent.id}`}
                  className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                    agent.status === 'active' ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
              <span className="text-xs text-gray-700">
                {agent.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            {renderActionButtons()}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Goal:</h4>
            <p className="text-sm text-gray-600">{agent.goal}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Data Sources:</h4>
              <div className="flex flex-wrap gap-1">
                {agent.dataSources.map(source => (
                  <span 
                    key={source} 
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Tools:</h4>
              <div className="flex flex-wrap gap-1">
                {agent.tools.map(tool => (
                  <span 
                    key={tool.id} 
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                  >
                    {tool.id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Trigger:</h4>
              <div className="text-xs text-gray-600">
                {agent.trigger.type === 'manual' ? (
                  <span>Manual Execution Only</span>
                ) : agent.trigger.type === 'scheduled' ? (
                  <span>
                    Scheduled: {agent.trigger.config.frequency} 
                    {agent.trigger.config.frequency === 'weekly' && ` on ${agent.trigger.config.day}`}
                    {agent.trigger.config.frequency === 'monthly' && ` on day ${agent.trigger.config.day}`}
                    {' at '}
                    {agent.trigger.config.time}
                  </span>
                ) : (
                  <span>Event-Triggered (Mock)</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Actions:</h4>
              <div className="flex flex-wrap gap-1">
                {agent.actions.map((action, index) => (
                  <span 
                    key={index} 
                    className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                  >
                    {action.type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Execution Result */}
          {executionResult && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <MockResultView result={executionResult} />
            </div>
          )}
        </div>
      )}

      {/* Add custom style for toggle switch */}
      <style jsx="true">{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #8B5CF6;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #8B5CF6;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 10;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
};

export default AgentCard; 