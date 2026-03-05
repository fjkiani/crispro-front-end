/**
 * ScoringBreakdown — Expandable weight table for drug holistic score
 *
 * Weights are static (source of truth: holistic_score_service.py):
 *   Mechanism fit:  40%
 *   Eligibility:    30%
 *   PGx Safety:     15%
 *   Resistance Risk: 15%  ← RUO badge inline
 *
 * RUO banner always at bottom.
 */
import React, { useState } from 'react';
import {
    Box, Typography, Collapse, Divider, LinearProgress, Chip
} from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';

const WEIGHTS = [
    { label: 'Mechanism fit', pct: 40, source: 'pathway_model_v2', color: '#818cf8', ruo: false },
    { label: 'Eligibility', pct: 30, source: 'eligibility_engine', color: '#34d399', ruo: false },
    { label: 'PGx Safety', pct: 15, source: 'pgx_service', color: '#fbbf24', ruo: false },
    { label: 'Resistance Risk', pct: 15, source: 'kill_chain_policy', color: '#f87171', ruo: true },
];

export default function ScoringBreakdown({ drug }) {
    const [open, setOpen] = useState(false);

    return (
        <Box sx={{ mt: 1 }}>
            <Box
                onClick={() => setOpen(x => !x)}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
                    opacity: 0.75, '&:hover': { opacity: 1 }, userSelect: 'none',
                }}
            >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                    Scoring breakdown
                </Typography>
                {open ? <ChevronUp size={12} color="#64748b" /> : <ChevronDown size={12} color="#64748b" />}
            </Box>

            <Collapse in={open}>
                <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b' }}>
                    {WEIGHTS.map((w) => (
                        <Box key={w.label} sx={{ mb: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                                        {w.label}
                                    </Typography>
                                    {w.ruo && (
                                        <Chip
                                            label="RUO"
                                            size="small"
                                            sx={{ height: 14, fontSize: '0.55rem', bgcolor: 'rgba(248,113,113,0.15)', color: '#f87171', fontWeight: 700 }}
                                        />
                                    )}
                                </Box>
                                <Typography variant="caption" sx={{ color: w.color, fontWeight: 800, fontFamily: 'Roboto Mono, monospace' }}>
                                    {w.pct}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={w.pct * 2.5} // scale to 100 (40% → 100bar)
                                sx={{
                                    height: 4, borderRadius: 2, bgcolor: '#1e293b',
                                    '& .MuiLinearProgress-bar': { bgcolor: w.color },
                                }}
                            />
                            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.6rem' }}>
                                source: {w.source}
                            </Typography>
                        </Box>
                    ))}

                    <Divider sx={{ borderColor: '#1e293b', my: 1 }} />

                    {/* Actual component values from drug object if available */}
                    {(drug?.mechanism_fit_score != null || drug?.eligibility_score != null) && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.58rem' }}>
                                Actual values (this drug)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {drug.mechanism_fit_score != null && (
                                    <Typography variant="caption" sx={{ color: '#818cf8' }}>
                                        Mechanism: {(drug.mechanism_fit_score * 100).toFixed(0)}
                                    </Typography>
                                )}
                                {drug.eligibility_score != null && (
                                    <Typography variant="caption" sx={{ color: '#34d399' }}>
                                        Eligibility: {(drug.eligibility_score * 100).toFixed(0)}
                                    </Typography>
                                )}
                                {drug.holistic_score != null && (
                                    <Typography variant="caption" sx={{ color: '#fbbf24' }}>
                                        Holistic: {(drug.holistic_score * 100).toFixed(0)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* RUO banner — always at bottom */}
                    <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(100,116,139,0.08)', border: '1px solid #1e293b', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.6rem', lineHeight: 1.5 }}>
                            ⚠️ Research Use Only — these scores support exploratory analysis only.
                            Not validated for clinical decision-making.
                        </Typography>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
}
