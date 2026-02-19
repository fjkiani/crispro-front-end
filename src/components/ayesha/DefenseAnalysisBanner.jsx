import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Collapse, Grid } from '@mui/material';
import { ShieldAlert, ShieldCheck, Radar, Shield } from 'lucide-react';

/**
 * ZETA COMPONENT: Defense Analysis Banner
 * Replaces ResistanceGateBanner.
 * 
 * Philosophy: "Know the Enemy's Shields"
 * - Outcome B (Veto) -> "SHIELDS UP" (High Alert)
 * - Outcome A (Pass) -> "SHIELDS DOWN" (Vulnerable)
 */
const DefenseAnalysisBanner = ({ data, levelKey }) => {
    const lvl = String(levelKey || 'L1').toUpperCase();
    const [expanded, setExpanded] = useState(true);

    if (!data || !data.boardroom_outcome) {
        return (
            <Card sx={{ mb: 4, borderRadius: 0, border: '1px solid #334155', bgcolor: '#0f172a' }}>
                <CardContent>
                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: 2 }}>
                        DEFENSE ANALYSIS
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 1, fontFamily: 'monospace' }}>
                        // DATA STREAM: OFFLINE (NO INTEL)
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const { boardroom_outcome, signals = [] } = data;
    const { outcome, label, summary, action } = boardroom_outcome;

    const isShieldsUp = outcome === 'B'; // Veto
    const isShieldsDown = outcome === 'A'; // Pass

    // Zeta Theme: High Contrast, Military/Sci-Fi
    const theme = isShieldsUp ? {
        // Red / Danger
        bg: '#450a0a',
        border: '#dc2626',
        text: '#fecaca',
        accent: '#ef4444',
        iconColor: '#f87171'
    } : isShieldsDown ? {
        // Green / Go
        bg: '#052e16',
        border: '#16a34a',
        text: '#dcfce7',
        accent: '#22c55e',
        iconColor: '#4ade80'
    } : {
        // Grey / Unknown
        bg: '#1e293b',
        border: '#475569',
        text: '#cbd5e1',
        accent: '#94a3b8',
        iconColor: '#cbd5e1'
    };

    return (
        <Card sx={{
            mb: 4,
            borderRadius: 0, // Sharp corners for military feel
            border: `1px solid ${theme.border}`,
            borderLeft: `6px solid ${theme.border}`,
            bgcolor: theme.bg,
            boxShadow: isShieldsUp ? '0 0 20px rgba(220, 38, 38, 0.4)' : 'none',
        }}>
            <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>

                    {/* Status Icon */}
                    <Box sx={{
                        p: 2,
                        bgcolor: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {isShieldsUp ? <ShieldAlert size={40} color={theme.iconColor} /> :
                            isShieldsDown ? <ShieldCheck size={40} color={theme.iconColor} /> :
                                <Radar size={40} color={theme.iconColor} />}
                    </Box>

                    {/* Main Intel */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: theme.accent, letterSpacing: 3 }}>
                                DEFENSE ANALYSIS (SHIELDS)
                            </Typography>
                            <Chip
                                label={isShieldsUp ? "SHIELDS ACTIVE" : "SHIELDS DOWN"}
                                sx={{
                                    bgcolor: theme.border,
                                    color: '#fff',
                                    fontWeight: 900,
                                    borderRadius: 0,
                                    height: 24,
                                    letterSpacing: 1
                                }}
                            />
                        </Box>

                        <Typography variant="h4" sx={{
                            fontWeight: 900,
                            color: '#fff',
                            letterSpacing: -0.5,
                            mb: 1,
                            textTransform: 'uppercase'
                        }}>
                            {isShieldsUp ? "RESISTANCE DETECTED" : "NO RESISTANCE"}
                        </Typography>

                        <Typography variant="body1" sx={{ color: theme.text, mb: 2, maxWidth: '800px', lineHeight: 1.6 }}>
                            {summary}
                        </Typography>

                        {/* Action Directive */}
                        <Box sx={{
                            p: 2,
                            bgcolor: 'rgba(0,0,0,0.4)',
                            borderLeft: `4px solid ${theme.accent}`,
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center'
                        }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: theme.accent, letterSpacing: 1 }}>
                                MISSION DIRECTIVE:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                                {action}
                            </Typography>
                        </Box>

                        {/* Signal List (if any) */}
                        <Collapse in={expanded}>
                            {signals.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="caption" sx={{ color: theme.accent, fontWeight: 800, letterSpacing: 1, mb: 1, display: 'block' }}>
                                        DETECTED THREATS
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {signals.map((s, i) => (
                                            <Grid item xs={12} md={6} key={i}>
                                                <Box sx={{
                                                    p: 1.5,
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${theme.border}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}>
                                                    <Shield size={16} color={theme.iconColor} />
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1 }}>
                                                            {(s.signal_type || 'Unknown').replace(/_/g, ' ')}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: theme.text }}>
                                                            {s.rationale}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Collapse>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DefenseAnalysisBanner;
