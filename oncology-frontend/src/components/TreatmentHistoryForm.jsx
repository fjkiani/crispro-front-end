/**
 * Treatment History Form Component
 * 
 * Collects patient treatment line context for efficacy prediction.
 * Sends treatment_history to backend efficacy endpoint.
 * 
 * Adapted for MyelomaDigitalTwin usage with onDiseaseChange and onHistoryChange props.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, TextField, Button, Chip, Paper } from '@mui/material';

const TreatmentHistoryForm = ({ 
    disease,
    onDiseaseChange,
    onHistoryChange,
    defaultLine = 1, 
    defaultPriorTherapies = []
}) => {
    const [currentLine, setCurrentLine] = useState(defaultLine);
    const [priorTherapies, setPriorTherapies] = useState(defaultPriorTherapies);
    const [newTherapy, setNewTherapy] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Common therapies by disease for quick add
    const therapySuggestions = {
        ovarian_cancer: [
            'carboplatin',
            'paclitaxel',
            'carboplatin+paclitaxel',
            'bevacizumab',
            'olaparib',
            'niraparib',
            'rucaparib'
        ],
        breast_her2_positive: [
            'trastuzumab',
            'pertuzumab',
            'paclitaxel',
            'docetaxel',
            'trastuzumab deruxtecan',
            'tucatinib',
            'capecitabine'
        ],
        breast_triple_negative: [
            'carboplatin',
            'paclitaxel',
            'pembrolizumab',
            'sacituzumab govitecan',
            'capecitabine'
        ],
        multiple_myeloma: [
            'lenalidomide',
            'bortezomib',
            'daratumumab',
            'carfilzomib',
            'pomalidomide',
            'ixazomib'
        ]
    };

    const suggestions = therapySuggestions[disease] || [];

    // Auto-update parent when state changes
    useEffect(() => {
        if (onHistoryChange) {
            const treatmentHistory = {
                current_line: currentLine,
                prior_therapies: priorTherapies
            };
            onHistoryChange(treatmentHistory);
        }
    }, [currentLine, priorTherapies, onHistoryChange]);

    const handleAddTherapy = (therapy) => {
        if (therapy && !priorTherapies.includes(therapy)) {
            setPriorTherapies([...priorTherapies, therapy]);
            setNewTherapy('');
        }
    };

    const handleRemoveTherapy = (index) => {
        setPriorTherapies(priorTherapies.filter((_, i) => i !== index));
    };

    const handleReset = () => {
        setCurrentLine(1);
        setPriorTherapies([]);
        setNewTherapy('');
    };

    if (!showForm) {
        return (
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => setShowForm(true)}
                    size="small"
                >
                    + Add Treatment History (Line {currentLine})
                </Button>
                {priorTherapies.length > 0 && (
                    <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                        {priorTherapies.length} prior therap{priorTherapies.length === 1 ? 'y' : 'ies'}
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                    Treatment History
                </Typography>
                <Button
                    onClick={() => setShowForm(false)}
                    size="small"
                    sx={{ minWidth: 'auto' }}
                >
                    ✕
                </Button>
            </Box>

            {/* Disease Selection */}
            {onDiseaseChange && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Disease</InputLabel>
                    <Select
                        value={disease || ''}
                        onChange={(e) => onDiseaseChange(e.target.value)}
                        label="Disease"
                    >
                        <MenuItem value="ovarian_cancer">Ovarian Cancer</MenuItem>
                        <MenuItem value="breast_her2_positive">Breast Cancer (HER2+)</MenuItem>
                        <MenuItem value="breast_triple_negative">Breast Cancer (TNBC)</MenuItem>
                        <MenuItem value="multiple_myeloma">Multiple Myeloma</MenuItem>
                    </Select>
                </FormControl>
            )}

            {/* Current Treatment Line */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Current Treatment Line *</InputLabel>
                <Select
                    value={currentLine}
                    onChange={(e) => setCurrentLine(parseInt(e.target.value))}
                    label="Current Treatment Line *"
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(line => (
                        <MenuItem key={line} value={line}>
                            {line}{line === 1 ? 'st' : line === 2 ? 'nd' : line === 3 ? 'rd' : 'th'} Line
                        </MenuItem>
                    ))}
                </Select>
                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    Select the line of therapy you are planning
                </Typography>
            </FormControl>

            {/* Prior Therapies */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Prior Therapies {currentLine > 1 && '*'}
                </Typography>
                
                {/* Current prior therapies list */}
                {priorTherapies.length > 0 && (
                    <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {priorTherapies.map((therapy, index) => (
                            <Chip
                                key={index}
                                label={therapy}
                                onDelete={() => handleRemoveTherapy(index)}
                                size="small"
                            />
                        ))}
                    </Box>
                )}

                {/* Add new therapy input */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        value={newTherapy}
                        onChange={(e) => setNewTherapy(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTherapy(newTherapy);
                            }
                        }}
                        placeholder="Enter drug or regimen name"
                    />
                    <Button
                        variant="contained"
                        onClick={() => handleAddTherapy(newTherapy)}
                        disabled={!newTherapy}
                        size="small"
                    >
                        Add
                    </Button>
                </Box>

                {/* Quick add suggestions */}
                {suggestions.length > 0 && (
                    <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                            Quick add:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {suggestions
                                .filter(s => !priorTherapies.includes(s))
                                .slice(0, 5)
                                .map((suggestion, index) => (
                                    <Chip
                                        key={index}
                                        label={`+ ${suggestion}`}
                                        onClick={() => handleAddTherapy(suggestion)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))
                            }
                        </Box>
                    </Box>
                )}

                <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', display: 'block' }}>
                    {currentLine === 1 
                        ? 'First-line therapy - no prior therapies needed'
                        : `Add all prior therapies received before line ${currentLine}`
                    }
                </Typography>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                    variant="outlined"
                    onClick={handleReset}
                    size="small"
                >
                    Reset
                </Button>
            </Box>

            {/* Validation warning */}
            {currentLine > 1 && priorTherapies.length === 0 && (
                <Box sx={{ 
                    mt: 1, 
                    p: 1, 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffc107', 
                    borderRadius: 1,
                    fontSize: '13px',
                    color: '#856404'
                }}>
                    ⚠️ Please add at least one prior therapy for line {currentLine}
                </Box>
            )}
        </Paper>
    );
};

TreatmentHistoryForm.propTypes = {
    disease: PropTypes.string,
    onDiseaseChange: PropTypes.func,
    onHistoryChange: PropTypes.func,
    defaultLine: PropTypes.number,
    defaultPriorTherapies: PropTypes.arrayOf(PropTypes.string)
};

export default TreatmentHistoryForm;





