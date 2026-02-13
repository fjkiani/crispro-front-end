import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert, CircularProgress, Skeleton, Card, CardContent, Grid, Chip } from '@mui/material';
import { useAyeshaTherapyFitBundle } from '../../hooks/useAyeshaTherapyFitBundle';
import { useTargetedTherapyBrief } from '../../hooks/useTargetedTherapyBrief'; // Doctrine Hook
import TherapyHeroSection from '../../components/ayesha/TherapyHeroSection';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

// Optimizing Mobile Payload: Lazy load non-critical below-the-fold components
const AyeshaDrugPanel = React.lazy(() => import('../../components/ayesha/AyeshaDrugPanel'));
const UnlockableRoadmap = React.lazy(() => import('../../components/ayesha/UnlockableRoadmap'));
const SyntheticLethalityCard = React.lazy(() => import('../../components/ayesha/SyntheticLethalityCard'));

const LoadingFallback = () => <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4, mb: 4 }} />;

const AyeshaTherapyFit = () => {
    const navigate = useNavigate();
    const [creatingDossier, setCreatingDossier] = useState(false);
    const [showAllCandidates, setShowAllCandidates] = useState(false);
    // 1. Fetch Context (Legacy Channel)
    const { data: bundle, isLoading: bundleLoading, error: bundleError } = useAyeshaTherapyFitBundle({ level: 'l1' });

    // 2. Fetch Doctrine Logic (New Engine)
    const { data: doctrineBrief, isLoading: doctrineLoading } = useTargetedTherapyBrief({
        patientId: 'AYESHA_MAIN',
        context: bundle?.patient_context
    }, {
        enabled: !!bundle?.patient_context
    });

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
                <Alert severity="error">
                    Failed to load patient context: {bundleError.message}
                </Alert>
            </Container>
        );
    }

    const { patient_context, synthetic_lethality, l2_scenarios, l3_scenarios, preview_cache } = bundle || {};

    // Determine Unlock Status (Default to L1 if missing)
    // builder.py calculates completeness_score. 
    // L1 < 0.7 <= L2 < 0.9 <= L3
    // We can interpret the score directly.
    const completeness = patient_context?.tumor_context?.completeness_score || 0.4;
    let currentLevel = 'L1';
    if (completeness >= 0.9) currentLevel = 'L3';
    else if (completeness >= 0.7) currentLevel = 'L2';

    // STRANGLER PATTERN: Override priorities with Doctrine Brief if available
    const prioritized_therapies = doctrineBrief?.options || [];

    // Map Doctrine fields to UI expectation if needed (Adapter Layer in UI)
    // New Schema: { drug_name, score, rationale, ... }
    // UI Expects: { name: drug_name, confidence: score, molecular_rationale: rationale }
    const mappedTherapies = prioritized_therapies.map(opt => ({
        ...opt,
        name: opt.drug_name,
        confidence: opt.final_score,
        molecular_rationale: opt.rationale
    }));

    const topDrug = mappedTherapies[0];
    const otherDrugs = mappedTherapies.slice(1);
    const otherDrugsToShow = showAllCandidates ? otherDrugs : otherDrugs.slice(0, 12);

    const handleInformDoctor = async (drug) => {
        if (creatingDossier) return;
        setCreatingDossier(true);
        try {
            const payload = {
                drug_data: {
                    ...drug,
                    drug: drug.name || drug.drug || "Unknown",
                    label_status: drug.label_status || "UNKNOWN",
                    efficacy_score: drug.confidence || drug.efficacy_score || 0,
                    confidence: drug.confidence || 0,
                    evidence_tier: drug.evidence_tier || "L1",
                    badges: drug.badges || [],
                    clinical_band: drug.clinical_band || "Likely Responsive",
                    rationale: drug.molecular_rationale || drug.rationale,
                    citations_count: drug.citations_count || 0
                },
                context: {
                    patient_id: "AK",
                    level: currentLevel,
                    scenario: patient_context?.tumor_context?.scenario || "Unknown",
                    mutations: patient_context?.genomic_profile?.mutations || []
                },
                provenance: {
                    source: "AyeshaTherapyFit",
                    version: "2.0"
                }
            };

            const res = await fetch(`${API_ROOT}/api/ayesha/dossiers/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to generate dossier");

            const data = await res.json();
            navigate(data.path);

        } catch (err) {
            console.error("Dossier creation failed:", err);
            alert("Failed to create dossier: " + err.message);
        } finally {
            setCreatingDossier(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 6, bgcolor: '#f8fafc', minHeight: '100vh' }}>

            {/* 
        BEAT 1: THE HERO (Reality)
         "Best option with today's data (L1)"
      */}
            <TherapyHeroSection
                topDrug={topDrug}
                patientContext={patient_context}
                onInform={handleInformDoctor}
            />

            {/* 
        BEAT 2: THE WHY (Mechanism)
         "Why this fits your biology"
      */}
            <Box sx={{ mb: 8, maxWidth: '1000px', mx: 'auto' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800, color: '#64748b' }}>
                        MECHANISM OF ACTION
                    </Typography>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: '#1e293b' }}>
                        Why this drug fits your tumor biology
                    </Typography>
                </Box>

                <Suspense fallback={<LoadingFallback />}>
                    <SyntheticLethalityCard
                        data={synthetic_lethality}
                        evidence={topDrug?.molecular_rationale}
                        // On this page we don't have trials; keep the button disabled.
                    />
                </Suspense>
            </Box>

            {/* 
        BEAT 3: THE ROADMAP (Upside)
         "What we can unlock with next tests"
      */}
            <Suspense fallback={<LoadingFallback />}>
                <UnlockableRoadmap currentLevel={currentLevel} />
            </Suspense>

            {/* 
        BEAT 3.5: SCENARIO LIBRARY (All previews)
         "Show all L2/L3 scenarios and their simulated previews"
      */}
            <Box sx={{ mt: 6, mb: 8, maxWidth: '1100px', mx: 'auto' }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800, color: '#64748b' }}>
                        SCENARIO PREVIEWS (WHAT‑IF)
                    </Typography>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1e293b' }}>
                        All available scenarios (L2 & L3)
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        These are simulated previews showing how rankings could change if missing data layers are added.
                        Research Use Only (RUO).
                    </Typography>
                </Box>

                {preview_cache?.status && (
                    <Alert severity={preview_cache.status === 'ok' ? 'success' : preview_cache.status === 'computing' ? 'info' : 'warning'} sx={{ mb: 3 }}>
                        Preview cache status: <strong>{String(preview_cache.status)}</strong>
                        {preview_cache.generated_at ? ` · generated_at: ${String(preview_cache.generated_at)}` : ''}
                        {preview_cache?.progress?.l2?.total ? (
                            <span>
                                {' '}· L2 previews {preview_cache.progress.l2.done}/{preview_cache.progress.l2.total}
                                {preview_cache?.progress?.l2xl3?.total ? ` · Matrix ${preview_cache.progress.l2xl3.done}/${preview_cache.progress.l2xl3.total}` : ''}
                            </span>
                        ) : null}
                    </Alert>
                )}

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 2 }}>
                    L2 scenarios (Tumor sequencing / HRD / TMB)
                </Typography>
                {Array.isArray(l2_scenarios) && l2_scenarios.length > 0 ? (
                    <Grid container spacing={2}>
                        {l2_scenarios.map((scn) => {
                            const topK = scn?.preview?.top_k || [];
                            return (
                                <Grid item xs={12} md={6} key={scn.id}>
                                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
                                                        {scn.name || scn.id}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Scenario ID: {scn.id}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <Chip size="small" label="Preview" variant="outlined" />
                                                    {scn.preview_status && (
                                                        <Chip
                                                            size="small"
                                                            label={String(scn.preview_status)}
                                                            color={scn.preview_status === 'ok' ? 'success' : scn.preview_status === 'computing' ? 'info' : 'warning'}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>

                                            {Array.isArray(scn.requires) && scn.requires.length > 0 && (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                                    {scn.requires.slice(0, 6).map((req) => (
                                                        <Chip key={req} size="small" label={req} sx={{ bgcolor: '#f1f5f9' }} />
                                                    ))}
                                                </Box>
                                            )}

                                            {scn.preview ? (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155' }}>
                                                        Top candidates (preview)
                                                    </Typography>
                                                    {Array.isArray(topK) && topK.length > 0 ? (
                                                        <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
                                                            {topK.slice(0, 3).map((d) => (
                                                                <li key={d.name}>
                                                                    <Typography variant="body2" sx={{ color: '#334155' }}>
                                                                        <strong>{d.name}</strong> · efficacy {Math.round((d.efficacy_score || 0) * 100)}% · confidence {Math.round((d.confidence || 0) * 100)}%
                                                                    </Typography>
                                                                </li>
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Preview is available but top_k is empty.
                                                        </Typography>
                                                    )}
                                                    {scn.preview?.rationale && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                                                            {String(scn.preview.rationale)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    Preview not available yet.
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <Alert severity="info">No L2 scenarios returned.</Alert>
                )}

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 2, mt: 4 }}>
                    L3 scenarios (Activity signals / RNA / CA‑125)
                </Typography>
                {Array.isArray(l3_scenarios) && l3_scenarios.length > 0 ? (
                    <Grid container spacing={2}>
                        {l3_scenarios.map((scn) => {
                            const byL2 = scn?.preview_matrix?.by_l2 || {};
                            const entries = Object.values(byL2 || {});
                            const withPreview = entries.filter((e) => e && e.preview).length;
                            return (
                                <Grid item xs={12} md={6} key={scn.id}>
                                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
                                                {scn.name || scn.id}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Scenario ID: {scn.id}
                                            </Typography>

                                            {Array.isArray(scn.requires) && scn.requires.length > 0 && (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                                                    {scn.requires.slice(0, 6).map((req) => (
                                                        <Chip key={req} size="small" label={req} sx={{ bgcolor: '#f1f5f9' }} />
                                                    ))}
                                                </Box>
                                            )}

                                            <Typography variant="body2" color="text.secondary">
                                                Preview matrix coverage: <strong>{withPreview}</strong> / {entries.length || Object.keys(byL2 || {}).length} L2 combinations have previews.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <Alert severity="info">No L3 scenarios returned.</Alert>
                )}
            </Box>


            {/* 
        APPENDIX: OTHER CANDIDATES
      */}
            <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid #e2e8f0' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: '#64748b' }}>
                    Other Considerations (Tier 2 & 3)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        clickable
                        variant={showAllCandidates ? "outlined" : "filled"}
                        color={showAllCandidates ? "default" : "primary"}
                        label={showAllCandidates ? "Showing all candidates" : "Showing top 12 (click to show all)"}
                        onClick={() => setShowAllCandidates((v) => !v)}
                    />
                    <Chip size="small" variant="outlined" label={`Total candidates: ${otherDrugs.length}`} />
                </Box>
                <Suspense fallback={<LoadingFallback />}>
                    <AyeshaDrugPanel
                        drugs={otherDrugsToShow}
                        onInform={handleInformDoctor}
                    />
                </Suspense>
            </Box>

        </Container>
    );
};

export default AyeshaTherapyFit;
