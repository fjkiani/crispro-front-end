import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const IntelligenceSummary = ({ synthesisResult }) => {
    const [prevalenceData, setPrevalenceData] = useState({});
    const [isLoadingPrevalence, setIsLoadingPrevalence] = useState(false);
    const navigate = useNavigate();

    const handleDesignExperiment = (entity) => {
        const geneName = entity.name;
        const description = entity.description;

        // Handle comma-separated lists AND descriptive names
        const firstEntity = geneName.split(',')[0].trim();
        const geneSymbol = firstEntity.split(' ')[0];

        // Navigate, passing the intel as state
        navigate(`/genomic-analysis/${geneSymbol}`, { 
            state: { 
                targetName: geneName,
                initialIntel: description 
            } 
        });
    };

    useEffect(() => {
        const fetchPrevalence = async () => {
            if (synthesisResult && synthesisResult.entities) {
                setIsLoadingPrevalence(true);
                const entityNames = synthesisResult.entities.map(e => e.name);
                try {
                    const response = await fetch('http://localhost:8000/api/population/entity_prevalence', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entities: entityNames }),
                    });
                    const data = await response.json();
                    const prevalenceMap = data.data.reduce((acc, item) => {
                        acc[item.name] = item;
                        return acc;
                    }, {});
                    setPrevalenceData(prevalenceMap);
                } catch (error) {
                    console.error("Failed to fetch prevalence data", error);
                } finally {
                    setIsLoadingPrevalence(false);
                }
            }
        };

        fetchPrevalence();
    }, [synthesisResult]);

    if (!synthesisResult) {
        return null;
    }

    const { summary, entities, mechanisms, conclusions } = synthesisResult;

    return (
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#e8f5e9' }}>
            <Typography variant="h5" gutterBottom>Intelligence Summary</Typography>
            
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Overall Summary</Typography>
                <Typography variant="body1">{summary}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Key Biological Entities</Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Tactical Relevance</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entities.map((entity, index) => (
                                <TableRow key={index}>
                                    <TableCell><strong>{entity.name}</strong></TableCell>
                                    <TableCell><Chip label={entity.type} size="small" /></TableCell>
                                    <TableCell>{entity.description}</TableCell>
                                    <TableCell>
                                        {isLoadingPrevalence ? <CircularProgress size={20} /> : 
                                            prevalenceData[entity.name] ? 
                                            `${prevalenceData[entity.name].prevalence.toFixed(2)}% (${prevalenceData[entity.name].patient_count} patients)` 
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {entity.type === 'Gene' || entity.type === 'Protein' ? (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleDesignExperiment(entity)}
                                            >
                                                Design Experiment
                                            </Button>
                                        ) : null}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Identified Mechanisms of Action</Typography>
                <ul>
                    {mechanisms.map((mechanism, index) => (
                        <li key={index}><Typography variant="body1">{mechanism}</Typography></li>
                    ))}
                </ul>
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>Primary Conclusions</Typography>
                <ul>
                    {conclusions.map((conclusion, index) => (
                        <li key={index}><Typography variant="body1">{conclusion}</Typography></li>
                    ))}
                </ul>
            </Box>
        </Paper>
    );
};

export default IntelligenceSummary; 