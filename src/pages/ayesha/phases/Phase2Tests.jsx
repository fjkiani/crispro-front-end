/**
 * Phase 2 — Tests & Unlocks ("What should we test next?")
 *
 * "Shopping cart for certainty": each Test Card includes
 *   (A) What it is
 *   (B) What it unlocks (verbatim strings)
 *   (C) Why it matters in 1 sentence
 *   (D) Status: Missing / Present / Unknown
 *
 * Never shows tests that don't map to a capability unlock.
 * No speculative recommendations; only structured "unlocks."
 */
import React from 'react';
import {
    Box, Typography, Paper, Grid, Button, Chip, LinearProgress, Divider,
} from '@mui/material';
import {
    ArrowForward, CheckCircle, Science, Lock, LockOpen,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import { UNLOCK_TESTS, mergeTestStatus } from '../../../constants/journeyPhases';
import { useAyeshaProfile } from '../../../hooks/ayesha/useAyeshaProfile';

// Map UNLOCK_TESTS ids to clinicalTestRegistry keys (slug for routing)
const REGISTRY_SLUG_MAP = {
    hrd: 'hrd',
    tmb: 'tmb',
    rna: 'rna_expression',
    ca125: 'ca125_kinetics',
    ctdna: 'ctdna_mrd',
    lpwgs: 'lpwgs',
};

// ── Test Card ────────────────────────────────────────────────────────────────
const TestCard = ({ test, onClickDetail }) => {
    const isPresent = test.status === 'present';
    // ... rest of TestCard ...

    return (
        <Paper
            onClick={() => onClickDetail(test.id)}
            sx={{
                p: 3,
                borderRadius: 3,
                border: '2px solid',
                borderColor: isPresent ? 'success.light' : 'warning.light',
                bgcolor: isPresent ? '#f0fdf4' : 'background.paper',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
            }}>
            {/* Header: test name + status */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Science sx={{ fontSize: 20, color: isPresent ? 'success.main' : 'warning.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        {test.name}
                    </Typography>
                </Box>
                <Chip
                    icon={isPresent ? <CheckCircle sx={{ fontSize: 16 }} /> : <Lock sx={{ fontSize: 16 }} />}
                    label={isPresent ? 'Available' : 'Missing'}
                    size="small"
                    color={isPresent ? 'success' : 'warning'}
                    sx={{ fontWeight: 600 }}
                />
            </Box>

            {/* What it is */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                {test.what}
            </Typography>

            {/* Why it matters */}
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                {test.why}
            </Typography>

            {/* What it unlocks */}
            <Box sx={{
                p: 1.5, borderRadius: 2, bgcolor: isPresent ? '#dcfce7' : '#eff6ff',
                border: '1px solid', borderColor: isPresent ? '#bbf7d0' : '#bfdbfe',
            }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: isPresent ? 'success.dark' : 'primary.dark', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {isPresent ? '✓ Unlocked Capabilities' : '🔒 Will Unlock'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                    {test.unlocks.map(unlock => (
                        <Chip
                            key={unlock}
                            icon={isPresent ? <LockOpen sx={{ fontSize: 14 }} /> : <Lock sx={{ fontSize: 14 }} />}
                            label={unlock}
                            size="small"
                            variant={isPresent ? 'filled' : 'outlined'}
                            color={isPresent ? 'success' : 'primary'}
                            sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Priority + Validation Status */}
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                    label={`Priority: ${test.priority}`}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        bgcolor: test.priority === 'HIGH' ? '#fef3c7' : '#f1f5f9',
                        color: test.priority === 'HIGH' ? '#92400e' : 'text.secondary',
                        border: '1px solid',
                        borderColor: test.priority === 'HIGH' ? '#fde68a' : 'divider',
                    }}
                />
                {test.validationStatus && (
                    <Chip
                        label={test.validationStatus}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            bgcolor: test.validationStatus === 'VALIDATED' ? '#dcfce7' : '#fef9c3',
                            color: test.validationStatus === 'VALIDATED' ? '#166534' : '#854d0e',
                            border: '1px solid',
                            borderColor: test.validationStatus === 'VALIDATED' ? '#bbf7d0' : '#fde68a',
                        }}
                    />
                )}
            </Box>

            {/* Provenance footnote */}
            {test.provenance && (
                <Typography variant="caption" sx={{
                    display: 'block',
                    mt: 1,
                    color: 'text.disabled',
                    fontSize: '0.72rem',
                    lineHeight: 1.4,
                    fontStyle: 'italic',
                }}>
                    {test.provenance}
                </Typography>
            )}
        </Paper>
    );
};

// ── Unlock Progress ──────────────────────────────────────────────────────────

const UnlockProgress = ({ tests }) => {
    const present = tests.filter(t => t.status === 'present').length;
    const total = tests.length;
    const pct = Math.round((present / total) * 100);

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Unlock Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                        flex: 1, height: 12, borderRadius: 6, bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': { borderRadius: 6, bgcolor: 'success.main' },
                    }}
                />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main', whiteSpace: 'nowrap' }}>
                    {present}/{total} tests
                </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Each test reduces uncertainty. It does not guarantee a treatment choice.
                If you skip a test, we will still run, but with lower confidence and fewer unlocked views.
            </Typography>
        </Paper>
    );
};

// ── Page Orchestrator ────────────────────────────────────────────────────────

const Phase2Tests = () => {
    const navigate = useNavigate();
    const { profile } = useAyeshaProfile();
    const completeness = profile?.completeness || { present: [], missing: [] };

    // Dynamically merge status based on profile completeness mapping
    const mergedTests = mergeTestStatus(UNLOCK_TESTS, completeness);

    // Sort: missing/high-priority first
    const sortedTests = [...mergedTests].sort((a, b) => {
        if (a.status === 'missing' && b.status === 'present') return -1;
        if (a.status === 'present' && b.status === 'missing') return 1;
        const prio = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (prio[a.priority] || 2) - (prio[b.priority] || 2);
    });

    return (
        <JourneyLayout>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <UnlockProgress tests={mergedTests} />

                <Grid container spacing={2.5}>
                    {sortedTests.map(test => (
                        <Grid item xs={12} md={6} key={test.id}>
                            <TestCard
                                test={test}
                                onClickDetail={(id) => {
                                    const slug = REGISTRY_SLUG_MAP[id] || id;
                                    navigate(`/ayesha/journey/test/${slug}`);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/ayesha/journey/treatment')}
                    sx={{ fontWeight: 600, py: 1.5, alignSelf: 'center', px: 5 }}
                >
                    See Treatment Options →
                </Button>

                <Box sx={{
                    textAlign: 'center', pt: 4, pb: 2,
                    display: 'flex', flexDirection: 'column', gap: 1
                }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: '0.5px' }}>
                        PROVENANCE LOG
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                        profile completeness mapping // Source: local (no API bundle call) // Data mapped from: profile.germline, profile.tumor_context
                    </Typography>
                </Box>
            </Box>
        </JourneyLayout>
    );
};

export default Phase2Tests;
