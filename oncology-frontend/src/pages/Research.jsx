import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Assuming components are in src/components/research/
import SearchBar from '../components/research/SearchBar';
import ResultsDisplay from '../components/research/ResultsDisplay';
import PatientTrialMatchView from '../components/research/PatientTrialMatchView';
import ActionSuggestionsModal from '../components/research/ActionSuggestionsModal';

// Placeholder data structure anticipating agent outputs
const placeholderTrial = {
  id: 'NCI-2021-08397',
  title: 'Using Cancer Cells in the Blood (ctDNA) to Determine the Type of Chemotherapy that will Benefit Patients who Have Had Surgery for Colon Cancer, (CIRCULATE-NORTH AMERICA)',
  // --- Agent Outputs ---
  aiSummary: 'AI Summary Placeholder: This Phase II/III trial for Stage II/III Colon Cancer compares chemotherapy strategies based on ctDNA status after surgery. ctDNA+ patients get standard chemo vs. mFOLFIRINOX. ctDNA- patients get standard chemo vs. surveillance with chemo upon ctDNA detection.',
  aiEligibility: 'AI Eligibility Placeholder: [Review Needed] Appears eligible for Stage III Colon Cancer, ECOG 0-1, post-R0 resection. Requires specific checks: ctDNA test results, MSI status (must be stable), lab values (ANC, platelets, Hgb, bili, CrCl), prior treatment review.',
  // --- Extracted Key Details ---
  keyDetails: {
    phase: 'Phase II / Phase III',
    status: 'Active',
    condition: 'Colon Cancer', // Simplified
    leadOrg: 'National Cancer Institute (NCI)', // Example
  },
  // --- Actionable Info ---
  contactInfo: { // Example: First contact listed
    name: 'Site Public Contact (UAB Cancer Center)',
    phone: '205-934-0220',
    email: 'tmyrick@uab.edu'
  },
  sourceUrl: 'https://www.cancer.gov/research/participate/clinical-trials-search/v?id=NCI-2021-08397'
};

// Helper to generate simple IDs
const generateId = () => Math.floor(Math.random() * 10001);

// LocalStorage key for tasks
const KANBAN_TASKS_KEY = 'kanbanTasks';

