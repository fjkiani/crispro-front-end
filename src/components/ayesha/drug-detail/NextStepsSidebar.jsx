/**
 * NextStepsSidebar — Contextual navigation panel for the drug detail sidebar.
 *
 * Three actions: Compare All Drugs | Go to Tests & Unlocks | View Tumor Board
 * Plus a compact data-level indicator.
 */
import React from 'react';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { ArrowForward, CompareArrows, Science, Gavel } from '@mui/icons-material';

export default function NextStepsSidebar({ navigate, completeness }) {
    const level = completeness?.level || 'L1';
    const score = completeness?.completeness_score;

    const steps = [
        { label: 'Compare All Drugs', route: '/ayesha/journey/treatment', icon: <CompareArrows sx={{ fontSize: 16 }} /> },
        { label: 'Go to Tests & Unlocks', route: '/ayesha/journey/tests', icon: <Science sx={{ fontSize: 16 }} /> },
        { label: 'View Tumor Board', route: '/ayesha/journey/board', icon: <Gavel sx={{ fontSize: 16 }} /> },
    ];

    return (
        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, fontSize: '0.9rem' }}>
                Next Steps
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {steps.map(({ label, route, icon }) => (
                    <Button
                        key={route}
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={icon}
                        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(route)}
                        sx={{
                            fontWeight: 600, justifyContent: 'space-between', textAlign: 'left',
                            py: 1, fontSize: '0.8rem',
                        }}
                    >
                        <Box sx={{ flex: 1, textAlign: 'left' }}>{label}</Box>
                    </Button>
                ))}
            </Box>

            {/* Data level indicator */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                    label={level}
                    size="small"
                    sx={{
                        fontWeight: 800, fontSize: '0.7rem', height: 22,
                        bgcolor: level === 'L3' ? '#dcfce7' : level === 'L2' ? '#fef3c7' : '#f1f5f9',
                        color: level === 'L3' ? '#166534' : level === 'L2' ? '#92400e' : '#475569',
                    }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                    {score != null ? `${Math.round(score * 100)}% complete` : 'Data Level'}
                </Typography>
            </Box>
        </Paper>
    );
}
