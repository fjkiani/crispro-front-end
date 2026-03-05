/**
 * SLConfirmationsCard — Synthetic Lethality gating confirmations panel
 *
 * Only renders when synthetic lethality is detected (slDetected).
 * Shows the highest-yield next steps to confirm SL confidence.
 *
 * Props:
 *   sl           — synthetic_lethality bundle payload
 *   slDetected   — boolean
 *   onUpload(target: string) → void — called when an upload CTA is clicked
 */
import React from 'react';
import {
    Card, CardContent, Typography, Chip, Button, Box, Stack,
} from '@mui/material';
import { safeArray } from './testsUnlocksUtils';

const SL_CONFIRMATIONS = [
    {
        label: 'Confirm MBD4 is truly inactivated in the tumor',
        detail: 'Tumor NGS clarifies via copy number + VAF context.',
    },
    {
        label: 'Zygosity / LOH / second hit',
        detail: 'Biallelic loss matters for repair genes; tumor NGS (± matched normal) establishes this.',
    },
    {
        label: 'HRD testing',
        detail: 'If HRD is high, PARP-axis plausibility becomes much more defensible.',
    },
    {
        label: 'Genomic instability / mutational-signature support',
        detail: 'Repair-defect signatures + overall TMB help distinguish passenger LoF vs real repair impairment.',
    },
    {
        label: 'Functional evidence (research setting)',
        detail: 'RAD51 foci / replication-stress markers, or ex vivo sensitivity assays.',
    },
];

export default function SLConfirmationsCard({ sl, slDetected, onUpload }) {
    if (!slDetected) return null;

    const slReceiptsOk = String(sl?.provenance?.status || 'unknown') === 'ok';
    const slGating = sl?.gating || {};
    const parpRequires = safeArray(slGating?.parp_axis?.requires);

    return (
        <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
                        Synthetic Lethality (RUO) — highest-yield confirmations
                    </Typography>
                    <Chip
                        size="small"
                        variant="outlined"
                        label={`Receipts: ${slReceiptsOk ? 'OK' : String(sl?.provenance?.status || 'unknown')}`}
                    />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    These are the main "confidence gates" for interpreting axis-level opportunities (especially PARP/DDR).
                </Typography>

                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {SL_CONFIRMATIONS.map(({ label, detail }) => (
                        <li key={label}>
                            <Typography variant="body2">
                                <strong>{label}</strong> — {detail}
                            </Typography>
                        </li>
                    ))}
                </Box>

                {parpRequires.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                            PARP-axis gating requirements (verbatim from backend)
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
                            {parpRequires.map((r) => (
                                <li key={String(r)}>
                                    <Typography variant="body2">{String(r)}</Typography>
                                </li>
                            ))}
                        </Box>
                    </Box>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                    <Button variant="outlined" onClick={() => onUpload?.('Tumor NGS')}>
                        Upload Tumor NGS
                    </Button>
                    <Button variant="outlined" onClick={() => onUpload?.('HRD score')}>
                        Upload HRD score
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
