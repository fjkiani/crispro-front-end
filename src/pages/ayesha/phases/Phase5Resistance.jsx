/**
 * Phase 5 — Resistance & Contingency ("If it stops working, what's next?")
 *
 * Sprint 4: Full Kill Chain wiring. Three modes:
 *
 *   Patient mode (default): Contingency Plan cards — plain-English rationale.
 *     - ContingencyCards enriched with API-driven treatmentShift text when
 *       somatic gene data is available.
 *     - MultiMechanismPanel shows detected resistance classes (or "none" if empty)
 *     - KillChainAxisMap shows which 7D axes are active
 *     - ConcordanceStatusBanner shows signal agreement / conflict
 *
 *   Clinician mode (toggle): Full Resistance Lab (SimulationControls/Outcome/Reasoning/Trigger)
 *
 * Data sources:
 *   - useAyeshaProfile()       → germline/somatic genes, MBD4 check
 *   - useResistanceMetadata()  → 12 classes, 7D vectors, priority, geneMap
 *   - useKillChainSignals()    → kill chain summary state for show/hide logic
 *
 * Anti-hallucination: escape/resistance classifier is RUO, not decision-grade.
 * Advanced toggle defaults OFF.
 */
import React, { useState, Suspense } from 'react';
import {
    Box, Typography, Paper, Grid, Alert, Button, Switch, FormControlLabel,
    CircularProgress, Divider,
} from '@mui/material';
import { ArrowForward, Shield, Science } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';

import { useAyeshaProfile } from '../../../hooks/ayesha/useAyeshaProfile';
import { useResistanceMetadata } from '../../../hooks/ayesha/useResistanceMetadata';
import { useKillChainSignals } from '../../../hooks/ayesha/useKillChainSignals';
import {
    buildResistanceClassProps,
    buildActiveAxes,
    buildConcordanceStatus,
} from '../../../utils/resistanceDisplayHelpers';

import MultiMechanismPanel from '../../../components/ayesha/test-detail/MultiMechanismPanel';
import ConcordanceStatusBanner from '../../../components/ayesha/test-detail/ConcordanceStatusBanner';
import KillChainAxisMap from '../../../components/ayesha/test-detail/KillChainAxisMap';
import ResistanceReasoningChain from '../../../components/ayesha/test-detail/ResistanceReasoningChain';

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

// ── Helper: extract somatic genes from profile ────────────────────────────────
// Source: tumor_context.somatic_mutations[] (per ayesha_11_17_25.js profile constant)

function extractSomaticGenes(profile, tumorContext) {
    const genes = new Set();
    // Germline mutations
    (profile?.germline?.mutations || []).forEach(m => m.gene && genes.add(m.gene.toUpperCase()));
    // Somatic mutations — lives at tumorContext.somatic_mutations[]
    (tumorContext?.somatic_mutations || []).forEach(m => m.gene && genes.add(m.gene.toUpperCase()));
    return Array.from(genes);
}

// ── Page Orchestrator ────────────────────────────────────────────────────────

