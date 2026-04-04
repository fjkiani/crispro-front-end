/**
 * PrimaryDirectiveSection — 1-2 ZetaPrimaryDirective cards
 *
 * Extracted from Phase1Profile.jsx monolith.
 */
import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ZetaPrimaryDirective } from '../../../pages/ayesha/ZetaDashboardComponents';

export default function PrimaryDirectiveSection({ careLoading, directive, slResult, trials, navigate }) {
    if (careLoading) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <Typography
                variant="overline"
                sx={{
                    fontWeight: 900, color: 'var(--zeta-slate)',
                    letterSpacing: 2, mb: 1.5, display: 'block', fontSize: '0.7rem',
                }}
            >
                PRIMARY DIRECTIVE
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={slResult?.synthetic_lethality_detected && trials.length > 0 ? 6 : 12}>
                    <ZetaPrimaryDirective
                        {...directive}
                        onAction={() => navigate(directive.actionRoute)}
                    />
                </Grid>
                {slResult?.synthetic_lethality_detected && trials.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <ZetaPrimaryDirective
                            headline="ENGAGE CLINICAL TRIALS"
                            subheadline={`${trials.length} High-Fidelity Matches Found`}
                            reasoning={['Multiple pathway-aligned options available', 'Standard of Care options limited or exhausted']}
                            receipts={{ level: 'L2', inputs: ['NGS', 'Clinical Profile', 'Trial Protocol'], missing: [] }}
                            actionLabel="VIEW ALL TRIALS"
                            onAction={() => navigate('/ayesha/trials-full')}
                            color="primary"
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
