/**
 * Patient Persona Routes
 * 
 * Patient-facing routes for personal health data and care plans
 */

import React from 'react';
import { Route } from 'react-router-dom';
import PatientRoute from '../components/auth/PatientRoute';
import PersonaRoute from '../components/auth/PersonaRoute';
import AyeshaCompleteCare from '../pages/AyeshaCompleteCare';
import AyeshaTrialExplorer from '../pages/AyeshaTrialExplorer';
import AyeshaDossierBrowser from '../pages/AyeshaDossierBrowser';
import AyeshaDossierDetail from '../pages/AyeshaDossierDetail';
import PatientDashboard from '../pages/PatientDashboard';
import PatientProfile from '../pages/PatientProfile';
import PatientSettings from '../pages/PatientSettings';
import PatientOnboarding from '../pages/PatientOnboarding';

/**
 * Patient Routes - Patient Persona Access
 * 
 * TIER 2: Patient-facing features
 */
export const patientRoutes = [
  // Patient Dashboard
  <Route 
    key="patient-dashboard" 
    path="/patient/dashboard" 
    element={
      <PatientRoute>
        <PatientDashboard />
      </PatientRoute>
    } 
  />,
  
  // Patient Profile & Settings
  <Route 
    key="patient-profile" 
    path="/patient/profile" 
    element={
      <PersonaRoute allowedPersonas={['patient', 'oncologist']}>
        <PatientProfile />
      </PersonaRoute>
    } 
  />,
  <Route 
    key="patient-onboarding" 
    path="/patient/onboarding" 
    element={
      <PersonaRoute allowedPersonas={['patient', 'oncologist']}>
        <PatientOnboarding />
      </PersonaRoute>
    } 
  />,
  <Route 
    key="patient-settings" 
    path="/patient/settings" 
    element={
      <PatientRoute>
        <PatientSettings />
      </PatientRoute>
    } 
  />,
  
  // Ayesha Complete Care - Patient view
  <Route 
    key="ayesha-complete-care" 
    path="/ayesha-complete-care" 
    element={
      <PatientRoute>
        <AyeshaCompleteCare />
      </PatientRoute>
    } 
  />,
  
  // Ayesha Trial Explorer - Patient trial matching
  <Route 
    key="ayesha-trials" 
    path="/ayesha-trials" 
    element={
      <PatientRoute>
        <AyeshaTrialExplorer />
      </PatientRoute>
    } 
  />,
  
  // Ayesha Dossiers - Patient dossier view
  <Route 
    key="ayesha-dossiers" 
    path="/ayesha-dossiers" 
    element={<AyeshaDossierBrowser />} 
  />,
  <Route 
    key="ayesha-dossiers-detail" 
    path="/ayesha-dossiers/:nct_id" 
    element={<AyeshaDossierDetail />} 
  />,
];
