import React from 'react';
import { Box, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { CheckCircle, Warning, Info } from '@mui/icons-material';

const TruthTable = ({ levelData, level }) => {
    if (!levelData) return null;

    const { inputs_used, completeness, is_preview, effective_assembly } = levelData;
    const { mutations, tumor_context } = inputs_used;
    const missingFields = completeness?.missing || [];

    // Helper to render values with provenance color
    const ValueCell = ({ value, isSimulated }) => (
        <Typography
            variant="body2"
            sx={{
                fontFamily: 'monospace',
                color: isSimulated ? '#f6e05e' : '#68d391', // Yellow for Sim, Green for Real
                fontWeight: isSimulated ? 700 : 400
            }}
        >
            {value}
            {isSimulated && <span style={{ opacity: 0.5, fontSize: '0.7em', marginLeft: 6 }}>(SIM)</span>}
        </Typography>
    );

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ pb: 1, borderBottom: '1px solid #2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                    2. TRUTH TABLE ({level})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* 1. Baseline Identity Chip (New) */}
                    <Chip
                        label="BASELINE: PATIENT-SPECIFIC (MBD4)"
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#276749', color: '#9ae6b4', fontWeight: 700, border: '1px solid #48bb78' }}
                    />
                    <Chip
                        label={effective_assembly || "Unknown Build"}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem', borderColor: '#4a5568', color: '#718096' }}
                    />
                </Box>
            </Box>

            {/* 2. Simulation Watermark (New) */}
            {is_preview && (
                <Box sx={{ bgcolor: '#744210', color: '#f6e05e', p: 1, borderRadius: 1, textAlign: 'center', border: '1px dashed #d69e2e' }}>
                    <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Warning sx={{ fontSize: 16 }} /> SIMULATION MODE: DATA IS INFERRED
                    </Typography>
                </Box>
            )}

            {/* Completion Score Header */}
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#1a202c', borderColor: '#2d3748', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <Typography variant="h4" fontWeight={700} color={is_preview ? '#f6e05e' : '#4fd1c5'}>
                        {Math.round((completeness?.completeness_score || 0) * 100)}%
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" display="block" color="text.secondary" lineHeight={1}>
                        DATA COMPLETENESS
                    </Typography>
                    <Typography variant="caption" color={is_preview ? '#f6e05e' : '#a0aec0'}>
                        {is_preview ? 'SCENARIO AUGMENTED' : 'CLINICAL REALITY'}
                    </Typography>
                </Box>
            </Paper>

            {/* Inputs Table */}
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: '1px solid #2d3748' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#718096', fontSize: '0.7rem' }}>PARAM</TableCell>
                            <TableCell sx={{ color: '#718096', fontSize: '0.7rem' }}>VALUE</TableCell>
                            <TableCell align="right" sx={{ color: '#718096', fontSize: '0.7rem' }}>SOURCE</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Mutations */}
                        {mutations.map((m, idx) => (
                            <TableRow key={idx} sx={{ '& td': { borderBottom: '1px solid #2d3748' } }}>
                                <TableCell>
                                    <Typography variant="body2" color="#fff" fontWeight={600}>{m.gene}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">{m.hgvs_p || m.consequence}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={m.classification || "Somatic"}
                                        size="small"
                                        sx={{ height: 20, fontSize: '0.65rem', bgcolor: m.classification === 'pathogenic' ? '#e53e3e' : '#4a5568' }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <ValueCell value={m.data_origin === 'scenario_inferred' ? 'Inferred' : 'NGS'} isSimulated={m.data_origin === 'scenario_inferred'} />
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Tumor Context */}
                        <TableRow>
                            <TableCell sx={{ color: '#a0aec0' }}>HRD Score</TableCell>
                            <TableCell><ValueCell value={tumor_context.hrd_score || "N/A"} isSimulated={is_preview} /></TableCell>
                            <TableCell align="right"><Typography variant="caption" color="text.secondary">{tumor_context.hrd_status}</Typography></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ color: '#a0aec0' }}>TMB</TableCell>
                            <TableCell><ValueCell value={tumor_context.tmb || "N/A"} isSimulated={is_preview} /></TableCell>
                            <TableCell align="right"><Typography variant="caption" color="text.secondary">{tumor_context.tmb_status}</Typography></TableCell>
                        </TableRow>
                        {tumor_context.ca125_value && (
                            <TableRow>
                                <TableCell sx={{ color: '#a0aec0' }}>CA-125</TableCell>
                                <TableCell><ValueCell value={`${tumor_context.ca125_value} ${tumor_context.ca125_units || ''}`} isSimulated={is_preview} /></TableCell>
                                <TableCell align="right"><Typography variant="caption" color="text.secondary">Serum</Typography></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Missing Warnings */}
            {missingFields.length > 0 && (
                <Box sx={{ p: 1, border: '1px dashed #e53e3e', borderRadius: 1, bgcolor: 'rgba(229, 62, 62, 0.05)' }}>
                    <Typography variant="caption" color="#fc8181" display="flex" alignItems="center" gap={1}>
                        <Warning sx={{ fontSize: 16 }} /> MISSING DATA:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2, color: '#feb2b2', fontSize: '0.7rem' }}>
                        {missingFields.slice(0, 3).map((f) => <li key={f}>{f}</li>)}
                        {missingFields.length > 3 && <li>...and {missingFields.length - 3} more</li>}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default TruthTable;
