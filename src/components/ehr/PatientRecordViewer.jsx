import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import useWebSocket from '../../hooks/useWebSocket'; // Adjusted path
import ConsultationPanel from '../collaboration/ConsultationPanel'; // Adjusted path
import { v4 as uuidv4 } from "uuid";
import { useActivity, ACTIVITY_TYPES } from "../../context/ActivityContext";
import { useStateContext } from "../../context"; // Import useStateContext
import { IconChevronDown, IconChevronUp, IconSend, IconPaperclip, IconMicrophone, IconPlayerStop, IconSettings, IconInfoCircle, IconUsers, IconNotes, IconStethoscope, IconListCheck, IconFlask, IconZoomQuestion, IconActivity, IconLock, IconUserCircle, IconMessageChatbot, IconReportMedical, IconArrowBackUp, IconX, IconTrash, IconEdit, IconCopy, IconFileText, IconFileSearch, IconFileCode2, IconBrain, IconSparkles, IconThumbUp, IconThumbDown, IconPlus, IconDotsVertical, IconAlertTriangle, IconExternalLink, IconLoader, IconChecks, IconCircleDotted, IconTargetArrow, IconWashMachine, IconTestPipe, IconFilter } from "@tabler/icons-react";

// Helper function to format dates (optional, basic implementation)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // Attempt to create a date object. Handle ISO strings and potentially other formats.
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing failed
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return dateString; // Return original if formatting fails
  }
};

// --- Helper Component to Render Included Info in Joining View ---
const RenderIncludedInfo = ({ relatedInfo }) => {
  if (!relatedInfo || Object.keys(relatedInfo).length === 0) {
    return <p className="text-xs italic text-gray-500 mt-2">No specific data sections were included by the initiator.</p>;
  }

  return (
    <div className="space-y-3 mt-2">
      {Object.entries(relatedInfo).map(([key, data]) => {
        // Handle potential empty data sections
        if (!data || (Array.isArray(data) && data.length === 0)) {
             return (
                <div key={key} className="mb-2 pb-2 border-b last:border-b-0">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">{key}</h4>
                    <p className="text-xs text-gray-500 italic pl-2">None included or available.</p>
                </div>
            );
        }

        return (
          <div key={key} className="mb-2 pb-2 border-b last:border-b-0">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">{key}</h4>
            <div className="pl-2 text-xs space-y-1">
              {/* --- Specific Rendering based on Key --- */}
              
              {key === 'Recent Labs' && Array.isArray(data) && data.map((panel, pIndex) => (
                 <div key={`panel-${pIndex}`} className="mb-1">
                     <p className="font-medium text-gray-600">{panel.panelName || 'Lab Panel'} ({formatDate(panel.resultDate)})</p>
                     <ul className="list-disc list-inside ml-2">
                         {panel.components?.map((comp, cIndex) => (
                            <li key={`comp-${cIndex}`}>
                               {comp.test}: {comp.value} {comp.unit} {comp.flag && comp.flag !== 'Normal' ? <span className='text-red-600 font-semibold'>({comp.flag})</span> : ''}
                            </li>
                         ))}
                     </ul>
                 </div>
              ))}

              {key === 'Current Treatments/Medications' && Array.isArray(data) && data.map((med, mIndex) => (
                 <p key={`med-${mIndex}`}>{med.name} {med.dosage} - {med.frequency}</p>
              ))}

              {key === 'Medical History' && Array.isArray(data) && data.map((item, hIndex) => (
                  // Handle both string history items and potential object structure
                  <p key={`hist-${hIndex}`}>
                      {typeof item === 'string' ? item : 
                      (item.condition ? `${item.condition} (Diagnosed: ${formatDate(item.diagnosisDate)})` : JSON.stringify(item))}
                  </p>
              ))}

              {key === 'Recent Notes' && Array.isArray(data) && data.map((note, nIndex) => (
                 <div key={`note-${nIndex}`} className="border-t first:border-t-0 pt-1 mt-1">
                    <p className="font-medium text-gray-600">{formatDate(note.date)} - {note.author || note.author}</p>
                    <p className="italic text-gray-700 whitespace-pre-wrap">"{note.content || note.text || 'No content.'}"</p>
                 </div>
              ))}

              {key === 'Diagnosis' && typeof data === 'object' && data !== null && (
                 <div>
                    <p><strong>Primary:</strong> {data.primary || data.condition || 'N/A'}</p>
                    <p><strong>Date:</strong> {formatDate(data.diagnosedDate || data.diagnosisDate)}</p>
                    <p><strong>Status:</strong> {data.status || 'N/A'}</p>
                 </div>
              )}
              
               {/* Add more specific renderers for other keys if needed (e.g., Allergies, Imaging) */}
               {/* Fallback for unhandled data types/keys */}
               {!['Recent Labs', 'Current Treatments/Medications', 'Medical History', 'Recent Notes', 'Diagnosis'].includes(key) && (
                    <pre className="text-xs whitespace-pre-wrap bg-gray-100 p-1 rounded">{JSON.stringify(data, null, 1)}</pre>
               )}

            </div>
          </div>
        );
      })}
    </div>
  );
};

