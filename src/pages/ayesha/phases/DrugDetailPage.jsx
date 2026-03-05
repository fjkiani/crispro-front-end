/**
 * DrugDetailPage — Thin orchestrator.
 *
 * Route: /ayesha/journey/drug/:slug
 *
 * Layout:
 *   Left (flex:1)  — Hero → SignalCards → Unlock → MOA → Insights → Pathways → Scoring
 *   Right (280px)  — Next Steps → Score Ring → Score Adjustments (Gates)
 *
 * All data sourced from useDrugDetail hook. No hardcoded values.
 * All inline components extracted to drug-detail/ folder.
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { ArrowBack } from '@mui/icons-material';

import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import { useDrugDetail } from '../../../hooks/useDrugDetail';

// ── Drug Detail sub-components ────────────────────────────────────────────────
import DrugHero from '../../../components/ayesha/drug-detail/DrugHero';
import SignalCards from '../../../components/ayesha/drug-detail/SignalCards';
import UnlockSection from '../../../components/ayesha/drug-detail/UnlockSection';
import MOACard from '../../../components/ayesha/drug-detail/MOACard';
import InsightsCard from '../../../components/ayesha/drug-detail/InsightsCard';
import PathwayScoresGrid from '../../../components/ayesha/drug-detail/PathwayScoresGrid';
import ScoringWaterfall from '../../../components/ayesha/drug-detail/ScoringWaterfall';

// ── Sidebar components ────────────────────────────────────────────────────────
import NextStepsSidebar from '../../../components/ayesha/drug-detail/NextStepsSidebar';
import ScoreRingSidebar from '../../../components/ayesha/drug-detail/ScoreRingSidebar';
import GatesSidebar from '../../../components/ayesha/drug-detail/GatesExplainer';

// ── State components ──────────────────────────────────────────────────────────
import DrugDetailLoading from '../../../components/ayesha/drug-detail/DrugDetailLoading';
import DrugDetailNotFound from '../../../components/ayesha/drug-detail/DrugDetailNotFound';

// ── Global typography override ────────────────────────────────────────────────
// One place to control all font sizes on this page.
// Grey text floors at #334155 — readable for patients on all screens.
function usePageTheme() {
    const outer = useTheme();
    return React.useMemo(() => createTheme(outer, {
        typography: {
            body1: { fontSize: '1.05rem', color: '#1e293b' },
            body2: { fontSize: '0.95rem', color: '#334155' },
            caption: { fontSize: '0.82rem', color: '#475569' },
            h5: { fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' },
            subtitle1: { fontSize: '1.05rem', color: '#1e293b' },
            subtitle2: { fontSize: '0.95rem', color: '#334155' },
        },
    }), [outer]);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DrugDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const pageTheme = usePageTheme();

    const { data, isLoading, error } = useDrugDetail(slug);

    // Derive all display vars from the real hook shape.
    // useDrugDetail returns: { found, drug, rank, totalDrugs, completeness,
    //   pathwayScores, provenance, synthetic_lethality, allDrugs }
    const drug = data?.drug ?? null;
    const rank = data?.rank ?? null;
    const totalDrugs = data?.totalDrugs ?? null;
    const completeness = data?.completeness ?? {};
    const pathwayScores = data?.pathwayScores ?? {};
    const syntheticLethality = data?.synthetic_lethality ?? null;
    const provenance = data?.provenance ?? null;

    // drug.rationale holds the sequence / pathway / evidence sub-objects
    // consumed by SignalCards. Pass it through directly — no reshaping.
    const rationale = drug?.rationale ?? null;

    return (
        <ThemeProvider theme={pageTheme}>
            <JourneyLayout>
                <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3, px: { xs: 2, md: 0 } }}>

                    {/* Back */}
                    <Button
                        startIcon={<ArrowBack />}
                        size="small"
                        onClick={() => navigate('/ayesha/journey/treatment')}
                        sx={{ fontWeight: 600, mb: 2 }}
                    >
                        Back to Treatment Options
                    </Button>

                    {/* Loading */}
                    {isLoading && <DrugDetailLoading />}

                    {/* Error */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            Failed to load drug data: {error.message}
                        </Alert>
                    )}

                    {/* Not found (drug slug invalid or not in ranked list) */}
                    {!isLoading && !error && data && !data.found && (
                        <DrugDetailNotFound slug={slug} navigate={navigate} />
                    )}

                    {/* Main content — only when drug exists */}
                    {!isLoading && !error && drug && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 3,
                            alignItems: 'flex-start',
                        }}>
                            {/* ── LEFT COLUMN ── */}
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                                <DrugHero
                                    drug={drug}
                                    rank={rank}
                                    totalDrugs={totalDrugs}
                                />
                                <SignalCards
                                    rationale={rationale}
                                    drug={drug}
                                />
                                <UnlockSection
                                    completeness={completeness}
                                    insights={drug.insights}
                                />
                                <MOACard drug={drug} />
                                <InsightsCard
                                    insights={drug.insights}
                                    syntheticLethality={syntheticLethality}
                                />
                                <PathwayScoresGrid
                                    pathwayScores={pathwayScores}
                                    drugMoa={drug.moa}
                                />
                                <ScoringWaterfall drug={drug} />
                            </Box>

                            {/* ── RIGHT SIDEBAR ── */}
                            <Box sx={{
                                width: { xs: '100%', md: 280 },
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2.5,
                                position: { md: 'sticky' },
                                top: { md: 80 },
                                alignSelf: 'flex-start',
                            }}>
                                <NextStepsSidebar navigate={navigate} completeness={completeness} />
                                <ScoreRingSidebar drug={drug} />
                                <GatesSidebar
                                    provenance={drug.sporadic_gates_provenance ?? provenance}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Provenance footer */}
                    {!isLoading && !error && drug && (
                        <Box sx={{
                            mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider',
                            display: 'flex', justifyContent: 'center',
                        }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                Data: Ayesha TherapyFit Engine · Level {completeness?.level || 'L1'} · {totalDrugs || '—'} drugs evaluated
                            </Typography>
                        </Box>
                    )}

                </Box>
            </JourneyLayout>
        </ThemeProvider>
    );
}
