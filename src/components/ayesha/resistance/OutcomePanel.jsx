/**
 * OutcomePanel
 *
 * Right panel: PARP sensitivity + resistance prediction + next tests.
 * Hosts Evo2GatesSensitivityCard prominently at the top.
 * Extracted from ResistanceLab.jsx.
 *
 * Props:
 *   simulationResult — result from /api/ayesha/resistance/simulate
 *   loading — boolean
 */
import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Psychology as BrainIcon } from '@mui/icons-material';
import BaselineWorkflow from './BaselineWorkflow';
import ProphetGauges from './ProphetGauges';
import NextTestDisplay from './NextTestDisplay';
import EMTRiskGauge from '../EMTRiskGauge';
import Evo2GatesSensitivityCard from '../Evo2GatesSensitivityCard';
import TriggerFeedStrip from './TriggerFeedStrip';
import MRDSignalCard from './MRDSignalCard';
import { PanelWrapper, PanelHeader, PanelContent } from './LabStyles';

const OutcomePanel = ({ simulationResult, loading }) => {
    const prediction = simulationResult?.prediction;
    const isBaseline = prediction?.risk_level === 'NOT_APPLICABLE';
    const triggerEvents = simulationResult?.trigger_events || [];

    return (
        <PanelWrapper>
            <PanelHeader>
                <BrainIcon />
                <Typography>What This Means For You</Typography>
            </PanelHeader>
            <PanelContent>
                {/* Trigger alerts — shown if simulation returned any */}
                <TriggerFeedStrip triggerEvents={triggerEvents} />

                {/* MRD ctDNA Signal — shown only when detected */}
                <MRDSignalCard mrd={simulationResult?.mrd} />

                {/* PARP Sensitivity — always shown, static fallback before simulation */}
                <Evo2GatesSensitivityCard
                    evo2Prediction={simulationResult?.evo2_prediction || null}
                />

                {/* Baseline / No Prior Treatment */}
                {simulationResult && isBaseline && (
                    <BaselineWorkflow
                        prediction={prediction}
                        recommendedActions={prediction?.recommended_actions}
                        recommendedTests={simulationResult.recommended_tests}
                    />
                )}

                {/* Active Treatment — Prophet Gauges */}
                {simulationResult && !isBaseline && (
                    <>
                        <ProphetGauges prediction={prediction} />

                        <Box sx={{ mt: 2 }}>
                            <EMTRiskGauge
                                riskScore={prediction?.probability || 0}
                                zScore={prediction?.provenance?.transcriptomic_z_score}
                            />
                        </Box>

                        <Divider sx={{ my: 3, borderColor: '#2d3748' }} />
                        <NextTestDisplay tests={simulationResult.recommended_tests} />
                    </>
                )}

                {/* Empty state */}
                {!simulationResult && !loading && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#4a5568',
                            display: 'block',
                            textAlign: 'center',
                            mt: 2,
                            lineHeight: 1.8,
                        }}
                    >
                        Your PARP sensitivity score above is based on your current profile.
                        <br />
                        Hit "Update My Analysis" to recalculate with the scenario inputs.
                    </Typography>
                )}
            </PanelContent>
        </PanelWrapper>
    );
};

export default OutcomePanel;
