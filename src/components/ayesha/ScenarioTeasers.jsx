import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useAyeshaScenarios } from '../../hooks/useAyeshaTherapyFitBundle';

// Component responsible for fetching scenarios itself to decouple from main bundle
export function ScenarioTeasers() {
    const { data, isLoading, error } = useAyeshaScenarios();

    if (isLoading) return null; // Or skeleton
    if (error || !data) return null;

    return (
        <Box mt={6} pt={4} borderTop="1px solid #eee">
            <Typography variant="h5" gutterBottom color="text.secondary">
                Future Scenarios
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Unlock deeper insights as more data becomes available (NGS, Transcriptomics).
            </Typography>

            {/* L2 Scenarios */}
            {data.l2_scenarios && data.l2_scenarios.length > 0 && (
                <Box mb={4}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Level 2: With NGS Data
                    </Typography>
                    <Grid container spacing={2}>
                        {data.l2_scenarios.map(scenario => (
                            <Grid item xs={12} md={6} key={scenario.id}>
                                <ScenarioCard scenario={scenario} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* L3 Scenarios */}
            {data.l3_scenarios && data.l3_scenarios.length > 0 && (
                <Box mb={4}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Level 3: With RNA Expression
                    </Typography>
                    <Grid container spacing={2}>
                        {data.l3_scenarios.map(scenario => (
                            <Grid item xs={12} md={6} key={scenario.id}>
                                <ScenarioCard scenario={scenario} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

function ScenarioCard({ scenario }) {
    // Consume fields returned by GET /scenarios from precomputed cache
    // preview, mechanism_panel, expected_mechanism, preview_status
    const previewStatus = scenario.preview_status;  // 'ready' | 'computing' | null
    const preview = scenario.preview;          // full summary string when ready
    const expectedMech = scenario.expected_mechanism; // {top_mechanism, ddr_score, top_drug, ...}
    const isComputing = previewStatus === 'computing';
    const hasPreview = !isComputing && preview != null;

    return (
        <Card sx={{ position: 'relative', bgcolor: '#0f172a', border: '1px solid #1e293b', height: '100%', borderRadius: 2 }}>
            {/* Lock badge */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Chip
                    label={scenario.requires?.includes('NGS') || scenario.requires?.includes('HRD') ? 'Requires: HRD/TMB' : 'Requires: RNA + CA-125'}
                    size="small"
                    sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
                />
                <LockIcon color="disabled" style={{ width: 14, height: 14 }} />
            </Box>

            <CardContent sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ pr: 10, fontSize: '0.9rem', color: 'white', fontWeight: 700 }}>
                    {scenario.name}
                </Typography>

                {/* Preview panel — real API data only */}
                <Box mt={1.5} p={1.5} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1.5, border: '1px solid #1e293b', minHeight: 60 }}>
                    {isComputing && (
                        <>
                            <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block', mb: 0.5 }}>
                                Computing preview…
                            </Typography>
                            <Box sx={{ width: '100%', height: 3, borderRadius: 1, overflow: 'hidden', bgcolor: '#1e293b' }}>
                                <Box sx={{ height: 3, bgcolor: '#6366f1', animation: 'pulse 1.5s ease-in-out infinite', width: '60%' }} />
                            </Box>
                        </>
                    )}

                    {hasPreview && expectedMech && (
                        <Box>
                            <Typography variant="caption" sx={{ color: '#475569', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.58rem', display: 'block', mb: 1 }}>
                                PREVIEW — requires NGS data
                            </Typography>
                            {expectedMech.top_mechanism && (
                                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 0.5 }}>
                                    Top mechanism: <strong style={{ color: '#c7d2fe' }}>{expectedMech.top_mechanism}</strong>
                                </Typography>
                            )}
                            {expectedMech.ddr_score != null && (
                                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 0.5 }}>
                                    DDR score: <strong style={{ color: '#818cf8' }}>↑ to {(expectedMech.ddr_score * 100).toFixed(0)}</strong>
                                </Typography>
                            )}
                            {expectedMech.top_drug && (
                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                    Projected top drug: <strong style={{ color: '#4ade80' }}>{expectedMech.top_drug}</strong>
                                </Typography>
                            )}
                        </Box>
                    )}

                    {!isComputing && !hasPreview && (
                        <Typography variant="caption" sx={{ color: '#334155', fontStyle: 'italic' }}>
                            Preview unavailable (requires data)
                        </Typography>
                    )}
                </Box>

                {/* Requirements */}
                <Box mt={2}>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', gutterBottom: true, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.58rem' }}>
                        REQUIRES:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.75} mt={0.5}>
                        {(scenario.requires || []).map(req => (
                            <Chip
                                key={req}
                                label={req}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.65rem', color: '#64748b', borderColor: '#1e293b' }}
                            />
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
