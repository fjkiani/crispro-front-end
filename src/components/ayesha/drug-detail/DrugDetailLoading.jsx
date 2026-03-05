/**
 * DrugDetailLoading — Patient-friendly loading state for drug detail page.
 */
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function DrugDetailLoading() {
    return (
        <Box sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 400, gap: 2,
        }}>
            <CircularProgress size={48} sx={{ color: '#6366f1' }} />
            <Typography color="text.secondary" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Loading drug profile…
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Fetching match score, pathway data, and evidence.
            </Typography>
        </Box>
    );
}
