/**
 * MultiMechanismPanel — Lists all active resistance classes ordered by severity.
 * Based on policy.py L472-487 RESISTANCE_CLASS_PRIORITY.
 *
 * Props:
 *   resistanceClasses — Array of {
 *     class_name, severity, signals[], description, icon?, treatment_shift?, compound_rule?
 *   }
 *
 * Empty state: shows a "no resistance detected" confirmation — not null.
 * compound_rule: shown as a caveat chip when present (e.g. LINEAGE_PLASTICITY: "requires RB1+TP53").
 */
import React from 'react';
import { Box, Typography, Paper, Chip, Alert } from '@mui/material';
import { Shield, CheckCircleOutline } from '@mui/icons-material';

const SEVERITY_COLORS = {
    critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    high: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    moderate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    low: { color: '#65a30d', bg: '#f7fee7', border: '#d9f99d' },
};

export default function MultiMechanismPanel({ resistanceClasses = [], hasError = false }) {
    // ── Error state: API failed — DO NOT show false "no resistance" ──────────
    if (resistanceClasses.length === 0 && hasError) {
        return (
            <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: '#fde68a', bgcolor: '#fffbeb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Shield sx={{ color: '#d97706', fontSize: 22 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e', fontSize: '0.92rem' }}>
                        Active Resistance Mechanisms
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.88rem' }}>
                    Unable to assess — resistance class library did not load.
                </Typography>
                <Typography variant="caption" sx={{ color: '#a16207', display: 'block', mt: 0.5 }}>
                    This does NOT mean no resistance exists. The metadata API returned an error.
                    Contingency plans below are based on standard guidelines only.
                </Typography>
            </Paper>
        );
    }

    // ── Empty state: confirmed "none detected" — API succeeded, zero matches ─
    if (resistanceClasses.length === 0) {
        return (
            <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Shield sx={{ color: '#64748b', fontSize: 22 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                        Active Resistance Mechanisms
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                    <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 20 }} />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d', fontSize: '0.88rem' }}>
                            No resistance mechanisms detected from available genomic data.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>
                            Based on somatic/germline gene panel. If resistance is suspected clinically,
                            consider repeat NGS or ctDNA to capture emerging variants.
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Shield sx={{ color: '#dc2626', fontSize: 22 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                    Active Resistance Mechanisms ({resistanceClasses.length})
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {resistanceClasses.map((rc, i) => {
                    const sev = SEVERITY_COLORS[rc.severity] || SEVERITY_COLORS.moderate;
                    return (
                        <Box key={i} sx={{
                            p: 2, borderRadius: 2,
                            bgcolor: sev.bg,
                            border: `1.5px solid ${sev.border}`,
                        }}>
                            {/* Header: icon + name + severity chip */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    {rc.icon && (
                                        <Typography component="span" sx={{ fontSize: '1.05rem', lineHeight: 1 }}>
                                            {rc.icon}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: sev.color, fontSize: '0.88rem' }}>
                                        {rc.class_name}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={rc.severity}
                                    size="small"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: '0.68rem',
                                        textTransform: 'uppercase',
                                        bgcolor: sev.color + '18',
                                        color: sev.color,
                                        height: 24,
                                        px: 1,
                                    }}
                                />
                            </Box>

                            {/* What happens description */}
                            {rc.description && (
                                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.6, mb: 1, fontWeight: 500 }}>
                                    {rc.description}
                                </Typography>
                            )}

                            {/* Treatment shift */}
                            {rc.treatment_shift && (
                                <Typography variant="caption" sx={{
                                    display: 'block', mb: 1,
                                    color: sev.color, fontWeight: 600, fontSize: '0.78rem',
                                    fontStyle: 'italic',
                                }}>
                                    → {rc.treatment_shift}
                                </Typography>
                            )}

                            {/* compound_rule caveat — surfaces LINEAGE_PLASTICITY etc. */}
                            {rc.compound_rule && (
                                <Alert severity="info" icon={false} sx={{
                                    py: 0.5, px: 1.5, mb: 1, borderRadius: 1.5,
                                    fontSize: '0.75rem',
                                    '& .MuiAlert-message': { fontSize: '0.75rem' },
                                }}>
                                    ⚠️ <strong>Note:</strong> {rc.compound_rule}
                                </Alert>
                            )}

                            {/* Triggering genes */}
                            {rc.signals?.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', mr: 0.5 }}>
                                        Triggered by:
                                    </Typography>
                                    {rc.signals.map((sig, j) => (
                                        <Chip key={j} label={sig} size="small" variant="outlined"
                                            sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24, px: 0.5 }} />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}
