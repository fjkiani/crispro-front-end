import React from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { CheckCircle, Dna, Biotech, Hub } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const MetricChip = ({ icon, label, value, color }) => (
    <Chip
        icon={icon}
        label={`${label}: ${value}`}
        color={color}
        sx={{ fontWeight: 'bold', fontSize: '1rem', p: 2 }}
    />
);

const ResultDisplay = ({ result }) => {
    const plddtScore = result.structural_confidence_plddt?.toFixed(2);
    const affinityScore = result.binding_affinity_score?.toFixed(2);

    return (
        <BaseCard
            title="🎯 Mission Complete: Therapeutic Forged"
            subtitle="The Predator Protocol has successfully generated and validated a candidate therapeutic."
            statusColor="#4caf50" // Green for success
        >
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                {/* Metrics */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" gutterBottom>Validation Metrics</Typography>
                        <MetricChip 
                            icon={<Biotech />}
                            label="Structural Integrity (pLDDT)"
                            value={plddtScore || 'N/A'}
                            color={plddtScore >= 70 ? "success" : "warning"}
                        />
                        <MetricChip 
                            icon={<Hub />}
                            label="Binding Affinity (iptm)"
                            value={affinityScore || 'N/A'}
                            color={affinityScore > 0.7 ? "success" : "warning"}
                        />
                    </Box>
                </Grid>

                {/* DNA Sequence */}
                <Grid item xs={12} md={8}>
                     <Typography variant="h6" gutterBottom>
                        <Dna sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Forged DNA Sequence (Therapeutic Candidate)
                    </Typography>
                    <Paper elevation={2} sx={{ p: 2, bgcolor: 'grey.100', overflowX: 'auto', maxHeight: '200px' }}>
                        <Typography variant="body1" component="pre" sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {result.dna_sequence}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </BaseCard>
    );
};

export default ResultDisplay; 
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { CheckCircle, Dna, Biotech, Hub } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const MetricChip = ({ icon, label, value, color }) => (
    <Chip
        icon={icon}
        label={`${label}: ${value}`}
        color={color}
        sx={{ fontWeight: 'bold', fontSize: '1rem', p: 2 }}
    />
);

const ResultDisplay = ({ result }) => {
    const plddtScore = result.structural_confidence_plddt?.toFixed(2);
    const affinityScore = result.binding_affinity_score?.toFixed(2);

    return (
        <BaseCard
            title="🎯 Mission Complete: Therapeutic Forged"
            subtitle="The Predator Protocol has successfully generated and validated a candidate therapeutic."
            statusColor="#4caf50" // Green for success
        >
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                {/* Metrics */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" gutterBottom>Validation Metrics</Typography>
                        <MetricChip 
                            icon={<Biotech />}
                            label="Structural Integrity (pLDDT)"
                            value={plddtScore || 'N/A'}
                            color={plddtScore >= 70 ? "success" : "warning"}
                        />
                        <MetricChip 
                            icon={<Hub />}
                            label="Binding Affinity (iptm)"
                            value={affinityScore || 'N/A'}
                            color={affinityScore > 0.7 ? "success" : "warning"}
                        />
                    </Box>
                </Grid>

                {/* DNA Sequence */}
                <Grid item xs={12} md={8}>
                     <Typography variant="h6" gutterBottom>
                        <Dna sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Forged DNA Sequence (Therapeutic Candidate)
                    </Typography>
                    <Paper elevation={2} sx={{ p: 2, bgcolor: 'grey.100', overflowX: 'auto', maxHeight: '200px' }}>
                        <Typography variant="body1" component="pre" sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {result.dna_sequence}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </BaseCard>
    );
};

export default ResultDisplay; 
 
 
 
 
 