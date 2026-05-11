/**
 * AyeshaTherapyFit — Full therapy fit analysis page.
 *
 * Thin orchestrator. Composes shared therapy-fit components.
 * 405 lines → ~150 lines.
 *
 * Sections:
 *   1. Resistance Gate Banner
 *   2. IO Harm Gate
 *   3. Hero (Top Drug)
 *   4. Mechanism of Action (SyntheticLethality + Combo + DDR + HRD)
 *   5. Unlockable Roadmap
 *   6. Scenario Library (L2/L3)
 *   7. Other Candidates (Tier 2 & 3)
 *
 * FE-AK-001 (2026-05-10): Hero drug now sourced from bundle levels.L1.efficacy.drugs
 *   instead of the legacy /targeted-brief endpoint. useTargetedTherapyBrief is retained
 *   only as a fallback when bundle drugs are unavailable, and is labelled LEGACY when used.
 * FE-AK-003 (2026-05-10): Reads levels.L1.efficacy.honesty; renders HEURISTIC SCORING
 *   badge when heuristic_sequence_used=true.
 */
import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert, CircularProgress, Skeleton, Chip, Tooltip } from '@mui/material';
import { useAyeshaTherapyFitBundle } from '../../hooks/useAyeshaTherapyFitBundle';
import { useTargetedTherapyBrief } from '../../hooks/useTargetedTherapyBrief';
import TherapyHeroSection from '../../components/ayesha/TherapyHeroSection';
import { API_ROOT } from '../../lib/apiConfig';
import {
    IOHarmGateSection,
    ScenarioLibrarySection,
} from '../../components/therapy-fit';
import '../../components/therapy-fit/therapy-fit.css';

// Lazy-loaded components
const AyeshaDrugPanel = React.lazy(() => import('../../components/ayesha/AyeshaDrugPanel'));
const UnlockableRoadmap = React.lazy(() => import('../../components/ayesha/UnlockableRoadmap'));
const SyntheticLethalityCard = React.lazy(() => import('../../components/ayesha/SyntheticLethalityCard'));
const ComboRationaleCard = React.lazy(() => import('../../components/ayesha/ComboRationaleCard'));
const DDRSubVectorCard = React.lazy(() => import('../../components/ayesha/DDRSubVectorCard'));
const HRDUnlockPanel = React.lazy(() => import('../../components/ayesha/HRDUnlockPanel'));
const ResistanceGateBanner = React.lazy(() => import('../../components/ayesha/ResistanceGateBanner'));

const LoadingFallback = () => <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4, mb: 4 }} />;

// ─── FE-AK-003: Heuristic Scoring Badge ─────────────────────────────────────
/**
 * Renders a visible warning badge when the scoring engine used heuristic
 * sequencing rather than a fully evidence-backed model.
 * Reads: levels.L1.efficacy.honesty.heuristic_sequence_used (bool)
 *        levels.L1.efficacy.honesty.sequence_engine (string)
 *        levels.L1.efficacy.honesty.evidence_status (string)
 */
const HeuristicScoringBadge = ({ honesty }) => {
    if (!honesty?.heuristic_sequence_used) return null;

    const engine = honesty.sequence_engine || 'heuristic';
    const evidenceStatus = honesty.evidence_status || 'UNKNOWN';

    return (
        <Tooltip
            title={`Scoring engine: ${engine} · Evidence status: ${evidenceStatus}. Drug rankings are based on heuristic sequencing, not a fully validated predictive model. Treat scores as directional estimates only.`}
            arrow
        >
            <Chip
                label="⚠ HEURISTIC SCORING"
                size="small"
                sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    letterSpacing: 0.5,
                    bgcolor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fcd34d',
                    cursor: 'help',
                    height: 24,
                }}
            />
        </Tooltip>
    );
};

