/**
 * JourneyLayout.jsx — Wrapper for all 6 Phase pages
 *
 * Architecture:
 *   ┌─────────────────────────────────────────────┐
 *   │ PhaseTopBar (horizontal stepper)            │
 *   ├────────────────────────┬────────────────────┤
 *   │                        │                    │
 *   │  Phase Page Content    │  NextStepsRail     │
 *   │  (children)            │  (2-3 items)       │
 *   │                        │                    │
 *   └────────────────────────┴────────────────────┘
 */
import React from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import PhaseTopBar from './PhaseTopBar';
import NextStepsRail from './NextStepsRail';
import { useLocation } from 'react-router-dom';
import { getPhaseFromRoute } from '../../../constants/journeyPhases';

const JourneyLayout = ({ children, completeness, hideRail = false, hideDefaultRuo = false }) => {
    const location = useLocation();
    const currentPhase = getPhaseFromRoute(location.pathname);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Top stepper bar */}
            <PhaseTopBar />

            {/* Phase question banner */}
            {currentPhase && (
                <Box sx={{
                    px: 3, py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}>
                    <Container maxWidth="xl">
                        <Typography variant="h4" sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            letterSpacing: '-0.5px',
                            fontSize: { xs: '1.5rem', md: '1.75rem' },
                        }}>
                            {currentPhase.question}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            Phase {currentPhase.id} of 6 — {currentPhase.label}
                        </Typography>
                    </Container>
                </Box>
            )}

            {/* RUO disclaimer — pages can omit when they provide a fuller banner */}
            {!hideDefaultRuo && (
                <Container maxWidth="xl" sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ py: 0.5 }}>
                        <Typography variant="caption">
                            <strong>Research Use Only (RUO).</strong> Not medical advice. We show only what your data supports. Missing information is clearly marked.
                        </Typography>
                    </Alert>
                </Container>
            )}

            {/* Main content + right rail */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{
                    display: 'flex',
                    gap: 3,
                    alignItems: 'flex-start',
                }}>
                    {/* Phase content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {children}
                    </Box>

                    {/* Right rail — next steps */}
                    {!hideRail && (
                        <Box sx={{
                            width: 280,
                            flexShrink: 0,
                            position: 'sticky',
                            top: 80,
                            display: { xs: 'none', lg: 'block' },
                        }}>
                            <NextStepsRail completeness={completeness} />
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default JourneyLayout;
