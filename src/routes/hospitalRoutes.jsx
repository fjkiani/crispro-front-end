/**
 * Hospital Persona Routes
 *
 * Routes for the hospital/clinic tumor-board workflow. Shared with the
 * oncologist persona (see PersonaContext) so an oncologist can also
 * access these.
 */
import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import PersonaRoute from '../components/auth/PersonaRoute';

const HospitalOnboarding = React.lazy(() => import('../pages/hospital/HospitalOnboarding'));
const TumorBoardPage = React.lazy(() => import('../pages/hospital/TumorBoardPage'));

const withSuspense = (el) => (
  <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>{el}</Suspense>
);

export const hospitalRoutes = [
  <Route
    key="hospital-onboarding"
    path="/hospital/onboarding"
    element={
      <PersonaRoute allowedPersonas={['hospital', 'oncologist']}>
        {withSuspense(<HospitalOnboarding />)}
      </PersonaRoute>
    }
  />,
  <Route
    key="hospital-tumor-board"
    path="/hospital/tumor-board"
    element={
      <PersonaRoute allowedPersonas={['hospital', 'oncologist']}>
        {withSuspense(<TumorBoardPage />)}
      </PersonaRoute>
    }
  />,
  <Route
    key="hospital-patients"
    path="/hospital/patients"
    element={
      <PersonaRoute allowedPersonas={['hospital', 'oncologist']}>
        {withSuspense(<TumorBoardPage />)}
      </PersonaRoute>
    }
  />,
];

export default hospitalRoutes;
