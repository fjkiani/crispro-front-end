/**
 * OpportunitiesSection — Clinical trials + Intelligence Gaps
 *
 * Extracted from Phase1Profile.jsx monolith.
 */
import React from 'react';
import { Box, Typography, Grid, Paper, Alert, Button } from '@mui/material';
import { ZetaTrialCard, IntelGapsList } from '../../../pages/ayesha/ZetaDashboardComponents';

export default function OpportunitiesSection({ careLoading, trials, missingTests, navigate }) {
    if (careLoading || (trials.length === 0 && (!missingTests || missingTests.length === 0))) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <Typography
                variant="overline"
                sx={{
                    fontWeight: 900, color: 'var(--zeta-slate)',
                    letterSpacing: 2, mb: 1.5, display: 'block', fontSize: '0.7rem',
                }}
            >
                OPPORTUNITIES
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%', bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                HIGHEST PROBABILITY TRIALS ({trials.length} Matches)
                            </Typography>
                            {trials.length > 3 && (
                                <Typography
                                    variant="caption"
                                    sx={{ cursor: 'pointer', textDecoration: 'underline', color: 'primary.main' }}
                                    onClick={() => navigate('/ayesha/trials-full')}
                                >
                                    View All →
                                </Typography>
                            )}
                        </Box>
                        {trials.length === 0 ? (
                            <Alert severity="info">No matches found. Complete missing tests to improve matching.</Alert>
                        ) : (
                            trials.slice(0, 3).map((trial, i) => (
                                <ZetaTrialCard
                                    key={trial.nct_id || i}
                                    trial={trial}
                                    rank={i + 1}
                                    onClick={() => navigate('/ayesha/trials-full')}
                                />
                            ))
                        )}
                        {trials.length > 3 && (
                            <Button fullWidth size="small" onClick={() => navigate('/ayesha/trials-full')}>
                                View {trials.length - 3} More Targets
                            </Button>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <IntelGapsList
                        missingTests={missingTests || []}
                        onUpload={(test) => navigate(`/ayesha/journey/tests?upload=${encodeURIComponent(test)}`)}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
