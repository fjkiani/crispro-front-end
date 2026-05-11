/**
 * IOHarmPreventionPanel — Immunotherapy Harm Prevention Gate
 * ==========================================================
 * Explains to the patient WHY IO is or isn't recommended,
 * showing the risk-benefit decision, biomarker drivers,
 * checkpoint expression, and safety gating.
 *
 * Three layers of harm prevention:
 * 1. Predictor (can IO work?) — 3-biomarker model
 * 2. Risk-Benefit Gate (is it worth the risk?) — RULE_OUT / INDETERMINATE / JUSTIFIED
 * 3. Conservative Gating (structural safety net) — no IO boost without TMB-H/MSI-H
 *
 * Props:
 *   riskBenefitDecision - { decision, p_resp, p_resp_source, p_resp_semantics, p_resp_note,
 *                           spe_gate_status, regimen, rationale, provenance, ... }
 *   biomarkerDrivers    - { cd8b_foxp3, monocytes, endothelial } with value/percentile/direction
 *   checkpointExpression - { PDCD1, CD274, CTLA4, LAG3, TIGIT, HAVCR2 } with value/target_drug
 *   ioProfileCard        - Overall IO profile card data
 *   safetyGate           - { active, tmb, msi_status, boost }
 *
 * FE-AK-002 (2026-05-10):
 *   - Added AWAITING_DATA to DECISION_STYLES (was silently falling through to INDETERMINATE)
 *   - Guarded p_resp chip against null/undefined → shows "N/A" instead of "NaN%"
 *   - Surfaces p_resp_semantics as a labelled note below the decision banner
 * FE-AK-004 (2026-05-10):
 *   - Reads spe_gate_status; renders LOCKED_NO_EXPRESSION notice when active
 *
 * Research Use Only — Not for Clinical Decision Making
 */
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    LinearProgress,
    Collapse,
    IconButton,
    Tooltip,
    Divider,
    Alert,
    Grid,
} from '@mui/material';
import {
    Shield,
    Warning,
    ExpandMore,
    ExpandLess,
    Science,
    Biotech,
    HealthAndSafety,
    Info,
    HourglassEmpty,
    Lock,
} from '@mui/icons-material';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const DECISION_STYLES = {
    RULE_OUT: {
        bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: '#fca5a5',
        fg: '#991b1b',
        chipBg: '#dc2626',
        chipFg: '#fff',
        icon: '🛑',
        label: 'Recommend Against IO',
        subtitle: 'The predicted response probability is below the threshold for this regimen.',
    },
    INDETERMINATE: {
        bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '#fcd34d',
        fg: '#92400e',
        chipBg: '#d97706',
        chipFg: '#fff',
        icon: '⚠️',
        label: 'Consider Other Factors',
        subtitle: 'The response probability is in the uncertain zone — additional clinical context needed.',
    },
    JUSTIFIED: {
        bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '#86efac',
        fg: '#166534',
        chipBg: '#16a34a',
        chipFg: '#fff',
        icon: '✅',
        label: 'IO Justified',
        subtitle: 'Predicted probability of response exceeds the threshold for this regimen.',
    },
    // FE-AK-002: AWAITING_DATA was previously missing — fell through to INDETERMINATE silently.
    // Now has its own distinct style so the user understands data is not yet available.
    AWAITING_DATA: {
        bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '#cbd5e1',
        fg: '#475569',
        chipBg: '#64748b',
        chipFg: '#fff',
        icon: '⏳',
        label: 'Awaiting Data',
        subtitle: 'Response probability cannot be computed — required biomarker data has not been submitted.',
    },
};

// FE-AK-002: Human-readable labels for p_resp_semantics values
const P_RESP_SEMANTICS_LABELS = {
    PREDICTED: 'Model-predicted probability',
    IMPUTED: 'Imputed from partial data',
    PRIOR_ONLY: 'Population prior (no patient data)',
    AWAITING_DATA: 'Not computed — data pending',
};

