/**
 * App.jsx - Main Application Component
 * 
 * Modular Route Architecture:
 * - Routes are organized in /src/routes/ modules
 * - MOAT routes are the primary focus (Tier 1)
 * - Legacy routes maintained for backward compatibility
 * - Experimental routes DEV-gated for production safety
 * 
 * Route Categories:
 * - authRoutes: Authentication and admin routes
 * - coreRoutes: Essential navigation routes
 * - moatRoutes: MOAT Core capabilities (Primary focus)
 * - patientRoutes: Patient persona routes
 * - researchRoutes: Advanced research tools
 * - legacyRoutes: Legacy/unclear routes (evaluation needed)
 * - experimentalRoutes: Experimental routes (DEV-gated)
 * - devRoutes: Development-only routes
 */

import React, { useEffect } from "react";
import { Routes, useNavigate, useLocation } from "react-router-dom";
import { Sidebar, Navbar, MobileNavbar } from "./components";
import ErrorBoundary from "./components/ErrorBoundary";
import { useStateContext } from "./context";
import { ActivityProvider } from "./context/ActivityContext";
import { AnalysisHistoryProvider } from "./context/AnalysisHistoryContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PatientProvider } from "./context/PatientContext";
import { PersonaProvider } from "./context/PersonaContext";
import { CoPilotProvider } from "./components/CoPilot/context";
import { SporadicProvider } from "./context/SporadicContext";
import { AgentProvider } from "./context/AgentContext";
import { CoPilot } from "./components/CoPilot/index.js";
import { Box } from "@mui/material";
import { getAllSessionKeys, isSessionValid, loadFromStorage, SESSION_KEYS } from "./utils/sessionPersistence";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import modular routes
import { getAllRoutes } from "./routes";

// INNER COMPONENT: Consumes Contexts
const AppContent = () => {
  const { currentUser } = useStateContext();
  const { user, authenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !authenticated) {
      // Only redirect if trying to access a protected route (exclude login/signup)
      if (location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/forgot-password') {
        navigate('/login');
      }
    }
  }, [authenticated, loading, navigate, location.pathname]);

  // Session health check on app startup (Moved inside logic)
  useEffect(() => {
    const performSessionHealthCheck = () => {
      console.log('🔍 Performing session health check...');
      const authSession = loadFromStorage(SESSION_KEYS.AUTH_SESSION);
      if (authSession) console.log('✅ Auth session is valid');
      else console.log('ℹ️ No auth session found');
    };

    const timeout = setTimeout(performSessionHealthCheck, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', md: 'auto' },
          pb: { xs: 8, md: 0 },
        }}
      >
        {/* Desktop Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            maxWidth: { md: '1400px' },
            width: '100%',
            mx: 'auto',
            minHeight: { xs: 'calc(100vh - 56px)', md: 'auto' },
          }}
        >
          <Routes>
            {getAllRoutes().map((route) => route)}
          </Routes>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      <MobileNavbar />

      {/* Clinical CoPilot - AI Assistant */}
      <CoPilot />
    </Box>
  );
};

// MAIN COMPONENT: Provides Contexts
const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <PersonaProvider>
            <PatientProvider>
              <AgentProvider>
                <SporadicProvider>
                  <CoPilotProvider>
                    <AnalysisHistoryProvider>
                      <ActivityProvider>
                        <AppContent />
                      </ActivityProvider>
                    </AnalysisHistoryProvider>
                  </CoPilotProvider>
                </SporadicProvider>
              </AgentProvider>
            </PatientProvider>
          </PersonaProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
