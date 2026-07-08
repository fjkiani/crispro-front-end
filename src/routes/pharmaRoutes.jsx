/**
 * Pharma Persona Routes
 *
 * Routes gated to the pharma persona (Brenus / partner BD).
 * Uses PersonaRoute for role-based access control.
 */
import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import PersonaRoute from '../components/auth/PersonaRoute';

// Lazy-load pharma pages so the initial bundle stays lean
const PharmaDashboard = React.lazy(() => import('../pages/pharma/PharmaDashboard'));
const PharmaOnboarding = React.lazy(() => import('../pages/pharma/PharmaOnboarding'));
const PharmaRAGChat = React.lazy(() => import('../pages/pharma/PharmaRAGChat'));
const PharmaCEACAM5 = React.lazy(() => import('../pages/pharma/PharmaCEACAM5'));

const withSuspense = (el) => (
  <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>{el}</Suspense>
);

export const pharmaRoutes = [
  <Route
    key="pharma-onboarding"
    path="/pharma/onboarding"
    element={
      <PersonaRoute allowedPersonas={['pharma']}>
        {withSuspense(<PharmaOnboarding />)}
      </PersonaRoute>
    }
  />,
  <Route
    key="pharma-dashboard"
    path="/pharma/dashboard"
    element={
      <PersonaRoute allowedPersonas={['pharma']}>
        {withSuspense(<PharmaDashboard />)}
      </PersonaRoute>
    }
  />,
  <Route
    key="pharma-rag-chat"
    path="/pharma/rag-chat"
    element={
      <PersonaRoute allowedPersonas={['pharma']}>
        {withSuspense(<PharmaRAGChat />)}
      </PersonaRoute>
    }
  />,
  <Route
    key="pharma-ceacam5"
    path="/pharma/ceacam5"
    element={
      <PersonaRoute allowedPersonas={['pharma']}>
        {withSuspense(<PharmaCEACAM5 />)}
      </PersonaRoute>
    }
  />,
  <Route
    key="pharma-fit-gap"
    path="/pharma/fit-gap"
    element={
      <PersonaRoute allowedPersonas={['pharma']}>
        {withSuspense(<PharmaCEACAM5 />)}
      </PersonaRoute>
    }
  />,
];

export default pharmaRoutes;
