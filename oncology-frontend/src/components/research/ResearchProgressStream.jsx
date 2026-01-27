/**
 * Research Progress Stream Component
 *
 * Foundation for streaming insights - shows what the system is doing
 * Ready for SSE connection when backend supports streaming
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  LinearProgress,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  Chip,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const STEPS = [
  { id: 'formulating_plan', label: 'Formulating Research Plan', description: 'Analyzing question and creating research strategy' },
  { id: 'querying_portals', label: 'Searching PubMed', description: 'Finding relevant articles' },
  { id: 'parsing_articles', label: 'Parsing Articles', description: 'Extracting full-text insights' },
  { id: 'llm_synthesis', label: 'Synthesizing Findings', description: 'Generating insights and summaries' },
  { id: 'moat_analysis', label: 'MOAT Analysis', description: 'Analyzing pathways and clinical implications' },
  { id: 'dossier_generation', label: 'Generating Dossier', description: 'Compiling comprehensive report' },
  { id: 'value_synthesis', label: 'Finalizing Insights', description: 'Creating executive summary and actionable recommendations' },
  { id: 'complete', label: 'Research Complete', description: 'All tasks finished' },
];

const ResearchProgressStream = ({ streaming, progress, currentStep, stepData, error, result }) => {
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    if (currentStep) {
      const stepIndex = STEPS.findIndex(step => step.id === currentStep);
      if (stepIndex !== -1) {
        setActiveStep(stepIndex);
        setCompletedSteps(prev => ({ ...prev, [stepIndex - 1]: true })); // Mark previous step as complete
      }
    }
    if (result) {
      setActiveStep(STEPS.length - 1); // Mark last step as active
      setCompletedSteps(STEPS.reduce((acc, _, i) => ({ ...acc, [i]: true }), {})); // Mark all as complete
    }
  }, [currentStep, result]);

  if (!streaming && !result && !error) {
    return null; // Only show when streaming or results are present
  }

  return (
    <Card sx={{ mb: 3, p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Research Progress
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Research Error</AlertTitle>
          {error}
        </Alert>
      )}
      {streaming && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="indeterminate" sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {currentStep ? STEPS.find(s => s.id === currentStep)?.description : 'Starting research...'}
          </Typography>
        </Box>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {STEPS.map((step, index) => (
          <Step key={step.id} completed={completedSteps[index]}>
            <StepLabel
              StepIconComponent={() => (
                completedSteps[index] ? <CheckCircleIcon color="success" /> :
                (index === activeStep && streaming) ? <CircularProgress size={24} /> :
                null
              )}
            >
              <Typography variant="subtitle1">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">{step.description}</Typography>
              {stepData && stepData[step.id] && (
                <Chip
                  label={stepData[step.id]}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {!streaming && result && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <AlertTitle>Research Complete!</AlertTitle>
          Your research query has been successfully processed.
        </Alert>
      )}
    </Card>
  );
};

export default ResearchProgressStream;
