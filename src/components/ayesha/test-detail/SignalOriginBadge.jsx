/**
 * SignalOriginBadge — Shows whether a Kill Chain signal is ACTIVE or BASELINE.
 * Based on models.py L89-101 BASELINE_SIGNALS/ACTIVE_SIGNALS frozensets.
 *
 * ACTIVE signals (red pulse): Currently firing, temporal change detected.
 * BASELINE signals (grey static): Present at intake, inform prior probability.
 *
 * Props:
 *   signalType — 'ACTIVE' | 'BASELINE'
 *   signalName — Display name of the signal
 *   compact    — If true, render as inline chip only
 */
import React from 'react';
import { Chip } from '@mui/material';

const SIGNAL_STYLES = {
    ACTIVE: {
        bgcolor: '#fef2f2',
        color: '#dc2626',
        borderColor: '#fecaca',
        emoji: '🔴',
        animation: 'signalPulse 2s infinite',
    },
    BASELINE: {
        bgcolor: '#f8fafc',
        color: '#64748b',
        borderColor: '#e2e8f0',
        emoji: '⚪',
        animation: 'none',
    },
};

export default function SignalOriginBadge({ signalType = 'BASELINE', signalName, compact = false }) {
    const style = SIGNAL_STYLES[signalType] || SIGNAL_STYLES.BASELINE;

    return (
        <Chip
            label={compact ? `${style.emoji} ${signalType}` : `${style.emoji} ${signalName || signalType}`}
            size="small"
            sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                bgcolor: style.bgcolor,
                color: style.color,
                border: `1.5px solid ${style.borderColor}`,
                animation: style.animation,
                '@keyframes signalPulse': {
                    '0%, 100%': { opacity: 1, boxShadow: `0 0 0 0 ${style.color}40` },
                    '50%': { opacity: 0.8, boxShadow: `0 0 8px 2px ${style.color}30` },
                },
            }}
        />
    );
}
