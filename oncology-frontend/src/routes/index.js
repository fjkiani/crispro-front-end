/**
 * Route Aggregator - Central route configuration
 * 
 * Imports all route modules and exports them for use in App.jsx
 * This provides a scalable, modular approach to route management.
 */

import { authRoutes } from './authRoutes';
import { coreRoutes } from './coreRoutes';
import { moatRoutes } from './moatRoutes';
import { patientRoutes } from './patientRoutes';
import { oncologistRoutes } from './oncologistRoutes';
import { researchRoutes } from './researchRoutes';
import { legacyRoutes } from './legacyRoutes';
import { devRoutes } from './devRoutes';
import { getExperimentalRoutes } from './experimentalRoutes';

/**
 * Get all routes organized by category
 * Routes are rendered in order, so specific routes should come before wildcard routes
 * 
 * @param {boolean} includeDev - Whether to include DEV-only routes
 * @param {boolean} includeExperimental - Whether to include experimental routes (DEV-gated)
 */
export const getAllRoutes = (includeDev = import.meta.env.DEV, includeExperimental = import.meta.env.DEV) => {
  const routes = [
    ...authRoutes,
    ...coreRoutes,
    ...moatRoutes,        // MOAT Core - Primary focus
    ...patientRoutes,
    ...oncologistRoutes,  // Oncologist persona routes
    ...researchRoutes,
    ...legacyRoutes,      // Legacy/Unclear routes - kept for backward compatibility
  ];
  
  if (includeExperimental) {
    const experimental = getExperimentalRoutes();
    routes.push(...experimental);
  }
  
  if (includeDev) {
    routes.push(...devRoutes);
  }
  
  return routes;
};

// Default export for backward compatibility (includes DEV routes in DEV mode)
export const allRoutes = getAllRoutes();

/**
 * Route categories for documentation and debugging
 */
export const routeCategories = {
  auth: authRoutes,
  core: coreRoutes,
  moat: moatRoutes,
  patient: patientRoutes,
  oncologist: oncologistRoutes,
  research: researchRoutes,
  legacy: legacyRoutes,
  experimental: getExperimentalRoutes,
  dev: devRoutes,
};

export default allRoutes;
