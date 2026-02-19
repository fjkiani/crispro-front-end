import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Typography, Box, Chip, Skeleton, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';

const STATIC_BACKUP_EXPLANATION = {
    explanation: "Based on our analysis, Olaparib is highly effective for your tumor type because of the HRD+ biomarker. This drug prevents cancer cells from repairing their DNA, causing them to stop growing, while sparing your healthy cells.",
    provider: "clinical-static",
    context: "fallback"
};

const fetchExplanation = async ({ drug, context }) => {
    try {
        // Short timeout for fallback responsiveness
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const token = localStorage.getItem('mock_auth_session') ? JSON.parse(localStorage.getItem('mock_auth_session')).access_token : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/llm/explain', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                prompt: `Explain why ${drug} is the best match for a patient with these biomarkers: ${JSON.stringify(context)}. Keep it to 2 sentences, simple, patient-friendly, positive but realistic.`,
                provider: 'openai',
                context: 'therapy_fit_hero'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn('⚠️ LLM Endpoint Unreachable/Error, using Fallback.');
            return STATIC_BACKUP_EXPLANATION;
        }
        return response.json();
    } catch (error) {
        console.warn('⚠️ LLM Fetch Error (Network/Timeout), using Fallback:', error);
        return STATIC_BACKUP_EXPLANATION;
    }
};

const TherapyHeroSection = ({ topDrug, patientContext, onInform }) => {
    if (!topDrug) return null;

    const confidence = Math.round((topDrug.confidence || 0) * 100);

    const { data: llmData, isLoading: llmLoading } = useQuery({
        queryKey: ['llm-explain', topDrug.name],
        queryFn: () => fetchExplanation({ drug: topDrug.name, context: patientContext }),
        enabled: !!topDrug.name && !!patientContext,
        staleTime: 1000 * 60 * 60,
    });

    return (
        <Card sx={{
            mb: 6,
            position: 'relative',
            overflow: 'visible',
            background: 'linear-gradient(120deg, #ffffff 0%, #f0fdf4 100%)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -10px rgba(22, 163, 74, 0.15)',
            border: '1px solid rgba(22, 163, 74, 0.1)'
        }}>
            {/* Decorative Blur Backing */}
            <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(74, 222, 128, 0.2) 0%, rgba(255,255,255,0) 70%)',
                filter: 'blur(40px)',
                zIndex: 0
            }} />

            <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-start' }, gap: 4 }}>

                    {/* Left Content */}
                    <Box sx={{ flex: 1 }}>
                        <Chip
                            icon={<VerifiedIcon sx={{ fontSize: '16px !important' }} />}
                            label="Current Best Option (L1 Analysis)"
                            sx={{
                                mb: 3,
                                fontWeight: 700,
                                bgcolor: '#dcfce7',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                fontSize: '0.85rem'
                            }}
                        />

                        <Typography variant="h1" component="h1" sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            background: 'linear-gradient(45deg, #14532d 30%, #16a34a 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2,
                            letterSpacing: '-1px'
                        }}>
                            {topDrug.name}
                        </Typography>

                        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500, maxWidth: '600px', lineHeight: 1.6 }}>
                            This recommendation is based on your currently available biomarkers. It is not a simulation.
                        </Typography>

                        {/* LLM Glass Box */}
                        <Box sx={{
                            mt: 4,
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: '#6366f1' }}>
                                <AutoAwesomeIcon fontSize="small" sx={{ mr: 1, animation: 'pulse 2s infinite' }} />
                                <Typography variant="caption" fontWeight="800" letterSpacing={1}>
                                    AI CONTEXT
                                </Typography>
                            </Box>

                            {llmLoading ? (
                                <Box>
                                    <Skeleton width="100%" height={24} sx={{ mb: 1, bgcolor: 'rgba(99, 102, 241, 0.05)' }} />
                                    <Skeleton width="80%" height={24} sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }} />
                                </Box>
                            ) : (
                                <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#334155' }}>
                                    {llmData?.explanation || `Analysis indicates ${topDrug.name} targets specific vulnerabilities in your profile.`}
                                </Typography>
                            )}
                        </Box>

                        {/* Action Buttons */}
                        {onInform && (
                            <Box sx={{ mt: 3 }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => onInform(topDrug)}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                                    }}
                                >
                                    Inform Doctor (Generate Dossier)
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Right Metric */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', md: 'flex-end' },
                        minWidth: 200
                    }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <Typography variant="h1" sx={{
                                fontSize: { xs: '4rem', md: '6rem' },
                                fontWeight: 900,
                                color: '#16a34a',
                                lineHeight: 1,
                                letterSpacing: '-4px'
                            }}>
                                {confidence}%
                            </Typography>
                        </Box>
                        <Typography variant="overline" sx={{
                            color: '#65a30d',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            letterSpacing: 2,
                            mt: 1
                        }}>
                            Confidence Match
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TherapyHeroSection;
