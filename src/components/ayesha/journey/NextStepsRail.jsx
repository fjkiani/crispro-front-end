/**
 * NextStepsRail.jsx — Contextual "What to do next" panel
 *
 * Shows 2-3 items: either a test to order or a page to visit.
 * Renders as a right sidebar panel.
 */
import React from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowForward, Science as TestIcon } from '@mui/icons-material';
import { getPhaseFromRoute, getNextSteps, JOURNEY_PHASES } from '../../../constants/journeyPhases';

const NextStepsRail = ({ completeness }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPhase = getPhaseFromRoute(location.pathname);
    const steps = getNextSteps(currentPhase?.id || 1, completeness);

    if (!steps.length) return null;

    return (
        <Paper sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#fafbff',
        }}>
            <Typography variant="overline" sx={{
                fontWeight: 700,
                color: 'text.secondary',
                display: 'block',
                mb: 1.5,
                fontSize: '0.6875rem',
                letterSpacing: '0.05em',
            }}>
                Next Steps
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {steps.map((step, idx) => (
                    <Box
                        key={idx}
                        onClick={() => navigate(step.route)}
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: step.priority === 'primary' ? 'primary.main' : 'background.paper',
                            color: step.priority === 'primary' ? 'primary.contrastText' : 'text.primary',
                            border: step.priority === 'primary' ? 'none' : '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            },
                        }}
                    >
                        {step.type === 'test' ? (
                            <TestIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                        ) : (
                            <ArrowForward sx={{ fontSize: 18, opacity: 0.7 }} />
                        )}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                            }}>
                                {step.label}
                            </Typography>
                            {step.description && (
                                <Typography variant="caption" sx={{
                                    color: step.priority === 'primary' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                    display: 'block',
                                    lineHeight: 1.3,
                                    mt: 0.25,
                                }}>
                                    {step.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Phase output */}
            {currentPhase && (
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        This page produces: {currentPhase.output}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default NextStepsRail;
