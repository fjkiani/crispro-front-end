import React from 'react';
import { Box, Typography, LinearProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const GaugeWrapper = styled(Box)({
    padding: '16px',
});

const RiskHeader = styled(Typography)(({ level }) => ({
    fontSize: '2rem',
    fontWeight: 800,
    textAlign: 'center',
    letterSpacing: '-1px',
    marginBottom: '20px',
    color: level === 'HIGH' ? '#ff6384'
        : level === 'MEDIUM' ? '#ecc94b'
            : '#4fd1c5',
    textShadow: level === 'HIGH' ? '0 0 20px rgba(255, 99, 132, 0.4)' : 'none',
}));

const MeterLabel = styled(Typography)({
    fontSize: '0.8rem',
    color: '#a0aec0',
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'space-between',
});

const CyberBar = styled(LinearProgress)(({ color }) => ({
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2d3748',
    '& .MuiLinearProgress-bar': {
        borderRadius: 5,
        backgroundColor: color,
    },
}));

const ProphetGauges = ({ prediction }) => {
    if (!prediction) return null;

    const { risk_level, probability, signals_detected } = prediction;

    // Extract Signal Probabilities
    const restoration = signals_detected.find(s => s.signal_type === "DNA_REPAIR_RESTORATION" || s.signaltype === "DNAREPAIRRESTORATION");
    const escape = signals_detected.find(s => s.signal_type === "PATHWAY_ESCAPE" || s.signaltype === "PATHWAYESCAPE");
    const drugRes = signals_detected.find(s => s.signal_type === "DRUG_CLASS_RESISTANCE" || s.signaltype === "MMDRUGCLASSRESISTANCE");

    const restProb = restoration ? restoration.probability * 100 : 0;
    const escProb = escape ? escape.probability * 100 : 0;
    const overallProb = probability * 100;

    return (
        <GaugeWrapper>

            {/* 1. OVERALL RISK */}
            <Typography sx={{ textAlign: 'center', color: '#718096', mb: 0 }}>PROPHET RISK ASSESSMENT</Typography>
            <RiskHeader level={risk_level}>
                {risk_level} RISK ({(overallProb).toFixed(0)}%)
            </RiskHeader>

            <Grid container spacing={4}>

                {/* 2. REVERSION GAUGE */}
                <Grid item xs={6}>
                    <MeterLabel>
                        <span>REVERSION PROB</span>
                        <span style={{ color: '#fff' }}>{restProb.toFixed(0)}%</span>
                    </MeterLabel>
                    <CyberBar
                        variant="determinate"
                        value={restProb}
                        color={restProb > 50 ? '#ff6384' : '#4fd1c5'}
                    />
                    <Typography sx={{ fontSize: '0.7rem', color: '#718096', mt: 1 }}>
                        Resto. Signal 1
                    </Typography>
                </Grid>

                {/* 3. ESCAPE GAUGE */}
                <Grid item xs={6}>
                    <MeterLabel>
                        <span>ESCAPE PROB</span>
                        <span style={{ color: '#fff' }}>{escProb.toFixed(0)}%</span>
                    </MeterLabel>
                    <CyberBar
                        variant="determinate"
                        value={escProb}
                        color={escProb > 50 ? '#ecc94b' : '#63b3ed'}
                    />
                    <Typography sx={{ fontSize: '0.7rem', color: '#718096', mt: 1 }}>
                        Pathway Signal 2
                    </Typography>
                </Grid>

                {/* 3a. PLATINUM RESISTANCE (ENGINE VERIFIED) */}
                {drugRes && (
                    <Grid item xs={12}>
                        <Box sx={{ mt: 1, p: 2, border: '1px solid #ff6384', borderRadius: 2, bgcolor: 'rgba(255, 99, 132, 0.1)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#ff6384', fontWeight: 700, fontSize: '0.9rem' }}>
                                    PLATINUM RESISTANCE
                                </Typography>
                                {drugRes.rationale.includes("Engine") || drugRes.rationale.includes("PFI") ? (
                                    null // <Chip label="ENGINE-VERIFIED" size="small" sx={{ bgcolor: '#4fd1c5', color: '#000', fontWeight: 'bold', fontSize: '0.6rem', height: '20px' }} />
                                ) : null}
                            </Box>
                            <Typography sx={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: 800, mt: 1 }}>
                                {drugRes.probability * 100}% PROBABILITY
                            </Typography>
                            <Typography sx={{ color: '#a0aec0', fontSize: '0.8rem', mt: 0.5, fontStyle: 'italic' }}>
                                "{drugRes.rationale}"
                            </Typography>
                        </Box>
                    </Grid>
                )}

            </Grid>

            {prediction.baseline_penalty_applied && (
                <Box sx={{ mt: 3, p: 1, border: '1px solid #ecc94b', borderRadius: 1, textAlign: 'center' }}>
                    <Typography sx={{ color: '#ecc94b', fontSize: '0.8rem', fontWeight: 600 }}>
                        ⚠️ BASELINE PENALTY ACTIVE
                    </Typography>
                    <Typography sx={{ color: '#a0aec0', fontSize: '0.7rem' }}>
                        Population average used (Confidence Capped)
                    </Typography>
                </Box>
            )}

            {/* 4. PROGNOSIS LAYER (NEW) */}
            {prediction.prognosis && prediction.prognosis.status !== "UNKNOWN" && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid #4a5568' }}>
                    <Typography sx={{ color: '#a0aec0', fontSize: '0.75rem', letterSpacing: '1px', mb: 1 }}>
                        MOLECULAR PROGNOSIS (SIG7)
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: prediction.prognosis.status === 'POOR' ? '#ff6384' : '#4fd1c5'
                        }}>
                            {prediction.prognosis.status}
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '0.8rem', color: '#fff' }}>
                                Sig7: {prediction.prognosis.sig7_score?.toFixed(2) || "N/A"}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: '#718096' }}>
                                (Threshold: {prediction.prognosis.threshold})
                            </Typography>
                        </Box>
                    </Box>
                    <CyberBar
                        variant="determinate"
                        value={Math.min(100, (prediction.prognosis.sig7_score || 0) * 100)}
                        color={prediction.prognosis.status === 'POOR' ? '#ff6384' : '#4fd1c5'}
                        sx={{ mt: 1 }}
                    />
                </Box>
            )}

        </GaugeWrapper>
    );
};

export default ProphetGauges;
