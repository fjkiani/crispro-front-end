/**
 * AyeshaWeaponCompatibility
 *
 * FE-AK-003 (2026-05-10): Reads levels.L1.efficacy.honesty; renders HEURISTIC SCORING
 *   badge in the header bar and above the primary weapon card when
 *   heuristic_sequence_used=true.
 */
import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert, CircularProgress, Skeleton, Button, Chip, Grid, Tooltip } from '@mui/material';
import { useAyeshaTherapyFitBundle } from '../../hooks/useAyeshaTherapyFitBundle';
import { useTargetedTherapyBrief } from '../../hooks/useTargetedTherapyBrief';
import { RefreshCw, Play, Shield, AlertTriangle, Clock, ArrowRight, ArrowUp, ArrowDown, Minus, FlaskConical, FileText, BookOpen, Sparkles, Upload, TestTube, Dna, BarChart3 } from 'lucide-react';

// Zeta Components
import DefenseAnalysisBanner from '../../components/ayesha/DefenseAnalysisBanner';
import PrimaryWeaponCard from '../../components/ayesha/PrimaryWeaponCard';
import { SyntheticLethalityCard } from '../../components/ayesha/SyntheticLethalityCard';
import WarGamesGrid from '../../components/ayesha/WarGamesGrid';
import StrictDrugSearch from '../../components/ayesha/StrictDrugSearch';

import AyeshaDrugPanel from '../../components/ayesha/AyeshaDrugPanel';
import { API_ROOT } from '../../lib/apiConfig';


const LoadingFallback = () => <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1, mb: 4, bgcolor: 'grey.200' }} />;

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

