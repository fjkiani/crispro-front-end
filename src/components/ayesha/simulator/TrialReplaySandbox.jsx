import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Grid, Slider, Paper, Button, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Chip, Stack, Tooltip
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import FlagIcon from '@mui/icons-material/Flag';
import RadarIcon from '@mui/icons-material/Radar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AXES = [
    { id: "ddr", label: "DDR", color: "#3b82f6" },
    { id: "mapk", label: "MAPK", color: "#f59e0b" },
    { id: "pi3k", label: "PI3K", color: "#10b981" },
    { id: "vegf", label: "VEGF", color: "#8b5cf6" },
    { id: "her2", label: "HER2", color: "#ec4899" },
    { id: "io", label: "IO", color: "#14b8a6" },
    { id: "efflux", label: "Efflux", color: "#f43f5e" },
    { id: "rss", label: "Replication Stress", color: "#facc15" }
];

const PRESETS = [
    {
        name: "LATIFY (STK11-loss)",
        drug: "Ceralasertib/Durva",
        nct_id: "NCT05450692",
        vector: { ddr: 0.85, mapk: 0.1, pi3k: 0.0, vegf: 0.0, her2: 0.0, io: 0.75, efflux: 0.0, rss: 0.75 },
        desc: "STK11-loss yields high IO & RSS. Target drops when IO falls below 0.3."
    },
    {
        name: "Adavosertib (PTEN-loss)",
        drug: "WEE1i",
        nct_id: "NCT03579316",
        vector: { ddr: 0.80, mapk: 0.1, pi3k: 0.0, vegf: 0.0, her2: 0.0, io: 0.20, efflux: 0.1, rss: 0.80 },
        desc: "PTEN-loss (PI3K active) bypasses WEE1. Push PI3K > 0.6 to simulate failure."
    },
    {
        name: "Berzosertib (RS-Low)",
        drug: "ATRi + Gemcitabine",
        nct_id: "NCT02595892",
        vector: { ddr: 0.75, mapk: 0.1, pi3k: 0.1, vegf: 0.0, her2: 0.0, io: 0.20, efflux: 0.1, rss: 0.20 },
        desc: "Target ranks highest for RS-Low patients. Push RSS > 0.8 (CCNE1-amp) to see rank collapse."
    },
    {
        name: "CAPRI (Efflux)",
        drug: "Cera + Olaparib",
        nct_id: "NCT02264678",
        vector: { ddr: 0.80, mapk: 0.1, pi3k: 0.1, vegf: 0.0, her2: 0.0, io: 0.10, efflux: 0.1, rss: 0.50 },
        desc: "Post-PARPi efflux resistance. Push Efflux > 0.8 to simulate MDR1 overexpression."
    }
];

