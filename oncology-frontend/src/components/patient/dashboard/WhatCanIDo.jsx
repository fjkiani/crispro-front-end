import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Grid,
    Button,
    Divider,
} from '@mui/material';
import {
    Science as TestIcon,
    LocalHospital as CarePlanIcon,
    Explore as TrialIcon,
    TrendingUp as OpportunityIcon,
    Bolt as SLIcon,
} from '@mui/icons-material';

const WhatCanIDo = ({
    carePlan,
    trialCount = 0,
    missingTestsCount = 0,
    slResult,
    onViewCarePlan,
    onViewTrials,
    onUploadTest
}) => {

    // Calculate actionable opportunities
    const opportunities = useMemo(() => {
        const opps = [];

        // 1. Synthetic Lethality Opportunity (Priority)
        if (slResult?.synthetic_lethality_detected) {
            const bestDrug = slResult.recommended_drugs?.[0];
            opps.push({
                type: 'sl_opportunity',
                title: 'Synthetic Lethality Detected',
                description: bestDrug
                    ? `Mechanism: ${slResult.double_hit_description.split('→')[0]} → ${bestDrug.drug_name} candidate`
                    : 'Genetic vulnerability identified targeting specific pathway weakness',
                subtitle: bestDrug ? `Suggested Therapy: ${bestDrug.drug_name}` : null,
                confidence: bestDrug ? `${Math.round(bestDrug.confidence * 100)}% confidence` : null,
                action: onViewCarePlan, // Or specific SL tab view
                icon: <SLIcon />,
                count: null,
                highlight: true,
            });
        }

        // 2. Care Plan
        if (carePlan) {
            opps.push({
                type: 'care_plan',
                title: 'Complete Care Plan Ready',
                description: 'Your personalized treatment recommendations are available',
                action: onViewCarePlan,
                icon: <CarePlanIcon />,
                count: null,
            });
        }

        // 3. Trials
        if (trialCount > 0) {
            opps.push({
                type: 'trials',
                title: `${trialCount} Clinical Trial${trialCount !== 1 ? 's' : ''} Matched`,
                description: 'Trials matched to your specific profile',
                action: onViewTrials,
                icon: <TrialIcon />,
                count: trialCount,
            });
        }

        // 4. Missing Tests
        if (missingTestsCount > 0) {
            opps.push({
                type: 'tests',
                title: `${missingTestsCount} Test${missingTestsCount !== 1 ? 's' : ''} Recommended`,
                description: 'Upload to unlock additional capabilities',
                action: onUploadTest,
                icon: <TestIcon />,
                count: missingTestsCount,
            });
        }

        return opps;
    }, [carePlan, trialCount, missingTestsCount, slResult, onViewCarePlan, onViewTrials, onUploadTest]);

    if (opportunities.length === 0) {
        return null;
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <OpportunityIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                        What Can I Do?
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    {opportunities.map((opp, idx) => (
                        <Grid item xs={12} key={idx}>
                            <Card
                                variant="outlined"
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        boxShadow: 3,
                                        transform: 'translateY(-2px)',
                                    },
                                    bgcolor: opp.highlight ? 'warning.50' : 'background.paper',
                                    borderColor: opp.highlight ? 'warning.main' : 'divider',
                                }}
                                onClick={opp.action}
                            >
                                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Box color={opp.highlight ? "warning.main" : "primary.main"}>{opp.icon}</Box>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
                                            {opp.title}
                                        </Typography>
                                        {opp.count !== null && (
                                            <Chip
                                                label={opp.count}
                                                size="small"
                                                color={opp.highlight ? "warning" : "primary"}
                                            />
                                        )}
                                    </Box>

                                    {opp.subtitle && (
                                        <Typography variant="body2" fontWeight="bold" color="text.primary" gutterBottom>
                                            {opp.subtitle}
                                        </Typography>
                                    )}

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {opp.description}
                                    </Typography>

                                    {opp.confidence && (
                                        <Chip label={opp.confidence} size="small" color="success" variant="outlined" sx={{ mt: 1, mr: 1 }} />
                                    )}

                                    <Button
                                        size="small"
                                        variant="text"
                                        sx={{ mt: 1, display: 'block' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            opp.action();
                                        }}
                                    >
                                        View →
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default WhatCanIDo;
