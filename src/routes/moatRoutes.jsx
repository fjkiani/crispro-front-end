/**
 * MOAT Core Routes - Primary Focus
 * 
 * MOAT (Mechanism-Oriented Analysis & Treatment) orchestration routes
 * These are the core production-ready capabilities of the platform
 */

import React from 'react';
import { Route } from 'react-router-dom';
import PersonaRoute from '../components/auth/PersonaRoute';
import UniversalCompleteCare from '../pages/UniversalCompleteCare';
import UniversalTrialIntelligence from '../pages/UniversalTrialIntelligence';
import UniversalDossierBrowser from '../pages/UniversalDossierBrowser';
import UniversalDossierDetail from '../pages/UniversalDossierDetail';
import { OrchestratorDashboard } from '../pages/OrchestratorDashboard';
import ResearchIntelligence from '../pages/ResearchIntelligence';
import ClinicalGenomicsCommandCenter from '../components/ClinicalGenomicsCommandCenter/ClinicalGenomicsCommandCenter';
import { SyntheticLethalityAnalyzer } from '../components/SyntheticLethality';
import DosingGuidancePage from '../pages/DosingGuidancePage';
import MetastasisDashboard from '../pages/MetastasisDashboard';
import DDRStatusPage from '../pages/DDRStatusPage';

/**
 * MOAT Core Routes - Production Ready
 * 
 * TIER 1: Core MOAT capabilities
 * Personas: Oncologist, Researcher (some Researcher-only)
 */
export const moatRoutes = [
  // Universal Complete Care - Full orchestration
  <Route 
    key="universal-complete-care" 
    path="/universal-complete-care" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <UniversalCompleteCare />
      </PersonaRoute>
    } 
  />,
  <Route 
    key="universal-complete-care-patient" 
    path="/universal-complete-care/:patientId" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <UniversalCompleteCare />
      </PersonaRoute>
    } 
  />,
  
  // Universal Trial Intelligence - Trial matching
  <Route 
    key="universal-trial-intelligence" 
    path="/universal-trial-intelligence" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <UniversalTrialIntelligence />
      </PersonaRoute>
    } 
  />,
  
  // Universal Dossiers - Dossier management
  <Route 
    key="universal-dossiers" 
    path="/universal-dossiers" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <UniversalDossierBrowser />
      </PersonaRoute>
    } 
  />,
  <Route 
    key="universal-dossiers-detail" 
    path="/universal-dossiers/:patientId/:nct_id" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <UniversalDossierDetail />
      </PersonaRoute>
    } 
  />,
  
  // Research Intelligence - Research orchestration
  <Route 
    key="research-intelligence" 
    path="/research-intelligence" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <ResearchIntelligence />
      </PersonaRoute>
    } 
  />,
  
  // Orchestrator Dashboard - Researcher-only
  <Route 
    key="orchestrator" 
    path="/orchestrator" 
    element={
      <PersonaRoute allowedPersonas={['researcher']}>
        <OrchestratorDashboard />
      </PersonaRoute>
    } 
  />,
  
  // Clinical Genomics - VCF/genomic analysis
  <Route 
    key="clinical-genomics" 
    path="/clinical-genomics" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <ClinicalGenomicsCommandCenter />
      </PersonaRoute>
    } 
  />,
  
  // Synthetic Lethality - SL analysis
  <Route 
    key="synthetic-lethality" 
    path="/synthetic-lethality" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <SyntheticLethalityAnalyzer />
      </PersonaRoute>
    } 
  />,
  
  // Dosing Guidance - Drug dosing recommendations
  <Route 
    key="dosing-guidance" 
    path="/dosing-guidance" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <DosingGuidancePage />
      </PersonaRoute>
    } 
  />,
  
  // Metastasis Dashboard - Metastasis analysis
  <Route 
    key="metastasis" 
    path="/metastasis" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <MetastasisDashboard />
      </PersonaRoute>
    } 
  />,
  
  // DDR Status - DDR_bin classification
  <Route 
    key="ddr-status" 
    path="/ddr-status" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher', 'patient']}>
        <DDRStatusPage />
      </PersonaRoute>
    } 
  />,
];
