/**
 * Phase 6 — Tumor Board Packet ("Bring it to your doctor")
 *
 * Single exportable packet:
 *   Capabilities → Snapshot → Tests to order → Top options → Monitoring plan → Contingency plan
 *
 * Every claim traceable to a field path or explicitly labeled Unknown.
 * "Why we can't say more yet" section for missing fields.
 * Export: PDF/print/share link.
 */
import React, { useRef, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Alert, Button,
    CircularProgress, Chip, LinearProgress, Tabs, Tab
} from '@mui/material';
import {
    Print, Share,
    CheckCircle, Cancel,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import AnalysisLoadingCard from '../../../components/ayesha/journey/AnalysisLoadingCard';
import CapabilitiesHeroStrip from '../../../components/ayesha/tumor-board/CapabilitiesHeroStrip';
import DrugRankingPanel from '../../../components/ayesha/DrugRankingPanel';
import { useAyeshaProfile } from '../../../hooks/ayesha/useAyeshaProfile';
import { useAyeshaTherapyFitBundle, useAyeshaScenarios } from '../../../hooks/useAyeshaTherapyFitBundle';
import { useAyeshaTrials } from '../../../hooks/useAyeshaTrials';
import OpportunityPanel from '../../../components/ayesha/tumor-board/OpportunityPanel';
import EvidenceVault from '../../../components/ayesha/tumor-board/EvidenceVault';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function safeArray(v) { return Array.isArray(v) ? v : []; }



// ── Accent Colors for Sections ──────────────────────────────────────────────
const SECTION_ACCENTS = {
    1: { color: '#2563eb' },
    2: { color: '#b45309' },
    3: { color: '#047857' },
    '3b': { color: '#b91c1c' },
    4: { color: '#1d4ed8' },
    5: { color: '#6d28d9' },
    6: { color: '#475569' },
};

// ── Section Component ────────────────────────────────────────────────────────

const PacketSection = ({ number, title, children }) => {
    const accent = SECTION_ACCENTS[number] || SECTION_ACCENTS[1];
    return (
        <Paper sx={{
            borderRadius: 3, mb: 2.5, overflow: 'hidden',
            border: '1px solid', borderColor: 'divider',
            pageBreakInside: 'avoid',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            '&:hover': {
                boxShadow: `0 4px 24px rgba(0,0,0,0.06)`,
                transform: 'translateY(-1px)',
            },
        }}>
            <Box sx={{
                px: 3, py: 1.5,
                display: 'flex', alignItems: 'center', gap: 1.5,
                bgcolor: 'grey.50',
                borderBottom: '1px solid',
                borderColor: 'divider',
                borderLeft: '4px solid',
                borderLeftColor: accent.color,
            }}>
                <Box sx={{
                    minWidth: 28, height: 28, borderRadius: 1,
                    bgcolor: `${accent.color}18`,
                    color: accent.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800,
                }}>
                    {number}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {title}
                </Typography>
            </Box>
            {/* Content */}
            <Box sx={{ p: 3 }}>
                {children}
            </Box>
        </Paper>
    );
};

// ── Feasibility Badge ────────────────────────────────────────────────────────

const FeasibilityBadge = ({ status }) => {
    const map = {
        PASS: { bg: '#dcfce7', color: '#166534', border: '#86efac', label: 'PASS' },
        CONDITIONAL: { bg: '#fef9c3', color: '#854d0e', border: '#fde68a', label: 'CONDITIONAL' },
        FAIL: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'FAIL' },
        QUARANTINE: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'QUARANTINE' },
    };
    const s = map[status] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: status || '—' };
    return (
        <Chip
            label={s.label}
            size="small"
            sx={{
                bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`,
                fontWeight: 800, fontSize: '0.65rem', height: 22,
            }}
        />
    );
};

// ── Page Orchestrator ────────────────────────────────────────────────────────

const Phase6Board = () => {
    const { labs } = useAyeshaProfile();
    const { data: bundle, isLoading, error, refetch } = useAyeshaTherapyFitBundle({ level: 'l1' });
    const printRef = useRef();

    const levelData = bundle?.levels?.L1 || {};
    const drugs = levelData?.efficacy?.drugs || [];
    const completeness = levelData?.completeness || {};
    const missing = completeness?.missing || [];
    // Fall back to top-level if the levels.$L1 mapping shifted
    const slPayload = levelData?.synthetic_lethality || bundle?.synthetic_lethality || null;
    const resistanceGate = levelData?.resistance_gate;
    const testsNeeded = bundle?.tests_needed || [];

    const [activeTab, setActiveTab] = useState(0);
    const [level, setLevel] = useState('l1');
    const [scenarioId, setScenarioId] = useState(null);
    const [l3ScenarioId, setL3ScenarioId] = useState(null);
    const activeKey = String(level || 'l1').toUpperCase();

    const { data: scenariosData } = useAyeshaScenarios();
    const l2Scenarios = safeArray(scenariosData?.l2_scenarios);
    const l3Scenarios = safeArray(scenariosData?.l3_scenarios);

    const handleRunL2 = (sid) => { setLevel('l2'); setScenarioId(sid); setL3ScenarioId(null); };
    const handleRunL3 = (l2BaseId, l3Id) => { setLevel('l3'); setScenarioId(l2BaseId); setL3ScenarioId(l3Id); };

    // Clinical trial matches for the board packet
    const { trials, isLoading: trialsLoading } = useAyeshaTrials({
        bundle, autoFetch: true, maxResults: 5,
    });

    const handlePrint = () => {
        window.print();
    };


    return (
        <JourneyLayout hideRail>
            <Box ref={printRef} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Tumor Board Packet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Research Use Only — for discussion support, not clinical decisions.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, '@media print': { display: 'none' } }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<Print />}
                            onClick={handlePrint}
                            sx={{ fontWeight: 700, textTransform: 'none', borderColor: 'divider', color: 'text.secondary' }}
                        >
                            Print
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Share />}
                            sx={{ fontWeight: 700, textTransform: 'none' }}
                        >
                            Share
                        </Button>
                    </Box>
                </Box>

                {/* ═══ CAPABILITIES HERO STRIP ═══ */}
                <CapabilitiesHeroStrip
                    drugs={drugs}
                    resistanceGate={resistanceGate}
                    ioHarm={bundle?.io_harm_prevention}
                    trials={trials}
                    trialsLoading={trialsLoading}
                />

                {/* ═══ TABS ═══ */}
                <Box sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    mt: 2
                }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc', px: 2, pt: 1 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, val) => setActiveTab(val)}
                            sx={{
                                '& .MuiTab-root': {
                                    color: 'text.secondary',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    minHeight: 48,
                                    '&.Mui-selected': { color: 'primary.main' },
                                },
                                '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 },
                            }}
                        >
                            <Tab label={`Strategy (${drugs.length} drugs)`} />
                            <Tab label="Opportunity" />
                            <Tab label="Evidence" />
                        </Tabs>
                    </Box>

                    <TabPanel value={activeTab} index={0}>
                        <Box sx={{ px: 2, pb: 2 }}>

                {/* Section 3: Top Treatment Options — FULL detailed drug cards from DrugRankingPanel */}
                <PacketSection number={3} title="Top Treatment Options (RUO)">
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Rankings and on-card evidence match Treatment Fit. Signal cards, MOA, pathway grid, and scoring waterfall
                        live on each drug&apos;s detail page — use <strong>Full reasoning & pathways</strong> (not the whole card).
                    </Typography>
                    {isLoading ? (
                        <AnalysisLoadingCard onRetry={refetch} />
                    ) : error ? (
                        <Alert severity="info">
                            Treatment rankings are not available right now. The analysis service may be offline.
                        </Alert>
                    ) : (
                        <DrugRankingPanel
                            drugs={drugs}
                            navigateOnCardClick={false}
                            context={{
                                level: 'L1',
                                scenario: 'Baseline',
                                inputs: { mutations: levelData?.inputs_used?.mutations || [] },
                            }}
                        />
                    )}
                    {!isLoading && missing.length > 0 && (
                        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                            <Typography variant="caption">
                                Confidence is capped due to missing inputs: {missing.join(', ')}.
                                Evidence may be absent in fast mode — "no citations" does not mean "no evidence exists."
                            </Typography>
                        </Alert>
                    )}
                </PacketSection>

                {/* Section 3b: IO Risk Assessment — from io_harm_prevention */}
                {bundle?.io_harm_prevention?.decision_result && (
                    <PacketSection number={'3b'} title="Immunotherapy Risk Assessment (RUO)">
                        <Box sx={{
                            p: 2.5, borderRadius: 2.5, mb: 2,
                            bgcolor: bundle.io_harm_prevention.decision_result.decision === 'RULE_OUT'
                                ? '#fef2f2' : bundle.io_harm_prevention.decision_result.decision === 'JUSTIFIED'
                                    ? '#f0fdf4' : '#fffbeb',
                            border: '1px solid',
                            borderColor: bundle.io_harm_prevention.decision_result.decision === 'RULE_OUT'
                                ? '#fca5a5' : bundle.io_harm_prevention.decision_result.decision === 'JUSTIFIED'
                                    ? '#86efac' : '#fcd34d',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    Gate Decision: {bundle.io_harm_prevention.decision_result.decision}
                                </Typography>
                                <Chip
                                    label={`p(response) = ${Math.round(bundle.io_harm_prevention.decision_result.p_resp * 100)}%`}
                                    size="small"
                                    sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {bundle.io_harm_prevention.decision_result.rationale}
                            </Typography>
                            {bundle.io_harm_prevention.decision_result.regimen_name && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Regimen: {bundle.io_harm_prevention.decision_result.regimen_name}
                                </Typography>
                            )}
                        </Box>
                        {bundle.io_harm_prevention.biomarker_drivers && (
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {Object.entries(bundle.io_harm_prevention.biomarker_drivers).map(([key, bm]) => (
                                    <Box key={key} sx={{
                                        p: 2, borderRadius: 2,
                                        border: '1px solid', borderColor: 'divider',
                                        flex: 1, minWidth: 130,
                                        background: bm.direction === 'favorable' ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' :
                                            bm.direction === 'unfavorable' ? 'linear-gradient(135deg, #fef2f2, #fee2e2)' :
                                                'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                        transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-1px)' },
                                    }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.6rem', letterSpacing: 0.5 }}>
                                            {key.replace(/_/g, ' ')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                                            {typeof bm.value === 'number' ? bm.value.toFixed(2) : bm.value ?? 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" sx={{
                                            fontWeight: 700,
                                            color: bm.direction === 'favorable' ? '#16a34a' : bm.direction === 'unfavorable' ? '#dc2626' : '#64748b'
                                        }}>
                                            {bm.direction || 'neutral'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                        <Alert severity="info" sx={{ mt: 2, fontSize: '0.78rem', borderRadius: 2 }}>
                            Based on 3-biomarker model (CD8B/FOXP3, Monocytes, Endothelial) · n=29 HGSOC · LOO-CV AUC=0.822 · Not externally validated
                        </Alert>
                    </PacketSection>
                )}

                {/* Section 4: Clinical Trial Recommendations — with fit score bars */}
                <PacketSection number={4} title="Clinical Trial Recommendations">
                    {trialsLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                            <CircularProgress size={16} />
                            <Typography variant="body2" color="text.secondary">
                                Searching matched clinical trials...
                            </Typography>
                        </Box>
                    ) : trials.length > 0 ? (
                        <Box>
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                Trials matched to this patient's tumor profile and mechanism vector:
                            </Typography>
                            {trials.slice(0, 5).map((trial, idx) => {
                                const nctId = trial.nct_id || trial.nctId;
                                const phase = trial.phase || 'N/A';
                                const status = trial.overall_status || trial.status;
                                const title = trial.brief_title || trial.title || trial.official_title || nctId;
                                const score = trial.holistic_score ?? trial.mechanism_fit_score;
                                const pct = Math.round((score || 0) * 100);
                                return (
                                    <Box key={nctId || idx} sx={{
                                        p: 2, mb: 1.5, borderRadius: 2.5,
                                        border: '1px solid', borderColor: 'divider',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { borderColor: '#93c5fd', bgcolor: '#fafcff', transform: 'translateY(-1px)' },
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75, fontSize: '0.85rem' }}>
                                                    {title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {nctId && (
                                                        <Chip
                                                            label={nctId} size="small"
                                                            component="a" href={`https://clinicaltrials.gov/study/${nctId}`}
                                                            target="_blank" clickable
                                                            sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#1e40af', fontSize: '0.65rem', height: 22 }}
                                                        />
                                                    )}
                                                    <Chip label={`Phase ${phase}`} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                                                    {status && (
                                                        <Chip label={status} size="small" sx={{
                                                            bgcolor: status === 'Recruiting' ? '#dcfce7' : '#f3f4f6',
                                                            color: status === 'Recruiting' ? '#166534' : '#6b7280',
                                                            fontWeight: 700, fontSize: '0.65rem', height: 22,
                                                        }} />
                                                    )}
                                                </Box>
                                            </Box>
                                            {/* Fit Score with bar */}
                                            <Box sx={{ textAlign: 'center', minWidth: 70 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>
                                                    {pct}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    Fit Score
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={pct}
                                                    sx={{
                                                        mt: 0.5, height: 4, borderRadius: 2,
                                                        bgcolor: '#e2e8f0',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#94a3b8',
                                                            borderRadius: 2,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                            <Alert severity="info" sx={{ mt: 1, fontSize: '0.78rem', borderRadius: 2 }}>
                                Trials ranked by mechanism fit to tumor's pathway profile. Discuss eligibility with your oncology team.
                            </Alert>
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            No matched clinical trials found for this tumor profile.
                            Additional genomic data may unlock more trial matches.
                        </Alert>
                    )}
                </PacketSection>

                {/* Section 5: Monitoring Plan — glass cards with icons */}
                <PacketSection number={5} title="Monitoring Plan">
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Active monitoring signals and scheduled assessments:
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            { label: 'CA-125 tracking', active: labs?.ca125_measurements?.length > 0, icon: '📈' },
                            { label: 'ctDNA / MRD panel', active: false, icon: '🧬' },
                            { label: 'Imaging schedule', active: false, icon: '🔍' },
                        ].map(item => (
                            <Grid item xs={12} sm={4} key={item.label}>
                                <Box sx={{
                                    p: 2, borderRadius: 2.5,
                                    background: item.active
                                        ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                                        : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                    border: '1px solid',
                                    borderColor: item.active ? '#86efac' : '#fca5a5',
                                    transition: 'transform 0.15s',
                                    '&:hover': { transform: 'translateY(-2px)' },
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                                        <Typography sx={{ fontSize: '1.1rem' }}>{item.icon}</Typography>
                                        {item.active
                                            ? <CheckCircle sx={{ fontSize: 16, color: '#16a34a' }} />
                                            : <Cancel sx={{ fontSize: 16, color: '#ef4444' }} />
                                        }
                                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{item.label}</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{
                                        color: item.active ? '#16a34a' : '#ef4444',
                                        fontWeight: 600, fontSize: '0.7rem',
                                    }}>
                                        {item.active ? '● Active' : '○ Not available — test needed'}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </PacketSection>

                {/* Section 6: Limitations & Missing Data */}
                <PacketSection number={6} title="Limitations & Missing Data">
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                        <Typography variant="body2">
                            <strong>This packet is research-use-only.</strong> Use as discussion support with your oncology team.
                        </Typography>
                    </Alert>
                    {missing.length > 0 && (
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.85rem' }}>
                                Missing inputs that limit analysis confidence:
                            </Typography>
                            <Grid container spacing={1}>
                                {missing.map(m => (
                                    <Grid item xs={12} sm={6} key={m}>
                                        <Box sx={{
                                            display: 'flex', alignItems: 'center', gap: 1,
                                            p: 1.5, borderRadius: 2,
                                            bgcolor: '#fef9c3', border: '1px solid #fde68a',
                                        }}>
                                            <Typography sx={{ fontSize: '0.75rem' }}>⚠️</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#92400e', fontSize: '0.72rem' }}>
                                                {m}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </PacketSection>
                        </Box>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ px: 2, pb: 2 }}>
                            <OpportunityPanel
                                slPayload={slPayload}
                                resistanceGate={resistanceGate}
                                levelKey={activeKey}
                                testsNeeded={testsNeeded}
                                missing={missing}
                            />
                        </Box>
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                        <Box sx={{ px: 2, pb: 2 }}>
                            <EvidenceVault
                                levelData={levelData}
                                activeKey={activeKey}
                                level={level}
                                drugsCount={drugs.length}
                                l2Scenarios={l2Scenarios}
                                l3Scenarios={l3Scenarios}
                                onRunL2={handleRunL2}
                                onRunL3={handleRunL3}
                                isPreview={false}
                                rawBundle={bundle}
                            />
                        </Box>
                    </TabPanel>
                </Box>

                {/* Provenance Footer */}
                <Box sx={{
                    textAlign: 'center', pt: 4, pb: 2,
                    display: 'flex', flexDirection: 'column', gap: 0.5,
                    '@media print': { display: 'block', pt: 4, mt: 'auto' }
                }}>
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        mx: 'auto', px: 2.5, py: 1, borderRadius: 2,
                        bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
                    }}>
                        <TrendingUpIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                            PROVENANCE LOG
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.65rem' }}>
                        Engine: therapy_fit_v2 · Analysis mode: {levelData.contract_version || 'v2.1'} ·
                        Data generated: {new Date().toLocaleDateString()} · CrisPRO.ai
                    </Typography>
                </Box>
            </Box>
        </JourneyLayout>
    );
};

export default Phase6Board;
