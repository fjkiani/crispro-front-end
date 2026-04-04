/**
 * SnapshotHeader — White-mode patient identity + engine lights + completeness
 *
 * Extracted from Phase1Profile.jsx monolith.
 * Includes UX fix: amber "Needs Data" instead of grey "No Data".
 */
import React from 'react';
import { Box, Paper, Typography, Chip, Divider, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatHistology, formatTimestamp, STATE_LABELS } from './profileUtils';

// ── Styled container ────────────────────────────────────────────────────────
const HeaderPaper = styled(Paper)(({ theme }) => ({
    background: '#ffffff',
    color: theme.palette.text.primary,
    padding: theme.spacing(3, 4),
    marginBottom: theme.spacing(3),
    borderRadius: '16px',
    borderLeft: '4px solid #0d9488',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
}));

export default function SnapshotHeader({
    profile, disease, germline, editState, tumorContext,
    formattedChips, signalRows, summary, missingFields, navigate,
}) {
    const stateLabel = STATE_LABELS[summary?.state_estimate] || 'Baseline — Monitoring';

    return (
        <HeaderPaper elevation={0}>
            {/* Identity line */}
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 0.5, color: 'text.primary' }}>
                Welcome back, {profile?.patient?.display_name || 'Patient'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {formatHistology(disease?.histology) || 'Your personalized precision oncology dashboard'}
                {profile?.patient?.demographics?.age && ` · Age ${profile.patient.demographics.age}`}
                {disease?.primary_site && ` · ${disease.primary_site}`}
            </Typography>

            {/* Biomarker Chips — ALL shown, tightly packed */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
                {/* Stage */}
                {(editState?.stage || disease?.stage) && (
                    <Chip
                        label={`Stage ${editState?.stage || disease?.stage}`}
                        size="small"
                        sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, border: '1px solid #bae6fd' }}
                    />
                )}
                {/* Germline */}
                {germline?.mutations?.[0]?.gene && (
                    <Chip
                        label={`Germline: Positive (${germline.mutations[0].gene})`}
                        size="small"
                        sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 600, border: '1px solid #fed7aa' }}
                    />
                )}
                {/* All biomarker chips from useAyeshaProfile */}
                {formattedChips.map((chip, i) => (
                    <Chip
                        key={i}
                        label={chip.label}
                        size="small"
                        sx={{
                            bgcolor: chip.cssVar === '--signal-fired' ? '#fef2f2'
                                : chip.cssVar === '--signal-clear' ? '#f0fdf4'
                                    : chip.cssVar === '--signal-watching' ? '#fffbeb'
                                        : '#f8fafc',
                            color: chip.cssVar === '--signal-fired' ? '#b91c1c'
                                : chip.cssVar === '--signal-clear' ? '#15803d'
                                    : chip.cssVar === '--signal-watching' ? '#a16207'
                                        : '#475569',
                            border: `1px solid ${chip.cssVar === '--signal-fired' ? '#fecaca'
                                : chip.cssVar === '--signal-clear' ? '#bbf7d0'
                                    : chip.cssVar === '--signal-watching' ? '#fde68a'
                                        : '#e2e8f0'}`,
                        }}
                    />
                ))}
                {/* State badge */}
                <Chip
                    label={stateLabel}
                    size="small"
                    sx={{
                        bgcolor: summary?.state_estimate === 'RESISTANCE_DETECTED' ? '#fef2f2' : '#f0fdf4',
                        color: summary?.state_estimate === 'RESISTANCE_DETECTED' ? '#b91c1c' : '#15803d',
                        border: `1px solid ${summary?.state_estimate === 'RESISTANCE_DETECTED' ? '#fecaca' : '#bbf7d0'}`,
                        fontWeight: 600,
                    }}
                />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* ── Kill Chain Engine Lights — 8 signals shown inline ── */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase' }}>
                        Cancer Kill Chain Engine Monitor
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: '#0d9488', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => navigate('/ayesha/journey/monitoring')}
                    >
                        View full dashboard →
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 1,
                }}>
                    {signalRows.map(sig => {
                        // UX FIX: amber for NO_DATA instead of grey
                        const dotColor = sig.state === 'CLEAR' ? '#16a34a'
                            : sig.state === 'FIRED' ? '#dc2626'
                                : sig.state === 'MONITORING' ? '#d97706'
                                    : sig.state === 'BASELINE_NOTED' ? '#2563eb'
                                        : '#f59e0b'; // amber for NO_DATA
                        const bgColor = sig.state === 'CLEAR' ? '#f0fdf4'
                            : sig.state === 'FIRED' ? '#fef2f2'
                                : sig.state === 'MONITORING' ? '#fffbeb'
                                    : sig.state === 'BASELINE_NOTED' ? '#eff6ff'
                                        : '#fffbeb'; // amber-50
                        const stateText = sig.state === 'CLEAR' ? 'Clear'
                            : sig.state === 'FIRED' ? 'Alert'
                                : sig.state === 'MONITORING' ? 'Watching'
                                    : sig.state === 'BASELINE_NOTED' ? 'Baseline'
                                        : 'Needs Data'; // not "No Data"
                        return (
                            <Paper
                                key={sig.id}
                                variant="outlined"
                                sx={{
                                    p: '6px 10px',
                                    borderRadius: '8px',
                                    bgcolor: bgColor,
                                    borderColor: `${dotColor}40`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    '&:hover': { boxShadow: `0 0 0 1px ${dotColor}60`, transform: 'translateY(-1px)' },
                                }}
                                onClick={() => {
                                    if (sig.testSlug) navigate(`/ayesha/journey/test/${sig.testSlug}`);
                                    else navigate('/ayesha/journey/monitoring');
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        bgcolor: dotColor, flexShrink: 0,
                                        boxShadow: sig.state === 'FIRED' ? `0 0 6px ${dotColor}` : 'none',
                                    }}
                                />
                                <Box sx={{ overflow: 'hidden' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {sig.name.replace(' Rising', '').replace(' Score Shift', '').replace(' Capacity Shift', '').replace(' / MRD', '').replace(' Activation', '').replace(' (CTR1) Loss', '')}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled', lineHeight: 1 }}>
                                        {stateText}
                                    </Typography>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            </Box>

            {/* Completeness row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={(tumorContext?.completeness_score || 0) * 100}
                        sx={{
                            flex: 1, height: 6, borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': { bgcolor: '#0d9488', borderRadius: 3 },
                        }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {Math.round((tumorContext?.completeness_score || 0) * 100)}% data coverage
                    </Typography>
                </Box>
                {missingFields.length > 0 && (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Missing: {missingFields.join(', ')}
                        {' · '}
                        <span
                            style={{ color: '#0d9488', textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={() => navigate('/ayesha/journey/tests')}
                        >
                            View tests →
                        </span>
                    </Typography>
                )}
            </Box>

            {/* Timestamp */}
            {formatTimestamp(profile?.meta?.last_updated) && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', textAlign: 'right' }}>
                    Updated {formatTimestamp(profile?.meta?.last_updated)}
                </Typography>
            )}
        </HeaderPaper>
    );
}
