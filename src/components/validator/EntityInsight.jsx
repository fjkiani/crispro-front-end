import React from 'react';
import { Box, Typography, Chip, Grid, Avatar } from '@mui/material';
import { Biotech, Science, Medication, Psychology, TrendingUp } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';
import InteractiveButton from '../common/InteractiveButton';

const EntityInsight = ({ entities = [], prevalenceData = {}, isLoadingPrevalence = false, onDesignExperiment }) => {
    
    const getEntityIcon = (type) => {
        switch(type?.toLowerCase()) {
            case 'gene': return <Biotech color="primary" />;
            case 'protein': return <Science color="success" />;
            case 'drug': 
            case 'compound': return <Medication color="warning" />;
            case 'pathway': return <Psychology color="info" />;
            default: return <TrendingUp color="action" />;
        }
    };

    const getEntityColor = (type) => {
        switch(type?.toLowerCase()) {
            case 'gene': return 'primary';
            case 'protein': return 'success';
            case 'drug': 
            case 'compound': return 'warning';
            case 'pathway': return 'info';
            default: return 'default';
        }
    };

    const isExperimentalTarget = (type) => {
        return ['gene', 'protein'].includes(type?.toLowerCase());
    };

    const getPrevalenceDisplay = (entityName) => {
        if (isLoadingPrevalence) return "Calculating...";
        const data = prevalenceData[entityName];
        if (!data) return "Data unavailable";
        return `${data.prevalence.toFixed(1)}% prevalence (${data.patient_count} patients)`;
    };

    const getTacticalRelevance = (entityName, type) => {
        const data = prevalenceData[entityName];
        if (!data) return "Assessment pending";
        
        const prevalence = data.prevalence;
        if (prevalence > 10) return "High-priority target";
        if (prevalence > 5) return "Moderate significance";
        if (prevalence > 1) return "Specialized relevance";
        return "Rare but critical";
    };

    return (
        <BaseCard
            title="Biological Target Analysis"
            subtitle={`${entities.length} key entities identified for investigation`}
            statusColor="#fff3e0"
        >
            <Grid container spacing={3}>
                {entities.map((entity, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Box sx={{ 
                            p: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2,
                            bgcolor: '#fafafa',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'transparent', border: '2px solid', borderColor: `${getEntityColor(entity.type)}.main` }}>
                                    {getEntityIcon(entity.type)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        {entity.name}
                                    </Typography>
                                    <Chip 
                                        label={entity.type} 
                                        size="small" 
                                        color={getEntityColor(entity.type)}
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>

                            <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                                {entity.description}
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Clinical Prevalence:
                                </Typography>
                                <Typography variant="body2" color="primary">
                                    {getPrevalenceDisplay(entity.name)}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Tactical Assessment:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                    {getTacticalRelevance(entity.name, entity.type)}
                                </Typography>
                            </Box>

                            {isExperimentalTarget(entity.type) && (
                                <Box sx={{ mt: 'auto' }}>
                                    <InteractiveButton
                                        onClick={() => onDesignExperiment(entity)}
                                        helpText={`Design an in silico experiment to validate ${entity.name} as a therapeutic target`}
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        sx={{ width: '100%' }}
                                    >
                                        Design Experiment
                                    </InteractiveButton>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </BaseCard>
    );
};

export default EntityInsight; 