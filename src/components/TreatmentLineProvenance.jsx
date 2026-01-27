/**
 * Treatment Line Provenance Display Component
 * 
 * Displays treatment line calculations and confidence adjustments
 * Shows line appropriateness, cross-resistance risk, sequencing fitness
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';

const TreatmentLineProvenance = ({ provenance }) => {
    if (!provenance || provenance.error) {
        return null;
    }

    const {
        current_line,
        prior_therapies = [],
        line_appropriateness = 0,
        cross_resistance_risk = 0,
        sequencing_fitness = 0,
        nccn_category,
        confidence_penalty = 0,
        rationale
    } = provenance;

    // Color coding for scores
    const getScoreColor = (score, inverted = false) => {
        if (inverted) {
            // For cross-resistance risk (lower is better)
            if (score >= 0.5) return '#d32f2f'; // High risk - red
            if (score >= 0.3) return '#f57c00'; // Moderate risk - orange
            return '#388e3c'; // Low risk - green
        } else {
            // For line appropriateness and sequencing fitness (higher is better)
            if (score >= 0.8) return '#388e3c'; // Excellent - green
            if (score >= 0.6) return '#f57c00'; // Fair - orange
            return '#d32f2f'; // Poor - red
        }
    };

    const getScoreLabel = (score, inverted = false) => {
        if (inverted) {
            if (score >= 0.5) return 'High';
            if (score >= 0.3) return 'Moderate';
            return 'Low';
        } else {
            if (score >= 0.8) return 'Excellent';
            if (score >= 0.6) return 'Fair';
            return 'Poor';
        }
    };

    const getNccnBadgeColor = (category) => {
        switch(category) {
            case '1': return '#4caf50'; // Green - strongest evidence
            case '2A': return '#8bc34a'; // Light green
            case '2B': return '#ffc107'; // Amber
            case '3': return '#ff9800'; // Orange
            default: return '#9e9e9e'; // Grey
        }
    };

    return (
        <Paper sx={{ p: 2, mt: 2, backgroundColor: '#fafafa' }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600 }}>
                    Treatment Line Analysis
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                        label={`Line ${current_line}`}
                        size="small"
                        sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                    />
                    {nccn_category && nccn_category !== 'unknown' && (
                        <Chip 
                            label={`NCCN ${nccn_category}`}
                            size="small"
                            sx={{ 
                                backgroundColor: getNccnBadgeColor(nccn_category),
                                color: 'white'
                            }}
                        />
                    )}
                </Box>
            </Box>

            {/* Prior Therapies */}
            {prior_therapies.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                        Prior Therapies:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {prior_therapies.map((therapy, index) => (
                            <Chip
                                key={index}
                                label={therapy}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Score Grid */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {/* Line Appropriateness */}
                <Grid item xs={4}>
                    <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Line Fit
                        </Typography>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                color: getScoreColor(line_appropriateness)
                            }}
                        >
                            {(line_appropriateness * 100).toFixed(0)}%
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: getScoreColor(line_appropriateness),
                                fontWeight: 500
                            }}
                        >
                            {getScoreLabel(line_appropriateness)}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Cross-Resistance Risk */}
                <Grid item xs={4}>
                    <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Resistance Risk
                        </Typography>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                color: getScoreColor(cross_resistance_risk, true)
                            }}
                        >
                            {(cross_resistance_risk * 100).toFixed(0)}%
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: getScoreColor(cross_resistance_risk, true),
                                fontWeight: 500
                            }}
                        >
                            {getScoreLabel(cross_resistance_risk, true)} risk
                        </Typography>
                    </Paper>
                </Grid>

                {/* Sequencing Fitness */}
                <Grid item xs={4}>
                    <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Sequencing Score
                        </Typography>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                color: getScoreColor(sequencing_fitness)
                            }}
                        >
                            {(sequencing_fitness * 100).toFixed(0)}%
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: getScoreColor(sequencing_fitness),
                                fontWeight: 500
                            }}
                        >
                            {getScoreLabel(sequencing_fitness)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Confidence Penalty */}
            {confidence_penalty !== 0 && (
                <Box sx={{
                    p: 1.5,
                    mb: 1.5,
                    backgroundColor: confidence_penalty > 0 ? '#fff3e0' : '#e8f5e9',
                    border: `1px solid ${confidence_penalty > 0 ? '#ffb74d' : '#81c784'}`,
                    borderRadius: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '16px' }}>
                            {confidence_penalty > 0 ? '⚠️' : '✓'}
                        </Typography>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Confidence {confidence_penalty > 0 ? 'Penalty' : 'Adjustment'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {confidence_penalty > 0 ? '-' : '+'}{(Math.abs(confidence_penalty) * 100).toFixed(1)}%
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Rationale */}
            {rationale && (
                <Paper sx={{ p: 1.5, mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                        Rationale:
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {rationale}
                    </Typography>
                </Paper>
            )}

            {/* Tooltip explanations */}
            <Box sx={{
                pt: 1.5,
                borderTop: '1px solid #e0e0e0',
                fontSize: '11px',
                color: 'text.secondary'
            }}>
                <Typography variant="caption" component="div">
                    <strong>Line Fit:</strong> How appropriate is this drug for the current treatment line<br/>
                    <strong>Resistance Risk:</strong> Risk of cross-resistance with prior therapies<br/>
                    <strong>Sequencing Score:</strong> Overall sequencing fitness (combines fit and resistance)
                </Typography>
            </Box>
        </Paper>
    );
};

TreatmentLineProvenance.propTypes = {
    provenance: PropTypes.shape({
        current_line: PropTypes.number,
        prior_therapies: PropTypes.arrayOf(PropTypes.string),
        line_appropriateness: PropTypes.number,
        cross_resistance_risk: PropTypes.number,
        sequencing_fitness: PropTypes.number,
        nccn_category: PropTypes.string,
        confidence_penalty: PropTypes.number,
        rationale: PropTypes.string,
        error: PropTypes.string
    })
};

export default TreatmentLineProvenance;





