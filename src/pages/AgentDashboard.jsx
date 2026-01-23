import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconActivity, IconClock, IconUser, IconListDetails, IconGauge, IconInfoCircle, IconChevronRight, IconMessageChatbot, IconSettings, IconTerminal2, IconHistory } from '@tabler/icons-react';

console.log('[AgentDashboard] VITE_API_ROOT:', import.meta.env.VITE_API_ROOT);
const API_BASE_URL = import.meta.env.VITE_API_ROOT;

const AgentDashboard = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("capabilities");
  const [dynamicAgentData, setDynamicAgentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  useEffect(() => {
    const fetchAgentActivity = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/agent_activity`);
        if (!response.ok) {
          throw new Error(`Failed to fetch agent activity: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setDynamicAgentData(data);
      } catch (err) {
        console.error("Error fetching agent activity:", err);
        setError(err.message);
        setDynamicAgentData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentActivity();
  }, []);

  // Simulated agent capabilities based on the actual backend agents
  const agentCapabilities = [
    {
      id: "data_analyzer",
      name: "Data Analysis Agent",
      description: "Analyzes patient data to generate clinical summaries and answer specific questions",
      examples: [
        "Summarize patient's clinical history",
        "What was the result of the last CT scan?",
        "Interpret recent lab results"
      ],
      status: "Active",
      implementation: "Uses NLP to analyze clinical documents and extract key information. Combines rule-based and machine learning approaches for information extraction.",
      usageStatistics: {
        totalCalls: 1245,
        avgResponseTime: "1.2s",
        accuracyScore: 0.89
      },
      recentHistories: [
        { 
          timestamp: "2023-06-15T10:21:00Z", 
          query: "Summarize recent labs", 
          result: "CBC shows stable counts. Liver enzymes within normal range. Glucose slightly elevated at 110 mg/dL."
        },
        { 
          timestamp: "2023-06-14T14:05:00Z", 
          query: "What was the finding on last mammogram?", 
          result: "Last mammogram (05/30/2023) showed no evidence of malignancy or recurrence."
        }
      ]
    },
    {
      id: "clinical_trial_finder",
      name: "Clinical Trial Agent",
      description: "Finds relevant clinical trials based on patient diagnosis and profile",
      examples: [
        "Find trials for Stage III breast cancer",
        "Search for immunotherapy trials for NSCLC",
        "Match patient to eligible trials"
      ],
      status: "Active",
      implementation: "Combines vector search of trial databases with LLM assessment of eligibility criteria. Uses chromadb for semantic search and structured analysis.",
      usageStatistics: {
        totalCalls: 832,
        avgResponseTime: "2.8s",
        accuracyScore: 0.92
      },
      recentHistories: [
        { 
          timestamp: "2023-06-15T09:45:00Z", 
          query: "Find trials for HR+ breast cancer", 
          result: "Found 5 eligible trials including NCT04774536 (PALOMA-5) with high eligibility score of 0.89."
        },
        { 
          timestamp: "2023-06-10T11:32:00Z", 
          query: "Immunotherapy trials for metastatic disease", 
          result: "Identified 3 potential matches with checkpoint inhibitors for metastatic disease."
        }
      ]
    },
    {
      id: "notifier",
      name: "Notification Agent",
      description: "Drafts professional notifications to other healthcare providers",
      examples: [
        "Draft notification to PCP about elevated glucose",
        "Create urgent referral for cardiology consult", 
        "Flag case for review by attending physician"
      ],
      status: "Active",
      implementation: "Utilizes templates and LLM generation to create contextually appropriate notifications based on patient data and medical standards.",
      usageStatistics: {
        totalCalls: 678,
        avgResponseTime: "1.5s",
        accuracyScore: 0.95
      },
      recentHistories: [
        { 
          timestamp: "2023-06-14T16:20:00Z", 
          query: "Notify PCP about new treatment plan", 
          result: "Generated notification with treatment summary and follow-up recommendations."
        },
        { 
          timestamp: "2023-06-12T09:10:00Z", 
          query: "Create urgent notification for abnormal ECG", 
          result: "Created high-priority notification with appropriate clinical context and recommendations."
        }
      ]
    },
    {
      id: "scheduler",
      name: "Scheduling Agent",
      description: "Helps find available appointment slots and book appointments",
      examples: [
        "Find available slots next week",
        "Schedule follow-up in 3 months",
        "Book urgent imaging"
      ],
      status: "Active",
      implementation: "Integrates with calendar systems and uses constraint satisfaction algorithms to find optimal appointment slots based on availability and urgency.",
      usageStatistics: {
        totalCalls: 1589,
        avgResponseTime: "0.9s",
        accuracyScore: 0.98
      },
      recentHistories: [
        { 
          timestamp: "2023-06-15T11:05:00Z", 
          query: "Schedule follow-up in 2 weeks", 
          result: "Booked appointment for June 29, 2023 at 10:30 AM with Dr. Smith."
        },
        { 
          timestamp: "2023-06-13T15:40:00Z", 
          query: "Find urgent CT slot this week", 
          result: "Reserved emergency CT slot for tomorrow at 2:15 PM."
        }
      ]
    },
    {
      id: "side_effect_manager",
      name: "Side Effect Agent",
      description: "Identifies potential medication side effects and suggests management tips",
      examples: [
        "What are common side effects of letrozole?",
        "How to manage chemotherapy-induced nausea",
        "Check for medication interactions"
      ],
      status: "Active",
      implementation: "Combines database lookups of known side effects with personalized management recommendations based on patient profile and medication combinations.",
      usageStatistics: {
        totalCalls: 923,
        avgResponseTime: "1.1s",
        accuracyScore: 0.94
      },
      recentHistories: [
        { 
          timestamp: "2023-06-14T10:15:00Z", 
          query: "Side effects of new medication regimen", 
          result: "Identified potential interactions between metformin and contrast agents. Suggested management plan."
        },
        { 
          timestamp: "2023-06-11T13:22:00Z", 
          query: "How to manage joint pain from aromatase inhibitor", 
          result: "Provided evidence-based recommendations for exercise, NSAIDs, and complementary approaches."
        }
      ]
    },
    {
      id: "referral_drafter",
      name: "Referral Agent",
      description: "Drafts comprehensive referral letters to specialists",
      examples: [
        "Draft referral to cardiology for evaluation",
        "Create oncology referral with clinical context",
        "Generate specialist consultation request"
      ],
      status: "Active",
      implementation: "Uses NLP and template-based generation to create detailed specialist referrals with appropriate clinical context, history, and reason for consultation.",
      usageStatistics: {
        totalCalls: 542,
        avgResponseTime: "1.7s",
        accuracyScore: 0.91
      },
      recentHistories: [
        { 
          timestamp: "2023-06-13T16:40:00Z", 
          query: "Referral to cardio-oncology", 
          result: "Generated comprehensive referral with treatment history, current symptoms, and specific concerns."
        },
        { 
          timestamp: "2023-06-10T09:35:00Z", 
          query: "Urgent neurology referral", 
          result: "Created high-priority referral with relevant imaging findings and symptom progression details."
        }
      ]
    }
  ];

  // Agent relationship data for the visualization
  const agentRelationships = [
    {
      source: "data_analyzer",
      target: "clinical_trial_finder",
      description: "Provides patient data for trial matching"
    },
    {
      source: "data_analyzer",
      target: "side_effect_manager",
      description: "Shares medication history for side effect assessment"
    },
    {
      source: "data_analyzer", 
      target: "referral_drafter",
      description: "Supplies clinical history for referral content"
    },
    {
      source: "clinical_trial_finder",
      target: "notifier",
      description: "Triggers notifications about trial eligibility"
    },
    {
      source: "clinical_trial_finder",
      target: "scheduler",
      description: "Initiates scheduling for trial enrollment visits"
    },
    {
      source: "side_effect_manager",
      target: "notifier",
      description: "Alerts about significant side effects"
    },
    {
      source: "notifier",
      target: "referral_drafter",
      description: "Coordinates creation of formal referrals"
    },
    {
      source: "scheduler",
      target: "notifier",
      description: "Sends appointment confirmations"
    },
    {
      source: "GenomicAnalystAgent",
      target: "DataAnalysisAgent",
      description: "Provides genomic insights for deep dives"
    }
  ];

  // Simulated patient analysis data
  const patientAnalysisData = {
    id: patientId || "PAT12345",
    currentAnalysis: [
      {
        type: "Clinical Summary",
        content: "65-year-old female with Stage III invasive ductal carcinoma diagnosed Feb 2023. Currently on adjuvant therapy with Letrozole. History of hypertension and type 2 diabetes. Recent lab work shows stable CBC and liver function. Last imaging (mammogram, 3 weeks ago) shows no evidence of recurrence.",
        confidence: 0.92,
        timestamp: "2023-06-15T10:30:00Z"
      },
      {
        type: "Trial Eligibility",
        content: "Likely eligible for NCT04774536 (PALOMA-5) based on hormone receptor status, disease stage, and treatment history. Monitoring required for neutropenia risk based on prior medical history.",
        confidence: 0.85,
        timestamp: "2023-06-14T15:45:00Z"
      },
      {
        type: "Medication Analysis",
        content: "Current regimen (Letrozole 2.5mg daily, Metformin 1000mg BID, Lisinopril 10mg daily) shows no significant interactions. Monitoring advised for joint pain and fatigue with Letrozole.",
        confidence: 0.89,
        timestamp: "2023-06-13T09:15:00Z"
      },
      {
        type: "Risk Assessment",
        content: "Moderate risk of cardiac complications based on pre-existing hypertension. Recommend regular cardiac monitoring during treatment. Low risk of myelosuppression based on recent CBC values.",
        confidence: 0.78,
        timestamp: "2025-05-12T11:20:00Z"
      }
    ],
    recentAgentActivities: [
      {
        agent: "Clinical Trial Agent",
        action: "Searched for hormone-receptor positive breast cancer trials",
        result: "Found 5 potentially matching trials",
        timestamp: "2025-05-10T09:45:00Z"
      },
      {
        agent: "Data Analysis Agent",
        action: "Generated clinical summary",
        result: "Complete summary of patient history and current status",
        timestamp: "2025-05-09T14:30:00Z"
      },
      {
        agent: "Notification Agent",
        action: "Drafted notification to primary care provider",
        result: "Notification about recent oncology findings",
        timestamp: "2025-05-10T16:20:00Z"
      }
    ]
  };

  const handleOpenAgentDetail = (agent) => {
    setSelectedAgent(agent);
    setShowAgentModal(true);
  };

  const handleCloseAgentDetail = () => {
    setShowAgentModal(false);
    setSelectedAgent(null);
  };

  const AgentRelationshipDiagram = () => {
    if (!dynamicAgentData || dynamicAgentData.length === 0) return <p>Agent data not available for diagram.</p>;
    
    const nodePositions = {};
    const availableNodes = dynamicAgentData.map(agent => agent.id);

    dynamicAgentData.forEach((agent, index) => {
      nodePositions[agent.id] = { 
        x: 150 + Math.cos(index * 2 * Math.PI / dynamicAgentData.length) * 100,
        y: 150 + Math.sin(index * 2 * Math.PI / dynamicAgentData.length) * 100 
      };
    });

    return (
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Agent Interaction Overview</h3>
        <svg width="300" height="300" viewBox="0 0 300 300">
          {agentRelationships.map((rel, index) => {
            if (nodePositions[rel.source] && nodePositions[rel.target]) {
              return (
                <line
                  key={`rel-${index}`}
                  x1={nodePositions[rel.source].x}
                  y1={nodePositions[rel.source].y}
                  x2={nodePositions[rel.target].x}
                  y2={nodePositions[rel.target].y}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            }
            return null;
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
          {dynamicAgentData.map(agent => (
            nodePositions[agent.id] && (
            <g key={agent.id} transform={`translate(${nodePositions[agent.id].x - 20}, ${nodePositions[agent.id].y - 10})`}>
              <rect width="40" height="20" rx="5" fill="#e2e8f0" />
              <text x="20" y="14" fontSize="8" textAnchor="middle" fill="#334155">{agent.name.substring(0,5)}...</text>
            </g>
            )
          ))}
        </svg>
        <p className="text-xs text-gray-500 mt-2">Note: Diagram is a conceptual representation.</p>
      </div>
    );
  };

  const AgentDetailModal = ({ agent, onClose }) => {
    if (!agent) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <IconMessageChatbot size={28} className="mr-2 text-indigo-600" /> {agent.name}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <IconSettings size={24} />
              </button>
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{agent.description || "No description available."}</p>
              </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <p className={`text-sm font-semibold ${agent.status && agent.status.startsWith("Error") ? 'text-red-600' : 'text-green-600'}`}>
                {agent.status || "Unknown"}
              </p>
            </div>
            </div>
            
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex items-center">
                <IconClock size={18} className="mr-2 text-gray-500" />
                <strong>Last Activity:</strong> <span className="ml-2 text-gray-700">{agent.lastActivityTimestamp ? new Date(agent.lastActivityTimestamp).toLocaleString() : 'N/A'}</span>
                </div>
            <div className="flex items-center">
                <IconUser size={18} className="mr-2 text-gray-500" />
                <strong>Last Patient Processed:</strong> <span className="ml-2 text-gray-700">{agent.lastPatientId || 'N/A'}</span>
                </div>
            <div className="flex items-start">
                <IconListDetails size={18} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                    <strong>Last Action Summary:</strong>
                    <p className="ml-0 text-gray-700 whitespace-pre-wrap break-words">{agent.lastActionSummary || 'N/A'}</p>
              </div>
            </div>
             <div className="flex items-center">
                <IconGauge size={18} className="mr-2 text-gray-500" />
                <strong>Invocations:</strong> <span className="ml-2 text-gray-700">{agent.invocationCount || 0}</span>
            </div>
            <div className="flex items-center">
                <IconActivity size={18} className="mr-2 text-gray-500" />
                <strong>Avg. Response Time:</strong> <span className="ml-2 text-gray-700">{agent.averageResponseTimeMs ? `${agent.averageResponseTimeMs.toFixed(0)} ms` : 'N/A'}</span>
              </div>
            </div>
            
          <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Close
              </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Loading agent dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error loading agent dashboard: {error}</div>;
  }
  
  const agentsToDisplay = dynamicAgentData;

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Agent Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of AI agent capabilities, status, and interactions within the system.
        </p>
      </header>

          {activeTab === "capabilities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentsToDisplay.length > 0 ? agentsToDisplay.map((agent) => (
                <div
                  key={agent.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col"
                  onClick={() => handleOpenAgentDetail(agent)}
                >
              <div className={`p-5 flex-grow ${agent.status && agent.status.startsWith("Error:") ? 'border-l-4 border-red-500' : (agent.status && agent.status.startsWith("Processing:") ? 'border-l-4 border-blue-500' : 'border-l-4 border-green-500')}`}>
                <div className="flex items-center mb-3">
                  <IconMessageChatbot size={24} className="mr-3 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-800 truncate" title={agent.name}>{agent.name}</h2>
                </div>
                <p className="text-xs text-gray-600 mb-3 h-10 overflow-hidden line-clamp-2">
                  {agent.description || "No description provided."}
                </p>
                
                <div className="space-y-1.5 text-xs text-gray-500 mt-auto">
                    <div className="flex items-center">
                        <IconActivity size={14} className="mr-1.5" /> 
                        Status: <span className={`ml-1 font-medium ${agent.status && agent.status.startsWith("Error:") ? 'text-red-500' : (agent.status && agent.status.startsWith("Processing:") ? 'text-blue-500' : 'text-green-500')}`}>{agent.status || "Unknown"}</span>
              </div>
                      <div className="flex items-center">
                        <IconClock size={14} className="mr-1.5" /> 
                        Last Active: {agent.lastActivityTimestamp ? new Date(agent.lastActivityTimestamp).toLocaleTimeString() : 'N/A'}
                        </div>
                     <div className="flex items-center">
                        <IconUser size={14} className="mr-1.5" /> 
                        Last Patient: {agent.lastPatientId || 'N/A'}
                      </div>
                    <div className="flex items-center">
                        <IconGauge size={14} className="mr-1.5" /> 
                        Invocations: {agent.invocationCount || 0}
                    </div>
                </div>
                  </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                 <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenAgentDetail(agent); }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                    View Details <IconChevronRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          )) : (
            <p className="col-span-full text-center text-gray-500 py-10">
              No agent activity data available or agents are still initializing.
            </p>
          )}
            </div>
          )}

      {activeTab === "interactions" && (
            <AgentRelationshipDiagram />
          )}

      {activeTab === "patient_analysis" && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Simulated Patient Analysis Context</h3>
          <p className="text-sm text-gray-600 mb-1">Patient ID: {patientAnalysisData.id}</p>
          {patientAnalysisData.currentAnalysis.map((item, index) => (
            <div key={index} className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
              <h4 className="font-semibold text-gray-700 text-sm">{item.type} (Confidence: {item.confidence * 100}%)</h4>
              <p className="text-xs text-gray-500 mb-1">Timestamp: {new Date(item.timestamp).toLocaleString()}</p>
              <p className="text-xs text-gray-600">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {selectedAgent && (
        <AgentDetailModal agent={selectedAgent} onClose={handleCloseAgentDetail} />
      )}
    </div>
  );
};

export default AgentDashboard; 