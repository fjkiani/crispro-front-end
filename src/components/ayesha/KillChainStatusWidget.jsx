/**
 * KillChainStatusWidget
 *
 * Surfaces the 2-of-3 Kill Chain policy state for the current patient.
 * Consumes fields already present on the `resistanceGate` bundle prop:
 *   - resistance_risk_policy_ran           (bool)
 *   - resistance_risk_conclusion_is_default (bool)  false = 2-of-3 fired
 *   - kill_chain_state                     (string) "MONITORING" | "ALERT" | null
 *   - ca125_history                        ([{value, date}])
 *
 * RUO label is ALWAYS VISIBLE — never conditional, never hidden.
 * Lead-time footnote fixed: "Median lead-time 82d (n=5, gated [RUO])"
 *
 * Owner: Zo / CrisPRO
 * Source: kill_chain_policy.py → holistic_score_service.py
 */
import React, { useState } from 'react';
import {
    Box, Typography, Chip, Collapse, Divider, Button,
    LinearProgress,
} from '@mui/material';
import {
    Shield as ShieldIcon,
    AlertTriangle,
    Activity,
    Clock,
    ChevronDown,
    ChevronUp,
    Eye,
    Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── helpers ─────────────────────────────────────────────────────────────────
function safeArray(v) { return Array.isArray(v) ? v : []; }

function deriveState(policyRan, conclusionIsDefault, killChainState) {
    if (!policyRan) return 'awaiting';
    if (!conclusionIsDefault) return 'alert';
    return 'monitoring';
}

function stateTheme(state) {
    if (state === 'alert') return {
        bg: '#1a0505', border: '#7f1d1d', accent: '#ef4444', text: '#fca5a5',
        label: '⚠️ RESISTANCE SIGNAL DETECTED', icon: AlertTriangle, iconColor: '#ef4444',
    };
    if (state === 'monitoring') return {
        bg: '#0a1628', border: '#1e3a5f', accent: '#38bdf8', text: '#7dd3fc',
        label: 'MONITORING', icon: Activity, iconColor: '#38bdf8',
    };
    return {
        bg: '#0f172a', border: '#1e293b', accent: '#64748b', text: '#94a3b8',
        label: 'AWAITING DATA', icon: ShieldIcon, iconColor: '#64748b',
    };
}

// ─── CA-125 sparkline row ─────────────────────────────────────────────────────
function CA125Row({ history }) {
    const items = safeArray(history).slice(-5);
    if (items.length === 0) return null;
    const max = Math.max(...items.map(e => Number(e.value) || 0)) || 1;
    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mt: 1 }}>
            {items.map((e, i) => {
                const v = Number(e.value) || 0;
                const pct = Math.round((v / max) * 100);
                return (
                    <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.6rem' }}>
                            {v.toLocaleString()}
                        </Typography>
                        <Box sx={{ width: '100%', height: 32, bgcolor: '#1e293b', borderRadius: 1, display: 'flex', alignItems: 'flex-end' }}>
                            <Box sx={{
                                width: '100%',
                                height: `${pct}%`,
                                minHeight: 3,
                                bgcolor: pct > 75 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#38bdf8',
                                borderRadius: 1,
                                transition: 'height 0.4s ease',
                            }} />
                        </Box>
                        {e.date && (
                            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.55rem' }}>
                                {String(e.date).slice(5, 10)}
                            </Typography>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function KillChainStatusWidget({ resistanceGate }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const policyRan = Boolean(resistanceGate?.resistance_risk_policy_ran);
    const conclusionDefault = resistanceGate?.resistance_risk_conclusion_is_default !== false;
    const killChainState = resistanceGate?.kill_chain_state ?? null;
    const ca125History = safeArray(resistanceGate?.ca125_history);
    const n125 = ca125History.length;

    const state = deriveState(policyRan, conclusionDefault, killChainState);
    const theme = stateTheme(state);
    const Icon = theme.icon;

    return (
        <Box sx={{
            borderRadius: 3,
            border: `1px solid ${theme.border}`,
            bgcolor: theme.bg,
            p: 2.5,
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Ambient glow for alert */}
            {state === 'alert' && (
                <Box sx={{
                    position: 'absolute', inset: 0, borderRadius: 3,
                    background: 'radial-gradient(ellipse at top left, rgba(239,68,68,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
            )}

            {/* ── Header row ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, position: 'relative' }}>
                <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.border}` }}>
                    <Icon size={18} color={theme.iconColor} strokeWidth={1.75} />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" sx={{ color: theme.accent, fontWeight: 800, letterSpacing: 1.5, lineHeight: 1.2, display: 'block', fontSize: '0.65rem' }}>
                        KILL CHAIN MONITOR
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.text, fontWeight: 700 }}>
                        {theme.label}
                    </Typography>
                </Box>

                {/* RUO — always visible, never hidden */}
                <Chip
                    label="RUO"
                    size="small"
                    sx={{ bgcolor: 'rgba(100,116,139,0.2)', color: '#94a3b8', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                />

                {/* Policy state */}
                <Chip
                    label={`Policy: ${policyRan ? 'RUNNING' : 'INACTIVE'}`}
                    size="small"
                    sx={{ bgcolor: policyRan ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: policyRan ? '#4ade80' : '#64748b', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                />
            </Box>

            {/* ── Status detail row ── */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Clock size={12} color="#64748b" />
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        State: <strong style={{ color: killChainState ? theme.text : '#475569' }}>
                            {killChainState ?? '—'}
                        </strong>
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Activity size={12} color="#64748b" />
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        CA-125: <strong style={{ color: n125 > 0 ? '#7dd3fc' : '#475569' }}>
                            {n125 > 0 ? `${n125} reading${n125 > 1 ? 's' : ''} logged` : 'no data'}
                        </strong>
                    </Typography>
                </Box>
            </Box>

            {/* ── CA-125 sparkline (collapsed by default, shown if data exists) ── */}
            {n125 > 1 && (
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}>
                        CA-125 History ({n125} readings)
                    </Typography>
                    <CA125Row history={ca125History} />
                </Box>
            )}

            {/* ── Awaiting state: explicit "what's needed" ── */}
            {state === 'awaiting' && (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(100,116,139,0.08)', border: '1px solid #1e293b', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.6, display: 'block' }}>
                        Kill Chain policy requires ≥2 of:{' '}
                        <strong style={{ color: '#94a3b8' }}>CA-125 series (≥3 readings)</strong>,{' '}
                        <strong style={{ color: '#94a3b8' }}>HRD shift (≥15 points)</strong>,{' '}
                        <strong style={{ color: '#94a3b8' }}>DNA repair signal</strong>{' '}
                        <span style={{ color: '#64748b' }}>
                            (capacity drop ≥0.20 <em>or</em> DDR pathway suppressed below 40%)
                        </span>.
                        Log readings or run NGS update to activate monitoring.
                    </Typography>
                </Box>
            )}

            {/* ── Expandable provenance ── */}
            <Box
                onClick={() => setExpanded(x => !x)}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', mb: expanded ? 1 : 0, opacity: 0.7, '&:hover': { opacity: 1 } }}
            >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                    {expanded ? 'Hide' : 'View'} provenance
                </Typography>
                {expanded ? <ChevronUp size={12} color="#64748b" /> : <ChevronDown size={12} color="#64748b" />}
            </Box>
            <Collapse in={expanded}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid #1e293b', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'Roboto Mono, monospace', display: 'block', lineHeight: 1.8 }}>
                        Source: kill_chain_v0<br />
                        Policy: 2-of-3 (CA-125 + HRD + REPAIR_SHIFT)<br />
                        policy_ran: {String(policyRan)}<br />
                        conclusion_is_default: {String(conclusionDefault)}<br />
                        kill_chain_state: {killChainState ?? 'null'}<br />
                        ca125_readings: {n125}
                    </Typography>
                </Box>
            </Collapse>

            <Divider sx={{ borderColor: '#1e293b', mb: 1.5 }} />

            {/* ── Actions ── */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    size="small"
                    startIcon={<Plus size={13} />}
                    onClick={() => navigate('/ayesha/tests')}
                    sx={{
                        textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
                        bgcolor: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                        border: '1px solid rgba(99,102,241,0.3)',
                        '&:hover': { bgcolor: 'rgba(99,102,241,0.25)' },
                    }}
                >
                    Add HRD reading
                </Button>
                <Button
                    size="small"
                    startIcon={<Eye size={13} />}
                    onClick={() => setExpanded(x => !x)}
                    sx={{
                        textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
                        color: '#64748b', border: '1px solid #1e293b',
                        '&:hover': { borderColor: '#94a3b8', color: '#94a3b8' },
                    }}
                >
                    View provenance
                </Button>
            </Box>

            {/* ── RUO footer disclaimer — always present ── */}
            <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.62rem', lineHeight: 1.5, display: 'block' }}>
                    ⚠️ Research Use Only — not clinical guidance.
                    Based on biomarker signals only.
                    Median lead-time 82d (n=5, gated analysis, RUO gated ≤365d pre-recurrence).
                </Typography>
            </Box>
        </Box>
    );
}
