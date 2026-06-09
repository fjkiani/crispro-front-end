/**
 * KillChainStatusWidget
 *
 * Surfaces the 2-of-3 Kill Chain policy state for the current patient.
 * Consumes fields already present on the `resistanceGate` bundle prop:
 *   - resistance_risk_policy_ran           (bool)
 *   - resistance_risk_conclusion_is_default (bool)  false = 2-of-3 fired
 *   - kill_chain_state                     (string) "MONITORING" | "ALERT" | null
 *   - ca125_history                        ([{value, date}])
 *   - policy_description                   (string, optional — from API)
 *   - lead_time_stats                      (string, optional — from API)
 *   - provenance.engine_used               (string, optional — from API)
 *
 * RUO label is ALWAYS VISIBLE — never conditional, never hidden.
 * Hardcoded thresholds/lead-time are labeled as such when API doesn't provide them.
 *
 * Owner: Zo / CrisPRO
 * Source: kill_chain_policy.py → holistic_score_service.py
 */
import React, { useState } from 'react';
import {
    Box, Typography, Chip, Collapse, Divider, Button,
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
import SourceSlug from './shared/SourceSlug';

// ─── helpers ─────────────────────────────────────────────────────────────────
function safeArray(v) { return Array.isArray(v) ? v : []; }

function deriveState(policyRan, conclusionIsDefault, killChainState) {
    if (!policyRan) return 'awaiting';
    if (!conclusionIsDefault) return 'alert';
    return 'monitoring';
}

function stateTheme(state) {
    if (state === 'alert') return {
        bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', text: '#991b1b',
        label: '⚠️ RESISTANCE SIGNAL DETECTED', icon: AlertTriangle, iconColor: '#dc2626',
    };
    if (state === 'monitoring') return {
        bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', text: '#1e40af',
        label: 'MONITORING', icon: Activity, iconColor: '#2563eb',
    };
    return {
        bg: '#f8fafc', border: '#e2e8f0', accent: '#64748b', text: '#475569',
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
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
                            {v.toLocaleString()}
                        </Typography>
                        <Box sx={{ width: '100%', height: 32, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'flex-end' }}>
                            <Box sx={{
                                width: '100%',
                                height: `${pct}%`,
                                minHeight: 3,
                                bgcolor: pct > 75 ? 'error.main' : pct > 50 ? 'warning.main' : 'info.main',
                                borderRadius: 1,
                                transition: 'height 0.4s ease',
                            }} />
                        </Box>
                        {e.date && (
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.55rem' }}>
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

    // B1: Use API policy description if available, otherwise label as hardcoded
    const policyDescription = resistanceGate?.policy_description || null;
    const hasApiPolicy = Boolean(policyDescription);

    // B2: Use API engine name if available
    const engineUsed = resistanceGate?.provenance?.engine_used || null;

    // B3: Use API lead-time stats if available
    const leadTimeStats = resistanceGate?.lead_time_stats || null;

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
                <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'action.selected', border: `1px solid`, borderColor: theme.border }}>
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
                    sx={{ bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                />

                {/* Policy state */}
                <Chip
                    label={`Policy: ${policyRan ? 'RUNNING' : 'INACTIVE'}`}
                    size="small"
                    sx={{
                        bgcolor: policyRan ? 'success.light' : 'action.hover',
                        color: policyRan ? 'success.dark' : 'text.secondary',
                        fontWeight: 700, fontSize: '0.6rem', height: 18,
                    }}
                />
            </Box>

            {/* ── Status detail row ── */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Clock size={12} color="#64748b" />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        State: <strong style={{ color: killChainState ? theme.text : undefined }}>
                            {killChainState ?? '—'}
                        </strong>
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Activity size={12} color="#64748b" />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        CA-125: <strong style={{ color: n125 > 0 ? theme.accent : undefined }}>
                            {n125 > 0 ? `${n125} reading${n125 > 1 ? 's' : ''} logged` : 'no data'}
                        </strong>
                    </Typography>
                </Box>
            </Box>

            {/* ── CA-125 sparkline (collapsed by default, shown if data exists) ── */}
            {n125 > 1 && (
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}>
                        CA-125 History ({n125} readings)
                    </Typography>
                    <CA125Row history={ca125History} />
                </Box>
            )}

            {/* ── Awaiting state: what's needed ── */}
            {state === 'awaiting' && (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                    {hasApiPolicy ? (
                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6, display: 'block' }}>
                            {policyDescription}
                        </Typography>
                    ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6, display: 'block' }}>
                            Insufficient data to activate resistance monitoring. Log CA-125 readings or run NGS update to activate.
                        </Typography>
                    )}
                    <SourceSlug
                        source={hasApiPolicy ? 'resistance_gate.policy_description' : 'kill_chain_policy (hardcoded thresholds)'}
                        compact
                    />
                </Box>
            )}

            {/* ── Expandable provenance ── */}
            <Box
                onClick={() => setExpanded(x => !x)}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', mb: expanded ? 1 : 0,
                    color: 'text.secondary', opacity: 0.85, '&:hover': { opacity: 1 },
                }}
            >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {expanded ? 'Hide' : 'View'} provenance
                </Typography>
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </Box>
            <Collapse in={expanded}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'Roboto Mono, monospace', display: 'block', lineHeight: 1.8 }}>
                        Source: {engineUsed || 'kill_chain_policy (local)'}<br />
                        Policy: {hasApiPolicy ? policyDescription : 'awaiting backend resistance_gate.policy_description (PR-B2)'}<br />
                        policy_ran: {String(policyRan)}<br />
                        conclusion_is_default: {String(conclusionDefault)}<br />
                        kill_chain_state: {killChainState ?? 'null'}<br />
                        ca125_readings: {n125}
                    </Typography>
                </Box>
            </Collapse>

            <Divider sx={{ mb: 1.5 }} />

            {/* ── Actions ── */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<Plus size={13} />}
                    onClick={() => navigate('/ayesha/tests')}
                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                >
                    Add HRD reading
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Eye size={13} />}
                    onClick={() => setExpanded(x => !x)}
                    sx={{
                        textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
                        color: 'text.secondary', borderColor: 'divider',
                        '&:hover': { borderColor: 'text.secondary' },
                    }}
                >
                    View provenance
                </Button>
            </Box>

            {/* ── RUO footer disclaimer — always present ── */}
            <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', lineHeight: 1.5, display: 'block' }}>
                    ⚠️ Research Use Only — not clinical guidance.
                    Based on biomarker signals only.
                    {leadTimeStats ? (
                        ` ${leadTimeStats}`
                    ) : (
                        ' Lead-time estimate not available from current data.'
                    )}
                </Typography>
                {!leadTimeStats && (
                    <SourceSlug source="kill_chain_policy (hardcoded lead-time removed)" compact />
                )}
            </Box>
        </Box>
    );
}
