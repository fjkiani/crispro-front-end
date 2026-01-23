/**
 * Core Navigation Routes
 * 
 * Essential application routes for basic navigation and functionality
 */

import React from 'react';
import { Route } from 'react-router-dom';
import { Home, Profile, Onboarding } from '../pages';
import DoctorDashboard from '../pages/DoctorDashboard';
import MedicalRecords from '../pages/records/index';
import SingleRecordDetails from '../pages/records/single-record-details';
import ScreeningSchedule from '../pages/ScreeningSchedule';
import FollowUpTaskBoard from '../pages/FollowUpTaskBoard';
import PatientTasksPage from '../pages/PatientTasksPage';
import TargetDossier from '../pages/TargetDossier';
import OutreachDashboard from '../pages/OutreachDashboard';
import Research from '../pages/Research';

export const coreRoutes = [
  <Route key="home" path="/home" element={<Home />} />,
  <Route key="profile" path="/profile" element={<Profile />} />,
  <Route key="onboarding" path="/onboarding" element={<Onboarding />} />,
  <Route key="dashboard" path="/dashboard" element={<DoctorDashboard />} />,
  <Route key="workload-dashboard" path="/workload-dashboard" element={<FollowUpTaskBoard />} />,
  <Route key="medical-records" path="/medical-records" element={<MedicalRecords />} />,
  <Route 
    key="medical-records-detail" 
    path="/medical-records/:id" 
    element={<SingleRecordDetails />} 
  />,
  <Route 
    key="medical-records-research" 
    path="/medical-records/:patientId/research" 
    element={<Research />} 
  />,
  <Route 
    key="medical-records-tasks" 
    path="/medical-records/:patientId/tasks"
    element={<PatientTasksPage />} 
  />,
  <Route key="screening-schedules" path="/screening-schedules" element={<ScreeningSchedule />} />,
  <Route key="outreach" path="/outreach" element={<OutreachDashboard />} />,
  <Route key="dossier" path="/dossier" element={<TargetDossier />} />,
];