// ─── Fix 3: Analysis Telemetry Panel ────────────────────────────────
// Reads ONLY stable fields present in both /bundle and /analyze shapes.
const AnalysisTelemetryPanel = ({ levelData, isSimulation, scenarioId }) => {
    if (!levelData) return null;

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

    const PathwayBar = ({ label, value, maxVal = 0.5 }) => {
        const pct = value != null ? Math.min((value / maxVal) * 100, 100) : 0;
        const isNull = value === null || value === undefined;
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 'var(--text-xs)', fontFamily: 'monospace', width: 60, textAlign: 'right', fontWeight: 600 }}>
                    {label.toUpperCase()}
                </Typography>
                <Box sx={{ flex: 1, height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                    {!isNull && (
                        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: pct > 50 ? 'warning.main' : 'primary.main', transition: 'width 0.3s' }} />
                    )}
                </Box>
                <Typography sx={{ color: isNull ? 'text.disabled' : 'text.primary', fontSize: 'var(--text-xs)', fontFamily: 'monospace', width: 50, fontWeight: 700 }}>
                    {isNull ? 'n/a' : value.toFixed(3)}
                </Typography>
            </Box>
        );
    };

    return (
        <Box sx={{
            mb: 4, p: 2, bgcolor: 'background.paper', border: 1,
            borderColor: isSimulation ? 'warning.light' : 'divider',
            borderRadius: 1,
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield size={16} color={isSimulation ? '#d97706' : '#2563eb'} />
                    <Typography sx={{ color: 'text.primary', fontSize: 'var(--text-sm)', fontWeight: 800, letterSpacing: 1.5 }}>
                        {isSimulation ? `SIMULATION: ${scenarioId}` : 'BASELINE ANALYSIS'}
                    </Typography>
                </Box>
                {timestamp && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Clock size={12} color="#64748b" />
                        <Typography sx={{ color: 'text.secondary', fontSize: 'var(--text-xs)', fontFamily: 'monospace', fontWeight: 600 }}>
                            {timestamp}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                {runId && (
                    <Typography sx={{ color: 'text.secondary', fontSize: 'var(--text-xs)', fontFamily: 'monospace', fontWeight: 700 }}>
                        RUN: {runId.slice(0, 8)}
                    </Typography>
                )}
                {insightsMode && (
                    <Chip
                        label={insightsMode === 'skipped_fast_mode' ? 'FAST MODE' : insightsMode}
                        size="small"
                        sx={{ height: 22, fontSize: 'var(--text-xs)', fontWeight: 800, bgcolor: 'grey.100', color: 'warning.dark', letterSpacing: 0.5, px: 1 }}
                    />
                )}
            </Box>

            <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: 1.5, mb: 1 }}>
                    PATHWAY DISRUPTION
                </Typography>
                <PathwayBar label="DDR" value={pathwayScores?.ddr} />
                <PathwayBar label="TP53" value={pathwayScores?.tp53} />
                <PathwayBar label="MAPK" value={pathwayScores?.mapk} />
                <PathwayBar label="VEGF" value={pathwayScores?.vegf} />
                <PathwayBar label="PI3K" value={pathwayScores?.pi3k} />
            </Box>

            {(citationsCount === 0 || ruoReasons.length > 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1.5, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
                    <AlertTriangle size={14} color="#ed6c02" />
                    <Typography sx={{ color: 'warning.dark', fontSize: 'var(--text-sm)', fontWeight: 800 }}>
                        No citations surfaced (RUO)
                    </Typography>
                    {insightsMode === 'skipped_fast_mode' && (
                        <Typography sx={{ color: 'text.secondary', fontSize: 'var(--text-xs)', fontStyle: 'italic', ml: 1, fontWeight: 500 }}>
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

const ScenarioReceiptPanel = React.forwardRef(({ baseline, scenario, scenarioId, scenarioMeta, completeness }, ref) => {
    const navigate = useNavigate();
    if (!scenario || !scenarioId) return null;

    const t = {
        panelBg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        panelBorder: '#e2e8f0',
        panelShadow: '0 4px 24px rgba(0,0,0,0.08)',
        headerBg: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
        headerBorder: '#e2e8f0',
        headerText: '#b45309',
        labelColor: '#64748b',
        textPrimary: '#0f172a',
        textSecondary: '#334155',
        textMuted: '#64748b',
        scoreColor: '#0f172a',
        scoreMuted: '#64748b',
        ctaBg: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        ctaBorder: '#e2e8f0',
        cardBg: '#ffffff',
        cardBorder: '#e2e8f0',
        cardHoverBg: '#f1f5f9',
        cardHoverBorder: 'rgba(56, 189, 248, 0.27)',
        iconBg: '#f1f5f9',
        divider: '#e2e8f0',
        rowMutedBg: '#f8fafc',
        rowMutedBorder: '#e2e8f0',
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
                height: 20, fontSize: 'var(--text-xs)', fontWeight: 800, borderRadius: 0.5,
                bgcolor: `${tierColor(tier)}18`, color: tierColor(tier), border: `1px solid ${tierColor(tier)}33`,
                textTransform: 'uppercase', letterSpacing: 0.5, px: 0.5
            }}
        />
    );

    const CitBadge = ({ count }) => (
        count > 0 ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <BookOpen size={12} color="#a78bfa" />
                <Typography sx={{ color: '#a78bfa', fontSize: 'var(--text-xs)', fontWeight: 800, fontFamily: 'monospace' }}>
                    {count}
                </Typography>
            </Box>
        ) : null
    );

    const DeltaIcon = ({ val }) => {
        if (val > 0) return <ArrowUp size={12} color="#22c55e" />;
        if (val < 0) return <ArrowDown size={12} color="#ef4444" />;
        return <Minus size={12} color="#475569" />;
    };

    const ScoreCell = ({ value, muted }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)', color: muted ? t.scoreMuted : t.scoreColor, fontWeight: muted ? 500 : 700 }}>
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
                <FlaskConical size={16} color={t.headerText} />
                <Typography sx={{ color: t.headerText, fontSize: 'var(--text-sm)', fontWeight: 900, letterSpacing: 2 }}>
                    HYPOTHETICAL SCENARIO RECEIPT
                </Typography>
                {diff && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: 1.5 }}>
                        <BookOpen size={12} color="#a78bfa" />
                        <Typography sx={{ color: '#a78bfa', fontSize: 'var(--text-xs)', fontWeight: 800 }}>
                            {diff.totalScenarioCitations} citation{diff.totalScenarioCitations !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                )}
                <Chip label={scenarioId} size="small" sx={{ ml: 'auto', height: 22, fontSize: 'var(--text-xs)', fontWeight: 800, bgcolor: '#f59e0b22', color: '#f59e0b', borderRadius: 0.5, px: 1 }} />
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
                        <Typography sx={{ fontSize: '1.2rem', lineHeight: 1.2 }}>{icon}</Typography>
                        <Box>
                            <Typography sx={{ color: t.labelColor, fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: 1.5, mb: 0.5 }}>
                                {label}
                            </Typography>
                            <Typography sx={{ color: t.textSecondary, fontSize: 'var(--text-sm)', lineHeight: 1.6, fontWeight: 500 }}>
                                {text}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Drug Comparison Table (Engineering Agent) */}
            {diff && (diff.added.length > 0 || diff.removed.length > 0 || diff.retained.length > 0) && (
                <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${t.divider}` }}>
                    <Typography sx={{ color: t.labelColor, fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: 1.5, mb: 1.5 }}>
                        DRUG CANDIDATE COMPARISON (TOP 3)
                    </Typography>

                    {/* Removed drugs */}
                    {diff.removed.map(d => (
                        <Box key={d.name} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, py: 1, px: 1.5,
                            bgcolor: '#ef444408', borderRadius: 1, border: '1px solid #ef444415',
                        }}>
                            <ArrowDown size={14} color="#ef4444" />
                            <Typography sx={{ color: '#ef4444', fontSize: 'var(--text-sm)', fontFamily: 'monospace', textDecoration: 'line-through', minWidth: 100, fontWeight: 600 }}>
                                {d.name}
                            </Typography>
                            <ScoreCell value={d.score} muted />
                            <TierBadge tier={d.tier} />
                            <CitBadge count={d.citations} />
                            <Typography sx={{ color: '#475569', fontSize: 'var(--text-xs)', fontStyle: 'italic', ml: 'auto', fontWeight: 600 }}>dropped</Typography>
                        </Box>
                    ))}

                    {/* Added drugs */}
                    {diff.added.map(d => (
                        <Box key={d.name} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, py: 1, px: 1.5,
                            bgcolor: '#22c55e08', borderRadius: 1, border: '1px solid #22c55e15',
                        }}>
                            <ArrowUp size={14} color="#22c55e" />
                            <Typography sx={{ color: '#22c55e', fontSize: 'var(--text-sm)', fontFamily: 'monospace', fontWeight: 800, minWidth: 100 }}>
                                {d.name}
                            </Typography>
                            <ScoreCell value={d.score} />
                            <TierBadge tier={d.tier} />
                            <CitBadge count={d.citations} />
                            <Chip label="NEW" size="small" sx={{
                                ml: 'auto', height: 20, fontSize: 'var(--text-xs)', fontWeight: 900,
                                bgcolor: '#22c55e18', color: '#22c55e', borderRadius: 0.5, px: 0.8
                            }} />
                        </Box>
                    ))}

                    {/* Retained drugs */}
                    {diff.retained.map(d => (
                        <Box key={d.name} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, py: 1, px: 1.5,
                            bgcolor: t.rowMutedBg, borderRadius: 1, border: `1px solid ${t.rowMutedBorder}`,
                        }}>
                            <DeltaIcon val={d.delta} />
                            <Typography sx={{ color: t.textMuted, fontSize: 'var(--text-sm)', fontFamily: 'monospace', minWidth: 100, fontWeight: 700 }}>{d.name}</Typography>
                            <ScoreCell value={d.before} muted />
                            <ArrowRight size={12} color="#475569" />
                            <ScoreCell value={d.after} />
                            {/* Tier change indicator */}
                            {d.tierBefore !== d.tierAfter ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TierBadge tier={d.tierBefore} />
                                    <ArrowRight size={10} color="#475569" />
                                    <TierBadge tier={d.tierAfter} />
                                </Box>
                            ) : (
                                <TierBadge tier={d.tierAfter} />
                            )}
                            {/* Citation delta */}
                            {(d.citBefore > 0 || d.citAfter > 0) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                    <BookOpen size={12} color="#a78bfa" />
                                    <Typography sx={{ color: '#a78bfa', fontSize: 'var(--text-xs)', fontFamily: 'monospace', fontWeight: 700 }}>
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
                <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${t.divider}` }}>
                    <Typography sx={{ color: t.labelColor, fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: 1.5, mb: 1.5 }}>
                        PATHWAY DISRUPTION SHIFTS
                    </Typography>
                    {diff.pathDiffs.map(p => (
                        <Box key={p.key} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8, py: 0.8, px: 1.5,
                            bgcolor: t.rowMutedBg, borderRadius: 1, border: `1px solid ${t.rowMutedBorder}`,
                        }}>
                            <DeltaIcon val={(p.after ?? 0) - (p.before ?? 0)} />
                            <Typography sx={{ color: t.textMuted, fontSize: 'var(--text-xs)', fontFamily: 'monospace', width: 44, textAlign: 'right', fontWeight: 800 }}>
                                {p.key.toUpperCase()}
                            </Typography>
                            <ScoreCell value={p.before} muted />
                            <ArrowRight size={12} color="#475569" />
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
                    if (n.includes('hrd')) return { icon: <Dna size={20} color="#38bdf8" />, unlocks: 'DDR/PARP mechanism confidence, repair deficiency scoring', key: 'HRD score' };
                    if (n.includes('tmb')) return { icon: <BarChart3 size={20} color="#a78bfa" />, unlocks: 'Immunotherapy axis, mutational burden classification', key: 'TMB score' };
                    if (n.includes('rna') || n.includes('expression')) return { icon: <FlaskConical size={20} color="#22c55e" />, unlocks: 'Pathway activation map, mechanism confirmation beyond DNA', key: 'RNA expression data' };
                    if (n.includes('ca-125') || n.includes('ca125')) return { icon: <TestTube size={20} color="#f59e0b" />, unlocks: 'Treatment response kinetics, early resistance detection', key: 'CA-125 lab values' };
                    return { icon: <FileText size={20} color="#64748b" />, unlocks: 'Additional analysis depth', key: name };
                };
                return (
                    <Box sx={{
                        px: 3, py: 3, borderTop: `1px solid ${t.ctaBorder}`,
                        background: t.ctaBg,
                    }}>
                        {/* Section Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                                width: 48, height: 48, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 24px rgba(56, 189, 248, 0.25)',
                            }}>
                                <Sparkles size={24} color="#fff" />
                            </Box>
                            <Box>
                                <Typography sx={{ color: t.textPrimary, fontSize: '1.25rem', fontWeight: 900, letterSpacing: 0.3, lineHeight: 1.2 }}>
                                    What Would Confirm This?
                                </Typography>
                                <Typography sx={{ color: t.textMuted, fontSize: '0.9rem', lineHeight: 1.5, mt: 0.3, fontWeight: 500 }}>
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
                                        onClick={() => navigate(`/ayesha/tests?upload=${encodeURIComponent(meta.key)}`)}
                                    >
                                        {/* Icon */}
                                        <Box sx={{
                                            width: 48, height: 48, borderRadius: 1.5,
                                            bgcolor: t.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            {meta.icon}
                                        </Box>
                                        {/* Text */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ color: t.textPrimary, fontSize: '1rem', fontWeight: 800 }}>
                                                {test}
                                            </Typography>
                                            <Typography sx={{ color: t.textMuted, fontSize: 'var(--text-sm)', lineHeight: 1.4, mt: 0.3, fontWeight: 500 }}>
                                                Unlocks: {meta.unlocks}
                                            </Typography>
                                        </Box>
                                        {/* Upload button */}
                                        <Button
                                            size="medium"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/ayesha/tests?upload=${encodeURIComponent(meta.key)}`); }}
                                            sx={{
                                                minWidth: 'auto', px: 2.5, py: 1, borderRadius: 1.5,
                                                fontSize: '0.85rem', fontWeight: 800, textTransform: 'none',
                                                color: '#38bdf8', border: '1px solid #38bdf844',
                                                '&:hover': { bgcolor: '#38bdf818', border: '1px solid #38bdf866' },
                                            }}
                                            startIcon={<Upload size={16} />}
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
                            onClick={() => navigate('/ayesha/tests')}
                            sx={{
                                mt: 3, py: 1.5, borderRadius: 2,
                                fontSize: '1rem', fontWeight: 800, textTransform: 'none',
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
                            startIcon={<Upload size={20} />}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.50' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>
                    {activeScenario ? `Running simulation: ${activeScenario}…` : 'Loading therapy fit…'}
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

    // FE-AK-003: Read honesty field — always from L1 baseline (not simulation level)
    const honesty = levels?.L1?.efficacy?.honesty ?? null;

    const slPayload = synthetic_lethality || activeLevelData?.synthetic_lethality || null;

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
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', pb: 12 }}>

            {/* Header / Title Bar */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', py: 2 }}>
                <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 1 }}>
                            Therapy fit — weapon compatibility
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 'var(--text-xs)' }}>
                                Ayesha profile · RUO
                            </Typography>
                            {isFetching && (
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        animation: 'wcSpin 0.9s linear infinite',
                                        '@keyframes wcSpin': {
                                            from: { transform: 'rotate(0deg)' },
                                            to: { transform: 'rotate(360deg)' },
                                        },
                                    }}
                                >
                                    <RefreshCw size={14} color="#0288d1" />
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* FE-AK-003: Heuristic scoring badge in header */}
                        <HeuristicScoringBadge honesty={honesty} />
                        {activeScenario && (
                            <Chip
                                icon={<Play size={16} />}
                                label={`Simulation: ${activeScenario}`}
                                color="warning"
                                sx={{ fontWeight: 700, height: 28, fontSize: 'var(--text-xs)' }}
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
                    />
                )}

                {/* FE-AK-003: Heuristic scoring notice above primary weapon */}
                {honesty?.heuristic_sequence_used && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HeuristicScoringBadge honesty={honesty} />
                        <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.78rem' }}>
                            Drug scores are heuristic estimates — not validated predictions. Rankings are directional only.
                        </Typography>
                    </Box>
                )}

                {/* 2. Primary Weapon (Best Shot) */}
                <PrimaryWeaponCard
                    topDrug={topDrug}
                    patientContext={patient_context}
                    onInform={handleInformDoctor}
                    isSimulation={!!activeScenario}
                />

                {/* 3. Synthetic lethality (bundle payload: suggested_therapy, recommended_drugs, evidence matrix) */}
                <Box sx={{ mb: 8, maxWidth: '1200px', mx: 'auto' }}>
                    <SyntheticLethalityCard slData={slPayload} levelKey={activeLevelKey} />
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
                <Box sx={{ mt: 12, pt: 4, borderTop: 1, borderColor: 'divider' }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                                Secondary options (tier 2 and 3)
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
