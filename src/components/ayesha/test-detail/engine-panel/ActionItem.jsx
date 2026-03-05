/**
 * ActionItem — "What Needs Checking" prioritized action card
 *
 * Displays a recommended test with priority badge and unlock description.
 * Colors: HIGH=red, MEDIUM=amber, LOW=blue.
 *
 * Source: ENGINE_LIGHT_DASHBOARD.mdc §7 Layer 3
 */
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const PRIORITY_COLORS = {
    HIGH: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
    MEDIUM: { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
    LOW: { bg: '#f0f9ff', border: '#bfdbfe', color: '#1d4ed8' },
};

export default function ActionItem({ action }) {
    const pc = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.MEDIUM;

    return (
        <Box sx={{
            p: 2, borderRadius: 2,
            bgcolor: pc.bg,
            border: `1px solid ${pc.border}`,
            display: 'flex', alignItems: 'flex-start', gap: 1.5,
        }}>
            <Typography sx={{ fontSize: '1.15rem' }}>{action.icon}</Typography>
            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                        {action.label}
                    </Typography>
                    <Chip label={action.priority} size="small" sx={{
                        fontWeight: 700, fontSize: 'var(--text-xs)', height: 20,
                        bgcolor: pc.color + '15', color: pc.color,
                    }} />
                </Box>
                <Typography sx={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, mt: 0.25 }}>
                    Unlocks: {action.unlocks}
                </Typography>
            </Box>
        </Box>
    );
}
