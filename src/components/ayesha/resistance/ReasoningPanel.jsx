/**
 * ReasoningPanel
 *
 * Center panel: Glass-box logic stream.
 * Shows step-by-step clinical reasoning for the simulation.
 * Extracted from ResistanceLab.jsx.
 *
 * Props:
 *   simulationResult — result from /api/ayesha/resistance/simulate
 *   loading — boolean
 */
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Terminal as TerminalIcon } from '@mui/icons-material';
import ResistanceLogicStream from './ResistanceLogicStream';
import { PanelWrapper, PanelHeader, PanelContent } from './LabStyles';

const ReasoningPanel = ({ simulationResult, loading }) => {
    return (
        <PanelWrapper>
            <PanelHeader>
                <TerminalIcon />
                <Typography>How We're Thinking About This</Typography>
            </PanelHeader>
            <PanelContent sx={{ bgcolor: '#000', fontFamily: 'monospace' }}>
                {loading && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 4,
                            color: '#4fd1c5',
                        }}
                    >
                        <CircularProgress color="inherit" size={24} />
                        <Typography sx={{ mt: 2, fontSize: '0.8rem' }}>
                            Analyzing your tumor profile...
                        </Typography>
                    </Box>
                )}

                {simulationResult && (
                    <>
                        <Box
                            sx={{
                                p: 1.5,
                                borderBottom: '1px solid #1a202c',
                                mb: 1,
                            }}
                        >
                            <Typography variant="caption" sx={{ color: '#4a5568' }}>
                                Each step below shows exactly how the analysis reached its conclusion.
                                No black boxes — every decision is transparent.
                            </Typography>
                        </Box>
                        <ResistanceLogicStream steps={simulationResult.logic_steps} />
                    </>
                )}

                {!simulationResult && !loading && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography sx={{ color: '#4a5568', mb: 1 }}>
                            Hit "Update My Analysis" to generate your resistance profile.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#2d3748' }}>
                            The reasoning engine will show every step of its thinking here —
                            from your mutation profile to the final resistance probability.
                        </Typography>
                    </Box>
                )}
            </PanelContent>
        </PanelWrapper>
    );
};

export default ReasoningPanel;
