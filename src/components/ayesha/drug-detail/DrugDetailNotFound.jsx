/**
 * DrugDetailNotFound — Shown when the drug slug exists in the URL but isn't
 * in the backend's ranked drug list for this patient.
 */
import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

export default function DrugDetailNotFound({ slug, navigate }) {
    return (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Drug Not Found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The drug "<strong>{slug}</strong>" was not found in the current analysis.
            </Typography>
            <Button
                startIcon={<ArrowBack />}
                variant="outlined"
                onClick={() => navigate('/ayesha/journey/treatment')}
            >
                Back to Treatment Options
            </Button>
        </Paper>
    );
}
