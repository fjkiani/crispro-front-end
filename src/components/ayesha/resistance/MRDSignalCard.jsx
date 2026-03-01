/**
 * MRDSignalCard
 *
 * Renders ctDNA MRD signal from the simulate endpoint's `mrd` field.
 * Follows the MRD_CONTRACT.md rules:
 *   - Renders NOTHING when mrd.detected === false (invisible)
 *   - Conditionally shows fields based on data_modality (panel_proxy vs sWGS)
 *   - Never renders a field that is null/absent
 *   - Shows provenance toggle (assay label)
 *
 * Props:
 *   mrd — simulationResult.mrd from /api/ayesha/resistance/simulate
 */
import React from 'react';
import { Box, Typography, Chip, Divider, Tooltip } from '@mui/material';
import {
    Biotech as BiotechIcon,
    Science as ScienceIcon,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
} from '@mui/icons-material';

const TIER_CONFIG = {
    HIGH: { color: '#c62828', bgColor: '#2d1515', label: 'HIGH RISK' },
    INTERMEDIATE: { color: '#f57c00', bgColor: '#2d1e0f', label: 'INTERMEDIATE' },
    LOW: { color: '#2e7d32', bgColor: '#0f2d1a', label: 'LOW' },
};

const TREND_ICON = {
    rising: <TrendingUp sx={{ fontSize: 14, color: '#c62828' }} />,
    stable: <TrendingFlat sx={{ fontSize: 14, color: '#f57c00' }} />,
    declining: <TrendingDown sx={{ fontSize: 14, color: '#2e7d32' }} />,
};

const StatRow = ({ label, value, unit, tooltip }) => {
    if (value === null || value === undefined) return null;
    const content = (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
            <Typography variant="caption" sx={{ color: '#718096' }}>{label}</Typography>
            <Typography variant="caption" sx={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>
                {typeof value === 'number' ? value.toFixed(value < 1 ? 4 : 2) : value}
                {unit && <span style={{ color: '#4a5568', marginLeft: 4 }}>{unit}</span>}
            </Typography>
        </Box>
    );
    return tooltip ? <Tooltip title={tooltip} arrow placement="left">{content}</Tooltip> : content;
};

const CNVChip = ({ event }) => (
    <Chip
        label={`${event.cytoband} ${event.copy_state === 'amplification' ? '↑AMP' : '↓DEL'}`}
        size="small"
        variant="outlined"
        sx={{
            fontSize: '0.6rem',
            height: 20,
            mr: 0.5,
            mb: 0.5,
            borderColor: event.copy_state === 'amplification' ? '#c6282850' : '#1565c050',
            color: event.copy_state === 'amplification' ? '#ef9a9a' : '#90caf9',
        }}
    />
);

const MRDSignalCard = ({ mrd }) => {
    // Contract rule: render nothing if not detected
    if (!mrd || mrd.detected !== true) return null;

    const record = mrd.mrd_record;
    if (!record) return null;

    const tier = mrd.tier || 'LOW';
    const config = TIER_CONFIG[tier] || TIER_CONFIG.LOW;
    const isSwgs = record.data_modality === 'sWGS';

    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant="overline"
                sx={{ color: '#4a5568', letterSpacing: 2, fontSize: '0.65rem', display: 'block', mb: 1 }}
            >
                🧬 ctDNA Minimal Residual Disease
            </Typography>

            <Box
                sx={{
                    bgcolor: '#111820',
                    border: `1px solid ${config.color}30`,
                    borderRadius: 1,
                    overflow: 'hidden',
                }}
            >
                {/* Header bar */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 1,
                        bgcolor: config.bgColor,
                        borderBottom: `1px solid ${config.color}20`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isSwgs ? <ScienceIcon sx={{ fontSize: 16, color: '#4fd1c5' }} /> : <BiotechIcon sx={{ fontSize: 16, color: '#4fd1c5' }} />}
                        <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 700 }}>
                            {record.provenance_label || (isSwgs ? 'sWGS MRD (TF/PF/CNV)' : 'Panel ctDNA Proxy (VAF)')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={config.label}
                            size="small"
                            sx={{
                                fontSize: '0.6rem',
                                height: 20,
                                fontWeight: 700,
                                bgcolor: `${config.color}20`,
                                color: config.color,
                                border: `1px solid ${config.color}50`,
                            }}
                        />
                        {record.actionability && (
                            <Chip
                                label={record.actionability.replace('_', ' ')}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.55rem',
                                    height: 18,
                                    color: '#4a5568',
                                    borderColor: '#2d3748',
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Body */}
                <Box sx={{ px: 1.5, py: 1 }}>
                    {/* Panel Proxy fields */}
                    {!isSwgs && (
                        <>
                            <StatRow label="VAF (proxy)" value={record.panel_proxy_value} tooltip="Variant allele frequency — NOT sWGS tumor fraction" />
                            <StatRow label="Variants" value={record.variant_count} />
                            {record.trend && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                                    <Typography variant="caption" sx={{ color: '#718096' }}>Trend</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {TREND_ICON[record.trend] || null}
                                        <Typography variant="caption" sx={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>
                                            {record.trend}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </>
                    )}

                    {/* sWGS fields */}
                    {isSwgs && (
                        <>
                            <StatRow label="Tumor Fraction" value={record.tumor_fraction_pct} unit="%" tooltip="ichorCNA-derived from sWGS" />
                            <StatRow label="Proportion Fragments (PF)" value={record.proportion_fragments} tooltip="Short (100-150bp) / mononucleosomal (100-220bp)" />
                            <StatRow label="MRD Group" value={record.MRD_group !== null && record.MRD_group !== undefined ? `Group ${record.MRD_group}` : null} />

                            {/* CNV Events */}
                            {record.CNV_events && record.CNV_events.length > 0 && (
                                <>
                                    <Divider sx={{ my: 0.75, borderColor: '#2d3748' }} />
                                    <Typography variant="caption" sx={{ color: '#718096', display: 'block', mb: 0.5 }}>
                                        CNV Events
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {record.CNV_events.map((ev, i) => (
                                            <Tooltip key={i} title={ev.genes?.join(', ') || 'No gene annotation'} arrow>
                                                <span><CNVChip event={ev} /></span>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </>
                            )}
                        </>
                    )}

                    {/* Timepoint */}
                    {record.timepoint && (
                        <>
                            <Divider sx={{ my: 0.75, borderColor: '#2d3748' }} />
                            <StatRow label="Timepoint" value={record.timepoint} tooltip="B1=post-surgery pre-chemo (highest leverage)" />
                        </>
                    )}
                </Box>

                {/* Provenance footer */}
                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#0a0e14', borderTop: '1px solid #1a202c' }}>
                    <Typography variant="caption" sx={{ color: '#2d3748', fontSize: '0.55rem' }}>
                        {mrd.provenance?.module || 'ovarian.detect_mrd_signal'} · {mrd.provenance?.version || 'v1.0'}
                        {mrd.provenance?.cutoff_source && ` · ${mrd.provenance.cutoff_source}`}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default MRDSignalCard;
