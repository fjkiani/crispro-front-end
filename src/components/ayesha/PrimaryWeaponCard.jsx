import React, { useState } from 'react';
import { Alert, Card, CardContent, Typography, Box, Chip, Skeleton, Button, Collapse, Divider } from '@mui/material';
import { Crosshair, Target, Zap, ScrollText, BookOpen, AlertCircle } from 'lucide-react';

const STATIC_BACKUP_EXPLANATION = {
    explanation: "This treatment targets the tumor's inability to repair DNA (HRD+). By exploiting this specific vulnerability, we can induce cancer cell death while sparing healthy tissue — a process known as synthetic lethality.",
    provider: "zeta-static",
    context: "fallback"
};

const PrimaryWeaponCard = ({ topDrug, patientContext, onInform, isSimulation }) => {
    if (!topDrug) return null;

    const confidence = Math.round((topDrug.confidence || 0) * 100);
    const llmData = STATIC_BACKUP_EXPLANATION;
    const [showEvidence, setShowEvidence] = useState(false);

    const tier = topDrug.evidence_tier || "Research";
    const citations = topDrug.citations_count || 0;
    const clinicalBand = topDrug.clinical_band || "Likely Responsive";

    return (
        <Card sx={{
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: isSimulation ? '2px solid' : '1px solid',
            borderColor: isSimulation ? 'secondary.main' : 'divider',
            boxShadow: isSimulation ? '0 4px 20px rgba(124, 58, 237, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        }}>
            {/* Simulation Banner */}
            {isSimulation && (
                <Box sx={{ bgcolor: 'secondary.main', color: '#fff', py: 0.75, textAlign: 'center', fontWeight: 700, letterSpacing: 1, fontSize: '0.8125rem' }}>
                    SIMULATION MODE — HYPOTHETICAL OUTCOME
                </Box>
            )}

            <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-start' }, gap: 4 }}>

                    {/* Left Content */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Crosshair color="#2563eb" size={20} />
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1, fontSize: '0.8125rem' }}>
                                Recommended Treatment
                            </Typography>
                            <Chip
                                label={tier === 'I' ? "Tier 1 Evidence" : `Tier ${tier}`}
                                size="small"
                                icon={<BookOpen size={12} />}
                                sx={{ fontWeight: 600, bgcolor: tier === 'I' ? 'success.light' : '#f1f5f9', color: tier === 'I' ? 'success.dark' : 'text.secondary' }}
                            />
                        </Box>

                        <Typography variant="h2" component="h1" sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.75rem' },
                            color: 'text.primary',
                            mb: 1.5,
                            letterSpacing: '-1px',
                        }}>
                            {topDrug.name}
                        </Typography>

                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '600px', lineHeight: 1.6, fontSize: '1.0625rem' }}>
                            {clinicalBand} — Targeting verified vulnerabilities in the tumor's defense mechanisms.
                        </Typography>

                        {/* Tabs: How It Works / Clinical Evidence */}
                        <Box sx={{ mt: 4, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Box
                                    onClick={() => setShowEvidence(false)}
                                    sx={{
                                        p: 1.5, px: 2.5, cursor: 'pointer',
                                        borderBottom: !showEvidence ? '2px solid' : 'none',
                                        borderColor: 'primary.main',
                                        color: !showEvidence ? 'primary.main' : 'text.secondary',
                                        fontWeight: !showEvidence ? 600 : 400,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Target size={16} />
                                        <Typography variant="body2" fontWeight="inherit">How It Works</Typography>
                                    </Box>
                                </Box>
                                <Box
                                    onClick={() => setShowEvidence(true)}
                                    sx={{
                                        p: 1.5, px: 2.5, cursor: 'pointer',
                                        borderBottom: showEvidence ? '2px solid' : 'none',
                                        borderColor: 'primary.main',
                                        color: showEvidence ? 'primary.main' : 'text.secondary',
                                        fontWeight: showEvidence ? 600 : 400,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ScrollText size={16} />
                                        <Typography variant="body2" fontWeight="inherit">Clinical Evidence ({citations})</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                p: 3,
                                background: '#fafbff',
                                borderLeft: '4px solid',
                                borderColor: 'primary.main',
                                minHeight: 100
                            }}>
                                {!showEvidence ? (
                                    <Typography variant="body1" sx={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'text.primary' }}>
                                        {llmData.explanation}
                                    </Typography>
                                ) : (
                                    <Box>
                                        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Clinical Band</Typography>
                                                <Typography variant="body2" color="text.primary" fontWeight="700">{clinicalBand}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Evidence Tier</Typography>
                                                <Typography variant="body2" color="text.primary" fontWeight="700">{tier}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Citations</Typography>
                                                <Typography variant="body2" color="text.primary" fontWeight="700">{citations} Papers</Typography>
                                            </Box>
                                        </Box>
                                        <Alert severity="info" icon={<AlertCircle size={20} />}>
                                            Clinical evidence suggests high sensitivity in similar HRD+ contexts.
                                        </Alert>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        {onInform && !isSimulation && (
                            <Box sx={{ mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => onInform(topDrug)}
                                    startIcon={<Zap size={18} />}
                                    sx={{
                                        py: 1.5,
                                        px: 4,
                                        fontWeight: 700,
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Generate Detailed Report
                                </Button>
                            </Box>
                        )}
                        {isSimulation && (
                            <Box sx={{ mt: 3 }}>
                                <Button disabled variant="outlined" sx={{ color: 'text.disabled', borderColor: 'divider' }}>
                                    Simulation Mode — Report Generation Locked
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Right Metric */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        justifyContent: 'center',
                        minWidth: 160,
                        p: 3,
                        bgcolor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <Typography variant="h1" sx={{
                            fontSize: { xs: '3.5rem', md: '4.5rem' },
                            fontWeight: 900,
                            color: 'primary.main',
                            lineHeight: 1,
                            letterSpacing: '-3px',
                        }}>
                            {confidence}%
                        </Typography>
                        <Typography variant="overline" sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            letterSpacing: 2,
                            mt: 1,
                            textAlign: 'center',
                        }}>
                            Compatibility
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PrimaryWeaponCard;
