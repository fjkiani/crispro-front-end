/**
 * InsightsCard — Functional impact gauges.
 *
 * Two modes:
 * 1. Rich: insights has non-zero values → show 4 gauge tiles
 * 2. Fallback: insights all zero but syntheticLethality has essentiality_scores
 *    → render per-gene essentiality from the SL backend (Evo2 computed)
 */
import React from 'react';
import {
    Box, Typography, Paper, Grid, LinearProgress, Chip, Tooltip,
} from '@mui/material';
import { BiotechOutlined } from '@mui/icons-material';
import { getInsightInfo, pct } from './explainers';

// ── Standard gauge (functionality / chromatin / essentiality / regulatory) ──

function InsightGauge({ insightKey, value }) {
    const info = getInsightInfo(insightKey);
    const hasValue = value != null && value > 0;
    const pctVal = Math.round((value || 0) * 100);
    const color = pctVal >= 60 ? '#22c55e' : pctVal >= 30 ? '#f59e0b' : '#94a3b8';

    return (
        <Paper sx={{
            p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
            transition: 'all 0.2s', opacity: hasValue ? 1 : 0.5,
            '&:hover': hasValue ? { boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' } : {},
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '1rem' }}>{info.icon}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
                    {info.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color, fontFamily: 'monospace' }}>
                    {hasValue ? pct(value) : '—'}
                </Typography>
            </Box>

            <LinearProgress
                variant="determinate"
                value={pctVal}
                sx={{
                    height: 6, borderRadius: 3, bgcolor: '#f1f5f9', mb: 1,
                    '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3, transition: 'width 0.8s ease-out' },
                }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                {hasValue
                    ? info.desc
                    : `${info.desc} Not measured at the current data level.`
                }
            </Typography>
        </Paper>
    );
}

// ── Per-gene essentiality from SL backend (fallback when standard scores = 0) ──

const ESSENTIALITY_COLORS = {
    high: { bg: '#fef2f2', border: '#fca5a5', fg: '#991b1b', bar: '#ef4444' },
    moderate: { bg: '#fffbeb', border: '#fcd34d', fg: '#92400e', bar: '#f59e0b' },
    low: { bg: '#f8fafc', border: '#e2e8f0', fg: '#475569', bar: '#94a3b8' },
};

function GeneEssentialityCard({ entry }) {
    const level = (entry.essentiality_level || 'low').toLowerCase();
    const colors = ESSENTIALITY_COLORS[level] || ESSENTIALITY_COLORS.low;
    const pctVal = Math.round((entry.essentiality_score || 0) * 100);

    return (
        <Paper sx={{
            p: 2.5, borderRadius: 2.5,
            bgcolor: colors.bg,
            border: '1.5px solid', borderColor: colors.border,
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
        }}>
            {/* Gene name + level pill */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1rem', flex: 1, color: colors.fg }}>
                    {entry.gene}
                </Typography>
                <Chip
                    label={level.toUpperCase()}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem', height: 22, bgcolor: colors.border, color: colors.fg }}
                />
                <Typography variant="body2" sx={{ fontWeight: 800, color: colors.bar, fontFamily: 'monospace' }}>
                    {pctVal}%
                </Typography>
            </Box>

            {/* Score bar */}
            <Tooltip title={`Evo2 essentiality score: ${entry.essentiality_score?.toFixed(3)} — how critical this gene is to tumor survival`}>
                <LinearProgress
                    variant="determinate"
                    value={pctVal}
                    sx={{
                        height: 8, borderRadius: 4, bgcolor: '#f1f5f9', mb: 1.5,
                        '& .MuiLinearProgress-bar': { bgcolor: colors.bar, borderRadius: 4 },
                    }}
                />
            </Tooltip>

            {/* Pathway impact */}
            {entry.pathway_impact && (
                <Typography variant="caption" sx={{ display: 'block', color: colors.fg, fontWeight: 600, mb: 0.5 }}>
                    🔗 {entry.pathway_impact.replace(/\[|\]|'/g, '')}
                </Typography>
            )}

            {/* Functional consequence */}
            {entry.functional_consequence && (
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                    {entry.functional_consequence}
                </Typography>
            )}

            {/* Evo2 confirmation badge */}
            {entry.flags?.evo2_called && (
                <Box sx={{ mt: 1.5 }}>
                    <Chip
                        icon={<BiotechOutlined sx={{ fontSize: 12 }} />}
                        label="Validated by Evo2 AI"
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.62rem', height: 20, bgcolor: '#ede9fe', color: '#5b21b6' }}
                    />
                </Box>
            )}
        </Paper>
    );
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function InsightsCard({ insights, syntheticLethality }) {
    const entries = (insights && typeof insights === 'object') ? Object.entries(insights) : [];
    const hasAnyValue = entries.some(([, v]) => v > 0);

    // SL scores — always show when available
    const slScores = syntheticLethality?.essentiality_scores || [];
    const hasSL = slScores.length > 0;
    const geneNames = slScores.map(g => g.gene).join(', ');

    // Nothing to show at all
    if (!hasAnyValue && !hasSL) {
        return (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
                        🔬 Functional Insights
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    Functional insight scores are not available at the current data level.
                    Adding functional assays or deeper sequence data will unlock these dimensions.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
                    🔬 Functional Insights
                </Typography>
            </Box>

            {/* Standard insights gauges */}
            {hasAnyValue && (
                <>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5, fontSize: '1rem', lineHeight: 1.7 }}>
                        These scores measure how your mutations impact cellular functions that affect drug response.
                    </Typography>
                    <Grid container spacing={2}>
                        {entries.map(([key, value]) => (
                            <Grid item xs={12} sm={6} key={key}>
                                <InsightGauge insightKey={key} value={value} />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {/* Synthetic Lethality — ALWAYS shown when available */}
            {hasSL && (
                <Box sx={{ mt: hasAnyValue ? 3 : 0 }}>
                    {!hasAnyValue && (
                        <Box sx={{
                            mb: 2.5, p: 2, borderRadius: 2,
                            bgcolor: '#fffbeb', border: '1px solid #fcd34d',
                        }}>
                            <Typography variant="body2" sx={{ color: '#92400e', lineHeight: 1.7 }}>
                                Standard functional profiling requires RNA expression or functional assay data,
                                which is not yet available. However, our <strong>Evo2 AI engine</strong> computed
                                gene-level essentiality for <strong>{geneNames}</strong> directly from your tumor's DNA sequence.
                            </Typography>
                        </Box>
                    )}

                    <Typography variant="subtitle2" sx={{
                        fontWeight: 700, mb: 1.5, color: 'text.secondary',
                        textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem',
                    }}>
                        {hasAnyValue ? '🧬 Synthetic Lethality — Evo2 Gene Essentiality' : 'Evo2 Gene Essentiality Scores'}
                    </Typography>

                    {hasAnyValue && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                            These genes were computationally assessed for how critical they are to tumor survival.
                            Higher scores = more essential = potentially exploitable with targeted drugs.
                        </Typography>
                    )}

                    <Grid container spacing={2}>
                        {slScores.map(entry => (
                            <Grid item xs={12} sm={6} md={4} key={entry.gene}>
                                <GeneEssentialityCard entry={entry} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Paper>
    );
}
