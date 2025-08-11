import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography, Chip } from '@mui/material';
import { Science, Search, Psychology, Timeline, Assessment, Build } from '@mui/icons-material';

const WORKFLOW_STEPS = [
    { 
        key: 'hypothesis', 
        label: 'Hypothesis Formation', 
        description: 'Research question & literature review',
        icon: <Search />
    },
    { 
        key: 'design', 
        label: 'Experimental Design', 
        description: 'Plan validation methodology',
        icon: <Science />
    },
    { 
        key: 'data', 
        label: 'Data Collection', 
        description: 'Gather target information',
        icon: <Timeline />
    },
    { 
        key: 'experiment', 
        label: 'Experimentation', 
        description: 'Run validation tests',
        icon: <Psychology />
    },
    { 
        key: 'results', 
        label: 'Results Analysis', 
        description: 'Interpret findings',
        icon: <Assessment />
    },
    { 
        key: 'action', 
        label: 'Next Steps', 
        description: 'Apply knowledge',
        icon: <Build />
    }
];

const ProgressFlow = ({ currentStep, completedSteps = [], sx = {} }) => {
    const currentStepIndex = WORKFLOW_STEPS.findIndex(step => step.key === currentStep);
    const currentStepInfo = WORKFLOW_STEPS[currentStepIndex];

    return (
        <Box sx={{ width: '100%', mb: 3, ...sx }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {currentStepInfo?.icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                    Current Phase: {currentStepInfo?.label}
                </Typography>
                <Chip 
                    label={`Step ${currentStepIndex + 1} of ${WORKFLOW_STEPS.length}`} 
                    size="small" 
                    sx={{ ml: 2 }} 
                />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentStepInfo?.description}
            </Typography>

            <Stepper activeStep={currentStepIndex} alternativeLabel>
                {WORKFLOW_STEPS.map((step, index) => (
                    <Step key={step.key} completed={completedSteps.includes(step.key)}>
                        <StepLabel>{step.label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default ProgressFlow; 