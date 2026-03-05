/**
 * Phase 5 — Resistance & Contingency ("If it stops working, what's next?")
 *
 * Two modes:
 *   Patient mode (default): Contingency Plan cards — plain-English rationale
 *   Clinician mode (toggle): Full Resistance Lab (SimulationControls/Outcome/Reasoning/Trigger)
 *
 * Anti-hallucination: escape/resistance classifier is RUO, not decision-grade.
 * Advanced toggle defaults OFF.
 */
import React, { useState, Suspense } from 'react';
import {
    Box, Typography, Paper, Grid, Alert, Button, Switch, FormControlLabel,
    CircularProgress,
} from '@mui/material';
import { ArrowForward, Shield, Science } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';

import { useAyeshaProfile } from '../../../hooks/ayesha/useAyeshaProfile';

// Lazy-load the existing ResistanceLab to avoid pulling its entire bundle up-front
const ResistanceLab = React.lazy(() => import('../ResistanceLab'));

// ── Contingency Card ─────────────────────────────────────────────────────────

const ContingencyCard = ({ title, rationale, classes, children }) => (
    <Paper sx={{
        p: 3, borderRadius: 3,
        border: '1px solid', borderColor: 'divider',
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Shield sx={{ fontSize: 20, color: 'warning.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {title}
            </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {rationale}
        </Typography>
        {classes && classes.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {classes.map((cls, i) => (
                    <Box key={i} sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider',
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cls.name}
                            {cls.isProfileDriven && (
                                <Box component="span" sx={{
                                    ml: 1, px: 0.75, py: 0.25, borderRadius: 1,
                                    bgcolor: 'primary.light', color: 'primary.dark',
                                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.02em',
                                }}>
                                    PROFILE-DRIVEN
                                </Box>
                            )}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {cls.reason}
                        </Typography>
                    </Box>
                ))}
            </Box>
        )}
        {children}
    </Paper>
);

// ── Page Orchestrator ────────────────────────────────────────────────────────

const Phase5Resistance = () => {
    const navigate = useNavigate();
    const [clinicianMode, setClinicianMode] = useState(false);

    // Read germline to determine contingency type
    const { profile } = useAyeshaProfile();
    const germline = profile?.germline || {};
    const hasMBD4 = germline?.mutations?.some(m => m.gene === 'MBD4' && m.classification === 'pathogenic');

    // Contingency classes derived from profile vs standard guidelines
    const parpContingency = hasMBD4
        ? [
            { name: 'ATR inhibitors', reason: `MBD4 loss may create synthetic lethality with ATR pathway — based on your MBD4 variant.`, isProfileDriven: true },
            { name: 'WEE1 inhibitors', reason: 'Cell cycle checkpoint vulnerability in MBD4/TP53 co-mutant tumors.', isProfileDriven: true },
        ]
        : [
            { name: 'Anti-angiogenics', reason: 'Standard HGSOC contingency when no specific DDR target available. (Standard Guideline)' },
            { name: 'Platinum re-challenge', reason: 'If platinum-free interval is >6 months. (Standard Guideline)' },
        ];

    const platinumContingency = [
        { name: 'Non-platinum chemo', reason: 'Different mechanism than platinum — may still be effective. (Standard Guideline)' },
        { name: 'Antibody-Drug Conjugates (ADCs)', reason: 'Targeted delivery reduces systemic toxicity while attacking tumor cells. (Standard Guideline)' },
        { name: 'Immunotherapy combinations', reason: 'May enhance immune surveillance if biomarkers (like TMB/PD-L1) support it. (Standard Guideline)' },
    ];

    return (
        <JourneyLayout>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                <Alert severity="warning">
                    <strong>Research Use Only.</strong> This is an early-warning lens, not a diagnosis.
                    We show the chain of reasoning as receipts when available.
                </Alert>

                {/* Mode toggle */}
                <Paper sx={{
                    p: 2, borderRadius: 2, display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', border: '1px solid', borderColor: 'divider',
                }}>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {clinicianMode ? '🔬 Clinician View' : '📋 Patient View'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {clinicianMode
                                ? 'Full simulation controls, reasoning chain, and trigger feed.'
                                : 'Simplified contingency plan with plain-English explanations.'}
                        </Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={clinicianMode}
                                onChange={(e) => setClinicianMode(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Advanced</Typography>}
                    />
                </Paper>

                {clinicianMode ? (
                    /* Clinician mode: full Resistance Lab */
                    <Suspense fallback={
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress size={48} sx={{ mb: 2 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Loading Resistance Lab...
                            </Typography>
                        </Box>
                    }>
                        <ResistanceLab />
                    </Suspense>
                ) : (
                    /* Patient mode: contingency cards */
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <ContingencyCard
                                title="If PARP Resistance Develops"
                                rationale="If your tumor develops resistance to PARP inhibitors, these are the next treatment classes to consider."
                                classes={parpContingency}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <ContingencyCard
                                title="If Platinum Resistance Develops"
                                rationale="If disease progresses within 6 months of last platinum, these alternatives are considered."
                                classes={platinumContingency}
                            >
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <Typography variant="caption">
                                        To confirm or deny resistance hypotheses: consider repeat biopsy, repeat NGS, or ctDNA monitoring.
                                    </Typography>
                                </Alert>
                            </ContingencyCard>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <ContingencyCard
                                title="If IO Resistance Develops"
                                rationale="If immunotherapy stops working or if IO was ruled out, these are the contingency options."
                                classes={[
                                    { name: 'Combo IO (anti-CTLA-4 + anti-PD-1)', reason: 'May overcome single-agent resistance by targeting multiple checkpoints. Higher toxicity risk — requires close monitoring.' },
                                    { name: 'IO + targeted therapy', reason: 'Combining IO with PARP or anti-angiogenics may create synergistic immune activation. (Active clinical trial area)' },
                                    { name: 'Alternate checkpoint targets', reason: 'LAG-3, TIGIT, TIM-3 inhibitors in clinical trials. Emerging options for IO-refractory patients.' },
                                ]}
                            >
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    <Typography variant="caption">
                                        IO response in HGSOC is rare (~10–15% monotherapy ORR).
                                        Rule-out gating may prevent unnecessary IO exposure.
                                        See Phase 3 → IO Harm Prevention for your personalized assessment.
                                    </Typography>
                                </Alert>
                            </ContingencyCard>
                        </Grid>
                    </Grid>
                )}

                {/* CTA */}
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/ayesha/journey/board')}
                    sx={{ fontWeight: 600, py: 1.5, alignSelf: 'center', px: 5 }}
                >
                    Build Tumor Board Packet →
                </Button>

                <Box sx={{
                    textAlign: 'center', pt: 4, pb: 2,
                    display: 'flex', flexDirection: 'column', gap: 1
                }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: '0.5px' }}>
                        PROVENANCE LOG
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                        Contingency engine: rules_v1_germline // Data mapped from: profile.germline.mutations // Data generated: {new Date().toLocaleDateString()}
                    </Typography>
                </Box>
            </Box>
        </JourneyLayout>
    );
};

export default Phase5Resistance;
