/**
 * Phase 3 — Treatment Fit ("What treatments fit me today?")
 *
 * Thin orchestrator. Composes shared therapy-fit components.
 *
 * Sections:
 *   1. Single RUO banner (general + therapy ranking + IO pointer)
 *   2. Top Drug Hero (PrimaryWeaponCard)
 *   3. Tabbed: Drug rankings · Missing data · Immunotherapy (IO)
 *   4. Clinical Trials
 *   5. Navigation CTA + Provenance
 */
import React, { Suspense, useState } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Tabs, Tab, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import { useAyeshaTherapyFitBundle } from '../../../hooks/useAyeshaTherapyFitBundle';
import { useAyeshaTrials } from '../../../hooks/useAyeshaTrials';
import {
    TherapyFitLoadingSkeleton,
    IOHarmGateSection,
    ClinicalTrialsSection,
    MissingDataTab,
    ProvenanceLog,
} from '../../../components/therapy-fit';

const PrimaryWeaponCard = React.lazy(() => import('../../../components/ayesha/PrimaryWeaponCard'));
const DrugRankingPanel = React.lazy(() => import('../../../components/ayesha/DrugRankingPanel'));

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

const Phase3Treatment = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const { data: bundle, isLoading, error } = useAyeshaTherapyFitBundle({ level: 'l1', efficacy_mode: 'fast' });

    const levelData = bundle?.levels?.L1 || {};
    const drugs = levelData?.efficacy?.drugs || [];
    const completeness = levelData?.completeness || {};
    const missing = completeness?.missing || [];

    const { trials, isLoading: trialsLoading, error: trialsError } = useAyeshaTrials({
        bundle, autoFetch: true, maxResults: 5,
    });

    const bundleReady = !isLoading && !error;

    return (
        <JourneyLayout completeness={completeness} hideDefaultRuo>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                <Alert severity="info" className="tf-ruo-banner" sx={{ borderRadius: 2 }}>
                    <Typography variant="caption" component="div" sx={{ lineHeight: 1.65 }}>
                        <strong>Research Use Only (RUO).</strong> Not medical advice. Rankings are computed for research
                        context, not validated for clinical decisions. For immunotherapy safeguards and detailed IO
                        disclaimers, use the <strong>Immunotherapy (IO)</strong> tab.
                    </Typography>
                    {missing.length > 0 && (
                        <Typography variant="caption" component="div" sx={{ display: 'block', mt: 1, fontWeight: 600 }}>
                            Confidence is limited — missing: {missing.join(', ')}
                        </Typography>
                    )}
                </Alert>

                {isLoading && <TherapyFitLoadingSkeleton />}

                {error && !isLoading && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Treatment data is not available right now.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            The analysis service may be offline. Your other journey phases are unaffected.
                        </Typography>
                    </Alert>
                )}

                {bundleReady && drugs.length > 0 && (
                    <Suspense fallback={<CircularProgress size={32} />}>
                        <PrimaryWeaponCard topDrug={drugs[0]} rank={1} levelData={levelData} />
                    </Suspense>
                )}

                {bundleReady && (
                    <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                        <Tabs
                            value={tab}
                            onChange={(_, v) => setTab(v)}
                            sx={{
                                bgcolor: 'grey.50',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                px: 2, pt: 0.5,
                                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
                                '& .MuiTabs-indicator': { height: 3 },
                            }}
                        >
                            <Tab label={`All Options (${drugs.length})`} />
                            <Tab label="If We Had More Data..." />
                            <Tab label="Immunotherapy (IO)" />
                        </Tabs>

                        <TabPanel value={tab} index={0}>
                            <Box sx={{ p: 2 }}>
                                {drugs.length > 0 ? (
                                    <Suspense fallback={<CircularProgress size={32} />}>
                                        <DrugRankingPanel
                                            drugs={drugs}
                                            context={{
                                                level: 'L1',
                                                scenario: 'Baseline',
                                                inputs: levelData?.inputs_used,
                                                provenance: levelData?.efficacy?.provenance,
                                            }}
                                            title="Treatment Rankings"
                                        />
                                    </Suspense>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                        No treatment rankings yet. Complete profile data or rerun analysis when the service is available.
                                    </Typography>
                                )}
                            </Box>
                        </TabPanel>

                        <TabPanel value={tab} index={1}>
                            <MissingDataTab missing={missing} completenessScore={completeness?.completeness_score} />
                        </TabPanel>

                        <TabPanel value={tab} index={2}>
                            <Box sx={{ p: 2 }}>
                                {bundle?.io_harm_prevention ? (
                                    <IOHarmGateSection ioHarmData={bundle.io_harm_prevention} />
                                ) : (
                                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                                        IO assessment data is not available for this profile yet (e.g. expression / predictor inputs).
                                        Use Tests & Unlocks or your care team to add the data the IO module needs.
                                    </Alert>
                                )}
                            </Box>
                        </TabPanel>
                    </Paper>
                )}

                {bundleReady && (
                    <ClinicalTrialsSection
                        trials={trials}
                        isLoading={trialsLoading}
                        error={trialsError}
                    />
                )}

                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/ayesha/journey/monitoring')}
                    sx={{ fontWeight: 600, py: 1.5, alignSelf: 'center', px: 5 }}
                >
                    Set Up Monitoring →
                </Button>

                <ProvenanceLog contractVersion={levelData.contract_version} provenance={levelData?.efficacy?.provenance} generatedAt={bundle?.generated_at} />
            </Box>
        </JourneyLayout>
    );
};

export default Phase3Treatment;
