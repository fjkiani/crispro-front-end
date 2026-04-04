/**
 * ScenarioLibrarySection — L2/L3 scenario preview cards.
 * Extracted from AyeshaTherapyFit (lines 224-372).
 * Shows what-if scenario previews with simulated drug rankings.
 *
 * Used by: AyeshaTherapyFit
 */
import React from 'react';
import { Box, Typography, Alert, Card, CardContent, Grid, Chip } from '@mui/material';
import '../therapy-fit/therapy-fit.css';

function L2ScenarioCard({ scn }) {
    const topK = scn?.preview?.top_k || [];

    return (
        <Card className="tf-scenario-card">
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography variant="subtitle1" className="tf-scenario-card__title">
                            {scn.name || scn.id}
                        </Typography>
                        <Typography variant="caption" className="tf-scenario-card__subtitle">
                            Scenario ID: {scn.id}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip size="small" label="Preview" variant="outlined" />
                        {scn.preview_status && (
                            <Chip
                                size="small"
                                label={String(scn.preview_status)}
                                color={scn.preview_status === 'ok' ? 'success' : scn.preview_status === 'computing' ? 'info' : 'warning'}
                            />
                        )}
                    </Box>
                </Box>

                {Array.isArray(scn.requires) && scn.requires.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {scn.requires.slice(0, 6).map(req => (
                            <Chip key={req} size="small" label={req} sx={{ bgcolor: '#f1f5f9' }} />
                        ))}
                    </Box>
                )}

                {scn.preview ? (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155' }}>
                            Top candidates (preview)
                        </Typography>
                        {Array.isArray(topK) && topK.length > 0 ? (
                            <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
                                {topK.slice(0, 3).map(d => (
                                    <li key={d.name}>
                                        <Typography variant="body2" sx={{ color: '#334155' }}>
                                            <strong>{d.name}</strong> · efficacy {Math.round((d.efficacy_score || 0) * 100)}% · confidence {Math.round((d.confidence || 0) * 100)}%
                                        </Typography>
                                    </li>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Preview is available but top_k is empty.
                            </Typography>
                        )}
                        {scn.preview?.rationale && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                                {String(scn.preview.rationale)}
                            </Typography>
                        )}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Preview not available yet.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

function L3ScenarioCard({ scn }) {
    const byL2 = scn?.preview_matrix?.by_l2 || {};
    const entries = Object.values(byL2 || {});
    const withPreview = entries.filter(e => e && e.preview).length;

    return (
        <Card className="tf-scenario-card">
            <CardContent>
                <Typography variant="subtitle1" className="tf-scenario-card__title">
                    {scn.name || scn.id}
                </Typography>
                <Typography variant="caption" className="tf-scenario-card__subtitle">
                    Scenario ID: {scn.id}
                </Typography>

                {Array.isArray(scn.requires) && scn.requires.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                        {scn.requires.slice(0, 6).map(req => (
                            <Chip key={req} size="small" label={req} sx={{ bgcolor: '#f1f5f9' }} />
                        ))}
                    </Box>
                )}

                <Typography variant="body2" color="text.secondary">
                    Preview matrix coverage: <strong>{withPreview}</strong> / {entries.length || Object.keys(byL2 || {}).length} L2 combinations have previews.
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function ScenarioLibrarySection({ l2Scenarios = [], l3Scenarios = [], previewCache }) {
    return (
        <Box className="tf-section tf-section--narrow" sx={{ mt: 6, mb: 8 }}>
            <Box className="tf-section--centered" sx={{ mb: 3 }}>
                <Typography variant="overline" className="tf-section-overline">
                    SCENARIO PREVIEWS (WHAT‑IF)
                </Typography>
                <Typography variant="h4" gutterBottom className="tf-section-title">
                    All available scenarios (L2 & L3)
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    These are simulated previews showing how rankings could change if missing data layers are added.
                    Research Use Only (RUO).
                </Typography>
            </Box>

            {previewCache?.status && (
                <Alert
                    severity={previewCache.status === 'ok' ? 'success' : previewCache.status === 'computing' ? 'info' : 'warning'}
                    sx={{ mb: 3 }}
                >
                    Preview cache status: <strong>{String(previewCache.status)}</strong>
                    {previewCache.generated_at ? ` · generated_at: ${String(previewCache.generated_at)}` : ''}
                    {previewCache?.progress?.l2?.total ? (
                        <span>
                            {' '}· L2 previews {previewCache.progress.l2.done}/{previewCache.progress.l2.total}
                            {previewCache?.progress?.l2xl3?.total ? ` · Matrix ${previewCache.progress.l2xl3.done}/${previewCache.progress.l2xl3.total}` : ''}
                        </span>
                    ) : null}
                </Alert>
            )}

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 2 }}>
                L2 scenarios (Tumor sequencing / HRD / TMB)
            </Typography>
            {Array.isArray(l2Scenarios) && l2Scenarios.length > 0 ? (
                <Grid container spacing={2}>
                    {l2Scenarios.map(scn => (
                        <Grid item xs={12} md={6} key={scn.id}>
                            <L2ScenarioCard scn={scn} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Alert severity="info">No L2 scenarios returned.</Alert>
            )}

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 2, mt: 4 }}>
                L3 scenarios (Activity signals / RNA / CA‑125)
            </Typography>
            {Array.isArray(l3Scenarios) && l3Scenarios.length > 0 ? (
                <Grid container spacing={2}>
                    {l3Scenarios.map(scn => (
                        <Grid item xs={12} md={6} key={scn.id}>
                            <L3ScenarioCard scn={scn} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Alert severity="info">No L3 scenarios returned.</Alert>
            )}
        </Box>
    );
}
