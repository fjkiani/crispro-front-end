import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentProvider } from '../context/AgentContext';
import AgentDashboard from '../components/AgentStudio/AgentDashboard';
import AgentCreationForm from '../components/AgentStudio/AgentCreationForm';

const AgentStudio = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a loading state for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AgentProvider>
      <div className="container mx-auto p-6 min-h-screen">
        <div className="flex justify-between mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded"
          >
            &larr; Back
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Agent Studio <span className="text-xs text-gray-500">(Concept)</span></h1>
        <p className="text-center text-gray-600 mb-6">Create and manage custom AI agents tailored to your clinical workflow</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-300 mb-6">
              <button
                className={`py-2 px-4 mr-2 ${
                  activeTab === 'dashboard' 
                    ? 'border-b-2 border-purple-500 text-purple-700 font-medium' 
                    : 'text-gray-600 hover:text-purple-500'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                My Agents
              </button>
              <button
                className={`py-2 px-4 mr-2 ${
                  activeTab === 'create' 
                    ? 'border-b-2 border-purple-500 text-purple-700 font-medium' 
                    : 'text-gray-600 hover:text-purple-500'
                }`}
                onClick={() => setActiveTab('create')}
              >
                Create New Agent
              </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {activeTab === 'dashboard' ? (
                <AgentDashboard onCreateNew={() => setActiveTab('create')} />
              ) : (
                <AgentCreationForm onCancel={() => setActiveTab('dashboard')} />
              )}
            </div>

            {/* Disclaimer Note */}
            <div className="mt-8 p-4 bg-gray-100 rounded-md text-sm text-gray-600">
              <p className="font-bold mb-1">Note: This is a conceptual demonstration</p>
              <p>
                The Agent Studio showcases how users could create custom AI agents to automate tasks
                and workflows. Actual agent execution is simulated in this demo. In a production environment,
                these agents would connect to backend systems and perform real actions.
              </p>
            </div>
          </>
        )}
      </div>
    </AgentProvider>
  );
};

export default AgentStudio; 