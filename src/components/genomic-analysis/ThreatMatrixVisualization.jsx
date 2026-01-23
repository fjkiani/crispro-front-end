import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Target } from 'lucide-react'; // Using lucide-react for a better icon

const ThreatMatrixVisualization = ({ patientScore, pathogenicScores = [], benignScores = [] }) => {
    // Determine the full range for the chart
    const allScores = [patientScore, ...pathogenicScores, ...benignScores];
    const minScore = Math.floor(Math.min(...allScores) - 1);
    const maxScore = Math.ceil(Math.max(...allScores) + 1);
    const range = maxScore - minScore;

    // Function to calculate the position of a score on the chart as a percentage
    const getPosition = (score) => ((score - minScore) / range) * 100;

    // Calculate the boundaries of the pathogenic and benign zones
    const pathogenicZone = {
        start: getPosition(Math.min(...pathogenicScores)),
        width: getPosition(Math.max(...pathogenicScores)) - getPosition(Math.min(...pathogenicScores)),
    };
    const benignZone = {
        start: getPosition(Math.min(...benignScores)),
        width: getPosition(Math.max(...benignScores)) - getPosition(Math.min(...benignScores)),
    };

    const patientPosition = getPosition(patientScore);

    return (
        <Box sx={{ width: '100%', my: 3 }}>
            <Typography variant="h6" gutterBottom>Threat Matrix Analysis</Typography>
            <Box sx={{ position: 'relative', height: '60px', width: '100%' }}>
                {/* Background Zones */}
                <Box sx={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    height: '20px',
                    width: '100%',
                    bgcolor: '#eeeeee',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    {/* Pathogenic Zone */}
                    <Tooltip title={`Pathogenic Zone (Scores: ${Math.min(...pathogenicScores).toFixed(2)} to ${Math.max(...pathogenicScores).toFixed(2)})`} placement="top">
                        <Box sx={{
                            position: 'absolute',
                            left: `${pathogenicZone.start}%`,
                            width: `${pathogenicZone.width}%`,
                            height: '100%',
                            bgcolor: 'rgba(239, 83, 80, 0.4)', // Faded red
                        }} />
                    </Tooltip>
                    {/* Benign Zone */}
                    <Tooltip title={`Benign Zone (Scores: ${Math.min(...benignScores).toFixed(2)} to ${Math.max(...benignScores).toFixed(2)})`} placement="top">
                        <Box sx={{
                            position: 'absolute',
                            left: `${benignZone.start}%`,
                            width: `${benignZone.width}%`,
                            height: '100%',
                            bgcolor: 'rgba(102, 187, 106, 0.5)', // Faded green
                        }} />
                    </Tooltip>
                </Box>

                {/* Patient Score Marker */}
                <Tooltip title={`Patient Variant Score: ${patientScore.toFixed(4)}`} placement="top" arrow>
                    <Box sx={{
                        position: 'absolute',
                        left: `calc(${patientPosition}% - 12px)`,
                        top: '10px',
                        zIndex: 10,
                        textAlign: 'center'
                    }}>
                        <Target size={24} color="#0d47a1"/>
                    </Box>
                </Tooltip>

                {/* Axis Labels */}
                <Box sx={{ position: 'absolute', top: '45px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">{minScore.toFixed(1)}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Zeta Score</Typography>
                    <Typography variant="caption">{maxScore.toFixed(1)}</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ThreatMatrixVisualization; 