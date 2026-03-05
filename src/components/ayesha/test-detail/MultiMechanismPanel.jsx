/**
 * MultiMechanismPanel — Lists all active resistance classes ordered by severity.
 * Based on policy.py L472-487 RESISTANCE_CLASS_PRIORITY.
 *
 * Props:
 *   resistanceClasses — Array of { class_name, severity, signals, description }
 */
import React from 'react';
import { Box, Typography, Paper, Chip, LinearProgress } from '@mui/material';
import { Shield } from '@mui/icons-material';

const SEVERITY_COLORS = {
    critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    high: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    moderate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    low: { color: '#65a30d', bg: '#f7fee7', border: '#d9f99d' },
};

export default function MultiMechanismPanel({ resistanceClasses = [] }) {
    if (resistanceClasses.length === 0) return null;

    return (
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Shield sx={{ color: '#dc2626', fontSize: 22 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                    Active Resistance Mechanisms ({resistanceClasses.length})
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {resistanceClasses.map((rc, i) => {
                    const sev = SEVERITY_COLORS[rc.severity] || SEVERITY_COLORS.moderate;
                    return (
                        <Box key={i} sx={{
                            p: 2, borderRadius: 2,
                            bgcolor: sev.bg,
                            border: `1.5px solid ${sev.border}`,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: sev.color, fontSize: '0.88rem' }}>
                                    {rc.class_name}
                                </Typography>
                                <Chip
                                    label={rc.severity}
                                    size="small"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 'var(--text-xs)',
                                        textTransform: 'uppercase',
                                        bgcolor: sev.color + '18',
                                        color: sev.color,
                                        height: 24,
                                        px: 1,
                                    }}
                                />
                            </Box>
                            {rc.description && (
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, mb: 1, fontWeight: 500 }}>
                                    {rc.description}
                                </Typography>
                            )}
                            {rc.signals?.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {rc.signals.map((sig, j) => (
                                        <Chip key={j} label={sig} size="small" variant="outlined"
                                            sx={{ fontWeight: 700, fontSize: 'var(--text-xs)', height: 24, px: 0.5 }} />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}
