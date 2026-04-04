/**
 * IntakeRiskWarning — Warning when ≥2 baseline signals fire but 0 active signals.
 * Based on policy.py L608-624 intake_risk_flag.
 *
 * This indicates pre-existing risk factors detected at intake that may
 * affect treatment response, but no temporal change has been observed yet.
 *
 * Props:
 *   baselineCount    — Number of BASELINE signals firing
 *   activeCount      — Number of ACTIVE signals firing
 *   baselineSignals  — Array of baseline signal names for display
 *   signalSlugs      — Array of { name, slug } for CTA buttons (Sprint 5 — GAP-06)
 */
import React from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { ReportProblem, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function IntakeRiskWarning({
    baselineCount = 0,
    activeCount = 0,
    baselineSignals = [],
    signalSlugs = [],      // [{ name: 'HRD Baseline', slug: 'hrd' }, ...]
}) {
    const navigate = useNavigate();

    // Only show when ≥2 baseline but 0 active (intake risk flag condition)
    if (baselineCount < 2 || activeCount > 0) return null;

    return (
        <Paper sx={{
            p: 2.5, borderRadius: 2.5,
            bgcolor: '#fffbeb',
            border: '1.5px solid #fde68a',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <ReportProblem sx={{ color: '#d97706', fontSize: 24, mt: 0.2 }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e', fontSize: '0.88rem', mb: 0.5 }}>
                        Intake Risk Alert
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#78350f', fontSize: '0.85rem', lineHeight: 1.6, mb: 1.5 }}>
                        {baselineCount} baseline resistance signals detected at intake with no active temporal changes observed.
                        This indicates pre-existing risk factors that may affect initial treatment response.
                    </Typography>

                    {/* Signal name chips */}
                    {baselineSignals.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                            {baselineSignals.map((sig, i) => (
                                <Chip key={i} label={sig} size="small"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.72rem',
                                        bgcolor: '#fef3c7',
                                        color: '#92400e',
                                        border: '1px solid #fde68a',
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    <Typography variant="caption" sx={{ display: 'block', mb: signalSlugs.length > 0 ? 1.5 : 0, color: '#a16207', fontSize: '0.72rem', fontStyle: 'italic' }}>
                        Recommendation: Monitor closely for early conversion to active signals.
                        Baseline risk does not require immediate therapy change.
                    </Typography>

                    {/* GAP-06: CTA buttons — specific test per signal */}
                    {signalSlugs.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                            {signalSlugs.map((entry, i) => (
                                <Button
                                    key={i}
                                    size="small"
                                    variant="outlined"
                                    endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                                    onClick={() => navigate(`/ayesha/journey/test/${entry.slug}`)}
                                    sx={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        color: '#92400e',
                                        borderColor: '#fde68a',
                                        bgcolor: '#fef9c3',
                                        textTransform: 'none',
                                        py: 0.4, px: 1.2,
                                        '&:hover': { bgcolor: '#fef3c7', borderColor: '#d97706' },
                                    }}
                                >
                                    Log {entry.name} Reading
                                </Button>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Paper>
    );
}
