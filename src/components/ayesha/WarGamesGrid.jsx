import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Button } from '@mui/material';
import { Gamepad2, PlayCircle, Eye, Power, CheckCircle } from 'lucide-react';

/**
 * ZETA COMPONENT: War Games Grid
 * Replaces Scenarios Grid.
 * 
 * Philosophy: "Simulate the Future"
 * - L2/L3 Scenarios = "War Games"
 * - Click to SIMULATE (run backend builder with scenario_id)
 */
const WarGamesGrid = ({ l2_scenarios, onSimulate, activeScenarioId }) => {
    // Zeta Theme
    const theme = {
        bg: '#0f172a',
        border: '#334155',
        text: '#94a3b8',
        accent: '#818cf8', // Indigo
        activeBorder: '#22c55e', // Green for active
        activeBg: 'rgba(34, 197, 94, 0.1)'
    };

    if (!l2_scenarios || l2_scenarios.length === 0) return null;

    return (
        <Box sx={{ mt: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Gamepad2 color={theme.accent} size={28} />
                    <Box>
                        <Typography variant="overline" sx={{ color: theme.text, fontWeight: 800, letterSpacing: 2, lineHeight: 1 }}>
                            WAR GAMES SIMULATION
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>
                            FUTURE SCENARIOS
                        </Typography>
                    </Box>
                </Box>

                {activeScenarioId && (
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => onSimulate(null)}
                        startIcon={<Power size={18} />}
                        sx={{ borderRadius: 0, fontWeight: 700 }}
                    >
                        RESET SIMULATION
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {l2_scenarios.map((scn) => {
                    const topK = scn?.preview?.top_k || [];
                    const isActive = activeScenarioId === scn.id;

                    return (
                        <Grid item xs={12} md={6} key={scn.id}>
                            <Card
                                onClick={() => onSimulate(isActive ? null : scn.id)}
                                sx={{
                                    bgcolor: isActive ? theme.activeBg : 'rgba(15, 23, 42, 0.6)',
                                    border: `1px solid ${isActive ? theme.activeBorder : theme.border}`,
                                    borderRadius: 0,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    '&:hover': {
                                        border: `1px solid ${isActive ? theme.activeBorder : theme.accent}`,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {isActive && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0, right: 0,
                                        bg: theme.activeBorder,
                                        p: 0.5,
                                        bgcolor: theme.activeBorder
                                    }}>
                                        <CheckCircle size={16} color="#052e16" />
                                    </Box>
                                )}

                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" sx={{ color: isActive ? '#4ade80' : '#fff', fontWeight: 700 }}>
                                            {scn.name || scn.id}
                                        </Typography>
                                        <PlayCircle size={20} color={isActive ? '#4ade80' : theme.accent} />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        {scn.requires && scn.requires.map(req => (
                                            <Chip
                                                key={req}
                                                label={`REQUIRES: ${req}`}
                                                size="small"
                                                sx={{
                                                    borderRadius: 0,
                                                    bgcolor: 'rgba(148, 163, 184, 0.1)',
                                                    color: '#94a3b8',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    mr: 1
                                                }}
                                            />
                                        ))}
                                    </Box>

                                    <Typography variant="overline" sx={{ color: theme.accent, fontWeight: 800 }}>
                                        PREDICTED OUTCOME:
                                    </Typography>

                                    {topK.length > 0 ? (
                                        topK.slice(0, 2).map((d, i) => (
                                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, borderBottom: '1px dashed #334155', pb: 0.5 }}>
                                                <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                                                    {d.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: theme.accent, fontWeight: 700 }}>
                                                    {Math.round((d.confidence || 0) * 100)}%
                                                </Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ color: theme.text, fontStyle: 'italic' }}>
                                            No distinct outcome predicted.
                                        </Typography>
                                    )}

                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default WarGamesGrid;
