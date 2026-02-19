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
    Alert,
    Button,
    Divider,
    FormControlLabel,
    Switch,
    Slider
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import TimelineIcon from '@mui/icons-material/Timeline';
import { API_ROOT } from '../../lib/apiConfig';


// ---------------------------------------------------------------------------
// Human-readable signal labels & icons
// Map from BOTH backend formats (concatenated + snake_case) to display info
// ---------------------------------------------------------------------------
const SIGNAL_META = {
    // Snake_case enum values (V2 / internal)
    DNA_REPAIR_RESTORATION: {
        label: 'DNA Repair Restoration',
        description: 'Detects if DNA repair pathways are recovering, which would reduce platinum/PARPi sensitivity.',
        icon: 'restore',
    },
    PATHWAY_ESCAPE: {
        label: 'Pathway Escape',
        description: 'Monitors if targeted pathways are being bypassed via alternative signaling routes.',
        icon: 'escape',
    },
    CA125_KINETICS: {
        label: 'CA-125 Kinetics (KELIM)',
        description: 'Tracks CA-125 biomarker kinetics to detect early signs of treatment resistance.',
        icon: 'kinetics',
    },
    GENE_LEVEL_RESISTANCE: {
        label: 'Genomic Resistance Driver',
        description: 'Identifies resistance-conferring gene mutations (e.g., MBD4, TP53 reversion).',
        icon: 'gene',
    },
    CYTOGENETIC_ABNORMALITY: {
        label: 'Cytogenetic Abnormality',
        description: 'Detects chromosomal abnormalities (e.g., del(17p)) associated with treatment resistance.',
        icon: 'gene',
    },
    DRUG_CLASS_RESISTANCE: {
        label: 'Drug Class Resistance',
        description: 'Identifies drug-class-specific resistance mechanisms (e.g., PSMB5 for proteasome inhibitors).',
        icon: 'gene',
    },

    // Concatenated legacy enum values (from shim.py)
    DNAREPAIRRESTORATION: {
        label: 'DNA Repair Restoration',
        description: 'Detects if DNA repair pathways are recovering, which would reduce platinum/PARPi sensitivity.',
        icon: 'restore',
    },
    PATHWAYESCAPE: {
        label: 'Pathway Escape',
        description: 'Monitors if targeted pathways are being bypassed via alternative signaling routes.',
        icon: 'escape',
    },
    CA125KINETICS: {
        label: 'CA-125 Kinetics (KELIM)',
        description: 'Tracks CA-125 biomarker kinetics to detect early signs of treatment resistance.',
        icon: 'kinetics',
    },
    MMCYTOGENETICS: {
        label: 'Cytogenetic Abnormality',
        description: 'Detects chromosomal abnormalities associated with treatment resistance.',
        icon: 'gene',
    },
    MMDRUGCLASSRESISTANCE: {
        label: 'Drug Class Resistance',
        description: 'Identifies drug-class-specific resistance mechanisms.',
        icon: 'gene',
    },
    MMHIGHRISKGENE: {
        label: 'Genomic Resistance Driver',
        description: 'Identifies high-risk gene mutations linked to treatment resistance.',
        icon: 'gene',
    },
};

const RISK_DISPLAY = {
    HIGH: { label: 'High Risk', color: 'error' },
    MEDIUM: { label: 'Moderate Risk', color: 'warning' },
    LOW: { label: 'Low Risk', color: 'success' },
    NOT_APPLICABLE: { label: 'Pre-Treatment', color: 'default' },
};

/**
 * Normalize a signal object from either backend format:
 *  - Legacy: { signaltype, mechanismbreakdown, escapedpathways, ... }
 *  - V2:     { signal_type, mechanism_breakdown, escaped_pathways, ... }
 */
function normalizeSignal(raw) {
    if (!raw) return null;
    return {
        signal_type: raw.signal_type || raw.signaltype || null,
        detected: raw.detected ?? false,
        probability: raw.probability ?? 0,
        confidence: raw.confidence ?? 0,
        rationale: raw.rationale || '',
        mechanism_breakdown: raw.mechanism_breakdown || raw.mechanismbreakdown || null,
        escaped_pathways: raw.escaped_pathways || raw.escapedpathways || null,
        mechanism_alignment: raw.mechanism_alignment || raw.mechanismalignment || null,
        provenance: raw.provenance || {},
    };
}

function getSignalIcon(signalType, detected) {
    const meta = SIGNAL_META[signalType];
    const iconType = meta?.icon || 'default';
    const color = detected ? 'error' : 'action';

    switch (iconType) {
        case 'restore': return <TrendingUpIcon color={color} />;
        case 'escape': return <TrendingDownIcon color={color} />;
        case 'kinetics': return <TimelineIcon color={color} />;
        case 'gene': return <BiotechIcon color={color} />;
        default: return <ScienceIcon color={color} />;
    }
}


