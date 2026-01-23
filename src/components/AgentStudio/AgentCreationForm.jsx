import React, { useState } from 'react';
import { useAgents } from '../../context/AgentContext';
import { TRIGGER_TYPES } from '../../constants/agentTypes';
import DataSourceSelector from './DataSourceSelector';
import ToolSelector from './ToolSelector';
import TriggerSelector from './TriggerSelector';
import ActionSelector from './ActionSelector';

// Demo templates for pre-filling the form
const demoTemplates = {
  patientMonitor: {
    name: 'Immune-related Adverse Events Monitor',
    goal: 'For my patients currently on Ipilimumab + Nivolumab, monitor weekly for new lab results indicating Grade 3/4 immune-related adverse events (e.g., LFTs >5x ULN, TSH out of range, Glucose >250) or new mentions of "colitis", "pneumonitis", "hepatitis" in progress notes. Alert me via secure message immediately.',
    dataSources: ['patient_demographics', 'lab_results', 'clinical_notes', 'treatment_history'],
    tools: [
      { id: 'identifyLabTrendTool', config: {} },
      { id: 'keywordConceptExtractionTool', config: { keywords: ['colitis', 'pneumonitis', 'hepatitis'] } }
    ],
    trigger: { 
      type: TRIGGER_TYPES.SCHEDULED, 
      config: { frequency: 'weekly', day: 'monday', time: '08:00' } 
    },
    actions: [
      { type: 'dashboard', config: {} },
      { type: 'email', config: { subject: 'Immune-related Adverse Event Alert', recipients: [] } }
    ]
  },
  trialMatcher: {
    name: 'KRAS G12C Trial Finder',
    goal: 'Monitor PubMed and ClinicalTrials.gov (mocked) daily for new publications or trials related to "KRAS G12C inhibitors" in "pancreatic cancer". If a Phase II/III trial opens or a significant new therapy is reported, summarize and send to my research team\'s channel.',
    dataSources: ['genomic_data', 'pubmed', 'clinical_trials'],
    tools: [
      { id: 'searchPubMedTool', config: {} },
      { id: 'clinicalTrialMatcherTool', config: {} },
      { id: 'summarizeTextTool', config: {} }
    ],
    trigger: { 
      type: TRIGGER_TYPES.SCHEDULED, 
      config: { frequency: 'daily', time: '09:00' } 
    },
    actions: [
      { type: 'dashboard', config: {} },
      { type: 'team_comms', config: { channel: 'research' } }
    ]
  },
  genomicAnalysis: {
    name: 'VUS Reclassification Pipeline',
    goal: 'For all patients in my "Newly Diagnosed AML" cohort, automatically run Evo2 analysis on all non-VUS mutations. For any mutation classified as PATHOGENIC with a high delta score, and if the gene is in my "Targetable Pathways List", create a preliminary link to the CRISPR design tool and flag for my review.',
    dataSources: ['patient_demographics', 'genomic_data'],
    tools: [
      { id: 'evo2VEPAnalysisTool', config: {} },
      { id: 'crisprGuideDesignLinkerTool', config: {} }
    ],
    trigger: { 
      type: TRIGGER_TYPES.EVENT, 
      config: { eventType: 'new_mutation_report' } 
    },
    actions: [
      { type: 'dashboard', config: {} },
      { type: 'patient_record', config: { noteType: 'action_item' } }
    ]
  }
};