const Research = () => {
  const API_ROOT = import.meta.env.VITE_API_ROOT || '';
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [detailViewContext, setDetailViewContext] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // --- Modal State ---
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [modalFollowupData, setModalFollowupData] = useState({ suggestions: [], trialId: null, trialTitle: null });
  
  // --- Task State Initialization ---
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem(KANBAN_TASKS_KEY);
    let initialTasks = [];
    if (savedTasks) {
        try {
            const parsedTasks = JSON.parse(savedTasks);
            if (Array.isArray(parsedTasks)) {
                initialTasks = parsedTasks;
            }
        } catch (error) {
            console.error("Kanban: Error parsing tasks from localStorage, using empty list:", error);
        }
    }
    // Filter tasks specific to this patient context AFTER loading all
    return initialTasks.filter(task => !patientId || task.patientId === patientId);
  });
  // --- End Task Initialization ---
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    const allTasksSaved = localStorage.getItem(KANBAN_TASKS_KEY);
    const allTasks = allTasksSaved ? JSON.parse(allTasksSaved) : [];
    const currentPatientTasksMap = new Map(tasks.filter(t => t.patientId === patientId).map(t => [t.id, t]));
    const updatedAllTasks = allTasks
        .filter(task => task.patientId !== patientId)
        .concat(tasks.filter(task => task.patientId === patientId));
    
    localStorage.setItem(KANBAN_TASKS_KEY, JSON.stringify(updatedAllTasks));
  }, [tasks, patientId]);
  
  // Reload tasks when patientId changes
  useEffect(() => {
    const savedTasks = localStorage.getItem(KANBAN_TASKS_KEY);
    const allTasks = savedTasks ? JSON.parse(savedTasks) : [];
    setTasks(allTasks.filter(task => !patientId || task.patientId === patientId));
  }, [patientId]);
  
  // Effect to fetch patient data if patientId exists
  useEffect(() => {
    setSearchResults([]);
    setError(null);
    setPatientData(null);

    if (patientId) {
      console.log(`Fetching patient data for: ${patientId}`);
      setIsLoading(true);
      const fetchPatientData = async () => {
        try {
          const response = await fetch(`${API_ROOT}/api/patients/${patientId}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Failed to load patient data.' }));
            throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          if (data.success && data.data) {
            console.log("Patient data loaded:", data.data);
            setPatientData(data.data);
          } else {
            throw new Error(data.message || 'Patient data not found or invalid format.');
          }
        } catch (err) {
          console.error("Error fetching patient data:", err);
          setError(`Failed to load patient data: ${err.message}`);
          const defaultPatientData = {
            patientId: patientId,
            demographics: { name: `Patient ${patientId}`, dob: "N/A", gender: "Unknown" },
            diagnosis: { primary: "Cancer", date: new Date().toISOString().split('T')[0] }
          };
          setPatientData(defaultPatientData);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatientData();
    } else {
       console.log('Research page loaded without patient context.');
       setIsLoading(false);
    }
  }, [patientId, API_ROOT]);

  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId);
    }
  }, [patientId]);

  // --- MODIFIED Handler for Initiating Follow-ups (opens modal) --- 
  const handlePlanFollowups = (followupData) => {
    const { suggestions, trialId, trialTitle } = followupData;
    if (!suggestions || suggestions.length === 0) {
      console.log("No action suggestions provided to plan follow-ups.");
      setError("No action suggestions available to create follow-up tasks.");
      // Optionally useSnackbar here for a less intrusive message
      return;
    }
    console.log(`Opening modal for follow-ups for Trial ${trialId} with suggestions:`, suggestions);
    setModalFollowupData({ suggestions, trialId, trialTitle });
    setIsSuggestionsModalOpen(true);
  };

  // --- NEW Handler for Processing Selected Follow-ups from Modal (calls API) ---
  const processSelectedFollowups = async (selectedSuggestions, trialId, trialTitle) => {
    setIsSuggestionsModalOpen(false); // Close modal

    if (!selectedSuggestions || selectedSuggestions.length === 0) {
      console.log("No suggestions were selected from the modal.");
      // Optionally useSnackbar or setError for user feedback
      return;
    }

    console.log(`Processing selected follow-ups for Trial ${trialId}:`, selectedSuggestions);
    setIsLoading(true);
    setError(null);

    try {
        const apiUrl = `${API_ROOT}/api/plan-followups`; 
        const requestBody = {
            action_suggestions: selectedSuggestions, // Use selected suggestions
            patient_id: patientId,
            trial_id: trialId,
            trial_title: trialTitle
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Failed to plan follow-ups.'}));
            throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("[Research.jsx] Full API response from /api/search-trials:", JSON.stringify(result, null, 2));

        if (result.success && Array.isArray(result.planned_tasks)) {
            console.log("Received planned tasks from API:", result.planned_tasks);
            const tasksToAdd = result.planned_tasks.map(task => ({
                 ...task, 
                 id: task.id || generateId(), 
                 columnId: task.columnId || 'followUpNeeded', 
                 patientId: task.patientId || patientId || null 
            }));
            setTasks(prevTasks => [
                ...prevTasks,
                ...tasksToAdd
            ]);
            // Consider using useSnackbar for success message
            alert("Selected follow-up tasks generated and saved!"); 
        } else {
            throw new Error(result.message || 'Invalid response format from planning endpoint.');
        }
    } catch (err) {
        console.error("Error processing selected follow-ups:", err);
        setError(`Failed to process selected follow-ups: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  // Search Handler 
  const handleSearch = async (query) => {
    if (!query) {
      setError('Please enter a search query.');
      return;
    }
    console.log(`Performing search for: ${query}`);
    setSearchQuery(query);
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    const requestBody = { query: query, patient_context: patientData };
    try {
      const response = await fetch(`${API_ROOT}/api/search-trials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
           const errorData = await response.json().catch(() => ({ detail: 'Failed to parse error response.' }));
           console.error("Backend search error:", response.status, errorData);
           throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("[Research.jsx] Full API response from /api/search-trials:", JSON.stringify(result, null, 2));

      if (result.success && result.data && result.data.found_trials) {
          console.log("Trials found:", result.data.found_trials);
          setSearchResults(result.data.found_trials);
      } else if (result.success) {
          console.log("Search successful but no trials found or data format unexpected.");
          setSearchResults([]);
      } else {
           console.error("Backend indicated failure:", result);
           throw new Error(result.message || 'Backend search failed.');
      }
    } catch (err) {
        console.error("Error fetching search results:", err);
        setError(err.message || 'Failed to fetch search results. Check backend connection.');
        setSearchResults([]);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePatientContextSearch = () => {
    if (!patientData) {
      console.log("[Research.jsx] handlePatientContextSearch: No patientData available. Proceeding with general search.");
      const defaultDiagnosis = "cancer"; // Default search if no patient context
      handleSearch(defaultDiagnosis);
      return;
    }
    const diagnosis = patientData.diagnosis?.primary;
    console.log(`[Research.jsx] handlePatientContextSearch: Using diagnosis from patientData: '${diagnosis}' for patient ID: ${patientData.id || patientData.patientId}`);

    if (!diagnosis) {
      console.log("[Research.jsx] handlePatientContextSearch: Primary diagnosis missing. Using default search term.");
      const fallbackDiagnosis = patientData.diagnosis?.secondary || "cancer";
      handleSearch(fallbackDiagnosis);
      return;
    }
    handleSearch(diagnosis);
  };

  // --- Handler to show Detail View when Kanban card is clicked ---
  const handleViewTaskDetails = async (task) => {
    console.log("Attempting to view details for task (potentially a trial link):", task);
    if (!task.trial_id || !patientData) {
      console.error("Cannot view trial details from task: Missing trial ID on task or patient data not loaded.");
      alert("Could not load trial details related to this task: Missing context.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = `${API_ROOT}/api/trial-details/${task.trial_id}?patientId=${task.patientId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ detail: `HTTP error! Status: ${response.status}` }));
         throw new Error(errorData.detail || `Failed to fetch details for trial ${task.trial_id}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
          setDetailViewContext({ 
              patientData: patientData, 
              trialItem: result.data
          }); 
      } else {
          throw new Error(result.message || `Invalid response format when fetching details for trial ${task.trial_id}`);
      }
    } catch (err) {
        console.error(`Error fetching details for trial ${task.trial_id}:`, err);
        setError(`Failed to load details for trial ${task.trial_id}: ${err.message}`);
        setDetailViewContext(null);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCloseDetailView = () => {
      setDetailViewContext(null); 
      setError(null);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
        <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate(-1)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded">
                &larr; Back
            </button>
            <h1 className="text-3xl font-bold text-center text-blue-600">Clinical Trial Research Portal</h1>
            <div className="flex gap-2">
                {patientId && (
                    <button onClick={() => navigate(`/medical-records/${patientId}`)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded">
                        Patient Record
                    </button>
                )}
                {patientId && (
                    <button onClick={() => navigate(`/mutation-explorer/${patientId}`)} className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold py-2 px-4 rounded">
                        Mutation Explorer
                    </button>
                )}
                {patientId && (
                    <button 
                        onClick={() => navigate(`/medical-records/${patientId}/tasks`)}
                        className="bg-green-100 hover:bg-green-200 text-green-800 font-bold py-2 px-4 rounded"
                    >
                        Follow-up Tasks
                    </button>
                )}
            </div>
        </div>

        {patientId && patientData &&
            <p className="mb-4 text-sm text-gray-600">Showing research relevant to Patient ID: {patientId} ({patientData.demographics?.name || 'Name N/A'})</p>
        }
        {patientId && !patientData && !isLoading &&
            <p className="mb-4 text-sm text-red-600">Could not load data for Patient ID: {patientId}. Proceeding without context.</p>
        }
        
        {detailViewContext ? (
            <PatientTrialMatchView 
                trialItem={detailViewContext.trialItem}
                patientContext={detailViewContext.patientData}
                onClose={handleCloseDetailView} 
            />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="search-controls mb-6 flex flex-col sm:flex-row items-start gap-3 col-span-3">
                    <div className="flex-grow w-full sm:w-auto">
                        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                    </div>
                    <button
                        onClick={handlePatientContextSearch}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto whitespace-nowrap shadow-md"
                    >
                        Find Trials for This Patient
                    </button>
                </div>

                <div className="col-span-3">
                    {isLoading && searchResults.length === 0 && !error && 
                        <div className="text-center p-6 text-gray-400">Searching for trials...</div>
                    }
                    {error && !isLoading && 
                        <div className="text-center p-6 text-red-400">Error: {error}</div>
                    } 
                    {!isLoading && searchResults.length > 0 && (
                        <ResultsDisplay 
                            results={searchResults} 
                            patientContext={patientData} 
                            onPlanFollowups={handlePlanFollowups} 
                            kanbanTasks={tasks} 
                        />
                    )}
                    {!isLoading && !error && searchQuery && searchResults.length === 0 && (
                        <div className="text-center p-6 text-gray-400">No matching trials found for "{searchQuery}".</div>
                    )}
                </div>
            </div>
        )}

        {isSuggestionsModalOpen && (
            <ActionSuggestionsModal
                isOpen={isSuggestionsModalOpen}
                onClose={() => setIsSuggestionsModalOpen(false)}
                followupData={modalFollowupData}
                onSubmit={processSelectedFollowups}
            />
        )}
    </div>
  );
};

export default Research; 