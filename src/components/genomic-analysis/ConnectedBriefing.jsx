import React from 'react';
import { Box, Typography, Chip, Divider } from '@mui/material';
import { Science, TrendingUp, Timeline } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const ConnectedBriefing = ({ targetName, initialIntel, sourceQuery }) => {
    return (
        <BaseCard
            title="Mission Briefing: Target Validation Protocol"
            subtitle="Systematic investigation of therapeutic target viability"
            statusColor="#e8f5e9"
            titleVariant="h5"
        >
            {/* Connection to Source Research */}
            {sourceQuery && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Timeline color="primary" />
                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                            Research Context
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        This target emerged from our investigation: "{sourceQuery}"
                    </Typography>
                </Box>
            )}

            {/* Target Information */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Science color="success" />
                    <Typography variant="h6">Selected Target</Typography>
                    <Chip label="Primary Target" color="success" size="small" />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                    {targetName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Initial Intelligence:</strong> {initialIntel}
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Experimental Objectives */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUp color="warning" />
                    <Typography variant="h6">Validation Objectives</Typography>
                </Box>
                
                <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>1. Target Characterization:</strong> Analyze gene/protein structure, function, and biological pathways
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>2. Vulnerability Assessment:</strong> Use the Zeta Oracle to simulate functional knockout and predict impact
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>3. Therapeutic Viability:</strong> Determine if this target represents a valid intervention point
                    </Typography>
                    <Typography variant="body2">
                        <strong>4. Strategic Design:</strong> If viable, generate optimized therapeutic strategies
                    </Typography>
                </Box>
            </Box>

            {/* Success Criteria */}
            <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Success Criteria
                </Typography>
                <Typography variant="body2">
                    This target will be validated as therapeutically viable if the Zeta Oracle predicts a significant negative impact (Zeta Score ≤ -1.0) upon functional knockout, indicating the target's essentiality to disease progression.
                </Typography>
            </Box>
        </BaseCard>
    );
};

export default ConnectedBriefing; 