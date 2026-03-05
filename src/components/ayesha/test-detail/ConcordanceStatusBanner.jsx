/**
 * ConcordanceStatusBanner — Shows CONCORDANT/DISCORDANT status.
 * Based on policy.py L635-657 _resolve_conflicts().
 *
 * Props:
 *   concordanceStatus — 'CONCORDANT' | 'DISCORDANT' | null
 *   conflictDetails   — Optional array of { axis, sources, disagreement }
 */
import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';

const STATUS_CONFIG = {
    CONCORDANT: {
        Icon: CheckCircle,
        color: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
        label: 'Concordant',
        message: 'All active signals agree. No conflicting resistance evidence detected.',
    },
    DISCORDANT: {
        Icon: Warning,
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        label: 'Discordant',
        message: 'Active signals show conflicting resistance evidence. Review individual axes.',
    },
};

export default function ConcordanceStatusBanner({ concordanceStatus, conflictDetails = [] }) {
    if (!concordanceStatus) return null;

    const config = STATUS_CONFIG[concordanceStatus] || STATUS_CONFIG.DISCORDANT;
    const { Icon } = config;

    return (
        <Paper sx={{
            p: 2.5, borderRadius: 2.5,
            bgcolor: config.bg,
            border: `1.5px solid ${config.border}`,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: conflictDetails.length > 0 ? 1.5 : 0 }}>
                <Icon sx={{ color: config.color, fontSize: 24 }} />
                <Box sx={{ flex: 1 }}>
                    <Chip
                        label={config.label}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: config.color + '18', color: config.color, border: `1.5px solid ${config.color}`, mb: 0.5 }}
                    />
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {config.message}
                    </Typography>
                </Box>
            </Box>

            {conflictDetails.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {conflictDetails.map((conflict, i) => (
                        <Box key={i} sx={{
                            p: 1.5, borderRadius: 1.5,
                            bgcolor: 'rgba(255,255,255,0.6)',
                            border: '1px solid',
                            borderColor: config.border,
                        }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: config.color, textTransform: 'uppercase' }}>
                                Axis: {conflict.axis}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#334155' }}>
                                {conflict.disagreement}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Paper>
    );
}
