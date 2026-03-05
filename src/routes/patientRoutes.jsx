/**
 * Patient Persona Routes
 * 
 * Patient-facing routes for personal health data and care plans
 */

import React from 'react';
import { Route, Navigate } from 'react-router-dom';
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
import BiomarkerIntelligencePage from '../pages/ayesha/BiomarkerIntelligencePage';
import PrognosisSentinel from '../pages/ayesha/PrognosisSentinel';
import AyeshaWeaponCompatibility from '../pages/ayesha/AyeshaWeaponCompatibility';
import AyeshaTestsUnlocks from '../pages/ayesha/AyeshaTestsUnlocks';
import AyeshaHolisticScoring from '../pages/ayesha/AyeshaHolisticScoring';
import PatientStrategyBoard from '../pages/ayesha/PatientStrategyBoard';
import TestsPage from '../pages/ayesha/TestsPage';
import PostDebulkingMRD from '../pages/ayesha/PostDebulkingMRD';
import TrialReplaySandbox from '../components/ayesha/simulator/TrialReplaySandbox';
import PatientDashboard from '../pages/PatientDashboard';
import PatientProfile from '../pages/PatientProfile';
import PatientSettings from '../pages/PatientSettings';
import PatientOnboarding from '../pages/PatientOnboarding';
import Phase1Profile from '../pages/ayesha/phases/Phase1Profile';
import Phase2Tests from '../pages/ayesha/phases/Phase2Tests';
import Phase3Treatment from '../pages/ayesha/phases/Phase3Treatment';
import Phase4Monitoring from '../pages/ayesha/phases/Phase4Monitoring';
import Phase5Resistance from '../pages/ayesha/phases/Phase5Resistance';
import Phase6Board from '../pages/ayesha/phases/Phase6Board';
import DrugDetailPage from '../pages/ayesha/phases/DrugDetailPage';
import TestDetailPage from '../pages/ayesha/phases/TestDetailPage';
import RepurposingArsenalPage from '../pages/ayesha/phases/RepurposingArsenalPage';
import ArsenalDrugDetailPage from '../pages/ayesha/phases/ArsenalDrugDetailPage';
import IOHarmPreventionDemo from '../pages/ayesha/IOHarmPreventionDemo';
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
  />,
  <Route
    key="ayesha-sandbox"
    path="/ayesha/sandbox"
    element={
      <PatientRoute>
        <TrialReplaySandbox />
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
  />,
  <Route
    key="ayesha-biomarker-intelligence"
    path="/ayesha/biomarker-intelligence"
    element={
      <PatientRoute>
        <BiomarkerIntelligencePage />
      </PatientRoute>
    }
  />,
  <Route
    key="ayesha-prognosis-sentinel"
    path="/ayesha/prognosis-sentinel"
    element={
      <PatientRoute>
        <PrognosisSentinel />
      </PatientRoute>
    }
  />,

  // IO Harm Prevention Demo
  <Route
    key="ayesha-io-harm-demo"
    path="/ayesha/io-harm-demo"
    element={
      <PatientRoute>
        <IOHarmPreventionDemo />
      </PatientRoute>
    }
  />,

  // ══════════════════════════════════════════════════════════════════════
  // 6-Phase Patient Journey Routes
  // ══════════════════════════════════════════════════════════════════════
  <Route key="journey-profile" path="/ayesha/journey/profile" element={<PatientRoute><Phase1Profile /></PatientRoute>} />,
  <Route key="journey-tests" path="/ayesha/journey/tests" element={<PatientRoute><Phase2Tests /></PatientRoute>} />,
  <Route key="journey-treatment" path="/ayesha/journey/treatment" element={<PatientRoute><Phase3Treatment /></PatientRoute>} />,
  <Route key="journey-monitoring" path="/ayesha/journey/monitoring" element={<PatientRoute><Phase4Monitoring /></PatientRoute>} />,
  <Route key="journey-resistance" path="/ayesha/journey/resistance" element={<PatientRoute><Phase5Resistance /></PatientRoute>} />,
  <Route key="journey-board" path="/ayesha/journey/board" element={<PatientRoute><Phase6Board /></PatientRoute>} />,
  <Route key="journey-drug-detail" path="/ayesha/journey/drug/:slug" element={<PatientRoute><DrugDetailPage /></PatientRoute>} />,
  <Route key="journey-test-detail" path="/ayesha/journey/test/:slug" element={<PatientRoute><TestDetailPage /></PatientRoute>} />,
  <Route key="journey-monitor-detail" path="/ayesha/journey/monitor/:slug" element={<PatientRoute><TestDetailPage /></PatientRoute>} />,
  <Route key="journey-repurposing-arsenal" path="/ayesha/journey/repurposing-arsenal" element={<PatientRoute><RepurposingArsenalPage /></PatientRoute>} />,
  <Route key="journey-arsenal-detail" path="/ayesha/journey/arsenal/:slug" element={<PatientRoute><ArsenalDrugDetailPage /></PatientRoute>} />,
  <Route key="journey-biomarker" path="/ayesha/journey/biomarker" element={<PatientRoute><BiomarkerIntelligencePage /></PatientRoute>} />,
  <Route key="journey-prognosis" path="/ayesha/journey/prognosis" element={<PatientRoute><PrognosisSentinel /></PatientRoute>} />,
  <Route key="journey-post-debulking" path="/ayesha/journey/post-debulking" element={<PatientRoute><PostDebulkingMRD /></PatientRoute>} />,
  <Route key="post-debulking-legacy" path="/ayesha/post-debulking" element={<PatientRoute><PostDebulkingMRD /></PatientRoute>} />,
  // Redirect /ayesha/journey to Phase 1
  <Route key="journey-root" path="/ayesha/journey" element={<Navigate to="/ayesha/journey/profile" replace />} />,
];