const PatientRecordViewer = ({ patientData: initialPatientData }) => {
  console.log("[PatientRecordViewer] Rendering..."); // <-- Log 1: Check if component renders
  const { setCurrentPatientId, addActivity } = useActivity(); // <-- Get context functions
  const { currentUser, mainWsUrl: contextMainWsUrl } = useStateContext(); // Get mainWsUrl from context
  
  // State for Prompt Interaction
  const [promptText, setPromptText] = useState("");
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [promptResult, setPromptResult] = useState(null);
  const [promptError, setPromptError] = useState(null);
  const [activeActionTab, setActiveActionTab] = useState(null);
  const [showDeepDiveButton, setShowDeepDiveButton] = useState(false);
  const [activeAgentMessage, setActiveAgentMessage] = useState(null);
  const [suggestionChips, setSuggestionChips] = useState([]); // <-- New state for suggestion chips
  const [expandedSections, setExpandedSections] = useState({}); // <-- State for collapsible sections
  const [deepDiveTriggerText, setDeepDiveTriggerText] = useState(null); // <-- State for specific insight context
  const [initiatorNoteAnalysisResult, setInitiatorNoteAnalysisResult] = useState(null); // <-- State for initiator note analysis
  const [isAnalyzingNote, setIsAnalyzingNote] = useState(false); // <-- Loading state for note analysis
  const [isCoPilotActionsVisible, setIsCoPilotActionsVisible] = useState(true); // <-- New state for toggling CoPilot Actions panel
  
  // --- State for Consultation Panel ---
  const [isConsultPanelOpen, setIsConsultPanelOpen] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState(null); // { roomId, participants, initialContext }
  const [incomingConsultRequest, setIncomingConsultRequest] = useState(null); // Store request details { roomId, patientId, initiator, context }
  const [isJoiningConsult, setIsJoiningConsult] = useState(false);
  
  // --- State for Consultation Initiation Options (Revised for Modal Flow) ---
  const [showConsultOptionsModal, setShowConsultOptionsModal] = useState(false);
  const [consultTargetUser, setConsultTargetUser] = useState(null);
  const [consultTopic, setConsultTopic] = useState("");
  const [consultUseAI, setConsultUseAI] = useState(true);
  const [consultIncludeOptions, setConsultIncludeOptions] = useState({ // Data sections to include
    includeLabs: true,
    includeMeds: true,
    includeHistory: false,
    includeNotes: false, 
    includeDiagnosis: true,
  });
  const [consultInitiatorNote, setConsultInitiatorNote] = useState("");
  
  // --- State for Highlighting Sections --- 
  const [highlightSections, setHighlightSections] = useState(null); // Stores { includeLabs: true, ... } or null
  
  // --- Determine Current User (for testing purposes) ---
  // Check for userId query parameter to simulate different users
  const queryParams = new URLSearchParams(window.location.search);
  const queryUserId = queryParams.get('userId');
  
  console.log("[PatientRecordViewer] Current simulated user:", currentUser?.id);

  // --- WebSocket Setup (Main connection for patient context/notifications) ---
  const patientId = initialPatientData?.patientId; 
  console.log("[PatientRecordViewer] patientId from initialPatientData:", patientId);
  console.log("[PatientRecordViewer] mainWsUrl from context:", contextMainWsUrl);

  // Construct the WebSocket URL using the context-provided URL and patientId
  // Only establish if both are present.
  const wsUrlForHook = patientId && contextMainWsUrl ? `${contextMainWsUrl}/${patientId}` : null;
  // If your backend /ws endpoint itself handles different rooms based on a patientId sent in an auth/join message,
  // then wsUrlForHook would just be contextMainWsUrl, and patientId is passed as the roomToJoin parameter to useWebSocket.
  // The current useWebSocket seems to use the third argument `roomToJoin` for this, so let's stick to that.
  // The backend endpoint is /ws, so the room/patientId should be handled by messages.
  
  const mainAuthToken = currentUser ? `valid_token_${currentUser.id}` : null; 

  console.log("[PatientRecordViewer] Effective wsUrl for useWebSocket:", contextMainWsUrl);
  console.log("[PatientRecordViewer] Effective authToken for useWebSocket:", mainAuthToken);
  console.log("[PatientRecordViewer] Effective roomToJoin for useWebSocket:", patientId);
  
  const {
    isConnected: isMainWsConnected, 
    lastMessage: lastMainWsMessage, 
    sendMessage: sendMainWsMessage,
    error: mainWsError,
    readyState: mainWsReadyState
  } = useWebSocket(contextMainWsUrl, mainAuthToken, patientId); // Pass contextMainWsUrl and patientId as room

  // --- Effect to handle incoming MAIN WebSocket messages (e.g., notifications) ---
  useEffect(() => {
    if (!lastMainWsMessage) {
      return; // Do nothing if no message
    }

    console.log("Main WS message received in PatientViewer (useEffect for agent_command debugging):", lastMainWsMessage);
      const { type, message, result, error, roomId, patientId: reqPatientId, initiator, context } = lastMainWsMessage;
      
    let shouldResetProcessing = false;
    let newPromptResult = null;
    let newPromptError = null;

    // --- Temporarily focusing only on agent_command responses ---

    if (lastMainWsMessage && lastMainWsMessage.command && lastMainWsMessage.status) { // RE-ENABLING THIS BLOCK
      console.log(`Received agent command result for command: ${lastMainWsMessage.command}, status: ${lastMainWsMessage.status}`);
      const agentDirectContent = lastMainWsMessage.content || {}; 

      let actualAgentPayload;
      // Check if agentDirectContent.output is the actual payload
      if (agentDirectContent.hasOwnProperty('output') && 
          typeof agentDirectContent.output === 'object' && 
          agentDirectContent.output !== null && 
          !(Array.isArray(agentDirectContent.output) && agentDirectContent.output.length === 0 && Object.keys(agentDirectContent).length > 1) // Avoid if .output is empty array but other keys exist
          ) {
        actualAgentPayload = agentDirectContent.output;
        console.log("[PayloadDebug] Using agentDirectContent.output as actualAgentPayload:", actualAgentPayload);
      } 
      // Else, check if agentDirectContent itself is a non-empty object and seems like the payload
      else if (typeof agentDirectContent === 'object' && 
               agentDirectContent !== null && 
               Object.keys(agentDirectContent).length > 0 &&
               // Avoid using agentDirectContent if it only contains a simple status/message and no real data
               !(Object.keys(agentDirectContent).length <= 2 && (agentDirectContent.hasOwnProperty('status') || agentDirectContent.hasOwnProperty('message')))
              ) {
        actualAgentPayload = agentDirectContent;
        console.log("[PayloadDebug] Using agentDirectContent itself as actualAgentPayload:", actualAgentPayload);
      } 
      // Fallback, especially if agentDirectContent might be a simple string or a basic status wrapper not caught above
      else {
        actualAgentPayload = agentDirectContent.output || agentDirectContent || {}; // Last resort, prefer .output, then content, then empty
        console.log("[PayloadDebug] Fallback: actualAgentPayload:", actualAgentPayload);
      }


      if (lastMainWsMessage.status === "success") {
          newPromptResult = {
              output: { 
                  output: actualAgentPayload, 
                  summary: agentDirectContent.summary || actualAgentPayload?.summary || `Command ${lastMainWsMessage.command} successful.`, 
              },
              status: "success",
              summary: agentDirectContent.summary || actualAgentPayload?.summary || `Command ${lastMainWsMessage.command} successful.`, 
              message: `Agent command ${lastMainWsMessage.command} completed.` 
          };
          
          if (lastMainWsMessage.command === "analyze_genomic_profile") {
              addActivity(ACTIVITY_TYPES.GENOMIC_ANALYSIS_SUCCESS, "Genomic profile analysis complete (via agent_command)", { patient: patientId, summary: actualAgentPayload?.analysis_summary });
          }
      } else { 
          newPromptError = lastMainWsMessage.error || actualAgentPayload?.error_details || agentDirectContent?.error_details || `Agent command ${lastMainWsMessage.command} failed.`;
          if (lastMainWsMessage.command === "analyze_genomic_profile") {
               addActivity(ACTIVITY_TYPES.GENOMIC_ANALYSIS_ERROR, "Genomic profile analysis failed (via agent_command)", { patient: patientId, error: newPromptError });
          }
      }
      console.log(">>> AGENT_COMMAND: Setting shouldResetProcessing to true"); 
      shouldResetProcessing = true;
    } 
    // --- Other message types (prompt_result, consult_request, etc.) are still bypassed for now ---
    // RE-ENABLING 'prompt_result' block
    else if (type === 'prompt_result') {
      console.log("Backend prompt_result details (raw message):", JSON.stringify(lastMainWsMessage, null, 2));

      const agentRawResult = lastMainWsMessage.result || {}; // This is like { status: 'success', output: { agent_specific_fields }, summary: 'Agent summary' }
      const agentSpecificOutput = agentRawResult.output || {};   // This is the { agent_specific_fields } part
      const agentSummary = agentRawResult.summary || null;       // This is the 'Agent summary' part

      const backendStatus = lastMainWsMessage?.status || 'unknown';
      const hasErrorsInOutput = agentSpecificOutput?.errors && agentSpecificOutput.errors.length > 0; // Check errors in specific output
      const isBackendSuccess = ['success', 'met', 'completed'].includes(backendStatus?.toLowerCase());
      const derivedStatus = hasErrorsInOutput ? 'failure' : (isBackendSuccess ? 'success' : 'partial_success');

      newPromptResult = {
        output: { // This outer 'output' aligns with agent_command structure
            output: agentSpecificOutput,      // The agent's actual specific content (e.g., { simulated_send: true, message_draft: "..."})
            summary: agentSummary,            // Summary from the agent's perspective
            // message: agentRawResult.message || null // If there's a general message from the agent's result
        },
        status: derivedStatus, // Overall status for the UI
        summary: agentSummary || lastMainWsMessage.summary || null, // Top-level summary for UI display
        message: agentRawResult.message || lastMainWsMessage.message || null // Top-level message
      };
      console.log("Normalized newPromptResult for type 'prompt_result':", JSON.stringify(newPromptResult, null, 2));
      shouldResetProcessing = true;

      // Activity logging for prompt_result (original logic, using agentSpecificOutput for checks)
      if (agentSpecificOutput?.summary_text && !agentSpecificOutput?.deep_dive_sections) {
        addActivity(ACTIVITY_TYPES.SUMMARY_SUCCESS, "Initial clinical summary displayed", { patient: patientId });
        setShowDeepDiveButton(true); // Show button after initial summary
      } else if (agentSpecificOutput?.deep_dive_sections) {
        addActivity(ACTIVITY_TYPES.DEEP_DIVE_SUCCESS, "Deep dive summarization displayed", { patient: patientId });
        setShowDeepDiveButton(false); // Hide button after deep dive
      } else if (agentSpecificOutput?.answer_text) {
        addActivity(ACTIVITY_TYPES.AGENT_RESPONSE_SUCCESS, "Agent answer displayed", { patient: patientId });
      }
    }
    // --- UNCOMMENTED BLOCK START ---
    else if (type === 'error') { // This would be for WS errors, not agent errors
      console.error("Main WebSocket Error Received (from message):", lastMainWsMessage);
      newPromptError = `WebSocket Error: ${error || 'Unknown communication error.'}`;
      shouldResetProcessing = true; 
    } 
    else if (type === 'status') { // General status messages from WS (e.g., connected, info)
        console.log("Main WebSocket Status Update:", message);
        // Potentially update a status display area in UI, but not prompt/processing related.
    }
    // --- Consultation Flow Specific Messages ---
    else if (type === 'consult_request') {
        console.log(`Incoming consultation request for patient ${reqPatientId} from ${initiator?.name} in room ${roomId}`);
        // Only show if this user is the target and not the initiator
        if (currentUser?.id !== initiator?.id && reqPatientId === patientId) {
            setIncomingConsultRequest({ roomId, patientId: reqPatientId, initiator, context });
            addActivity(ACTIVITY_TYPES.CONSULTATION_REQUEST_RECEIVED, `Consultation request received from ${initiator?.name || 'colleague'} for patient ${reqPatientId}`, { patient: reqPatientId, initiator: initiator?.name });
        } else {
            console.log("Consult request ignored: either self-initiated or for a different patient.", { currentUserId: currentUser?.id, initiatorId: initiator?.id, reqPatientId, patientId });
        }
    }
    else if (type === 'initiate_ok') { // Initiator (Dr. A) gets this
        console.log(`Consultation room ${roomId} initiated successfully. Target: ${lastMainWsMessage.targetUserId}`);
        // Dr. A already optimistically opened the panel. This is just a confirmation.
        // Optionally, update UI to show "Waiting for Dr. B to join..."
        addActivity(ACTIVITY_TYPES.CONSULTATION_INITIATED, `Consultation initiated with ${lastMainWsMessage.targetUserName || 'colleague'} for patient ${patientId}`, { patient: patientId, targetUser: lastMainWsMessage.targetUserName });

    }
    else if (type === 'initiate_fail') { // Initiator (Dr. A) gets this
        console.error(`Failed to initiate consultation room ${roomId}: ${message}`);
        setPromptError(`Failed to initiate consultation: ${message}`);
        // Close the optimistic panel if it was opened
        if (currentConsultation && currentConsultation.roomId === roomId) {
            setCurrentConsultation(null);
            setIsConsultPanelOpen(false);
        }
        addActivity(ACTIVITY_TYPES.CONSULTATION_INITIATE_ERROR, `Failed to initiate consultation: ${message}`, { patient: patientId });
        shouldResetProcessing = true; // Reset general processing flags if needed
    }
    else if (type === 'consult_focus_generated') { // For Dr. B after joining, or Dr. A if AI runs for them
        console.log(`AI Focus statement received for room ${roomId}: `, lastMainWsMessage.focus_statement);
        if (currentConsultation && currentConsultation.roomId === roomId) {
            setCurrentConsultation(prev => ({
                ...prev,
                initialContext: {
                    ...prev.initialContext,
                    consultFocusStatement: lastMainWsMessage.focus_statement
                }
            }));
        }
    }
    else if (type === 'initiator_note_analysis_result') { // For Dr. B (or Dr. A if they re-analyze)
        console.log(`Initiator Note Analysis received for room ${roomId}: `, lastMainWsMessage.analysis);
        if (currentConsultation && currentConsultation.roomId === roomId) {
             // This state is directly used in the "Joining Consult" view
            setInitiatorNoteAnalysisResult(lastMainWsMessage.analysis);
            setIsAnalyzingNote(false); // Stop loading indicator
        }
    }
    // --- End Consultation Flow Specific Messages ---
    else {
      // Optional: Log unhandled message types that are not agent_command or status
      if (!(lastMainWsMessage && lastMainWsMessage.command && lastMainWsMessage.status)) { // Avoid double logging agent_command
         console.log("Unhandled WebSocket message type in main handler:", type, lastMainWsMessage);
      }
    }
    // --- UNCOMMENTED BLOCK END ---

    // --- Apply state updates if needed (RE-ENABLING THIS BLOCK) ---
    if (shouldResetProcessing) {
      setIsProcessingPrompt(false);
      setActiveAgentMessage(null);
    }
    if (newPromptResult) {
      // === TrialsDebug START ===
      if (lastMainWsMessage.command === "match_eligible_trials") {
        console.log("[TrialsDebug] newPromptResult for match_eligible_trials before set:", JSON.stringify(newPromptResult, null, 2));
      }
      // === TrialsDebug END ===
      setPromptResult(newPromptResult);
      setPromptError(null); 
    }
    if (newPromptError) {
      setPromptError(newPromptError);
      setPromptResult(null); 
      }
      
  }, [lastMainWsMessage, patientId, currentConsultation, addActivity]);
  
   // Effect to handle MAIN WebSocket connection errors
   useEffect(() => {
     if (mainWsError) {
       console.error("Main WebSocket Hook Error:", mainWsError);
       setPromptError(`Main Connection Error: ${mainWsError.message}`);
       setIsProcessingPrompt(false); 
     }
   }, [mainWsError]);

  // --- Effect for generating contextual suggestion chips ---
  useEffect(() => {
    const newChips = [];
    if (initialPatientData && promptResult?.output) {
      // Suggestion for EGFR Insights if EGFR mutation exists and Genomic Analysis ran
      const hasEgfrMutation = initialPatientData.mutations?.some(mut => mut.hugo_gene_symbol?.toUpperCase() === 'EGFR');
      if (hasEgfrMutation && promptResult.output.details && Array.isArray(promptResult.output.details)) {
        // Find the first genomic detail related to EGFR to link to
        const egfrDetailIndex = promptResult.output.details.findIndex(detail => detail.criterion_query?.toUpperCase().includes('EGFR'));
        if (egfrDetailIndex !== -1) {
          newChips.push({
            id: 'genomic_egfr_insight',
            text: "Explore EGFR Insights (from Genomic Analysis)",
            targetElementId: `genomic-detail-${egfrDetailIndex}`, 
            type: 'genomic'
          });
        }
      }

      // Suggestion for Integrative Wellness if "anxiety" in notes and Deep Dive ran
      const mentionsAnxiety = initialPatientData.notes?.some(note => note.text?.toLowerCase().includes('anxiety'));
      if (mentionsAnxiety && promptResult.output.deep_dive_sections && Array.isArray(promptResult.output.deep_dive_sections)) {
        const integrativeMedicineSectionIndex = promptResult.output.deep_dive_sections.findIndex(
          section => section.source === 'IntegrativeMedicineAgentMock'
        );
        if (integrativeMedicineSectionIndex !== -1) {
          newChips.push({
            id: 'integrative_wellness_anxiety',
            text: "Consider Integrative Wellness Plan (for anxiety)",
            targetElementId: `deep-dive-${integrativeMedicineSectionIndex}`,
            type: 'deep_dive'
          });
        }
      }
      // Add more suggestion logic here based on other patient data or agent results
    }
    setSuggestionChips(newChips);
  }, [initialPatientData, promptResult]); // Re-run when initialPatientData or promptResult changes

  // Set the patient ID in the context when data is available
  useEffect(() => {
    const currentId = initialPatientData?.patientId || null;
    console.log("[PatientRecordViewer] Setting patient context ID:", currentId); // <-- Log setting context
    setCurrentPatientId(currentId);
  }, [initialPatientData?.patientId, setCurrentPatientId]);

  // *** Add log to inspect state before render ***
  // console.log(">>> Before Render - promptResult.output:", JSON.stringify(promptResult?.output, null, 2));

  // Determine if the generic summary should be shown
  let shouldShowGenericSummary = false;
  if (promptResult && promptResult.summary) {
    // === TrialsDebug START ===
    console.log("[TrialsDebug] Calculating shouldShowGenericSummary. promptResult:", JSON.stringify(promptResult, null, 2));
    const outputNested = promptResult.output?.output; 
    console.log("[TrialsDebug] outputNested for shouldShowGenericSummary:", JSON.stringify(outputNested, null, 2));
    console.log("[TrialsDebug] outputNested?.trials_with_assessment:", JSON.stringify(outputNested?.trials_with_assessment, null, 2));
    console.log("[TrialsDebug] Array.isArray(outputNested?.trials_with_assessment):", Array.isArray(outputNested?.trials_with_assessment));
    // === TrialsDebug END ===

    shouldShowGenericSummary = 
      !outputNested?.summary_text &&
      !outputNested?.answer_text &&
      !outputNested?.simulated_send &&
      !outputNested?.available_slots &&
      !outputNested?.booked_slot &&
      !outputNested?.referral_letter_draft &&
      !outputNested?.lab_order_details &&
      !(outputNested?.potential_side_effects?.length > 0 || outputNested?.management_tips?.length > 0) &&
      !outputNested?.found_trials && // Check for old structure
      !outputNested?.trials_with_assessment && // Explicitly check for new structure
      !outputNested?.deep_dive_sections &&
      !outputNested?.analysis_summary; 
  }

  if (!initialPatientData) {
    return <div className="p-4 text-center text-gray-500">Loading patient data...</div>;
  }

  // Destructure for easier access, providing default empty objects/arrays
  const {
    demographics = {},
    diagnosis = {},
    medicalHistory = [],
    currentMedications = [],
    allergies = [],
    recentLabs = [],
    imagingStudies = [],
    patientGeneratedHealthData = null,
    notes = []
  } = initialPatientData;

  // --- New WebSocket Prompt Submission Handler ---
  // MODIFIED: Added messageType and commandDetails parameters
  const submitPromptViaWebSocket = (currentPromptOrCommand, details = {}) => {
    // <<< START DEBUG LOG >>>
    // <<< DEBUG LOG for Check Trial Eligibility >>>
    if (currentPromptOrCommand === "match_eligible_trials") {
      console.log(`[submitPromptViaWebSocket] Entered for command: ${currentPromptOrCommand}, details:`, JSON.stringify(details));
    }
    // <<< END DEBUG LOG >>>
    console.log(`[SubmitWS] Called with currentPromptOrCommand: '${currentPromptOrCommand}' (type: ${typeof currentPromptOrCommand}), details:`, JSON.stringify(details));
    // <<< END DEBUG LOG >>>

    const { messageType = "prompt", commandDetails = null, source = null } = details;

    if (!currentPromptOrCommand || !currentPromptOrCommand.trim()) { // Added check for null/undefined currentPromptOrCommand
      console.error("[SubmitWS] Error: currentPromptOrCommand is empty or invalid. Prompt not sent.", { currentPromptOrCommand });
      setPromptError("Cannot process empty prompt/command.");
       setActiveAgentMessage(null);
       return;
     }
     if (!isMainWsConnected) {
       setPromptError("WebSocket is not connected. Please wait or refresh.");
       console.error("Attempted to send prompt while WebSocket is not connected.");
       setActiveAgentMessage(null);
       return;
     }

     setIsProcessingPrompt(true);
     setPromptResult(null);
     setPromptError(null);
     
    // Set active agent message based on prompt or command
    const lowerCaseInput = currentPromptOrCommand.toLowerCase();
    if (messageType === "prompt") {
      if (lowerCaseInput.includes("generate a clinical summary")) {
        setActiveAgentMessage("AI Agents at work: Data Analyzer is generating an initial summary...");
        addActivity(ACTIVITY_TYPES.SUMMARY, "Initial clinical summary requested", { patient: patientId });
      } else if (lowerCaseInput.includes("perform a deep dive summarization")) {
        setActiveAgentMessage("AI Agents at work: Data Analyzer is performing a holistic analysis with insights from conceptual agents (Comparative Therapy, CRISPR, Integrative Medicine)...");
        addActivity(ACTIVITY_TYPES.DEEP_DIVE_REQUESTED, "Deep dive summarization requested", { patient: patientId });
      } else if (details && details.actionName) { // Check if details and actionName exist for prompts
        setActiveAgentMessage(`AI Agents at work: Processing ${details.actionName}...`);
        addActivity(ACTIVITY_TYPES.AGENT_ACTION_REQUESTED, `${details.actionName} requested`, { patient: patientId, action: details.actionName });
     } else {
        setActiveAgentMessage("AI Agents at work: Processing your request..."); // Default message
        addActivity(ACTIVITY_TYPES.AGENT_STATUS, "General prompt submitted", { patient: patientId, prompt: currentPromptOrCommand });
     }
    } else if (messageType === "agent_command") {
      // Specific handling for agent commands, e.g., "analyze_genomic_profile"
      if (currentPromptOrCommand === "analyze_genomic_profile") { // Check command name
        setActiveAgentMessage("AI Agents at work: Genomic Analyst is processing the patient\'s genomic profile...");
        addActivity(ACTIVITY_TYPES.GENOMIC_QUERY_SUBMITTED, "Genomic profile analysis requested", { patient: patientId, query: "Analyze genomic profile" });
      } else {
        setActiveAgentMessage(`AI Agents at work: Executing command ${currentPromptOrCommand}...`);
        addActivity(ACTIVITY_TYPES.AGENT_COMMAND_SENT, `Agent command ${currentPromptOrCommand} sent`, { patient: patientId, command: currentPromptOrCommand });
      }
    }

    console.log(`Sending message via WebSocket for patient ${patientId}:`, { type: messageType, content: currentPromptOrCommand, details: commandDetails });

     // Send message in the format expected by the backend WS endpoint
    let messageToSend = {};
    if (messageType === "prompt") {
      messageToSend = {
        type: "prompt",
        prompt: currentPromptOrCommand,
        // patientId: patientId, // patientId and roomId are usually added by useWebSocket or backend
        // roomId: patientId
      };
    } else if (messageType === "agent_command") {
      messageToSend = {
        type: "agent_command",
        command: currentPromptOrCommand, // The command name itself
        patientId: patientId, // Ensure patientId is sent for agent commands
        roomId: patientId,    // Ensure roomId is sent
        params: commandDetails || {}, // Additional parameters for the command
        sender: { userId: currentUser?.id, userName: currentUser?.name } // Example sender info
      };
    }
    sendMainWsMessage(messageToSend);

     // Note: We no longer handle the response directly here.
     // The useEffect hook listening to lastMainWsMessage will handle the result.
  };

  // Handler for the form submission - NOW USES WEBSOCKET
  const handlePromptFormSubmit = (e) => {
    e.preventDefault();
    // <<< START DEBUG LOG >>>
    console.log(`[FormSubmit] Triggered. Current promptText: '${promptText}'`, e);
    // <<< END DEBUG LOG >>>
    submitPromptViaWebSocket(promptText, { source: 'form_submission', messageType: "prompt" }); // Explicitly type: "prompt"
  };

  // Handler for the Quick Summary button - NOW USES WEBSOCKET
  const handleQuickSummaryClick = () => {
    submitPromptViaWebSocket("Generate a clinical summary", { source: 'quick_summary_button', messageType: "prompt" }); // Explicitly type: "prompt"
  }

  // Placeholder handler for future actions
  const handlePlaceholderAction = (actionName, event) => { // Add event parameter
    if (event) { // Stop propagation if event is passed
      event.stopPropagation();
    }
    // <<< DEBUG LOG for Check Trial Eligibility >>>
    if (actionName === 'Check Trial Eligibility') {
      console.log(`[handlePlaceholderAction] Clicked 'Check Trial Eligibility' for patient ${patientId}`);
    }
    // <<< END DEBUG LOG >>>
    console.log(`Action triggered: ${actionName} for patient ${patientId}`);
    
    let promptTextForAgent = "";
    let commandName = null; // For agent_command
    let commandDetails = {};   // For agent_command
    let useAgentCommand = false;

    switch(actionName) {
      case 'Notify PCP':
        promptTextForAgent = `Notify PCP about ${demographics.name}\'s ${diagnosis?.primary || 'condition'}`;
        // This will still be sent as a prompt for now, unless we map it to a NOTIFY command later
        break;
      // ... other non-command cases ...
      case 'Schedule Follow-up':
        promptTextForAgent = `Schedule a follow-up appointment for ${demographics.name} in 4 weeks`;
        commandName = "schedule"; // Matches constants.SCHEDULE
        commandDetails = { prompt: promptTextForAgent, original_action: actionName };
        useAgentCommand = true;
        break;
      case 'Draft Referral':
        promptTextForAgent = `Draft a referral to Oncology for ${demographics.name}`;
        commandName = "referral"; // Matches constants.REFERRAL
        commandDetails = { prompt: promptTextForAgent, original_action: actionName };
        useAgentCommand = true;
        break;
      // ... other non-command cases like 'Check Trial Eligibility', 'Review Side Effects', 'Check Interactions' will remain as prompts for now
      case 'Check Trial Eligibility':
        // promptTextForAgent = `Find clinical trials for ${demographics.name}\'s ${diagnosis?.primary || 'condition'}`;
        // The above was a generic prompt. Now we use an agent command for detailed matching.
        commandName = "match_eligible_trials"; // String fallback -  ENSURING THIS IS USED
        commandDetails = { 
          // patient_data will be added by the orchestrator if it fetches it based on patient_id.
          // However, ClinicalTrialAgent expects patient_data directly in its run method via run_params.
          // So, we should ideally pass it if available, or ensure orchestrator loads it for this agent.
          // For now, relying on orchestrator to load based on patient_id passed in messageToSend.
          // The orchestrator handler for MATCH_ELIGIBLE_TRIALS_COMMAND is set up to load current_patient_data.
        };
        useAgentCommand = true;
        break;
      case 'Review Side Effects':
        promptTextForAgent = `Review potential side effects of ${currentMedications?.[0]?.name || 'current medications'} for ${demographics.name}`;
        break;
      case 'Check Interactions':
        promptTextForAgent = `Check for medication interactions in ${demographics.name}\'s current regimen`;
        break;
      case 'Draft Lab Order': // Example: Keep as prompt for now
        promptTextForAgent = `Draft a lab order for ${demographics.name} to monitor ${diagnosis?.primary || 'their condition'}`;
        commandName = "draft_lab_order"; // Matches a new constant we'll define
        commandDetails = { prompt: promptTextForAgent, original_action: actionName };
        useAgentCommand = true;
        break;
      case 'Flag for Review': // Example: Keep as prompt for now
        promptTextForAgent = `Flag ${demographics.name}\'s case for review by the attending physician`;
        break;
      default:
        promptTextForAgent = `Process action: ${actionName} for ${demographics.name}`;
    }
    
    if (useAgentCommand) {
      // <<< DEBUG LOG for Check Trial Eligibility >>>
      if (commandName === "match_eligible_trials") {
        console.log(`[handlePlaceholderAction] About to call submitPromptViaWebSocket for command: ${commandName} with details:`, commandDetails);
      }
      // <<< END DEBUG LOG >>>
      submitPromptViaWebSocket(commandName, { 
        messageType: "agent_command", 
        commandDetails: commandDetails, 
        source: 'placeholder_action_button' 
      });
    } else {
      // Use the existing WebSocket mechanism to send the prompt for other actions
      submitPromptViaWebSocket(promptTextForAgent, { 
        messageType: "prompt", // Explicitly set for clarity
        actionName: actionName, 
        source: 'placeholder_action_button' 
      });
    }
  };

  // --- Consultation Initiation & Joining Logic (Revised Modal Flow) ---
  
  // Step 1: Show options modal when MAIN "Consult Colleague" is clicked
  // MODIFIED: Accept optional initialTopic, initialNote, and triggerText
  const handleInitiateConsultation = (targetParticipant, initialTopic = "Review patient case", initialNote = "", triggerText = null) => {
    console.log("Initiating consultation process with:", targetParticipant);
    // <<< ADD LOGGING HERE >>>
    console.log("[handleInitiateConsultation] Received context args:", { initialTopic, initialNote, triggerText });
    setConsultTargetUser(targetParticipant);
    setConsultTopic(initialTopic); // Use provided topic or default
    setConsultUseAI(true);
    setConsultIncludeOptions({ includeLabs: true, includeMeds: true, includeHistory: false, includeNotes: false, includeDiagnosis: true });
    setConsultInitiatorNote(initialNote); // Use provided note or default empty
    setDeepDiveTriggerText(triggerText); // Store the specific insight text
    setHighlightSections(null); // Clear any previous highlights when starting new consult
    setShowConsultOptionsModal(true);
  };

  // Step 2: Send the invitation from the modal with selected options
  const handleSendConsultInvitation = () => {
    if (!patientId || !isMainWsConnected || !consultTargetUser) {
        setPromptError("Cannot initiate consultation: Missing required info or connection.");
        setShowConsultOptionsModal(false);
        return;
    }
    // Add debug logging for current user
    console.log(">>> [PatientRecordViewer] Initiating consultation with:", {
        currentUser,
        consultTargetUser,
        patientId
    });
    
    const roomId = `consult_${patientId}_${uuidv4()}`;
    const initiationPayload = {
        type: 'initiate_consult',
        targetUserId: consultTargetUser.id,
        patientId: patientId,
        initiator: currentUser,
        roomId: roomId,
        context: { // This is the object that becomes initialContext for Dr. B
            initialTrigger: { description: consultTopic || "General Consultation" }, 
            includeOptions: consultIncludeOptions,
            useAI: consultUseAI,
            initiatorNote: consultInitiatorNote || null,
            triggeringInsightText: deepDiveTriggerText || null, // <-- Add the specific insight text
            patient_data: initialPatientData // <<< THIS IS THE KEY FIELD from previous edit
        }
    };

    // <<< ADDED LOGGING HERE >>>
    console.log(">>> [PatientRecordViewer DR_A SENDING] Full patientData object being included:", JSON.stringify(initialPatientData, null, 2));
    console.log(">>> [PatientRecordViewer DR_A SENDING] Full initiationPayload.context being sent:", JSON.stringify(initiationPayload.context, null, 2));

    sendMainWsMessage(initiationPayload);
    
    // Optimistically open the panel for the initiator (Dr. A)
    // Dr. A's panel will use this initialContext locally.
    setCurrentConsultation({
      roomId: roomId,
      participants: [consultTargetUser],
      initialContext: { 
          ...initiationPayload.context, // This includes patient_data: initialPatientData for Dr. A
          description: `Consultation regarding: ${consultTopic || 'General Consultation'}` 
      }
    });
    setIsConsultPanelOpen(true);
    setShowConsultOptionsModal(false);
    // Reset consult options form states after sending
    // setConsultTargetUser(null); // Keep target user if you want to show who was invited
    setConsultTopic('');
    setConsultUseAI(true);
    setConsultIncludeOptions({ includeLabs: true, includeMeds: true, includeHistory: false, includeNotes: false, includeDiagnosis: true });
    setConsultInitiatorNote('');
    setDeepDiveTriggerText(null); 
  };

  // Step 3: Close the modal without sending
  const handleCloseConsultOptionsModal = () => {
      setShowConsultOptionsModal(false);
      setConsultTargetUser(null);
    setConsultTopic('');
    setConsultUseAI(true);
    setConsultIncludeOptions({ includeLabs: true, includeMeds: true, includeHistory: false, includeNotes: false, includeDiagnosis: true });
    setConsultInitiatorNote('');
    setDeepDiveTriggerText(null); // Reset trigger text
    setInitiatorNoteAnalysisResult(null); // Reset note analysis
    setIsAnalyzingNote(false); // Reset analysis loading state
  };
  
  // handleJoinConsultation, handleCloseConsultation, handleViewFullRecord (as before)
  const handleJoinConsultation = () => {
      if (!incomingConsultRequest) return;
      console.log(`Joining consultation room: ${incomingConsultRequest.roomId}`);
      console.log("[PatientViewer] Setting consultation context:", incomingConsultRequest.context);
      setCurrentConsultation({
          roomId: incomingConsultRequest.roomId,
          participants: [incomingConsultRequest.initiator], 
          initialContext: incomingConsultRequest.context // Pass the full context object
      });
      setIsConsultPanelOpen(true);
      setIsJoiningConsult(true); 
      setIncomingConsultRequest(null); 
  };
  const handleCloseConsultation = () => {
    console.log("Closing active consultation panel and leaving room:", currentConsultation?.roomId);
    // if (mainWebSocket && currentConsultation) { // Commente out to fix ReferenceError
        // Optionally send a 'leave' message if your backend handles it
        // mainWebSocket.send(JSON.stringify({ type: 'leave', roomId: currentConsultation.roomId }));
    // }
      setCurrentConsultation(null);
      setIsJoiningConsult(false);
    setDeepDiveTriggerText(null); // Also reset trigger text here
    setInitiatorNoteAnalysisResult(null); // Reset note analysis
    setIsAnalyzingNote(false); // Reset analysis loading state
  };
  const handleViewFullRecord = () => {
      // Persist the include options for highlighting
      if (currentConsultation?.initialContext?.includeOptions) {
          console.log("Setting highlight sections:", currentConsultation.initialContext.includeOptions);
          setHighlightSections(currentConsultation.initialContext.includeOptions);
      } else {
           console.log("Clearing highlight sections (no options found).");
           setHighlightSections(null); // Clear if no options found
      }
      setIsJoiningConsult(false); // Switch view
  };

  // --- New Handler to Request Initiator Note Analysis ---
  const handleAnalyzeInitiatorNote = () => {
    if (!isMainWsConnected || !currentConsultation?.roomId || !currentConsultation.initialContext?.initiatorNote) {
      setInitiatorNoteAnalysisResult("Cannot analyze: Missing connection, room ID, or note text.");
      return;
    }
    setIsAnalyzingNote(true);
    setInitiatorNoteAnalysisResult(null); // Clear previous result
    sendMainWsMessage({
      type: "analyze_initiator_note",
      roomId: currentConsultation.roomId,
      note_text: currentConsultation.initialContext.initiatorNote,
      sender: currentUser // Optional: Pass who is requesting
    });
  };

  // --- Render Consultation Options Modal (Defined here) ---
  const renderConsultOptionsModal = () => {
    if (!showConsultOptionsModal || !consultTargetUser) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
          <h3 className="text-xl font-semibold mb-4">Initiate Consultation with {consultTargetUser.name}</h3>
          {/* Topic Input */}
          <div className="mb-4">
             <label htmlFor="consultTopic" className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Topic/Reason:
            </label>
             <input
              type="text"
              id="consultTopic"
              value={consultTopic}
              onChange={(e) => setConsultTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Review recent labs, Discuss treatment options"
            />
          </div>
           {/* Include Data Sections Checkboxes */}
           <div className="mb-4 border p-3 rounded border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-2">Include in shared context:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.keys(consultIncludeOptions).map((key) => (
                  <label key={key} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={consultIncludeOptions[key]}
                      onChange={(e) => setConsultIncludeOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="form-checkbox h-4 w-4 text-indigo-600 rounded mr-2"
                    />
                    {key.replace('include', '')}
                  </label>
                ))}
              </div>
            </div>
          {/* AI Toggle */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consultUseAI}
                onChange={(e) => setConsultUseAI(e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600 rounded"
              />
              <span className="ml-2 text-gray-700">Enable AI Assistance (Generate Focus Statement)</span>
            </label>
          </div>
          {/* Initiator Note */}
          <div className="mb-4">
            <label htmlFor="initiatorNote" className="block text-sm font-medium text-gray-700 mb-1">
              Add a note (optional):
            </label>
            <textarea
              id="initiatorNote"
              rows="3"
              value={consultInitiatorNote}
              onChange={(e) => setConsultInitiatorNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 'Concerned about potential nephrotoxicity...'"
            ></textarea>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCloseConsultOptionsModal}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSendConsultInvitation}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
              disabled={!isMainWsConnected}
              title={!isMainWsConnected ? "WebSocket disconnected" : "Send consultation invitation"}
            >
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render Logic ---
  const commonHeader = (
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-indigo-700">Patient Record: {demographics.name || 'N/A'} ({patientId})</h2>
        {/* Ensure button is shown correctly and calls the right handler */} 
        {!isJoiningConsult && !showConsultOptionsModal && ( 
             <button 
                onClick={() => handleInitiateConsultation(
                    { id: 'dr_b', name: 'Dr. Baker (PCP)' } // Just pass the target user
                )}
                disabled={!patientId || !isMainWsConnected} 
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${!patientId || !isMainWsConnected ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                title={patientId && isMainWsConnected ? "Start a real-time consultation with a colleague" : "Cannot consult (missing patient data or disconnected)"}
              >
                Consult Colleague
              </button>
        )}
      </div>
  );

  // --- Conditional Rendering Based on View Mode ---

  if (isJoiningConsult && currentConsultation) {
    // --- RENDER SIMPLIFIED "JOINING CONSULT" VIEW --- 
    return (
      <div className="max-w-7xl mx-auto p-4 bg-gray-100 rounded-lg shadow space-y-4 relative">
         {/* Notification Area */} 
         {incomingConsultRequest && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-lg w-3/4">
                    <strong className="font-bold">Consult Request!</strong>
                    <span className="block sm:inline ml-2">
                        {incomingConsultRequest.initiator?.name || 'A colleague'} wants to consult about Patient {incomingConsultRequest.patientId} regarding "{incomingConsultRequest.context?.description || 'General'}".
                    </span>
                    <button 
                        onClick={handleJoinConsultation}
                        className="ml-4 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold"
                    >
                        Accept & Join
                    </button>
                    <button 
                        onClick={() => setIncomingConsultRequest(null)}
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                        Dismiss
                    </button>
                </div>
            )}
            
            {commonHeader}
            
            {/* Focused Context Area - Updated to show related items */} 
            <section className="p-4 bg-white rounded shadow border border-indigo-200 space-y-3">
                <h3 className="text-lg font-semibold text-indigo-600">Consultation Context</h3>
                <div>
                    <p className="text-sm text-gray-700">
                        Initiated by: {currentConsultation.participants[0]?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-800 font-medium mt-1">
                        Initial Topic: {currentConsultation.initialContext?.description || 'General Consultation'}
                    </p>
                    {/* Display Initiator's Note if provided */}
                    {currentConsultation.initialContext?.initiatorNote && (
                        <div className="mt-2 border-t pt-2">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-semibold text-gray-700">Initiator's Note:</p>
                                <button
                                    onClick={handleAnalyzeInitiatorNote}
                                    disabled={isAnalyzingNote || !currentConsultation.initialContext?.initiatorNote}
                                    className="px-2 py-0.5 text-xs bg-sky-500 text-white rounded hover:bg-sky-600 disabled:bg-gray-300 transition-colors"
                                >
                                    {isAnalyzingNote ? 'Analyzing...' : 'AI Analyze Note'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-800 whitespace-pre-wrap italic bg-gray-50 p-2 rounded">
                                "{currentConsultation.initialContext.initiatorNote}"
                            </p>
                            {/* --- Display AI Analysis of Initiator's Note --- */}
                            {initiatorNoteAnalysisResult && (
                                <div className="mt-2 p-2 border-t border-dashed border-sky-300 bg-sky-50 rounded">
                                    <h5 className="text-xs font-semibold text-sky-700 mb-1">AI Analysis of Initiator's Note:</h5>
                                    <p className="text-xs text-sky-800 whitespace-pre-wrap">
                                        {initiatorNoteAnalysisResult}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* --- Display AI Consult Focus --- */}
                {currentConsultation.initialContext?.consultFocusStatement && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-semibold text-blue-800 mb-1">AI Generated Consult Focus:</p>
                        <p className="text-sm text-blue-900 whitespace-pre-wrap"> 
                            {currentConsultation.initialContext.consultFocusStatement}
                        </p>
                    </div>
                )}
                {/* --- End AI Consult Focus --- */}
                
                {/* Display Included Related Info - USE HELPER COMPONENT */}
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                   <p className="text-sm font-medium text-gray-600 mb-1">Included Information Sent by Initiator:</p>
                   <RenderIncludedInfo relatedInfo={currentConsultation.initialContext?.relatedInfo} /> 
                </div>
                {/* --- Display Triggering Deep Dive Insight --- */}
                {currentConsultation.initialContext?.triggeringInsightText && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Specific Insight Triggering Consult:</p>
                        <p className="text-xs text-yellow-900 whitespace-pre-wrap italic bg-white p-2 rounded"> 
                            "{currentConsultation.initialContext.triggeringInsightText}"
                        </p>
                    </div>
                )}
            </section>
            
            {/* Consultation Panel takes main space */} 
            <section className="flex justify-center"> {/* Center the panel */} 
                <ConsultationPanel 
                   patientId={patientId}
                   consultationRoomId={currentConsultation.roomId}
                   currentUser={currentUser}
                   participants={currentConsultation.participants}
                   initialContext={currentConsultation.initialContext}
                   onClose={handleCloseConsultation}
                 />
            </section>
            
            {/* Button to switch back */} 
            <div className="text-center mt-4">
                <button 
                   onClick={handleViewFullRecord}
                   className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200 transition-colors"
                >
                    View Full Patient Record
                </button>
            </div>
         </div>
       );
   } else {
       // --- RENDER FULL PATIENT RECORD VIEW (Original Layout) --- 
       return (
         <div className="max-w-7xl mx-auto p-4 bg-gray-50 rounded-lg shadow space-y-6 relative"> 
             {/* Render Modal if shown */}
             {renderConsultOptionsModal()} 

             {/* Notification Area */} 
              {incomingConsultRequest && (
                 <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-lg w-3/4">
                     <strong className="font-bold">Consult Request!</strong>
                     <span className="block sm:inline ml-2">
                         {incomingConsultRequest.initiator?.name || 'A colleague'} wants to consult about Patient {incomingConsultRequest.patientId} regarding "{incomingConsultRequest.context?.description || 'General'}".
                     </span>
                     <button 
                         onClick={handleJoinConsultation}
                         className="ml-4 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold"
                     >
                         Accept & Join
                     </button>
                     <button 
                         onClick={() => setIncomingConsultRequest(null)}
                         className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                     >
                         Dismiss
                     </button>
                 </div>
             )}
             
             {commonHeader}
     
             {/* --- CoPilot Prompt Panel (Input Area Only) --- */}
             <section className="p-4 bg-white rounded shadow sticky top-5 z-10 border-b border-gray-200">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xl font-semibold text-indigo-700">CoPilot Actions</h3>
                 <button
                   onClick={() => setIsCoPilotActionsVisible(!isCoPilotActionsVisible)}
                   className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
                 >
                   {isCoPilotActionsVisible ? 'Hide' : 'Show'}
                 </button>
               </div>
               {/* Display MAIN WebSocket Connection Status */} 
               {isCoPilotActionsVisible && (
                 <>
               <div className="text-xs mb-2 text-right">
                 Connection Status: 
                 {contextMainWsUrl ? (
                   <span className={`font-semibold ${isMainWsConnected ? 'text-green-600' : (mainWsReadyState === 0 ? 'text-yellow-600' : 'text-red-600')}`}>
                     {isMainWsConnected ? 'Connected' : (mainWsReadyState === 0 ? 'Connecting...' : (mainWsReadyState === 2 ? 'Closing...' : 'Disconnected'))}
                   </span>
                 ) : (
                   <span className="text-gray-500 font-semibold">Inactive (No Patient ID)</span>
                 )}
               </div>
               <form onSubmit={handlePromptFormSubmit} className="space-y-3">
                 <textarea
                   value={promptText}
                   onChange={(e) => setPromptText(e.target.value)}
                   placeholder={`Ask about ${demographics.name || 'this patient'} (e.g., "Summarize latest notes", "What was the last WBC?", "Notify PCP about elevated glucose")`}
                   className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                   rows={3}
                   disabled={isProcessingPrompt || !isMainWsConnected} // Disable if processing OR not connected
                 />
                 {/* --- Quick Action Buttons/Tags --- */}
                 <div className="flex flex-wrap gap-2 text-xs mb-2"> {/* Reduced mb */}
                   <span className="font-medium text-gray-600 mr-1">Quick Actions:</span>
                   <button type="button" onClick={() => setPromptText('Summarize the patient record')} className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Summarize</button>
                   <button 
                     type="button" 
                     onClick={() => {
                         const recentLabName = initialPatientData?.labs?.[0]?.test;
                         const recentImageName = initialPatientData?.imagingStudies?.[0]?.type;
                         const testExample = recentLabName || recentImageName || '[Test/Finding]';
                         setPromptText(`What was the result of the ${testExample}?`);
                     }}
                     className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                   >Ask Question</button>
                   <button 
                     type="button" 
                     onClick={() => {
                         const condition = diagnosis?.primary || '[Condition/Finding]';
                         setPromptText(`Notify [Recipient Role e.g., PCP] about ${condition}`);
                     }}
                     className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                   >Draft Notification</button>
                   <button 
                     type="button" 
                     onClick={() => {
                         const reason = diagnosis?.primary ? `follow-up for ${diagnosis.primary}` : 'follow-up';
                         setPromptText(`Schedule ${reason} for [Timeframe e.g., next week]`);
                     }}
                     className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                   >Schedule</button>
                   <button 
                     type="button" 
                     onClick={() => {
                         const condition = diagnosis?.primary || '[Condition]';
                         setPromptText(`Find clinical trials for ${condition}`);
                     }}
                     className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                   >Find Trials</button>
                   <button 
                     type="button" 
                     onClick={() => {
                         const reason = diagnosis?.primary ? `evaluation for ${diagnosis.primary}` : 'evaluation';
                         setPromptText(`Draft referral to [Specialty] for ${reason}`);
                     }}
                     className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                   >Draft Referral</button>
                 </div>
                 
                 {/* --- Suggested Action Tabs --- */}
                 <div className="flex flex-wrap gap-2 text-xs border-t pt-2 mb-2"> 
                    <span className="font-medium text-gray-600 mr-1 self-center">Suggested Actions:</span>
                    <button 
                      type="button" 
                      onClick={() => setActiveActionTab('admin')}
                      className={`py-0.5 px-2 rounded transition-colors ${activeActionTab === 'admin' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                     >
                       Admin/Coordinator
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveActionTab('clinical')}
                      className={`py-0.5 px-2 rounded transition-colors ${activeActionTab === 'clinical' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                     >
                       Clinical/Nursing
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveActionTab('research')}
                      className={`py-0.5 px-2 rounded transition-colors ${activeActionTab === 'research' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                     >
                       Research
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveActionTab('pharmacy')}
                      className={`py-0.5 px-2 rounded transition-colors ${activeActionTab === 'pharmacy' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                     >
                       Pharmacy
                    </button>
                     <button 
                      type="button" 
                      onClick={() => setActiveActionTab(null)} // Button to close tabs
                      title="Hide Actions"
                      className={`py-0.5 px-2 rounded transition-colors text-red-600 hover:bg-red-100 ${!activeActionTab ? 'invisible' : ''}`}
                     >
                       ✕
                    </button>
                 </div>

                 {/* --- Action Button Display Area (Conditional) --- */}
                 {activeActionTab && (
                   <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 min-h-[50px]"> {/* Added min-height */}
                     {/* Admin/Coordinator Actions */}
                     {activeActionTab === 'admin' && (
                       <div className="flex flex-wrap gap-1.5">
                           <button
                                   type="button" // Explicitly set type
                                   onClick={(e) => handlePlaceholderAction('Schedule Follow-up', e)} // Pass event
                               className="px-2 py-1 rounded text-xs text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-300"
                           >
                               Schedule Follow-up
                           </button>
                           <button
                                   type="button" // Explicitly set type
                                   onClick={(e) => handlePlaceholderAction('Draft Referral', e)} // Pass event
                               className="px-2 py-1 rounded text-xs text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-300"
                           >
                               Draft Referral
                           </button>
                       </div>
                     )}
                     {/* Clinical / Nursing Actions */}
                     {activeActionTab === 'clinical' && (
                       <div className="flex flex-wrap gap-1.5">
                            <button
                                   type="button" // Explicitly set type
                                   onClick={(e) => handlePlaceholderAction('Notify PCP', e)} // Pass event
                               className="px-2 py-1 rounded text-xs text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-300"
                           >
                               Notify PCP
                           </button>
                            <button
                                   type="button" // Explicitly set type
                                   onClick={(e) => handlePlaceholderAction('Draft Lab Order', e)} // Pass event
                               className="px-2 py-1 rounded text-xs text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-300"
                           >
                               Draft Lab Order
                           </button>
                           <button
                                   type="button" // Explicitly set type
                                   onClick={(e) => handlePlaceholderAction('Flag for Review', e)} // Pass event
                               className="px-2 py-1 rounded text-xs text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-300"
                           >
                               Flag for Review
                           </button>
                       </div>
                     )}
                      {/* Research Actions */}
                     {activeActionTab === 'research' && (
                       <div className="flex flex-wrap gap-1.5">
                           <button
                                   type="button" // Explicitly set type
                                   onClick={(e) => handlePlaceholderAction('Check Trial Eligibility', e)} // Pass event
                               className="px-2 py-1 rounded text-xs text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-300"
                           >
                               Check Trial Eligibility
                           </button>
                       </div>
                     )}
                     {/* Pharmacy Actions */}
                     {activeActionTab === 'pharmacy' && (
                       <div className="flex flex-wrap gap-1.5">
                           <button
                                   type="button" // Explicitly set type
                                   onClick={(e) => handlePlaceholderAction('Review Side Effects', e)} // Pass event
                               className="px-2 py-1 rounded text-xs text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-300"
                           >
                               Review Side Effects
                           </button>
                            <button
                                   type="button" // Explicitly set type
                                   onClick={(e) => handlePlaceholderAction('Check Interactions', e)} // Pass event
                               className="px-2 py-1 rounded text-xs text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-300"
                           >
                               Check Interactions
                           </button>
                       </div>
                     )}
                   </div>
                 )}

                 {/* --- Submit Buttons Row --- */}
                 <div className="flex items-center space-x-2">
                   <button 
                     type="submit" 
                     disabled={isProcessingPrompt || !promptText.trim() || !isMainWsConnected} // Disable if processing, empty, OR not connected
                     className={`flex-grow px-4 py-2 rounded-md text-white font-semibold transition-colors duration-200 ${isProcessingPrompt || !promptText.trim() || !isMainWsConnected ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                   >
                     {isProcessingPrompt ? 'Processing...' : 'Submit Prompt'}
                   </button>
                   <button 
                     type="button" 
                         onClick={() => submitPromptViaWebSocket("analyze_genomic_profile", { 
                           messageType: "agent_command", 
                           commandDetails: { /* any specific parameters can go here if needed by the agent */ } 
                         })}
                     disabled={isProcessingPrompt || !isMainWsConnected} // Disable if processing OR not connected
                     className={`px-4 py-2 rounded-md text-white font-semibold transition-colors duration-200 ${isProcessingPrompt || !isMainWsConnected ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                   >
                     {isProcessingPrompt ? 'Processing...' : 'Analyze Genomic Profile'}
                   </button>
                   <button 
                     type="button" 
                     onClick={handleQuickSummaryClick} // Updated handler
                     disabled={isProcessingPrompt || !isMainWsConnected} // Disable if processing OR not connected
                     className={`px-4 py-2 rounded-md text-white font-semibold transition-colors duration-200 ${isProcessingPrompt || !isMainWsConnected ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                   >
                     {isProcessingPrompt ? 'Processing...' : 'Quick Summary'}
                   </button>
                 </div>
               </form>
               {/* --- Display Active Agent Message --- */}
               {activeAgentMessage && (
                 <div className="mt-2 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs italic">
                   <p>{activeAgentMessage}</p>
                 </div>
               )}
               {/* --- Display Prompt Results/Errors --- */}
               {/* Display MAIN WebSocket connection errors first if they exist */} 
               {mainWsError && !promptError && ( // Show WS error if no specific prompt error is active
                  <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                   <p><strong>Connection Error:</strong> {promptError || mainWsError.message}</p> {/* Prioritize promptError if set */} 
                 </div>
               )}
               {/* Display prompt processing errors */} 
               {promptError && (
                 <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-xs">
                   <p><strong>Error:</strong> {promptError}</p>
                 </div>
                   )}
                 </>
               )}
             </section> 

             {/* --- CoPilot Output Panel (Results Area - Below Sticky Prompt) --- */}
             {promptResult && (
               <section className="mt-4 mb-6 p-4 bg-white rounded shadow border border-blue-200">
                  <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-blue-700">CoPilot Output</h3>
                  {/* Moved results rendering logic here */}
                  <div className="text-sm space-y-3">
                   <p className="font-semibold mb-1">CoPilot Response (Status: <span className={`font-bold ${promptResult.status === 'success' ? 'text-green-700' : 'text-orange-700'}`}>{promptResult.status}</span>)</p>
                   
                   {/* Display specific outputs */} 
                   {/* AI Summary Output */}
                    {promptResult.output?.output?.summary_text && ( // <--- Check this line
                     <div className="mt-1 border-t pt-2"> {/* Added separator */} 
                       <h4 className="font-medium text-gray-700">[Clinician/User] Generated Summary:</h4>
                        {/* Correct the path here too */}
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{promptResult.output.output.summary_text}</p> 
                        {/* Add the "Get Deeper Insights" button here if applicable */}
                        {showDeepDiveButton && (
                          <button
                            type="button"
                            onClick={() => {
                              submitPromptViaWebSocket("Perform a deep dive summarization of the patient record", { source: 'deep_dive_button', messageType: "prompt"});
                              setShowDeepDiveButton(false); // Hide button after click, or manage loading state
                            }}
                            disabled={isProcessingPrompt || !isMainWsConnected}
                            className={`mt-3 px-3 py-1.5 rounded-md text-white text-xs font-semibold transition-colors duration-200 ${isProcessingPrompt || !isMainWsConnected ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
                          >
                            {isProcessingPrompt ? 'Processing...' : 'Get Deeper Insights'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Display Deep Dive Sections */}
                    { (() => { 
                        if (promptResult?.output?.output?.deep_dive_sections) { // Adjusted path here
                            console.log("[DeepDive Render Check] promptResult.output.output: ", JSON.stringify(promptResult.output.output, null, 2));
                        } 
                        return null; 
                    })() }
                    {promptResult.output?.output?.deep_dive_sections && ( // Adjusted path here
                      <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50/50">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4">Holistic Analysis & Deeper Insights:</h3>
                        {promptResult.output.output.deep_dive_sections.map((section, index) => { // Adjusted path here
                          // Determine the title based on the source
                          let sectionTitle = section.topic; // Default to topic
                          if (section.source && section.source.includes("_LLM")) {
                            // Title is already good (it's the topic itself)
                            sectionTitle = section.topic;
                          } else if (section.source) {
                            // For conceptual agents, e.g., "ConceptualCRISPRAgent"
                            const agentName = section.source.replace("Conceptual", "").replace("Agent", " Agent");
                            sectionTitle = `Insight from ${agentName}: ${section.topic}`;
                          }

                          return (
                            <div key={index} className="mb-4 p-3 border border-gray-300 rounded-md bg-white shadow-sm">
                              <h4 className="text-md font-semibold text-gray-700 mb-2">{sectionTitle}</h4>
                              {section.elaboration && (
                                <div className="text-sm text-gray-600">
                                  <p className="whitespace-pre-wrap">{
                                    expandedSections[index] ? section.elaboration : (section.elaboration.substring(0, 150) + (section.elaboration.length > 150 ? "..." : ""))
                                  }</p>
                                  {section.elaboration.length > 150 && (
                                <button
                                      onClick={() => setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }))}
                                      className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                                >
                                      {expandedSections[index] ? "Read Less" : "Read More"}
                                </button>
                                  )}
                              </div>
                              )}
                              {/* Enhanced Supporting Evidence Display - Use 'evidence_snippets' */}
                              {section.evidence_snippets && section.evidence_snippets.length > 0 && expandedSections[index] && (
                                <div className="mt-3 pt-2 border-t border-gray-200">
                                  <h5 className="text-xs font-semibold text-gray-500 mb-1">Supporting Evidence:</h5>
                                  <ul className="space-y-2">
                                    {section.evidence_snippets.map((evidence, evidence_idx) => (
                                      <li key={evidence_idx} className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                                        <div className="font-medium text-gray-700 mb-0.5">
                                          {/* Adjust based on actual structure of evidence.metadata or evidence directly for source_type and document_date */}
                                          Source Type: {evidence.metadata?.source_type || evidence.source_type || (evidence.source ? evidence.source.split('(')[0].trim() : 'Unknown Type')}
                                          { (evidence.metadata?.document_date || evidence.document_date) && ` - Date: ${formatDate(evidence.metadata?.document_date || evidence.document_date)}`}
                                        </div>
                                        <div className="text-gray-600">
                                          {/* Adjust based on actual structure for author/actor */}
                                          <span className="italic">Author/Actor:</span> {evidence.metadata?.actor || evidence.metadata?.author || evidence.metadata?.recorded_by || (evidence.source && evidence.source.includes('(') ? evidence.source.split('(')[1].replace(')','').replace('by ','').trim() : 'Unknown')}
                                        </div>
                                        {/* Use 'snippet' if page_content is not available, or evidence is a string */}
                                        <p className="mt-1 text-gray-700 whitespace-pre-wrap bg-white p-1 border border-gray-100 rounded-sm">
                                          "{typeof evidence === 'string' ? evidence : (evidence.page_content || evidence.snippet || 'No content')}"
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {/* Re-add Consult Colleague button for each expanded section */}
                              {expandedSections[index] && (
                                <div className="mt-3 text-right">
                                  <button 
                                     onClick={() => {
                                         console.log("[DeepDive Consult Button] Triggering consultation with:", {
                                            topic: `Consult on: ${section.topic}`,
                                            note: section.elaboration,
                                            triggerText: section.elaboration
                                         });
                                         handleInitiateConsultation(
                                        { id: 'dr_b', name: 'Dr. Baker (PCP)' }, // Default target, can be made dynamic later
                                           `Consult on: ${section.topic}`,
                                        section.elaboration, // Pass elaboration as the initiatorNote
                                        section.elaboration // Pass elaboration as the triggerText
                                         );
                                      }}
                                     disabled={!patientId || !isMainWsConnected} 
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${!patientId || !isMainWsConnected ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:shadow-md'}`}
                                     title={patientId && isMainWsConnected ? "Consult a colleague about this specific insight" : "Cannot consult (missing patient data or disconnected)"}
                                   >
                                    Consult Colleague on this Insight
                                   </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Genomic Analysis Output */}
                    {promptResult.output?.output?.analysis_summary && Array.isArray(promptResult.output?.output?.details) && (
                      <div className="mt-3 border-t pt-3">
                        <h4 className="text-md font-semibold text-gray-700 mb-1">Genomic Analysis Report:</h4>
                        <div className="p-2 bg-green-50 border border-green-200 rounded mb-2">
                          <h5 className="text-sm font-semibold text-green-800 mb-1">Overall Summary:</h5>
                          {/* --- Display LLM Summary if available, fallback to list --- */}
                          {promptResult.output?.output?.natural_language_summary ? (
                            <p className="text-xs text-gray-700 whitespace-pre-wrap">
                              {promptResult.output?.output?.natural_language_summary}
                            </p>
                          ) : (
                            <ul className="list-disc list-inside pl-3 text-xs text-gray-700 space-y-1">
                               {promptResult.output?.output?.details.map((detail, index) => {
                                   // Extract key info safely
                                   const gene = detail.simulated_vep_details?.[0]?.gene_symbol ?? Object.keys(detail.gene_summary_statuses ?? {})[0] ?? 'Unknown Gene';
                                   const variant = detail.simulated_vep_details?.[0]?.protein_change ?? detail.criterion_query?.split(' ')[2] ?? 'Unknown Variant'; // Fallback parsing query
                                   const status = detail.status ?? 'N/A';
                                   const classification = detail.simulated_vep_details?.[0]?.simulated_classification ?? 'N/A';
                                   const evo2Pred = detail.simulated_vep_details?.[0]?.evo2_prediction ?? 'N/A';
                                   // const crisprRecs = detail.crispr_recommendations?.length > 0 ? 'Yes' : 'No'; // Keep CRISPR out of summary list for brevity

                                   return (
                                       <li key={`summary-${index}`}>
                                           <strong>{gene} {variant}</strong> ({status}): {classification}
                                           {evo2Pred !== 'N/A' && ` (Evo2: ${evo2Pred})`}
                                       </li>
                                   );
                               })}
                            </ul>
                          )}
                        </div>
                        {promptResult.output?.output?.details.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-semibold text-gray-600 mb-1">Detailed Findings ({promptResult.output?.output?.details.length}):</h5>
                            <div className="space-y-3 p-2 bg-gray-100 rounded border border-gray-300">
                               {promptResult.output?.output?.details.map((detail, index) => (
                               <div key={`genomic-detail-${index}`} id={`genomic-detail-${index}`} className="p-2 border rounded bg-white shadow-sm text-xs"> {/* Added id for scrolling */}
                                 <p className="font-medium text-gray-800 mb-0.5">Query: <span className="font-normal text-gray-700">{detail.criterion_query}</span></p>
                                 
                                 {/* Display Gene Summary Statuses */}
                                 {detail.gene_summary_statuses && Object.entries(detail.gene_summary_statuses).map(([gene, geneStatus]) => (
                                   <div key={gene} className="mt-1 mb-1 p-1.5 bg-blue-50 border border-blue-200 rounded">
                                     <p className="font-semibold text-blue-800">
                                       {gene}: <span className={`font-bold ${geneStatus.status === 'MET' ? 'text-green-700' : (geneStatus.status === 'NOT_MET' ? 'text-red-700' : 'text-yellow-600')}`}>{geneStatus.status}</span>
                                     </p>
                                     <p className="text-xs text-gray-600 italic whitespace-pre-wrap">{geneStatus.details}</p>
                                   </div>
                                 ))}

                                 {/* Remove the generic clinical_significance_context display */}
                                 {/* {detail.clinical_significance_context && <p className="mt-0.5 text-gray-600 italic">Context: {detail.clinical_significance_context}</p>} */}

                                 {/* Display Simulated VEP Details Table */}
                                 {detail.simulated_vep_details && detail.simulated_vep_details.length > 0 && (
                                   <div className="mt-2 overflow-x-auto">
                                      <h6 className="text-xs font-semibold text-gray-600 mb-1">Simulated VEP Details:</h6>
                                     <table className="min-w-full divide-y divide-gray-200 text-xs border border-gray-300">
                                       <thead className="bg-gray-100">
                                         <tr>
                                           <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase tracking-wider">Gene</th>
                                           <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase tracking-wider">Variant</th>
                                           <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase tracking-wider">Classification</th>
                                           <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase tracking-wider">Consequence</th>
                                           <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase tracking-wider">Pred. Scores</th>
                                           <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase tracking-wider">Evo2 Pred.</th>
                                           <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase tracking-wider">Delta Score</th>
                                           <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase tracking-wider">Evo2 Conf.</th>
                                         </tr>
                                       </thead>
                                       <tbody className="bg-white divide-y divide-gray-200">
                                         {detail.simulated_vep_details.map((vep, vIndex) => (
                                           <tr key={`vep-${vIndex}`}>
                                             <td className="px-2 py-1 whitespace-nowrap">{vep.gene_symbol}</td>
                                             <td className="px-2 py-1 whitespace-nowrap">{vep.canonical_variant_id || vep.protein_change}</td>
                                             <td className="px-2 py-1 whitespace-nowrap">{vep.simulated_classification}</td>
                                             <td className="px-2 py-1 whitespace-nowrap">{vep.predicted_consequence}</td>
                                             <td className="px-2 py-1 whitespace-pre-wrap"> {/* Allow wrapping */}
                                                {vep.simulated_tools && Object.entries(vep.simulated_tools).map(([tool, score]) => (
                                                   <div key={tool}>{tool}: {score}</div>
                                                ))}
                                                {vep.mock_knowledgebases && Object.entries(vep.mock_knowledgebases).map(([kb, value]) => (
                                                   <div key={kb}>{kb}: {value}</div>
                                                ))}
                                             </td>
                                             <td className="px-2 py-1 whitespace-nowrap">{vep.evo2_prediction || 'N/A'}</td>
                                             <td className="px-2 py-1 whitespace-nowrap">{vep.delta_likelihood_score?.toFixed(6) ?? 'N/A'}</td>
                                              <td className="px-2 py-1 whitespace-nowrap">{vep.evo2_confidence !== null && vep.evo2_confidence !== undefined ? `${(vep.evo2_confidence * 100).toFixed(0)}%` : 'N/A'}</td>
                                           </tr>
                                         ))}
                                       </tbody>
                                     </table>
                                     {/* Optionally display reasoning if available */}
                                     {detail.simulated_vep_details[0]?.classification_reasoning && (
                                         <p className="text-xs italic text-gray-500 mt-1">Reasoning: {detail.simulated_vep_details[0].classification_reasoning}</p>
                                     )}
                                   </div>
                                 )}
                                 
                                 {/* Optionally display CRISPR Recommendations if available */}
                                 {detail.crispr_recommendations && detail.crispr_recommendations.length > 0 && (
                                     <div className="mt-2 border-t pt-1.5">
                                         <h6 className="text-xs font-semibold text-purple-700 mb-1">Conceptual CRISPR Recommendations:</h6>
                                         {detail.crispr_recommendations.map((rec, rIndex) => (
                                             <div key={`crispr-rec-${rIndex}`} className="p-1.5 bg-purple-50 border border-purple-200 rounded text-xs mb-1">
                                                 <p><strong>Approach:</strong> {rec.recommended_approach}</p>
                                                 <p><strong>Rationale:</strong> {rec.rationale}</p>
                                                 <p><strong>Confidence:</strong> {rec.confidence_score !== null ? (rec.confidence_score * 100).toFixed(0) + '%' : 'N/A'}</p>
                                             </div>
                                         ))}
                                     </div>
                                 )}

                               </div>
                             ))}
                            </div>
                          </div>
                        )}
                        {promptResult.output?.output?.errors && promptResult.output?.output?.errors.length > 0 && (
                          <div className="mt-2 p-1.5 bg-red-50 border border-red-200 rounded">
                            <h5 className="text-sm font-semibold text-red-700">Errors in Genomic Analysis:</h5>
                            <ul className="list-disc list-inside pl-3 text-xs text-red-600">
                              {promptResult.output?.output?.errors.map((err, idx) => <li key={`genomic-err-${idx}`}>{err}</li>)}
                            </ul>
                          </div>
                        )}
                     </div>
                   )}

                   {/* AI Answer Output */}
                   {promptResult.output?.output?.answer_text && (
                     <div className="mt-1 border-t pt-2"> {/* Added separator */} 
                       <h4 className="font-medium text-gray-700">[Clinician/User] AI Answer:</h4>
                       <p className="text-sm text-gray-800 whitespace-pre-wrap">{promptResult.output?.output?.answer_text}</p>
                     </div>
                   )}

                   {/* Notification Output */}
                   { (() => { 
                        if (promptResult?.output?.output) { 
                            console.log("[Notification Render Check (before section)] promptResult.output.output: ", JSON.stringify(promptResult.output.output, null, 2));
                        } 
                        return null; 
                    })() }
                   {promptResult.output?.output?.simulated_send && (
                     <div className="mt-1 border-t pt-2"> 
                       { console.log("[Render] Displaying Notification Output section because simulated_send is true.") }
                       <h4 className="font-medium text-gray-700">[Review Required] Notification Draft:</h4>
                       <p className="text-sm italic text-gray-600">(Drafted for review before sending to: {promptResult.output?.output?.target || promptResult.output?.output?.recipient || 'Recipient'})</p>
                       <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-2 rounded">{promptResult.output?.output?.body || promptResult.output?.output?.message_draft || 'No message drafted.'}</pre>
                       {/* <p className="text-sm text-green-700">Simulated Send: Message logged to console.</p> */}
                     </div>
                   )}

                   {/* Scheduling Output */}
                   {promptResult.output?.output?.available_slots?.length > 0 && (
                     <div className="mt-1 border-t pt-2"> {/* Added separator */} 
                       <h4 className="font-medium text-gray-700">[Admin/Coordinator] Scheduling Options:</h4>
                       <ul className="list-disc list-inside text-sm text-gray-800">
                         {promptResult.output?.output?.available_slots.map((slot, index) => <li key={`slot-${index}`}>{slot}</li>)}
                       </ul>
                     </div>
                   )}
                    {promptResult.output?.output?.booked_slot && (
                        <div className="mt-1 border-t pt-2"> {/* Added separator */} 
                            <h4 className="font-medium text-gray-700">[Admin/Coordinator] Appointment Booked:</h4>
                            <p className="text-sm text-green-700">Successfully booked: {promptResult.output?.output?.booked_slot}</p>
                        </div>
                   )}

                    {/* Referral Output */}
                   {promptResult.output?.output?.referral_letter_draft && (
                       <div className="mt-1 border-t pt-2"> 
                           { console.log("[Render] Displaying Referral Output section because referral_letter_draft is present.") }
                           <h4 className="font-medium text-gray-700">[Admin/Coordinator] Referral Letter Draft:</h4>
                            <p className="text-sm italic text-gray-600">(Drafted for review and sending to: {promptResult.output?.output?.referring_to_specialty || 'Specialist'})</p>
                           <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-2 rounded">{promptResult.output?.output?.referral_letter_draft}</pre>
                       </div>
                   )}

                   {/* Lab Order Output - New Section */}
                   {promptResult.output?.output?.lab_order_details && (
                       <div className="mt-1 border-t pt-2">
                           { console.log("[Render] Displaying Lab Order Output section because lab_order_details is present.") }
                           <h4 className="font-medium text-gray-700">[Admin/Coordinator] Lab Order Draft:</h4>
                           <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                                <p><strong>Patient:</strong> {promptResult.output.output.lab_order_details.patient_name}</p>
                                <p><strong>Diagnosis Context:</strong> {promptResult.output.output.lab_order_details.diagnosis_context}</p>
                                <p><strong>Requested:</strong> {promptResult.output.output.lab_order_details.order_request_details}</p>
                                <h5 className="font-semibold mt-2 mb-1">Panels / Tests Ordered:</h5>
                                <ul className="list-disc list-inside pl-4">
                                    {promptResult.output.output.lab_order_details.panels_ordered?.map((panel, idx) => (
                                        <li key={idx}>{panel.panel_name} - <em>Reason: {panel.reason}</em></li>
                                    ))}
                                </ul>
                                <p className="mt-2 italic"><strong>Notes:</strong> {promptResult.output.output.lab_order_details.notes}</p>
                                <p className="mt-1"><strong>Status:</strong> <span className="font-semibold">{promptResult.output.output.lab_order_details.status}</span></p>
                           </div>
                       </div>
                   )}

                   {/* Side Effect Output */}
                   {(promptResult.output?.output?.potential_side_effects?.length > 0 || promptResult.output?.output?.management_tips?.length > 0) && (
                        <div className="mt-1 border-t pt-2"> {/* Added separator */} 
                           <h4 className="font-medium text-gray-700">[Pharmacist/Clinician] Side Effect Information:</h4>
                           {/* Display Potential Side Effects */}
                           {promptResult.output?.output?.potential_side_effects?.length > 0 && (
                               <div className="mt-1 pl-2">
                                   <p className="text-sm font-medium text-gray-600">Potential Side Effects{promptResult.output?.output?.target_medication ? ` for ${promptResult.output?.output?.target_medication}` : ' (General)'}:</p>
                                   <ul className="list-disc list-inside text-sm text-gray-800">
                                       {promptResult.output?.output?.potential_side_effects.map((effect, index) => <li key={`se-${index}`}>{effect}</li>)}
                                   </ul>
                               </div>
                           )}
                           {/* Display Management Tips */}
                           {promptResult.output?.output?.management_tips?.length > 0 && (
                               <div className="mt-2 pl-2">
                                    <p className="text-sm font-medium text-gray-600">Management Tips:</p>
                                   {promptResult.output?.output?.management_tips.map((tipInfo, index) => (
                                       <div key={`tip-${index}`} className="mt-1">
                                           <p className="text-sm text-gray-800"><strong>{tipInfo.symptom}:</strong> {tipInfo.tip}</p>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   )}

                   {/* Clinical Trial Output - REVISED for Detailed Eligibility */}
                    {/* Check for found_trials first, then try trials_with_assessment as a fallback if necessary */}
                    {(promptResult.output?.output?.found_trials && Array.isArray(promptResult.output.output.found_trials)) || 
                     (promptResult.output?.output?.trials_with_assessment && Array.isArray(promptResult.output.output.trials_with_assessment)) ? (
                        <div className="mt-1 border-t pt-2"> 
                            <h4 className="font-medium text-gray-700">
                                [Research] Clinical Trial Eligibility Assessment ({(promptResult.output.output.trials_with_assessment || promptResult.output.output.found_trials).length} trials found/analyzed):
                            </h4>
                            {(promptResult.output.output.trials_with_assessment || promptResult.output.output.found_trials).length === 0 ? (
                                <p className="text-sm text-gray-600 italic pl-2">
                                    {promptResult.output.output.search_query_used ? `No trials found or analyzed for query: ${promptResult.output.output.search_query_used}` : "No trials analyzed."}
                                </p>
                           ) : (
                                <ul className="space-y-3 pl-2 mt-1">
                                    {(promptResult.output.output.trials_with_assessment || promptResult.output.output.found_trials).map((trial, index) => {
                                        const assessment = trial.llm_assessment || {}; // Attempt to get assessment
                                        const action_suggestions = trial.action_suggestions || []; // Attempt to get suggestions
                                        let eligibilityColor = "text-gray-700 bg-gray-100";
                                        if (assessment.eligibility_status === 'Likely Eligible') {
                                            eligibilityColor = "text-green-700 bg-green-100";
                                        } else if (assessment.eligibility_status === 'Likely Ineligible') {
                                            eligibilityColor = "text-red-700 bg-red-100";
                                        } else if (assessment.eligibility_status === 'Eligibility Unclear due to missing info') {
                                            eligibilityColor = "text-yellow-700 bg-yellow-100";
                                        }

                                        return (
                                            <li key={trial.nct_id || index} className="text-sm border border-gray-200 rounded-md p-3 shadow-sm">
                                                {trial.source_url ? (
                                                    <a href={trial.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        <p className="font-semibold text-gray-800 hover:text-blue-700">{trial.title || 'N/A'} (Phase {trial.phase || 'N/A'})</p>
                                                    </a>
                                                ) : (
                                           <p className="font-semibold text-gray-800">{trial.title || 'N/A'} (Phase {trial.phase || 'N/A'})</p>
                                                )}
                                                <p className="text-xs text-gray-600">NCT ID: {trial.nct_id || 'N/A'} | Status: {trial.status || 'N/A'}</p>
                                                
                                                {assessment.eligibility_status && (
                                                    <p className={`text-xs font-semibold mt-1 mb-1 px-2 py-0.5 rounded-full inline-block ${eligibilityColor}`}>
                                                        Eligibility: {assessment.eligibility_status}
                                                    </p>
                                                )}

                                                {assessment.summary && (
                                                    <p className="text-xs italic text-gray-600 mt-1 mb-1 whitespace-pre-wrap">LLM Summary: {assessment.summary}</p>
                                                )}
                                                
                                                {/* Toggle for detailed criteria */}
                                                <button 
                                                    onClick={() => setExpandedSections(prev => ({...prev, [`trial-${index}`]: !prev[`trial-${index}`]}))}
                                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                                >
                                                    {expandedSections[`trial-${index}`] ? 'Hide Details' : 'Show Eligibility Details'}
                                                </button>

                                                {expandedSections[`trial-${index}`] && (
                                                    <div className="mt-2 pt-2 border-t border-dashed text-xs space-y-1">
                                                        {assessment.met_criteria && assessment.met_criteria.length > 0 && (
                                                            <div>
                                                                <strong className="text-green-600">Met Criteria:</strong>
                                                                <ul className="list-disc list-inside pl-4">
                                                                    {assessment.met_criteria.map((crit, cIdx) => <li key={`met-${cIdx}`}>{crit.criterion} <em className="text-gray-500">({crit.trial_snippet || 'N/A'})</em></li>)}
                               </ul>
                                                            </div>
                                                        )}
                                                        {assessment.unmet_criteria && assessment.unmet_criteria.length > 0 && (
                                                            <div>
                                                                <strong className="text-red-600">Unmet Criteria:</strong>
                                                                <ul className="list-disc list-inside pl-4">
                                                                    {assessment.unmet_criteria.map((crit, cIdx) => <li key={`unmet-${cIdx}`}>{crit.criterion} <em className="text-gray-500">({crit.trial_snippet || 'N/A'})</em> - Reason: {crit.reasoning || 'N/A'}</li>)}
                                                                </ul>
                       </div>
                   )}
                                                        {assessment.unclear_criteria && assessment.unclear_criteria.length > 0 && (
                                                            <div>
                                                                <strong className="text-yellow-600">Unclear Criteria (Needs More Info):</strong>
                                                                <ul className="list-disc list-inside pl-4">
                                                                    {assessment.unclear_criteria.map((crit, cIdx) => <li key={`unclear-${cIdx}`}>{crit.criterion} <em className="text-gray-500">({crit.trial_snippet || 'N/A'})</em> - Reason: {crit.reasoning || 'N/A'}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {(!assessment.met_criteria && !assessment.unmet_criteria && !assessment.unclear_criteria) && (
                                                            <p className="text-xs italic text-gray-500">No detailed LLM eligibility criteria breakdown available for this trial.</p>
                                                        )}
                                                    </div>
                                                )}
                                                {action_suggestions.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-dashed">
                                                        <p className="text-xs font-semibold text-indigo-600">Suggested Actions:</p>
                                                        <ul className="list-disc list-inside pl-4 text-xs text-indigo-700">
                                                            {action_suggestions.map((action, actIdx) => <li key={`action-${actIdx}`}>{typeof action === 'string' ? action : action.suggestion}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    ) : null } {/* End of clinical trial block conditional */}

                   {/* Display agent summary only if NO specific output was displayed */}
                   {shouldShowGenericSummary && (
                        <p className="italic mt-1 border-t pt-2 text-gray-600">{promptResult.summary}</p>
                   )}
                    {/* Display message for non-success statuses */} 
                    {promptResult.status !== 'success' && promptResult.message && (
                      <p className="text-orange-700 mt-1 border-t pt-2">{promptResult.message}</p>
                    )}
                 </div>

             </section>
                              )}

             {/* Demographics */}
             <section className="mb-6 p-4 bg-white rounded shadow">
               <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Demographics</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><strong>Name:</strong> {`${demographics.first_name || ''} ${demographics.last_name || ''}`.trim() || 'N/A'}</p>
                 <p><strong>DOB:</strong> {formatDate(demographics.dob)}</p>
                  <p><strong>Sex:</strong> {demographics.gender || 'N/A'}</p>
                 <p><strong>Contact:</strong> {demographics.contact || 'N/A'}</p>
                 <p className="md:col-span-2"><strong>Address:</strong> {demographics.address || 'N/A'}</p>
                  <p><strong>Race:</strong> {demographics.race || 'N/A'}</p>
                  <p><strong>Ethnicity:</strong> {demographics.ethnicity || 'N/A'}</p>
                  <p><strong>Insurance:</strong> {demographics.insurance || 'N/A'}</p>
               </div>
             </section>

             {/* Diagnosis */}
             <section className={`mb-6 p-4 bg-white rounded shadow ${highlightSections?.includeDiagnosis ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-200/50' : ''}`}>
               <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Diagnosis</h3>
               <div className="text-sm">
                 <p><strong>Primary:</strong> {diagnosis.primary || 'N/A'}</p>
                  <p><strong>Diagnosed Date:</strong> {formatDate(diagnosis.date_of_diagnosis)}</p>
                  <p><strong>Stage:</strong> {diagnosis.stage || 'N/A'}</p>
                  <p><strong>Histology:</strong> {diagnosis.histology || 'N/A'}</p>
                  <p><strong>Grade:</strong> {diagnosis.grade || 'N/A'}</p>
                  {diagnosis.sites && diagnosis.sites.length > 0 && (
                    <p><strong>Sites:</strong> {diagnosis.sites.join(', ')}</p>
                  )}
               </div>
             </section>

              {/* Genomic Profile / Mutations */}
              {initialPatientData.mutations && initialPatientData.mutations.length > 0 && (
                 <section className="mb-6 p-4 bg-white rounded shadow">
                     <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Genomic Profile - Mutations</h3>
                     <div className="space-y-2">
                         {initialPatientData.mutations.map((mutation, index) => (
                             <div key={mutation.mutation_id || `mutation-${index}`} className="p-2 border rounded bg-gray-50 text-sm">
                                 <p className="font-semibold">
                                     {mutation.hugo_gene_symbol || 'N/A'} {mutation.protein_change || 'N/A'} ({mutation.variant_type || 'N/A'})
                                 </p>
                                 <p className="text-xs text-gray-600">
                                     Coordinate: {mutation.genomic_coordinate_hg38 || 'N/A'}
                                     {mutation.allele_frequency && ` | Allele Frequency: ${mutation.allele_frequency}`}
                                 </p>
                                 {/* Add more mutation details if needed, e.g., mutation_id for linking */}
                             </div>
                         ))}
                     </div>
                 </section>
              )}

             {/* Combined History Section */}
             <section className={`mb-6 p-4 bg-white rounded shadow ${highlightSections?.includeHistory || highlightSections?.includeMeds || highlightSections?.includeAllergies ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-200/50' : ''}`}>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className={highlightSections?.includeHistory ? 'bg-yellow-50 p-2 rounded' : ''}>
                   <h4 className="text-lg font-semibold mb-2 text-gray-700">Medical History</h4>
                   {medicalHistory.length > 0 ? (
                     <ul className="list-disc list-inside text-sm space-y-1">
                       {medicalHistory.map((item, index) => <li key={index}>{item}</li>)}
                     </ul>
                   ) : <p className="text-sm text-gray-500">None reported.</p>}
                 </div>
                 <div className={highlightSections?.includeMeds ? 'bg-yellow-50 p-2 rounded' : ''}>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Current Treatments/Medications</h4>
                    {initialPatientData.treatments && initialPatientData.treatments.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {initialPatientData.treatments.map((treatment, index) => (
                          <li key={index}>
                            {treatment.name} ({treatment.type}) - Started: {formatDate(treatment.start_date)}
                            {treatment.end_date ? `, Ended: ${formatDate(treatment.end_date)}` : ' (Ongoing)'}
                            {treatment.response && ` - Response: ${treatment.response}`}
                            {treatment.notes && <p className="text-xs italic pl-2">Notes: {treatment.notes}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                     currentMedications.length > 0 ? (
                     <ul className="list-disc list-inside text-sm space-y-1">
                       {currentMedications.map((med, index) => (
                         <li key={index}>{med.name} {med.dosage} {med.frequency}</li>
                       ))}
                     </ul>
                     ) : <p className="text-sm text-gray-500">None reported.</p>
                    )}
                 </div>
                 <div className={highlightSections?.includeAllergies ? 'bg-yellow-50 p-2 rounded' : ''}>
                   <h4 className="text-lg font-semibold mb-2 text-gray-700">Allergies</h4>
                   {allergies.length > 0 ? (
                     <ul className="list-disc list-inside text-sm space-y-1">
                       {allergies.map((allergy, index) => <li key={index}>{allergy}</li>)}
                     </ul>
                   ) : <p className="text-sm text-gray-500">None reported.</p>}
                 </div>
               </div>
             </section>

             {/* Recent Labs */}
             <section className={`mb-6 p-4 bg-white rounded shadow ${highlightSections?.includeLabs ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-200/50' : ''}`}>
               <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Recent Labs</h3>
                {initialPatientData.labs && initialPatientData.labs.length > 0 ? (
                 <div className="space-y-4">
                    {initialPatientData.labs.map((lab, index) => (
                     <div key={index} className="p-3 border rounded bg-gray-50 text-sm">
                        <p className="font-semibold">{lab.test} ({formatDate(lab.date)})</p>
                        {lab.results && typeof lab.results === 'object' && Object.keys(lab.results).length > 0 ? (
                       <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            {Object.entries(lab.results).map(([key, res], cIndex) => (
                           <li key={cIndex}>
                                {key}: {res.value} {res.unit}
                                {res.reference_range && ` (Ref: ${res.reference_range})`}
                                {res.status && res.status.toLowerCase() !== 'normal' && 
                                  <span className={`font-bold ${res.status.toLowerCase() === 'high' ? 'text-red-600' : (res.status.toLowerCase() === 'low' ? 'text-blue-600' : 'text-orange-600')}`}> ({res.status})</span>}
                           </li>
                         ))}
                       </ul>
                        ) : <p className="text-xs text-gray-500 italic ml-4">No detailed components available.</p>}
                     </div>
                   ))}
                 </div>
               ) : <p className="text-sm text-gray-500">No recent labs available.</p>}
             </section>

             {/* Imaging Studies */}
             <section className="mb-6 p-4 bg-white rounded shadow">
               <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Imaging Studies</h3>
               {initialPatientData.imagingStudies && initialPatientData.imagingStudies.length > 0 ? (
                 <div className="space-y-4">
                   {initialPatientData.imagingStudies.map((study, index) => (
                     <div key={study.studyId || index} className="p-3 border rounded bg-gray-50 text-sm">
                       <p className="font-semibold">{study.type} ({study.modality}) - {formatDate(study.date)} - Status: {study.status}</p>
                       <p className="mt-1 whitespace-pre-wrap">{study.reportText}</p>
                       {/* Conceptual: Add button to view image if PACS integration existed */}
                       {study.imageAccess && (
                          <p className="mt-1 text-xs text-gray-500">Accession: {study.imageAccess.accessionNumber}</p>
                        )}
                     </div>
                   ))}
                 </div>
               ) : <p className="text-sm text-gray-500">No imaging studies available.</p>}
             </section>

             {/* Patient Generated Health Data */}
             {initialPatientData.patientGeneratedHealthData && (
               <section className="mb-6 p-4 bg-white rounded shadow">
                 <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Patient Generated Health Data</h3>
                 <div className="text-sm space-y-2">
                   <p><strong>Source:</strong> {initialPatientData.patientGeneratedHealthData.source || 'N/A'}</p>
                   <p><strong>Last Sync:</strong> {formatDate(initialPatientData.patientGeneratedHealthData.lastSync)}</p>
                   {initialPatientData.patientGeneratedHealthData.summary && (
                     <div className="mt-2 p-3 border rounded bg-blue-50">
                       <h4 className="font-semibold text-base mb-1">Summary (Last 7 Days)</h4>
                       <p>Avg Steps: {initialPatientData.patientGeneratedHealthData.summary.averageStepsLast7Days ?? 'N/A'}</p>
                       <p>Avg Resting HR: {initialPatientData.patientGeneratedHealthData.summary.averageRestingHeartRateLast7Days ?? 'N/A'} bpm</p>
                       <p>Avg Sleep: {initialPatientData.patientGeneratedHealthData.summary.averageSleepHoursLast7Days ?? 'N/A'} hours</p>
                       {initialPatientData.patientGeneratedHealthData.summary.significantEvents?.length > 0 && (
                         <div className="mt-2">
                           <h5 className="font-semibold">Significant Events:</h5>
                           <ul className="list-disc list-inside ml-4">
                             {initialPatientData.patientGeneratedHealthData.summary.significantEvents.map((event, eIndex) => (
                               <li key={eIndex} className="text-orange-700">{formatDate(event.date)} - {event.type}: {event.detail}</li>
                             ))}
                           </ul>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
               </section>
             )}

             {/* Notes */}
             <section className={`mb-6 p-4 bg-white rounded shadow ${highlightSections?.includeNotes ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-200/50' : ''}`}>
               <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Progress Notes</h3>
               {initialPatientData.notes && initialPatientData.notes.length > 0 ? (
                 <div className="space-y-4">
                    {initialPatientData.notes.map((note, index) => (
                      <div key={note.noteId || `note-${index}`} className="p-3 border rounded bg-gray-50 text-sm">
                        <p className="font-semibold">{formatDate(note.date)} - {note.author || 'N/A'} ({note.type || 'Note'})</p>
                        <p className="mt-1 whitespace-pre-wrap">{note.content || note.text || 'No content.'}</p>
                     </div>
                   ))}
                 </div>
               ) : <p className="text-sm text-gray-500">No notes available.</p>}
             </section>

             {/* --- Consultation Panel (Renders if Dr. A initiated or Dr. B switched back) --- */}
             {isConsultPanelOpen && currentConsultation && (
             <div className="absolute top-16 right-5 z-20"> {/* Adjusted top positioning slightly */} 
               <ConsultationPanel 
                 patientId={patientId}
                 consultationRoomId={currentConsultation.roomId}
                 currentUser={currentUser}
                 participants={currentConsultation.participants}
                 initialContext={currentConsultation.initialContext}
                 onClose={handleCloseConsultation}
               />
             </div>
           )}

              {/* --- Contextual Suggestion Chips --- */}
              {suggestionChips.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Contextual Suggestions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestionChips.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => {
                          const targetElement = document.getElementById(chip.targetElementId);
                          if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Optional: Add a temporary highlight to the target element
                            targetElement.classList.add('ring-2', 'ring-yellow-400', 'ring-offset-2', 'transition-all', 'duration-300');
                            setTimeout(() => {
                              targetElement.classList.remove('ring-2', 'ring-yellow-400', 'ring-offset-2');
                            }, 2500);
                          } else {
                            console.warn(`Target element for chip not found: ${chip.targetElementId}`);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors 
                          ${chip.type === 'genomic' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                            (chip.type === 'deep_dive' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                        `}
                        title={`Scroll to: ${chip.text}`}
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}


          </div> // This is the main wrapper div ending around line 1530
        ); // <-- Add this line manually
    } // This is the closing brace for the 'else'
}; // This is the closing brace for the component

// PropTypes for basic type checking
PatientRecordViewer.propTypes = {
  patientData: PropTypes.shape({
    patientId: PropTypes.string,
    demographics: PropTypes.object,
    diagnosis: PropTypes.object,
    medicalHistory: PropTypes.array,
    currentMedications: PropTypes.array,
    allergies: PropTypes.array,
    recentLabs: PropTypes.array,
    imagingStudies: PropTypes.array,
    patientGeneratedHealthData: PropTypes.object,
    notes: PropTypes.array
  }).isRequired // Make patientData required
};

export default PatientRecordViewer; 