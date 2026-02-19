
import React from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Stack } from '@mui/material';

export default function ScenarioController({ level, onSelectL1, onSelectL2, onSelectL3, scenarioId, l3ScenarioId }) {
    const isL1 = level === 'l1';
    const isL2 = level === 'l2';
    const isL3 = level === 'l3';

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
                            Simulation Control
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                            {isL1 ? 'Level 1: Reality (Baseline)' : isL2 ? 'Level 2: Scenario Preview' : 'Level 3: Deep Simulation'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            {isL1 && "Showing current clinical reality based on available data."}
                            {isL2 && `Simulating scenario: ${scenarioId}`}
                            {isL3 && `Deep simulation: ${scenarioId} → ${l3ScenarioId}`}
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
                            Reality (L1)
                        </Button>
                        <Button
                            size="small"
                            variant={isL2 ? 'contained' : 'text'}
                            disabled // Enabled via scenario list in EvidenceVault for now
                            sx={{
                                color: isL2 ? 'white' : '#64748b',
                                bgcolor: isL2 ? '#8b5cf6' : 'transparent',
                            }}
                        >
                            Scenarios (L2)
                        </Button>
                        <Button
                            size="small"
                            variant={isL3 ? 'contained' : 'text'}
                            disabled // Enabled via scenario list in EvidenceVault for now
                            sx={{
                                color: isL3 ? 'white' : '#64748b',
                                bgcolor: isL3 ? '#ec4899' : 'transparent',
                            }}
                        >
                            Deep Sim (L3)
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
