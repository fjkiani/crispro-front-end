/**
 * TriggerFeedStrip
 *
 * Renders active clinical trigger alerts from TriggerEngine output.
 * Reads simulationResult.trigger_events[] if present.
 * Shows inline in ResistanceLab header zone.
 *
 * Does NOT call any API — purely reads what the simulate endpoint returns.
 */
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
    WarningAmber,
    CheckCircleOutline,
    NotificationsActive,
} from '@mui/icons-material';

const SEVERITY_CONFIG = {
    HIGH: { color: '#c62828', bgColor: '#2d1515', icon: <WarningAmber sx={{ fontSize: 14 }} />, chipColor: 'error' },
    MEDIUM: { color: '#f57c00', bgColor: '#2d1e0f', icon: <NotificationsActive sx={{ fontSize: 14 }} />, chipColor: 'warning' },
    LOW: { color: '#2e7d32', bgColor: '#0f2d1a', icon: <CheckCircleOutline sx={{ fontSize: 14 }} />, chipColor: 'success' },
};

// Translate internal trigger IDs into patient-facing messages
const TRIGGER_LABELS = {
    resistance_detected: {
        title: 'Resistance Signal Detected',
        plain: 'Your CA-125 has risen above baseline. The system has re-analyzed your resistance profile and is suggesting alternative strategies.',
        action: 'Alternative therapies updated below',
    },
    hrd_score_received: {
        title: 'HRD Test Result Received',
        plain: 'A new HRD score is available. PARP inhibitor eligibility has been recalculated.',
        action: 'PARP sensitivity score updated',
    },
    tmb_high_detected: {
        title: 'High Tumor Mutation Burden',
        plain: 'Your tumor has a high number of mutations (TMB-high), which may make you a better candidate for immunotherapy.',
        action: 'IO eligibility updated',
    },
    ngs_results_received: {
        title: 'New Genomic Results',
        plain: 'New sequencing results are available. Biomarkers and predictions have been recalculated.',
        action: 'All scores recalculated',
    },
};

const TriggerAlert = ({ event }) => {
    const label = TRIGGER_LABELS[event.trigger_id] || {
        title: event.trigger_id?.replace(/_/g, ' ') || 'Event Detected',
        plain: event.message || 'An event was detected and the system has responded.',
        action: null,
    };
    const severity = event.severity || 'MEDIUM';
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.MEDIUM;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                px: 1.5,
                py: 1,
                bgcolor: config.bgColor,
                border: `1px solid ${config.color}30`,
                borderRadius: 1,
                mb: 0.75,
            }}
        >
            <Box sx={{ color: config.color, mt: 0.2 }}>{config.icon}</Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: config.color, fontWeight: 700, display: 'block' }}>
                    {label.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#a0aec0', display: 'block', lineHeight: 1.5 }}>
                    {label.plain}
                </Typography>
                {label.action && (
                    <Typography variant="caption" sx={{ color: '#4a5568', fontStyle: 'italic', display: 'block' }}>
                        → {label.action}
                    </Typography>
                )}
            </Box>
            <Chip
                label={severity}
                size="small"
                color={config.chipColor}
                variant="outlined"
                sx={{ fontSize: '0.6rem', height: 18, alignSelf: 'flex-start' }}
            />
        </Box>
    );
};

const TriggerFeedStrip = ({ triggerEvents = [] }) => {
    if (!triggerEvents || triggerEvents.length === 0) return null;

    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant="overline"
                sx={{ color: '#4a5568', letterSpacing: 2, fontSize: '0.65rem', display: 'block', mb: 1 }}
            >
                ⚡ Active Clinical Alerts
            </Typography>
            {triggerEvents.map((event, i) => (
                <TriggerAlert key={event.trigger_id || i} event={event} />
            ))}
        </Box>
    );
};

export default TriggerFeedStrip;