const DIRECTION_COLORS = {
    favorable: { bg: '#dcfce7', fg: '#166534', label: 'Favorable' },
    unfavorable: { bg: '#fef2f2', fg: '#991b1b', label: 'Unfavorable' },
    neutral: { bg: '#f1f5f9', fg: '#475569', label: 'Neutral' },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function DecisionBanner({ decision, p_resp, p_resp_semantics, p_resp_note, regimen, rationale }) {
    const style = DECISION_STYLES[decision] || DECISION_STYLES.INDETERMINATE;

    // FE-AK-002: Guard p_resp against null/undefined → show "N/A" instead of "NaN%"
    const pRespDisplay = (p_resp != null && !isNaN(p_resp))
        ? `p(response) = ${(p_resp * 100).toFixed(0)}%`
        : 'p(response) = N/A';

    // FE-AK-002: Human-readable semantics label
    const semanticsLabel = p_resp_semantics
        ? (P_RESP_SEMANTICS_LABELS[p_resp_semantics] || p_resp_semantics)
        : null;

    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            background: style.bg,
            border: `2px solid ${style.border}`,
            position: 'relative',
            overflow: 'hidden',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                    width: 48, height: 48, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem',
                    bgcolor: 'rgba(255,255,255,0.7)',
                    border: `2px solid ${style.border}`,
                }}>
                    {style.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: style.fg, lineHeight: 1.2 }}>
                        {style.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: style.fg, opacity: 0.8, mt: 0.3 }}>
                        {style.subtitle}
                    </Typography>
                </Box>
                {/* FE-AK-002: Null-safe p_resp chip */}
                <Chip
                    label={pRespDisplay}
                    sx={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        bgcolor: style.chipBg,
                        color: style.chipFg,
                        px: 1,
                        height: 36,
                    }}
                />
            </Box>

            {regimen && (
                <Box sx={{
                    display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5,
                }}>
                    <Chip
                        icon={<Science sx={{ fontSize: 16 }} />}
                        label={regimen}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderColor: style.fg, color: style.fg }}
                    />
                </Box>
            )}

            <Typography variant="body2" sx={{
                color: style.fg,
                bgcolor: 'rgba(255,255,255,0.5)',
                p: 1.5,
                borderRadius: 2,
                fontSize: '0.85rem',
                lineHeight: 1.6,
            }}>
                {rationale}
            </Typography>

            {/* FE-AK-002: p_resp_semantics note */}
            {semanticsLabel && (
                <Box sx={{
                    mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.8,
                    p: 1, borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.6)',
                    border: `1px solid ${style.border}`,
                }}>
                    <Info sx={{ fontSize: 15, color: style.fg, opacity: 0.7, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: style.fg, fontWeight: 600, fontSize: '0.75rem' }}>
                        Score basis: {semanticsLabel}
                        {p_resp_note && ` — ${p_resp_note}`}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}

