import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert, CircularProgress, Skeleton, Button, Chip, Grid } from '@mui/material';
import { useAyeshaTherapyFitBundle } from '../../hooks/useAyeshaTherapyFitBundle';
import { useTargetedTherapyBrief } from '../../hooks/useTargetedTherapyBrief';
import { RefreshCw, Play, Shield, Activity, AlertTriangle, Clock, ArrowRight, ArrowUp, ArrowDown, Minus, FlaskConical, FileText, BookOpen, Sparkles, Upload, TestTube, Dna, BarChart3, Sun, Moon } from 'lucide-react';

// Zeta Components
import DefenseAnalysisBanner from '../../components/ayesha/DefenseAnalysisBanner';
import PrimaryWeaponCard from '../../components/ayesha/PrimaryWeaponCard';
import VisualMechanismCard from '../../components/ayesha/VisualMechanismCard';
import WarGamesGrid from '../../components/ayesha/WarGamesGrid';
import StrictDrugSearch from '../../components/ayesha/StrictDrugSearch';

import AyeshaDrugPanel from '../../components/ayesha/AyeshaDrugPanel';
import { API_ROOT } from '../../lib/apiConfig';


const LoadingFallback = () => <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 0, mb: 4, bgcolor: '#1e293b' }} />;

// ─── Fix 3: Analysis Telemetry Panel ────────────────────────────────
// Reads ONLY stable fields present in both /bundle and /analyze shapes.
const AnalysisTelemetryPanel = ({ levelData, isSimulation, scenarioId }) => {
    if (!levelData) return null;

    // Tolerant reads: support both /bundle (efficacy.*) and /analyze (* at root)
    // AND both key styles: snake_case (pathway_scores) and concatenated (pathwayscores)
    const provenance = levelData?.efficacy?.provenance ?? levelData?.provenance ?? {};
    const pathwayScores = levelData?.efficacy?.pathway_scores
        ?? levelData?.efficacy?.pathwayscores
        ?? levelData?.pathway_scores
        ?? levelData?.pathwayscores
        ?? {};
    const drugs = levelData?.efficacy?.drugs ?? levelData?.drugs ?? [];
    const timestamp = levelData?.analysis_date ?? levelData?.analysisdate
        ?? levelData?.generatedat ?? null;

    const topDrug = drugs[0] ?? {};
    const citationsCount = topDrug?.citations_count ?? topDrug?.citationscount ?? null;
    const ruoReasons = topDrug?.ruo_reasons ?? topDrug?.ruoreasons ?? [];
    const insightsMode = provenance?.insights ?? null;
    const runId = provenance?.run_id ?? provenance?.runid ?? null;

    // Pathway score bar helper
    const PathwayBar = ({ label, value, maxVal = 0.5 }) => {
        const pct = value != null ? Math.min((value / maxVal) * 100, 100) : 0;
        const isNull = value === null || value === undefined;
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'monospace', width: 50, textAlign: 'right' }}>
                    {label.toUpperCase()}
                </Typography>
                <Box sx={{ flex: 1, height: 6, bgcolor: '#1e293b', borderRadius: 1, overflow: 'hidden' }}>
                    {!isNull && (
                        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: pct > 50 ? '#f59e0b' : '#3b82f6', transition: 'width 0.3s' }} />
                    )}
                </Box>
                <Typography sx={{ color: isNull ? '#475569' : '#e2e8f0', fontSize: '0.65rem', fontFamily: 'monospace', width: 40 }}>
                    {isNull ? 'n/a' : value.toFixed(3)}
                </Typography>
            </Box>
        );
    };

    return (
        <Box sx={{
            mb: 4, p: 2, bgcolor: '#0f172a', border: '1px solid',
            borderColor: isSimulation ? '#f59e0b44' : '#1e293b',
            borderRadius: 1,
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield size={14} color={isSimulation ? '#f59e0b' : '#3b82f6'} />
                    <Typography sx={{ color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>
                        {isSimulation ? `SIMULATION: ${scenarioId}` : 'BASELINE ANALYSIS'}
                    </Typography>
                </Box>
                {timestamp && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Clock size={10} color="#64748b" />
                        <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                            {timestamp}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Provenance Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                {runId && (
                    <Typography sx={{ color: '#475569', fontSize: '0.6rem', fontFamily: 'monospace' }}>
                        RUN: {runId.slice(0, 8)}
                    </Typography>
                )}
                {insightsMode && (
                    <Chip
                        label={insightsMode === 'skipped_fast_mode' ? 'FAST MODE' : insightsMode}
                        size="small"
                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#1e293b', color: '#f59e0b', letterSpacing: 0.5 }}
                    />
                )}
            </Box>

            {/* Pathway Scores */}
            <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>
                    PATHWAY DISRUPTION
                </Typography>
                <PathwayBar label="DDR" value={pathwayScores?.ddr} />
                <PathwayBar label="TP53" value={pathwayScores?.tp53} />
                <PathwayBar label="MAPK" value={pathwayScores?.mapk} />
                <PathwayBar label="VEGF" value={pathwayScores?.vegf} />
                <PathwayBar label="PI3K" value={pathwayScores?.pi3k} />
            </Box>

            {/* RUO / Evidence Status */}
            {(citationsCount === 0 || ruoReasons.length > 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1, borderTop: '1px solid #1e293b' }}>
                    <AlertTriangle size={12} color="#f59e0b" />
                    <Typography sx={{ color: '#f59e0b', fontSize: '0.65rem', fontWeight: 600 }}>
                        No citations surfaced (RUO)
                    </Typography>
                    {insightsMode === 'skipped_fast_mode' && (
                        <Typography sx={{ color: '#64748b', fontSize: '0.6rem', fontStyle: 'italic', ml: 1 }}>
                            Pipeline mode: fast (evidence lookup gated)
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

// ═══════════════════════════════════════════════════════════════════════
// ENGINEERING AGENT: Pure diff computation — no inferred fields
// Only reads: drugs[].name, drugs[].final_score, drugs[].efficacy_score,
//   drugs[].evidence_tier, drugs[].citations_count, pathway_scores.*
// ═══════════════════════════════════════════════════════════════════════

const tolerantDrugs = (ld) => ld?.efficacy?.drugs ?? ld?.drugs ?? [];
const tolerantPathways = (ld) =>
    ld?.efficacy?.pathway_scores ?? ld?.efficacy?.pathwayscores
    ?? ld?.pathway_scores ?? ld?.pathwayscores ?? {};

function computeScenarioDiff(baseline, scenario) {
    if (!baseline || !scenario) return null;

    const bDrugs = tolerantDrugs(baseline);
    const sDrugs = tolerantDrugs(scenario);
    const bPathways = tolerantPathways(baseline);
    const sPathways = tolerantPathways(scenario);

    // Drug diff: top-3 by name, score, tier, and citations
    const extractDrug = (d) => ({
        name: d.name,
        score: d.final_score ?? d.efficacy_score ?? 0,
        tier: d.evidence_tier ?? 'unknown',
        citations: d.citations_count ?? d.citationscount ?? 0,
    });
    const bTop3 = bDrugs.slice(0, 3).map(extractDrug);
    const sTop3 = sDrugs.slice(0, 3).map(extractDrug);

    const bNames = new Set(bTop3.map(d => d.name));
    const sNames = new Set(sTop3.map(d => d.name));
    const added = sTop3.filter(d => !bNames.has(d.name));
    const removed = bTop3.filter(d => !sNames.has(d.name));
    const retained = sTop3.filter(d => bNames.has(d.name)).map(sd => {
        const bd = bTop3.find(b => b.name === sd.name);
        return {
            name: sd.name,
            before: bd?.score ?? 0, after: sd.score,
            delta: sd.score - (bd?.score ?? 0),
            tierBefore: bd?.tier ?? 'unknown', tierAfter: sd.tier ?? 'unknown',
            citBefore: bd?.citations ?? 0, citAfter: sd.citations ?? 0,
        };
    });

    // Pathway diff: only keys with changed values
    const allPathKeys = new Set([...Object.keys(bPathways), ...Object.keys(sPathways)]);
    const pathDiffs = [];
    for (const key of allPathKeys) {
        const bVal = bPathways[key];
        const sVal = sPathways[key];
        if (bVal === sVal) continue;
        pathDiffs.push({ key, before: bVal, after: sVal });
    }

    // Total citation counts for summary
    const totalBaselineCitations = bDrugs.reduce((s, d) => s + (d.citations_count ?? d.citationscount ?? 0), 0);
    const totalScenarioCitations = sDrugs.reduce((s, d) => s + (d.citations_count ?? d.citationscount ?? 0), 0);

    return { added, removed, retained, pathDiffs, baselineCount: bDrugs.length, scenarioCount: sDrugs.length, totalBaselineCitations, totalScenarioCitations };
}

// ═══════════════════════════════════════════════════════════════════════
// COPY AGENT: Patient-friendly 4-line receipt
// Anti-hallucination: suppresses claims when citations_count === 0
// ═══════════════════════════════════════════════════════════════════════

function generateReceiptLines(scenario, diff, completeness, scenarioMeta) {
    const missing = completeness?.missing ?? [];
    const hasCitations = tolerantDrugs(scenario).some(
        d => (d.citations_count ?? d.citationscount ?? 0) > 0
    );

    const assumptions = missing.length > 0
        ? `This scenario fills in missing data (${missing.slice(0, 2).join(', ')}${missing.length > 2 ? '\u2026' : ''}) with hypothetical values to explore what could change.`
        : 'This scenario uses your complete molecular profile with a different clinical hypothesis.';

    const why = scenarioMeta?.name
        ? `Exploring: \u201C${scenarioMeta.name}\u201D`
        : 'Exploring how different molecular assumptions would shift drug recommendations.';

    let whatChanged = 'No significant changes detected.';
    if (diff) {
        const parts = [];
        if (diff.added.length > 0) parts.push(`+${diff.added.length} new candidate${diff.added.length > 1 ? 's' : ''} appeared`);
        if (diff.removed.length > 0) parts.push(`${diff.removed.length} baseline candidate${diff.removed.length > 1 ? 's' : ''} dropped`);
        if (diff.pathDiffs.length > 0) parts.push(`${diff.pathDiffs.length} pathway score${diff.pathDiffs.length > 1 ? 's' : ''} shifted`);
        if (parts.length > 0) whatChanged = parts.join('; ') + '.';
    }

    const evidence = hasCitations
        ? 'Some candidates have published evidence supporting this hypothesis.'
        : 'No published citations were found for these candidates in this context. All results are computational estimates only.';

    return { assumptions, why, whatChanged, evidence };
}

// ═══════════════════════════════════════════════════════════════════════
// UX AGENT: Scenario Receipt Panel
// Flow: Scenario click → receipt slides in → compare baseline → CTA
// ═══════════════════════════════════════════════════════════════════════

const ScenarioReceiptPanel = React.forwardRef(({ baseline, scenario, scenarioId, scenarioMeta, completeness, darkMode = true }, ref) => {
    const navigate = useNavigate();
    if (!scenario || !scenarioId) return null;

    // Theme tokens
    const t = {
        panelBg: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #0c1527 50%, #0f172a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        panelBorder: darkMode ? '#f59e0b33' : '#e2e8f0',
        panelShadow: darkMode ? '0 0 30px rgba(245, 158, 11, 0.06), inset 0 1px 0 rgba(255,255,255,0.03)' : '0 4px 24px rgba(0,0,0,0.08)',
        headerBg: darkMode ? 'linear-gradient(90deg, #1e293b 0%, #1a2332 100%)' : 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
        headerBorder: darkMode ? '#f59e0b22' : '#e2e8f0',
        headerText: darkMode ? '#f59e0b' : '#b45309',
        bodyBg: 'transparent',
        labelColor: darkMode ? '#64748b' : '#94a3b8',
        textPrimary: darkMode ? '#e2e8f0' : '#0f172a',
        textSecondary: darkMode ? '#cbd5e1' : '#334155',
        textMuted: darkMode ? '#94a3b8' : '#64748b',
        scoreColor: darkMode ? '#e2e8f0' : '#0f172a',
        scoreMuted: darkMode ? '#475569' : '#94a3b8',
        sectionBg: darkMode ? '#ffffff05' : '#f8fafc',
        sectionBorder: darkMode ? '#ffffff0a' : '#e2e8f0',
        ctaBg: darkMode ? 'linear-gradient(180deg, #0c1527 0%, #111b2e 100%)' : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        ctaBorder: darkMode ? '#f59e0b33' : '#e2e8f0',
        cardBg: darkMode ? '#ffffff05' : '#ffffff',
        cardBorder: darkMode ? '#ffffff0a' : '#e2e8f0',
        cardHoverBg: darkMode ? '#ffffff0a' : '#f1f5f9',
        cardHoverBorder: darkMode ? '#38bdf822' : '#38bdf844',
        iconBg: darkMode ? '#ffffff08' : '#f1f5f9',
    };

    const diff = useMemo(() => computeScenarioDiff(baseline, scenario), [baseline, scenario]);
    const receipt = useMemo(
        () => generateReceiptLines(scenario, diff, completeness, scenarioMeta),
        [scenario, diff, completeness, scenarioMeta]
    );
    const missing = completeness?.missing ?? [];

    // Tier display helpers
    const tierColor = (tier) => {
        const t = (tier || 'unknown').toLowerCase();
        if (t === 'strong' || t === 'tier_1') return '#22c55e';
        if (t === 'moderate' || t === 'tier_2') return '#3b82f6';
        if (t === 'limited' || t === 'tier_3') return '#f59e0b';
        return '#64748b';
    };

    const TierBadge = ({ tier }) => (
        <Chip
            label={(tier || 'unknown').replace(/_/g, ' ')}
            size="small"
            sx={{
                height: 16, fontSize: '0.55rem', fontWeight: 700, borderRadius: 0.5,
                bgcolor: `${tierColor(tier)}18`, color: tierColor(tier), border: `1px solid ${tierColor(tier)}33`,
                textTransform: 'uppercase', letterSpacing: 0.5,
            }}
        />
    );

    const CitBadge = ({ count }) => (
        count > 0 ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                <BookOpen size={9} color="#a78bfa" />
                <Typography sx={{ color: '#a78bfa', fontSize: '0.6rem', fontWeight: 700, fontFamily: 'monospace' }}>
                    {count}
                </Typography>
            </Box>
        ) : null
    );

    const DeltaIcon = ({ val }) => {
        if (val > 0) return <ArrowUp size={10} color="#22c55e" />;
        if (val < 0) return <ArrowDown size={10} color="#ef4444" />;
        return <Minus size={10} color="#475569" />;
    };

    const ScoreCell = ({ value, muted }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: muted ? '#475569' : '#e2e8f0' }}>
            {value === null || value === undefined ? 'n/a' : typeof value === 'number' ? value.toFixed(3) : value}
        </Typography>
    );

    return (
        <Box ref={ref} sx={{
            mb: 4, overflow: 'hidden', borderRadius: 2,
            background: t.panelBg,
            border: `1px solid ${t.panelBorder}`,
            boxShadow: t.panelShadow,
            animation: 'fadeSlideIn 0.4s ease-out',
            '@keyframes fadeSlideIn': { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        }}>
            {/* Header */}
            <Box sx={{
                px: 2.5, py: 1.5,
                background: t.headerBg,
                borderBottom: `1px solid ${t.headerBorder}`,
                display: 'flex', alignItems: 'center', gap: 1,
            }}>
                <FlaskConical size={14} color={t.headerText} />
                <Typography sx={{ color: t.headerText, fontSize: '0.75rem', fontWeight: 800, letterSpacing: 1.5 }}>
                    HYPOTHETICAL SCENARIO RECEIPT
                </Typography>
                {diff && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                        <BookOpen size={10} color="#a78bfa" />
                        <Typography sx={{ color: '#a78bfa', fontSize: '0.6rem', fontWeight: 600 }}>
                            {diff.totalScenarioCitations} citation{diff.totalScenarioCitations !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                )}
                <Chip label={scenarioId} size="small" sx={{ ml: 'auto', height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#f59e0b22', color: '#f59e0b', borderRadius: 0.5 }} />
            </Box>

            {/* 4-Line Receipt (Copy Agent) */}
            <Box sx={{ px: 2.5, py: 2.5 }}>
                {[
                    { label: 'ASSUMPTIONS', icon: '\u2699\uFE0F', text: receipt.assumptions },
                    { label: 'WHY', icon: '\uD83D\uDD0D', text: receipt.why },
                    { label: 'WHAT CHANGED', icon: '\uD83D\uDD04', text: receipt.whatChanged },
                    { label: 'EVIDENCE', icon: '\uD83D\uDCC4', text: receipt.evidence },
                ].map(({ label, icon, text }) => (
                    <Box key={label} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                        <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{icon}</Typography>
                        <Box>
                            <Typography sx={{ color: '#64748b', fontSize: '0.55rem', fontWeight: 700, letterSpacing: 1.5, mb: 0.2 }}>
                                {label}
                            </Typography>
                            <Typography sx={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>
                                {text}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Drug Comparison Table (Engineering Agent) */}
            {diff && (diff.added.length > 0 || diff.removed.length > 0 || diff.retained.length > 0) && (
                <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #1e293b' }}>
                    <Typography sx={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 700, letterSpacing: 1, mb: 1.5 }}>
                        DRUG CANDIDATE COMPARISON (TOP 3)
                    </Typography>

                    {/* Removed drugs */}
                    {diff.removed.map(d => (
                        <Box key={d.name} sx={{
                            display: 'flex', alignItems: 'center', gap: 1, mb: 1, py: 0.5, px: 1,
                            bgcolor: '#ef444408', borderRadius: 1, border: '1px solid #ef444415',
                        }}>
                            <ArrowDown size={10} color="#ef4444" />
                            <Typography sx={{ color: '#ef4444', fontSize: '0.7rem', fontFamily: 'monospace', textDecoration: 'line-through', minWidth: 90 }}>
                                {d.name}
                            </Typography>
                            <ScoreCell value={d.score} muted />
                            <TierBadge tier={d.tier} />
                            <CitBadge count={d.citations} />
                            <Typography sx={{ color: '#475569', fontSize: '0.6rem', fontStyle: 'italic', ml: 'auto' }}>dropped</Typography>
                        </Box>
                    ))}

                    {/* Added drugs */}
                    {diff.added.map(d => (
                        <Box key={d.name} sx={{
                            display: 'flex', alignItems: 'center', gap: 1, mb: 1, py: 0.5, px: 1,
                            bgcolor: '#22c55e08', borderRadius: 1, border: '1px solid #22c55e15',
                        }}>
                            <ArrowUp size={10} color="#22c55e" />
                            <Typography sx={{ color: '#22c55e', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, minWidth: 90 }}>
                                {d.name}
                            </Typography>
                            <ScoreCell value={d.score} />
                            <TierBadge tier={d.tier} />
                            <CitBadge count={d.citations} />
                            <Chip label="NEW" size="small" sx={{
                                ml: 'auto', height: 16, fontSize: '0.5rem', fontWeight: 800,
                                bgcolor: '#22c55e18', color: '#22c55e', borderRadius: 0.5,
                            }} />
                        </Box>
                    ))}

                    {/* Retained drugs */}
                    {diff.retained.map(d => (
                        <Box key={d.name} sx={{
                            display: 'flex', alignItems: 'center', gap: 1, mb: 1, py: 0.5, px: 1,
                            bgcolor: '#ffffff03', borderRadius: 1, border: '1px solid #ffffff08',
                        }}>
                            <DeltaIcon val={d.delta} />
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'monospace', minWidth: 90 }}>{d.name}</Typography>
                            <ScoreCell value={d.before} muted />
                            <ArrowRight size={8} color="#475569" />
                            <ScoreCell value={d.after} />
                            {/* Tier change indicator */}
                            {d.tierBefore !== d.tierAfter ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                    <TierBadge tier={d.tierBefore} />
                                    <ArrowRight size={7} color="#475569" />
                                    <TierBadge tier={d.tierAfter} />
                                </Box>
                            ) : (
                                <TierBadge tier={d.tierAfter} />
                            )}
                            {/* Citation delta */}
                            {(d.citBefore > 0 || d.citAfter > 0) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 0.5 }}>
                                    <BookOpen size={9} color="#a78bfa" />
                                    <Typography sx={{ color: '#a78bfa', fontSize: '0.55rem', fontFamily: 'monospace' }}>
                                        {d.citBefore !== d.citAfter ? `${d.citBefore}→${d.citAfter}` : d.citAfter}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            )}

            {/* Pathway Score Shifts (Engineering Agent) */}
            {diff && diff.pathDiffs.length > 0 && (
                <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #1e293b' }}>
                    <Typography sx={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 700, letterSpacing: 1, mb: 1.5 }}>
                        PATHWAY DISRUPTION SHIFTS
                    </Typography>
                    {diff.pathDiffs.map(p => (
                        <Box key={p.key} sx={{
                            display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, py: 0.3, px: 1,
                            bgcolor: '#ffffff03', borderRadius: 1,
                        }}>
                            <DeltaIcon val={(p.after ?? 0) - (p.before ?? 0)} />
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.65rem', fontFamily: 'monospace', width: 44, textAlign: 'right', fontWeight: 600 }}>
                                {p.key.toUpperCase()}
                            </Typography>
                            <ScoreCell value={p.before} muted />
                            <ArrowRight size={8} color="#475569" />
                            <ScoreCell value={p.after} />
                        </Box>
                    ))}
                </Box>
            )}

            {/* CTA: What Would Confirm This? — Actionable Upload Cards */}
            {missing.length > 0 && (() => {
                // Map test name to icon, description, and route-safe key
                const testMeta = (name) => {
                    const n = (name || '').toLowerCase();
                    if (n.includes('hrd')) return { icon: <Dna size={18} color="#38bdf8" />, unlocks: 'DDR/PARP mechanism confidence, repair deficiency scoring', key: 'HRD score' };
                    if (n.includes('tmb')) return { icon: <BarChart3 size={18} color="#a78bfa" />, unlocks: 'Immunotherapy axis, mutational burden classification', key: 'TMB score' };
                    if (n.includes('rna') || n.includes('expression')) return { icon: <FlaskConical size={18} color="#22c55e" />, unlocks: 'Pathway activation map, mechanism confirmation beyond DNA', key: 'RNA expression data' };
                    if (n.includes('ca-125') || n.includes('ca125')) return { icon: <TestTube size={18} color="#f59e0b" />, unlocks: 'Treatment response kinetics, early resistance detection', key: 'CA-125 lab values' };
                    return { icon: <FileText size={18} color="#64748b" />, unlocks: 'Additional analysis depth', key: name };
                };
                return (
                    <Box sx={{
                        px: 3, py: 3, borderTop: `1px solid ${t.ctaBorder}`,
                        background: t.ctaBg,
                    }}>
                        {/* Section Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 24px rgba(56, 189, 248, 0.25)',
                            }}>
                                <Sparkles size={20} color="#fff" />
                            </Box>
                            <Box>
                                <Typography sx={{ color: t.textPrimary, fontSize: '1.15rem', fontWeight: 800, letterSpacing: 0.3, lineHeight: 1.2 }}>
                                    What Would Confirm This?
                                </Typography>
                                <Typography sx={{ color: t.textMuted, fontSize: '0.85rem', lineHeight: 1.5, mt: 0.3 }}>
                                    Upload your results to unlock higher-confidence scoring
                                </Typography>
                            </Box>
                        </Box>

                        {/* Per-test upload cards */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2.5 }}>
                            {missing.map((test, i) => {
                                const meta = testMeta(test);
                                return (
                                    <Box key={i} sx={{
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        p: 2, borderRadius: 2,
                                        bgcolor: t.cardBg, border: `1px solid ${t.cardBorder}`,
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: t.cardHoverBg, border: `1px solid ${t.cardHoverBorder}`, transform: 'translateX(3px)' },
                                    }}
                                        onClick={() => navigate(`/ayesha/tests-unlocks?upload=${encodeURIComponent(meta.key)}`)}
                                    >
                                        {/* Icon */}
                                        <Box sx={{
                                            width: 44, height: 44, borderRadius: 1.5,
                                            bgcolor: t.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            {meta.icon}
                                        </Box>
                                        {/* Text */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ color: t.textPrimary, fontSize: '1rem', fontWeight: 700 }}>
                                                {test}
                                            </Typography>
                                            <Typography sx={{ color: t.textMuted, fontSize: '0.8rem', lineHeight: 1.4, mt: 0.3 }}>
                                                Unlocks: {meta.unlocks}
                                            </Typography>
                                        </Box>
                                        {/* Upload button */}
                                        <Button
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/ayesha/tests-unlocks?upload=${encodeURIComponent(meta.key)}`); }}
                                            sx={{
                                                minWidth: 'auto', px: 2, py: 0.75, borderRadius: 1.5,
                                                fontSize: '0.8rem', fontWeight: 700, textTransform: 'none',
                                                color: '#38bdf8', border: '1px solid #38bdf844',
                                                '&:hover': { bgcolor: '#38bdf818', border: '1px solid #38bdf866' },
                                            }}
                                            startIcon={<Upload size={14} />}
                                        >
                                            Upload
                                        </Button>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Full upload CTA */}
                        <Button
                            fullWidth
                            onClick={() => navigate('/ayesha/tests-unlocks')}
                            sx={{
                                mt: 3, py: 1.5, borderRadius: 2,
                                fontSize: '0.95rem', fontWeight: 700, textTransform: 'none',
                                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                                color: '#fff', letterSpacing: 0.3,
                                boxShadow: '0 4px 24px rgba(56, 189, 248, 0.2)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #60ccfa 0%, #9ba3f5 100%)',
                                    boxShadow: '0 8px 32px rgba(56, 189, 248, 0.3)',
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                            startIcon={<Upload size={18} />}
                        >
                            Upload All Results — Unlock Full Confidence Scoring
                        </Button>
                    </Box>
                );
            })()}
        </Box>
    );
});

const AyeshaWeaponCompatibility = () => {
    const navigate = useNavigate();
    const [creatingDossier, setCreatingDossier] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('ayesha_theme');
        return saved === null ? true : saved === 'dark';
    });
    const toggleTheme = () => {
        setDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('ayesha_theme', next ? 'dark' : 'light');
            return next;
        });
    };

    // ZETA PROTOCOL: Simulation State
    const [activeScenario, setActiveScenario] = useState(null);
    const baselineSnapshotRef = useRef(null);
    const receiptRef = useRef(null);

    // Auto-scroll to receipt panel when a scenario is activated
    useEffect(() => {
        if (activeScenario && receiptRef.current) {
            // Small delay lets the panel render + animation start before scroll
            const timer = setTimeout(() => {
                receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [activeScenario]);

    // 1. Fetch Context (Pass scenario_id if active)
    const { data: bundle, isLoading: bundleLoading, error: bundleError, isFetching } = useAyeshaTherapyFitBundle({
        level: activeScenario ? 'l2' : 'l1', // Use L2 level logic when simulating
        scenario_id: activeScenario
    });

    // 2. Fetch Doctrine Logic (Use bundle context)
    const { data: doctrineBrief, isLoading: doctrineLoading } = useTargetedTherapyBrief({
        patientId: 'AYESHA_MAIN',
        context: bundle?.patient_context
    }, {
        enabled: !!bundle?.patient_context
    });

    if (bundleLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617' }}>
                <CircularProgress sx={{ color: '#38bdf8' }} />
                <Typography sx={{ mt: 2, color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>
                    {activeScenario ? `RUNNING WAR GAME SIMULATION: ${activeScenario}...` : "INITIALIZING WEAPON SYSTEMS..."}
                </Typography>
            </Box>
        );
    }

    if (bundleError) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Alert severity="error">
                    System Failure: {bundleError.message}
                </Alert>
                <Button onClick={() => setActiveScenario(null)} sx={{ mt: 2 }}>Reset System</Button>
            </Container>
        );
    }

    const { patient_context, synthetic_lethality, l2_scenarios, levels } = bundle || {};

    // Use the returned level data (either L1 or L2 based on request)
    const activeLevelKey = activeScenario ? 'L2' : 'L1';
    const activeLevelData = levels?.[activeLevelKey] || levels?.['L1'];

    // Snapshot baseline L1 data on first load (before any scenario switch)
    if (!activeScenario && levels?.L1 && !baselineSnapshotRef.current) {
        baselineSnapshotRef.current = JSON.parse(JSON.stringify(levels.L1));
    }

    // Scenario metadata for receipt microcopy
    const activeScenarioMeta = l2_scenarios?.find(s => s.id === activeScenario) ?? null;
    const baselineCompleteness = baselineSnapshotRef.current?.completeness ?? levels?.L1?.completeness ?? {};

    const resistanceGateData = activeLevelData?.resistance_gate;

    // ZETA PROTOCOL: War Games Oversight — Fix 1: Shape-Tolerant Sim Switch
    // Supports both /bundle shape (efficacy.drugs) and /analyze shape (drugs at root).
    // When simulation is active, bypass Doctrine and show backend efficacy data.
    const simDrugs = activeLevelData?.efficacy?.drugs ?? activeLevelData?.drugs ?? [];
    const prioritized_therapies = activeScenario ? simDrugs : (doctrineBrief?.options ?? simDrugs);

    const mappedTherapies = prioritized_therapies.map(opt => ({
        ...opt,
        name: opt.drug_name || opt.name || opt.drug,
        confidence: opt.final_score || opt.confidence || opt.efficacy_score || 0,
        molecular_rationale: opt.rationale || opt.molecular_rationale,
        evidence_tier: opt.evidence_tier,
        citations_count: opt.citations_count,
        clinical_band: opt.clinical_band
    }));

    const topDrug = mappedTherapies[0] || null;
    const otherDrugs = mappedTherapies.slice(1);

    const handleInformDoctor = async (drug) => {
        if (creatingDossier) return;
        setCreatingDossier(true);
        try {
            const payload = {
                drug_data: {
                    ...drug,
                    drug: drug.name || drug.drug || "Unknown",
                    confidence: drug.confidence || 0,
                    rationale: drug.molecular_rationale || drug.rationale,
                },
                context: {
                    patient_id: "AK",
                    level: activeLevelKey,
                },
                provenance: {
                    source: "AyeshaWeaponCompatibility",
                    version: "2.0-ZETA"
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
        <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? '#020617' : '#f8fafc', pb: 12, transition: 'background-color 0.3s ease' }}>

            {/* Header / Title Bar */}
            <Box sx={{ borderBottom: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`, bgcolor: darkMode ? '#0f172a' : '#ffffff', py: 2, transition: 'all 0.3s ease' }}>
                <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: darkMode ? '#fff' : '#0f172a', letterSpacing: 2 }}>
                            WEAPON COMPATIBILITY CENTER
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                                ZETA PROTOCOL v2.0 // PATIENT ALIAS: AYESHA
                            </Typography>
                            {isFetching && <RefreshCw size={12} className="animate-spin text-sky-500" />}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Theme Toggle */}
                        <Button
                            onClick={toggleTheme}
                            sx={{
                                minWidth: 'auto', p: 1, borderRadius: 2,
                                color: darkMode ? '#f59e0b' : '#64748b',
                                border: `1px solid ${darkMode ? '#f59e0b33' : '#e2e8f0'}`,
                                bgcolor: darkMode ? '#f59e0b11' : '#f1f5f9',
                                '&:hover': { bgcolor: darkMode ? '#f59e0b22' : '#e2e8f0' },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </Button>
                        {activeScenario && (
                            <Chip
                                icon={<Play size={14} />}
                                label={`SIMULATION ACTIVE: ${activeScenario}`}
                                color="warning"
                                sx={{ fontWeight: 800, borderRadius: 0 }}
                            />
                        )}
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 6 }}>

                {/* 1. Defense Analysis (Shields) */}
                <Suspense fallback={null}>
                    <DefenseAnalysisBanner data={resistanceGateData} levelKey={activeLevelKey} />
                </Suspense>

                {/* Glass Box: Analysis Telemetry */}
                <AnalysisTelemetryPanel
                    levelData={activeLevelData}
                    isSimulation={!!activeScenario}
                    scenarioId={activeScenario}
                />

                {/* Glass Box: Scenario Receipt (only when simulation active) */}
                {activeScenario && (
                    <ScenarioReceiptPanel
                        ref={receiptRef}
                        baseline={baselineSnapshotRef.current}
                        scenario={activeLevelData}
                        scenarioId={activeScenario}
                        scenarioMeta={activeScenarioMeta}
                        completeness={baselineCompleteness}
                        darkMode={darkMode}
                    />
                )}

                {/* 2. Primary Weapon (Best Shot) */}
                <PrimaryWeaponCard
                    topDrug={topDrug}
                    patientContext={patient_context}
                    onInform={handleInformDoctor}
                    isSimulation={!!activeScenario}
                />

                {/* 3. Target Lock (Mechanism) */}
                <Box sx={{ mb: 8, maxWidth: '1200px', mx: 'auto' }}>
                    <Suspense fallback={<LoadingFallback />}>
                        <VisualMechanismCard
                            data={synthetic_lethality || activeLevelData?.synthetic_lethality}
                            evidence={topDrug?.molecular_rationale}
                        />
                    </Suspense>
                </Box>

                {/* 4. War Games (Simulations) */}
                <Box sx={{ mb: 8, maxWidth: '1200px', mx: 'auto' }}>
                    <Suspense fallback={<LoadingFallback />}>
                        <WarGamesGrid
                            l2_scenarios={l2_scenarios}
                            onSimulate={(id) => setActiveScenario(id)}
                            activeScenarioId={activeScenario}
                        />
                    </Suspense>
                </Box>

                {/* 5. Secondary Arsenal & Drug Retrieval */}
                <Box sx={{ mt: 12, pt: 4, borderTop: '1px solid #1e293b' }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: '#475569', letterSpacing: 1 }}>
                                SECONDARY ARSENAL (TIER 2 & 3)
                            </Typography>
                            <Suspense fallback={<LoadingFallback />}>
                                <AyeshaDrugPanel
                                    drugs={otherDrugs.slice(0, 8)}
                                    onInform={handleInformDoctor}
                                />
                            </Suspense>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ pt: 2 }}>
                                <StrictDrugSearch />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

            </Container>
        </Box>
    );
};

export default AyeshaWeaponCompatibility;
