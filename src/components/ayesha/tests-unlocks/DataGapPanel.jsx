/**
 * DataGapPanel — "What we have" vs "What's missing" two-column panel
 *
 * Props:
 *   mutations         — array of mutation objects from inputs_used
 *   tumorContext (tc) — tumor context fields from inputs_used
 *   missing           — string[] of missing field names from completeness
 */
import React from 'react';
import {
    Card, CardContent, Typography, Chip, Grid, Stack, Divider, Box,
} from '@mui/material';
import { safeArray } from './testsUnlocksUtils';

const CAPABILITY_MAP = [
    { field: 'HRD', capability: 'Unlocks DDR/PARP mechanism and improves therapy fit stability.' },
    { field: 'CGP/TMB', capability: 'Unlocks IO axis and enables real sequence scoring instead of heuristics.' },
    { field: 'RNA-seq', capability: 'Unlocks pathway activation (mechanism map) beyond DNA-only signals.' },
    { field: 'Serial CA-125', capability: 'Unlocks early resistance detection (kinetics).' },
];

export default function DataGapPanel({ mutations = [], tumorContext: tc = {}, missing = [] }) {
    return (
        <Grid container spacing={2}>
            {/* What we have */}
            <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                            What we have (inputs used)
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mt: 2, mb: 1 }}>
                            Genomics / variants
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {mutations.length ? (
                                mutations.map((m, idx) => {
                                    const gene = m?.gene || 'GENE';
                                    const hgvs = m?.hgvs_p || m?.hgvs_c || '—';
                                    const cls = m?.classification || null;
                                    return (
                                        <Chip
                                            key={`${gene}-${idx}`}
                                            label={`${gene} ${hgvs}${cls ? ` · ${cls}` : ''}`}
                                            sx={{ fontWeight: 800 }}
                                        />
                                    );
                                })
                            ) : (
                                <Typography color="text.secondary">No variants provided.</Typography>
                            )}
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                            Tumor context (available)
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {tc?.msi_status && <Chip label={`MSI: ${tc.msi_status}`} sx={{ fontWeight: 800 }} />}
                            {tc?.pd_l1_cps != null && <Chip label={`PD‑L1 CPS: ${tc.pd_l1_cps}`} sx={{ fontWeight: 800 }} />}
                            {tc?.pd_l1_status && <Chip label={`PD‑L1: ${tc.pd_l1_status}`} sx={{ fontWeight: 800 }} />}
                            {tc?.er_status && <Chip label={`ER: ${tc.er_status}${typeof tc?.er_percent === 'number' ? ` (${tc.er_percent}%)` : ''}`} sx={{ fontWeight: 800 }} />}
                            {tc?.ca125_value != null && <Chip label={`CA‑125: ${tc.ca125_value} ${tc?.ca125_units || 'U/mL'}`} sx={{ fontWeight: 800 }} />}
                            {!tc?.msi_status && tc?.pd_l1_cps == null && !tc?.er_status && tc?.ca125_value == null && (
                                <Typography color="text.secondary">No tumor-context fields available.</Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>

            {/* What's missing */}
            <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                            What's missing (bottlenecks)
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            These cap confidence and block mechanism/resistance depth.
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {missing.length ? (
                                missing.map((m, idx) => (
                                    <Chip key={`${m}-${idx}`} label={String(m)} color="warning" variant="outlined" sx={{ fontWeight: 800 }} />
                                ))
                            ) : (
                                <Typography color="text.secondary">No missing fields reported.</Typography>
                            )}
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                            Why these matter
                        </Typography>
                        <Box component="ul" sx={{ mt: 0, mb: 0, pl: 2, color: '#334155' }}>
                            {CAPABILITY_MAP.map(({ field, capability }) => (
                                <li key={field}>
                                    <Typography variant="body2">
                                        <strong>{field}</strong> — {capability}
                                    </Typography>
                                </li>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
