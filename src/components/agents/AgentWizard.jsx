/**
 * Agent Wizard - Multi-step agent creation UI
 * 
 * Steps:
 * 1. Select agent type (PubMed Sentinel, Trial Scout, Genomic Forager)
 * 2. Configure agent-specific settings
 * 3. Set schedule (run frequency)
 * 4. Review and create
 */

import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Alert,
} from '@mui/material';
import { useAgents } from '../../context/AgentContext';

const AGENT_TYPES = [
  {
    value: 'pubmed_sentinel',
    label: 'PubMed Sentinel',
    description: 'Monitor biomedical literature for new publications matching your keywords',
    icon: '📚',
  },
  {
    value: 'trial_scout',
    label: 'Trial Scout',
    description: 'Monitor clinical trial landscape for matching opportunities',
    icon: '🔬',
  },
  {
    value: 'genomic_forager',
    label: 'Genomic Forager',
    description: 'Hunt for new genomic datasets across public repositories',
    icon: '🧬',
  },
];

const STEPS = ['Select Type', 'Configure', 'Schedule', 'Review'];

export const AgentWizard = ({ onClose, onSuccess }) => {
  const { createAgent } = useAgents();
  const [activeStep, setActiveStep] = useState(0);
  const [agentType, setAgentType] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [runFrequency, setRunFrequency] = useState('daily');
  const [config, setConfig] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Agent type selection
  const renderTypeSelection = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select Agent Type
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the type of autonomous agent you want to create
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {AGENT_TYPES.map((type) => (
          <Paper
            key={type.value}
            sx={{
              p: 2,
              cursor: 'pointer',
              border: agentType === type.value ? 2 : 1,
              borderColor: agentType === type.value ? 'primary.main' : 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => setAgentType(type.value)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5">{type.icon}</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{type.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {type.description}
                </Typography>
              </Box>
              {agentType === type.value && (
                <Chip label="Selected" color="primary" size="small" />
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  // Step 2: Agent-specific configuration
  const renderConfiguration = () => {
    if (!agentType) {
      return (
        <Alert severity="warning">
          Please select an agent type first
        </Alert>
      );
    }

    if (agentType === 'pubmed_sentinel') {
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            PubMed Sentinel Configuration
          </Typography>
          <TextField
            fullWidth
            label="Keywords (comma-separated)"
            placeholder="e.g., BRCA1, ovarian cancer, PARP inhibitor"
            sx={{ mt: 2 }}
            onChange={(e) => {
              const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
              setConfig(prev => ({
                ...prev,
                keywords: {
                  genes: keywords.filter(k => /^[A-Z0-9]+$/.test(k)),
                  diseases: keywords.filter(k => k.toLowerCase().includes('cancer')),
                  mechanisms: keywords.filter(k => k.toLowerCase().includes('inhibitor') || k.toLowerCase().includes('pathway')),
                },
              }));
            }}
          />
          <FormHelperText>
            Enter keywords separated by commas. The agent will search for papers matching these terms.
          </FormHelperText>
        </Box>
      );
    }

    if (agentType === 'trial_scout') {
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Trial Scout Configuration
          </Typography>
          <TextField
            fullWidth
            label="Disease"
            placeholder="e.g., Ovarian Cancer"
            sx={{ mt: 2 }}
            onChange={(e) => {
              setConfig(prev => ({
                ...prev,
                patient_profile: {
                  ...(prev.patient_profile || {}),
                  disease: e.target.value,
                },
              }));
            }}
          />
          <TextField
            fullWidth
            label="Stage"
            placeholder="e.g., Stage IV"
            sx={{ mt: 2 }}
            onChange={(e) => {
              setConfig(prev => ({
                ...prev,
                patient_profile: {
                  ...(prev.patient_profile || {}),
                  stage: e.target.value,
                },
              }));
            }}
          />
          <TextField
            fullWidth
            label="Treatment Line"
            placeholder="e.g., first-line, second-line"
            sx={{ mt: 2 }}
            onChange={(e) => {
              setConfig(prev => ({
                ...prev,
                patient_profile: {
                  ...(prev.patient_profile || {}),
                  treatment_line: e.target.value,
                },
              }));
            }}
          />
        </Box>
      );
    }

    if (agentType === 'genomic_forager') {
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Genomic Forager Configuration
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Genomic Forager configuration coming soon. This agent will search cBioPortal, TCGA, and GEO for new datasets.
          </Alert>
        </Box>
      );
    }

    return null;
  };

  // Step 3: Schedule configuration
  const renderSchedule = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Run Schedule
      </Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Run Frequency</InputLabel>
        <Select
          value={runFrequency}
          label="Run Frequency"
          onChange={(e) => setRunFrequency(e.target.value)}
        >
          <MenuItem value="hourly">Hourly</MenuItem>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </Select>
        <FormHelperText>
          How often should this agent run automatically?
        </FormHelperText>
      </FormControl>
    </Box>
  );

  // Step 4: Review
  const renderReview = () => {
    const selectedType = AGENT_TYPES.find(t => t.value === agentType);
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Review Agent Configuration
        </Typography>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Name
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {name || '(Not set)'}
          </Typography>
          
          <Typography variant="subtitle2" color="text.secondary">
            Type
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedType?.label || '(Not set)'}
          </Typography>
          
          <Typography variant="subtitle2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {description || '(Not set)'}
          </Typography>
          
          <Typography variant="subtitle2" color="text.secondary">
            Run Frequency
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {runFrequency}
          </Typography>
          
          <Typography variant="subtitle2" color="text.secondary">
            Configuration
          </Typography>
          <Typography variant="body2" component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, fontSize: '0.75rem' }}>
            {JSON.stringify(config, null, 2)}
          </Typography>
        </Paper>
      </Box>
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !agentType) {
      setError('Please select an agent type');
      return;
    }
    if (activeStep === 1 && !name) {
      setError('Please enter an agent name');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!name || !agentType) {
      setError('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const agentData = {
        agent_type: agentType,
        name,
        description,
        config,
        run_frequency: runFrequency,
      };

      await createAgent(agentData);
      
      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderTypeSelection();
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Agent Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            {renderConfiguration()}
          </Box>
        );
      case 2:
        return renderSchedule();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {renderStepContent()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep === STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Agent'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};


