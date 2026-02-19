import React from 'react';
import { Box, Grid, Typography, Paper, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    HealthAndSafety as SafetyIcon,
    NotificationsActive as AlarmIcon,
    Visibility as SentinelIcon,
    Shield as ShieldIcon
} from '@mui/icons-material';

// Sub-components (Placeholders for now, will implement)
import ProphetGauges from '../resistance/ProphetGauges';
import ResistanceLogicStream from '../resistance/ResistanceLogicStream';
import NextTestDisplay from '../resistance/NextTestDisplay';

const DashboardWrapper = styled(Box)({
    padding: '24px',
    background: '#0a0e14',
    minHeight: '100%',
    color: '#e0e0e0',
});

const PillarCard = styled(Paper)(({ tier }) => ({
    background: '#151b24',
    border: '1px solid #2d3748',
    borderRadius: '12px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: tier === 'core' ? '#4299e1' : tier === 'alarm' ? '#ecc94b' : '#ff6384',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }
}));

const PillarHeader = styled(Box)(({ color }) => ({
    padding: '16px',
    background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, ${color}22 100%)`, // Subtle gradient
    borderBottom: '1px solid #2d3748',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
}));

const SentinelDashboard = ({ simulationResult }) => {
    // 3-Pillar Architecture

    // Pillar 1: Core Protection (Safety Caps)
    // Pillar 2: The Alarm (CA-125 / Live Signals)
    // Pillar 3: The Sentinel (Prognosis / Sig7)

    const prediction = simulationResult?.prediction;

    return (
        <DashboardWrapper>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', color: '#fff' }}>
                    PROGNOSIS SENTINEL <span style={{ color: '#4fd1c5', fontSize: '0.5em', verticalAlign: 'super' }}>BETA</span>
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#718096' }}>
                    THE "HYBRID ENGINE" MONITORING SYSTEM
                </Typography>
            </Box>

            <Grid container spacing={3}>

                {/* PILLAR 1: CORE PROTECTION */}
                <Grid item xs={12} md={4}>
                    <PillarCard tier="core">
                        <PillarHeader color="#4299e1">
                            <ShieldIcon sx={{ color: '#4299e1' }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                                    CORE PROTECTION
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                                    "DO NO HARM" PROTOCOLS
                                </Typography>
                            </Box>
                        </PillarHeader>
                        <Box sx={{ p: 3 }}>
                            {/* Safety Status */}
                            <Box sx={{ p: 2, bgcolor: 'rgba(66, 153, 225, 0.1)', borderRadius: 2, mb: 2 }}>
                                <Typography sx={{ fontSize: '0.8rem', color: '#4299e1', fontWeight: 600 }}>
                                    SAFETY CAPS: {prediction?.confidence_cap ? 'ACTIVE (L1 DATA LIMIT)' : 'STANDBY'}
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#a0aec0', mt: 0.5 }}>
                                    Preventing over-reaction to unconfirmed signals.
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2, borderColor: '#2d3748' }} />
                            <Typography sx={{ fontSize: '0.8rem', color: '#718096', mb: 1 }}>POST-TREATMENT GATE</Typography>
                            <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                                {prediction?.baseline_penalty_applied ? 'PENALTY APPLIED' : 'PATIENT SPECIFIC (MBD4)'}
                            </Typography>
                        </Box>
                    </PillarCard>
                </Grid>

                {/* PILLAR 2: THE ALARM (Current V2) */}
                <Grid item xs={12} md={4}>
                    <PillarCard tier="alarm">
                        <PillarHeader color="#ecc94b">
                            <AlarmIcon sx={{ color: '#ecc94b' }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                                    THE ALARM
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                                    RECURRENCE DETECTION (TIME)
                                </Typography>
                            </Box>
                        </PillarHeader>
                        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Reusing Existing Prophet Gauges for "Alarm" signals (Restoration/Escape) */}
                            <ProphetGauges prediction={prediction} mode="ALARM_ONLY" />

                            <Box sx={{ mt: 'auto', pt: 2 }}>
                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                    Monitors Delta (Change over Time)
                                </Typography>
                            </Box>
                        </Box>
                    </PillarCard>
                </Grid>

                {/* PILLAR 3: THE SENTINEL (Prognosis) */}
                <Grid item xs={12} md={4}>
                    <PillarCard tier="sentinel">
                        <PillarHeader color="#ff6384">
                            <SentinelIcon sx={{ color: '#ff6384' }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                                    THE SENTINEL
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                                    PROGNOSTIC STATE (ABSOLUTE)
                                </Typography>
                            </Box>
                        </PillarHeader>
                        <Box sx={{ p: 3 }}>
                            {/* Prognosis Specific Visualization */}
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Typography sx={{ fontSize: '3rem', fontWeight: 800, color: prediction?.prognosis?.status === 'POOR' ? '#ff6384' : '#4fd1c5' }}>
                                    {prediction?.prognosis?.status || 'Active'}
                                </Typography>
                                <Typography sx={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                                    PROGNOSIS (SIG7 PROJECTED)
                                </Typography>
                            </Box>

                            {/* Action Stream */}
                            <NextTestDisplay tests={simulationResult?.recommended_tests} filterType="PROGNOSIS" />
                        </Box>
                    </PillarCard>
                </Grid>

            </Grid>

            {/* Logic Stream Footer */}
            <Box sx={{ mt: 4 }}>
                <ResistanceLogicStream steps={simulationResult?.logic_steps || []} />
            </Box>

        </DashboardWrapper>
    );
};

export default SentinelDashboard;
