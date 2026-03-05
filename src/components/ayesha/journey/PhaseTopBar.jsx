/**
 * PhaseTopBar.jsx — Horizontal Stepper for 6-Phase Journey
 *
 * Shows: "You are here: Phase X of 6 — [Phase Name]"
 * Clickable phases with visual completion state.
 */
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { JOURNEY_PHASES, getPhaseFromRoute } from '../../../constants/journeyPhases';

const PhaseTopBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const currentPhase = getPhaseFromRoute(location.pathname);
    const currentId = currentPhase?.id || 1;

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            px: 3,
            py: 1.5,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            overflowX: 'auto',
            minHeight: 56,
        }}>
            {/* "You are here" label */}
            <Typography variant="body2" sx={{
                color: 'text.secondary',
                fontWeight: 600,
                mr: 2,
                whiteSpace: 'nowrap',
                display: { xs: 'none', md: 'block' },
            }}>
                Your Journey
            </Typography>

            {JOURNEY_PHASES.map((phase, idx) => {
                const Icon = phase.icon;
                const isCurrent = phase.id === currentId;
                const isPast = phase.id < currentId;

                return (
                    <React.Fragment key={phase.id}>
                        {/* Connector line */}
                        {idx > 0 && (
                            <Box sx={{
                                width: { xs: 16, md: 32 },
                                height: 2,
                                bgcolor: isPast ? phase.color : 'divider',
                                flexShrink: 0,
                                borderRadius: 1,
                            }} />
                        )}

                        {/* Phase chip */}
                        <Box
                            onClick={() => navigate(phase.route)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: { xs: 1, md: 1.5 },
                                py: 0.75,
                                borderRadius: 2,
                                cursor: 'pointer',
                                bgcolor: isCurrent ? `${phase.color}12` : 'transparent',
                                border: isCurrent ? `2px solid ${phase.color}` : '2px solid transparent',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                '&:hover': {
                                    bgcolor: `${phase.color}08`,
                                },
                            }}
                        >
                            <Icon sx={{
                                fontSize: 18,
                                color: isCurrent ? phase.color : isPast ? phase.color : 'text.disabled',
                            }} />
                            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                                <Typography variant="caption" sx={{
                                    fontWeight: isCurrent ? 700 : 500,
                                    color: isCurrent ? phase.color : isPast ? 'text.primary' : 'text.secondary',
                                    display: 'block',
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.75rem',
                                }}>
                                    {phase.shortLabel}
                                </Typography>
                            </Box>
                        </Box>
                    </React.Fragment>
                );
            })}
        </Box>
    );
};

export default PhaseTopBar;