const Phase5Resistance = () => {
    const navigate = useNavigate();
    const [clinicianMode, setClinicianMode] = useState(false);

    // ── Data hooks ─────────────────────────────────────────────────────────
    const { profile, tumorContext } = useAyeshaProfile();
    const { classes, vectors, priority, geneMap, meta, loading: metaLoading, error: metaError } = useResistanceMetadata();
    const { summary } = useKillChainSignals();

    // ── Derived resistance data ─────────────────────────────────────────────
    const somaticGenes = extractSomaticGenes(profile, tumorContext);
    const metadata = { classes, vectors, priority, geneMap };
    const resistanceClasses = buildResistanceClassProps(somaticGenes, metadata);
    // Use class_id field from buildResistanceClassProps output — no name-string lookup needed
    const detectedClassIds = resistanceClasses.map(rc => rc.class_id).filter(Boolean);
    const activeAxes = buildActiveAxes(detectedClassIds, metadata);
    const { concordanceStatus, conflictDetails } = buildConcordanceStatus(detectedClassIds, metadata);

    // ── Show Kill Chain panels if any class detected OR any axis is active ──
    // Note: summary?.state_estimate=='RESISTANCE_DETECTED' is redundant — if Kill Chain
    // fires, somatic genes will be in geneMap and resistanceClasses.length>0 already.
    const killChainActive = resistanceClasses.length > 0 || activeAxes.length > 0;

    // ── Germline-specific contingency ───────────────────────────────────────
    const germline = profile?.germline || {};
    const hasMBD4 = germline?.mutations?.some(m => m.gene === 'MBD4' && m.classification === 'pathogenic');

    // Try to enrich PARP contingency with API-driven treatmentShift
    const brca_meta = classes?.['BRCA_REVERSION'];
    const ccne1_meta = classes?.['CCNE1_AMPLIFICATION'];

    const parpContingency = hasMBD4
        ? [
            { name: 'ATR inhibitors', reason: `MBD4 loss may create synthetic lethality with ATR pathway — based on your MBD4 variant.`, isProfileDriven: true },
            { name: 'WEE1 inhibitors', reason: 'Cell cycle checkpoint vulnerability in MBD4/TP53 co-mutant tumors.', isProfileDriven: true },
        ]
        : brca_meta?.treatmentShift
            ? [
                { name: 'Pathway-targeted alternatives', reason: brca_meta.treatmentShift },
                { name: 'Cyclin E1 pathway agents', reason: ccne1_meta?.treatmentShift || 'CDK2-axis agents when DDR dependency is lost.' },
            ]
            : [
                { name: 'Anti-angiogenics', reason: 'Standard HGSOC contingency when no specific DDR target available.', isProfileDriven: false },
                { name: 'Platinum re-challenge', reason: 'If platinum-free interval is >6 months.', isProfileDriven: false },
            ];

    const platinumContingency = [
        { name: 'Non-platinum chemo', reason: 'Different mechanism than platinum — may still be effective.', isProfileDriven: false },
        { name: 'Antibody-Drug Conjugates (ADCs)', reason: 'Targeted delivery reduces systemic toxicity while attacking tumor cells.', isProfileDriven: false },
        { name: 'Immunotherapy combinations', reason: 'May enhance immune surveillance if biomarkers (like TMB/PD-L1) support it.', isProfileDriven: false },
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
                    /* Patient mode */
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* ── Resistance Metadata error fallback ── */}
                        {metaError && (
                            <Alert severity="warning">
                                Resistance class library temporarily unavailable. Showing standard guidelines only.
                            </Alert>
                        )}

                        {/* ── Section: Active Resistance Mechanisms ── */}
                        {metaLoading ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress size={36} />
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, fontSize: '0.85rem' }}>
                                    Loading resistance class library...
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Divider>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.5 }}>
                                        Kill Chain Intelligence
                                    </Typography>
                                </Divider>

                                {/* MultiMechanismPanel — always shown (handles empty state internally) */}
                                <MultiMechanismPanel resistanceClasses={resistanceClasses} hasError={!!metaError} />

                                {/* KillChainAxisMap — only if at least one class detected */}
                                {killChainActive && (
                                    <KillChainAxisMap axes={activeAxes} />
                                )}

                                {/* ConcordanceStatusBanner — only if ≥2 classes detected */}
                                {detectedClassIds.length >= 2 && concordanceStatus && (
                                    <ConcordanceStatusBanner
                                        concordanceStatus={concordanceStatus}
                                        conflictDetails={conflictDetails}
                                    />
                                )}

                                {/* Reasoning Chain — inside patient mode, not always visible */}
                                {resistanceClasses.length > 0 && (
                                    <ResistanceReasoningChain
                                        resistanceClasses={resistanceClasses}
                                        metadata={{ meta }}
                                    />
                                )}

                                <Divider>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.5 }}>
                                        Contingency Plans
                                    </Typography>
                                </Divider>
                            </>
                        )}

                        {/* ── Contingency Cards ── */}
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
                                        { name: 'Combo IO (anti-CTLA-4 + anti-PD-1)', reason: 'May overcome single-agent resistance by targeting multiple checkpoints. Higher toxicity risk — requires close monitoring.', isProfileDriven: false },
                                        { name: 'IO + targeted therapy', reason: 'Combining IO with PARP or anti-angiogenics may create synergistic immune activation. (Active clinical trial area)', isProfileDriven: false },
                                        { name: 'Alternate checkpoint targets', reason: 'LAG-3, TIGIT, TIM-3 inhibitors in clinical trials. Emerging options for IO-refractory patients.', isProfileDriven: false },
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
                    </Box>
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
                        Contingency: rules_v1_germline + kill_chain_metadata_v1 //
                        Somatic genes detected: {somaticGenes.length > 0 ? somaticGenes.join(', ') : 'none'} //
                        Resistance classes: {resistanceClasses.length || 'none'} //
                        Source: local profile + resistance metadata API
                    </Typography>
                </Box>
            </Box>
        </JourneyLayout>
    );
};

export default Phase5Resistance;
