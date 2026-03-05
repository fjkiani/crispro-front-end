/**
 * StateIndicator — Kill Chain 2-of-N state machine display
 *
 * Shows current estimated state: BASELINE / MONITORING / RESISTANCE_DETECTED
 * with confidence badge and description.
 *
 * Source: ENGINE_LIGHT_DASHBOARD.mdc §6, §7 Layer 3
 */
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { RadioButtonChecked } from '@mui/icons-material';

export default function StateIndicator({ summary }) {
    const stateConfig = {
        BASELINE: { color: '#64748b', label: 'Baseline', desc: 'No resistance signals detected' },
        MONITORING: { color: '#d97706', label: 'Monitoring', desc: summary.intake_risk ? 'Intake risk flag — ≥2 baseline signals' : 'Watching — 1 signal active' },
        RESISTANCE_DETECTED: { color: '#dc2626', label: 'Resistance Detected', desc: '≥2 signals fired (at least 1 active)' },
    };
    const sc = stateConfig[summary.state_estimate] || stateConfig.BASELINE;

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 2, borderRadius: 2,
            bgcolor: sc.color + '10',
            border: `1.5px solid ${sc.color}30`,
        }}>
            <RadioButtonChecked sx={{ fontSize: 22, color: sc.color }} />
            <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 'var(--text-base)', color: sc.color }}>
                    State: {sc.label}
                </Typography>
                <Typography sx={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {sc.desc}
                </Typography>
            </Box>
            {summary.confidence && (
                <Chip label={summary.confidence} size="small" sx={{
                    ml: 'auto', fontWeight: 700, fontSize: 'var(--text-xs)', height: 22,
                    bgcolor: sc.color + '18', color: sc.color,
                }} />
            )}
        </Box>
    );
}
