
import React from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Chip, Alert, Grid } from '@mui/material';

export default function IntelligencePanel({ completeness, missing }) {
    const score = completeness?.completeness_score || 0;
    const pct = Math.round(score * 100);
    const confidenceCap = completeness?.confidence_cap;

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
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1 }}>
                    BATTLE READINESS (DATA QUALITY)
                </Typography>

                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: pct >= 80 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f87171' }}>
                                    {pct}%
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                    Strategy Confidence
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={pct}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: '#1e293b',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444',
                                    }
                                }}
                            />
                            {typeof confidenceCap === 'number' && (
                                <Typography variant="caption" sx={{ color: '#f59e0b', mt: 0.5, display: 'block' }}>
                                    ⚠️ Max confidence limited to {Math.round(confidenceCap * 100)}% until gaps are filled.
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        {missing.length > 0 ? (
                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1, fontWeight: 600 }}>
                                    CRITICAL INTEL GAPS (REQUIRED FOR 100%):
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {missing.slice(0, 8).map((m) => (
                                        <Chip
                                            key={m}
                                            label={m}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(239, 68, 68, 0.1)', // Red-500 alpha
                                                color: '#f87171', // Red-400
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                fontWeight: 500,
                                            }}
                                        />
                                    ))}
                                    {missing.length > 8 && (
                                        <Chip
                                            label={`+${missing.length - 8} more`}
                                            size="small"
                                            sx={{
                                                bgcolor: '#1e293b',
                                                color: '#94a3b8',
                                                border: '1px solid #334155',
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        ) : (
                            <Alert
                                severity="success"
                                variant="outlined"
                                sx={{
                                    bgcolor: 'rgba(34, 197, 94, 0.05)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                    color: '#4ade80',
                                    '& .MuiAlert-icon': { color: '#4ade80' }
                                }}
                            >
                                INTELLIGENCE COMPLETE. ALL SYSTEMS GREEN.
                            </Alert>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
