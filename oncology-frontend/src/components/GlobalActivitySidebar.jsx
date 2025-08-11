import React, { useState, useRef, useEffect } from 'react';
import { IconChevronRight, IconChevronLeft, IconActivity, IconUser, IconHistory, IconRobot, IconTarget, IconRocket, IconShield } from '@tabler/icons-react';
import { useActivity, ACTIVITY_TYPES } from '../context/ActivityContext';
import { useLocation } from 'react-router-dom';

// Activity event types with their styling
const EVENT_STYLES = {
  [ACTIVITY_TYPES.GENOMIC_ANALYSIS]: {
    icon: <IconActivity size={18} />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  [ACTIVITY_TYPES.SUMMARY]: {
    icon: <IconHistory size={18} />, 
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300'
  },
  [ACTIVITY_TYPES.DEEP_DIVE]: {
    icon: <IconHistory size={18} />,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300'
  },
  [ACTIVITY_TYPES.AGENT_STATUS]: {
    icon: <IconRobot size={18} />,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300'
  },
  // Target Dossier Analysis Styles
  [ACTIVITY_TYPES.TARGET_ANALYSIS_STARTED]: {
    icon: <IconRocket size={18} />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300'
  },
  [ACTIVITY_TYPES.TARGET_VALIDATION]: {
    icon: <IconTarget size={18} />,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300'
  },
  [ACTIVITY_TYPES.DEPENDENCY_ANALYSIS]: {
    icon: <IconShield size={18} />,
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  },
  [ACTIVITY_TYPES.DRUGGABILITY_ASSESSMENT]: {
    icon: <IconActivity size={18} />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  [ACTIVITY_TYPES.CRISPR_FORGE]: {
    icon: <IconRocket size={18} />,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300'
  },
  [ACTIVITY_TYPES.INHIBITOR_FORGE]: {
    icon: <IconRocket size={18} />,
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-300'
  },
  [ACTIVITY_TYPES.IN_SILICO_TRIAL]: {
    icon: <IconHistory size={18} />,
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300'
  },
  [ACTIVITY_TYPES.DOSSIER_COMPLETE]: {
    icon: <IconActivity size={18} />,
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300'
  },
  [ACTIVITY_TYPES.MISSION_GO_DECISION]: {
    icon: <IconTarget size={18} />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  [ACTIVITY_TYPES.MISSION_NO_GO_DECISION]: {
    icon: <IconShield size={18} />,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300'
  },
  // Styles for new activity types
  [ACTIVITY_TYPES.GENOMIC_QUERY_SUBMITTED]: {
    icon: <IconActivity size={18} />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300'
  },
  [ACTIVITY_TYPES.GENOMIC_ANALYSIS_SUCCESS]: {
    icon: <IconActivity size={18} />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  [ACTIVITY_TYPES.GENOMIC_ANALYSIS_ERROR]: {
    icon: <IconActivity size={18} />,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300'
  },
  [ACTIVITY_TYPES.CRISPR_DESIGN_INITIATED]: {
    icon: <IconRobot size={18} />, // Or a specific CRISPR icon if available
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300'
  },
  [ACTIVITY_TYPES.DEEP_DIVE_REQUESTED]: {
    icon: <IconHistory size={18} />,
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-300'
  },
  [ACTIVITY_TYPES.DEEP_DIVE_SUCCESS]: {
    icon: <IconHistory size={18} />,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300'
  },
  [ACTIVITY_TYPES.DEEP_DIVE_ERROR]: {
    icon: <IconHistory size={18} />,
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-300'
  },
  [ACTIVITY_TYPES.AGENT_ACTION_REQUESTED]: {
    icon: <IconRobot size={18} />,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300'
  },
  [ACTIVITY_TYPES.AGENT_ACTION_SUCCESS]: {
    icon: <IconRobot size={18} />,
    bgColor: 'bg-lime-100',
    textColor: 'text-lime-800',
    borderColor: 'border-lime-300'
  },
  [ACTIVITY_TYPES.AGENT_ACTION_ERROR]: {
    icon: <IconRobot size={18} />,
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  },
  [ACTIVITY_TYPES.CONSULTATION_EVENT]: {
    icon: <IconUser size={18} />, // Consider a message icon for actual messages
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300'
  }
};

const GlobalActivitySidebar = () => {
  const API_ROOT = import.meta.env.VITE_API_ROOT || '';
  const [isExpanded, setIsExpanded] = useState(true);
  const activitiesEndRef = useRef(null);
  const [patientName, setPatientName] = useState('');
  const [patientDiagnosis, setPatientDiagnosis] = useState('');
  const location = useLocation();
  
  // Check if we're on the dossier page
  const isDossierPage = location.pathname === '/dossier';
  
  // Use activity context
  const { 
    getPatientActivities, 
    clearActivities, 
    currentPatientId 
  } = useActivity();
  
  const patientActivities = getPatientActivities();

  // Auto-scroll to newest activity when added
  useEffect(() => {
    if (activitiesEndRef.current && isExpanded && patientActivities.length > 0) {
      activitiesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [patientActivities.length, isExpanded]);

  // Fetch patient details when currentPatientId changes
  useEffect(() => {
    if (currentPatientId) {
      fetch(`${API_ROOT}/api/patients/${currentPatientId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok for patient details');
          }
          return response.json();
        })
        .then(data => {
          if (data.success && data.data) {
            setPatientName(`${data.data.demographics?.first_name || ''} ${data.data.demographics?.last_name || ''}`.trim());
            setPatientDiagnosis(data.data.diagnosis?.primary || 'N/A');
          } else {
            setPatientName('Error loading name');
            setPatientDiagnosis('Error loading diagnosis');
          }
        })
        .catch(error => {
          console.error("Failed to fetch patient details for sidebar:", error);
          setPatientName('Not found');
          setPatientDiagnosis('Not found');
        });
    } else {
      setPatientName('');
      setPatientDiagnosis('');
    }
  }, [currentPatientId, API_ROOT]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`fixed right-0 top-16 z-20 h-[calc(100vh-4rem)] transition-all duration-300 shadow-lg bg-white border-l border-gray-200 
        ${isExpanded ? 'w-72' : 'w-12'}`}
    >
      {/* Collapse/Expand Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-3 top-4 bg-white border border-gray-300 rounded-full p-1 shadow-md z-30"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
      </button>

      {/* Sidebar Content - only shown when expanded */}
      <div className={`h-full flex flex-col transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
        {/* Context Section - Patient or Target Analysis */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          {isDossierPage ? (
            // Target Analysis Context
            <>
              <div className="flex items-center space-x-2">
                <IconTarget size={16} className="text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700">Target Analysis</h3>
              </div>
              <div className="mt-2 text-xs">
                <p><span className="font-medium">Target:</span> PIK3CA E542K</p>
                <p><span className="font-medium">Mission:</span> In Silico Conquest</p>
                <p className="truncate"><span className="font-medium">Phase:</span> Oracle → Forge → Boltz</p>
              </div>
            </>
          ) : (
            // Original Patient Context
            <>
              <div className="flex items-center space-x-2">
                <IconUser size={16} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Patient Context</h3>
              </div>
              {currentPatientId ? (
                <div className="mt-2 text-xs">
                  <p><span className="font-medium">ID:</span> {currentPatientId}</p>
                  {patientName && <p><span className="font-medium">Name:</span> {patientName}</p>}
                  {patientDiagnosis && <p className="truncate"><span className="font-medium">Dx:</span> {patientDiagnosis}</p>}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic mt-2">No patient selected</p>
              )}
            </>
          )}
        </div>

        {/* Activity Log */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Activity Log</h3>
            {patientActivities.length > 0 && (
              <button 
                onClick={clearActivities}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
          
          {patientActivities.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No activities recorded yet</p>
          ) : (
            <div className="space-y-2">
              {patientActivities.map((activity) => {
                const eventStyle = EVENT_STYLES[activity.type] || EVENT_STYLES[ACTIVITY_TYPES.AGENT_STATUS];
                
                return (
                  <div 
                    key={activity.id} 
                    className={`p-2 rounded-md text-xs ${eventStyle.bgColor} ${eventStyle.textColor} border ${eventStyle.borderColor}`}
                  >
                    <div className="flex items-start">
                      <div className="mt-0.5 mr-2">
                        {eventStyle.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.message}</p>
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <div className="mt-1 text-xs opacity-80">
                            {Object.entries(activity.details).map(([key, value]) => (
                              <p key={key} className="truncate">
                                <span className="font-medium">{key}:</span> {value}
                              </p>
                            ))}
                          </div>
                        )}
                        <p className="mt-1 text-right text-2xs opacity-70">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={activitiesEndRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 bg-gray-50 text-2xs text-gray-500 text-center">
          {isDossierPage ? (
            <span>Target Analysis Monitor • {patientActivities.length} events</span>
          ) : (
            <span>Global Activity Monitor • {patientActivities.length} events</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalActivitySidebar; 