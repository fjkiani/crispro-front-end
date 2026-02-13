/**
 * Development-Only Routes
 * 
 * Routes that are ONLY available in development mode
 * These are automatically wrapped in import.meta.env.DEV check
 */

import React from 'react';
import { Route } from 'react-router-dom';
import AgentDemo from '../pages/AgentDemo';
import AgentStudio from '../pages/AgentStudio';
// import AyeshaTwinDemo from '../pages/AyeshaTwinDemo';
import ClinicalDossierTest from '../pages/ClinicalDossierTest';
import { Q2CRouterTest } from '../components/CoPilot/Q2CRouter/Q2CRouterTest';
import Phase3ActionDemo from '../components/Phase3ActionDemo';
import CoPilotSmokeTest from '../components/CoPilotSmokeTest';
import CoPilotDoctrineGapAnalysis from '../components/CoPilotDoctrineGapAnalysis';

/**
 * DEV-Only Routes
 * 
 * These routes are only rendered when import.meta.env.DEV === true
 * Used for development, testing, and debugging
 */
export const devRoutes = [
  <Route key="agent-demo" path="/agent-demo/:agentId" element={<AgentDemo />} />,
  <Route key="agent-studio" path="/agent-studio" element={<AgentStudio />} />,
  <Route key="ayesha-twin-demo" path="/ayesha-twin-demo" element={<AyeshaTwinDemo />} />,
  <Route key="clinical-dossier-test" path="/clinical-dossier-test" element={<ClinicalDossierTest />} />,
  <Route key="q2c-test" path="/q2c-test" element={<Q2CRouterTest />} />,
  <Route key="phase3-demo" path="/phase3-demo" element={<Phase3ActionDemo />} />,
  <Route key="copilot-smoke-test" path="/copilot-smoke-test" element={<CoPilotSmokeTest />} />,
  <Route key="copilot-gap-analysis" path="/copilot-gap-analysis" element={<CoPilotDoctrineGapAnalysis />} />,
];
