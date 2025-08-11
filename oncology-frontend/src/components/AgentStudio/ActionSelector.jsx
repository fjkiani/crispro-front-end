import React from 'react';
import { ACTION_TYPES } from '../../constants/agentTypes';

const ActionSelector = ({ actions, onChange }) => {
  // Add a new action with default config
  const addAction = (type) => {
    const newAction = { type, config: {} };
    
    // Add type-specific default configuration
    switch(type) {
      case ACTION_TYPES.EMAIL:
        newAction.config = { 
          recipients: [], 
          subject: 'Agent Alert: [Results Available]' 
        };
        break;
      case ACTION_TYPES.TEAM_COMMUNICATION:
        newAction.config = { 
          channel: 'my-team', 
          shouldMention: false 
        };
        break;
      case ACTION_TYPES.PATIENT_RECORD:
        newAction.config = { 
          noteType: 'action_item' 
        };
        break;
      case ACTION_TYPES.REPORT:
        newAction.config = { 
          format: 'pdf', 
          includeDetails: true 
        };
        break;
      default:
        // Dashboard action has empty config by default
        break;
    }
    
    onChange([...actions, newAction]);
  };
  
  // Remove an action by index
  const removeAction = (index) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    onChange(newActions);
  };
  
  // Check if an action type is already added
  const hasActionType = (type) => {
    return actions.some(action => action.type === type);
  };
  
  // Update action config
  const updateActionConfig = (index, key, value) => {
    const newActions = [...actions];
    newActions[index].config = {
      ...newActions[index].config,
      [key]: value
    };
    onChange(newActions);
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What should happen when the agent completes?
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {/* Dashboard Action Card */}
          <div 
            onClick={() => !hasActionType(ACTION_TYPES.DASHBOARD) && addAction(ACTION_TYPES.DASHBOARD)}
            className={`border rounded-md p-3 cursor-pointer ${
              hasActionType(ACTION_TYPES.DASHBOARD)
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
            } ${hasActionType(ACTION_TYPES.DASHBOARD) ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={hasActionType(ACTION_TYPES.DASHBOARD)}
                onChange={() => {
                  if (hasActionType(ACTION_TYPES.DASHBOARD)) {
                    onChange(actions.filter(a => a.type !== ACTION_TYPES.DASHBOARD));
                  } else {
                    addAction(ACTION_TYPES.DASHBOARD);
                  }
                }}
                className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="ml-2">
                <div className="text-sm font-medium">Dashboard Alert</div>
                <div className="text-xs text-gray-500">Show results in your dashboard</div>
              </div>
            </div>
          </div>
          
          {/* Email Action Card */}
          <div 
            onClick={() => !hasActionType(ACTION_TYPES.EMAIL) && addAction(ACTION_TYPES.EMAIL)}
            className={`border rounded-md p-3 cursor-pointer ${
              hasActionType(ACTION_TYPES.EMAIL)
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
            } ${hasActionType(ACTION_TYPES.EMAIL) ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={hasActionType(ACTION_TYPES.EMAIL)}
                onChange={() => {
                  if (hasActionType(ACTION_TYPES.EMAIL)) {
                    onChange(actions.filter(a => a.type !== ACTION_TYPES.EMAIL));
                  } else {
                    addAction(ACTION_TYPES.EMAIL);
                  }
                }}
                className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="ml-2">
                <div className="text-sm font-medium">Email Alert</div>
                <div className="text-xs text-gray-500">Send notification via email</div>
              </div>
            </div>
          </div>
          
          {/* Team Communication Action Card */}
          <div 
            onClick={() => !hasActionType(ACTION_TYPES.TEAM_COMMUNICATION) && addAction(ACTION_TYPES.TEAM_COMMUNICATION)}
            className={`border rounded-md p-3 cursor-pointer ${
              hasActionType(ACTION_TYPES.TEAM_COMMUNICATION)
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
            } ${hasActionType(ACTION_TYPES.TEAM_COMMUNICATION) ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={hasActionType(ACTION_TYPES.TEAM_COMMUNICATION)}
                onChange={() => {
                  if (hasActionType(ACTION_TYPES.TEAM_COMMUNICATION)) {
                    onChange(actions.filter(a => a.type !== ACTION_TYPES.TEAM_COMMUNICATION));
                  } else {
                    addAction(ACTION_TYPES.TEAM_COMMUNICATION);
                  }
                }}
                className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="ml-2">
                <div className="text-sm font-medium">Team Message</div>
                <div className="text-xs text-gray-500">Post to team communication</div>
              </div>
            </div>
          </div>
          
          {/* Patient Record Action Card */}
          <div 
            onClick={() => !hasActionType(ACTION_TYPES.PATIENT_RECORD) && addAction(ACTION_TYPES.PATIENT_RECORD)}
            className={`border rounded-md p-3 cursor-pointer ${
              hasActionType(ACTION_TYPES.PATIENT_RECORD)
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
            } ${hasActionType(ACTION_TYPES.PATIENT_RECORD) ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={hasActionType(ACTION_TYPES.PATIENT_RECORD)}
                onChange={() => {
                  if (hasActionType(ACTION_TYPES.PATIENT_RECORD)) {
                    onChange(actions.filter(a => a.type !== ACTION_TYPES.PATIENT_RECORD));
                  } else {
                    addAction(ACTION_TYPES.PATIENT_RECORD);
                  }
                }}
                className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="ml-2">
                <div className="text-sm font-medium">Patient Record Note</div>
                <div className="text-xs text-gray-500">Add note to patient record</div>
              </div>
            </div>
          </div>
          
          {/* Report Action Card */}
          <div 
            onClick={() => !hasActionType(ACTION_TYPES.REPORT) && addAction(ACTION_TYPES.REPORT)}
            className={`border rounded-md p-3 cursor-pointer ${
              hasActionType(ACTION_TYPES.REPORT)
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
            } ${hasActionType(ACTION_TYPES.REPORT) ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={hasActionType(ACTION_TYPES.REPORT)}
                onChange={() => {
                  if (hasActionType(ACTION_TYPES.REPORT)) {
                    onChange(actions.filter(a => a.type !== ACTION_TYPES.REPORT));
                  } else {
                    addAction(ACTION_TYPES.REPORT);
                  }
                }}
                className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="ml-2">
                <div className="text-sm font-medium">Summary Report</div>
                <div className="text-xs text-gray-500">Generate downloadable report</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Configurations */}
      {actions.length > 0 && (
        <div className="border rounded-md p-4 bg-purple-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Action Configuration</h3>
          
          <div className="space-y-4">
            {actions.map((action, index) => (
              <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-sm">
                    {action.type === ACTION_TYPES.DASHBOARD && 'Dashboard Alert'}
                    {action.type === ACTION_TYPES.EMAIL && 'Email Alert'}
                    {action.type === ACTION_TYPES.TEAM_COMMUNICATION && 'Team Message'}
                    {action.type === ACTION_TYPES.PATIENT_RECORD && 'Patient Record Note'}
                    {action.type === ACTION_TYPES.REPORT && 'Summary Report'}
                  </div>
                  <button
                    onClick={() => removeAction(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                {/* Email specific configuration */}
                {action.type === ACTION_TYPES.EMAIL && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={action.config.subject || ''}
                        onChange={(e) => updateActionConfig(index, 'subject', e.target.value)}
                        placeholder="Email subject line"
                        className="w-full text-sm p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Recipient (Mock)</label>
                      <select
                        className="w-full text-sm p-2 border border-gray-300 rounded"
                        defaultValue="current_user"
                      >
                        <option value="current_user">Me (Current User)</option>
                        <option value="team">My Team</option>
                        <option value="custom">Custom Email</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Team Communication specific configuration */}
                {action.type === ACTION_TYPES.TEAM_COMMUNICATION && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Team Channel (Mock)</label>
                      <select
                        className="w-full text-sm p-2 border border-gray-300 rounded"
                        defaultValue="my-team"
                      >
                        <option value="my-team">My Team</option>
                        <option value="oncology">Oncology Department</option>
                        <option value="research">Research Team</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Patient Record specific configuration */}
                {action.type === ACTION_TYPES.PATIENT_RECORD && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Note Type</label>
                      <select
                        value={action.config.noteType || 'action_item'}
                        onChange={(e) => updateActionConfig(index, 'noteType', e.target.value)}
                        className="w-full text-sm p-2 border border-gray-300 rounded"
                      >
                        <option value="action_item">Action Item</option>
                        <option value="clinical_note">Clinical Note</option>
                        <option value="alert">Alert</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Report specific configuration */}
                {action.type === ACTION_TYPES.REPORT && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Report Format</label>
                      <select
                        value={action.config.format || 'pdf'}
                        onChange={(e) => updateActionConfig(index, 'format', e.target.value)}
                        className="w-full text-sm p-2 border border-gray-300 rounded"
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="csv">CSV Data Export</option>
                        <option value="html">HTML Report</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* For dashboard, no additional configuration is needed */}
                {action.type === ACTION_TYPES.DASHBOARD && (
                  <p className="text-xs text-gray-500 italic">
                    Results will appear in your Agent Studio dashboard when available.
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 italic mt-4">
            Note: Action execution is simulated in this concept demonstration.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActionSelector; 