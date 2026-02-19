import { useState, useEffect, useRef } from 'react';
import { Q2C_ROUTER } from './Q2CRouter';
import { processEvidenceData } from './utils';
import { useCoPilot } from './context';
import { useSporadic } from '../../context/SporadicContext'; // ⚔️ NEW: Sporadic Cancer Integration
import { usePatient } from '../../context/PatientContext'; // ⚔️ Phase 9: Real Patient Data
import { CoPilotUtils } from './utils/CoPilotUtils';
import { API_ROOT } from '../../lib/apiConfig';

/**
 * CoPilot Logic Component
 * Handles all business logic, API interactions, and state management
 */
export const useCoPilotLogic = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your Clinical AI Co-Pilot. I can help you understand genetic variants, research papers, and clinical insights. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "What is the functional impact of BRAF p.Val600Glu?",
        "How common are KRAS mutations in colorectal cancer?",
        "What treatments are available for TP53 variants?"
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [copilotConfig, setCopilotConfig] = useState(null);
  const messagesEndRef = useRef(null);

  const {
    currentPage,
    currentVariant,
    currentDisease,
    chatHistory,
    setChatHistory,
    unreadCount,
    setUnreadCount,
    // ⚔️ TREATMENT LINE INTEGRATION - Get treatment history from context
    treatmentHistory
  } = useCoPilot();

  // ⚔️ SPORADIC CANCER INTEGRATION - Get sporadic context
  const { germlineStatus, tumorContext } = useSporadic();

  // ⚔️ Phase 9: REAL PATIENT CONTEXT
  const { currentPatient, patientProfile, setPatientProfile } = usePatient();
  const activePatient = currentPatient || patientProfile;

  // API Root configuration

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Co-Pilot config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_ROOT}/api/efficacy/config`);
        if (response.ok) {
          const config = await response.json();
          setCopilotConfig(config);
        }
      } catch (error) {
        console.warn('Co-Pilot config fetch failed:', error);
      }
    };
    fetchConfig();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate context-aware suggestions
  const getContextSuggestions = () => {
    if (currentVariant) {
      const gene = currentVariant.gene || '';
      const hgvs_p = currentVariant.hgvs_p || '';
      const disease = currentDisease || 'cancer';

      return [
        `What is the functional impact of ${gene} ${hgvs_p}?`,
        `How does ${gene} ${hgvs_p} affect ${disease} treatment?`,
        `What are the clinical outcomes for ${gene} ${hgvs_p} in ${disease}?`,
        `Are there targeted therapies for ${gene} ${hgvs_p}?`,
        `How common is ${gene} ${hgvs_p} in the population?`,
        `What research papers discuss ${gene} ${hgvs_p}?`
      ];
    }

    return [
      "What is the functional impact of BRAF p.Val600Glu?",
      "How common are KRAS mutations in colorectal cancer?",
      "What treatments are available for TP53 variants?",
      "Explain the clinical significance of EGFR mutations",
      "What are the latest findings on immunotherapy resistance?"
    ];
  };

  // Handle sending a message
  const handleSendMessage = async (messageText = '') => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Phase 1: Q2C Router - Classify intent and route to appropriate endpoint
      const intent = Q2C_ROUTER.classifyIntent(messageText);
      // ⚔️ TREATMENT LINE INTEGRATION - Include treatment history in context
      const context = {
        variant: currentVariant,
        disease: currentDisease,
        page: currentPage,
        question: messageText,
        analysisResults: null,
        treatmentHistory: treatmentHistory,  // ⚔️ Treatment line support
        germlineStatus: germlineStatus,      // ⚔️ NEW: Sporadic cancer support
        tumorContext: tumorContext,          // ⚔️ NEW: Sporadic cancer support
        patientProfile: activePatient        // ⚔️ Phase 9: Real Patient Context
      };

      let payload, endpoint, suggestedActions;

      if (intent) {
        // Use Q2C routing for structured queries
        payload = Q2C_ROUTER.generatePayload(intent, context);
        endpoint = intent.endpoint;
        suggestedActions = Q2C_ROUTER.getSuggestedActions(intent, context);

        // Filter actions to only live endpoints (Doctrine requirement)
        const liveEndpoints = [
          '/api/efficacy/predict',
          '/api/evidence/literature',
          '/api/evidence/deep_analysis',
          '/api/evidence/rag-query',
          '/api/evo/score_variant_profile',
          '/api/evo/score_variant_probe'
        ];

        // Guard against RAG if GEMINI_API_KEY missing
        const ragAvailable = copilotConfig?.feature_flags?.enable_rag_query !== false;
        if (!ragAvailable) {
          liveEndpoints.splice(liveEndpoints.indexOf('/api/evidence/rag-query'), 1);
        }

        suggestedActions = suggestedActions.filter(action =>
          liveEndpoints.includes(action.endpoint)
        );

        console.log('Q2C Router - Classified Intent:', {
          intent: intent.intent,
          confidence: intent.confidence,
          endpoint: endpoint,
          payload: payload,
          filteredActions: suggestedActions.length
        });
      } else {
        // Fallback to general RAG for unstructured queries
        payload = {
          query: messageText,
          gene: currentVariant?.gene,
          hgvs_p: currentVariant?.hgvs_p,
          disease: currentDisease,
          max_context_papers: 3
        };
        endpoint = '/api/evidence/rag-query';
        suggestedActions = [];
      }

      // Endpoint selection adjustments
      if (intent && intent.intent === 'drug_efficacy') {
        const hasMut = Array.isArray(payload?.mutations) && payload.mutations.length > 0;
        if (!hasMut) {
          endpoint = '/api/evidence/literature';
        }
      }

      // Call appropriate API endpoint
      const response = await fetch(`${API_ROOT}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let friendlyMessage = '';

        if (response.status === 404) {
          friendlyMessage = 'This analysis isn\'t available yet. Try asking about literature or variant impact instead.';
        } else if (response.status === 503) {
          friendlyMessage = 'The analysis service is temporarily unavailable. I can still help with literature searches and general questions.';
        } else if (response.status === 400) {
          friendlyMessage = 'I need more information to answer that question. Could you be more specific about the variant or gene?';
        } else if (response.status >= 500) {
          friendlyMessage = 'There was a server error. Please try again or ask a different question.';
        } else {
          friendlyMessage = `Request failed (${response.status}). Please try rephrasing your question.`;
        }

        throw new Error(friendlyMessage);
      }

      const data = await response.json();

      // Phase 2: Process Real Evidence Data from Backend
      const evidenceData = processEvidenceData(data);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.answer || data.summary || 'I\'ve processed your request but need more information to provide a complete answer.',
        timestamp: new Date(),

        // Real Evidence Data (Phase 2)
        ...evidenceData,

        // Fallback to direct data fields if evidence processor doesn't catch them
        evidence_level: data.evidence_level || data.tier || evidenceData.evidence_level,
        confidence_score: data.confidence_score || data.confidence || evidenceData.confidence_score,
        supporting_papers: data.supporting_papers || data.papers || data.citations || evidenceData.supporting_papers,
        query_type: data.query_type,

        // Provenance & Governance (Doctrine requirement)
        run_signature: data.run_signature,
        operational_mode: data.operational_mode,
        scoring_mode: data.scoring_mode,
        feature_flags: data.feature_flags,

        // Evidence from efficacy/deep analysis
        backend_badges: data.drugs?.[0]?.badges || data.badges || [],
        evidence_tier: data.drugs?.[0]?.evidence_tier || data.evidence_tier,
        top_citations: data.drugs?.[0]?.evidence_manifest?.citations?.slice(0, 3) ||
          data.evidence_manifest?.citations?.slice(0, 3) || [],

        // Q2C Router data (Phase 1)
        intent: intent?.intent,
        intent_confidence: intent?.confidence,
        suggested_actions: suggestedActions,
        suggestions: getContextSuggestions().slice(0, 3)
      };

      setMessages(prev => [...prev, botMessage]);

      // Update chat history
      setChatHistory(prev => [...prev, {
        query: messageText,
        response: data.answer,
        timestamp: new Date(),
        page: currentPage,
        variant: currentVariant
      }]);

    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `I apologize, but I encountered an error while processing your question. Please try again or rephrase your question. Error: ${error.message}`,
        timestamp: new Date(),
        isError: true,
        suggestions: getContextSuggestions().slice(0, 2)
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };




  // ⚔️ Phase 9: File Upload & OCR Analysis
  const handleFileUpload = async (file) => {
    if (!file) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `📄 Uploaded: ${file.name}`,
      timestamp: new Date(),
      isFileUpload: true
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', 'onboarding');

      const response = await fetch(`${API_ROOT}/api/copilot/analyze_file`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze file');

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `I've analyzed **${file.name}**. \n\n${data.reasoning}\n\nWould you like to update the patient profile with these findings?`,
        timestamp: new Date(),
        isConfirmationRequest: true,
        confirmationData: data.profile_update,
        suggested_actions: data.suggested_actions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("OCR Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "❌ I couldn't read that file. Please make sure it's a clear PDF or Image.",
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Phase 3: Quick Action Handlers - Real API Integration
  const handleQuickAction = async (action, originalMessage) => {
    if (!action || !action.endpoint) return;

    try {
      // Create action-in-progress message
      const actionMessage = {
        id: Date.now() + 2,
        type: 'bot',
        content: `🔄 Executing: ${action.label}...`,
        timestamp: new Date(),
        isActionInProgress: true,
        actionLabel: action.label
      };

      setMessages(prev => [...prev, actionMessage]);

      // Prepare payload for the action endpoint
      const actionPayload = {
        ...action.payload,
        triggered_by: 'copilot_quick_action',
        original_query: originalMessage?.content || '',
        timestamp: new Date().toISOString(),
        session_context: {
          page: currentPage,
          variant: currentVariant,
          disease: currentDisease
        }
      };

      // Call the actual backend endpoint
      const response = await fetch(action.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionPayload)
      });

      if (!response.ok) {
        throw new Error(`Action failed: ${response.status}`);
      }

      const actionResult = await response.json();

      // ⚔️ Phase 9: Auto-update Patient Context if action returns a profile
      if (actionResult.success && actionResult.profile && setPatientProfile) {
        console.log("🔄 Updating Patient Context from CoPilot Action");
        setPatientProfile(prev => ({ ...prev, ...actionResult.profile }));
      }

      // Create result message
      const resultMessage = {
        id: Date.now() + 3,
        type: 'bot',
        content: formatActionResult(action, actionResult),
        timestamp: new Date(),
        isActionResult: true,
        actionResult: actionResult,
        originalAction: action
      };

      // Update the action-in-progress message
      setMessages(prev => prev.map(msg =>
        msg.id === actionMessage.id
          ? { ...msg, content: `✅ Completed: ${action.label}`, isActionInProgress: false }
          : msg
      ));

      // Add result message
      setMessages(prev => [...prev, resultMessage]);

      // Update chat history with action
      setChatHistory(prev => [...prev, {
        action: action.label,
        endpoint: action.endpoint,
        result: actionResult,
        timestamp: new Date(),
        page: currentPage,
        variant: currentVariant
      }]);

    } catch (error) {
      console.error('Quick action failed:', error);

      // Create error message
      const errorMessage = {
        id: Date.now() + 3,
        type: 'bot',
        content: `❌ Action Failed: ${action.label}\nError: ${error.message}\n\nThe requested functionality may not be available yet. Please try again later or contact support.`,
        timestamp: new Date(),
        isActionError: true,
        error: error.message
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Format action results for display
  const formatActionResult = (action, result) => {
    if (!result) return `✅ ${action.label} completed successfully.`;

    switch (action.endpoint) {
      case '/api/evidence/deep_analysis':
        if (result.clinvar_data) {
          return `🔍 **Deep Analysis Complete**\n\n${result.summary || 'Analysis completed successfully.'}`;
        }
        return `✅ ${action.label} completed with ${Object.keys(result).length} data points.`;

      case '/api/efficacy/predict':
        return `📊 **Efficacy Prediction**\n\n${result.prediction_summary || 'Prediction analysis completed.'}`;

      case '/api/evidence/literature':
        const paperCount = result.papers?.length || 0;
        return `📚 **Literature Search Complete**\n\nFound ${paperCount} relevant papers. ${result.summary || ''}`;

      case '/api/evo/score_variant_profile':
        return `🧬 **Variant Profile Analysis**\n\n${result.analysis_summary || 'Evolutionary profile analysis completed.'}`;

      case '/api/command/run_evidence_bundle':
        return `📋 **Evidence Bundle Generated**\n\n${result.bundle_summary || 'Comprehensive evidence bundle created.'}`;

      case '/api/guidance/radonc':
        return `☢️ **Radiation Guidance**\n\nTier: ${result.tier || '—'}${result.on_label ? ' (On‑label)' : ''}\nRadiosensitivity: ${typeof result.radiosensitivity_score === 'number' ? result.radiosensitivity_score.toFixed(2) : '—'}\nConfidence: ${typeof result.confidence === 'number' ? result.confidence.toFixed(2) : '—'}\nStrength: ${result.strength || '—'}\nCitations: ${(result.citations || []).slice(0, 3).join(', ')}`;

      case '/api/guidance/chemo':
        return `💊 **Chemo Guidance**\n\nTherapy: ${result.therapy || '—'}${result.on_label ? ' (On‑label)' : ''}\nTier: ${result.tier || '—'}\nEfficacy: ${typeof result.efficacy_score === 'number' ? result.efficacy_score.toFixed(2) : '—'}\nConfidence: ${typeof result.confidence === 'number' ? result.confidence.toFixed(2) : '—'}\nStrength: ${result.strength || '—'}\nCitations: ${(result.citations || []).slice(0, 3).join(', ')}`;

      case '/api/design/guide_rna':
        return `🎯 **Guide RNA Design**\n\n${result.design_summary || 'CRISPR guide RNA design completed.'}`;
      default:
        return `✅ **${action.label}**\n\n${result.summary || result.message || 'Action completed successfully.'}`;
    }
  };

  return {
    // State
    messages,
    isTyping,
    copilotConfig,
    messagesEndRef,

    // Functions
    handleSendMessage,
    handleSuggestionClick,
    handleQuickAction,
    getContextSuggestions,

    // Utils
    scrollToBottom,

    // Phase 9 Exports
    handleFileUpload
  };
};
