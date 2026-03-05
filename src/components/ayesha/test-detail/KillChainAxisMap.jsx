/**
 * KillChainAxisMap — Visual 7D vector axis map.
 * Shows which Kill Chain axes this test feeds.
 *
 * The 7 axes (verified against vectors.py BASE_STRIKE_VECTOR):
 *   ddr, mapk, pi3k, vegf, her2, io, efflux
 *
 * Props:
 *   axes — Array of active axis strings from clinicalTestRegistry entry
 */
import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { Radar } from '@mui/icons-material';
import { VALID_AXES } from '../../../constants/clinicalTestRegistry';

const AXIS_META = {
    ddr: { label: 'DDR', full: 'DNA Damage Response', color: '#dc2626' },
    mapk: { label: 'MAPK', full: 'MAP Kinase / RAS-RAF-MEK', color: '#ea580c' },
    pi3k: { label: 'PI3K', full: 'PI3K-AKT-mTOR', color: '#d97706' },
    vegf: { label: 'VEGF', full: 'Angiogenesis / VEGF', color: '#059669' },
    her2: { label: 'HER2', full: 'HER2 / ERBB2', color: '#7c3aed' },
    io: { label: 'IO', full: 'Immuno-Oncology', color: '#2563eb' },
    efflux: { label: 'Efflux', full: 'Drug Efflux / MDR', color: '#64748b' },
};

export default function KillChainAxisMap({ axes = [] }) {
    const activeSet = new Set(axes);

    return (
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Radar sx={{ color: '#0f172a', fontSize: 22 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                    Kill Chain Axis Map (7D Vector)
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {VALID_AXES.map(axis => {
                    const meta = AXIS_META[axis];
                    const isActive = activeSet.has(axis);

                    return (
                        <Tooltip key={axis} title={meta.full} arrow>
                            <Box sx={{
                                px: 1.5, py: 0.8,
                                borderRadius: 2,
                                border: '2px solid',
                                borderColor: isActive ? meta.color : '#e2e8f0',
                                bgcolor: isActive ? meta.color + '15' : '#f8fafc',
                                cursor: 'help',
                                transition: 'all 0.2s ease',
                                ...(isActive && {
                                    boxShadow: `0 0 8px ${meta.color}30`,
                                }),
                            }}>
                                <Typography sx={{
                                    fontWeight: isActive ? 800 : 500,
                                    fontSize: '0.78rem',
                                    color: isActive ? meta.color : '#94a3b8',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}>
                                    {meta.label}
                                </Typography>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>

            {axes.length === 0 && (
                <Typography variant="body2" sx={{ mt: 1.5, color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    This test does not directly feed any Kill Chain axes.
                </Typography>
            )}

            {axes.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1.5, color: '#64748b', fontSize: '0.78rem' }}>
                    {axes.length} of 7 axes active — highlighted axes receive vector deltas when this signal fires.
                </Typography>
            )}
        </Paper>
    );
}
