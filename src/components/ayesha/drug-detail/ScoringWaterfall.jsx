/**
 * ScoringWaterfall — Shows how the holistic score is computed.
 *
 * Weights (source of truth: holistic_score_service.py):
 *   Mechanism fit:  40%   |   Eligibility: 30%
 *   PGx Safety:     15%   |   Resistance Risk: 15% (RUO)
 *
 * Renders in light-mode card with actual values from the drug object where available.
 */
import React from 'react';
import {
    Box, Typography, Paper, LinearProgress, Chip, Divider,
} from '@mui/material';
import { pct } from './explainers';

const WEIGHTS = [
    {
        key: 'mechanism', label: 'Mechanism Fit', pct: 40,
        source: 'pathway_model_v2', color: '#818cf8', ruo: false,
        desc: 'How well the drug\'s mechanism aligns with mutated pathways in the patient\'s tumor.',
        getActual: (drug) => drug?.mechanism_fit_score,
    },
    {
        key: 'eligibility', label: 'Eligibility', pct: 30,
        source: 'eligibility_engine', color: '#34d399', ruo: false,
        desc: 'Whether the patient meets the clinical criteria (age, prior treatment, organ function) for this drug.',
        getActual: (drug) => drug?.eligibility_score,
    },
    {
        key: 'pgx', label: 'PGx Safety', pct: 15,
        source: 'pgx_service', color: '#fbbf24', ruo: false,
        desc: 'Pharmacogenomic safety — risk of adverse drug reactions based on the patient\'s metabolism profile.',
        getActual: (drug) => drug?.pgx_score,
    },
    {
        key: 'resistance', label: 'Resistance Risk', pct: 15,
        source: 'kill_chain_policy', color: '#f87171', ruo: true,
        desc: 'Evaluates whether the tumor\'s resistance mechanisms could neutralize this drug.',
        getActual: (drug) => drug?.resistance_score,
    },
];

export default function ScoringWaterfall({ drug }) {
    const finalScore = drug?.final_score || drug?.efficacy_score;

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
                    📊 Scoring Breakdown
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5, fontSize: '1rem', lineHeight: 1.7 }}>
                The holistic match score is a weighted combination of four independent engines.
                Each contributes a percentage-weighted portion to the final score.
            </Typography>

            <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                {WEIGHTS.map((w, i) => {
                    const actual = w.getActual(drug);
                    return (
                        <Box key={w.key} sx={{ p: 2, borderBottom: i < WEIGHTS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                            {/* Label row */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: w.color }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {w.label}
                                    </Typography>
                                    {w.ruo && (
                                        <Chip label="RUO" size="small" sx={{
                                            height: 16, fontSize: '0.55rem', fontWeight: 800,
                                            bgcolor: '#fef2f2', color: '#991b1b',
                                        }} />
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {actual != null && (
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: w.color }}>
                                            Actual: {(actual * 100).toFixed(0)}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: w.color, fontFamily: 'monospace', minWidth: 40, textAlign: 'right' }}>
                                        {w.pct}%
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Progress bar */}
                            <LinearProgress
                                variant="determinate"
                                value={w.pct * 2.5}
                                sx={{
                                    height: 6, borderRadius: 3, bgcolor: '#f1f5f9',
                                    '& .MuiLinearProgress-bar': { bgcolor: w.color, borderRadius: 3 },
                                }}
                            />

                            {/* Description */}
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                {w.desc}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.6rem' }}>
                                Source: {w.source}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Final score */}
            {finalScore != null && (
                <Box sx={{
                    mt: 2, p: 2, borderRadius: 2, bgcolor: '#f0f4ff',
                    border: '1px solid #bfdbfe', textAlign: 'center',
                }}>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700 }}>
                        Final Holistic Score
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#2563eb' }}>
                        {pct(finalScore)}
                    </Typography>
                </Box>
            )}

            {/* RUO footer */}
            <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #fcd34d' }}>
                <Typography variant="caption" sx={{ color: '#92400e', lineHeight: 1.5 }}>
                    ⚠️ <strong>Research Use Only</strong> — These scores support exploratory analysis only.
                    Resistance risk is computed but not clinically validated.
                </Typography>
            </Box>
        </Paper>
    );
}
