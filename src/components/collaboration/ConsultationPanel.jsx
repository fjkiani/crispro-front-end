import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import useWebSocket from '../../hooks/useWebSocket'; // <<<- IMPORTANT: Check if this path is correct relative to src/components/collaboration
import FormattedAnalysisContent from '../utils/FormattedAnalysisContent'; // <-- IMPORT

const ConsultationPanel = ({ 
  patientId, 
  consultationRoomId, 
  currentUser, // e.g., { id: 'dr_a', name: 'Dr. A' }
  participants, // e.g., [{ id: 'dr_b', name: 'Dr. B' }]
  initialContext, // Optional: e.g., { type: 'lab', id: 'lab123', description: 'Glucose 110 mg/dL' }
  onClose // Function to close the panel
}) => {

  // --- Add Logging --- 
  console.log('[ConsultPanel] Rendering with props:', {
      patientId,
      consultationRoomId,
      currentUser,
      participants,
      initialContext
  });
  // --- End Logging ---

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]); // Array to hold message objects { senderId, senderName, text, timestamp, type: 'chat'|'agent'|'system' }
  const messagesEndRef = useRef(null); // To scroll to bottom

  // --- State for Deep Dive ---
  const [deepDiveResult, setDeepDiveResult] = useState(null); // To store { deep_dive_sections: [] }
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);
  const [deepDiveError, setDeepDiveError] = useState(null);

  // --- State for Consultation Synthesis ---
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState(null);
  const [synthesisError, setSynthesisError] = useState(null);

  // --- State for Initiator Note Analysis (if this panel handles it) ---
  // Assuming the analysis result of the initiator's note is stored
  // This might be passed as a prop or fetched if this panel is responsible
  const [noteAnalysisResult, setNoteAnalysisResult] = useState(null); 
  // TODO: Populate noteAnalysisResult appropriately if this panel generates/receives it.
  // For now, we'll assume it gets populated by some other mechanism or is passed.
  // Example: if another agent provides it via WebSocket:
  // else if (type === 'initiator_note_analysis_result') { // Hypothetical type
  //   setNoteAnalysisResult(lastWsMessage.content);
  //   shouldAddToMessages = false; 
  // }

  // --- WebSocket Connection ---
  // TODO: Securely generate/retrieve auth token
  const authToken = `valid_token_${currentUser?.id || 'unknown'}`; 
  const WS_ROOT = import.meta.env.VITE_WS_ROOT || 'ws://localhost:8008'; // Default for local if not set
  const wsUrl = consultationRoomId ? `${WS_ROOT}/ws` : null; // Use generic endpoint, room handled by join message

  const {
    isConnected: isWsConnected,
    lastMessage: lastWsMessage,
    sendMessage: sendWsMessage,
    error: wsError,
    readyState: wsReadyState
  } = useWebSocket(wsUrl, authToken, consultationRoomId); // Pass room ID to useWebSocket hook

  // --- Add Logging --- 
  useEffect(() => {
      console.log('[ConsultPanel] WebSocket State:', {
          url: wsUrl,
          tokenUsed: authToken,
          room: consultationRoomId,
          isConnected: isWsConnected,
          readyState: wsReadyState,
          error: wsError
      });
  }, [wsUrl, authToken, consultationRoomId, isWsConnected, wsReadyState, wsError]);
  // --- End Logging ---

  // --- Message Handling ---
  useEffect(() => {
    if (lastWsMessage) {
      // Log the entire message received by the panel
      console.log("[ConsultPanel] Raw incoming message:", JSON.stringify(lastWsMessage, null, 2)); 
      const { type, command, patientId: msgPatientId } = lastWsMessage; // Added patientId from message

      let receivedMsg = null;
      let shouldAddToMessages = true; // Flag to control adding to messages array

      if (type === 'chat_message') {
         console.log("[ConsultPanel] Handling chat_message");
         // Need to handle sender being an object
         const senderName = typeof lastWsMessage.sender === 'object' ? lastWsMessage.sender.name : (lastWsMessage.senderName || 'System');
         const senderId = typeof lastWsMessage.sender === 'object' ? lastWsMessage.sender.id : (lastWsMessage.senderId || 'system');
         receivedMsg = {
             senderId: senderId,
             senderName: senderName, 
             text: lastWsMessage.content || lastWsMessage.text || JSON.stringify(lastWsMessage), // Prioritize content, then text
             timestamp: lastWsMessage.timestamp || Date.now(),
             type: 'chat' // Explicitly set type for rendering
         };
      } else if (type === 'agent_response') { // Corrected type check
         console.log("[ConsultPanel] Handling agent_response"); 
         
         let agentText = lastWsMessage.text || "Agent response received, but text is missing."; // Get text directly
         const agentStatus = lastWsMessage.status || "success"; // Check status
         const agentName = lastWsMessage.sender || "ai_agent"; // Get agent name from sender field
         const agentDisplayName = agentName.replace("_", " ").title(); // Format display name

         if(agentStatus === 'failure') {
             agentText = `AI Error (${agentDisplayName}): ${lastWsMessage.error || agentText}`;
             console.log("[ConsultPanel] Handled agent failure status:", agentText);
         }
         
         receivedMsg = {
             senderId: 'agent', // Use generic 'agent' ID or specific agentName
             senderName: agentDisplayName, 
             text: agentText,
             timestamp: lastWsMessage.timestamp || Date.now(),
             type: 'agent' // Keep type as 'agent' for styling
         };
         console.log("[ConsultPanel] Prepared agent message object:", receivedMsg);
      } else if (type === 'agent_output' && command === 'summarize_deep_dive') { // Specifically handle deep dive result
        console.log("[ConsultPanel] Handling agent_output for summarize_deep_dive (Deep Dive Result):", lastWsMessage);
        setIsDeepDiveLoading(false);
        if (lastWsMessage.result && lastWsMessage.result.deep_dive_sections) {
          setDeepDiveResult({ deep_dive_sections: lastWsMessage.result.deep_dive_sections });
          setDeepDiveError(null);
          // Optionally add a system message to the chat
          receivedMsg = {
            senderId: 'system',
            senderName: 'System',
            text: `Deep Dive Analysis for patient ${patientId} is ready. Scroll down to view.`,
            timestamp: Date.now(),
            type: 'system'
          };
        } else {
          const errorMsg = lastWsMessage.error || "Deep dive analysis failed to return expected data.";
          console.error("[ConsultPanel] Deep Dive Error:", errorMsg, lastWsMessage);
          setDeepDiveError(errorMsg);
          setDeepDiveResult(null);
           receivedMsg = {
            senderId: 'system',
            senderName: 'System Alert',
            text: `Error in Deep Dive: ${errorMsg}`,
            timestamp: Date.now(),
            type: 'system'
          };
        }
      } else if (type === 'consultation_synthesis_result') {
        console.log("[ConsultPanel] Handling consultation_synthesis_result:", lastWsMessage);
        // --- Corrected State Setters --- 
        setIsSynthesizing(false); // Stop loading indicator for Synthesis
        if (msgPatientId === undefined || msgPatientId === patientId) {
            if (lastWsMessage.content) {
                setSynthesisResult(lastWsMessage.content); // Use Synthesis state setter
                setSynthesisError(null); // Use Synthesis state setter
            } else {
                const errorMsg = lastWsMessage.error || "Synthesis result content is missing.";
                console.error("[ConsultPanel] Synthesis Error:", errorMsg, lastWsMessage);
                setSynthesisError(errorMsg); // Use Synthesis state setter
                setSynthesisResult(null); // Use Synthesis state setter
            }
        } else {
            console.warn(`[ConsultPanel] Received synthesis result for patient ${msgPatientId}, but current panel is for ${patientId}. Ignoring.`);
        }
        // --- End Corrected State Setters ---
        shouldAddToMessages = false; // This is a state update, not a chat message
      } else if (type === 'initiator_note_analysis') { // Assuming this type comes from backend
        console.log("[ConsultPanel] Handling initiator_note_analysis:", lastWsMessage);
        if (lastWsMessage.analysis) {
            setNoteAnalysisResult(lastWsMessage.analysis); // Populate note analysis
             // Add a system message to the chat
            receivedMsg = {
                senderId: 'system',
                senderName: 'System',
                text: `AI analysis of initiator's note is ready.`,
                timestamp: Date.now(),
                type: 'system'
            };
        } else {
            console.error("[ConsultPanel] Initiator note analysis content missing:", lastWsMessage);
        receivedMsg = {
                senderId: 'system',
                senderName: 'System Alert',
                text: `Error: Initiator note analysis content missing.`,
                timestamp: Date.now(),
                type: 'system'
            };
        }
        // shouldAddToMessages is true by default, so it will be added to chat
      } else if (type === 'error') {
         console.log("[ConsultPanel] Handling error message type");
         receivedMsg = {
             senderId: 'system', senderName: 'System', text: `Error: ${lastWsMessage.message}`, timestamp: Date.now(), type: 'system' 
         };
      } else if (type === 'system_message') { // Handle the system message we added
          console.log("[ConsultPanel] Handling system_message");
          receivedMsg = {
             senderId: 'system',
             senderName: 'System',
             text: lastWsMessage.content || 'System update.',
             timestamp: lastWsMessage.timestamp || Date.now(),
             type: 'system' 
         };
      }
      // Ignore auth/join messages handled by the hook itself
      else {
          console.log(`[ConsultPanel] Ignoring message type: ${type}`);
      }

      if(receivedMsg && shouldAddToMessages){
           console.log("[ConsultPanel] Adding message to state:", receivedMsg);
           setMessages(prevMessages => [...prevMessages, receivedMsg]);
      }
    }
  }, [lastWsMessage]);

  // Effect to scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
    
   // Effect to handle WebSocket connection errors
   useEffect(() => {
     if (wsError) {
        setMessages(prevMessages => [...prevMessages, {
            senderId: 'system', senderName: 'System', text: `WebSocket Error: ${wsError.message}`, timestamp: Date.now(), type: 'system' 
        }]);
     }
   }, [wsError]);


  // --- Sending Messages & Commands ---
  const handleSendMessage = useCallback(() => {
    const messageText = newMessage.trim();
    if (!messageText || !isWsConnected) return;

    let messageToSend = null;

    // Check for specific agent commands
    if (messageText.startsWith('/compare-therapy') || messageText.startsWith('/draft-patient-info')) {
        // Send the raw command text as a message
        // The backend's handle_message_for_agent will parse it
        console.log(`Sending agent command via text: ${messageText}`);
        messageToSend = {
            type: 'agent_command_text', // Use a specific type for raw command text
            roomId: consultationRoomId, // Use roomId from props
            sender: { // Use sender object
                id: currentUser.id,
                name: currentUser.name 
            },
            patientId: patientId, // Include patientId from props
            text: messageText,
            timestamp: Date.now()
        };
    } else {
        // Standard chat message
        messageToSend = {
            type: 'chat_message', 
            roomId: consultationRoomId, // Use roomId from props
            sender: { // Use sender object
                id: currentUser.id,
                name: currentUser.name 
            },
            patientId: patientId, // Include patientId from props
            content: messageText, // Use 'content' key as expected by backend chat handling
            text: messageText, // Also keep text for optimistic UI or if backend uses it
            timestamp: Date.now()
        };
    }

    console.log("Sending WebSocket message:", messageToSend);
    sendWsMessage(messageToSend); // Send the structured message object
    setNewMessage(''); // Clear input field
    
    // Optimistic UI update (optional) - Add user's own message locally immediately
    // if (messageToSend.type === 'chat_message') {
    //     setMessages(prevMessages => [...prevMessages, { 
    //         senderId: currentUser.id, 
    //         senderName: currentUser.name, 
    //         text: messageText, 
    //         timestamp: messageToSend.timestamp,
    //         type: 'chat' 
    //     }]); 
    // }

  }, [newMessage, isWsConnected, sendWsMessage, consultationRoomId, currentUser, patientId]); // Added patientId

  const handleSendCommand = useCallback((command, params) => {
      if (!isWsConnected) return;

      const commandToSend = {
        type: 'agent_command', 
        roomId: consultationRoomId,
        sender: { 
             id: currentUser.id,
             name: currentUser.name 
        },
        patientId: patientId, 
        command: command,
        timestamp: Date.now()
      };

      if (params) {
        commandToSend.params = params;
      }

      console.log("Sending agent command:", commandToSend);
      sendWsMessage(commandToSend);
      
      if (command === 'summarize_deep_dive') {
        setIsDeepDiveLoading(true);
        setDeepDiveError(null);
        setDeepDiveResult(null);
        setMessages(prevMessages => [...prevMessages, {
            senderId: 'system',
            senderName: 'System',
            text: `Requesting Deep Dive Analysis for patient ${patientId}...`,
            timestamp: Date.now(),
            type: 'system'
        }]);
      } else if (command === 'synthesize_consultation') {
        setIsSynthesizing(true);
        setSynthesisError(null);
        setSynthesisResult(null);
        setMessages(prevMessages => [...prevMessages, {
            senderId: 'system',
            senderName: 'System',
            text: `Processing command: ${command}...`,
            timestamp: Date.now(),
            type: 'system'
        }]);
      }

  }, [isWsConnected, sendWsMessage, consultationRoomId, currentUser, patientId]);

  // Function to send predefined chat messages - Added replyingToTimestamp
  const handleSendPredefinedMessage = useCallback((text, replyingToTimestamp) => {
      if (!isWsConnected) return;
      const messageToSend = {
          type: 'chat_message',
          room: consultationRoomId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: text, // Use the predefined text
          timestamp: Date.now(), // Timestamp of this new message
          replyingToTimestamp: replyingToTimestamp // Link to the original AI message
      };
      console.log("Sending predefined chat message:", messageToSend);
      sendWsMessage(messageToSend);
      // Optionally add optimistic UI update here if needed
  }, [isWsConnected, sendWsMessage, consultationRoomId, currentUser]);

  // Handle Enter key press in input
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default Enter behavior (new line)
      handleSendMessage();
    }
  };

  // --- Add Logging --- 
  useEffect(() => {
      console.log("[ConsultPanel] Initial context received:", initialContext);
      if (initialContext?.description) {
          // Add initial context as a system message
          const systemMsg = {
              senderId: 'system',
              senderName: 'System',
              text: `Consultation started regarding: ${initialContext.description}`,
              timestamp: Date.now(),
              type: 'system'
          };
          setMessages([systemMsg]); // Start with the context message
          console.log("[ConsultPanel] Added initial context message:", systemMsg);
      }
  }, [initialContext]); // Run only when initialContext changes (effectively on mount/prop change)
  // --- End Logging ---

  // --- Function to request consultation synthesis ---
  const requestConsultationSynthesis = useCallback(() => {
    if (!isWsConnected) {
      setSynthesisError("Cannot synthesize: Not connected to server.");
      return;
    }
    if (!initialContext) { // Or !noteAnalysisResult if that's a hard dependency
      setSynthesisError("Cannot synthesize: Missing initial consultation context or note analysis.");
      // Optionally add a system message to chat
      setMessages(prevMessages => [...prevMessages, {
        senderId: 'system', senderName: 'System Alert',
        text: "Synthesis requires initial context and AI note analysis.",
        timestamp: Date.now(), type: 'system'
      }]);
      return;
    }

    console.log("[ConsultPanel] Requesting consultation synthesis with context:", initialContext, "and note analysis:", noteAnalysisResult);
    
    // setIsSynthesizing(true); // Moved to handleSendCommand
    // setSynthesisError(null);
    // setSynthesisResult(null);

    const synthesisParams = {
      initial_context: initialContext, // Pass the whole initialContext object
      initiator_note_analysis: noteAnalysisResult // Pass the AI analysis of the initiator's note
    };

    handleSendCommand('synthesize_consultation', synthesisParams);
    // The optimistic "Processing..." message is now handled in handleSendCommand

  }, [isWsConnected, initialContext, noteAnalysisResult, handleSendCommand, patientId]);

  // --- Rendering Logic ---
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Error formatting timestamp:", timestamp, e);
      return 'Invalid Date';
    }
  };

  // --- UI Elements ---
  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span>Consultation: Patient {patientId}</span>
        <button onClick={onClose} style={closeButtonStyle}>&times;</button>
      </div>

      {/* Participants */}
      <div style={participantsStyle}>
        Participants: {currentUser.name}, {participants.map(p => p.name).join(', ')}
      </div>

      {/* Logging for Button Visibility */}
      {console.log('[ConsultPanel Button Visibility] currentUser.id:', currentUser?.id)}
      {console.log('[ConsultPanel Button Visibility] initialContext?.initiator?.id:', initialContext?.initiator?.id)}
      {console.log('[ConsultPanel Button Visibility] Condition (currentUser.id !== initialContext?.initiator?.id):', currentUser?.id !== initialContext?.initiator?.id)}
      {console.log('[ConsultPanel Button Visibility] noteAnalysisResult (is populated?):', !!noteAnalysisResult)}

      {/* Action Buttons Area */}
      <div style={actionsAreaStyle}> 
        <button 
          style={actionButtonStyle(isDeepDiveLoading || !isWsConnected)}
          onClick={() => handleSendCommand('summarize_deep_dive')}
          disabled={isDeepDiveLoading || !isWsConnected}
        >
          {isDeepDiveLoading ? "Loading Deep Dive..." : "Deep Analysis (Patient)"}
        </button>
        {/* Button to trigger Consultation Synthesis */}
        {/* This button should likely only be visible to the recipient, 
            and perhaps only after the initiator's note has been analyzed. */}
        {currentUser.id !== initialContext?.initiator?.id && noteAnalysisResult && ( // Example visibility
            <button
                style={actionButtonStyle(isSynthesizing || !isWsConnected)}
                onClick={requestConsultationSynthesis}
                disabled={isSynthesizing || !isWsConnected}
            >
                {isSynthesizing ? "Synthesizing Plan..." : "🚀 Generate Consult Plan"}
            </button>
        )}
      </div>

      {/* Message Display Area */}
      <div style={messagesAreaStyle}>
        {messages.map((msg, index) => (
          <div key={index} style={messageStyle(msg.senderId === currentUser.id, msg.type)}>
            <span style={senderNameStyle(msg.senderId === currentUser.id, msg.type)}>
                {msg.senderName} ({formatTimestamp(msg.timestamp)})
            </span>
            <p style={messageTextStyle}>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling */} 
      </div>

      {/* Deep Dive Display Area */}
      {isDeepDiveLoading && <div style={loadingStyle}>Loading Deep Dive Analysis...</div>}
      {deepDiveError && <div style={errorStyle}>Error: {deepDiveError}</div>}
      {deepDiveResult && deepDiveResult.deep_dive_sections && (
        <div style={deepDiveContainerStyle}>
          <h4 style={deepDiveHeaderStyle}>Patient Deep Dive Analysis</h4>
          {deepDiveResult.deep_dive_sections.map((section, index) => (
            <div key={index} style={deepDiveSectionStyle}>
              <h5 style={deepDiveSectionTitleStyle}>
                {section.source ? `${section.source}: ${section.topic}` : section.topic}
              </h5>
              <FormattedAnalysisContent content={section.elaboration} />
            </div>
          ))}
        </div>
      )}

      {/* Consultation Synthesis Display Area */}
      {isSynthesizing && <div style={loadingStyle}>Synthesizing Plan...</div>}
      {synthesisError && <div style={errorStyle}>Synthesis Error: {synthesisError}</div>}
      {synthesisResult && (
        <div style={deepDiveContainerStyle}> {/* Re-use style or create new */}
          <h4 style={deepDiveHeaderStyle}>Synthesized Consultation Plan</h4>
          <FormattedAnalysisContent content={synthesisResult} />
        </div>
      )}

      {/* Message Input Area */}
      <div style={inputAreaStyle}>
        <textarea
          style={textareaStyle}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress} // Use onKeyPress for Enter
          placeholder="Type your message or command..."
          rows={3}
          disabled={!isWsConnected}
        />
        <button 
          style={sendButtonStyle(!isWsConnected || !newMessage.trim())} 
          onClick={handleSendMessage} 
          disabled={!isWsConnected || !newMessage.trim()}
        >
          Send
        </button>
      </div>

      {/* WebSocket Status */}
      <div style={statusStyle(isWsConnected)}>
        {isWsConnected ? 'Connected' : 'Connecting...'}
      </div>
    </div>
  );
};

