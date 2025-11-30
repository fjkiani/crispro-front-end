/**
 * SAE Treatment Line Chips Component
 * 
 * Displays the 3 treatment line SAE features:
 * 1. Line Appropriateness (line_appropriateness)
 * 2. Cross-Resistance Risk (cross_resistance_risk)
 * 3. Sequencing Fitness (sequencing_fitness)
 * 
 * Adapted to accept 'features' prop (provenance object) instead of 'saeFeatures' array
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip } from '@mui/material';

const SAETreatmentLineChips = ({ features }) => {
    if (!features) {
        return null;
    }

    // Extract treatment line features from provenance object
    const treatmentLineFeatures = [
        {
            id: 'line_appropriateness',
            name: 'Line Fit',
            activation: features.line_appropriateness || 0,
            impact: (features.line_appropriateness || 0) >= 0.6 ? 'positive' : 'negative',
            explanation: 'How appropriate is this drug for the current treatment line'
        },
        {
            id: 'cross_resistance_risk',
            name: 'Resistance Risk',
            activation: features.cross_resistance_risk || 0,
            impact: (features.cross_resistance_risk || 0) < 0.3 ? 'positive' : 'negative',
            explanation: 'Risk of cross-resistance with prior therapies'
        },
        {
            id: 'sequencing_fitness',
            name: 'Sequencing Score',
            activation: features.sequencing_fitness || 0,
            impact: (features.sequencing_fitness || 0) >= 0.6 ? 'positive' : 'negative',
            explanation: 'Overall sequencing fitness (combines fit and resistance)'
        }
    ];

    const getChipColor = (feature) => {
        const { impact, activation } = feature;
        
        // For cross_resistance_risk (inverted - high is bad)
        if (feature.id === 'cross_resistance_risk') {
            if (activation >= 0.5) return { bg: '#ffebee', border: '#ef5350', text: '#c62828' }; // High risk - red
            if (activation >= 0.3) return { bg: '#fff3e0', border: '#ff9800', text: '#e65100' }; // Moderate - orange
            return { bg: '#e8f5e9', border: '#66bb6a', text: '#2e7d32' }; // Low risk - green
        }
        
        // For line_appropriateness and sequencing_fitness (higher is better)
        if (impact === 'positive') {
            return { bg: '#e8f5e9', border: '#66bb6a', text: '#2e7d32' }; // Green
        } else if (impact === 'negative') {
            return { bg: '#ffebee', border: '#ef5350', text: '#c62828' }; // Red
        } else {
            return { bg: '#fff3e0', border: '#ff9800', text: '#e65100' }; // Orange (neutral/warning)
        }
    };

    const getIcon = (feature) => {
        switch(feature.id) {
            case 'line_appropriateness':
                return feature.impact === 'positive' ? '✓' : '⚠';
            case 'cross_resistance_risk':
                return feature.activation >= 0.5 ? '⚠️' : feature.activation >= 0.3 ? '⚡' : '✓';
            case 'sequencing_fitness':
                return feature.impact === 'positive' ? '⭐' : '⚠';
            default:
                return '•';
        }
    };

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Typography variant="caption" sx={{ width: '100%', fontWeight: 500, color: 'text.secondary', mb: 0.5 }}>
                Treatment Line Features:
            </Typography>
            
            {treatmentLineFeatures.map((feature, index) => {
                const colors = getChipColor(feature);
                const icon = getIcon(feature);
                const value = (feature.activation * 100).toFixed(0);
                
                return (
                    <Chip
                        key={index}
                        icon={<span>{icon}</span>}
                        label={`${feature.name}: ${value}%`}
                        sx={{
                            backgroundColor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            color: colors.text,
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                                color: colors.text
                            }
                        }}
                        title={feature.explanation || ''}
                    />
                );
            })}

            {/* Explanation tooltip */}
            <Typography variant="caption" sx={{ width: '100%', color: 'text.secondary', mt: 0.5 }}>
                Hover over chips to see detailed explanations
            </Typography>
        </Box>
    );
};

SAETreatmentLineChips.propTypes = {
    features: PropTypes.shape({
        line_appropriateness: PropTypes.number,
        cross_resistance_risk: PropTypes.number,
        sequencing_fitness: PropTypes.number
    })
};

export default SAETreatmentLineChips;





