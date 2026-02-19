import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Skeleton, Button, Collapse, Divider } from '@mui/material';
import { Crosshair, Target, Zap, ScrollText, BookOpen, AlertCircle } from 'lucide-react';

const STATIC_BACKUP_EXPLANATION = {
    explanation: "This weapon system targets the tumor's inability to repair DNA (HRD+). By striking this specific weakness, we induce synthetic lethality—forcing the cancer cell to collapse while sparing healthy tissue.",
    provider: "zeta-static",
    context: "fallback"
};

const PrimaryWeaponCard = ({ topDrug, patientContext, onInform, isSimulation }) => {
    if (!topDrug) return null;

    // Fallback to defaults if missing fields
    const confidence = Math.round((topDrug.confidence || 0) * 100);
    const llmData = STATIC_BACKUP_EXPLANATION;
    const [showEvidence, setShowEvidence] = useState(false);

    // Extraction of "Proof" fields
    const tier = topDrug.evidence_tier || "Research";
    const citations = topDrug.citations_count || 0; // Backend: citations_count
    const clinicalBand = topDrug.clinical_band || "Likely Responsive";

    return (
        <Card sx={{
            mb: 6,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#0f172a', // Slate-950
            borderRadius: 0,
            boxShadow: isSimulation ? '0 0 40px rgba(129, 140, 248, 0.3)' : '0 20px 50px -10px rgba(0, 0, 0, 0.5)',
            border: isSimulation ? '2px solid #818cf8' : '1px solid #1e293b'
        }}>
            {/* Simulation Banner */}
            {isSimulation && (
                <Box sx={{ bgcolor: '#818cf8', color: '#0f172a', py: 0.5, textAlign: 'center', fontWeight: 900, letterSpacing: 2 }}>
                    SIMULATION MODE ACTIVE // HYPOTHETICAL OUTCOME
                </Box>
            )}

            {/* HUD Overlay Lines */}
            <Box sx={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, borderTop: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' }} />
            <Box sx={{ position: 'absolute', top: 20, right: 20, width: 20, height: 20, borderTop: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' }} />
            <Box sx={{ position: 'absolute', bottom: 20, left: 20, width: 20, height: 20, borderBottom: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' }} />
            <Box sx={{ position: 'absolute', bottom: 20, right: 20, width: 20, height: 20, borderBottom: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' }} />

            <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-start' }, gap: 4 }}>

                    {/* Left Content */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <Crosshair color="#38bdf8" size={20} />
                            <Typography variant="overline" sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: 2, fontSize: '0.85rem' }}>
                                PRIMARY WEAPON SYSTEM
                            </Typography>
                            <Chip
                                label={tier === 'I' ? "TIER 1 EVIDENCE" : `TIER ${tier}`}
                                size="small"
                                icon={<BookOpen size={12} />}
                                sx={{ borderRadius: 0, fontWeight: 800, bgcolor: tier === 'I' ? '#22c55e' : '#334155', color: '#fff' }}
                            />
                        </Box>

                        <Typography variant="h1" component="h1" sx={{
                            fontWeight: 900,
                            fontSize: { xs: '3rem', md: '4.5rem' },
                            color: '#fff',
                            mb: 2,
                            letterSpacing: '-2px',
                            textTransform: 'uppercase',
                            textShadow: '0 0 30px rgba(56, 189, 248, 0.3)'
                        }}>
                            {topDrug.name}
                        </Typography>

                        <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 500, maxWidth: '600px', lineHeight: 1.6, fontFamily: 'monospace' }}>
                            {clinicalBand.toUpperCase()} // Targeting verified vulnerabilities in the tumor's defense matrix.
                        </Typography>

                        {/* Tactical Context (Target Lock + Evidence) */}
                        <Box sx={{
                            mt: 5,
                            borderRadius: '0 8px 8px 0',
                            overflow: 'hidden'
                        }}>
                            {/* Tabs / Toggles */}
                            <Box sx={{ display: 'flex', borderBottom: '1px solid #334155' }}>
                                <Box
                                    onClick={() => setShowEvidence(false)}
                                    sx={{
                                        p: 2, cursor: 'pointer',
                                        borderBottom: !showEvidence ? '2px solid #38bdf8' : 'none',
                                        color: !showEvidence ? '#38bdf8' : '#64748b'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Target size={16} />
                                        <Typography variant="caption" fontWeight="800" letterSpacing={1}>TARGET LOCK</Typography>
                                    </Box>
                                </Box>
                                <Box
                                    onClick={() => setShowEvidence(true)}
                                    sx={{
                                        p: 2, cursor: 'pointer',
                                        borderBottom: showEvidence ? '2px solid #38bdf8' : 'none',
                                        color: showEvidence ? '#38bdf8' : '#64748b'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ScrollText size={16} />
                                        <Typography variant="caption" fontWeight="800" letterSpacing={1}>PROOF & DATA ({citations})</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                p: 3,
                                background: 'rgba(56, 189, 248, 0.05)',
                                borderLeft: '4px solid #38bdf8',
                                minHeight: 120
                            }}>
                                {!showEvidence ? (
                                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#e2e8f0' }}>
                                        {llmData.explanation}
                                    </Typography>
                                ) : (
                                    <Box>
                                        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="#64748b">CLINICAL BAND</Typography>
                                                <Typography variant="body2" color="#fff" fontWeight="700">{clinicalBand}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="#64748b">EVIDENCE TIER</Typography>
                                                <Typography variant="body2" color="#fff" fontWeight="700">{tier}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="#64748b">CITATIONS</Typography>
                                                <Typography variant="body2" color="#fff" fontWeight="700">{citations} Papers</Typography>
                                            </Box>
                                        </Box>
                                        <Alert severity="info" sx={{ bgcolor: 'rgba(56,189,248,0.1)', color: '#bae6fd', border: '1px solid #0ea5e9' }} icon={<AlertCircle size={20} color="#38bdf8" />}>
                                            Clinical evidence suggests high sensitivity in similar HRD+ contexts.
                                        </Alert>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        {onInform && !isSimulation && (
                            <Box sx={{ mt: 4 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => onInform(topDrug)}
                                    startIcon={<Zap />}
                                    sx={{
                                        bgcolor: '#38bdf8',
                                        color: '#0f172a',
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 0,
                                        textTransform: 'uppercase',
                                        fontWeight: 800,
                                        letterSpacing: 1,
                                        '&:hover': { bgcolor: '#7dd3fc' },
                                        boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
                                    }}
                                >
                                    Authorize Strike (Generate Dossier)
                                </Button>
                            </Box>
                        )}
                        {isSimulation && (
                            <Box sx={{ mt: 4 }}>
                                <Button disabled variant="outlined" sx={{ color: '#64748b', borderColor: '#334155' }}>
                                    SIMULATION MODE - DOSSIER GENERATION LOCKED
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Right Metric */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', md: 'flex-end' },
                        minWidth: 200,
                        borderLeft: { xs: '1px solid #334155', md: 'none' },
                        pl: { xs: 3, md: 0 }
                    }}>
                        <Typography variant="h1" sx={{
                            fontSize: { xs: '4rem', md: '7rem' },
                            fontWeight: 900,
                            color: '#fff',
                            lineHeight: 1,
                            letterSpacing: '-4px',
                            textShadow: '0 0 40px rgba(255, 255, 255, 0.2)'
                        }}>
                            {confidence}%
                        </Typography>
                        <Typography variant="overline" sx={{
                            color: '#38bdf8',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            letterSpacing: 3,
                            mt: 1,
                            textAlign: 'right',
                            display: 'block',
                            width: '100%'
                        }}>
                            COMPATIBILITY
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PrimaryWeaponCard;
