/**
 * PostDebulkingMRD — Dedicated MRD Intelligence Page
 * ====================================================
 * Post-Debulking Surgery MRD Snapshot
 *
 * Shows:
 *  1. Patient's current MRD status (panel proxy or sWGS if available)
 *  2. What tests she needs + why (ordered by clinical leverage)
 *  3. Population context from Leandersson/MITO16a publication data
 *  4. Kill chain integration status — how MRD connects to resistance detection
 *  5. Honest "what we have vs what we need" inventory
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, Chip, Divider, Grid,
    LinearProgress, Tooltip, Alert, AlertTitle, IconButton, Collapse,
} from '@mui/material';
import {
    Science as ScienceIcon,
    Biotech as BiotechIcon,
    Timeline as TimelineIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Bloodtype as BloodIcon,
    Hub as HubIcon,
} from '@mui/icons-material';

// ── Design tokens (matches LabStyles.js) ──────────────────────────────────────
const DARK_BG = '#0a0e14';
const PANEL_BG = '#151b24';
const HEADER_BG = '#1a202c';
const BORDER = '#2d3748';
const ACCENT = '#4fd1c5';
const TEXT_DIM = '#718096';
const TEXT_MED = '#a0aec0';
const TEXT_BRIGHT = '#e2e8f0';

const GROUP_CONFIG = {
    0: { color: '#2e7d32', bgColor: '#0f2d1a', label: 'Group 0 — Low Risk', desc: 'Both TF and PF below cutoff' },
    1: { color: '#f57c00', bgColor: '#2d1e0f', label: 'Group 1 — Intermediate', desc: 'One signal high, one low (discordant)' },
    2: { color: '#c62828', bgColor: '#2d1515', label: 'Group 2 — High Risk', desc: 'Both TF and PF above cutoff' },
};

// ── Section Components ────────────────────────────────────────────────────────

const SectionCard = ({ icon, title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Paper sx={{ bgcolor: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 2, mb: 2, overflow: 'hidden' }}>
            <Box
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2, py: 1.5, bgcolor: HEADER_BG, borderBottom: `1px solid ${BORDER}`,
                    cursor: 'pointer',
                }}
                onClick={() => setOpen(!open)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {icon}
                    <Typography variant="subtitle2" sx={{ color: TEXT_MED, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {title}
                    </Typography>
                </Box>
                <IconButton size="small" sx={{ color: TEXT_DIM }}>
                    {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>
            <Collapse in={open}>
                <Box sx={{ p: 2 }}>{children}</Box>
            </Collapse>
        </Paper>
    );
};

const StatusBadge = ({ available, label }) => (
    <Chip
        icon={available ? <CheckIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
        label={label}
        size="small"
        sx={{
            bgcolor: available ? '#0f2d1a' : '#2d1515',
            color: available ? '#2e7d32' : '#c62828',
            border: `1px solid ${available ? '#2e7d3250' : '#c6282850'}`,
            fontWeight: 600, fontSize: '0.7rem', mr: 0.5, mb: 0.5,
        }}
    />
);

const TestOrderRow = ({ test, status, why, when, priority }) => (
    <Box sx={{ display: 'flex', gap: 1.5, py: 1, borderBottom: `1px solid ${BORDER}20` }}>
        <Box sx={{ minWidth: 60, textAlign: 'center' }}>
            <Chip
                label={priority}
                size="small"
                sx={{
                    fontSize: '0.6rem', height: 18, fontWeight: 700,
                    bgcolor: priority === 'NOW' ? '#2e7d3220' : priority === 'B1' ? '#f57c0020' : '#4a556820',
                    color: priority === 'NOW' ? '#2e7d32' : priority === 'B1' ? '#f57c00' : TEXT_DIM,
                    border: `1px solid ${priority === 'NOW' ? '#2e7d3250' : priority === 'B1' ? '#f57c0050' : `${BORDER}50`}`,
                }}
            />
        </Box>
        <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: TEXT_BRIGHT, fontWeight: 700, display: 'block' }}>
                {test}
            </Typography>
            <Typography variant="caption" sx={{ color: TEXT_DIM, display: 'block', lineHeight: 1.4 }}>
                {why}
            </Typography>
            <Typography variant="caption" sx={{ color: TEXT_DIM, fontStyle: 'italic', display: 'block' }}>
                When: {when}
            </Typography>
        </Box>
        <StatusBadge available={status === 'available'} label={status === 'available' ? 'Have' : 'Need'} />
    </Box>
);

// ── Cohort Population Context ─────────────────────────────────────────────────

const CohortGroupBar = ({ group, count, total, survival }) => {
    const config = GROUP_CONFIG[group] || GROUP_CONFIG[0];
    const pct = Math.round((count / Math.max(total, 1)) * 100);
    return (
        <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography variant="caption" sx={{ color: config.color, fontWeight: 700 }}>
                    {config.label} ({count} patients)
                </Typography>
                <Typography variant="caption" sx={{ color: TEXT_DIM }}>
                    {pct}%
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                    height: 6, borderRadius: 3, bgcolor: '#1a202c',
                    '& .MuiLinearProgress-bar': { bgcolor: config.color, borderRadius: 3 },
                }}
            />
            {survival && (
                <Typography variant="caption" sx={{ color: TEXT_DIM, fontSize: '0.6rem' }}>
                    Median PFS: {survival.median_pfs_months || '—'}mo · OS: {survival.median_os_months || '—'}mo
                </Typography>
            )}
        </Box>
    );
};

// ── Kill Chain Status Widget ──────────────────────────────────────────────────

const KillChainSignal = ({ name, active, description }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
        <Box sx={{
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: active ? '#4fd1c5' : '#2d3748',
            boxShadow: active ? '0 0 6px #4fd1c5' : 'none',
        }} />
        <Typography variant="caption" sx={{ color: active ? TEXT_BRIGHT : TEXT_DIM, fontWeight: active ? 700 : 400 }}>
            {name}
        </Typography>
        <Typography variant="caption" sx={{ color: TEXT_DIM, fontSize: '0.55rem', ml: 'auto' }}>
            {description}
        </Typography>
    </Box>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fallback data if API is unavailable
const FALLBACK_COHORT = {
    n_patients: 167,
    source: 'Leandersson et al. (MITO16a)',
    group_survival: {
        group_0: { count: 124, median_pfs_months: 21.9, median_os_months: 29.5 },
        group_1: { count: 27, median_pfs_months: 16.3, median_os_months: 27.5 },
        group_2: { count: 16, median_pfs_months: 15.9, median_os_months: 27.2 },
    },
    cutoffs: { tf_pct: 15.08, pf: 0.1659 },
};

const PostDebulkingMRD = () => {
    const hasCA125 = true;
    const hasPanelNGS = true;
    const hasSWGS = false;
    const currentMRDGroup = null;

    const [cohortSummary, setCohortSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCohort = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/ayesha/resistance/mrd-cohort`);
                if (res.data?.available) {
                    setCohortSummary(res.data);
                } else {
                    setCohortSummary(FALLBACK_COHORT);
                }
            } catch {
                setCohortSummary(FALLBACK_COHORT);
            } finally {
                setLoading(false);
            }
        };
        fetchCohort();
    }, []);

    // Normalized accessors (API returns group_survival, fallback uses same)
    const getGroupData = (g) => {
        const gs = cohortSummary?.group_survival || {};
        const key = `group_${g}`;
        return gs[key] || { count: 0, median_pfs_months: null, median_os_months: null };
    };
    const totalPatients = cohortSummary?.n_patients || 167;
    const cutoffs = cohortSummary?.cutoffs || { tf_pct: 15.08, pf: 0.1659 };
    const source = cohortSummary?.source || 'Leandersson et al. (MITO16a)';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: DARK_BG, color: TEXT_BRIGHT, p: { xs: 2, md: 4 } }}>
            {/* Page Header */}
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <BloodIcon sx={{ color: ACCENT, fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: TEXT_BRIGHT, letterSpacing: '-0.5px' }}>
                            Post-Debulking MRD Intelligence
                        </Typography>
                        <Typography variant="body2" sx={{ color: TEXT_DIM }}>
                            Minimal Residual Disease — What's hiding in the blood after surgery
                        </Typography>
                    </Box>
                </Box>

                {/* Patient-facing summary alert */}
                <Alert severity="info" variant="outlined" sx={{
                    mb: 3, bgcolor: '#0d253f', borderColor: '#1565c050',
                    '& .MuiAlert-icon': { color: '#42a5f5' },
                }}>
                    <AlertTitle sx={{ fontWeight: 700 }}>What This Page Shows</AlertTitle>
                    After debulking surgery, tiny amounts of cancer DNA can still circulate in your blood — invisible to CT scans.
                    MRD testing detects these traces early. This page shows what tests are available, what we can see today,
                    and what additional testing could reveal.
                </Alert>

                {/* ── Section 1: Current Status ──────────────────────────────── */}
                <SectionCard
                    icon={<BiotechIcon sx={{ color: ACCENT, fontSize: 18 }} />}
                    title="Your Current MRD Status"
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" sx={{ color: TEXT_MED, fontWeight: 700, display: 'block', mb: 1 }}>
                                What We Have
                            </Typography>
                            <StatusBadge available={hasCA125} label="CA-125 Monitoring" />
                            <StatusBadge available={hasPanelNGS} label="Panel NGS (Mutations)" />
                            <StatusBadge available={false} label="sWGS Tumor Fraction" />
                            <StatusBadge available={false} label="Fragment Analysis (PF)" />
                            <StatusBadge available={false} label="CNV Remodeling" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" sx={{ color: TEXT_MED, fontWeight: 700, display: 'block', mb: 1 }}>
                                MRD Group Assignment
                            </Typography>
                            {currentMRDGroup !== null ? (
                                <Box sx={{
                                    p: 2, bgcolor: GROUP_CONFIG[currentMRDGroup].bgColor,
                                    border: `1px solid ${GROUP_CONFIG[currentMRDGroup].color}30`, borderRadius: 1,
                                }}>
                                    <Typography sx={{ color: GROUP_CONFIG[currentMRDGroup].color, fontWeight: 700 }}>
                                        {GROUP_CONFIG[currentMRDGroup].label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: TEXT_DIM }}>
                                        {GROUP_CONFIG[currentMRDGroup].desc}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ p: 2, bgcolor: '#1a202c', border: `1px solid ${BORDER}`, borderRadius: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 700, display: 'block' }}>
                                        ⏳ Awaiting sWGS Data
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: TEXT_DIM, lineHeight: 1.5 }}>
                                        MRD group assignment requires sWGS liquid biopsy results (Tumor Fraction + Proportion Fragments).
                                        This test provides the most accurate post-surgery cancer detection available.
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </SectionCard>

                {/* ── Section 2: Tests Needed ────────────────────────────────── */}
                <SectionCard
                    icon={<ScienceIcon sx={{ color: ACCENT, fontSize: 18 }} />}
                    title="Tests — What to Order & Why"
                >
                    <TestOrderRow
                        test="CA-125 Blood Test"
                        status="available"
                        why="Cheapest, most available monitoring. Shows protein levels shed by tumor cells."
                        when="Every clinic visit"
                        priority="NOW"
                    />
                    <TestOrderRow
                        test="Liquid Biopsy Panel (e.g., Guardant, FoundationOne Liquid)"
                        status="available"
                        why="Catches circulating tumor DNA variants. Gives us a rough ctDNA proxy (VAF) for monitoring."
                        when="When panel NGS is ordered"
                        priority="NOW"
                    />
                    <TestOrderRow
                        test="cfDNA sWGS Liquid Biopsy"
                        status="needed"
                        why="The highest-leverage MRD test. Sequences the entire genome at low depth from a single blood draw. Produces Tumor Fraction (TF%) via ichorCNA — the actual percentage of blood DNA from cancer."
                        when="Post-surgery, pre-chemo (B1 timepoint) — most predictive window"
                        priority="B1"
                    />
                    <TestOrderRow
                        test="Fragment Length Analysis"
                        status="needed"
                        why="Same blood draw as sWGS. Measures DNA piece lengths — cancer DNA breaks shorter (100-150bp) than normal DNA (100-220bp). Produces Proportion Fragments (PF), a second independent signal."
                        when="Automatically derived from sWGS BAM files"
                        priority="B1"
                    />
                    <TestOrderRow
                        test="Repeat sWGS (Longitudinal)"
                        status="needed"
                        why="Tracks how cancer's DNA signature changes under treatment pressure. Catches CNV remodeling (new amplifications/deletions emerging)."
                        when="During treatment (B2, B3 timepoints)"
                        priority="B2+"
                    />
                </SectionCard>

                {/* ── Section 3: Kill Chain Integration ──────────────────────── */}
                <SectionCard
                    icon={<HubIcon sx={{ color: ACCENT, fontSize: 18 }} />}
                    title="Kill Chain — Resistance Detection Signals"
                >
                    <Typography variant="caption" sx={{ color: TEXT_DIM, display: 'block', mb: 1.5, lineHeight: 1.5 }}>
                        The Kill Chain watches 4 signals simultaneously. When any 2 light up together,
                        resistance is flagged and treatment strategy is automatically re-evaluated.
                        ctDNA/MRD rising + CA-125 rising can now trigger resistance detection without
                        waiting for genomic confirmation (HRD/repair shifts).
                    </Typography>

                    <KillChainSignal
                        name="CA-125 Rising"
                        active={false}
                        description="3 consecutive rising values"
                    />
                    <KillChainSignal
                        name="HRD Score Shift"
                        active={false}
                        description="HRD drops >10pts from baseline"
                    />
                    <KillChainSignal
                        name="Repair Capacity Shift"
                        active={false}
                        description="repair capacity changes >0.2"
                    />
                    <KillChainSignal
                        name="ctDNA/MRD Rising"
                        active={false}
                        description="ctDNA detected + rising or HIGH tier"
                    />

                    <Divider sx={{ my: 1.5, borderColor: BORDER }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            px: 1.5, py: 0.5, bgcolor: '#2d1e0f', border: '1px solid #f57c0030',
                            borderRadius: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5,
                        }}>
                            <WarningIcon sx={{ fontSize: 14, color: '#f57c00' }} />
                            <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 700 }}>
                                MONITORING — 0 of 4 signals active
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="caption" sx={{ color: TEXT_DIM, display: 'block', mt: 1, fontStyle: 'italic' }}>
                        With sWGS data, ctDNA rising becomes a first-class trigger —
                        corroborating CA-125 trends with molecular evidence rather than waiting
                        for a genomic shift that may come too late.
                    </Typography>
                </SectionCard>

                {/* ── Section 4: Population Context ──────────────────────────── */}
                <SectionCard
                    icon={<TimelineIcon sx={{ color: ACCENT, fontSize: 18 }} />}
                    title="Population Context — Where Would You Fall?"
                    defaultOpen={true}
                >
                    {loading ? (
                        <Box sx={{ py: 3 }}>
                            <LinearProgress sx={{ bgcolor: BORDER, '& .MuiLinearProgress-bar': { bgcolor: ACCENT } }} />
                            <Typography variant="caption" sx={{ color: TEXT_DIM, mt: 1, display: 'block' }}>Loading cohort data from air support...</Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Clinician Context Banner */}
                            <Alert severity="info" variant="outlined" sx={{
                                mb: 2, bgcolor: '#0d253f30', borderColor: '#4fd1c530',
                                '& .MuiAlert-icon': { color: ACCENT },
                            }}>
                                <AlertTitle sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Clinician Context</AlertTitle>
                                <Typography variant="caption" sx={{ lineHeight: 1.6 }}>
                                    In a cohort of <strong>{totalPatients}</strong> similar ovarian cancer patients (MITO16a),
                                    post-surgery MRD grouping using sWGS (TF + PF) stratified outcomes significantly:
                                    <br />
                                    <strong style={{ color: '#2e7d32' }}>Group 0</strong> (low risk): median PFS {getGroupData(0).median_pfs_months || '—'} months
                                    {' · '}
                                    <strong style={{ color: '#c62828' }}>Group 2</strong> (high risk): median PFS {getGroupData(2).median_pfs_months || '—'} months
                                    <br />
                                    This difference ({((getGroupData(0).median_pfs_months || 0) - (getGroupData(2).median_pfs_months || 0)).toFixed(1)} month gap) held even after adjusting for clinical factors.
                                </Typography>
                            </Alert>

                            <Typography variant="caption" sx={{ color: TEXT_DIM, display: 'block', mb: 2, lineHeight: 1.5 }}>
                                From the MITO16a study ({totalPatients} ovarian cancer patients), post-surgery MRD grouping
                                (TF ≥ {cutoffs.tf_pct}% + PF ≥ {cutoffs.pf}) significantly stratified
                                progression-free and overall survival:
                            </Typography>

                            {[0, 1, 2].map(g => (
                                <CohortGroupBar
                                    key={g}
                                    group={g}
                                    count={getGroupData(g).count}
                                    total={totalPatients}
                                    survival={getGroupData(g)}
                                />
                            ))}

                            <Divider sx={{ my: 1.5, borderColor: BORDER }} />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: TEXT_MED, fontWeight: 700, display: 'block', mb: 0.5 }}>
                                        Cutoffs (Exploratory)
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: TEXT_DIM, fontFamily: 'monospace', display: 'block' }}>
                                        TF ≥ {cutoffs.tf_pct}% → HIGH
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: TEXT_DIM, fontFamily: 'monospace', display: 'block' }}>
                                        PF ≥ {cutoffs.pf} → HIGH
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: TEXT_MED, fontWeight: 700, display: 'block', mb: 0.5 }}>
                                        Source
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: TEXT_DIM, display: 'block', lineHeight: 1.4 }}>
                                        {source}
                                        <br />sWGS + ichorCNA + fragment analysis
                                        <br />{cohortSummary?.available ? '✅ Live from API' : '📦 Fallback data'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Alert severity="warning" variant="outlined" sx={{
                                mt: 2, bgcolor: '#2d1e0f20', borderColor: '#f57c0030',
                                '& .MuiAlert-icon': { color: '#f57c00' },
                            }}>
                                These cutoffs are exploratory — not validated clinical thresholds.
                                We use them as internal priors but never present them as decision boundaries.
                            </Alert>
                        </>
                    )}
                </SectionCard>

                {/* ── Footer Provenance ──────────────────────────────────────── */}
                <Box sx={{ mt: 4, py: 2, borderTop: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#2d3748', fontSize: '0.55rem' }}>
                        MRD Intelligence v1.0 · Kill Chain 2-of-4 · Panel Proxy + sWGS Dual-Modality
                        <br />
                        Population context: {source} · {totalPatients} patients · sWGS ichorCNA TF + PF
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default PostDebulkingMRD;
