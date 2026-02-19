import React, { useState } from 'react';
import { Box, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store';

// Common & Reusable Components
import ProgressFlow from './ProgressFlow';
import BaseCard from './BaseCard';
import InteractiveButton from './InteractiveButton';
import HypothesisCard from '../validator/HypothesisCard';
import SourceCitation from '../validator/SourceCitation';
import EntityInsight from '../validator/EntityInsight';
import MyelomaResponseDisplay from '../myeloma/MyelomaResponseDisplay';
import SeedSoilAnalysisDisplay from '../assessment/SeedSoilAnalysisDisplay';
import CrisprDesignDisplay from '../crispr/CrisprDesignDisplay';
import TranscriptionResults from '../transcription/TranscriptionResults';
import ProteinSynthesisResults from '../protein/ProteinSynthesisResults';
import StructurePredictionResults from '../structure/StructurePredictionResults';
import DemoAnalysisResults from '../analysis/DemoAnalysisResults';
import { TargetDossierDisplay } from '../dossier/TargetDossierDisplay';
import TargetDossierRunner from '../dossier/TargetDossierRunner';


import { pik3caTrinityCampaignConfig } from '../../config/campaigns/pik3ca_trinity_campaign_config';

const HypothesisValidatorResults = ({ query, results }) => {
  const { searchResult, synthesisResult, prevalenceData } = results;
  const navigate = useNavigate();

  const handleDesignExperiment = (entity) => {
    const geneName = entity.name;
    const description = entity.description;
    const firstEntity = geneName.split(',')[0].trim();
    const geneSymbol = firstEntity.split(' ')[0];
    navigate(`/genomic-analysis/${geneSymbol}`, { 
      state: { 
        targetName: geneName,
        initialIntel: description,
        sourceQuery: query
      } 
    });
  };

  if (!synthesisResult) return null;

  return (
    <>
      <HypothesisCard query={query} summary={synthesisResult.summary} significance="high" />
      {searchResult?.results && <SourceCitation results={searchResult.results} />}
      {synthesisResult.entities && (
        <EntityInsight 
          entities={synthesisResult.entities}
          prevalenceData={prevalenceData || {}}
          isLoadingPrevalence={!prevalenceData}
          onDesignExperiment={handleDesignExperiment}
        />
      )}
    </>
  );
};

const componentRegistry = {
  HypothesisValidatorResults,
  MyelomaResponseDisplay,
  SeedSoilAnalysisDisplay,
  CrisprDesignDisplay,
  TranscriptionResults,
  ProteinSynthesisResults,
  StructurePredictionResults,
  DemoAnalysisResults,
  TargetDossierDisplay: TargetDossierRunner, // Use the dedicated runner for Target Dossier
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runOracleWorkflow = async (setResults, setCompletedSteps) => {
  setResults({});
  setCompletedSteps(['input']);
  await wait(1500);
  const oracleStageData = pik3caTrinityCampaignConfig.acts[0].stages[0];
  setResults(prev => ({ ...prev, oracle: { data: oracleStageData } }));
  setCompletedSteps(prev => [...prev, 'oracle']);
};

const runForgeWorkflow = async (setResults, setCompletedSteps) => {
  await wait(1500);
  const forgeStageData = pik3caTrinityCampaignConfig.acts[1].stages[0];
  setResults(prev => ({ ...prev, forge: { data: forgeStageData } }));
  setCompletedSteps(prev => [...prev, 'forge']);
};

const runGauntletWorkflow = async (setResults, setCompletedSteps) => {
  await wait(1500);
  const gauntletStageData = pik3caTrinityCampaignConfig.acts[2].stages[0];
  setResults(prev => ({ ...prev, gauntlet: { data: gauntletStageData } }));
  setCompletedSteps(prev => [...prev, 'gauntlet']);
};

const ToolRunner = ({ toolConfig }) => {
  const { 
    toolId,
    title, 
    subtitle, 
    progressSteps, 
    inputSections, 
    resultsComponent 
  } = toolConfig;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(progressSteps[0]?.id);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formState, setFormState] = useState(
    inputSections.reduce((acc, section) => {
      section.fields.forEach(field => {
        acc[field.id] = field.defaultValue || '';
      });
      return acc;
    }, {})
  );
  const [results, setResults] = useState({});
  const { activeMutation } = useAppStore();
  const navigate = useNavigate();

  const hypothesisValidationWorkflow = async () => {
    const { query } = formState;
    setResults({});
    setCompletedSteps(['hypothesis']);
    
    setCurrentStep('data');
    const searchResult = await executeApiCall({ endpoint: '/api/intelligence/search', payload: { query } });
    if (!searchResult) return;
    setResults(prev => ({...prev, searchResult}));
    
    setCurrentStep('synthesis');
    const combinedContent = searchResult.results.map(r => r.content).join('\n\n');
    const synthesisResult = await executeApiCall({ endpoint: '/api/intelligence/synthesize', payload: { content: combinedContent } });
    if (!synthesisResult) return;
    setResults(prev => ({...prev, synthesisResult}));
    setCompletedSteps(prev => [...prev, 'data']);

    if (synthesisResult.entities && synthesisResult.entities.length > 0) {
      const entityNames = synthesisResult.entities.map(e => e.name);
      const prevalenceData = await executeApiCall({ endpoint: '/api/population/entity_prevalence', payload: { entities: entityNames } });
      if (prevalenceData) {
        const prevalenceMap = prevalenceData.data.reduce((acc, item) => {
          acc[item.name] = item;
          return acc;
        }, {});
        setResults(prev => ({ ...prev, prevalenceData: prevalenceMap }));
      }
    }
    setCurrentStep('design');
    setCompletedSteps(prev => [...prev, 'synthesis']);
  };

  const genericApiWorkflow = async (apiConfig) => {
    // Build payload from form state placeholders
    const payload = Object.keys(apiConfig.payload).reduce((acc, key) => {
      const placeholder = apiConfig.payload[key];
      const formKey = placeholder.replace(/[{}]/g, '');
      acc[key] = formState[formKey];
      return acc;
    }, {});

    // Special-case: Myeloma Digital Twin supports batch mutations[]
    if (apiConfig.endpoint === '/api/predict/myeloma_drug_response') {
      try {
        const muts = (window.__mdt_mutations || []).filter(m => m && m.gene && m.variant_info && m.build);
        if (muts.length > 0) {
          payload.mutations = muts;
          // ensure model_id accompanies the batch
          if (formState.model_id) payload.model_id = formState.model_id;
          // dual model comparison toggle
          if (typeof window.__mdt_dual_compare !== 'undefined') {
            payload.dual_compare = Boolean(window.__mdt_dual_compare);
          }
          // remove single-row fields if present
          delete payload.gene; delete payload.hgvs_p; delete payload.variant_info; delete payload.build;
        }
      } catch (_) {}
    }
    
    const result = await executeApiCall({ ...apiConfig, payload });
    if (result) {
      // For components that expect the raw result (not nested by endpoint), pass through directly
      if (toolConfig.resultsComponent === 'MyelomaResponseDisplay') {
        setResults(result);
      } else {
        setResults(prev => ({...prev, [apiConfig.endpoint]: result}));
      }
    }
  };

  const workflowRegistry = {
    hypothesisValidationWorkflow,
    genericApiWorkflow,
    runOracleWorkflow,
    runForgeWorkflow,
    runGauntletWorkflow,
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (name === 'model_id') {
      try { window.__mdt_model_id = value; } catch (_) {}
    }
  };
  
  const executeApiCall = async ({ endpoint, payload }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown API error' }));
        throw new Error(`API request failed: ${response.status} - ${errorData.detail}`);
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action) => {
    setIsLoading(true);
    setError(null);
    try {
      if (action.workflow) {
        const workflow = workflowRegistry[action.workflow];
        if (typeof workflow === 'function') {
          await workflow(setResults, setCompletedSteps);
        } else {
          throw new Error(`Workflow "${action.workflow}" is not a function.`);
        }
      } else if (action.apiCall) {
        await genericApiWorkflow(action.apiCall);
      } else {
        throw new Error("No valid workflow or API call specified in action.");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const ResultsComponent = componentRegistry[toolConfig.resultsComponent];

  // For Target Dossier, use the dedicated runner component that handles its own layout
  if (toolConfig.resultsComponent === 'TargetDossierDisplay') {
    return <ResultsComponent toolConfig={toolConfig} />;
  }

  // For other tools, use the standard input-driven flow
  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', mb: 1 }}>{title}</Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>{subtitle}</Typography>
      {progressSteps && <ProgressFlow currentStep={currentStep} completedSteps={completedSteps} />}
      
      {inputSections.map(section => (
        <BaseCard key={section.id} title={section.title} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {section.fields.map(field => (
              <TextField
                key={field.id}
                name={field.id}
                label={field.label}
                variant="outlined"
                multiline={field.type === 'textarea'}
                rows={field.type === 'textarea' ? 4 : 1}
                value={formState[field.id]}
                onChange={handleInputChange}
                disabled={isLoading}
                fullWidth
              />
            ))}
            {section.action && section.action.buttonText && (
              <InteractiveButton
                onClick={() => handleAction(section.action)}
                isLoading={isLoading}
                loadingText="Executing..."
                disabled={isLoading}
                sx={{ minWidth: 150, alignSelf: 'flex-start' }}
              >
                {section.action.buttonText}
              </InteractiveButton>
            )}
          </Box>
        </BaseCard>
      ))}
      
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      
      {ResultsComponent && Object.keys(results).length > 0 && (
        <ResultsComponent 
          results={results} 
          onAction={handleAction}
          currentStep={currentStep}
          completedSteps={completedSteps}
          progressSteps={progressSteps}
          setCurrentStep={setCurrentStep}
          setCompletedSteps={setCompletedSteps}
        />
      )}
    </Box>
  );
};

export default ToolRunner; 