// FE-AK-004: SPE Gate Status notice
function SpeGateStatusNotice({ spe_gate_status }) {
    if (!spe_gate_status || spe_gate_status === 'EVALUATED') return null;

    const isLocked = spe_gate_status === 'LOCKED_NO_EXPRESSION';

    return (
        <Paper sx={{
            p: 2, borderRadius: 2.5,
            border: `1.5px solid ${isLocked ? '#fcd34d' : '#bfdbfe'}`,
            bgcolor: isLocked ? '#fffbeb' : '#eff6ff',
            display: 'flex', alignItems: 'flex-start', gap: 1.5,
        }}>
            {isLocked
                ? <Lock sx={{ color: '#d97706', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                : <Info sx={{ color: '#3b82f6', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
            }
            <Box>
                <Typography variant="subtitle2" sx={{
                    fontWeight: 800,
                    color: isLocked ? '#92400e' : '#1e40af',
                    fontSize: '0.88rem',
                    mb: 0.3,
                }}>
                    SPE Gate: {spe_gate_status.replace(/_/g, ' ')}
                </Typography>
                {isLocked && (
                    <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        The structural pharmacology engine could not evaluate IO response probability
                        because RNA expression data is missing. Submit expression profiling to unlock
                        a patient-specific prediction.
                    </Typography>
                )}
            </Box>
            <Chip
                label={isLocked ? 'Locked' : spe_gate_status}
                size="small"
                sx={{
                    ml: 'auto', flexShrink: 0,
                    fontWeight: 700,
                    bgcolor: isLocked ? '#fef3c7' : '#dbeafe',
                    color: isLocked ? '#92400e' : '#1e40af',
                }}
            />
        </Paper>
    );
}

function BiomarkerDriverCard({ name, label, value, percentile, direction, biology }) {
    const dirStyle = DIRECTION_COLORS[direction] || DIRECTION_COLORS.neutral;

    return (
        <Paper sx={{
            p: 2,
            borderRadius: 2.5,
            border: `1.5px solid ${dirStyle.fg}22`,
            bgcolor: dirStyle.bg,
            flex: 1,
            minWidth: 200,
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {label}
                </Typography>
                <Chip
                    label={dirStyle.label}
                    size="small"
                    sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: dirStyle.fg + '18',
                        color: dirStyle.fg,
                        border: `1px solid ${dirStyle.fg}40`,
                    }}
                />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: dirStyle.fg, mb: 0.5 }}>
                {typeof value === 'number' ? value.toFixed(2) : value ?? 'N/A'}
            </Typography>
            <LinearProgress
                variant="determinate"
                value={Math.min((percentile || 0), 100)}
                sx={{
                    height: 6, borderRadius: 3,
                    bgcolor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': { bgcolor: dirStyle.fg, borderRadius: 3 },
                }}
            />
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                Percentile: {percentile != null ? `${Math.round(percentile)}th` : 'N/A'}
            </Typography>
            {biology && (
                <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block', lineHeight: 1.4 }}>
                    {biology}
                </Typography>
            )}
        </Paper>
    );
}

function CheckpointBar({ gene, value, maxValue, targetDrug }) {
    const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
            <Typography variant="body2" sx={{
                fontWeight: 800, minWidth: 70, color: '#0f172a', fontSize: '0.85rem',
            }}>
                {gene}
            </Typography>
            <Box sx={{ flex: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                        height: 10, borderRadius: 5,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: pct > 60
                                ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                                : pct > 30
                                    ? 'linear-gradient(90deg, #60a5fa, #93c5fd)'
                                    : '#cbd5e1',
                        },
                    }}
                />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', minWidth: 40, textAlign: 'right', fontWeight: 600 }}>
                {typeof value === 'number' ? value.toFixed(0) : value}
            </Typography>
            <Chip
                label={targetDrug}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.68rem', fontWeight: 600, borderColor: '#94a3b8', color: '#475569' }}
            />
        </Box>
    );
}

// ============================================================================
// IRAEL TABLE — Harm Education
// ============================================================================
const IRAE_DATA = [
    { organ: 'Lungs', condition: 'Pneumonitis', frequency: '5–10%', severity: 'Can be fatal', emoji: '🫁' },
    { organ: 'Heart', condition: 'Myocarditis', frequency: '1–2%', severity: '~50% mortality', emoji: '❤️' },
    { organ: 'Liver', condition: 'Hepatitis', frequency: '5–15%', severity: 'Requires steroids', emoji: '🟤' },
    { organ: 'Colon', condition: 'Colitis', frequency: '10–20%', severity: 'Hospitalization', emoji: '🩺' },
    { organ: 'Thyroid', condition: 'Thyroiditis', frequency: '10–20%', severity: 'Lifelong meds', emoji: '🦋' },
];