const AyeshaTherapyFit = () => {
    const navigate = useNavigate();
    const [creatingDossier, setCreatingDossier] = useState(false);
    const [showAllCandidates, setShowAllCandidates] = useState(false);

    // Data hooks
    const { data: bundle, isLoading: bundleLoading, error: bundleError } = useAyeshaTherapyFitBundle({ level: 'l1' });

    // FE-AK-001: useTargetedTherapyBrief is now a FALLBACK only.
    // It fires only when bundle drugs are absent (e.g. backend returns empty efficacy).
    const bundleDrugs = bundle?.levels?.L1?.efficacy?.drugs ?? [];
    const needsLegacyFallback = !bundleLoading && bundleDrugs.length === 0;

    const { data: doctrineBrief, isLoading: doctrineLoading } = useTargetedTherapyBrief(
        { patientId: 'AYESHA_MAIN', context: bundle?.patient_context },
        { enabled: needsLegacyFallback && !!bundle?.patient_context }
    );

    // Loading / Error
    if (bundleLoading || (doctrineLoading && needsLegacyFallback && bundle?.patient_context)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (bundleError) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Alert severity="error">Failed to load patient context: {bundleError.message}</Alert>
            </Container>
        );
    }

    const { patient_context, synthetic_lethality, l2_scenarios, l3_scenarios, preview_cache, levels } = bundle || {};
    const currentLevel = levels?.L1?.completeness?.level || 'L1';
    const resistanceGateData = levels?.L1?.resistance_gate;

    // FE-AK-003: Read honesty field from bundle
    const honesty = levels?.L1?.efficacy?.honesty ?? null;

    // FE-AK-001: Primary source = bundle drugs; fallback = legacy targeted-brief
    let prioritized;
    let usingLegacySource = false;

    if (bundleDrugs.length > 0) {
        // Primary path: map bundle drug shape → display shape
        prioritized = bundleDrugs.map(drug => ({
            ...drug,
            name: drug.drug_name || drug.name || drug.drug,
            confidence: drug.final_score ?? drug.confidence ?? drug.efficacy_score ?? 0,
            molecular_rationale: drug.rationale || drug.molecular_rationale,
        }));
    } else {
        // Fallback path: legacy /targeted-brief (labelled LEGACY in UI)
        usingLegacySource = true;
        prioritized = (doctrineBrief?.options || []).map(opt => ({
            ...opt,
            name: opt.drug_name,
            confidence: opt.final_score,
            molecular_rationale: opt.rationale,
        }));
    }

    const topDrug = prioritized[0];
    const otherDrugs = prioritized.slice(1);
    const otherDrugsToShow = showAllCandidates ? otherDrugs : otherDrugs.slice(0, 12);

    const handleInformDoctor = async (drug) => {
        if (creatingDossier) return;
        setCreatingDossier(true);
        try {
            const payload = {
                drug_data: {
                    ...drug,
                    drug: drug.name || drug.drug || 'Unknown',
                    label_status: drug.label_status || 'UNKNOWN',
                    efficacy_score: drug.confidence || drug.efficacy_score || 0,
                    confidence: drug.confidence || 0,
                    evidence_tier: drug.evidence_tier || 'L1',
                    badges: drug.badges || [],
                    clinical_band: drug.clinical_band || 'Likely Responsive',
                    rationale: drug.molecular_rationale || drug.rationale,
                    citations_count: drug.citations_count || 0,
                },
                context: {
                    patient_id: 'AK',
                    level: currentLevel,
                    scenario: patient_context?.tumor_context?.scenario || 'Unknown',
                    mutations: patient_context?.genomic_profile?.mutations || [],
                },
                provenance: { source: 'AyeshaTherapyFit', version: '2.0' },
            };

            const res = await fetch(`${API_ROOT}/api/ayesha/dossiers/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to generate dossier');
            const data = await res.json();
            navigate(data.path);
        } catch (err) {
            console.error('Dossier creation failed:', err);
            alert('Failed to create dossier: ' + err.message);
        } finally {
            setCreatingDossier(false);
        }
    };

    return (
        <Container maxWidth="xl" className="tf-page">

            {/* Beat 0: Resistance Gate */}
            <Suspense fallback={null}>
                <ResistanceGateBanner data={resistanceGateData} />
            </Suspense>

            {/* Beat 0.5: IO Harm Prevention Gate */}
            <Box className="tf-section tf-section--narrow">
                <IOHarmGateSection ioHarmData={bundle?.io_harm_prevention} />
            </Box>

            {/* FE-AK-001 legacy source warning */}
            {usingLegacySource && (
                <Box sx={{ mb: 2 }}>
                    <Alert
                        severity="warning"
                        sx={{ fontSize: '0.82rem', fontWeight: 600 }}
                    >
                        <strong>LEGACY DATA SOURCE</strong> — Hero drug is sourced from the deprecated{' '}
                        <code>/targeted-brief</code> endpoint because the bundle returned no drug candidates.
                        Drug rankings may not reflect the latest scoring model. Contact engineering if this
                        persists.
                    </Alert>
                </Box>
            )}

            {/* FE-AK-003: Heuristic scoring notice (shown above hero when active) */}
            {honesty?.heuristic_sequence_used && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <HeuristicScoringBadge honesty={honesty} />
                    <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.78rem' }}>
                        Drug scores are heuristic estimates — not validated predictions. Rankings are directional only.
                    </Typography>
                </Box>
            )}

            {/* Beat 1: Hero — Top Drug */}
            <TherapyHeroSection
                topDrug={topDrug}
                patientContext={patient_context}
                onInform={handleInformDoctor}
            />

            {/* Beat 2: Mechanism of Action */}
            <Box className="tf-section tf-section--narrow" sx={{ mb: 8 }}>
                <Box className="tf-section--centered" sx={{ mb: 4 }}>
                    <Typography variant="overline" className="tf-section-overline">
                        MECHANISM OF ACTION
                    </Typography>
                    <Typography variant="h3" gutterBottom className="tf-section-title">
                        Why this drug fits your tumor biology
                    </Typography>
                </Box>

                <Suspense fallback={<LoadingFallback />}>
                    <SyntheticLethalityCard data={synthetic_lethality} evidence={topDrug?.molecular_rationale} />
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    <Box sx={{ mt: 4 }}><ComboRationaleCard slData={synthetic_lethality} /></Box>
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    <Box sx={{ mt: 4 }}><DDRSubVectorCard slData={synthetic_lethality} /></Box>
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    <Box sx={{ mt: 4 }}>
                        <HRDUnlockPanel completeness={levels?.L1?.completeness} testsNeeded={bundle?.tests_needed} />
                    </Box>
                </Suspense>
            </Box>

            {/* Beat 3: Unlockable Roadmap */}
            <Suspense fallback={<LoadingFallback />}>
                <UnlockableRoadmap currentLevel={currentLevel} />
            </Suspense>

            {/* Beat 3.5: Scenario Library */}
            <ScenarioLibrarySection
                l2Scenarios={l2_scenarios}
                l3Scenarios={l3_scenarios}
                previewCache={preview_cache}
            />

            {/* Appendix: Other Candidates */}
            <Box className="tf-other-candidates">
                <Typography variant="h5" gutterBottom className="tf-other-candidates__title">
                    Other Considerations (Tier 2 & 3)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        clickable
                        variant={showAllCandidates ? 'outlined' : 'filled'}
                        color={showAllCandidates ? 'default' : 'primary'}
                        label={showAllCandidates ? 'Showing all candidates' : 'Showing top 12 (click to show all)'}
                        onClick={() => setShowAllCandidates(v => !v)}
                    />
                    <Chip size="small" variant="outlined" label={`Total candidates: ${otherDrugs.length}`} />
                    {/* FE-AK-003: Heuristic badge in candidates header */}
                    <HeuristicScoringBadge honesty={honesty} />
                </Box>
                <Suspense fallback={<LoadingFallback />}>
                    <AyeshaDrugPanel drugs={otherDrugsToShow} onInform={handleInformDoctor} />
                </Suspense>
            </Box>

        </Container>
    );
};

export default AyeshaTherapyFit;
