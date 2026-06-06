/**
 * TestDetailPage — Orchestrator for test and monitoring detail pages.
 *
 * Route: /ayesha/journey/test/:slug   (type=test)
 *        /ayesha/journey/monitor/:slug (type=monitoring)
 *
 * Layout cloned from DrugDetailPage:
 *   Left (flex:1)  — Hero → BiologySignalCards → KillChainAxisMap → IOProfileSection → ProvenanceFooter
 *   Right (280px)  — Limitations sidebar + monitoring-specific fields
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Alert, Chip, Divider } from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { Schedule, TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import { CLINICAL_TEST_REGISTRY } from '../../../constants/clinicalTestRegistry';
import CA125EntryForm from '../../../components/ayesha/inputs/CA125EntryForm';
import HRDEntryForm from '../../../components/ayesha/inputs/HRDEntryForm';
import CtDNAEntryForm from '../../../components/ayesha/inputs/CtDNAEntryForm';
import RepairCapacityEntryForm from '../../../components/ayesha/inputs/RepairCapacityEntryForm';
import RNAExpressionForm from '../../../components/ayesha/inputs/RNAExpressionForm';
import LpWGSForm from '../../../components/ayesha/inputs/LpWGSForm';
import { useBiomarkerUpdate } from '../../../hooks/ayesha/useBiomarkerUpdate';

// ── Test Detail sub-components ────────────────────────────────────────────────
import DetailHero from '../../../components/ayesha/test-detail/DetailHero';
import BiologySignalCards from '../../../components/ayesha/test-detail/BiologySignalCards';
import KillChainAxisMap from '../../../components/ayesha/test-detail/KillChainAxisMap';
import IOProfileSection from '../../../components/ayesha/test-detail/IOProfileSection';
import ProvenanceFooter from '../../../components/ayesha/test-detail/ProvenanceFooter';
import PageContextSection from '../../../components/ayesha/test-detail/PageContextSection';
import EnginePanel from '../../../components/ayesha/test-detail/EnginePanel';

// ── Typography override (same pattern as DrugDetailPage) ──────────────────────
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

// ── Trend icon helper ──────────────────────────────────────────────────────────
const TREND_ICONS = {
    falling: { Icon: TrendingDown, color: '#16a34a' },
    stable: { Icon: TrendingFlat, color: '#d97706' },
    rising: { Icon: TrendingUp, color: '#dc2626' },
    cleared: { Icon: TrendingDown, color: '#059669' },
};

// ── Monitoring Sidebar Section ────────────────────────────────────────────────
function MonitoringSidebar({ entry }) {
    if (entry.type !== 'monitoring') return null;

    return (
        <>
            {/* Frequency */}
            {entry.frequency && (
                <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Schedule sx={{ fontSize: 18, color: '#2563eb' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.85rem' }}>
                            Monitoring Schedule
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                        {entry.frequency}
                    </Typography>
                </Paper>
            )}

            {/* Trend Interpretation */}
            {entry.trend_interpretation && (
                <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', mb: 1.5 }}>
                        Trend Interpretation
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {Object.entries(entry.trend_interpretation).map(([trend, meaning]) => {
                            const t = TREND_ICONS[trend] || TREND_ICONS.stable;
                            return (
                                <Box key={trend} sx={{
                                    p: 1.5, borderRadius: 1.5,
                                    bgcolor: t.color + '08',
                                    border: `1px solid ${t.color}25`,
                                    display: 'flex', alignItems: 'flex-start', gap: 1,
                                }}>
                                    <t.Icon sx={{ fontSize: 18, color: t.color, mt: 0.15 }} />
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: t.color, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                            {trend}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                                            {meaning}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Paper>
            )}

            {/* Alert Thresholds */}
            {entry.alert_thresholds && (
                <Paper sx={{
                    p: 2, borderRadius: 2.5,
                    bgcolor: '#fef2f2',
                    border: '1.5px solid #fecaca',
                }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b', fontSize: '0.85rem', mb: 1 }}>
                        🚨 Alert Thresholds
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {Object.entries(entry.alert_thresholds).map(([key, msg]) => (
                            <Box key={key} sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.6)' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.72rem' }}>
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                                    {msg}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}
        </>
    );
}

// ── KELIM Section ─────────────────────────────────────────────────────────────
function KELIMSection({ kelim }) {
    if (!kelim) return null;

    return (
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', mb: 1.5 }}>
                KELIM Engine Integration
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Chip label={`API: ${kelim.api_endpoint}`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                <Chip label={`Cutoff: ${kelim.kelim_score_cutoff}`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                <Chip label={`Half-life median: ${kelim.half_life_median_days}d`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
            </Box>
            {kelim.genotype_stratification && (
                <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.78rem', mb: 1, display: 'block' }}>
                        Genotype-Stratified Expected KELIM
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Object.entries(kelim.genotype_stratification).map(([genotype, data]) => (
                            <Chip
                                key={genotype}
                                label={`${genotype.replace(/_/g, ' ')}: ${data.expected} ± ${data.sd}`}
                                size="small"
                                sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: '#f0fdf4' }}
                            />
                        ))}
                    </Box>
                </>
            )}
        </Paper>
    );
}

// ── Caveat Panel (for tests with no live analysis) ───────────────────────────
const CAVEAT_CONFIGS = {
    rna_expression: {
        title: 'RNA Expression — Directional Only',
        icon: '⚠️',
        color: '#fef9c3',
        borderColor: '#fde68a',
        textColor: '#854d0e',
        lines: [
            'Trained on GSE91061 (N=105, HGSOC). Permutation p=0.191 — not statistically significant.',
            'Bootstrap AUC=0.699; nested CV AUC=0.601 (near chance). EPV=2.9 (overfit risk).',
            'Live axis scoring available via the form below (IO/VEGF/Efflux/HER2 gene thresholds).',
            'Results must be interpreted by a clinical genomics specialist.',
        ],
    },
    lpwgs: {
        title: 'lpWGS — Display Only',
        icon: '📋',
        color: '#eff6ff',
        borderColor: '#bfdbfe',
        textColor: '#1e40af',
        lines: [
            'CN signature analysis based on Macintyre et al. 2018 (BriTROC cohort, N=117). PMID 30017478.',
            'Validated in independent cohorts. Live CN signature scoring available via the form below.',
            'Enter Sig7 exposure from your lpWGS report. Threshold: Sig7 ≥ 0.25 → POOR (BriTROC, N=117).',
            'Confidence capped at MEDIUM pending multi-cohort validation. RUO.',
        ],
    },
};

function CaveatPanel({ slug }) {
    const cfg = CAVEAT_CONFIGS[slug];
    if (!cfg) return null;
    return (
        <Paper sx={{ p: 2, borderRadius: 2.5, border: `1.5px solid ${cfg.borderColor}`, bgcolor: cfg.color }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: cfg.textColor, fontSize: '0.85rem', mb: 1 }}>
                {cfg.icon} {cfg.title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {cfg.lines.map((line, i) => (
                    <Typography key={i} variant="caption" sx={{ color: cfg.textColor, fontSize: '0.78rem', lineHeight: 1.5 }}>
                        • {line}
                    </Typography>
                ))}
            </Box>
        </Paper>
    );
}

// ── Entry Form Section (slug → form mapping) ────────────────────────────────
const SLUG_ENTRY_FORMS = {
    ca125_kinetics: { Form: CA125EntryForm, label: 'CA-125 Value Entry' },
    hrd: { Form: HRDEntryForm, label: 'HRD Score Entry' },
    hrd_score: { Form: HRDEntryForm, label: 'HRD Score Entry' },
    ctdna_mrd: { Form: CtDNAEntryForm, label: 'ctDNA / MRD Entry' },
    repair_capacity: { Form: RepairCapacityEntryForm, label: 'Repair Capacity Entry' },
    rna_expression: { Form: RNAExpressionForm, label: 'RNA Expression Scoring' },
    lpwgs: { Form: LpWGSForm, label: 'CN Signature Scoring (lpWGS)' },
};


// Slugs that call the backend directly — skip useBiomarkerUpdate wrapper
const SELF_SCORING_SLUGS = new Set(['rna_expression', 'lpwgs']);

function DataEntrySection({ slug, onSaveSuccess }) {
    const { update, saving, saved, error } = useBiomarkerUpdate(slug);

    const config = SLUG_ENTRY_FORMS[slug];
    if (!config) {
        return (
            <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px dashed', borderColor: 'divider', bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.82rem', mb: 0.5 }}>
                    📝 Data Entry
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Manual entry not available for this test. Contact your clinical team.
                </Typography>
            </Paper>
        );
    }
    const { Form, label } = config;

    // Self-scoring forms (RNA, lpWGS) handle their own API calls — no useBiomarkerUpdate wrapper
    if (SELF_SCORING_SLUGS.has(slug)) {
        return (
            <Paper sx={{ p: 2, borderRadius: 2.5, border: '1.5px solid #6366f1', bgcolor: '#f5f3ff' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4338ca', fontSize: '0.85rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🔬 {label}
                </Typography>
                <Form onSave={(data) => onSaveSuccess?.(data)} />
            </Paper>
        );
    }

    const handleSave = async (data) => {
        await update(data);
        onSaveSuccess?.();
    };

    return (
        <Paper sx={{ p: 2, borderRadius: 2.5, border: '1.5px solid #f59e0b', bgcolor: '#fffbeb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e', fontSize: '0.85rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                ✏️ {label}
            </Typography>
            <Form onSave={handleSave} />
            {saving && (
                <Typography variant="caption" sx={{ color: '#92400e', mt: 1, display: 'block' }}>
                    Saving...
                </Typography>
            )}
            {saved && (
                <Typography variant="caption" sx={{ color: '#166534', mt: 1, display: 'block', fontWeight: 700 }}>
                    ✓ Saved — profile updated.
                </Typography>
            )}
            {error && (
                <Typography variant="caption" sx={{ color: '#991b1b', mt: 1, display: 'block' }}>
                    ⚠ {error}
                </Typography>
            )}
        </Paper>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TestDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const pageTheme = usePageTheme();

    const entry = CLINICAL_TEST_REGISTRY[slug];
    const isMonitoring = entry?.type === 'monitoring';

    return (
        <ThemeProvider theme={pageTheme}>
            <JourneyLayout>
                <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3, px: { xs: 2, md: 0 } }}>

                    {/* Not found */}
                    {!entry && (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            Test "{slug}" not found in clinical registry.{' '}
                            <Typography
                                component="span"
                                sx={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                                onClick={() => navigate(isMonitoring ? '/ayesha/journey/monitoring' : '/ayesha/journey/tests')}
                            >
                                Back to {isMonitoring ? 'Monitoring' : 'Tests'}
                            </Typography>
                        </Alert>
                    )}

                    {/* Main content */}
                    {entry && (
                        <>
                            <DetailHero
                                entry={entry}
                                onBack={() => navigate(isMonitoring ? '/ayesha/journey/monitoring' : '/ayesha/journey/tests')}
                                backLabel={isMonitoring ? 'Back to Monitoring' : 'Back to Tests'}
                            />

                            {/* ── ENGINE LIGHT DASHBOARD (full-width) ── */}
                            <Box sx={{ mt: 2.5 }}>
                                <EnginePanel />
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: 3,
                                alignItems: 'flex-start',
                                mt: 3,
                            }}>
                                {/* ── LEFT COLUMN ── */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                                    <BiologySignalCards entry={entry} cancerType="ovarian" />
                                    <KillChainAxisMap axes={entry.kill_chain_axes} />
                                    {entry.kelim && <KELIMSection kelim={entry.kelim} />}
                                    <IOProfileSection entry={entry} profileCard={null} cancerType="ovarian" />
                                    <ProvenanceFooter entry={entry} />
                                    <PageContextSection entry={entry} />
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
                                    {/* Unlock keys */}
                                    {entry.unlock_keys?.length > 0 && (
                                        <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', mb: 1 }}>
                                                Unlocks
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {entry.unlock_keys.map(key => (
                                                    <Chip key={key} label={key.replace(/_/g, ' ')} size="small"
                                                        sx={{ fontWeight: 600, fontSize: '0.72rem', bgcolor: '#dbeafe', color: '#1d4ed8' }} />
                                                ))}
                                            </Box>
                                        </Paper>
                                    )}

                                    <MonitoringSidebar entry={entry} />
                                    <CaveatPanel slug={slug} />
                                    <DataEntrySection slug={slug} />
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            </JourneyLayout>
        </ThemeProvider>
    );
}
