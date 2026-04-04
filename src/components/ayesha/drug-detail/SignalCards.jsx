/**
 * SignalCards — Patient-friendly signal cards.
 *
 * Three expandable cards renamed to plain language:
 *   "Tumor DNA Match" | "Cancer Pathway Alignment" | "Published Research"
 *
 * Each card answers a question, shows a large strength pill,
 * and has explanations DEFAULT-EXPANDED. Technical details behind a toggle.
 */
import React, { useState } from 'react';
import {
    Box, Typography, Paper, Chip, Tooltip, Collapse, IconButton, Stack,
} from '@mui/material';
import { Info, ExpandMore, ExpandLess } from '@mui/icons-material';
import {
    SIGNAL_META,
    explainSequenceSignal,
    explainPathwaySignal,
    explainEvidenceSignal,
    signalStrengthColor,
    pct,
} from './explainers';

// ── Strength Pill ────────────────────────────────────────────────────────────

function StrengthPill({ strength }) {
    const safeStrength = typeof strength === 'number' ? strength.toString() : (strength || 'neutral');
    const label = String(safeStrength).toUpperCase();
    const colors = signalStrengthColor(safeStrength);
    return (
        <Chip
            label={label}
            sx={{
                fontWeight: 800, fontSize: '0.75rem', height: 28, px: 1,
                bgcolor: colors.bg, color: colors.fg,
                border: '1.5px solid', borderColor: colors.border,
            }}
        />
    );
}

// ── Single Signal Card ───────────────────────────────────────────────────────

