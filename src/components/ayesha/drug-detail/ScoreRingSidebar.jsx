/**
 * ScoreRingSidebar — Animated SVG match score ring for the drug detail sidebar.
 *
 * Reads: drug.efficacy_score | drug.final_score, drug.confidence
 * No hardcoded values — all derived from the drug object.
 */
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { pct } from './explainers';

export default function ScoreRingSidebar({ drug }) {
    if (!drug) return null;

    const score = drug.efficacy_score ?? drug.final_score ?? null;
    const confidence = drug.confidence ?? null;
    const scoreValue = score != null ? Math.round(score * 100) : 0;

    const r = 44;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (circumference * scoreValue) / 100;

    let color = '#ef4444';
    if (scoreValue >= 70) color = '#22c55e';
    else if (scoreValue >= 50) color = '#f59e0b';
    else if (scoreValue >= 30) color = '#f97316';

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, fontSize: '0.9rem' }}>
                Match Score
            </Typography>

            <Box sx={{ position: 'relative', display: 'inline-block', width: 120, height: 120 }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle
                        cx="60" cy="60" r={r} fill="none"
                        stroke={color} strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '2rem', color }}>
                        {scoreValue}%
                    </Typography>
                </Box>
            </Box>

            {confidence != null && (
                <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        Confidence: <strong>{pct(confidence)}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Based on available data completeness
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}
