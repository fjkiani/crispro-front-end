import React from 'react';
import { Box, Typography, Button, Grid, Chip } from '@mui/material';
import { Timeline, Psychology, Science } from '@mui/icons-material';

const ScenarioSelector = ({
    scenarios,
    activeLevel,
    activeScenarioId,
    onSelect
}) => {

    // Sort logic or default handling could go here
    const l2Scenarios = scenarios.l2_scenarios || [];
    const l3Scenarios = scenarios.l3_scenarios || [];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ pb: 1, borderBottom: '1px solid #2d3748' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                    1. SELECT CONTEXT
                </Typography>
            </Box>

            {/* L1: The Reality */}
            <Button
                fullWidth
                variant={activeLevel === 'L1' ? "contained" : "outlined"}
                color={activeLevel === 'L1' ? "primary" : "inherit"}
                onClick={() => onSelect('L1', null)}
                startIcon={<Timeline />}
                sx={{
                    justifyContent: 'flex-start',
                    borderColor: '#2d3748',
                    bgcolor: activeLevel === 'L1' ? '#3182ce' : 'transparent',
                    '&:hover': { bgcolor: '#2c5282' }
                }}
            >
                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={700}>L1: Baseline (Today)</Typography>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                        Current Clinical Reality
                    </Typography>
                </Box>
            </Button>

            {/* L2: The Simulations */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    L2: MOLECULAR SIMULATIONS
                </Typography>
                <Grid container spacing={1}>
                    {l2Scenarios.map((s) => (
                        <Grid item xs={12} key={s.id}>
                            <Button
                                fullWidth
                                size="small"
                                variant={activeScenarioId === s.id ? "contained" : "outlined"}
                                onClick={() => onSelect('L2', s.id)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    borderColor: '#2d3748',
                                    bgcolor: activeScenarioId === s.id ? '#4fd1c5' : 'transparent',
                                    color: activeScenarioId === s.id ? '#000' : '#a0aec0',
                                    '&:hover': { bgcolor: '#38b2ac', color: '#000' }
                                }}
                            >
                                <Psychology sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="caption" fontWeight={700} noWrap display="block">
                                        {s.meta?.description || s.name}
                                    </Typography>
                                </Box>
                                {activeScenarioId === s.id && <Chip label="ACTIVE" size="small" sx={{ height: 16, fontSize: '0.5rem', bgcolor: '#000', color: '#fff' }} />}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* L3: The Future */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    L3: MECHANISTIC FUTURES
                </Typography>
                <Grid container spacing={1}>
                    {l3Scenarios.map((s) => (
                        <Grid item xs={12} key={s.id}>
                            <Button
                                fullWidth
                                size="small"
                                variant={activeScenarioId === s.id ? "contained" : "outlined"}
                                onClick={() => onSelect('L3', s.id)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    borderColor: '#2d3748',
                                    bgcolor: activeScenarioId === s.id ? '#d53f8c' : 'transparent', // Pink/Purple for L3
                                    color: activeScenarioId === s.id ? '#fff' : '#a0aec0',
                                    '&:hover': { bgcolor: '#b83280' }
                                }}
                            >
                                <Science sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="caption" fontWeight={700} noWrap display="block">
                                        {s.meta?.description || s.name}
                                    </Typography>
                                </Box>
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default ScenarioSelector;
