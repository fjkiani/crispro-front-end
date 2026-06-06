/**
 * MissingDataTab — "If We Had More Data" panel.
 * Shows which tests would improve ranking confidence.
 * Extracted from Phase3Treatment Tab 1.
 *
 * Used by: Phase3Treatment, AyeshaTherapyFit (future)
 */
import React from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../therapy-fit/therapy-fit.css';

export default function MissingDataTab({ missing = [], completenessScore }) {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Improve Confidence With These Tests
            </Typography>
            <Typography variant="body2" className="tf-section-subtitle" sx={{ mb: 2 }}>
                Adding these tests unlocks more precise scenarios and stronger rankings.
            </Typography>

            {missing.length > 0 ? missing.map(m => (
                <Paper key={m} className="tf-missing-item">
                    <Typography variant="body2" className="tf-missing-item__label">
                        📋 {m}
                    </Typography>
                    <Typography variant="caption" className="tf-missing-item__hint">
                        Adding this test would improve ranking confidence and unlock additional scenarios.
                    </Typography>
                </Paper>
            )) : (
                <Alert severity="success">All key inputs are present — confidence is at the current level cap ({completenessScore != null ? Math.round(completenessScore * 100) + "%" : "—"}).</Alert>
            )}

            <Button
                variant="outlined"
                onClick={() => navigate('/ayesha/journey/tests')}
                sx={{ mt: 2, fontWeight: 600 }}
            >
                Go to Tests & Unlocks
            </Button>
        </Box>
    );
}
