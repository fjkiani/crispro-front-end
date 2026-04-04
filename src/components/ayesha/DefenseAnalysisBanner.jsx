import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Collapse, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ShieldAlert, ShieldCheck, Radar, Shield } from 'lucide-react';

/**
 * Defense Analysis Banner — light UI (resistance gate summary).
 */
const DefenseAnalysisBanner = ({ data, levelKey }) => {
    const theme = useTheme();
    const lvl = String(levelKey || 'L1').toUpperCase();
    const [expanded, setExpanded] = useState(true);

    if (!data || !data.boardroom_outcome) {
        return (
            <Card
                sx={{
                    mb: 4,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <CardContent>
                    <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 2 }}>
                        DEFENSE ANALYSIS
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontFamily: 'monospace' }}>
                        No resistance-gate data yet for {lvl}.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const { boardroom_outcome, signals = [] } = data;
    const { outcome, summary, action } = boardroom_outcome;

    const isShieldsUp = outcome === 'B';
    const isShieldsDown = outcome === 'A';

    const palette = isShieldsUp
        ? {
            bg: alpha(theme.palette.error.main, 0.08),
            border: theme.palette.error.main,
            main: theme.palette.error.main,
            strong: theme.palette.error.dark,
            icon: theme.palette.error.main,
        }
        : isShieldsDown
            ? {
                bg: alpha(theme.palette.success.main, 0.08),
                border: theme.palette.success.main,
                main: theme.palette.success.main,
                strong: theme.palette.success.dark,
                icon: theme.palette.success.main,
            }
            : {
                bg: alpha(theme.palette.grey[500], 0.08),
                border: theme.palette.grey[400],
                main: theme.palette.text.secondary,
                strong: theme.palette.text.primary,
                icon: theme.palette.grey[600],
            };

    return (
        <Card
            sx={{
                mb: 4,
                borderRadius: 1,
                border: 1,
                borderColor: palette.border,
                borderLeft: 6,
                borderLeftColor: palette.border,
                bgcolor: palette.bg,
                boxShadow: isShieldsUp ? `0 0 0 1px ${alpha(theme.palette.error.main, 0.2)}` : 'none',
            }}
        >
            <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>

                    <Box
                        sx={{
                            p: 2,
                            bgcolor: alpha(theme.palette.common.black, 0.04),
                            border: 1,
                            borderColor: palette.border,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isShieldsUp ? (
                            <ShieldAlert size={40} color={palette.icon} />
                        ) : isShieldsDown ? (
                            <ShieldCheck size={40} color={palette.icon} />
                        ) : (
                            <Radar size={40} color={palette.icon} />
                        )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: palette.main, letterSpacing: 2 }}>
                                DEFENSE ANALYSIS (SHIELDS)
                            </Typography>
                            <Chip
                                label={isShieldsUp ? 'SHIELDS ACTIVE' : 'SHIELDS DOWN'}
                                size="small"
                                sx={{
                                    bgcolor: alpha(palette.border, 0.15),
                                    color: palette.strong,
                                    fontWeight: 800,
                                    borderRadius: 0.5,
                                    border: 1,
                                    borderColor: alpha(palette.border, 0.5),
                                }}
                            />
                        </Box>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                color: palette.strong,
                                letterSpacing: -0.3,
                                mb: 1,
                                textTransform: 'uppercase',
                            }}
                        >
                            {isShieldsUp ? 'RESISTANCE DETECTED' : 'NO RESISTANCE'}
                        </Typography>

                        <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, maxWidth: '800px', lineHeight: 1.6 }}>
                            {summary}
                        </Typography>

                        <Box
                            sx={{
                                p: 2,
                                bgcolor: 'background.paper',
                                borderLeft: 4,
                                borderLeftColor: palette.border,
                                display: 'flex',
                                gap: 2,
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 800, color: palette.main, letterSpacing: 1 }}>
                                MISSION DIRECTIVE:
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                {action}
                            </Typography>
                        </Box>

                        <Collapse in={expanded}>
                            {signals.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: palette.main, fontWeight: 800, letterSpacing: 1, mb: 1, display: 'block' }}
                                    >
                                        DETECTED THREATS
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {signals.map((s, i) => (
                                            <Grid item xs={12} md={6} key={i}>
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        bgcolor: alpha(theme.palette.grey[500], 0.06),
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                    }}
                                                >
                                                    <Shield size={16} color={palette.icon} />
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1 }}>
                                                            {(s.signal_type || 'Unknown').replace(/_/g, ' ')}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
