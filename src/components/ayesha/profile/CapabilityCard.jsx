import React from 'react';
import {
    Box, Typography, Paper, Grid,
    Alert, AlertTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CapabilityCard = ({ profile }) => {
    const navigate = useNavigate();
    const tumorContext = profile?.tumor_context || {};
    const germline = profile?.germline || {};

    const capabilities = [
        { label: 'PARP Sensitivity Analysis', available: tumorContext?.hrd_score != null, requires: 'HRD Score' },
        { label: 'Platinum Response Prediction', available: germline?.status != null, requires: 'Germline Status' },
        { label: 'Immune Therapy Eligibility', available: tumorContext?.tmb != null, requires: 'TMB & MSI' },
        { label: 'Targeted Antibody Viability', available: tumorContext?.biomarkers?.folr1_status != null, requires: 'FOLR1 IHC' },
    ];

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                What This Data Unlocks
            </Typography>

            <Grid container spacing={2}>
                {capabilities.map((cap, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                        <Box sx={{
                            p: 2, borderRadius: 2, height: '100%',
                            bgcolor: cap.available ? '#f8fafc' : '#fff',
                            border: '1px solid',
                            borderColor: cap.available ? 'divider' : '#f1f5f9',
                            opacity: cap.available ? 1 : 0.6,
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: cap.available ? 'text.primary' : 'text.disabled' }}>
                                {cap.label}
                            </Typography>
                            {cap.available ? (
                                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                                    ✓ Available now
                                </Typography>
                            ) : (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Requires {cap.requires}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {capabilities.some(c => !c.available) && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}
                    action={
                        <Typography
                            variant="body2"
                            onClick={() => navigate('/ayesha/journey/tests')}
                            sx={{
                                fontWeight: 600, color: 'primary.main',
                                cursor: 'pointer', mt: 1,
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Order Missing Tests →
                        </Typography>
                    }>
                    <AlertTitle sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Missing Capabilities</AlertTitle>
                    We cannot run full predictive models without the missing data above.
                </Alert>
            )}
        </Paper>
    );
};

export default CapabilityCard;
