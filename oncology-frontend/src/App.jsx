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
import { Routes, useNavigate } from "react-router-dom";
import { Sidebar, Navbar, MobileNavbar } from "./components";
import ErrorBoundary from "./components/ErrorBoundary";
import { useStateContext } from "./context";
import { ActivityProvider } from "./context/ActivityContext";
import { AnalysisHistoryProvider } from "./context/AnalysisHistoryContext";
import { AuthProvider } from "./context/AuthContext";
import { PatientProvider } from "./context/PatientContext";
import { PersonaProvider } from "./context/PersonaContext";
import { CoPilotProvider } from "./components/CoPilot/context";
import { SporadicProvider } from "./context/SporadicContext";
import { AgentProvider } from "./context/AgentContext";
import { CoPilot } from "./components/CoPilot/index.js";
import { Box } from "@mui/material";

// Import modular routes
import { getAllRoutes } from "./routes";


const App = () => {
  const { user, authenticated, ready, login, currentUser } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    } else if (user && !currentUser) {
      navigate("/onboarding");
    }
  }, [user, authenticated, ready, login, currentUser, navigate]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PersonaProvider>
          <PatientProvider>
            <AgentProvider>
              <SporadicProvider>
                <CoPilotProvider>
                  <AnalysisHistoryProvider>
                    <ActivityProvider>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        minHeight: '100vh',
                        bgcolor: 'background.default',
                      }}
                    >
                      {/* Desktop Sidebar */}
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'block' },
                        }}
                      >
                        <Sidebar />
                      </Box>

                      {/* Main Content */}
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          width: { xs: '100%', md: 'auto' },
                          pb: { xs: 8, md: 0 }, // Padding bottom for mobile navbar
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
                            minHeight: { xs: 'calc(100vh - 56px)', md: 'auto' }, // Account for mobile nav height
                          }}
                        >
                          <Routes>
                            {/* Modular Routes - Organized by category */}
                            {getAllRoutes().map((route) => route)}
                          </Routes>
                        </Box>
                      </Box>

                      {/* Mobile Bottom Navigation */}
                      <MobileNavbar />
                    </Box>

                    {/* Clinical CoPilot - AI Assistant */}
                    <CoPilot />
                    </ActivityProvider>
                  </AnalysisHistoryProvider>
                </CoPilotProvider>
              </SporadicProvider>
            </AgentProvider>
          </PatientProvider>
        </PersonaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
