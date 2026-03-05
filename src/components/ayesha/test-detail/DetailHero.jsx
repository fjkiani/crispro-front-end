/**
 * DetailHero — Hero section for Test & Monitoring detail pages.
 * Cloned from DrugHero, adapted for clinicalTestRegistry schema.
 *
 * Props:
 *   entry     — A clinicalTestRegistry entry object
 *   onBack    — Back navigation handler
 *   backLabel — Label for back button (default: "Back to Tests")
 */
import React from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { ArrowBack, Science, MonitorHeart } from '@mui/icons-material';
import { BADGE_MAP } from '../../../constants/clinicalTestRegistry';

const PRIORITY_COLORS = {
    HIGH: { bg: '#fef2f2', fg: '#991b1b' },
    MEDIUM: { bg: '#fffbeb', fg: '#92400e' },
    LOW: { bg: '#f0fdf4', fg: '#166534' },
};

export default function DetailHero({ entry, onBack, backLabel = 'Back to Tests' }) {
    if (!entry) return null;

    const badge = BADGE_MAP[entry.validation?.status] || BADGE_MAP.UNVERIFIED;
    const pc = PRIORITY_COLORS[entry.priority] || PRIORITY_COLORS.MEDIUM;
    const TypeIcon = entry.type === 'monitoring' ? MonitorHeart : Science;

    return (
        <>
            <Button
                startIcon={<ArrowBack />}
                size="small"
                onClick={onBack}
                sx={{ fontWeight: 600, mb: 2 }}
            >
                {backLabel}
            </Button>

            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                {/* Badge row */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                        label={entry.type === 'monitoring' ? 'Monitoring' : 'Test'}
                        size="small"
                        icon={<TypeIcon sx={{ fontSize: 16 }} />}
                        sx={{ fontWeight: 700 }}
                    />
                    <Chip
                        label={entry.priority}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: pc.bg, color: pc.fg }}
                    />
                    <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                            fontWeight: 800,
                            bgcolor: badge.color + '20',
                            color: badge.color,
                            border: `1.5px solid ${badge.color}`,
                        }}
                    />
                    {entry.signal_type && (
                        <Chip
                            label={entry.signal_type}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontWeight: 700,
                                borderColor: entry.signal_type === 'ACTIVE' ? '#ef4444' : '#94a3b8',
                                color: entry.signal_type === 'ACTIVE' ? '#ef4444' : '#64748b',
                                ...(entry.signal_type === 'ACTIVE' && {
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.6 },
                                    },
                                }),
                            }}
                        />
                    )}
                </Box>

                {/* Name */}
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '1.6rem', md: '2rem' } }}>
                    {entry.name}
                </Typography>

                {/* Short description */}
                <Typography variant="body1" sx={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.7 }}>
                    {entry.short_desc}
                </Typography>

                {/* Validation context */}
                {entry.validation?.caveats && (
                    <Box sx={{
                        mt: 2.5, p: 2, borderRadius: 2,
                        bgcolor: badge.color + '08',
                        border: `1px solid ${badge.color}30`,
                    }}>
                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.6 }}>
                            <strong>Validation:</strong> {entry.validation.caveats}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </>
    );
}
