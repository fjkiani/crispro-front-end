import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel, Alert } from '@mui/material';
import { Science, Computer, Assessment, Build } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const ExperimentDesign = ({ targetName }) => {
    const experimentSteps = [
        {
            label: 'Knockout Simulation',
            description: 'Computationally simulate complete loss of target function',
            icon: <Science />
        },
        {
            label: 'AI Analysis',
            description: 'Zeta Oracle analyzes genomic context and predicts impact',
            icon: <Computer />
        },
        {
            label: 'Essentiality Scoring',
            description: 'Calculate Zeta Score measuring dependency on target',
            icon: <Assessment />
        },
        {
            label: 'Verdict Generation',
            description: 'Interpret results and recommend next actions',
            icon: <Build />
        }
    ];

    return (
        <BaseCard
            title="Experimental Methodology: The Gauntlet Protocol"
            subtitle="Understanding how we validate therapeutic targets"
            statusColor="#fff3e0"
            expandable={true}
            defaultExpanded={false}
        >
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    The Gauntlet is an in silico experiment that uses AI to predict what would happen if we completely eliminated your target ({targetName}) from the biological system.
                </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom>How It Works</Typography>
            
            <Stepper orientation="vertical" sx={{ mb: 3 }}>
                {experimentSteps.map((step, index) => (
                    <Step key={index} active={true}>
                        <StepLabel icon={step.icon}>
                            <Typography variant="subtitle1">{step.label}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {step.description}
                            </Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Interpreting Results</Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1, borderLeft: '4px solid #4caf50' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                            Zeta Score ≤ -1.0 (TRUTH - Valid Target)
                        </Typography>
                        <Typography variant="body2">
                            Knockout causes significant system disruption. This target is essential and represents a viable therapeutic intervention point.
                        </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1, borderLeft: '4px solid #ff9800' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                            Zeta Score > -1.0 (TREASON - Poor Target)
                        </Typography>
                        <Typography variant="body2">
                            Knockout has minimal impact. This target is non-essential and unlikely to be therapeutically effective.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                    Scientific Foundation
                </Typography>
                <Typography variant="body2">
                    This methodology is based on the principle that effective therapeutic targets must be essential to the disease process. By simulating target elimination, we can predict therapeutic efficacy before expensive experimental validation.
                </Typography>
            </Box>
        </BaseCard>
    );
};

export default ExperimentDesign; 