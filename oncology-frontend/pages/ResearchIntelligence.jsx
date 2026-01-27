/**
 * Research Intelligence Page
 * 
 * MODULARIZED: Uses reusable components for maintainability and scalability
 * 
 * Orchestrates:
 * - Query history sidebar
 * - Header section (title, examples, disclaimer)
 * - Form section (inputs, validation, actions)
 * - Status section (loading, errors)
 * - Results display
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { useResearchIntelligence } from '../hooks/useResearchIntelligence';
import { AYESHA_11_17_25_PROFILE } from '../constants/patients/ayesha_11_17_25';
import { buildResearchContext, extractBiomarkersForResearch } from '../utils/patientProfileHelpers';
import QueryHistorySidebar from '../components/research/QueryHistorySidebar';
import ResearchIntelligenceHeader from '../components/research/ResearchIntelligenceHeader';
import ResearchIntelligenceForm from '../components/research/ResearchIntelligenceForm';
import ResearchIntelligenceStatus from '../components/research/ResearchIntelligenceStatus';
import ResearchIntelligenceResults from '../components/research/ResearchIntelligenceResults';
import ResearchIntelligenceErrorBoundary from '../components/research/ResearchIntelligenceErrorBoundary';
import PatientContextBanner from '../components/research/PatientContextBanner';
import ResearchProgressStream from '../components/research/ResearchProgressStream';
import { useResearchIntelligenceStream } from '../hooks/useResearchIntelligenceStream';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import EmptyState from '../components/research/EmptyState';
import KeyboardShortcutsHelp from '../components/research/KeyboardShortcutsHelp';

export default function ResearchIntelligence() {
  // Get patient profile (using Ayesha profile as default)
  const patientProfile = AYESHA_11_17_25_PROFILE;
  
  // Auto-populate form from patient profile
  const defaultContext = useMemo(() => buildResearchContext(patientProfile), [patientProfile]);
  const defaultBiomarkers = useMemo(() => extractBiomarkersForResearch(patientProfile), [patientProfile]);
  
  // Form state - initialized from patient profile
  const [question, setQuestion] = useState('');
  const [disease, setDisease] = useState(defaultContext.disease);
  const [treatmentLine, setTreatmentLine] = useState(defaultContext.treatment_line);
  const [biomarkers, setBiomarkers] = useState(JSON.stringify(defaultBiomarkers));
  const [synthesize, setSynthesize] = useState(true);
  const [runMoatAnalysis, setRunMoatAnalysis] = useState(true);
  const [persona, setPersona] = useState('patient');
  
  // Query history state
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [queryHistoryRefreshTrigger, setQueryHistoryRefreshTrigger] = useState(0);
  
  // Validation state
  const [questionError, setQuestionError] = useState('');
  const [biomarkersError, setBiomarkersError] = useState('');
  
  // UI state
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Hook for research intelligence
  const { result, loading, error, errorDetails, researchQuestion, reset } = useResearchIntelligence();
  
  // Hook for streaming (foundation - ready for SSE when backend supports)
  const {
    progress,
    currentStep,
    stepData,
    error: streamError,
    result: streamResult,
    streaming,
    startStream,
    stopStream,
  } = useResearchIntelligenceStream();
  
  // Handle query selection from history
  const handleSelectQuery = (query) => {
    setQuestion(query.question);
    if (query.context) {
      setDisease(query.context.disease || 'ovarian_cancer_hgs');
      setTreatmentLine(query.context.treatment_line || 'L2');
      setBiomarkers(JSON.stringify(query.context.biomarkers || {}));
    }
    if (query.persona) {
      setPersona(query.persona);
    }
    setSelectedQueryId(query.id);
  };

  // Validate inputs
  const validateInputs = () => {
    let isValid = true;
    
    // Validate question
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setQuestionError('Question is required');
      isValid = false;
    } else if (trimmedQuestion.length < 10) {
      setQuestionError('Question must be at least 10 characters');
      isValid = false;
    } else if (trimmedQuestion.length > 500) {
      setQuestionError('Question must be less than 500 characters');
      isValid = false;
    } else {
      setQuestionError('');
    }
    
    // Validate biomarkers JSON
    if (biomarkers.trim()) {
      try {
        JSON.parse(biomarkers);
        setBiomarkersError('');
      } catch (e) {
        setBiomarkersError('Invalid JSON format. Use format: {"HRD": "POSITIVE", "TMB": 8}');
        isValid = false;
      }
    } else {
      setBiomarkersError('');
    }
    
    return isValid;
  };

  // Handle research submission
  const handleResearch = async () => {
    // Clear previous errors
    setQuestionError('');
    setBiomarkersError('');
    
    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    try {
      // Parse biomarkers JSON
      let biomarkersObj = {};
      if (biomarkers.trim()) {
        biomarkersObj = JSON.parse(biomarkers);
      }

      const context = {
        disease,
        treatment_line: treatmentLine,
        biomarkers: biomarkersObj,
        // Pass patient profile for personalization
        patient_profile: patientProfile,
        patient_id: patientProfile?.patient?.patient_id
      };

      const options = {
        synthesize,
        run_moat_analysis: runMoatAnalysis,
        persona: persona
      };

      const data = await researchQuestion(question.trim(), context, options);
      
      // Refresh query history after successful query
      if (data) {
        setQueryHistoryRefreshTrigger(prev => prev + 1);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (err) {
      console.error('Research failed:', err);
      setRetryCount(prev => prev + 1);
    }
  };
  
  // Enhanced retry with retry count
  const handleRetry = () => {
    if (retryCount < 3) {
      handleResearch();
    }
  };
  
  // Keyboard shortcuts (defined after handlers)
  useKeyboardShortcuts({
    onSubmit: handleResearch,
    onReset: handleReset,
    onClear: () => {
      setQuestion('');
      setQuestionError('');
      setBiomarkersError('');
    },
    enabled: !loading
  });

  // Handle export
  const handleExport = () => {
    if (!result) return;

    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-intelligence-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle reset
  const handleReset = () => {
    reset();
    setQuestion('');
    setQuestionError('');
    setBiomarkersError('');
  };

  // Handle example question click
  const handleExampleClick = (example) => {
    setQuestion(example);
    setQuestionError('');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Query History Sidebar */}
      <QueryHistorySidebar 
        onSelectQuery={handleSelectQuery}
        selectedQueryId={selectedQueryId}
        refreshTrigger={queryHistoryRefreshTrigger}
      />
      
      {/* Main Content */}
      <Box 
        id="main-content"
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: { xs: 2, sm: 3, md: 4 }, 
          maxWidth: 1400, 
          mx: 'auto',
          width: '100%'
        }}
      >
        {/* Header - Modular Component */}
        <ResearchIntelligenceHeader onExampleClick={handleExampleClick} />
        
        {/* Patient Context Banner - NEW */}
        <PatientContextBanner patientProfile={patientProfile} />

        {/* Form - Modular Component */}
        <ResearchIntelligenceForm
          // Form values
          question={question}
          disease={disease}
          treatmentLine={treatmentLine}
          biomarkers={biomarkers}
          persona={persona}
          synthesize={synthesize}
          runMoatAnalysis={runMoatAnalysis}
          
          // Form handlers
          onQuestionChange={(value) => {
            setQuestion(value);
            if (questionError) setQuestionError('');
          }}
          onDiseaseChange={setDisease}
          onTreatmentLineChange={setTreatmentLine}
          onBiomarkersChange={(value) => {
            setBiomarkers(value);
            if (biomarkersError) setBiomarkersError('');
          }}
          onPersonaChange={setPersona}
          onSynthesizeChange={setSynthesize}
          onRunMoatAnalysisChange={setRunMoatAnalysis}
          
          // Validation errors
          questionError={questionError}
          biomarkersError={biomarkersError}
          
          // Actions
          onResearch={handleResearch}
          onExport={handleExport}
          onReset={handleReset}
          
          // State
          loading={loading}
          hasResult={!!result}
          
          // NEW: Patient profile integration
          isAutoPopulated={!!patientProfile}
          onCustomize={() => {
            // Allow manual editing - form fields are already editable
            // This is just for the indicator
          }}
        />

        {/* Status - Loading & Error - Modular Component */}
        <ResearchIntelligenceStatus
          loading={loading}
          error={error}
          errorDetails={errorDetails}
          onRetry={handleRetry}
          retryCount={retryCount}
        />
        
        {/* Empty State - No Query */}
        {!loading && !result && !error && !question.trim() && (
          <EmptyState
            type="no_query"
            onAction={handleExampleClick}
            examples={[
              'How do purple potatoes help with ovarian cancer?',
              'What are the latest findings on PARP inhibitors for HRD-positive tumors?',
              'How does diet affect treatment outcomes in ovarian cancer?'
            ]}
          />
        )}

        {/* Streaming Progress - Foundation for SSE */}
        {(streaming || streamResult) && (
          <ResearchProgressStream
            streaming={streaming}
            progress={progress}
            currentStep={currentStep}
            stepData={stepData}
            error={streamError}
            result={streamResult}
          />
        )}

        {/* Results */}
        {result && !loading && !streaming && (
          <ResearchIntelligenceErrorBoundary onReset={reset}>
            <ResearchIntelligenceResults
              result={result}
              context={{
                disease,
                treatment_line: treatmentLine,
                biomarkers: JSON.parse(biomarkers || '{}')
              }}
              persona={persona}
            />
          </ResearchIntelligenceErrorBoundary>
        )}
        
        {/* Keyboard Shortcuts Help Modal */}
        <KeyboardShortcutsHelp
          open={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />
      </Box>
    </Box>
  );
}
