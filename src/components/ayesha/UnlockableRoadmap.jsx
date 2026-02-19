import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RoadmapStep = ({ level, title, description, status, upside, requires, stepNumber }) => {
    const isLocked = status === 'locked';

    return (
        <Card sx={{
            height: '100%',
            bgcolor: isLocked ? '#f8fafc' : '#ffffff',
            background: isLocked ? undefined : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: isLocked ? '1px dashed #cbd5e1' : '1px solid #bfdbfe',
            borderRadius: '16px',
            boxShadow: isLocked ? 'none' : '0 10px 15px -3px rgba(59, 130, 246, 0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)'
            }
        }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: isLocked ? '#e2e8f0' : '#2563eb',
                            color: isLocked ? '#94a3b8' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}>
                            {stepNumber}
                        </Box>
                        {isLocked ? (
                            <Chip label="Locked" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} />
                        ) : (
                            <Chip label="Active" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} />
                        )}
                    </Box>
                    {isLocked ? <LockIcon sx={{ color: '#cbd5e1' }} /> : <CheckCircleIcon sx={{ color: '#2563eb' }} />}
                </Box>

                <Typography variant="h5" gutterBottom sx={{
                    fontWeight: 800,
                    color: isLocked ? '#475569' : '#1e3a8a',
                    letterSpacing: '-0.5px'
                }}>
                    {title}
                </Typography>

                <Typography variant="body1" sx={{ mb: 3, flexGrow: 1, color: '#64748b', lineHeight: 1.6 }}>
                    {description}
                </Typography>

                {isLocked && requires && (
                    <Box sx={{ mt: 'auto', p: 2, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#94a3b8', mb: 1, letterSpacing: 0.5 }}>
                            REQUIRED TO UNLOCK
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {requires.map(req => (
                                <Chip
                                    key={req}
                                    label={req}
                                    size="small"
                                    sx={{
                                        borderRadius: '6px',
                                        bgcolor: '#f1f5f9',
                                        color: '#475569',
                                        fontWeight: 600,
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {isLocked && upside && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', p: 2, bgcolor: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                        <ScienceIcon sx={{ mr: 1.5, mt: 0.2, color: '#059669', fontSize: 20 }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
                                POTENTIAL UPSIDE
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color="#047857" sx={{ lineHeight: 1.4 }}>
                                {upside}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const UnlockableRoadmap = ({ currentLevel = 'L1' }) => {
    // Helper to check if level is unlocked
    const isUnlocked = (targetLevel) => {
        const levels = { 'L1': 1, 'L2': 2, 'L3': 3 };
        return levels[currentLevel] >= levels[targetLevel];
    };

    return (
        <Box sx={{ mt: 8, mb: 4 }}>
            <Box sx={{ mb: 5, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 2, letterSpacing: '-1px' }}>
                    What We Can Unlock Next
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                    These are research previews showing how your recommendations could change if we add missing data layers.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <RoadmapStep
                        level="L1"
                        stepNumber="1"
                        title="Today's Results (L1)"
                        description="Your current recommendations based on confirmed Tier-1 biomarkers."
                        status="active" // L1 always active
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <RoadmapStep
                        level="L2"
                        stepNumber="2"
                        title="Tumor Sequencing"
                        description="Sequencing your DNA (NGS) allows for HRD scoring and TMB analysis."
                        status={isUnlocked('L2') ? 'active' : 'locked'}
                        requires={['NGS', 'HRD Score']}
                        upside="Refines matches to 90%+ confidence."
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <RoadmapStep
                        level="L3"
                        stepNumber="3"
                        title="Activity Signals"
                        description="RNA expression and proteomic data reveal if the targets are actually active."
                        status={isUnlocked('L3') ? 'active' : 'locked'}
                        requires={['RNA-Seq', 'Proteomics']}
                        upside="Functional confirmation of drug sensitivity."
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default UnlockableRoadmap;
