import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useAyeshaScenarios } from '../../hooks/useAyeshaTherapyFitBundle';

// Component responsible for fetching scenarios itself to decouple from main bundle
export function ScenarioTeasers() {
    const { data, isLoading, error } = useAyeshaScenarios();

    if (isLoading) return null; // Or skeleton
    if (error || !data) return null;

    return (
        <Box mt={6} pt={4} borderTop="1px solid #eee">
            <Typography variant="h5" gutterBottom color="text.secondary">
                Future Scenarios
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Unlock deeper insights as more data becomes available (NGS, Transcriptomics).
            </Typography>

            {/* L2 Scenarios */}
            {data.l2_scenarios && data.l2_scenarios.length > 0 && (
                <Box mb={4}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Level 2: With NGS Data
                    </Typography>
                    <Grid container spacing={2}>
                        {data.l2_scenarios.map(scenario => (
                            <Grid item xs={12} md={6} key={scenario.id}>
                                <ScenarioCard scenario={scenario} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* L3 Scenarios */}
            {data.l3_scenarios && data.l3_scenarios.length > 0 && (
                <Box mb={4}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Level 3: With RNA Expression
                    </Typography>
                    <Grid container spacing={2}>
                        {data.l3_scenarios.map(scenario => (
                            <Grid item xs={12} md={6} key={scenario.id}>
                                <ScenarioCard scenario={scenario} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

function ScenarioCard({ scenario }) {
    // ZO AUDIT IMPLEMENTATION: 
    // Renders LOCKED state only. Ignores preview fields as they are undefined.

    return (
        <Card sx={{ position: 'relative', opacity: 0.7, bgcolor: '#fafafa', height: '100%' }}>
            {/* Lock Overlay Icon */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1
                }}
            >
                <LockIcon color="disabled" />
            </Box>

            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ pr: 3, fontSize: '1rem' }}>
                    {scenario.name}
                </Typography>

                {/* Requirements Section */}
                <Box mt={2}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        REQUIRES:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {scenario.requires && scenario.requires.map(req => (
                            <Chip
                                key={req}
                                label={req}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Explicitly Missing Preview Section - As per audit instructions */}
                <Box mt={2} p={1} bgcolor="#f5f5f5" borderRadius={1}>
                    <Typography variant="caption" color="text.disabled" fontStyle="italic">
                        Preview unavailable (requires data)
                    </Typography>
                </Box>

            </CardContent>
        </Card>
    );
}
