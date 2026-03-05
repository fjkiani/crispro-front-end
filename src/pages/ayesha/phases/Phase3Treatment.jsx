/**
 * Phase 3 — Treatment Fit ("What treatments fit me today?")
 *
 * Hero page. Wraps existing AyeshaWeaponCompatibility (Therapy Fit) components.
 * Default view: Top 3 with "Why this is on the list" and "What we're missing"
 * RUO framing is mandatory. final_score is primary display score.
 *
 * Existing components imported:
 *   - PrimaryWeaponCard (already light-mode, patient-friendly labels)
 *   - DrugRankingPanel
 *   - ScoringBreakdown
 *   - ComboRationaleCard
 */
import React, { Suspense, useState } from 'react';
import {
    Box, Typography, Paper, Alert, CircularProgress, Tabs, Tab, Button, Chip, Divider,
} from '@mui/material';
import { ArrowForward, Science as TrialIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import { useAyeshaTherapyFitBundle } from '../../../hooks/useAyeshaTherapyFitBundle';
import { useAyeshaTrials } from '../../../hooks/useAyeshaTrials';

// Existing components — reused without modification
const PrimaryWeaponCard = React.lazy(() => import('../../../components/ayesha/PrimaryWeaponCard'));
const DrugRankingPanel = React.lazy(() => import('../../../components/ayesha/DrugRankingPanel'));
const IOHarmPreventionPanel = React.lazy(() => import('../../../components/ayesha/IOHarmPreventionPanel'));

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

const Phase3Treatment = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const { data: bundle, isLoading, error, refetch } = useAyeshaTherapyFitBundle({ level: 'l1' });

    const levelData = bundle?.levels?.L1 || {};
    const drugs = levelData?.efficacy?.drugs || [];
    const completeness = levelData?.completeness || {};
    const missing = completeness?.missing || [];

    // Clinical trial matches — auto-fetches when bundle is ready
    const { trials, isLoading: trialsLoading, error: trialsError } = useAyeshaTrials({
        bundle, autoFetch: true, maxResults: 5,
    });

    return (
        <JourneyLayout completeness={completeness}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                {/* RUO disclaimer */}
                <Alert severity="warning" sx={{ '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
                    <strong>Research Use Only.</strong> This ranking is computed, not validated for decision-grade use.
                    It explains how the tumor may behave — not which drug is guaranteed to work.
                    {missing.length > 0 && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            Confidence is limited — missing: {missing.join(', ')}
                        </Typography>
                    )}
                </Alert>

                {/* IO Harm Prevention Gate — shown when RNA data is available */}
                {!isLoading && !error && bundle?.io_harm_prevention && (
                    <Suspense fallback={<CircularProgress size={32} />}>
                        <IOHarmPreventionPanel
                            riskBenefitDecision={bundle.io_harm_prevention.decision_result}
                            biomarkerDrivers={bundle.io_harm_prevention.biomarker_drivers}
                            checkpointExpression={bundle.io_harm_prevention.checkpoint_expression}
                            ioProfileCard={bundle.io_harm_prevention.io_profile_card}
                            safetyGate={bundle.io_harm_prevention.safety_gate || { active: true }}
                        />
                    </Suspense>
                )}

                {/* Loading state — skeleton drug cards */}
                {isLoading && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[1, 2, 3].map(i => (
                            <Paper key={i} sx={{
                                p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                                display: 'flex', gap: 2, alignItems: 'center',
                            }}>
                                <Box sx={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    bgcolor: '#e2e8f0', '@keyframes pulse': { '0%, 100%': { opacity: 0.4 }, '50%': { opacity: 1 } },
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }} />
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{
                                        height: 14, width: i === 1 ? '60%' : '45%', bgcolor: '#e2e8f0', borderRadius: 1, mb: 1,
                                        '@keyframes pulse': { '0%, 100%': { opacity: 0.4 }, '50%': { opacity: 1 } },
                                        animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.2}s`,
                                    }} />
                                    <Box sx={{
                                        height: 10, width: '80%', bgcolor: '#f1f5f9', borderRadius: 1,
                                        '@keyframes pulse': { '0%, 100%': { opacity: 0.4 }, '50%': { opacity: 1 } },
                                        animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.3}s`,
                                    }} />
                                </Box>
                                <Box sx={{
                                    width: 56, height: 28, bgcolor: '#f1f5f9', borderRadius: 2,
                                    '@keyframes pulse': { '0%, 100%': { opacity: 0.4 }, '50%': { opacity: 1 } },
                                    animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s`,
                                }} />
                            </Paper>
                        ))}
                        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
                            Running therapy fit analysis — this may take 10–15 seconds on first load...
                        </Typography>
                    </Box>
                )}

                {/* Error state — inline */}
                {error && !isLoading && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Treatment data is not available right now.
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            The analysis service may be offline. Your other journey phases are unaffected.
                            You can return here once the service is running.
                        </Typography>
                    </Alert>
                )}

                {/* Top treatment (hero) — only when data is ready */}
                {!isLoading && !error && drugs.length > 0 && (
                    <Suspense fallback={<CircularProgress size={32} />}>
                        <PrimaryWeaponCard
                            drug={drugs[0]}
                            rank={1}
                            levelData={levelData}
                        />
                    </Suspense>
                )}

                {/* No data state */}
                {!isLoading && !error && drugs.length === 0 && (
                    <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            No treatment data available yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Treatment rankings will appear here after the therapy fit analysis runs.
                        </Typography>
                    </Paper>
                )}

                {/* Tabbed deep-dive — only with data */}
                {!isLoading && !error && drugs.length > 0 && (
                    <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                        <Tabs
                            value={tab}
                            onChange={(_, v) => setTab(v)}
                            sx={{
                                bgcolor: '#f8fafc',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                px: 2, pt: 0.5,
                                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
                                '& .MuiTabs-indicator': { height: 3 },
                            }}
                        >
                            <Tab label={`All Options (${drugs.length})`} />
                            <Tab label="If We Had More Data..." />
                        </Tabs>

                        <TabPanel value={tab} index={0}>
                            <Box sx={{ p: 2 }}>
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
                            </Box>
                        </TabPanel>

                        <TabPanel value={tab} index={1}>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    Improve Confidence With These Tests
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                    Adding these tests unlocks more precise scenarios and stronger rankings.
                                </Typography>
                                {missing.length > 0 ? missing.map(m => (
                                    <Paper key={m} sx={{
                                        p: 2, mb: 1.5, borderRadius: 2,
                                        border: '1px solid', borderColor: 'warning.light',
                                        bgcolor: '#fffbeb',
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            📋 {m}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Adding this test would improve ranking confidence and unlock additional scenarios.
                                        </Typography>
                                    </Paper>
                                )) : (
                                    <Alert severity="success">All key inputs are present — rankings are at full confidence.</Alert>
                                )}
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/ayesha/journey/tests')}
                                    sx={{ mt: 2, fontWeight: 600 }}
                                >
                                    Go to Tests & Unlocks
                                </Button>
                            </Box>
                        </TabPanel>
                    </Paper>
                )}

                {/* ── Matched Clinical Trials ───────────────────────────── */}
                {!isLoading && !error && (
                    <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                        <Box sx={{
                            p: 2, bgcolor: '#f0f9ff', borderBottom: '1px solid',
                            borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1,
                        }}>
                            <TrialIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Matched Clinical Trials
                            </Typography>
                            <Chip
                                label="RUO"
                                size="small"
                                sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.7rem' }}
                            />
                        </Box>

                        <Box sx={{ p: 2 }}>
                            {trialsLoading && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, justifyContent: 'center' }}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2" color="text.secondary">
                                        Searching clinical trials matching your profile...
                                    </Typography>
                                </Box>
                            )}

                            {trialsError && (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    <Typography variant="body2">
                                        Clinical trial matching is not available right now.
                                        This does not affect your treatment rankings.
                                    </Typography>
                                </Alert>
                            )}

                            {!trialsLoading && !trialsError && trials.length === 0 && (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    No matched trials found for your current profile.
                                    Adding more test data may unlock additional matches.
                                </Alert>
                            )}

                            {!trialsLoading && trials.length > 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {trials.slice(0, 5).map((trial, idx) => {
                                        const nctId = trial.nct_id || trial.nctId;
                                        const phase = trial.phase || 'N/A';
                                        const status = trial.overall_status || trial.status;
                                        const title = trial.brief_title || trial.title || trial.official_title || nctId;
                                        const score = trial.holistic_score ?? trial.mechanism_fit_score;

                                        return (
                                            <Paper
                                                key={nctId || idx}
                                                variant="outlined"
                                                sx={{ p: 2, borderRadius: 2, transition: 'border-color 0.2s', '&:hover': { borderColor: '#0284c7' } }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.4 }}>
                                                            {title}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                                                            {nctId && (
                                                                <Chip
                                                                    label={nctId}
                                                                    size="small"
                                                                    component="a"
                                                                    href={`https://clinicaltrials.gov/study/${nctId}`}
                                                                    target="_blank"
                                                                    clickable
                                                                    sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: '#eff6ff', color: '#1e40af' }}
                                                                />
                                                            )}
                                                            <Chip label={`Phase ${phase}`} size="small" sx={{ fontSize: '0.7rem' }} />
                                                            {status && (
                                                                <Chip
                                                                    label={status}
                                                                    size="small"
                                                                    sx={{
                                                                        fontSize: '0.7rem',
                                                                        bgcolor: status === 'Recruiting' ? '#dcfce7' : '#f3f4f6',
                                                                        color: status === 'Recruiting' ? '#166534' : '#6b7280',
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                        {trial.treatment_line_bucket && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Line: {trial.treatment_line_bucket}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    {score != null && (
                                                        <Box sx={{
                                                            textAlign: 'center', minWidth: 56, px: 1, py: 0.5,
                                                            borderRadius: 2, bgcolor: score >= 0.7 ? '#dcfce7' : score >= 0.4 ? '#fef3c7' : '#f3f4f6',
                                                        }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}>
                                                                {Math.round(score * 100)}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                                                                FIT
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 0.5 }}>
                                        Showing top {Math.min(trials.length, 5)} of {trials.length} matched trials.
                                        Scores reflect mechanism fit to your tumor profile. Not clinical guidance.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                )}

                {/* Navigation CTA — always visible */}
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/ayesha/journey/monitoring')}
                    sx={{ fontWeight: 600, py: 1.5, alignSelf: 'center', px: 5 }}
                >
                    Set Up Monitoring →
                </Button>

                <Box sx={{
                    textAlign: 'center', pt: 4, pb: 2,
                    display: 'flex', flexDirection: 'column', gap: 1
                }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: '0.5px' }}>
                        PROVENANCE LOG
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                        Engine: therapy_fit_v2 // Analysis mode: {levelData.contract_version || 'v2.1'} //
                        Data generated: {new Date().toLocaleDateString()}
                    </Typography>
                </Box>
            </Box>
        </JourneyLayout>
    );
};

export default Phase3Treatment;
