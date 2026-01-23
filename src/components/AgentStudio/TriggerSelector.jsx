import React from 'react';
import { 
  TRIGGER_TYPES, 
  FREQUENCY_TYPES, 
  WEEKDAYS, 
  MONTHS, 
  HOURS 
} from '../../constants/agentTypes';

const TriggerSelector = ({ trigger, onChange }) => {
  // Handler for changing trigger type
  const handleTriggerTypeChange = (type) => {
    let newTrigger = { type };
    
    // Add default configuration based on trigger type
    if (type === TRIGGER_TYPES.SCHEDULED) {
      newTrigger.config = {
        frequency: FREQUENCY_TYPES.DAILY,
        time: '09:00'
      };
    } else if (type === TRIGGER_TYPES.EVENT) {
      newTrigger.config = {
        eventType: 'new_lab_result'  // Default mock event
      };
    }
    
    onChange(newTrigger);
  };
  
  // Handler for changing scheduled frequency
  const handleFrequencyChange = (frequency) => {
    let config = { ...trigger.config, frequency };
    
    // Add appropriate default day selection based on frequency
    if (frequency === FREQUENCY_TYPES.WEEKLY && !trigger.config.day) {
      config.day = 'monday';
    } else if (frequency === FREQUENCY_TYPES.MONTHLY && !trigger.config.day) {
      config.day = '1';
    }
    
    onChange({ ...trigger, config });
  };
  
  // Handler for general config changes
  const handleConfigChange = (key, value) => {
    onChange({
      ...trigger,
      config: {
        ...trigger.config,
        [key]: value
      }
    });
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          When should this agent run?
        </label>
        
        <div className="grid grid-cols-3 gap-2">
          {/* Manual trigger option */}
          <div 
            onClick={() => handleTriggerTypeChange(TRIGGER_TYPES.MANUAL)}
            className={`border rounded-md p-3 cursor-pointer ${
              trigger.type === TRIGGER_TYPES.MANUAL 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                checked={trigger.type === TRIGGER_TYPES.MANUAL}
                onChange={() => handleTriggerTypeChange(TRIGGER_TYPES.MANUAL)}
                className="h-4 w-4 mt-1 text-purple-600"
              />
              <div className="ml-2">
                <div className="text-sm font-medium">Manual</div>
                <div className="text-xs text-gray-500">Run only when requested</div>
              </div>
            </div>
          </div>
          
          {/* Scheduled trigger option */}
          <div 
            onClick={() => handleTriggerTypeChange(TRIGGER_TYPES.SCHEDULED)}
            className={`border rounded-md p-3 cursor-pointer ${
              trigger.type === TRIGGER_TYPES.SCHEDULED 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                checked={trigger.type === TRIGGER_TYPES.SCHEDULED}
                onChange={() => handleTriggerTypeChange(TRIGGER_TYPES.SCHEDULED)}
                className="h-4 w-4 mt-1 text-purple-600"
              />
              <div className="ml-2">
                <div className="text-sm font-medium">Scheduled</div>
                <div className="text-xs text-gray-500">Run on a regular schedule</div>
              </div>
            </div>
          </div>
          
          {/* Event-based trigger option */}
          <div 
            onClick={() => handleTriggerTypeChange(TRIGGER_TYPES.EVENT)}
            className={`border rounded-md p-3 cursor-pointer ${
              trigger.type === TRIGGER_TYPES.EVENT 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                checked={trigger.type === TRIGGER_TYPES.EVENT}
                onChange={() => handleTriggerTypeChange(TRIGGER_TYPES.EVENT)}
                className="h-4 w-4 mt-1 text-purple-600"
              />
              <div className="ml-2">
                <div className="text-sm font-medium">Event-Based</div>
                <div className="text-xs text-gray-500">Run when specific events occur</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional configuration based on trigger type */}
      {trigger.type === TRIGGER_TYPES.SCHEDULED && (
        <div className="border rounded-md p-4 bg-purple-50">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleFrequencyChange(FREQUENCY_TYPES.DAILY)}
                className={`py-2 px-3 text-sm rounded ${
                  trigger.config.frequency === FREQUENCY_TYPES.DAILY
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => handleFrequencyChange(FREQUENCY_TYPES.WEEKLY)}
                className={`py-2 px-3 text-sm rounded ${
                  trigger.config.frequency === FREQUENCY_TYPES.WEEKLY
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => handleFrequencyChange(FREQUENCY_TYPES.MONTHLY)}
                className={`py-2 px-3 text-sm rounded ${
                  trigger.config.frequency === FREQUENCY_TYPES.MONTHLY
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          {/* Day selection for weekly frequency */}
          {trigger.config.frequency === FREQUENCY_TYPES.WEEKLY && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                value={trigger.config.day || 'monday'}
                onChange={(e) => handleConfigChange('day', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                {WEEKDAYS.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Day selection for monthly frequency */}
          {trigger.config.frequency === FREQUENCY_TYPES.MONTHLY && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Month
              </label>
              <select
                value={trigger.config.day || '1'}
                onChange={(e) => handleConfigChange('day', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                {MONTHS.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Time selection for all scheduled frequencies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <select
              value={trigger.config.time || '09:00'}
              onChange={(e) => handleConfigChange('time', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              {HOURS.map(hour => (
                <option key={hour.value} value={hour.value}>
                  {hour.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* Event type selection for event-based triggers */}
      {trigger.type === TRIGGER_TYPES.EVENT && (
        <div className="border rounded-md p-4 bg-purple-50">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type (Mock)
            </label>
            <select
              value={trigger.config?.eventType || 'new_lab_result'}
              onChange={(e) => handleConfigChange('eventType', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="new_lab_result">New Lab Result</option>
              <option value="new_mutation_report">New Mutation Report</option>
              <option value="patient_admission">Patient Admission</option>
              <option value="patient_discharge">Patient Discharge</option>
              <option value="treatment_started">Treatment Started</option>
              <option value="treatment_completed">Treatment Completed</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 italic mt-2">
            Note: Event-based triggers are simulated in this concept demonstration.
          </p>
        </div>
      )}
    </div>
  );
};

export default TriggerSelector; 