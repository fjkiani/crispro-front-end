
import React, { Suspense } from 'react';
import { Box, Typography, Card, CardContent, Divider, Grid, Chip, Button, Alert } from '@mui/material';

const TruthTable = React.lazy(() => import('../context_center/TruthTable'));

function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

export default function EvidenceVault({
    levelData,
    activeKey,
    level,
    drugsCount,
    l2Scenarios,
    l3Scenarios,
    onRunL2,
    onRunL3,
    isPreview,
    rawBundle
}) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Summary Stats */}
            <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 2 }}>
                        Analysis Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Active Level</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>{activeKey}</Typography>
                                <Chip size="small" label={isPreview ? 'Preview' : 'Production'} sx={{ mt: 0.5, bgcolor: isPreview ? '#f59e0b' : '#3b82f6', color: 'white' }} />
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Drugs Ranked</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>{drugsCount}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Synthetic Lethality</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: levelData?.synthetic_lethality?.synthetic_lethality_detected ? '#4ade80' : '#94a3b8' }}>
                                    {levelData?.synthetic_lethality?.synthetic_lethality_detected ? 'DETECTED' : 'Not detected'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Missing Data</Typography>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: safeArray(levelData?.completeness?.missing).length > 0 ? '#f87171' : '#4ade80'
                                }}>
                                    {safeArray(levelData?.completeness?.missing).length}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Inputs Used */}
            <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1 }}>
                        Inputs Used
                    </Typography>
                    <Suspense fallback={<Box sx={{ height: 100 }} />}>
                        <TruthTable levelData={levelData} level={activeKey} />
                    </Suspense>
                </CardContent>
            </Card>

            {/* Scenarios */}
            <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 2 }}>
                        What-If Scenarios
                    </Typography>

                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>Level 2 Scenarios</Typography>
                    {l2Scenarios.length === 0 ? (
                        <Alert severity="info" sx={{ bgcolor: '#1e293b', color: '#94a3b8', mb: 3 }}>No L2 scenarios available.</Alert>
                    ) : (
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {l2Scenarios.slice(0, 12).map((scn) => (
                                <Grid item xs={12} md={4} key={scn.id}>
                                    <Card variant="outlined" sx={{ bgcolor: '#1e293b', border: '1px solid #334155', height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>{scn.name || scn.id}</Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>ID: {scn.id}</Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                                                {safeArray(scn.requires).slice(0, 3).map((r) => (
                                                    <Chip key={r} size="small" label={r} sx={{ bgcolor: '#334155', color: '#cbd5e1' }} />
                                                ))}
                                            </Box>
                                            <Button
                                                fullWidth size="small" variant="contained"
                                                onClick={() => onRunL2(scn.id)}
                                                sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, textTransform: 'none' }}
                                            >
                                                Launch Preview
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>Level 3 Deep Simulation</Typography>
                    {l3Scenarios.length === 0 ? (
                        <Alert severity="info" sx={{ bgcolor: '#1e293b', color: '#94a3b8' }}>No L3 scenarios available.</Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {l3Scenarios.slice(0, 8).map((scn) => (
                                <Grid item xs={12} md={4} key={scn.id}>
                                    <Card variant="outlined" sx={{ bgcolor: '#1e293b', border: '1px solid #334155', height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>{scn.name || scn.id}</Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>ID: {scn.id}</Typography>
                                            <Button
                                                fullWidth size="small" variant="contained"
                                                disabled={!level || level === 'l1'}
                                                onClick={() => onRunL3(level === 'l2' ? (scn.base_l2_id || 'base') : 'base', scn.id)}
                                                sx={{ bgcolor: '#ec4899', '&:hover': { bgcolor: '#db2777' }, textTransform: 'none' }}
                                            >
                                                Run Deep Sim
                                            </Button>
                                            {(!level || level === 'l1') && (
                                                <Typography variant="caption" sx={{ color: '#f59e0b', mt: 1, display: 'block', textAlign: 'center' }}>
                                                    Select an L2 scenario first
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </CardContent>
            </Card>

            {/* Provenance */}
            {rawBundle && (
                <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1 }}>
                            Run Provenance
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            Contract: {rawBundle.contract_version || rawBundle.contractVersion || '—'} &bull;
                            Generated: {rawBundle.generated_at || rawBundle.generatedAt || '—'} &bull;
                            Run ID: {levelData?.efficacy?.provenance?.run_id || '—'}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
