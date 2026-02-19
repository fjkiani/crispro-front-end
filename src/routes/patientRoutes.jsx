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
import AyeshaTrialsOnly from '../pages/ayesha/AyeshaTrialsOnly';
import AyeshaTrialExplorer from '../pages/ayesha/AyeshaTrialExplorer';
import AyeshaDossierBrowser from '../pages/AyeshaDossierBrowser';
import AyeshaDossierDetail from '../pages/AyeshaDossierDetail';
import AyeshaPatientDashboard from '../pages/ayesha/AyeshaPatientDashboard';
import AyeshaTwinDemo from '../pages/ayesha/AyeshaTwinDemo';
import ResistanceLab from '../pages/ayesha/ResistanceLab';
import AyeshaWeaponCompatibility from '../pages/ayesha/AyeshaWeaponCompatibility';
import AyeshaTestsUnlocks from '../pages/ayesha/AyeshaTestsUnlocks';
import AyeshaHolisticScoring from '../pages/ayesha/AyeshaHolisticScoring';
import PatientStrategyBoard from '../pages/ayesha/PatientStrategyBoard';
import TestsPage from '../pages/ayesha/TestsPage';
import PatientDashboard from '../pages/PatientDashboard';
import PatientProfile from '../pages/PatientProfile';
import PatientSettings from '../pages/PatientSettings';
import PatientOnboarding from '../pages/PatientOnboarding';
import PatientKnowledgeBase from '../pages/PatientKnowledgeBase';

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
  // Patient Knowledge Base
  <Route
    key="patient-knowledge-base"
    path="/patient/knowledge-base"
    element={
      <PatientRoute>
        <PatientKnowledgeBase />
      </PatientRoute>
    }
  />,
  <Route
    key="patient-knowledge-base-id"
    path="/patient/knowledge-base/:patientId"
    element={
      <PatientRoute>
        <PatientKnowledgeBase />
      </PatientRoute>
    }
  />,
  // Ayesha Patient Dashboard - Main landing page
  <Route
    key="ayesha-dashboard"
    path="/ayesha"
    element={
      <PatientRoute>
        <AyeshaPatientDashboard />
      </PatientRoute>
    }
  />,
  <Route
    key="ayesha-dashboard-alt"
    path="/ayesha/dashboard"
    element={
      <PatientRoute>
        <AyeshaPatientDashboard />
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

  // Ayesha 360° Dashboard
  <Route
    key="ayesha-trials"
    path="/ayesha-trials"
    element={
      <PatientRoute>
        <AyeshaTrialExplorer />
      </PatientRoute>
    }
  />,

  // Ayesha Full Trials List
  <Route
    key="ayesha-trials-full"
    path="/ayesha/trials-full"
    element={
      <PatientRoute>
        <AyeshaTrialsOnly />
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

  // Ayesha Digital Twin - Mechanistic biology analysis
  <Route
    key="ayesha-digital-twin"
    path="/ayesha-digital-twin"
    element={
      <PatientRoute>
        <AyeshaTwinDemo />
      </PatientRoute>
    }
  />,
  // Also support the demo route for backward compatibility
  <Route
    key="ayesha-twin-demo"
    path="/ayesha-twin-demo"
    element={
      <PatientRoute>
        <AyeshaTwinDemo />
      </PatientRoute>
    }
  />,
  // Ayesha Resistance Lab - "Glass Box" Simulator
  <Route
    key="ayesha-resistance-lab"
    path="/resistance-lab"
    element={
      <PatientRoute>
        <ResistanceLab />
      </PatientRoute>
    }
  />,
  <Route
    key="ayesha-therapy-fit"
    path="/ayesha/therapy-fit"
    element={
      <PatientRoute>
        <AyeshaWeaponCompatibility />
      </PatientRoute>
    }
  />
  ,
  <Route
    key="ayesha-tumor-board"
    path="/ayesha/tumor-board"
    element={
      <PatientRoute>
        <PatientStrategyBoard />
      </PatientRoute>
    }
  />
  ,
  <Route
    key="ayesha-holistic-scoring"
    path="/ayesha/holistic-scoring"
    element={
      <PatientRoute>
        <AyeshaHolisticScoring />
      </PatientRoute>
    }
  />,
  <Route
    key="ayesha-tests-unlocks"
    path="/ayesha/tests"
    element={
      <PatientRoute>
        <TestsPage />
      </PatientRoute>
    }
  />
  ,
  <Route
    key="ayesha-tests-unlocks-legacy"
    path="/ayesha/tests-unlocks"
    element={
      <PatientRoute>
        <AyeshaTestsUnlocks />
      </PatientRoute>
    }
  />
];
