import React from 'react';
import { Box, Typography, LinearProgress, Grid } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

const GaugeWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const RiskHeader = styled(Typography)(({ level, theme }) => ({
    fontSize: '1.75rem',
    fontWeight: 800,
    textAlign: 'center',
    letterSpacing: '-0.5px',
    marginBottom: '16px',
    color: level === 'HIGH' ? theme.palette.error.main
        : level === 'MEDIUM' ? theme.palette.warning.main
            : theme.palette.success.main,
}));

const MeterLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginBottom: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 500,
}));

const ProphetGauges = ({ prediction }) => {
    if (!prediction) return null;
    const theme = useTheme();

    const { risk_level, probability, signals_detected = [] } = prediction;

    // Extract Signal Probabilities (safe — defaults to empty array)
    const restoration = signals_detected.find(s => s.signal_type === "DNA_REPAIR_RESTORATION" || s.signaltype === "DNAREPAIRRESTORATION");
    const escape = signals_detected.find(s => s.signal_type === "PATHWAY_ESCAPE" || s.signaltype === "PATHWAYESCAPE");
    const drugRes = signals_detected.find(s => s.signal_type === "DRUG_CLASS_RESISTANCE" || s.signaltype === "MMDRUGCLASSRESISTANCE");

    const restProb = restoration ? restoration.probability * 100 : 0;
    const escProb = escape ? escape.probability * 100 : 0;
    const overallProb = probability * 100;

    return (
        <GaugeWrapper>

            {/* 1. OVERALL RISK */}
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 0, fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Resistance Risk Assessment
            </Typography>
            <RiskHeader level={risk_level}>
                {risk_level} RISK ({(overallProb).toFixed(0)}%)
            </RiskHeader>

            <Grid container spacing={3}>

                {/* 2. REPAIR RESTORATION */}
                <Grid item xs={6}>
                    <MeterLabel>
                        <span>Repair Restoration</span>
                        <span style={{ color: theme.palette.text.primary, fontWeight: 700 }}>{restProb.toFixed(0)}%</span>
                    </MeterLabel>
                    <LinearProgress
                        variant="determinate"
                        value={restProb}
                        sx={{
                            height: 10, borderRadius: 5,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                bgcolor: restProb > 50 ? theme.palette.error.main : theme.palette.success.main,
                            },
                        }}
                    />
                    <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 1 }}>
                        DNA repair pathway signal
                    </Typography>
                </Grid>

                {/* 3. PATHWAY ESCAPE */}
                <Grid item xs={6}>
                    <MeterLabel>
                        <span>Pathway Escape</span>
                        <span style={{ color: theme.palette.text.primary, fontWeight: 700 }}>{escProb.toFixed(0)}%</span>
                    </MeterLabel>
                    <LinearProgress
                        variant="determinate"
                        value={escProb}
                        sx={{
                            height: 10, borderRadius: 5,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                bgcolor: escProb > 50 ? theme.palette.warning.main : theme.palette.primary.main,
                            },
                        }}
                    />
                    <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 1 }}>
                        Alternative pathway signal
                    </Typography>
                </Grid>

                {/* PLATINUM RESISTANCE */}
                {drugRes && (
                    <Grid item xs={12}>
                        <Box sx={{ mt: 1, p: 2, border: `1px solid ${theme.palette.error.light}`, borderRadius: 2, bgcolor: `${theme.palette.error.main}08` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: theme.palette.error.main, fontWeight: 700, fontSize: '0.9375rem' }}>
                                    Platinum Resistance Detected
                                </Typography>
                            </Box>
                            <Typography sx={{ color: theme.palette.text.primary, fontSize: '1.25rem', fontWeight: 800, mt: 1 }}>
                                {drugRes.probability * 100}% Probability
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.5, fontStyle: 'italic' }}>
                                "{drugRes.rationale}"
                            </Typography>
                        </Box>
                    </Grid>
                )}

            </Grid>

            {prediction.baseline_penalty_applied && (
                <Box sx={{ mt: 3, p: 1.5, border: `1px solid ${theme.palette.warning.main}`, borderRadius: 2, textAlign: 'center', bgcolor: `${theme.palette.warning.main}08` }}>
                    <Typography sx={{ color: theme.palette.warning.dark, fontSize: '0.875rem', fontWeight: 600 }}>
                        ⚠️ Baseline Penalty Active
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                        Population average used (confidence capped)
                    </Typography>
                </Box>
            )}

            {/* PROGNOSIS LAYER */}
            {prediction.prognosis && prediction.prognosis.status !== "UNKNOWN" && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', letterSpacing: '0.5px', mb: 0.5, fontWeight: 600, textTransform: 'uppercase' }}>
                        Molecular Prognosis (CN7)
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 1, lineHeight: 1.4 }}>
                        Copy-Number Signature 7 — structural genomic instability from genome-wide CNA profiles.
                        Requires low-pass WGS (lpWGS). Source: BriTROC / COSMIC CN Signatures. <strong>Research Use Only.</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: prediction.prognosis.status === 'POOR' ? theme.palette.error.main : theme.palette.success.main
                        }}>
                            {prediction.prognosis.status}
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}>
                                Score: {prediction.prognosis.sig7_score?.toFixed(2) || "N/A"}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                                (Threshold: {prediction.prognosis.threshold})
                            </Typography>
                        </Box>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (prediction.prognosis.sig7_score || 0) * 100)}
                        sx={{
                            mt: 1, height: 8, borderRadius: 4,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: prediction.prognosis.status === 'POOR' ? theme.palette.error.main : theme.palette.success.main,
                            },
                        }}
                    />
                </Box>
            )}

        </GaugeWrapper>
    );
};

export default ProphetGauges;
