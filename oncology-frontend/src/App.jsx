import React, { useEffect } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { Sidebar, Navbar } from "./components";
import { Home, Profile, Onboarding } from "./pages";
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
import { pik3caTrinityCampaignConfig } from './config/campaigns/pik3ca_trinity_campaign_config';


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
    <ActivityProvider>
    <div className="sm:-8 relative flex min-h-screen flex-row bg-white p-4">
      <div className="relative mr-10 hidden sm:flex">
        <Sidebar />
      </div>

      <div className="mx-auto max-w-[1280px] flex-1 max-sm:w-full sm:pr-5">
        <Navbar />

        <Routes>
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
          <Route path="/agent-demo/:agentId" element={<AgentDemo />} />
          <Route path="/agent-studio" element={<AgentStudio />} />
          <Route path="/investor-slideshow" element={<InvestorSlideshow />} />
          <Route path="/genomic-analysis/:patientId" element={<GenomicAnalysis />} />
          <Route path="/validate" element={<HypothesisValidator />} />
          <Route path="/threat-assessor" element={<ThreatAssessor />} />
          <Route path="/radonc-co-pilot" element={<RadOncCoPilot />} />
          <Route path="/tools" element={<Armory />} />
          <Route path="/myeloma-digital-twin" element={<MyelomaDigitalTwin />} />
          <Route path="/crispr-designer" element={<CrisprDesigner />} />
          <Route path="/protein-synthesis" element={<ProteinSynthesis />} />
          <Route path="/structure-predictor" element={<StructurePredictor />} />
          <Route path="/demo-summarizer" element={<DemoSummarizer />} />
          <Route 
            path="/campaigns/pik3ca-de-risking" 
            element={<CampaignRunner config={pik3caTrinityCampaignConfig} />} 
          />
          {/* <Route path="/dossier" element={<TargetDossier />} /> */}
        </Routes>
      </div>
        
        {/* Global Activity Sidebar - shows on all pages */}
        <GlobalActivitySidebar />
        
        {/* Welcome Modal - shows on first visit */}
        <WelcomeModal />
    </div>
    </ActivityProvider>
  );
};

export default App;
