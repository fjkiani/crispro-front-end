import React from 'react';
import { Box, Typography, Grid, Alert } from '@mui/material';
import { DrugCard } from './DrugCard';

export function AyeshaDrugPanel({ drugs = [], slDetected = false, slTherapy = null, onInform }) {

    if (!drugs || drugs.length === 0) {
        return (
            <Box p={3} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    No drug recommendations generated for this level.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                    Therapy Candidates (L1 Evidence)
                </Typography>
                <Typography variant="caption" color="text.secondary" paragraph>
                    Ranked by efficacy score. Confidence reflects available evidence + structural fit.
                </Typography>
            </Box>

            {/* Primary List */}
            <Grid container spacing={2}>
                {drugs.map((drug, index) => (
                    <Grid item xs={12} md={6} lg={4} key={`${drug.name}-${index}`}>
                        <DrugCard
                            drug={drug}
                            showSPE={true}
                            showBadges={true}
                            onInform={onInform}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default AyeshaDrugPanel;
