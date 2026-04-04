/**
 * TherapyFitLoadingSkeleton — reusable loading state for therapy fit pages.
 * Shows animated skeleton drug cards while data loads.
 *
 * Used by: Phase3Treatment, AyeshaTherapyFit, Digital Twin
 */
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import '../therapy-fit/therapy-fit.css';

export default function TherapyFitLoadingSkeleton({ message = 'Running therapy fit analysis — this may take 10–15 seconds on first load...' }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map(i => (
                <Paper key={i} className="tf-skeleton-row">
                    <div
                        className="tf-skeleton-avatar"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <div
                            className={`tf-skeleton-line ${i === 1 ? 'tf-skeleton-line--medium' : 'tf-skeleton-line--short'}`}
                            style={{ animationDelay: `${i * 0.2}s`, marginBottom: 8 }}
                        />
                        <div
                            className="tf-skeleton-line tf-skeleton-line--wide"
                            style={{ animationDelay: `${i * 0.3}s` }}
                        />
                    </Box>
                    <div
                        className="tf-skeleton-score"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                </Paper>
            ))}
            <Typography variant="caption" className="tf-skeleton-caption">
                {message}
            </Typography>
        </Box>
    );
}
