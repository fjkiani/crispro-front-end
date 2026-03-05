/**
 * ProvenanceFooter — Validation provenance footer for test detail pages.
 * Shows PMID links, dataset, computation date, AUC metrics with qualification.
 *
 * Props:
 *   entry — A clinicalTestRegistry entry object (reads entry.validation)
 */
import React from 'react';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import { VerifiedOutlined, MenuBook, Warning } from '@mui/icons-material';

function MetricPill({ label, value, muted = false }) {
    return (
        <Box sx={{
            px: 1.5, py: 0.6,
            borderRadius: 1.5,
            bgcolor: muted ? '#f8fafc' : '#f0fdf4',
            border: '1px solid',
            borderColor: muted ? '#e2e8f0' : '#bbf7d0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
        }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                {label}
            </Typography>
            <Typography variant="caption" sx={{
                color: muted ? '#94a3b8' : '#166534',
                fontSize: '0.75rem',
                fontWeight: 800,
            }}>
                {value}
            </Typography>
        </Box>
    );
}

export default function ProvenanceFooter({ entry }) {
    if (!entry?.validation) return null;

    const v = entry.validation;
    const metrics = v.metrics || {};
    const hasAUC = metrics.apparent_auc || metrics.nested_cv_auc || metrics.bootstrap_auc;

    return (
        <Paper sx={{
            p: 2.5, borderRadius: 2.5,
            bgcolor: '#fafafa',
            border: '1px solid',
            borderColor: 'divider',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <VerifiedOutlined sx={{ color: '#64748b', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.88rem' }}>
                    Validation Provenance
                </Typography>
            </Box>

            {/* Cohort & PMID */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {v.cohort && (
                    <Chip label={`Cohort: ${v.cohort}`} size="small" variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                )}
                {v.n && (
                    <Chip label={`n=${v.n}`} size="small" variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                )}
                {v.pmid && (
                    <Chip
                        label={`PMID: ${v.pmid}`}
                        size="small"
                        icon={<MenuBook sx={{ fontSize: 14 }} />}
                        component="a"
                        href={`https://pubmed.ncbi.nlm.nih.gov/${v.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#2563eb' }}
                    />
                )}
                {v.computation_date && (
                    <Chip label={`Computed: ${v.computation_date}`} size="small" variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#94a3b8' }} />
                )}
            </Box>

            {/* AUC metrics with qualification */}
            {hasAUC && (
                <>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {metrics.apparent_auc && (
                            <MetricPill label="Apparent AUC" value={metrics.apparent_auc.toFixed(3)} muted />
                        )}
                        {metrics.bootstrap_auc && (
                            <MetricPill label="Bootstrap AUC" value={metrics.bootstrap_auc.toFixed(3)} />
                        )}
                        {metrics.nested_cv_auc && (
                            <MetricPill label="Nested CV AUC" value={`${metrics.nested_cv_auc.toFixed(3)}${metrics.nested_cv_std ? ` ± ${metrics.nested_cv_std.toFixed(3)}` : ''}`} />
                        )}
                        {metrics.permutation_p != null && (
                            <MetricPill
                                label="Permutation p"
                                value={metrics.permutation_p.toFixed(3)}
                                muted={metrics.permutation_p > 0.05}
                            />
                        )}
                    </Box>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#94a3b8', fontSize: '0.7rem', lineHeight: 1.4 }}>
                        Apparent AUC is overfit. Bootstrap-corrected is the honest metric. Nested CV is conservative.
                    </Typography>
                </>
            )}

            {/* Note-only metrics */}
            {!hasAUC && metrics.note && (
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    {metrics.note}
                </Typography>
            )}

            {/* Limitations */}
            {entry.limitations?.length > 0 && (
                <>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
                        <Warning sx={{ fontSize: 14, color: '#f59e0b', mt: 0.15 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.78rem' }}>
                            Known Limitations
                        </Typography>
                    </Box>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {entry.limitations.map((lim, i) => (
                            <Box component="li" key={i}>
                                <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5 }}>
                                    {lim}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </Paper>
    );
}