export default function TrialReplaySandbox() {
    const [vector, setVector] = useState(PRESETS[0].vector);
    const [targetId, setTargetId] = useState(PRESETS[0].nct_id);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce API calls to prevent flooding
    useEffect(() => {
        const timer = setTimeout(() => {
            runSimulation();
        }, 300);
        return () => clearTimeout(timer);
    }, [vector, targetId]);

    const runSimulation = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/trials/simulator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_vector: vector,
                    target_nct_id: targetId,
                    top_k: 10
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSliderChange = (axisId, newValue) => {
        setVector(prev => ({ ...prev, [axisId]: newValue }));
    };

    const handlePresetSelect = (preset) => {
        setVector(preset.vector);
        setTargetId(preset.nct_id);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', color: '#e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ScienceIcon sx={{ color: '#ec4899', fontSize: 32, mr: 1.5 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
                        Agentic Trial Failure Analyzer
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Mathematical Proof Sandbox — Adjust vectors to see trial alignment collapse in real-time.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column: Sliders & Presets */}
                <Grid item xs={12} md={5}>
                    {/* Presets */}
                    <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
                        <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                            Published Failure Targets (Snap Lock)
                        </Typography>
                        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                            {PRESETS.map(preset => (
                                <Box
                                    key={preset.nct_id}
                                    onClick={() => handlePresetSelect(preset)}
                                    sx={{
                                        p: 1.5,
                                        bgcolor: targetId === preset.nct_id ? 'rgba(56, 189, 248, 0.1)' : '#0f172a',
                                        border: targetId === preset.nct_id ? '1px solid #38bdf8' : '1px solid #334155',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: '#38bdf8' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ color: '#e0f2fe', fontWeight: 700 }}>
                                            {preset.name}
                                        </Typography>
                                        <Chip size="small" label={preset.nct_id} sx={{ bgcolor: '#0ea5e9', color: '#fff', height: 20, fontSize: '0.65rem' }} />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                        {preset.drug}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontStyle: 'italic', mt: 0.5, display: 'block' }}>
                                        {preset.desc}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Sliders */}
                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <RadarIcon sx={{ color: '#38bdf8', mr: 1 }} />
                            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                                8D Patient Vector
                            </Typography>
                        </Box>

                        <Stack spacing={2.5}>
                            {AXES.map(axis => (
                                <Box key={axis.id}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: -1 }}>
                                        <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                                            {axis.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: axis.color, fontWeight: 800, fontFamily: 'monospace' }}>
                                            {vector[axis.id].toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Slider
                                        size="small"
                                        value={vector[axis.id]}
                                        min={0.0}
                                        max={1.0}
                                        step={0.05}
                                        onChange={(_, val) => handleSliderChange(axis.id, val)}
                                        sx={{ color: axis.color }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Column: Results Leaderboard */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ p: 0, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2.5, bgcolor: '#0f172a', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                                Cosine Similarity Leaderboard
                            </Typography>
                            {loading && <CircularProgress size={20} sx={{ color: '#38bdf8' }} />}
                        </Box>

                        {/* Target Insight Panel */}
                        {results?.target_trial && (
                            <Box sx={{ p: 2.5, bgcolor: 'rgba(56, 189, 248, 0.05)', borderBottom: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                <Typography variant="overline" sx={{ color: '#38bdf8', fontWeight: 700 }}>
                                    Target Telemetry: {results.target_trial.nct_id}
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                    <Grid item xs={4}>
                                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#0f172a', border: '1px solid #334155', borderRadius: 1, textAlign: 'center' }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Absolute Rank</Typography>
                                            <Typography variant="h4" sx={{ color: results.target_trial.rank <= 10 ? '#10b981' : '#f43f5e', fontWeight: 800 }}>
                                                #{results.target_trial.rank}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#0f172a', border: '1px solid #334155', borderRadius: 1, textAlign: 'center' }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Alignment Score</Typography>
                                            <Typography variant="h4" sx={{ color: '#e2e8f0', fontWeight: 800 }}>
                                                {results.target_trial.score.toFixed(3)}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#0f172a', border: '1px solid #334155', borderRadius: 1, textAlign: 'center' }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Delta to #1</Typography>
                                            <Typography variant="h4" sx={{ color: '#e2e8f0', fontWeight: 800 }}>
                                                {results.delta_to_top !== null ? `-${results.delta_to_top.toFixed(3)}` : '0.000'}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ '& th': { borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 700 } }}>
                                            <TableCell>Rank</TableCell>
                                            <TableCell>Score</TableCell>
                                            <TableCell>NCT ID</TableCell>
                                            <TableCell>Title</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {results?.top_trials?.map((trial) => (
                                            <TableRow
                                                key={trial.nct_id}
                                                sx={{
                                                    '& td': { borderBottom: '1px solid #334155', color: '#cbd5e1' },
                                                    bgcolor: trial.is_target ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                                    '&:hover': { bgcolor: '#0f172a' }
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 800, color: trial.rank <= 3 ? '#10b981' : '#cbd5e1' }}>
                                                    #{trial.rank}
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                                    {trial.score.toFixed(3)}
                                                </TableCell>
                                                <TableCell>
                                                    {trial.is_target ? (
                                                        <Chip size="small" label={trial.nct_id} sx={{ bgcolor: '#0ea5e9', color: '#fff', height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: '#38bdf8' }}>{trial.nct_id}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {trial.title}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!results || results.top_trials.length === 0) && !loading && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#64748b' }}>
                                                    No simulation data. Adjust vectors to recalculate.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        {results && (
                            <Box sx={{ p: 1.5, borderTop: '1px solid #334155', bgcolor: '#0f172a', textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    Simulated across {results.total_scored} live trials. Mathematical proof engine engaged.
                                </Typography>
                            </Box>
                        )}

                        {error && (
                            <Box sx={{ p: 2, bgcolor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderTop: '1px solid #f43f5e' }}>
                                <Typography variant="body2">{error}</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