const AgentCreationForm = ({ onCancel }) => {
  const { addAgent } = useAgents();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    dataSources: [],
    tools: [],
    trigger: { type: TRIGGER_TYPES.MANUAL },
    actions: []
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Handle basic input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle specific field updates
  const handleDataSourcesChange = (dataSources) => {
    setFormData(prev => ({ ...prev, dataSources }));
    if (errors.dataSources) setErrors(prev => ({ ...prev, dataSources: null }));
  };
  
  const handleToolsChange = (tools) => {
    setFormData(prev => ({ ...prev, tools }));
    if (errors.tools) setErrors(prev => ({ ...prev, tools: null }));
  };
  
  const handleTriggerChange = (trigger) => {
    setFormData(prev => ({ ...prev, trigger }));
    if (errors.trigger) setErrors(prev => ({ ...prev, trigger: null }));
  };
  
  const handleActionsChange = (actions) => {
    setFormData(prev => ({ ...prev, actions }));
    if (errors.actions) setErrors(prev => ({ ...prev, actions: null }));
  };
  
  // Form navigation
  const goToNextStep = () => {
    // Validate current step before proceeding
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      setErrors(stepErrors);
    }
  };
  
  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final validation
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length === 0) {
      addAgent(formData);
      onCancel(); // Return to dashboard after successful creation
    } else {
      setErrors(stepErrors);
    }
  };
  
  // Step validation
  const validateStep = (step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) stepErrors.name = 'Agent name is required';
        if (!formData.goal.trim()) stepErrors.goal = 'Agent goal is required';
        break;
      case 2:
        if (formData.dataSources.length === 0) stepErrors.dataSources = 'Select at least one data source';
        break;
      case 3:
        if (formData.tools.length === 0) stepErrors.tools = 'Select at least one tool';
        break;
      case 4:
        if (formData.actions.length === 0) stepErrors.actions = 'Select at least one action';
        break;
      default:
        break;
    }
    
    return stepErrors;
  };
  
  // Load a demo template
  const loadDemoTemplate = (templateKey) => {
    const template = demoTemplates[templateKey];
    if (template) {
      setFormData({
        ...formData,
        ...template
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4].map(step => (
            <React.Fragment key={step}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <div>Basic Info</div>
          <div>Data Sources</div>
          <div>Tools</div>
          <div>Triggers & Actions</div>
        </div>
      </div>
      
      {/* Demo template selector */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium text-gray-700">Load Demo Template</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => loadDemoTemplate('patientMonitor')}
            className="p-2 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-left"
          >
            <div className="font-medium">Patient Monitoring</div>
            <div className="text-gray-500 truncate">Immune-related adverse events tracking</div>
          </button>
          <button
            type="button"
            onClick={() => loadDemoTemplate('trialMatcher')}
            className="p-2 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-left"
          >
            <div className="font-medium">Trial Matcher</div>
            <div className="text-gray-500 truncate">KRAS G12C trial finder</div>
          </button>
          <button
            type="button"
            onClick={() => loadDemoTemplate('genomicAnalysis')}
            className="p-2 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-left"
          >
            <div className="font-medium">Genomic Analysis</div>
            <div className="text-gray-500 truncate">VUS reclassification pipeline</div>
          </button>
        </div>
      </div>
      
      {/* Basic Info - Step 1 */}
      {currentStep === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Give your agent a descriptive name"
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Goal/Purpose
            </label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              placeholder="Describe what you want this agent to accomplish in natural language..."
              rows={5}
              className={`w-full p-2 border rounded-md ${errors.goal ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.goal && <p className="mt-1 text-sm text-red-600">{errors.goal}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Be specific about patient populations, conditions, thresholds, and desired outcomes.
            </p>
          </div>
        </div>
      )}
      
      {/* Data Sources - Step 2 */}
      {currentStep === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Sources</h2>
          <p className="text-sm text-gray-600 mb-4">Select the data sources this agent should have access to:</p>
          
          <DataSourceSelector 
            selectedSources={formData.dataSources} 
            onChange={handleDataSourcesChange}
          />
          
          {errors.dataSources && (
            <p className="mt-2 text-sm text-red-600">{errors.dataSources}</p>
          )}
        </div>
      )}
      
      {/* Tools - Step 3 */}
      {currentStep === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Agent Tools</h2>
          <p className="text-sm text-gray-600 mb-4">Select the tools this agent should have access to:</p>
          
          <ToolSelector 
            selectedTools={formData.tools} 
            onChange={handleToolsChange}
          />
          
          {errors.tools && (
            <p className="mt-2 text-sm text-red-600">{errors.tools}</p>
          )}
        </div>
      )}
      
      {/* Triggers & Actions - Step 4 */}
      {currentStep === 4 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Triggers & Actions</h2>
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Agent Trigger</h3>
            <TriggerSelector 
              trigger={formData.trigger}
              onChange={handleTriggerChange}
            />
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Agent Actions</h3>
            <ActionSelector 
              actions={formData.actions}
              onChange={handleActionsChange}
            />
            
            {errors.actions && (
              <p className="mt-2 text-sm text-red-600">{errors.actions}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Form navigation buttons */}
      <div className="mt-8 flex justify-between">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={goToPrevStep}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div>
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Create Agent
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default AgentCreationForm; 