ConsultationPanel.propTypes = {
  patientId: PropTypes.string.isRequired,
  consultationRoomId: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({ 
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  participants: PropTypes.arrayOf(PropTypes.shape({ 
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  initialContext: PropTypes.object, // Can be any object
  onClose: PropTypes.func.isRequired,
};

// --- Basic Inline Styles (Replace with CSS Modules or Styled Components in a real app) ---
const panelStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '400px',
  height: '500px',
  backgroundColor: 'white',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1000, // Ensure it's above other content
  overflow: 'hidden', // Added to prevent children from breaking border radius
};

const headerStyle = {
  padding: '10px 15px',
  borderBottom: '1px solid #eee',
  backgroundColor: '#f7f7f7',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 'bold',
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer',
    color: '#666',
};

const participantsStyle = {
    padding: '5px 15px',
    fontSize: '0.8em',
    color: '#555',
    borderBottom: '1px solid #eee',
};

const messagesAreaStyle = {
  flexGrow: 1,
  overflowY: 'auto',
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const messageStyle = (isCurrentUser, messageType) => ({
  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  maxWidth: '80%',
  padding: '8px 12px',
  borderRadius: '15px',
  backgroundColor: messageType === 'agent' ? '#e1f5fe' : (isCurrentUser ? '#dcf8c6' : '#f1f0f0'),
  wordWrap: 'break-word',
});

const senderNameStyle = (isCurrentUser, messageType) => ({
  display: 'block',
  fontSize: '0.75em',
  fontWeight: 'bold',
  color: messageType === 'agent' ? '#0277bd' : (isCurrentUser ? '#555' : '#333'),
  marginBottom: '3px',
});

const messageTextStyle = {
    margin: 0, // Remove default paragraph margins
    fontSize: '0.9em',
    whiteSpace: 'pre-wrap', // Preserve whitespace and newlines
};

const inputAreaStyle = {
  display: 'flex',
  padding: '10px',
  borderTop: '1px solid #eee',
  gap: '10px',
};

const textareaStyle = {
  flexGrow: 1,
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  resize: 'none',
  fontFamily: 'inherit', // Ensure font matches the rest of the app
};

const sendButtonStyle = (disabled) => ({
  padding: '10px 15px',
  backgroundColor: disabled ? '#ccc' : '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const statusStyle = (isConnected) => ({
    padding: '5px 15px',
    fontSize: '0.75em',
    textAlign: 'center',
    color: isConnected ? 'green' : 'orange',
    backgroundColor: '#f7f7f7',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
});

// Suggested Actions Style (Example)
const suggestedActionsStyle = {
  padding: '5px 15px',
  display: 'flex',
  gap: '5px',
  flexWrap: 'wrap',
  borderTop: '1px solid #eee',
};

const suggestedButtonStyle = (enabled) => ({
    padding: '4px 8px',
    fontSize: '0.8em',
    backgroundColor: enabled ? '#e0e0e0' : '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '10px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    color: enabled ? '#333' : '#999',
});

// --- Styles for Action Buttons Area ---
const actionsAreaStyle = {
  padding: '10px 15px',
  borderBottom: '1px solid #eee',
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap', // Allow buttons to wrap
};

const actionButtonStyle = (disabled) => ({
  padding: '8px 12px',
  fontSize: '0.9em',
  backgroundColor: disabled ? '#e0e0e0' : '#007bff', // Example: blue
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.7 : 1,
});

// --- Styles for Deep Dive Display ---
const deepDiveContainerStyle = {
  padding: '15px',
  borderTop: '1px solid #eee',
  maxHeight: '200px', // Example max height, adjust as needed
  overflowY: 'auto',
  backgroundColor: '#f9f9f9',
};

const deepDiveHeaderStyle = {
  marginTop: 0,
  marginBottom: '10px',
  fontSize: '1.1em',
  color: '#333',
};

const deepDiveSectionStyle = {
  marginBottom: '15px',
};

const deepDiveSectionTitleStyle = {
  fontWeight: 'bold',
  fontSize: '1em',
  color: '#555',
  marginBottom: '5px',
};

const loadingStyle = {
  padding: '10px',
  textAlign: 'center',
  color: '#555',
  backgroundColor: '#f0f0f0',
};

const errorStyle = {
  padding: '10px',
  textAlign: 'center',
  color: 'red',
  backgroundColor: '#ffebee',
};

export default ConsultationPanel; 