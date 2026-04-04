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
 */
import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert, CircularProgress, Skeleton, Chip } from '@mui/material';
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

const AyeshaTherapyFit = () => {
    const navigate = useNavigate();
    const [creatingDossier, setCreatingDossier] = useState(false);
    const [showAllCandidates, setShowAllCandidates] = useState(false);

    // Data hooks
    const { data: bundle, isLoading: bundleLoading, error: bundleError } = useAyeshaTherapyFitBundle({ level: 'l1' });
    const { data: doctrineBrief, isLoading: doctrineLoading } = useTargetedTherapyBrief(
        { patientId: 'AYESHA_MAIN', context: bundle?.patient_context },
        { enabled: !!bundle?.patient_context }
    );

    // Loading / Error
    if (bundleLoading || (doctrineLoading && bundle?.patient_context)) {
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

    // Doctrine-mapped therapies
    const prioritized = (doctrineBrief?.options || []).map(opt => ({
        ...opt,
        name: opt.drug_name,
        confidence: opt.final_score,
        molecular_rationale: opt.rationale,
    }));
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
                </Box>
                <Suspense fallback={<LoadingFallback />}>
                    <AyeshaDrugPanel drugs={otherDrugsToShow} onInform={handleInformDoctor} />
                </Suspense>
            </Box>

        </Container>
    );
};

export default AyeshaTherapyFit;
