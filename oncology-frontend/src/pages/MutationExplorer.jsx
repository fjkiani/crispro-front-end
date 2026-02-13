import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutationExplorerData } from '../hooks/vus/useMutationExplorerData';

// Context & Utils
import { WORKFLOW_STEPS, EXTERNAL_URLS } from '../components/vus/constants.jsx';

// Modular Components
import PatientSelection from '../components/vus/PatientSelection';
import WorkflowStepper from '../components/vus/WorkflowStepper';
import MutationTable from '../components/vus/MutationTable';
import GenomicQueryPanel from '../components/vus/GenomicQueryPanel';
import AnalysisResults from '../components/vus/AnalysisResults';
import CrisprRecommendations from '../components/vus/CrisprRecommendations';
import ResearchModeBanner from '../components/vus/ResearchModeBanner';

const mockPatientIds = ["PAT12345", "PAT67890"];

const MutationExplorer = () => {
    const API_ROOT = import.meta.env.VITE_API_ROOT || '';
    const navigate = useNavigate();
    const { user } = useAuth();
    const { patientId } = useParams();

    // Use Custom Hook for Data & Logic to prevent monolith
    const {
        selectedPatientId,
        setSelectedPatientId,
        patientMutations,
        genomicQuery,
        setGenomicQuery,
        analysisResult,
        isLoadingPatient,
        isLoadingAnalysis,
        error,
        activeMutationTab,
        setActiveMutationTab,
        currentWorkflowStep,
        setCurrentWorkflowStep,
        activeMutation,
        setActiveMutation,
        analysisStatusForWorkflow,
        handleAnalyze,
        handleCrisprDesign
    } = useMutationExplorerData(API_ROOT);

    // -- Handlers (UI Specific) --

    const handlePatientSelect = (pid) => {
        if (pid) {
            setSelectedPatientId(pid);
            navigate(`/mutation-explorer/${pid}`);
        }
    };

    const handleTrialsClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Filter mutations based on tab (basic implementation)
    const filteredMutations = activeMutationTab === 'All'
        ? patientMutations
        : patientMutations.filter(m => m.variant_type === activeMutationTab);


    // -- Main Render --
    return (
        <div className="p-6 min-h-screen bg-gray-1050 text-gray-300 px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded transition-colors"
                >
                    &larr; Back
                </button>
                <h1 className="text-3xl font-bold text-center text-purple-400 flex-grow">VUS Explorer (research‑mode)</h1>
                <div>
                    {patientId && (
                        <button
                            onClick={() => navigate(`/medical-records/${patientId}`)}
                            className="ml-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded transition-colors"
                        >
                            Patient Record
                        </button>
                    )}
                </div>
            </div>

            {/* Content Switch */}
            {!selectedPatientId ? (
                /* 1. No Patient Selected */
                <PatientSelection
                    patientIds={mockPatientIds}
                    onSelect={handlePatientSelect}
                    userEmail={user?.email}
                    isLoading={false}
                />
            ) : (
                /* 2. Patient Context Active */
                <div className="lg:grid lg:grid-cols-12 lg:gap-6">

                    {/* Top: Workflow Stepper */}
                    <div className="lg:col-span-12 mb-6">
                        <WorkflowStepper
                            currentStep={currentWorkflowStep}
                            onStepClick={setCurrentWorkflowStep}
                            analysisStatus={analysisStatusForWorkflow}
                        />
                    </div>

                    {/* Left/Main Column: Mutation Table & Query */}
                    <div className="lg:col-span-12 space-y-6">

                        {/* Step 1: Mutation Selection */}
                        <div className={currentWorkflowStep !== WORKFLOW_STEPS.MUTATION_SELECTION ? 'opacity-80' : ''}>
                            <MutationTable
                                mutations={filteredMutations}
                                activeMutation={activeMutation}
                                activeMutationTab={activeMutationTab}
                                isLoading={isLoadingPatient}
                                error={error}
                                patientId={selectedPatientId}
                                onTabChange={setActiveMutationTab}
                                onAnalyze={handleAnalyze}
                                onDesign={handleCrisprDesign}
                                onTrialsClick={handleTrialsClick}
                            />
                        </div>

                        {/* Step 2: Genomic Query */}
                        {currentWorkflowStep === WORKFLOW_STEPS.ANALYSIS_VIEW && (
                            <div>
                                <GenomicQueryPanel
                                    value={genomicQuery}
                                    onChange={setGenomicQuery}
                                    onRun={() => handleAnalyze()}
                                    onApplyTemplate={(q, m) => {
                                        setGenomicQuery(q);
                                        if (m) handleAnalyze(q, m); // Auto run
                                    }}
                                    isLoading={isLoadingAnalysis}
                                    patientMutations={patientMutations}
                                />
                            </div>
                        )}

                        {/* Step 2 Results: Analysis Output */}
                        {analysisResult && currentWorkflowStep === WORKFLOW_STEPS.ANALYSIS_VIEW && (
                            <AnalysisResults
                                result={analysisResult}
                                status={analysisStatusForWorkflow}
                                error={error}
                                isLoading={isLoadingAnalysis}
                                activeMutation={activeMutation}
                                patientMutations={patientMutations}
                                patientId={selectedPatientId}
                            />
                        )}

                        {/* Step 3: CRISPR View */}
                        {currentWorkflowStep === WORKFLOW_STEPS.CRISPR_VIEW && (
                            <div>
                                <CrisprRecommendations
                                    activeMutation={activeMutation}
                                    analysisResult={analysisResult}
                                    onDesign={handleCrisprDesign}
                                    onGoToAnalysis={() => setCurrentWorkflowStep(WORKFLOW_STEPS.ANALYSIS_VIEW)}
                                />
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Footer Banner */}
            <div className="mt-8">
                <ResearchModeBanner />
            </div>

        </div>
    );
};

export default MutationExplorer;