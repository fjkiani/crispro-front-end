/**
 * GeneBox — Single gene indicator in the coverage grid
 *
 * Shows gene name with ✓/–/!/? indicator based on coverage status.
 * Color-coded: green (negative/clear), red (abnormal), amber (VUS), grey (untested).
 *
 * Source: ENGINE_LIGHT_DASHBOARD.mdc §7 Layer 3
 */
import React from 'react';
import { Box, Typography, Tooltip, Divider } from '@mui/material';
import { GENE_COVERAGE_MAP } from '../../../../constants/signalStateEngine';

export default function GeneBox({ gene, coverage }) {
    const isAbnormal = coverage?.covered && coverage.classification !== 'negative' && coverage.classification !== 'VUS';
    const isNegative = coverage?.covered && coverage.classification === 'negative';
    const isCovered = coverage?.covered;

    let bgColor = '#f1f5f9';
    let borderColor = '#cbd5e1';
    let textColor = 'var(--text-muted)';
    let indicator = '–';

    if (isAbnormal) {
        bgColor = '#fef2f2';
        borderColor = '#fecaca';
        textColor = '#dc2626';
        indicator = '!';
    } else if (isNegative) {
        bgColor = '#f0fdf4';
        borderColor = '#bbf7d0';
        textColor = '#15803d';
        indicator = '✓';
    } else if (isCovered) {
        bgColor = '#fffbeb';
        borderColor = '#fde68a';
        textColor = '#b45309';
        indicator = '?';
    }

    const gcm = GENE_COVERAGE_MAP[gene];

    return (
        <Tooltip
            arrow
            title={
                <Box sx={{ p: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 'var(--text-sm)' }}>{gene}</Typography>
                    <Typography sx={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.8)' }}>
                        Class: {gcm?.group || 'Unknown'}
                    </Typography>
                    <Typography sx={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.8)' }}>
                        Axis: {gcm?.axis?.toUpperCase() || '—'}
                    </Typography>
                    <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.2)' }} />
                    <Typography sx={{ fontSize: 'var(--text-xs)' }}>
                        {isCovered
                            ? `${coverage.source}: ${coverage.result || coverage.classification}`
                            : 'Not tested'
                        }
                    </Typography>
                </Box>
            }
        >
            <Box sx={{
                px: 1.25, py: 0.75,
                borderRadius: 1.5,
                bgcolor: bgColor,
                border: `1.5px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', gap: 0.75,
                cursor: 'default',
                '&:hover': { transform: 'scale(1.05)' },
                transition: 'transform 0.15s ease',
                minWidth: 76,
            }}>
                <Typography sx={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: textColor }}>
                    {gene}
                </Typography>
                <Typography sx={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: textColor, ml: 'auto' }}>
                    {indicator}
                </Typography>
            </Box>
        </Tooltip>
    );
}