const SignalRow = ({ signal: rawSignal }) => {
    const [expanded, setExpanded] = useState(false);
    const signal = normalizeSignal(rawSignal);

    if (!signal) return null;

    const {
        signal_type,
        detected,
        probability,
        confidence,
        rationale,
        mechanism_breakdown
    } = signal;

    const meta = SIGNAL_META[signal_type] || {};
    const displayLabel = meta.label || (signal_type ? signal_type.replace(/_/g, ' ') : 'Unknown Signal');
    const displayDesc = meta.description || '';

    const severityColor = detected ? 'error' : 'success';
    const severityLabel = detected ? 'DETECTED' : 'NOT DETECTED';

    return (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getSignalIcon(signal_type, detected)}
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {displayLabel}
                        </Typography>
                        {displayDesc && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 400 }}>
                                {displayDesc}
                            </Typography>
                        )}
                    </Box>
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
                        <Typography variant="caption" fontWeight="bold">{((probability || 0) * 100).toFixed(0)}%</Typography>
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
                        <Typography variant="caption" fontWeight="bold">{((confidence || 0) * 100).toFixed(0)}%</Typography>
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
                                    <Typography variant="caption" color="text.secondary">{(key || '').replace(/_/g, ' ')}</Typography>
                                    <Typography variant="caption" fontWeight="bold">{typeof val === 'number' ? val.toFixed(3) : String(val)}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

const ResistanceProphetCard = ({ resistance_prediction: initialPrediction }) => {
    const [prediction, setPrediction] = useState(initialPrediction);
    const [isSimulating, setIsSimulating] = useState(false);

    // Simulation Controls
    const [simulateMBD4, setSimulateMBD4] = useState(false);
    const [simulateHRD, setSimulateHRD] = useState(42);
    const [isPlatinum, setIsPlatinum] = useState(true);

    if (!prediction && !initialPrediction) return null;

    const currentData = prediction || initialPrediction;

    // Normalize top-level keys (backend may send concatenated OR snake_case)
    const risk_level = currentData.risk_level || currentData.risklevel || 'NOT_APPLICABLE';
    const integrated_confidence = currentData.integrated_confidence || currentData.confidence || null;
    const signals_detected = currentData.signals_detected || currentData.signalsdetected || [];
    const baseline_penalty = currentData.baseline_penalty_applied || currentData.baselinepenaltyapplied || false;
    const baseline_source = currentData.baseline_source || currentData.baselinesource || '';

    const riskDisplay = RISK_DISPLAY[risk_level] || RISK_DISPLAY.NOT_APPLICABLE;

    const runSimulation = async () => {
        setIsSimulating(true);
        try {
            const response = await fetch(`${API_ROOT}/api/ayesha/resistance/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    simulate_germline: simulateMBD4 ? 'positive' : 'negative',
                    simulate_hrd: simulateHRD,
                    simulate_treatment: isPlatinum ? ['carboplatin'] : ['olaparib'],
                    patient_id: 'AYESHA_SIM'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPrediction(data.prediction);
            }
        } catch (err) {
            console.error("Simulation failed", err);
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3, borderLeft: '6px solid', borderColor: `${riskDisplay.color}.main` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color={riskDisplay.color} />
                    <Typography variant="h6">Resistance Prophet {prediction !== initialPrediction ? "(SIMULATED)" : "(AI Projection)"}</Typography>
                </Box>
                <Chip
                    label={riskDisplay.label}
                    color={riskDisplay.color}
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            {baseline_penalty && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Baseline Penalty Applied ({baseline_source}). Confidence reduced due to lack of patient-specific historical baseline.
                </Alert>
            )}

            {signals_detected.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No resistance signals detected. This patient is pre-treatment or no signals are currently active.
                </Alert>
            ) : (
                signals_detected.map((signal, idx) => (
                    <SignalRow key={idx} signal={signal} />
                ))
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">Integrated Confidence:</Typography>
                <Chip
                    label={integrated_confidence ? `${(integrated_confidence * 100).toFixed(0)}%` : 'N/A'}
                    size="small"
                    variant="outlined"
                />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* GLASS BOX SIMULATION CONTROLS */}
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ScienceIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight="bold">Resistance Lab (Glass Box)</Typography>
                </Box>

                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControlLabel
                            control={<Switch checked={simulateMBD4} onChange={(e) => setSimulateMBD4(e.target.checked)} />}
                            label="Simulate MBD4 Loss"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography variant="caption">HRD Score: {simulateHRD}</Typography>
                        <Slider
                            value={simulateHRD}
                            min={0} max={100}
                            onChange={(e, v) => setSimulateHRD(v)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControlLabel
                            control={<Switch checked={!isPlatinum} onChange={(e) => setIsPlatinum(!e.target.checked)} />}
                            label="On PARPi Maintenance"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={runSimulation}
                            disabled={isSimulating}
                        >
                            {isSimulating ? "Calculating..." : "Run Simulation"}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default ResistanceProphetCard;
