/**
 * IntelligenceSection — DDR Status + SOC Recommendation
 *
 * WeeklyStrategyLoop is rendered once on the profile page (above this block).
 */
import React from 'react';
import { Box, Typography, Grid, Paper, Alert, CircularProgress } from '@mui/material';
import { DDRStatusCard } from '../../ddr';
import SOCRecommendationCard from '../SOCRecommendationCard';

export default function IntelligenceSection({
    ddrLoading, ddrStatus, careData,
}) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography
                variant="overline"
                sx={{
                    fontWeight: 900, color: 'var(--zeta-slate)',
                    letterSpacing: 2, mb: 1.5, display: 'block', fontSize: '0.7rem',
                }}
            >
                INTELLIGENCE
            </Typography>
            <Grid container spacing={3} sx={{ mb: 2 }}>
                {/* DDR Status */}
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            🧬 DDR Status &amp; PARP Eligibility
                        </Typography>
                        {ddrLoading ? (
                            <Box display="flex" alignItems="center" gap={2}>
                                <CircularProgress size={20} />
                                <Typography variant="body2">Computing DDR status…</Typography>
                            </Box>
                        ) : ddrStatus ? (
                            <DDRStatusCard ddrStatus={ddrStatus} />
                        ) : (
                            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                                DDR status requires genomic mutation data.
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                {/* SOC Recommendation */}
                {careData?.soc_recommendation && (
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                💊 Standard of Care
                            </Typography>
                            <SOCRecommendationCard {...careData.soc_recommendation} />
                        </Paper>
                    </Grid>
                )}
            </Grid>
            {/* WeeklyStrategyLoop lives once at page top (Phase1Profile) — avoid duplicate fetches/UI */}
        </Box>
    );
}
