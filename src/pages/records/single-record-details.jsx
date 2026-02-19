import React, { useState, useEffect, useMemo } from "react";
import {
  IconChevronRight,
  IconFileUpload,
  IconProgress,
} from "@tabler/icons-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useStateContext } from "../../context/index";
import ReactMarkdown from "react-markdown";
import FileUploadModal from "./components/file-upload-modal";
import RecordDetailsHeader from "./components/record-details-header";
import { GoogleGenerativeAI } from "@google/generative-ai";
import AgentInsightWidget from "../../components/AgentInsightWidget";
import TutorialTrigger from "../../components/TutorialSystem/TutorialTrigger";
import InteractiveGuide from "../../components/TutorialSystem/InteractiveGuide";

// Import the component for displaying structured EHR data + CoPilot prompt
import PatientRecordViewer from "../../components/ehr/PatientRecordViewer";
import { useActivity } from "../../context/ActivityContext";
import { API_ROOT as API_BASE_URL } from '../../lib/apiConfig';

// console.log('VITE_API_ROOT from import.meta.env:', import.meta.env.VITE_API_ROOT);
// console.log('All import.meta.env variables:', JSON.stringify(import.meta.env, null, 2));

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

const SingleRecordDetails = () => {
  const { id: patientIdFromUrl } = useParams(); // Changed to destructure 'id' as per route definition
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state; 

  // --- State for Uploaded File Analysis & Kanban ---
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingKanban, setIsProcessingKanban] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(state?.analysisResult || ""); // Analysis result from uploaded file
  const [filename, setFilename] = useState("");
  const [filetype, setFileType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- State for Fetched Patient EHR Data ---
  const [patientData, setPatientData] = useState(null); // Structured EHR data from backend
  const [isLoadingEhr, setIsLoadingEhr] = useState(true); // Loading state for EHR data
  const [ehrError, setEhrError] = useState(null); // Error state for EHR data fetching

  const { updateRecord } = useStateContext(); // Context function (ensure this is available and working)

  // --- File Upload Modal Handlers ---
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log("Selected file:", selectedFile);
      setFileType(selectedFile.type);
      setFilename(selectedFile.name);
      setFile(selectedFile);
    }
  };

  // --- Base64 Helper ---
  const readFileAsBase64 = (fileToRead) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(fileToRead);
    });
  };

  // --- Gemini Call for Uploaded File Analysis ---
  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadSuccess(false);
    setAnalysisResult(""); // Clear previous analysis

    // Check if API Key is available (consider better error handling)
    if (!geminiApiKey) {
        console.error("Error: VITE_GEMINI_API_KEY is not set in environment variables.");
        setEhrError("Frontend API Key is missing."); // Use ehrError state for general errors?
        setUploading(false);
        return;
    }
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    try {
      const base64Data = await readFileAsBase64(file);
      const imageParts = [{ inlineData: { data: base64Data, mimeType: filetype } }];
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Ensure correct model
      const prompt = `You are an expert cancer and any disease diagnosis analyst. Use your knowledge base to analyze the provided image/document and give a detailed treatment plan. Make it readable, clear, and easy to understand in paragraphs.`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      setAnalysisResult(text);

      // Update record via context if documentID is available (e.g., from state)
      // The documentID might differ from the patientIdFromUrl
      const documentIdForUpdate = state?.id; // Get ID from navigation state if present
      if (documentIdForUpdate && updateRecord) {
         console.log(`Updating record ${documentIdForUpdate} with analysis result.`);
         await updateRecord({
            documentID: documentIdForUpdate,
            analysisResult: text,
            // kanbanRecords: "", // Reset Kanban? Decide on behavior
         });
      } else {
          console.warn("Cannot update record via context: documentID or updateRecord function missing.");
      }

      setUploadSuccess(true);
      setIsModalOpen(false);
      setFilename("");
      setFile(null);
      setFileType("");
    } catch (error) {
      console.error("Error uploading and analyzing file:", error);
      setUploadSuccess(false);
      // Display error to user?
    } finally {
      setUploading(false);
    }
  };

  // --- Gemini Call for Kanban Generation ---
  const processTreatmentPlan = async () => {
    if (!analysisResult) return;
    setIsProcessingKanban(true);

    if (!geminiApiKey) {
        console.error("Error: VITE_GEMINI_API_KEY is not set.");
        setIsProcessingKanban(false);
        return;
    }
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Ensure correct model

    const prompt = `Based on the following treatment plan analysis: \n${analysisResult}\n\n Create a Kanban board structure with columns: "Todo", "Work in progress", and "Done". Populate the 'tasks' array with actionable steps derived from the plan, assigning each task an 'id', the appropriate 'columnId' ('todo', 'doing', 'done'), and a concise 'content' description. Respond ONLY with the JSON structure, like this example:
{
  "columns": [
    { "id": "todo", "title": "Todo" },
    { "id": "doing", "title": "Work in progress" },
    { "id": "done", "title": "Done" }
  ],
  "tasks": [
    { "id": "1", "columnId": "todo", "content": "Schedule initial consultation" },
    { "id": "2", "columnId": "todo", "content": "Complete baseline blood tests" },
    { "id": "3", "columnId": "doing", "content": "Undergo first chemotherapy cycle" }
  ]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Basic cleaning attempt for JSON
        const text = response.text().replace(/^`{3}json\s*|`{3}$/g, '').trim();
        console.log("Raw Kanban JSON Text:", text);
        const parsedResponse = JSON.parse(text);
        console.log("Parsed Kanban JSON:", parsedResponse);

        const documentIdForUpdate = state?.id;
        if (documentIdForUpdate && updateRecord) {
            console.log(`Updating record ${documentIdForUpdate} with Kanban data.`);
            await updateRecord({
                documentID: documentIdForUpdate,
                kanbanRecords: text, // Store the raw JSON string
            });
        } else {
             console.warn("Cannot update record via context: documentID or updateRecord function missing.");
        }

        navigate("/screening-schedules", { state: parsedResponse }); // Navigate with parsed data
    } catch(error) {
        console.error("Error processing treatment plan into Kanban:", error);
         // Display error to user?
    } finally {
        setIsProcessingKanban(false);
    }
  };

  // --- Effect for Fetching Patient EHR Data ---
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientIdFromUrl) {
        setEhrError("No patient ID specified in the URL.");
        setIsLoadingEhr(false);
        setPatientData(null); 
        return;
      }

      setIsLoadingEhr(true);
      setEhrError(null);
      setPatientData(null); 
      console.log(`Fetching EHR data for patient ID: ${patientIdFromUrl}`);

      try {
        const response = await fetch(`${API_BASE_URL}/api/patients/${patientIdFromUrl}`); // Use environment variable
        if (!response.ok) {
          let errorDetail = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
          } catch (e) { 
            // Ignore 
          }
          throw new Error(errorDetail);
        }
        
        const result = await response.json(); 
        console.log("Fetched patient EHR data (raw response):", result);

        if (result.success && result.data) {
          const formattedPatientData = {
            ...result.data,
            patientId: result.data.id
          };
          setPatientData(formattedPatientData); 
          console.log("Processed patient EHR data for PatientRecordViewer:", formattedPatientData);
        } else if (result.error && result.error === "Patient not found") { 
          setPatientData(null);
          throw new Error("Patient EHR data not found for this ID.");
        } else if (!result.success && result.message) {
          setPatientData(null);
          throw new Error(result.message);
        } else { 
          setPatientData(null);
          throw new Error("Patient data not found or response format is invalid.");
        }
      } catch (fetchError) {
        const urlBeingFetched = `${API_BASE_URL}/api/patients/${patientIdFromUrl}`;
        console.error(`Error fetching patient EHR data from ${urlBeingFetched}:`, fetchError);
        let detailedErrorMessage = fetchError.message || "Failed to load patient EHR record.";
        if (fetchError.message && (fetchError.message.toLowerCase().includes("unexpected token") || fetchError.message.toLowerCase().includes("not valid json"))) {
            detailedErrorMessage = `Failed to parse JSON response from ${urlBeingFetched}. The server may have returned HTML or an invalid JSON format instead of the expected EHR data. Original error: ${fetchError.message}`;
        }
        setEhrError(detailedErrorMessage);
        setPatientData(null); 
      } finally {
        setIsLoadingEhr(false);
      }
    };

    fetchPatientData();
  }, [patientIdFromUrl, API_BASE_URL]); // Use API_BASE_URL in dependency array

  // Tutorial state
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  // Check if user needs workflow guidance
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('patient_record_workflow_completed');
    if (!hasSeenGuide) {
      setShowWorkflowGuide(true);
    }
  }, []);

  // Workflow steps for the patient record
  const workflowSteps = [
    {
      title: "Review AI Insights",
      description: "Start by reviewing the AI-generated insights at the top of the page."
    },
    {
      title: "Examine Patient Data", 
      description: "Review demographics, diagnosis, and current treatment information."
    },
    {
      title: "Explore Research Options",
      description: "Use the Research Portal to find relevant clinical trials."
    },
    {
      title: "Analyze Mutations",
      description: "Check the Mutation Explorer for genomic analysis and recommendations."
    },
    {
      title: "Manage Follow-ups",
      description: "Review and create follow-up tasks for comprehensive care."
    }
  ];

  // --- Rendering Logic ---

  return (
    <div className="container mx-auto p-6 min-h-screen">
      {/* Enhanced Header with Tutorial Features */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded">
          &larr; Back
        </button>
        
        <div className="flex items-center space-x-4">
          <InteractiveGuide.Hint 
            text="Toggle workflow guidance to see step-by-step instructions for patient analysis"
            position="left"
          >
            <button
              onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {showWorkflowGuide ? 'Hide Workflow' : 'Show Workflow Guide'}
            </button>
          </InteractiveGuide.Hint>
        </div>
      </div>

      {/* Workflow Guide */}
      {showWorkflowGuide && (
        <div className="mb-6">
          <InteractiveGuide.Flow
            title="Patient Analysis Workflow"
            steps={workflowSteps}
            currentStep={0}
            onStepComplete={(stepIndex) => {
              if (stepIndex === workflowSteps.length - 1) {
                localStorage.setItem('patient_record_workflow_completed', 'true');
                setShowWorkflowGuide(false);
              }
            }}
          />
        </div>
      )}

      {/* AI Insights with Enhanced Tooltips */}
      <InteractiveGuide.Hint 
        text="This widget shows AI-generated insights specific to this patient, including clinical trial matches and treatment recommendations"
        position="bottom"
        persistent={false}
      >
        <AgentInsightWidget patientId={patientIdFromUrl} />
      </InteractiveGuide.Hint>

      {/* Patient Demographics with Hints */}
      <InteractiveGuide.Hint 
        text="Patient demographics and key medical information. This data is used by AI agents for personalized analysis"
        position="right"
      >
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Information</h2>
          {/* ... existing demographics content ... */}
        </div>
      </InteractiveGuide.Hint>

      {/* Enhanced Action Buttons */}
      <InteractiveGuide.Hint 
        text="These buttons provide quick access to specialized analysis tools. Start with Research Portal for clinical trials or Mutation Explorer for genomic analysis"
        position="bottom"
      >
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => navigate(`/medical-records/${patientIdFromUrl}/research`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            🔬 Research Portal
          </button>
          <button
            onClick={() => navigate(`/mutation-explorer/${patientIdFromUrl}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            🧬 Mutation Explorer
          </button>
          <button
            onClick={() => navigate(`/medical-records/${patientIdFromUrl}/tasks`)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            📋 Follow-up Tasks
          </button>
        </div>
      </InteractiveGuide.Hint>

      {/* Header and Buttons */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <RecordDetailsHeader recordName={state?.recordName || `Patient ID: ${patientIdFromUrl || 'N/A'}`} />
        <div className="flex gap-2">
          {/* Upload Report Button */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-x-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-[#13131a] dark:text-white dark:hover:bg-neutral-800"
          >
            <IconFileUpload />
            Upload & Analyze Report
          </button>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFileChange={handleFileChange}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        filename={filename}
      />

      {/* Analysis Result Section (from uploaded file) */}
      <div className="w-full">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            {patientIdFromUrl && (
              <p className="text-sm font-medium text-gray-700 mb-1">
                Patient ID: {patientIdFromUrl}
              </p>
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              Uploaded Report Analysis
            </h2>
            <p className="text-sm text-gray-600">
              AI analysis and treatment plan based on the uploaded document/image.
            </p>
          </div>
          <div className="flex w-full flex-col px-6 py-4 text-gray-800">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Analysis Result:
              </h3>
              <div className="prose prose-sm max-w-none"> {/* Added prose styling */}
                {analysisResult ? (
                  <ReactMarkdown>{analysisResult}</ReactMarkdown>
                ) : (
                  <p className="text-sm text-gray-500">
                    {uploading ? "Analyzing..." : "Upload a report to generate analysis."}
                  </p>
                )}
              </div>
            </div>
            {analysisResult && !uploading && ( // Show button only if analysis is done and not currently uploading
              <div className="mt-5 grid gap-2 sm:flex">
                <button
                  type="button"
                  onClick={processTreatmentPlan}
                  disabled={processingKanban}
                  className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                >
                  Generate Treatment Tasks
                  <IconChevronRight size={20} />
                  {processingKanban && (
                    <IconProgress size={20} className="animate-spin" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-6 border-gray-300 dark:border-neutral-700" />

      {/* EHR Data Viewer and CoPilot Section */}
      <div className="w-full">
         <h2 className="text-xl font-semibold text-black-800 dark:text-black-200 mb-4">
            EHR Record & CoPilot
         </h2>
         {isLoadingEhr ? (
             <div className="p-4 text-center">Loading EHR data...</div>
         ) : ehrError ? (
             <div className="p-4 text-center text-red-600">Error loading EHR data: {ehrError}</div>
         ) : patientData ? (
             <>
               <PatientRecordViewer patientData={patientData} />
             </>
         ) : (
             <div className="p-4 text-center text-gray-500">EHR data not available for this patient.</div>
         )}
      </div>

      {/* Tutorial Trigger for Patient Records */}
      <TutorialTrigger 
        tutorialType="patientRecord"
        showOnFirstVisit={true}
        position="bottom-right"
      />
    </div>
  );
};

export default SingleRecordDetails;
