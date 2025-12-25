import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { Sidebar, Navbar } from "./components";
import { Home, Profile, Onboarding } from "./pages";
import ErrorBoundary from "./components/ErrorBoundary";
import MedicalRecords from "./pages/records/index";
import ScreeningSchedule from "./pages/ScreeningSchedule";
import SingleRecordDetails from "./pages/records/single-record-details";
import Research from "./pages/Research";
import MutationExplorer from "./pages/MutationExplorer";
import AgentDashboard from "./pages/AgentDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AgentDemo from "./pages/AgentDemo";
import AgentStudio from "./pages/AgentStudio";
import PatientTasksPage from "./pages/PatientTasksPage";
import FollowUpTaskBoard from "./pages/FollowUpTaskBoard";
import { useStateContext } from "./context";
import { ActivityProvider } from "./context/ActivityContext";
import { AnalysisHistoryProvider } from "./context/AnalysisHistoryContext";
import { AuthProvider } from "./context/AuthContext";
import { CoPilotProvider } from "./components/CoPilot/context";
import { SporadicProvider } from "./context/SporadicContext";
import { CoPilot } from "./components/CoPilot/index.js";
import { Q2CRouterTest } from "./components/CoPilot/Q2CRouter/Q2CRouterTest";
import Phase3ActionDemo from "./components/Phase3ActionDemo";
import CoPilotSmokeTest from "./components/CoPilotSmokeTest";
import CoPilotDoctrineGapAnalysis from "./components/CoPilotDoctrineGapAnalysis";
import GlobalActivitySidebar from "./components/GlobalActivitySidebar";
import InvestorSlideshow from './pages/InvestorSlideshow';
import WelcomeModal from './components/WelcomeModal';
import GenomicAnalysis from "./pages/GenomicAnalysis.tsx";
import HypothesisValidator from "./pages/HypothesisValidator";
import ThreatAssessor from './pages/ThreatAssessor';
import RadOncCoPilot from './pages/RadOncCoPilot';
import Armory from './pages/Armory';
import MyelomaDigitalTwin from './pages/MyelomaDigitalTwin';
import CrisprDesigner from './pages/CrisprDesigner';
import ProteinSynthesis from './pages/ProteinSynthesis';
import StructurePredictor from './pages/StructurePredictor';
import DemoSummarizer from './pages/DemoSummarizer';
import CampaignRunner from './pages/CampaignRunner';
import TargetDossier from './pages/TargetDossier';
import MetastasisDashboard from './pages/MetastasisDashboard';
import { pik3caTrinityCampaignConfig } from './config/campaigns/pik3ca_trinity_campaign_config';
import ClinicalGenomicsCommandCenter from './components/ClinicalGenomicsCommandCenter/ClinicalGenomicsCommandCenter';
import FoodValidatorAB from './pages/FoodValidatorAB';
import BatchFoodValidator from './pages/BatchFoodValidator';
import AyeshaTwinDemo from './pages/AyeshaTwinDemo';
import AyeshaCompleteCare from './pages/AyeshaCompleteCare';
import ToxicityRiskAssessment from './pages/ToxicityRiskAssessment';
import UniversalCompleteCare from './pages/UniversalCompleteCare';
import AyeshaTrialExplorer from './pages/AyeshaTrialExplorer';
import AyeshaDossierBrowser from './pages/AyeshaDossierBrowser';
import AyeshaDossierDetail from './pages/AyeshaDossierDetail';
import UniversalDossierBrowser from './pages/UniversalDossierBrowser';
import UniversalDossierDetail from './pages/UniversalDossierDetail';
import UniversalTrialIntelligence from './pages/UniversalTrialIntelligence';
import ClinicalDossierTest from './pages/ClinicalDossierTest';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import SporadicCancerPage from './pages/SporadicCancerPage';
import RunxConquest from './pages/RunxConquest';
import { AgentsPage } from './pages/AgentsPage';
import { AgentProvider } from './context/AgentContext';
import { SyntheticLethalityAnalyzer } from './components/SyntheticLethality';
import { OrchestratorDashboard } from './pages/OrchestratorDashboard';
import TherapyFitPage from './pages/TherapyFitPage';



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
    <ErrorBoundary showReloadOption={true}>
      <AuthProvider>
        <AgentProvider>
          <SporadicProvider>
            <CoPilotProvider>
              <AnalysisHistoryProvider>
                <ActivityProvider>
            <div className="sm:-8 relative flex min-h-screen flex-row bg-white p-4">
              <div className="relative mr-10 hidden sm:flex">
                <Sidebar />
              </div>

              <div className="mx-auto max-w-[1280px] flex-1 max-sm:w-full sm:pr-5">
                <Navbar />

                <Routes>
          {/* Auth routes - public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin routes - protected */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          
          {/* Root route shows the home page */}
          <Route path="/" element={<Home />} />
          <Route path="/dossier" element={<TargetDossier />} />

          {/* Keeping other routes for now, can be cleaned up later */}
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/workload-dashboard" element={<FollowUpTaskBoard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route
            path="/medical-records/:id"
            element={<SingleRecordDetails />}
          />
          <Route 
            path="/medical-records/:patientId/research" 
            element={<Research />} 
          />
          <Route 
            path="/medical-records/:patientId/tasks"
            element={<PatientTasksPage />} 
          />
          <Route path="/screening-schedules" element={<ScreeningSchedule />} />
          <Route path="/research/:patientId" element={<Research />} />
          <Route path="/research" element={<Research />} />
          <Route path="/mutation-explorer" element={<MutationExplorer />} />
          <Route path="/mutation-explorer/:patientId" element={<MutationExplorer />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
          <Route path="/agent-dashboard/:patientId" element={<AgentDashboard />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agent-demo/:agentId" element={<AgentDemo />} />
          <Route path="/agent-studio" element={<AgentStudio />} />
          <Route path="/investor-slideshow" element={<InvestorSlideshow />} />
          <Route path="/genomic-analysis/:patientId" element={<GenomicAnalysis />} />
          <Route path="/validate" element={<HypothesisValidator />} />
          <Route path="/food-validator" element={<FoodValidatorAB />} />
          <Route path="/batch-food-validator" element={<BatchFoodValidator />} />
          <Route path="/ayesha-twin-demo" element={<AyeshaTwinDemo />} />
          <Route path="/ayesha-complete-care" element={<AyeshaCompleteCare />} />
        <Route path="/toxicity-risk" element={<ToxicityRiskAssessment />} />
        <Route path="/toxicity-risk/:patientId" element={<ToxicityRiskAssessment />} />
          <Route path="/complete-care" element={<UniversalCompleteCare />} />
          <Route path="/complete-care/:patientId" element={<UniversalCompleteCare />} />
          <Route path="/ayesha-trials" element={<AyeshaTrialExplorer />} />
          <Route path="/ayesha-dossiers" element={<AyeshaDossierBrowser />} />
          <Route path="/ayesha-dossiers/:nct_id" element={<AyeshaDossierDetail />} />
          <Route path="/universal-dossiers" element={<UniversalDossierBrowser />} />
          <Route path="/universal-dossiers/:patientId/:nct_id" element={<UniversalDossierDetail />} />
          <Route path="/universal-trial-intelligence" element={<UniversalTrialIntelligence />} />
          <Route path="/sporadic-cancer" element={<SporadicCancerPage />} />
          <Route path="/threat-assessor" element={<ThreatAssessor />} />
          <Route path="/radonc-co-pilot" element={<RadOncCoPilot />} />
          <Route path="/tools" element={<Armory />} />
          <Route path="/metastasis" element={<MetastasisDashboard />} />
          <Route path="/myeloma-digital-twin" element={<MyelomaDigitalTwin />} />
          <Route path="/clinical-genomics" element={<ClinicalGenomicsCommandCenter />} />
          <Route path="/clinical-dossier-test" element={<ClinicalDossierTest />} />
          <Route path="/synthetic-lethality" element={<SyntheticLethalityAnalyzer />} />
          <Route path="/orchestrator" element={<OrchestratorDashboard />} />
          <Route path="/therapy-fit" element={<TherapyFitPage />} />
          <Route path="/crispr-designer" element={<CrisprDesigner />} />
          <Route path="/protein-synthesis" element={<ProteinSynthesis />} />
          <Route path="/structure-predictor" element={<StructurePredictor />} />
          <Route path="/demo-summarizer" element={<DemoSummarizer />} />
          <Route 
            path="/campaigns/pik3ca-de-risking" 
            element={<CampaignRunner config={pik3caTrinityCampaignConfig} />} 
          />
          {/* Modular Demo Routes - Route-based demo selection */}
          <Route path="/runx-conquest/:demoId" element={<RunxConquest />} />
          <Route path="/runx-conquest" element={<RunxConquest />} />
          {/* Q2C Router Test Route */}
          <Route path="/q2c-test" element={<Q2CRouterTest />} />
          {/* Phase 3 Action Integration Demo Route */}
          <Route path="/phase3-demo" element={<Phase3ActionDemo />} />
          {/* Co-Pilot Doctrine Smoke Test Route */}
          <Route path="/copilot-smoke-test" element={<CoPilotSmokeTest />} />
          {/* Co-Pilot Doctrine Gap Analysis Route */}
          <Route path="/copilot-gap-analysis" element={<CoPilotDoctrineGapAnalysis />} />
          {/* <Route path="/dossier" element={<TargetDossier />} /> */}
            </Routes>
          </div>

          {/* Global Activity Sidebar - shows on all pages */}
          <GlobalActivitySidebar />

          {/* Welcome Modal - shows on first visit */}
          {/* <WelcomeModal /> */}
        </div>

        {/* Clinical CoPilot - AI Assistant */}
        <CoPilot />
      </ActivityProvider>
    </AnalysisHistoryProvider>
    </CoPilotProvider>
    </SporadicProvider>
    </AgentProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