function IrAEEducationSection() {
    const [expanded, setExpanded] = useState(false);

    return (
        <Paper sx={{
            p: 2.5, borderRadius: 2.5,
            border: '1.5px solid #e2e8f0',
            bgcolor: '#fafbfc',
        }}>
            <Box
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HealthAndSafety sx={{ color: '#dc2626', fontSize: 22 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                        Understanding IO Side Effects (irAEs)
                    </Typography>
                </Box>
                <IconButton size="small">
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>

            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.82rem' }}>
                Immunotherapy can cause the immune system to attack healthy organs.
                These are called immune-related Adverse Events (irAEs).
            </Typography>

            <Collapse in={expanded}>
                <Box sx={{ mt: 2 }}>
                    {IRAE_DATA.map((row) => (
                        <Box key={row.organ} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            py: 1, borderBottom: '1px solid #f1f5f9',
                        }}>
                            <Typography sx={{ fontSize: '1.1rem', minWidth: 28 }}>{row.emoji}</Typography>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                                    {row.organ}: {row.condition}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    Frequency: {row.frequency}
                                </Typography>
                            </Box>
                            <Chip
                                label={row.severity}
                                size="small"
                                sx={{
                                    fontWeight: 600, fontSize: '0.68rem',
                                    bgcolor: row.severity.includes('fatal') || row.severity.includes('mortality')
                                        ? '#fee2e2' : '#fef3c7',
                                    color: row.severity.includes('fatal') || row.severity.includes('mortality')
                                        ? '#991b1b' : '#92400e',
                                }}
                            />
                        </Box>
                    ))}
                    <Alert severity="info" sx={{ mt: 2, fontSize: '0.8rem' }}>
                        In ovarian cancer, only ~10–15% of patients respond to IO monotherapy.
                        That means 85–90% experience side effects without benefit.
                        This panel helps identify patients most likely to benefit.
                    </Alert>
                </Box>
            </Collapse>
        </Paper>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function IOHarmPreventionPanel({
    riskBenefitDecision,
    biomarkerDrivers,
    checkpointExpression,
    ioProfileCard,
    safetyGate,
    suppressFooterDisclaimer = false,
}) {
    const [showCheckpoints, setShowCheckpoints] = useState(false);

    // Guard: nothing to show if no decision data
    if (!riskBenefitDecision && !biomarkerDrivers) {
        return (
            <Paper sx={{
                p: 3, borderRadius: 3,
                border: '1.5px dashed #d1d5db',
                bgcolor: '#fafafa',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Shield sx={{ color: '#94a3b8', fontSize: 24 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#94a3b8' }}>
                        Immunotherapy Harm Prevention
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Response predictor data not yet available. Submit RNA expression profiling
                    to generate IO risk-benefit assessment.
                </Typography>
            </Paper>
        );
    }

    const checkpoints = checkpointExpression ? Object.entries(checkpointExpression) : [];
    const maxCheckpointValue = checkpoints.length > 0
        ? Math.max(...checkpoints.map(([, v]) => v?.value || 0)) : 100;

    const biomarkers = biomarkerDrivers ? [
        {
            name: 'cd8b_foxp3', label: 'CD8B / FOXP3',
            biology: 'Killer T cells vs regulatory T cells. High = immune attack active.',
            ...biomarkerDrivers.cd8b_foxp3,
        },
        {
            name: 'monocytes', label: 'Monocytes',
            biology: 'Myeloid immune suppression. Low = less suppression, better for IO.',
            ...biomarkerDrivers.monocytes,
        },
        {
            name: 'endothelial', label: 'Endothelial',
            biology: 'Vasculature for immune cell access to tumor. High = better access.',
            ...biomarkerDrivers.endothelial,
        },
    ] : [];

    // FE-AK-004: Extract spe_gate_status from riskBenefitDecision
    const speGateStatus = riskBenefitDecision?.spe_gate_status ?? null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* === HEADER === */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Shield sx={{ color: '#1e40af', fontSize: 28 }} />
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                        Immunotherapy Harm Prevention
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Three layers protecting against unnecessary IO toxicity
                    </Typography>
                </Box>
            </Box>

            {/* FE-AK-004: SPE Gate Status notice (shown before decision banner when locked) */}
            <SpeGateStatusNotice spe_gate_status={speGateStatus} />

            {/* === LAYER 1: DECISION BANNER === */}
            {riskBenefitDecision && (
                <DecisionBanner
                    decision={riskBenefitDecision.decision}
                    p_resp={riskBenefitDecision.p_resp}
                    p_resp_semantics={riskBenefitDecision.p_resp_semantics}
                    p_resp_note={riskBenefitDecision.p_resp_note}
                    regimen={riskBenefitDecision.regimen_name || riskBenefitDecision.regimen}
                    rationale={riskBenefitDecision.rationale}
                />
            )}

            {/* === LAYER 2: WHY THIS DECISION (Biomarker Drivers) === */}
            {biomarkers.length > 0 && (
                <Box>
                    <Typography variant="overline" sx={{
                        letterSpacing: 2, fontWeight: 800, color: '#64748b', mb: 1.5, display: 'block',
                    }}>
                        WHY THIS DECISION — BIOMARKER DRIVERS
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {biomarkers.map((bm) => (
                            <BiomarkerDriverCard key={bm.name} {...bm} />
                        ))}
                    </Box>
                </Box>
            )}

            {/* === CHECKPOINT EXPRESSION (Which IO Drug?) === */}
            {checkpoints.length > 0 && (
                <Paper sx={{
                    p: 2.5, borderRadius: 2.5,
                    border: '1.5px solid #e2e8f0',
                    bgcolor: '#fafbfc',
                }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        onClick={() => setShowCheckpoints(!showCheckpoints)}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Biotech sx={{ color: '#7c3aed', fontSize: 22 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                                Checkpoint Expression — Which IO Drug?
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                label="Mechanistic Signal Only"
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.68rem', fontWeight: 600, borderColor: '#94a3b8', color: '#64748b' }}
                            />
                            <IconButton size="small">
                                {showCheckpoints ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                    </Box>

                    <Collapse in={showCheckpoints}>
                        <Box sx={{ mt: 2 }}>
                            {checkpoints.map(([gene, data]) => (
                                <CheckpointBar
                                    key={gene}
                                    gene={gene}
                                    value={data?.value || 0}
                                    maxValue={maxCheckpointValue}
                                    targetDrug={data?.target_drug || 'Unknown'}
                                />
                            ))}
                            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.78rem' }}>
                                Checkpoint expression shows which immune brakes are most active.
                                Higher expression suggests that drug target may be more engaged.
                                <strong> No trained predictor exists for individual IO drugs in ovarian cancer.</strong>
                            </Alert>
                        </Box>
                    </Collapse>
                </Paper>
            )}

            {/* === LAYER 3: SAFETY GATE STATUS === */}
            {safetyGate && (
                <Paper sx={{
                    p: 2, borderRadius: 2.5,
                    border: '1.5px solid #bfdbfe',
                    bgcolor: '#eff6ff',
                    display: 'flex', alignItems: 'center', gap: 2,
                }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '50%',
                        bgcolor: safetyGate.active ? '#16a34a' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Shield sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', fontSize: '0.88rem' }}>
                            IO Safety Gate: {safetyGate.active ? 'ACTIVE' : 'INACTIVE'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#3b82f6', fontSize: '0.82rem' }}>
                            {safetyGate.active
                                ? 'No IO efficacy boost applied without genomic evidence (TMB-H ≥20 or MSI-H).'
                                : `IO boost active: ${safetyGate.boost}x (${safetyGate.tmb ? `TMB=${safetyGate.tmb}` : ''} ${safetyGate.msi_status || ''})`
                            }
                        </Typography>
                    </Box>
                    <Chip
                        label={safetyGate.active ? 'Protected' : 'Boosted'}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: safetyGate.active ? '#dcfce7' : '#fef3c7',
                            color: safetyGate.active ? '#166534' : '#92400e',
                        }}
                    />
                </Paper>
            )}

            {/* === irAE EDUCATION === */}
            <IrAEEducationSection />

            {!suppressFooterDisclaimer && (
                <Box sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1,
                    p: 2, borderRadius: 2,
                    bgcolor: '#fffbeb',
                    border: '1px solid #fde68a',
                }}>
                    <Warning sx={{ fontSize: 18, color: '#f59e0b', mt: 0.2, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.75rem', lineHeight: 1.5 }}>
                        <strong>Research Use Only.</strong> Internally evaluated on 29 HGSOC patients from one
                        clinical trial (NeoPembrOV). Not a validated clinical predictor. The risk-benefit
                        assessment is a policy framework, not a diagnostic. All treatment decisions must be
                        made by the oncologist in consultation with the patient.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
