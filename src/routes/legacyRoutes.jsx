/**
 * Legacy/Unclear Routes
 * 
 * Routes that may be duplicates or have unclear status
 * Kept for backward compatibility but marked for evaluation
 * 
 * TODO: Evaluate these routes and consolidate or remove:
 * - /agent-dashboard vs /orchestrator (legacy duplicate?)
 * - /agents vs /orchestrator (what's the difference?)
 * - /research vs /research-intelligence (same purpose?)
 */

import React from 'react';
import { Route } from 'react-router-dom';
import Research from '../pages/Research';
import MutationExplorer from '../pages/MutationExplorer';
import AgentDashboard from '../pages/AgentDashboard';
import { AgentsPage } from '../pages/AgentsPage';
import GenomicAnalysis from '../pages/GenomicAnalysis.tsx';
import HypothesisValidator from '../pages/HypothesisValidator';

/**
 * Legacy Routes - Backward Compatibility
 * 
 * TIER 6: Routes to evaluate for consolidation or removal
 */
export const legacyRoutes = [
  // Research - Legacy route (consider consolidating with /research-intelligence)
  <Route key="research" path="/research" element={<Research />} />,
  <Route key="research-patient" path="/research/:patientId" element={<Research />} />,
  
  // Mutation Explorer - Legacy genomic analysis tool
  <Route key="mutation-explorer" path="/mutation-explorer" element={<MutationExplorer />} />,
  <Route 
    key="mutation-explorer-patient" 
    path="/mutation-explorer/:patientId" 
    element={<MutationExplorer />} 
  />,
  
  // Agent Dashboard - Legacy (may duplicate /orchestrator)
  <Route key="agent-dashboard" path="/agent-dashboard" element={<AgentDashboard />} />,
  <Route 
    key="agent-dashboard-patient" 
    path="/agent-dashboard/:patientId" 
    element={<AgentDashboard />} 
  />,
  
  // Agents Page - Legacy (unclear vs /orchestrator)
  <Route key="agents" path="/agents" element={<AgentsPage />} />,
  
  // Genomic Analysis - Legacy (consider consolidating with /clinical-genomics)
  <Route 
    key="genomic-analysis" 
    path="/genomic-analysis/:patientId" 
    element={<GenomicAnalysis />} 
  />,
  
  // Hypothesis Validator - Legacy validation tool
  <Route key="validate" path="/validate" element={<HypothesisValidator />} />,
];
