import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Science, Psychology, TrendingUp } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const HypothesisCard = ({ query, summary, significance = "high" }) => {
    const getSignificanceColor = (sig) => {
        switch(sig.toLowerCase()) {
            case 'high': return '#e8f5e9';
            case 'medium': return '#fff3e0';
            case 'low': return '#f3e5f5';
            default: return '#f0f4f8';
        }
    };

    const getSignificanceIcon = (sig) => {
        switch(sig.toLowerCase()) {
            case 'high': return <TrendingUp color="success" />;
            case 'medium': return <Psychology color="warning" />;
            case 'low': return <Science color="info" />;
            default: return <Science />;
        }
    };

    return (
        <BaseCard
            title="Research Question"
            subtitle="What hypothesis are we investigating?"
            statusColor={getSignificanceColor(significance)}
            titleVariant="h5"
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                {getSignificanceIcon(significance)}
                <Box>
                    <Typography variant="h6" sx={{ fontStyle: 'italic', mb: 1 }}>
                        "{query}"
                    </Typography>
                    <Chip 
                        label={`${significance.charAt(0).toUpperCase() + significance.slice(1)} Significance`} 
                        size="small" 
                        color={significance === 'high' ? 'success' : significance === 'medium' ? 'warning' : 'info'}
                    />
                </Box>
            </Box>

            <Typography variant="h6" gutterBottom>Why This Matters</Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {summary || "This research question addresses a critical gap in our understanding of therapeutic mechanisms. Through systematic investigation, we can validate or refute this hypothesis using computational biology and AI-powered analysis."}
            </Typography>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                    Scientific Method Status
                </Typography>
                <Typography variant="body2">
                    ✓ Research question formulated<br/>
                    → Literature review in progress<br/>
                    → Experimental design pending
                </Typography>
            </Box>
        </BaseCard>
    );
};

export default HypothesisCard; 