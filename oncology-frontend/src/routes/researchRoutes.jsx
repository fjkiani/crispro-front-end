/**
 * Research Tools Routes
 * 
 * Research-focused routes for advanced analysis tools
 * Most are Researcher-only, some available to Oncologists
 */

import React from 'react';
import { Route } from 'react-router-dom';
import PersonaRoute from '../components/auth/PersonaRoute';
import Armory from '../pages/Armory';
import CrisprDesigner from '../pages/CrisprDesigner';
import ProteinSynthesis from '../pages/ProteinSynthesis';
import StructurePredictor from '../pages/StructurePredictor';
import MyelomaDigitalTwin from '../pages/MyelomaDigitalTwin';
import RadOncCoPilot from '../pages/RadOncCoPilot';
import SporadicCancerPage from '../pages/SporadicCancerPage';
import ThreatAssessor from '../pages/ThreatAssessor';

/**
 * Research Routes - Advanced Tools
 * 
 * TIER 5: Research tools with persona protection
 */
export const researchRoutes = [
  // Armory - Research tools hub (Researcher-only)
  <Route 
    key="tools" 
    path="/tools" 
    element={
      <PersonaRoute allowedPersonas={['researcher']}>
        <Armory />
      </PersonaRoute>
    } 
  />,
  
  // CRISPR Designer - CRISPR design tool (Researcher-only)
  <Route 
    key="crispr-designer" 
    path="/crispr-designer" 
    element={
      <PersonaRoute allowedPersonas={['researcher']}>
        <CrisprDesigner />
      </PersonaRoute>
    } 
  />,
  
  // Protein Synthesis - Protein analysis (Researcher-only)
  <Route 
    key="protein-synthesis" 
    path="/protein-synthesis" 
    element={
      <PersonaRoute allowedPersonas={['researcher']}>
        <ProteinSynthesis />
      </PersonaRoute>
    } 
  />,
  
  // Structure Predictor - Structure prediction (Researcher-only)
  <Route 
    key="structure-predictor" 
    path="/structure-predictor" 
    element={
      <PersonaRoute allowedPersonas={['researcher']}>
        <StructurePredictor />
      </PersonaRoute>
    } 
  />,
  
  // Specialty Tools - Available to Oncologists and Researchers
  <Route 
    key="myeloma-digital-twin" 
    path="/myeloma-digital-twin" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <MyelomaDigitalTwin />
      </PersonaRoute>
    } 
  />,
  
  <Route 
    key="radonc-co-pilot" 
    path="/radonc-co-pilot" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <RadOncCoPilot />
      </PersonaRoute>
    } 
  />,
  
  <Route 
    key="sporadic-cancer" 
    path="/sporadic-cancer" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <SporadicCancerPage />
      </PersonaRoute>
    } 
  />,
  
  <Route 
    key="threat-assessor" 
    path="/threat-assessor" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <ThreatAssessor />
      </PersonaRoute>
    } 
  />,
];
