/**
 * PFIReversionCurve — PFI-based reversion probability visualization.
 * Based on models.py L147-154 PFI_REVERSION_CURVE.
 *
 * ⚠️ CRITICAL CAVEAT (models.py L141-145):
 *   "NOT EMPIRICAL — literature-informed estimates."
 *   "ARIEL2 dataset has only 5 confirmed reversion patients with PFI data."
 *   "These values are ESTIMATES, not computed from data."
 *
 * This component MUST display the RUO disclaimer prominently.
 *
 * Props:
 *   pfiMonths — Current patient's platinum-free interval in months
 */
import React from 'react';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import { ShowChart, Warning, Info } from '@mui/icons-material';

// FROM models.py L147-154 PFI_REVERSION_CURVE
const PFI_REVERSION_CURVE = [
    { range: '0-6', label: '0–6 months', probability: 0.15, color: '#16a34a' },
    { range: '6-12', label: '6–12 months', probability: 0.25, color: '#65a30d' },
    { range: '12-18', label: '12–18 months', probability: 0.35, color: '#d97706' },
    { range: '18-24', label: '18–24 months', probability: 0.45, color: '#ea580c' },
    { range: '24+', label: '24+ months', probability: 0.55, color: '#dc2626' },
];

function getPatientBand(pfiMonths) {
    if (pfiMonths == null) return null;
    if (pfiMonths <= 6) return PFI_REVERSION_CURVE[0];
    if (pfiMonths <= 12) return PFI_REVERSION_CURVE[1];
    if (pfiMonths <= 18) return PFI_REVERSION_CURVE[2];
    if (pfiMonths <= 24) return PFI_REVERSION_CURVE[3];
    return PFI_REVERSION_CURVE[4];
}

export default function PFIReversionCurve({ pfiMonths = null }) {
    const patientBand = getPatientBand(pfiMonths);

    return (
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
            {/* ⚠️ MANDATORY RUO DISCLAIMER — cannot be removed */}
            <Box sx={{
                p: 2, mb: 2, borderRadius: 2,
                bgcolor: '#fef2f2',
                border: '1.5px solid #fecaca',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Warning sx={{ fontSize: 18, color: '#dc2626', mt: 0.15 }} />
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#991b1b', fontSize: '0.75rem', display: 'block' }}>
                            ⚠️ NOT EMPIRICAL — RESEARCH USE ONLY
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7f1d1d', fontSize: '0.72rem', lineHeight: 1.4, display: 'block' }}>
                            Based on N=5 confirmed reversion patients from ARIEL2 (Lin KK 2019, PMID: 30425037).
                            These are literature-informed ESTIMATES, not computed from empirical data.
                            Subject to significant revision with future data.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShowChart sx={{ color: '#0f172a', fontSize: 22 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    PFI → Reversion Probability (Estimated)
                </Typography>
            </Box>

            {/* Bar chart */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {PFI_REVERSION_CURVE.map((band) => {
                    const isActive = patientBand?.range === band.range;
                    return (
                        <Box key={band.range} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            p: 1, borderRadius: 1.5,
                            bgcolor: isActive ? band.color + '12' : 'transparent',
                            border: isActive ? `2px solid ${band.color}` : '2px solid transparent',
                        }}>
                            <Typography variant="caption" sx={{
                                fontWeight: isActive ? 800 : 600,
                                color: isActive ? band.color : '#64748b',
                                fontSize: '0.72rem',
                                minWidth: 80,
                            }}>
                                {band.label}
                            </Typography>
                            <Box sx={{ flex: 1, height: 16, bgcolor: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                                <Box sx={{
                                    width: `${band.probability * 100}%`,
                                    height: '100%',
                                    bgcolor: band.color,
                                    borderRadius: 2,
                                    transition: 'width 0.6s ease',
                                }} />
                            </Box>
                            <Typography variant="caption" sx={{
                                fontWeight: isActive ? 800 : 600,
                                color: isActive ? band.color : '#94a3b8',
                                fontSize: '0.72rem',
                                minWidth: 35,
                                textAlign: 'right',
                            }}>
                                {Math.round(band.probability * 100)}%
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Patient context */}
            {pfiMonths != null && patientBand && (
                <>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info sx={{ fontSize: 16, color: '#2563eb' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#334155' }}>
                            Patient PFI: <strong>{pfiMonths} months</strong> → Estimated reversion probability: <strong>{Math.round(patientBand.probability * 100)}%</strong>
                        </Typography>
                    </Box>
                </>
            )}

            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#94a3b8', fontSize: '0.68rem', textAlign: 'center' }}>
                Source: ARIEL2 (PMID: 30425037) + clinical literature. N=5 confirmed reversions. NOT validated.
            </Typography>
        </Paper>
    );
}
