import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Alert,
    Divider,
    Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ScienceIcon from '@mui/icons-material/Science';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

/**
 * BaselineWorkflow — replaces dead "Waiting for input..." panel for treatment-naive patients.
 *
 * Shows:
 * 1) "Baseline Not Established" status
 * 2) What the system knows from existing data
 * 3) Guided checklist: what to collect next
 * 4) Clear statement that forecasts are not available until baseline exists
 *
 * All data is from structured API payloads only. Nothing is invented.
 */

const StatusBanner = styled(Box)({
    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    border: '1px solid #4a5568',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    textAlign: 'center',
});

const ActionCard = styled(Paper)({
    background: '#1a202c',
    border: '1px solid #2d3748',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '8px',
});

// Extract actionable items from the prediction's recommended_actions or prognosis rationale
function extractKnownFacts(prediction) {
    const facts = [];
    if (!prediction) return facts;

    const rationale = prediction.prognosis?.rationale || [];
    for (const r of rationale) {
        if (typeof r === 'string' && r.length > 0) {
            facts.push(r);
        }
    }
    return facts;
}

// Default collection checklist for treatment-naive patients
const DEFAULT_COLLECTION_STEPS = [
    {
        label: 'CA-125 Baseline Value',
        description: 'Record pre-treatment CA-125 to enable KELIM monitoring and milestone tracking after treatment begins.',
        status: 'pending',
    },
    {
        label: 'ctDNA Baseline (if available)',
        description: 'Pre-treatment ctDNA measurement enables longitudinal comparison during therapy to detect molecular residual disease.',
        status: 'pending',
    },
    {
        label: 'HRD Score',
        description: 'Required for L2 completeness. Determines PARP sensitivity prediction and DDR mechanism confidence.',
        status: 'pending',
    },
    {
        label: 'TMB (Tumor Mutational Burden)',
        description: 'Enables immunotherapy response prediction and refines resistance risk stratification.',
        status: 'pending',
    },
];

function BaselineWorkflow({ prediction, recommendedActions, recommendedTests }) {
    const knownFacts = extractKnownFacts(prediction);
    const riskLevel = prediction?.risk_level || 'NOT_APPLICABLE';

    // Build collection steps from recommended_tests if available, else use defaults
    const collectionSteps = (recommendedTests && recommendedTests.length > 0)
        ? recommendedTests.map(t => ({
            label: t.test || t.action || 'Unknown Test',
            description: t.why || t.description || '',
            unlocks: t.unlocks || [],
            status: 'pending',
        }))
        : DEFAULT_COLLECTION_STEPS;

    // Extract actions from recommendedActions (e.g., "ESTABLISH_BASELINE")
    const actions = (recommendedActions || []).filter(a => a && a.action);

    return (
        <Box>
            {/* Status Banner */}
            <StatusBanner>
                <HourglassEmptyIcon sx={{ fontSize: 40, color: '#ecc94b', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ecc94b', letterSpacing: '-0.5px' }}>
                    BASELINE NOT ESTABLISHED
                </Typography>
                <Typography variant="body2" sx={{ color: '#a0aec0', mt: 0.5 }}>
                    Treatment-naive patient — no longitudinal data available for resistance forecasting.
                </Typography>
                <Chip
                    label="RUO — Research Use Only"
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1, color: '#a0aec0', borderColor: '#4a5568', fontSize: '0.7rem' }}
                />
            </StatusBanner>

            {/* What the system knows */}
            {knownFacts.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#4fd1c5', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                        Engine Assessment
                    </Typography>
                    {knownFacts.map((fact, i) => (
                        <Alert
                            key={i}
                            severity="info"
                            variant="outlined"
                            sx={{
                                mb: 0.5,
                                bgcolor: 'transparent',
                                borderColor: '#2d3748',
                                color: '#a0aec0',
                                '& .MuiAlert-icon': { color: '#4fd1c5' },
                                fontSize: '0.8rem',
                            }}
                        >
                            {fact}
                        </Alert>
                    ))}
                </Box>
            )}

            {/* Recommended Actions from Engine */}
            {actions.length > 0 && actions.map((a, i) => (
                <ActionCard key={i} elevation={0}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScienceIcon sx={{ fontSize: 16, color: '#ecc94b' }} />
                        <Typography variant="body2" sx={{ color: '#e0e0e0', fontWeight: 600 }}>
                            {a.action.replace(/_/g, ' ')}
                        </Typography>
                    </Box>
                    {a.description && (
                        <Typography variant="caption" sx={{ color: '#718096', mt: 0.5, display: 'block' }}>
                            {a.description}
                        </Typography>
                    )}
                </ActionCard>
            ))}

            <Divider sx={{ my: 2, borderColor: '#2d3748' }} />

            {/* What to Collect Next */}
            <Typography variant="subtitle2" sx={{ color: '#4fd1c5', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                What to Collect for Monitoring
            </Typography>

            <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { borderColor: '#2d3748' } }}>
                {collectionSteps.map((step, index) => (
                    <Step key={index} active={true}>
                        <StepLabel
                            icon={
                                step.status === 'complete'
                                    ? <CheckCircleOutlineIcon sx={{ color: '#48bb78', fontSize: 20 }} />
                                    : <RadioButtonUncheckedIcon sx={{ color: '#4a5568', fontSize: 20 }} />
                            }
                        >
                            <Typography variant="body2" sx={{ color: '#e0e0e0', fontWeight: 600 }}>
                                {step.label}
                            </Typography>
                        </StepLabel>
                        <StepContent>
                            <Typography variant="caption" sx={{ color: '#718096' }}>
                                {step.description}
                            </Typography>
                            {step.unlocks && step.unlocks.length > 0 && (
                                <Box sx={{ mt: 0.5 }}>
                                    {step.unlocks.map((u, j) => (
                                        <Chip
                                            key={j}
                                            label={`Unlocks: ${u}`}
                                            size="small"
                                            sx={{ mr: 0.5, mt: 0.5, fontSize: '0.65rem', color: '#4fd1c5', borderColor: '#2d3748' }}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            )}
                        </StepContent>
                    </Step>
                ))}
            </Stepper>

            <Divider sx={{ my: 2, borderColor: '#2d3748' }} />

            {/* When forecasts become available */}
            <Alert
                severity="warning"
                variant="outlined"
                sx={{
                    bgcolor: 'transparent',
                    borderColor: '#4a5568',
                    color: '#a0aec0',
                    '& .MuiAlert-icon': { color: '#ecc94b' },
                    fontSize: '0.78rem',
                }}
            >
                <strong>Forecasts are not available.</strong> Resistance prediction requires at least
                one treatment cycle with follow-up data (CA-125 trend, imaging, or ctDNA change)
                before the Prophet engine can generate risk projections.
            </Alert>
        </Box>
    );
}

export default BaselineWorkflow;
