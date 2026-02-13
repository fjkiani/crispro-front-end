import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Chip,
    LinearProgress,
    alpha,
    Divider
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';

/**
 * PathwayDisruptionMap Component
 * 
 * Shows which DNA repair pathways are intact vs disrupted.
 * Consumes real Bundle data: synthetic_lethality.pathways (List[PathwayAnalysis])
 */
export default function PathwayDisruptionMap({ pathways = [] }) {
    if (!pathways || pathways.length === 0) {
        return (
            <Box p={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    No pathway analysis data available.
                </Typography>
            </Box>
        );
    }

    // Handle both List (SL Agent) and Object (Legacy) formats
    const pathwayList = Array.isArray(pathways)
        ? pathways
        : Object.values(pathways);

    const getPathwayStatusIcon = (status) => {
        if (status === 'NON_FUNCTIONAL' || status === 'DISABLED' || status === 'LOST') {
            return <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />;
        }
        if (status === 'FUNCTIONAL' || status === 'INTACT') {
            return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
        }
        return <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
    };

    const getPathwayStatusColor = (status) => {
        if (status === 'NON_FUNCTIONAL' || status === 'DISABLED' || status === 'LOST') return 'error';
        if (status === 'FUNCTIONAL' || status === 'INTACT') return 'success';
        return 'warning';
    };

    return (
        <Box>
            <Stack spacing={2}>
                {pathwayList.map((p) => {
                    const status = p.status || p.pathway_status;
                    const name = p.pathway_name || p.name || p.pathway_id;
                    const genes = p.genes_affected || p.genes || [];
                    const score = p.disruption_score !== undefined ? p.disruption_score : 0;

                    return (
                        <Box key={name} sx={{ border: `1px solid ${alpha('#667eea', 0.2)}`, borderRadius: 1, p: 1.5 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    {getPathwayStatusIcon(status)}
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {name}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={status}
                                    size="small"
                                    color={getPathwayStatusColor(status)}
                                    variant="outlined"
                                    sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                            </Box>

                            {/* Disruption Score */}
                            <Box mb={1}>
                                <LinearProgress
                                    variant="determinate"
                                    value={score * 100}
                                    color={getPathwayStatusColor(status)}
                                    sx={{ height: 4, borderRadius: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary" display="block" textAlign="right">
                                    Disruption: {(score * 100).toFixed(0)}%
                                </Typography>
                            </Box>

                            {/* Genes Involved */}
                            {genes.length > 0 ? (
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                    {genes.map((g, idx) => (
                                        <Chip
                                            key={idx}
                                            label={typeof g === 'object' ? (g.name || g.gene || 'Unknown') : g}
                                            size="small"
                                            sx={{ fontSize: '0.65rem', height: 20, bgcolor: alpha('#f44336', 0.1), color: '#d32f2f' }}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="caption" color="text.secondary">
                                    No specific gene defects detected.
                                </Typography>
                            )}

                            {/* Description */}
                            {p.description && (
                                <Typography variant="caption" display="block" mt={1} color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    "{p.description}"
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
}
