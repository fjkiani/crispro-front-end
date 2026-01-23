/**
 * Oncologist Persona Routes
 * 
 * Routes for oncologist/clinician persona following PERSONA_ACCESS_QUICK_START.md patterns
 * Uses PersonaRoute for access control
 */

import React from 'react';
import { Route } from 'react-router-dom';
import PersonaRoute from '../components/auth/PersonaRoute';
import OncologistOnboarding from '../pages/DoctorOnboarding';

/**
 * Oncologist Routes - Oncologist Persona Access
 * 
 * Following PERSONA_ACCESS_QUICK_START.md:
 * - Persona: oncologist (maps from role: 'clinician')
 * - Access: Oncologist persona only
 */
export const oncologistRoutes = [
  // Oncologist Onboarding
  <Route 
    key="oncologist-onboarding" 
    path="/oncologist/onboarding" 
    element={
      <PersonaRoute allowedPersonas={['oncologist']}>
        <OncologistOnboarding />
      </PersonaRoute>
    } 
  />,
];
