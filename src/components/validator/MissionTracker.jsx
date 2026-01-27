import React from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Stepper, Step, StepLabel, StepIconProps } from '@mui/material';
import { CheckCircle, Error, HourglassEmpty, Science, Biotech, Dna, RocketLaunch } from '@mui/icons-material';
import BaseCard from './common/BaseCard';
import ResultDisplay from './validator/ResultDisplay';

// --- STAGES OF THE PREDATOR PROTOCOL ---
const steps = [
    'HUNT: Target Acquisition',
    'FORGE: Candidate Generation',
    'SIEVE: Sequence Validation',
    'GAUNTLET: Structural Validation',
    'LETHALITY: Affinity Prediction',
    'COMPLETE: Weapon Forged'
];

const getStepIcon = (props, status) => {
    const { active, completed } = props;
    const icons = {
        1: <RocketLaunch />,
        2: <Dna />,
        3: <Science />,
        4: <Biotech />,
        5: <CheckCircle />,
        6: <CheckCircle />,
    };

    if (status === 'failed') return <Error color="error" />;
    if (completed) return <CheckCircle color="success" />;
    if (active) return <CircularProgress size={20} />;
    return <HourglassEmpty color="disabled" />;
};


const MissionTracker = ({ status }) => {
    if (!status) {
        return (
            <BaseCard title="Initiating Mission..." statusColor="#e3f2fd">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress />
                    <Typography>Establishing secure link to Command Center...</Typography>
                </Box>
            </BaseCard>
        );
    }

    if (status.status === 'failed') {
        return (
            <Alert severity="error">
                <Typography variant="h6">Mission Failed</Typography>
                <Typography>{status.message}</Typography>
            </Alert>
        );
    }
    
    // Determine the current step based on the message from the CommandCenter
    const getCurrentStep = () => {
        const message = status.message?.toLowerCase() || '';
        if (message.includes('lethality')) return 4;
        if (message.includes('gauntlet')) return 3;
        if (message.includes('sieve')) return 2;
        if (message.includes('forge')) return 1;
        if (message.includes('hunt') || message.includes('initiated')) return 0;
        if (status.status === 'complete') return 6;
        return 0;
    };

    const activeStep = getCurrentStep();

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h3" gutterBottom sx={{ textAlign: 'center' }}>
                🧬 Predator Protocol Live Feed
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                Real-Time Therapeutic Design & Validation
            </Typography>

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel StepIconComponent={(props) => getStepIcon(props, status.status)}>
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, minHeight: '50px' }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                       Status: {status.message}
                    </Typography>
                </Box>
            </Paper>

            {status.status === 'complete' && status.result && (
                <ResultDisplay result={status.result[0]} />
            )}
        </Box>
    );
};

export default MissionTracker; 
import { Box, Typography, CircularProgress, Alert, Paper, Stepper, Step, StepLabel, StepIconProps } from '@mui/material';
import { CheckCircle, Error, HourglassEmpty, Science, Biotech, Dna, RocketLaunch } from '@mui/icons-material';
import BaseCard from './common/BaseCard';
import ResultDisplay from './validator/ResultDisplay';

// --- STAGES OF THE PREDATOR PROTOCOL ---
const steps = [
    'HUNT: Target Acquisition',
    'FORGE: Candidate Generation',
    'SIEVE: Sequence Validation',
    'GAUNTLET: Structural Validation',
    'LETHALITY: Affinity Prediction',
    'COMPLETE: Weapon Forged'
];

const getStepIcon = (props, status) => {
    const { active, completed } = props;
    const icons = {
        1: <RocketLaunch />,
        2: <Dna />,
        3: <Science />,
        4: <Biotech />,
        5: <CheckCircle />,
        6: <CheckCircle />,
    };

    if (status === 'failed') return <Error color="error" />;
    if (completed) return <CheckCircle color="success" />;
    if (active) return <CircularProgress size={20} />;
    return <HourglassEmpty color="disabled" />;
};


const MissionTracker = ({ status }) => {
    if (!status) {
        return (
            <BaseCard title="Initiating Mission..." statusColor="#e3f2fd">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress />
                    <Typography>Establishing secure link to Command Center...</Typography>
                </Box>
            </BaseCard>
        );
    }

    if (status.status === 'failed') {
        return (
            <Alert severity="error">
                <Typography variant="h6">Mission Failed</Typography>
                <Typography>{status.message}</Typography>
            </Alert>
        );
    }
    
    // Determine the current step based on the message from the CommandCenter
    const getCurrentStep = () => {
        const message = status.message?.toLowerCase() || '';
        if (message.includes('lethality')) return 4;
        if (message.includes('gauntlet')) return 3;
        if (message.includes('sieve')) return 2;
        if (message.includes('forge')) return 1;
        if (message.includes('hunt') || message.includes('initiated')) return 0;
        if (status.status === 'complete') return 6;
        return 0;
    };

    const activeStep = getCurrentStep();

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h3" gutterBottom sx={{ textAlign: 'center' }}>
                🧬 Predator Protocol Live Feed
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                Real-Time Therapeutic Design & Validation
            </Typography>

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel StepIconComponent={(props) => getStepIcon(props, status.status)}>
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, minHeight: '50px' }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                       Status: {status.message}
                    </Typography>
                </Box>
            </Paper>

            {status.status === 'complete' && status.result && (
                <ResultDisplay result={status.result[0]} />
            )}
        </Box>
    );
};

export default MissionTracker; 
 
 
 
 
 