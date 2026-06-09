
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

            {/* Gold Standard Calibration — only renders when backend ships
                synthetic_lethality.provenance.evidence_matrix.gold_standard_summary.
                For AK, this is the 2185-char MBD4 + Cytidine Analogs calibration block.
                Empty state when absent. */}
            {(() => {
                const goldStd = levelData?.synthetic_lethality?.provenance?.evidence_matrix?.gold_standard_summary;
                if (typeof goldStd !== 'string' || goldStd.trim().length === 0) return null;
                return (
                    <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1 }}>
                                Gold Standard Calibration
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    color: '#cbd5e1',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                    fontSize: '0.78rem',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    m: 0,
                                    p: 1.5,
                                    bgcolor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: 2,
                                    maxHeight: 320,
                                    overflow: 'auto',
                                }}
                            >
                                {goldStd}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1, fontStyle: 'italic' }}>
                                Source: synthetic_lethality.provenance.evidence_matrix.gold_standard_summary
                            </Typography>
                        </CardContent>
                    </Card>
                );
            })()}

            {/* Per-drug Evidence Manifests — summarises efficacy.drugs[*].evidence_manifest
                presence. Surfaces honest counts rather than burying the data. */}
            {(() => {
                const drugs = safeArray(levelData?.efficacy?.drugs);
                if (drugs.length === 0) return null;
                const withManifest = drugs.filter((d) => d && d.evidence_manifest && typeof d.evidence_manifest === 'object' && Object.keys(d.evidence_manifest).length > 0);
                const totalCitations = withManifest.reduce((acc, d) => {
                    const cits = Array.isArray(d.evidence_manifest?.citations) ? d.evidence_manifest.citations.length : 0;
                    return acc + cits;
                }, 0);
                return (
                    <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1 }}>
                                Evidence Manifests
                            </Typography>
                            {withManifest.length === 0 ? (
                                <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                                    No per-drug evidence_manifest payloads on this run.
                                </Typography>
                            ) : (
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                    {withManifest.length} of {drugs.length} drugs ship an evidence_manifest. Total citations across manifests: {totalCitations}.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                );
            })()}

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
                            {l2Scenarios.slice(0, 12).map((scn) => {
                                const expectedMech = scn.expected_mechanism;
                                const previewStatus = scn.preview_status;
                                const isComputing = previewStatus === 'computing';
                                const hasPreview = !isComputing && scn.preview != null && expectedMech;
                                return (
                                    <Grid item xs={12} md={4} key={scn.id}>
                                        <Card variant="outlined" sx={{ bgcolor: '#1e293b', border: '1px solid #334155', height: '100%' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>{scn.name || scn.id}</Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>ID: {scn.id}</Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                                                    {safeArray(scn.requires).slice(0, 3).map((r) => (
                                                        <Chip key={r} size="small" label={r} sx={{ bgcolor: '#334155', color: '#cbd5e1' }} />
                                                    ))}
                                                </Box>

                                                {/* Projected preview — real API data only */}
                                                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid #334155', mb: 1.5, minHeight: 48 }}>
                                                    {isComputing && (
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                                                            Computing preview…
                                                        </Typography>
                                                    )}
                                                    {hasPreview && (
                                                        <>
                                                            <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.58rem' }}>
                                                                PREVIEW
                                                            </Typography>
                                                            {expectedMech.top_mechanism && (
                                                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                                                    Top: <strong style={{ color: '#c7d2fe' }}>{expectedMech.top_mechanism}</strong>
                                                                </Typography>
                                                            )}
                                                            {expectedMech.ddr_score != null && (
                                                                <Typography variant="caption" sx={{ color: '#818cf8', display: 'block' }}>
                                                                    DDR ↑ {(expectedMech.ddr_score * 100).toFixed(0)}
                                                                </Typography>
                                                            )}
                                                            {expectedMech.top_drug && (
                                                                <Typography variant="caption" sx={{ color: '#4ade80', display: 'block' }}>
                                                                    {expectedMech.top_drug}
                                                                </Typography>
                                                            )}
                                                        </>
                                                    )}
                                                    {!isComputing && !hasPreview && (
                                                        <Typography variant="caption" sx={{ color: '#334155', fontStyle: 'italic' }}>
                                                            Preview unavailable
                                                        </Typography>
                                                    )}
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
                                );
                            })}
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
            {rawBundle && (() => {
                const contract = rawBundle.contract_version || rawBundle.contractVersion;
                const generated = rawBundle.generated_at || rawBundle.generatedAt;
                const runId = levelData?.efficacy?.provenance?.run_id;
                const hasAny = contract || generated || runId;
                return (
                    <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1 }}>
                                Run Provenance
                            </Typography>
                            {hasAny ? (
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                    Contract: {contract || '—'} &bull;
                                    Generated: {generated || '—'} &bull;
                                    Run ID: {runId || '—'}
                                </Typography>
                            ) : (
                                <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block' }}>
                                    Provenance data not available for this run.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                );
            })()}
        </Box>
    );
}
