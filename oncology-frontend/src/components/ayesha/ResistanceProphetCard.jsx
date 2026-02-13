import React, { useState } from 'react';
import {
    Paper,
    Box,
    Typography,
    Chip,
    LinearProgress,
    Collapse,
    IconButton,
    Grid,
    Tooltip,
    Alert
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const SignalRow = ({ signal }) => {
    const [expanded, setExpanded] = useState(false);

    if (!signal) return null;

    const {
        signal_type,
        detected,
        probability,
        confidence,
        rationale,
        mechanism_breakdown
    } = signal;

    const isRestoration = signal_type === 'DNA_REPAIR_RESTORATION';
    const isEscape = signal_type === 'PATHWAY_ESCAPE';

    // Restoration: High Prob = Bad (Resistance)
    // Escape: High Prob = Bad (Target Loss)

    const severityColor = detected ? 'error' : 'success';
    const severityLabel = detected ? 'DETECTED' : 'NOT DETECTED';

    return (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isRestoration && <TrendingUpIcon color={detected ? "error" : "action"} />}
                    {isEscape && <TrendingDownIcon color={detected ? "error" : "action"} />}
                    <Typography variant="subtitle2" fontWeight="bold">
                        {signal_type.replace(/_/g, ' ')}
                    </Typography>
                </Box>
                <Chip
                    label={severityLabel}
                    color={severityColor}
                    size="small"
                    variant={detected ? "filled" : "outlined"}
                />
            </Box>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">Probability</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={(probability || 0) * 100}
                            color={detected ? "error" : "success"}
                            sx={{ flex: 1, height: 6, borderRadius: 1 }}
                        />
                        <Typography variant="caption" fontWeight="bold">{(probability * 100).toFixed(0)}%</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">Confidence</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={(confidence || 0) * 100}
                            color="primary"
                            sx={{ flex: 1, height: 6, borderRadius: 1 }}
                        />
                        <Typography variant="caption" fontWeight="bold">{(confidence * 100).toFixed(0)}%</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                    <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Grid>
            </Grid>

            <Collapse in={expanded}>
                <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {rationale}
                    </Typography>

                    {mechanism_breakdown && (
                        <Box sx={{ mt: 1, bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                            <Typography variant="caption" fontWeight="bold">Mechanism Breakdown</Typography>
                            {Object.entries(mechanism_breakdown).filter(([k]) => k !== 'pathway_contributions').map(([key, val]) => (
                                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">{key.replace(/_/g, ' ')}</Typography>
                                    <Typography variant="caption" fontWeight="bold">{typeof val === 'number' ? val.toFixed(3) : val}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

const ResistanceProphetCard = ({ resistance_prediction }) => {
    if (!resistance_prediction) return null;

    const {
        risk_level,
        integrated_confidence,
        signals_detected = [],
        baseline_penalty,
        baseline_source
    } = resistance_prediction;

    const getRiskColor = (level) => {
        switch (level) {
            case 'HIGH': return 'error';
            case 'MEDIUM': return 'warning';
            case 'LOW': return 'success';
            default: return 'default';
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3, borderLeft: '6px solid', borderColor: `${getRiskColor(risk_level)}.main` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color={getRiskColor(risk_level)} />
                    <Typography variant="h6">Resistance Prophet (AI Projection)</Typography>
                </Box>
                <Chip
                    label={`${risk_level} RISK`}
                    color={getRiskColor(risk_level)}
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            {baseline_penalty && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Baseline Penalty Applied ({baseline_source}). Confidence reduced due to lack of patient-specific historical baseline.
                </Alert>
            )}

            {signals_detected.map((signal, idx) => (
                <SignalRow key={idx} signal={signal} />
            ))}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">Integrated Confidence:</Typography>
                <Chip
                    label={integrated_confidence ? `${(integrated_confidence * 100).toFixed(0)}%` : 'N/A'}
                    size="small"
                    variant="outlined"
                />
            </Box>
        </Paper>
    );
};

export default ResistanceProphetCard;
