/**
 * UnlockSection — Shows what's missing and what it would improve.
 *
 * Displays completeness, current data level, and missing biomarker chips
 * with a CTA to the Tests & Unlocks page.
 */
import React from 'react';
import {
    Box, Typography, Paper, Grid, Button, Chip, LinearProgress,
} from '@mui/material';
import { Cancel, CheckCircle, ArrowForward, Science } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LEVEL_LABELS = {
    L0: { label: 'L0 — Minimal', desc: 'Historical data only.' },
    L1: { label: 'L1 — Partial', desc: 'Core genomics present, many inputs still missing.' },
    L2: { label: 'L2 — Full Panel', desc: 'Comprehensive biomarker panel available.' },
    L3: { label: 'L3 — Longitudinal', desc: 'Multiple timepoints with longitudinal data.' },
};

export default function UnlockSection({ completeness, insights }) {
    const navigate = useNavigate();
    const missing = completeness?.missing || [];
    const level = completeness?.level || 'L1';
    const score = completeness?.completeness_score;
    const levelInfo = LEVEL_LABELS[level] || LEVEL_LABELS.L1;

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Science sx={{ fontSize: 22, color: '#7c3aed' }} />
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
                    What Would Improve This Score
                </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, fontSize: '1.05rem', lineHeight: 1.8 }}>
                <strong>More data = higher confidence.</strong> Each missing biomarker test limits
                how accurately we can match this drug to your tumor. Adding tests can shift the ranking significantly.
            </Typography>

            {/* Level and completeness */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={levelInfo.label} size="small" sx={{ fontWeight: 700 }} />
                {score != null && (
                    <Box sx={{ flex: 1, minWidth: 120, maxWidth: 300 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Completeness</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{Math.round(score * 100)}%</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={score * 100}
                            sx={{
                                height: 8, borderRadius: 4,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: score >= 0.8 ? '#16a34a' : score >= 0.5 ? '#f59e0b' : '#ef4444',
                                    borderRadius: 4,
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                {levelInfo.desc}
            </Typography>

            {/* Missing biomarkers */}
            {missing.length > 0 ? (
                <>
                    <Typography variant="body1" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1rem' }}>
                        Missing inputs that cap confidence:
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                        {missing.map((m) => (
                            <Grid item xs={12} sm={6} key={m}>
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 1, p: 1.5,
                                    borderRadius: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca',
                                    transition: 'all 0.15s',
                                    '&:hover': { bgcolor: '#fee2e2', transform: 'translateY(-1px)' },
                                }}>
                                    <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{m}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                            Adding this test would improve confidence.
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowForward />}
                        sx={{ fontWeight: 600 }}
                        onClick={() => navigate('/ayesha/journey/tests')}
                    >
                        Go to Tests & Unlocks
                    </Button>
                </>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#166534' }}>
                        All available biomarkers are present. This is the highest confidence available.
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}