function SignalCard({ signalKey, explained }) {
    const [showTechnical, setShowTechnical] = useState(false);
    const meta = SIGNAL_META[signalKey];
    const colors = signalStrengthColor(explained?.strength || explained?.level || 'neutral');

    if (!explained) return null;

    const strength = explained.strength || explained.level || 'neutral';

    return (
        <Paper sx={{
            p: 0, borderRadius: 3, overflow: 'hidden',
            border: '2px solid', borderColor: colors.border,
            transition: 'all 0.2s',
            opacity: strength === 'neutral' ? 0.85 : 1,
            '&:hover': { boxShadow: `0 4px 20px ${colors.border}44`, transform: 'translateY(-2px)', opacity: 1 },
        }}>
            {/* Header */}
            <Box sx={{
                p: 2.5, bgcolor: colors.bg,
                borderBottom: '1px solid', borderColor: colors.border,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>{meta.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: colors.fg }}>
                            {meta.title}
                        </Typography>
                    </Box>
                    <StrengthPill strength={strength} />
                </Box>
                <Typography variant="body1" sx={{ color: colors.fg, fontStyle: 'italic', fontWeight: 500, fontSize: '0.95rem' }}>
                    {meta.question}
                </Typography>
            </Box>

            {/* Explanation (default expanded) */}
            <Box sx={{ p: 2.5, pt: strength === 'neutral' ? 1.5 : 2.5 }}>
                {strength === 'neutral' && (
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1, mb: 1.5,
                        p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1',
                    }}>
                        <Info sx={{ fontSize: 16, color: '#94a3b8' }} />
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                            Needs more biomarker data to assess this signal
                        </Typography>
                    </Box>
                )}
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {explained.sentences.map((s, i) => (
                        <Typography component="li" key={i} variant="body2" sx={{
                            color: 'text.secondary', mb: 0.75,
                            lineHeight: 1.65, fontSize: '0.9rem',
                            '&::marker': { color: colors.fg },
                        }}>
                            {s}
                        </Typography>
                    ))}
                </Box>

                {/* Technical Details Toggle */}
                {(explained.value != null || explained.pct != null || explained.breakdown || explained.citationsCount != null) && (
                    <Box sx={{ mt: 2 }}>
                        <Box
                            onClick={() => setShowTechnical(x => !x)}
                            sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                cursor: 'pointer', color: 'text.secondary',
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Technical Details
                            </Typography>
                            {showTechnical ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
                        </Box>

                        <Collapse in={showTechnical}>
                            <Box sx={{
                                mt: 1.5, p: 2, borderRadius: 2, bgcolor: '#f8fafc',
                                border: '1px solid', borderColor: 'divider',
                                display: 'flex', gap: 3, flexWrap: 'wrap',
                            }}>
                                {/* Sequence metrics */}
                                {explained.value != null && (
                                    <MetricPill label="Raw Value" value={explained.value} />
                                )}
                                {explained.pct != null && (
                                    <MetricPill label="Percentile" value={`${explained.pct}th`} />
                                )}
                                {explained.top != null && (
                                    <MetricPill label="Top" value={`${explained.top}%`} />
                                )}

                                {/* Pathway breakdown */}
                                {explained.breakdown && typeof explained.breakdown === 'object' && (
                                    Object.entries(explained.breakdown).map(([k, v]) => (
                                        <MetricPill key={k} label={k.replace(/_/g, '/')} value={v > 0 ? pct(v) : '—'} muted={v === 0} />
                                    ))
                                )}

                                {/* Evidence metrics */}
                                {explained.citationsCount != null && (
                                    <MetricPill label="Citations" value={explained.citationsCount} />
                                )}
                                {signalKey === 'evidence' && explained.strength != null && (
                                    <MetricPill label="Strength" value={`${explained.strength} / 5`} />
                                )}
                            </Box>
                        </Collapse>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

// ── Metric Pill ──────────────────────────────────────────────────────────────

function MetricPill({ label, value, muted }) {
    return (
        <Box sx={{ textAlign: 'center', opacity: muted ? 0.4 : 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Chip
                label={value}
                size="small"
                sx={{
                    fontWeight: 800, fontSize: '0.8rem', height: 26,
                    bgcolor: muted ? '#f1f5f9' : '#e0e7ff', color: muted ? '#94a3b8' : '#3730a3',
                }}
            />
        </Box>
    );
}

function normalizeRationale(rationale) {
    if (Array.isArray(rationale)) {
        return rationale.reduce((acc, item) => {
            if (item && typeof item === 'object' && item.type) {
                acc[item.type] = item;
            }
            return acc;
        }, {});
    }

    return (rationale && typeof rationale === 'object') ? rationale : {};
}

// ── Container ────────────────────────────────────────────────────────────────

export default function SignalCards({ rationale, drug }) {
    if (!rationale) return null;

    const normalizedRationale = normalizeRationale(rationale);
    const seq = normalizedRationale.sequence || {};
    const path = normalizedRationale.pathway || {};
    const evi = normalizedRationale.evidence || {};
    const manifestCitations = Array.isArray(drug?.evidence_manifest?.citations)
        ? drug.evidence_manifest.citations.length
        : 0;

    const seqExplained = explainSequenceSignal(seq.value, seq.percentile);
    const pathExplained = explainPathwaySignal(path.percentile, {
        [path.primary_pathway || 'alignment']: path.percentile,
        ...(path.breakdown || {}),
    });
    const eviExplained = explainEvidenceSignal(
        evi.strength,
        evi.citations_count ?? drug?.citations_count ?? manifestCitations,
        drug?.meets_evidence_gate
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
                    Why This Drug Is a Fit
                </Typography>
                <Tooltip title="Three independent analyses determine how well this drug matches your tumor profile. Each answers a different question about fit." arrow>
                    <Info sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5, fontSize: '1rem' }}>
                We look at three independent signals to determine how well this drug matches your tumor.
            </Typography>

            <Stack spacing={2.5} sx={{ width: '100%' }}>
                <SignalCard signalKey="sequence" explained={seqExplained} />
                <SignalCard signalKey="pathway" explained={pathExplained} />
                <SignalCard signalKey="evidence" explained={eviExplained} />
            </Stack>
        </Box>
    );
}
