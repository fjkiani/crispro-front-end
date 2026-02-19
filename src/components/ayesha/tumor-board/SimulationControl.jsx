
import React from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Switch, FormControlLabel } from '@mui/material';

export default function SimulationControl({ level, onSelectL1, onSelectL2, onSelectL3, scenarioId, l3ScenarioId }) {
    const isL1 = level === 'l1';
    const isL2 = level === 'l2';
    const isL3 = level === 'l3';
    const isSimMode = !isL1;

    return (
        <Card
            sx={{
                borderRadius: 3,
                bgcolor: '#0f172a', // Slate-950
                border: '1px solid #1e293b',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: 'white',
                mb: 3,
            }}
        >
            <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1 }}>
                            WAR GAMES (SIMULATION)
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                            {isL1 ? 'MODE: CURRENT REALITY' : isL2 ? 'MODE: TACTICAL SIMULATION' : 'MODE: DEEP WAR GAME'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            {isL1 && "Displaying only validated intelligence. No assumptions."}
                            {isL2 && `Simulating Hypothesis: ${scenarioId}`}
                            {isL3 && `Running Deep Simulation: ${scenarioId} → ${l3ScenarioId}`}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, bgcolor: '#1e293b', p: 0.5, borderRadius: 2 }}>
                        <Button
                            size="small"
                            variant={isL1 ? 'contained' : 'text'}
                            onClick={onSelectL1}
                            sx={{
                                color: isL1 ? 'white' : '#94a3b8',
                                bgcolor: isL1 ? '#3b82f6' : 'transparent',
                                '&:hover': { bgcolor: isL1 ? '#2563eb' : 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            REALITY
                        </Button>
                        <Button
                            size="small"
                            variant={isSimMode ? 'contained' : 'text'}
                            disabled // Enabled via scenario list in EvidenceVault for now
                            sx={{
                                color: isSimMode ? 'white' : '#64748b',
                                bgcolor: isSimMode ? '#8b5cf6' : 'transparent',
                            }}
                        >
                            SIMULATION ACTIVE
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
