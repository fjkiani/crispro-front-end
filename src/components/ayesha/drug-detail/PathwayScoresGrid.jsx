/**
 * PathwayScoresGrid — Patient-context pathway scores with tooltips.
 *
 * Each cell is color-coded by score intensity and has a tooltip
 * explaining what the pathway measures.
 */
import React from 'react';
import {
    Box, Typography, Paper, Grid, Tooltip,
} from '@mui/material';
import { getPathwayInfo, pct } from './explainers';

// ── Color scale ──────────────────────────────────────────────────────────────

function scoreColor(v) {
    if (v == null || v === 0) return { bg: '#f8fafc', fg: '#94a3b8', ring: '#e2e8f0' };
    if (v >= 0.7) return { bg: '#dcfce7', fg: '#166534', ring: '#22c55e' };
    if (v >= 0.4) return { bg: '#fef3c7', fg: '#92400e', ring: '#f59e0b' };
    if (v > 0) return { bg: '#fff7ed', fg: '#9a3412', ring: '#fb923c' };
    return { bg: '#f8fafc', fg: '#94a3b8', ring: '#e2e8f0' };
}

function scoreInterpretation(v) {
    if (v == null || v === 0) return 'No signal detected — pathway is inactive or unmeasured at this data level.';
    if (v >= 0.7) return 'Strong signal — this pathway is highly active, suggesting therapeutic relevance.';
    if (v >= 0.4) return 'Moderate signal — some pathway activity detected.';
    return 'Weak signal — minimal pathway activity observed.';
}

// ── Single Cell ──────────────────────────────────────────────────────────────

function PathwayCell({ pathwayKey, value, drugMoa }) {
    const info = getPathwayInfo(pathwayKey);
    const colors = scoreColor(value);
    const isRelevant = drugMoa && info.name.toLowerCase().includes(drugMoa.toLowerCase().split(' ')[0]);

    return (
        <Tooltip
            arrow
            title={
                <Box sx={{ maxWidth: 280 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{info.name}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>{info.desc}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                        {scoreInterpretation(value)}
                    </Typography>
                </Box>
            }
        >
            <Paper sx={{
                p: 2, borderRadius: 2.5, textAlign: 'center',
                bgcolor: colors.bg, border: '2px solid', borderColor: isRelevant ? 'primary.main' : colors.ring,
                cursor: 'help',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 16px ${colors.ring}44` },
                position: 'relative',
            }}>
                {/* Relevance indicator */}
                {isRelevant && (
                    <Box sx={{
                        position: 'absolute', top: 4, right: 6,
                        fontSize: '0.6rem', fontWeight: 800, color: 'primary.main',
                    }}>
                        ★
                    </Box>
                )}

                {/* Score value */}
                <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: colors.fg, lineHeight: 1 }}>
                    {value != null && value > 0 ? pct(value) : '—'}
                </Typography>

                {/* Pathway label */}
                <Typography variant="caption" sx={{
                    fontWeight: 700, color: 'text.secondary', display: 'block', mt: 0.75,
                    fontSize: '0.65rem', letterSpacing: 0.3,
                }}>
                    {info.name}
                </Typography>

                {/* Mini bar */}
                {value > 0 && (
                    <Box sx={{
                        mt: 1, height: 3, borderRadius: 2, bgcolor: `${colors.ring}33`,
                        width: '100%', position: 'relative',
                    }}>
                        <Box sx={{
                            position: 'absolute', left: 0, top: 0, height: '100%',
                            width: `${Math.round((value || 0) * 100)}%`,
                            bgcolor: colors.ring, borderRadius: 2,
                            transition: 'width 0.6s ease-out',
                        }} />
                    </Box>
                )}
            </Paper>
        </Tooltip>
    );
}

// ── Container ────────────────────────────────────────────────────────────────

export default function PathwayScoresGrid({ pathwayScores, drugMoa }) {
    if (!pathwayScores || Object.keys(pathwayScores).length === 0) {
        return (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 1 }}>
                    🧭 Pathway Scores (Patient Context)
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '1rem' }}>
                    Pathway scores are not available at the current data level. Adding more biomarkers will populate this grid.
                </Typography>
            </Paper>
        );
    }

    const entries = Object.entries(pathwayScores).sort(([, a], [, b]) => (b || 0) - (a || 0));

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
                    🧭 Pathway Scores (Patient Context)
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5, fontSize: '1rem', lineHeight: 1.7 }}>
                Each score represents how active a pathway is in your tumor.
                Higher scores indicate stronger disruption. Hover over a cell for details.
                {drugMoa && <> Cells marked with ★ are particularly relevant to this drug's mechanism ({drugMoa}).</>}
            </Typography>

            <Grid container spacing={1.5}>
                {entries.map(([key, value]) => (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                        <PathwayCell pathwayKey={key} value={value} drugMoa={drugMoa} />
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
}
