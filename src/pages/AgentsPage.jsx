/**
 * Agents Page - Main page for agent management
 */

import React from 'react';
import { AgentDashboard } from '../components/agents/AgentDashboard';
import { AgentProvider } from '../context/AgentContext';

export const AgentsPage = () => {
  return (
    <AgentProvider>
      <AgentDashboard />
    </AgentProvider>
  );
};


