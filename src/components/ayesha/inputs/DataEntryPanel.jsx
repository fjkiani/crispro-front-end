/**
 * DataEntryPanel — Container orchestrating all patient data entry
 *
 * Sections (each a separate card, not a monolith):
 *   1. CA-125 History (entry + history list)
 *   2. HRD Score entry
 *   3. TMB / Somatic context (read-only from profile + "needs NGS" prompt)
 *
 * All data is stored in localStorage under canonical keys:
 *   ayesha_ca125_history_v1  → [{value, date, cycle?, note?}]
 *   ayesha_hrd_v1            → {hrd_score, hrd_status, assay, lab, date}
 *
 * The analyze hook reads these on every call.
 *
 * Props:
 *   profile  — patient profile object (for current values + context)
 *   missing  — string[] of missing fields from completeness
 */
import React, { useState, useCallback } from 'react';
import {
    Box, Typography, Card, CardContent, Stack, Chip, Divider, Collapse, Button,
} from '@mui/material';
import { FlaskConical, Dna, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

import CA125EntryForm from './CA125EntryForm';
import CA125HistoryList from './CA125HistoryList';
import HRDEntryForm from './HRDEntryForm';
import RSSEntryForm from './RSSEntryForm';

// ─── localStorage helpers ─────────────────────────────────────────────────────
const CA125_KEY = 'ayesha_ca125_history_v1';
const HRD_KEY = 'ayesha_hrd_v1';
export const RSS_KEY = 'ayesha_rss_inputs_v1';

export function loadRSSInputs() {
    try { return JSON.parse(localStorage.getItem(RSS_KEY) || 'null'); }
    catch { return null; }
}

export function loadCA125History() {
    try {
        const raw = localStorage.getItem(CA125_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}

export function saveCA125History(history) {
    const sorted = [...history].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    localStorage.setItem(CA125_KEY, JSON.stringify(sorted));
}

export function loadHRD() {
    try { return JSON.parse(localStorage.getItem(HRD_KEY) || 'null'); }
    catch { return null; }
}

export function saveHRD(entry) {
    localStorage.setItem(HRD_KEY, JSON.stringify(entry));
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconColor, title, badge, badgeColor, children, defaultOpen = false, unlocks, done }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Card sx={{ bgcolor: '#0f172a', border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : '#1e293b'}`, borderRadius: 3 }}>
            <CardContent sx={{ pb: open ? 2 : '12px !important' }}>
                {/* Header */}
                <Box
                    onClick={() => setOpen(x => !x)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', userSelect: 'none' }}
                >
                    <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid #1e293b' }}>
                        <Icon size={16} color={iconColor} strokeWidth={1.75} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
                                {title}
                            </Typography>
                            {done
                                ? <CheckCircle2 size={14} color="#4ade80" />
                                : <AlertCircle size={14} color="#f59e0b" />
                            }
                            {badge && (
                                <Chip label={badge} size="small" sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: badgeColor || 'rgba(100,116,139,0.15)', color: '#94a3b8' }} />
                            )}
                        </Stack>
                        {unlocks && (
                            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.62rem' }}>
                                Unlocks: {unlocks}
                            </Typography>
                        )}
                    </Box>
                    {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </Box>

                {/* Body */}
                <Collapse in={open}>
                    <Divider sx={{ borderColor: '#1e293b', my: 1.5 }} />
                    {children}
                </Collapse>
            </CardContent>
        </Card>
    );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function DataEntryPanel({ profile, missing = [] }) {
    // CA-125 state
    const [ca125History, setCA125History] = useState(() => loadCA125History());

    const handleCA125Save = useCallback((entry) => {
        const next = [...ca125History, entry];
        saveCA125History(next);
        setCA125History(loadCA125History()); // re-sort from storage
    }, [ca125History]);

    const handleCA125Delete = useCallback((idx) => {
        const next = ca125History.filter((_, i) => i !== idx);
        saveCA125History(next);
        setCA125History(loadCA125History());
    }, [ca125History]);

    // HRD state
    const [hrd, setHRD] = useState(() => loadHRD());

    const handleHRDSave = useCallback((entry) => {
        saveHRD(entry);
        setHRD(entry);
    }, []);

    const ca125Done = ca125History.length >= 3;
    const hrdDone = hrd?.hrd_score != null;

    // RSS state — load from localStorage (RSSEntryForm also writes to the same key)
    const [rssInputs, setRSSInputs] = useState(() => loadRSSInputs());
    const [rsResult, setRSResult] = useState(null); // local RS classification

    const handleRSSChange = useCallback((payload) => {
        setRSSInputs(payload);
        // Compute local classification for badge
        if (!payload) { setRSResult(null); return; }
        // Determine RS-High locally (mirrors RSSService logic)
        const cn = parseFloat(payload.ccne1_copy_number);
        const triggers = [
            (!isNaN(cn) && cn > 4),
            payload.rb1_loss, payload.cdkn2a_deleted, payload.cdkn2b_deleted,
            payload.myc_amplified, payload.mycl1_amplified,
            payload.kras_amplified, payload.erbb2_amplified, payload.nf1_loss,
        ].filter(Boolean);
        setRSResult(triggers.length > 0 ? 'RS-High' : 'RS-Low');
    }, []);

    const rssDone = rssInputs != null;

    return (
        <Stack gap={2}>
            {/* ── Section 1: CA-125 History ── */}
            <SectionCard
                icon={FlaskConical}
                iconColor="#38bdf8"
                title="CA-125 Serial Readings"
                badge={ca125History.length > 0 ? `${ca125History.length} readings` : 'No readings'}
                badgeColor={ca125Done ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)'}
                unlocks="Kill Chain monitor + on-therapy kinetics (L3)"
                done={ca125Done}
                defaultOpen={!ca125Done}
            >
                <CA125EntryForm onSave={handleCA125Save} />
                {ca125History.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.58rem' }}>
                            History ({ca125History.length} readings)
                        </Typography>
                        <CA125HistoryList history={ca125History} onDelete={handleCA125Delete} />
                    </Box>
                )}
            </SectionCard>

            {/* ── Section 2: HRD Score ── */}
            <SectionCard
                icon={Dna}
                iconColor="#818cf8"
                title="HRD Score"
                badge={hrd ? `Score: ${hrd.hrd_score} (${hrd.hrd_status || '?'})` : 'Not entered'}
                badgeColor={hrdDone ? 'rgba(99,102,241,0.15)' : 'rgba(251,191,36,0.1)'}
                unlocks="DDR/PARP mechanism axis (L2)"
                done={hrdDone}
                defaultOpen={!hrdDone}
            >
                <HRDEntryForm
                    onSave={handleHRDSave}
                    currentValue={profile?.tumor_context?.hrd_score ?? hrd?.hrd_score}
                />
                {hrd && (
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.15)', border: '1px solid #1e293b' }}>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.58rem' }}>
                            On Record
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            <Chip label={`Score: ${hrd.hrd_score}`} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 700 }} />
                            {hrd.hrd_status && <Chip label={`HRD-${hrd.hrd_status}`} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 700 }} />}
                            {hrd.assay && <Chip label={hrd.assay} size="small" sx={{ color: '#64748b' }} />}
                            {hrd.date && <Chip label={hrd.date} size="small" sx={{ color: '#64748b' }} />}
                        </Stack>
                    </Box>
                )}
            </SectionCard>

            {/* ── Section 3: RS (Replication Stress) Inputs ── */}
            <SectionCard
                icon={Dna}
                iconColor="#f59e0b"
                title="Replication Stress (RS) — NGS Alterations"
                badge={rssDone
                    ? (rsResult || 'Entered')
                    : 'Not entered'
                }
                badgeColor={rssDone
                    ? (rsResult === 'RS-High' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)')
                    : 'rgba(251,191,36,0.1)'
                }
                unlocks="ATR inhibitor ranking (berzosertib, elimusertib) — PMID 34552099"
                done={rssDone}
                defaultOpen={!rssDone}
            >
                <RSSEntryForm onChange={handleRSSChange} />
            </SectionCard>

            {/* ── Section 3: NGS / Somatic (prompt only — no manual entry, too complex) ── */}
            <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>NGS / Somatic Mutations</Typography>
                        {missing.some(m => m.includes('somatic') || m.includes('mutation') || m.includes('ngs'))
                            ? <AlertCircle size={14} color="#f59e0b" />
                            : <CheckCircle2 size={14} color="#4ade80" />
                        }
                        <Chip label="Unlocks L2" size="small" sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.15)', color: '#818cf8' }} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.7 }}>
                        Somatic mutations require a structured JSON upload (HGVS + coordinates).
                        Use <strong style={{ color: '#94a3b8' }}>Upload from NGS report</strong> below — paste or upload your CGP/tumor NGS report JSON.
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1.5, textTransform: 'none', borderColor: '#334155', color: '#94a3b8', '&:hover': { borderColor: '#64748b' } }}
                        onClick={() => {/* TODO: open NGS upload modal */ }}
                    >
                        Upload NGS report (coming soon)
                    </Button>
                </CardContent>
            </Card>
        </Stack>
    );
}
