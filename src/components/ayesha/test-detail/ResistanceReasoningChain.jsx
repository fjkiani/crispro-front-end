/**
 * ResistanceReasoningChain
 *
 * GAP-11: Transparency layer — shows the step-by-step derivation:
 *   Patient gene → Resistance class → Severity → Treatment shift
 *
 * This gives users and clinicians a visible audit trail for every resistance
 * class displayed in MultiMechanismPanel. Collapses by default (non-intrusive).
 *
 * Props:
 *   resistanceClasses — Array from buildResistanceClassProps() — same data
 *                       MultiMechanismPanel receives. Includes class_id,
 *                       class_name, icon, severity, signals[], description,
 *                       treatment_shift, compound_rule.
 *   metadata          — { meta: { version, gene_count, class_count, axis_count } }
 *                       from useResistanceMetadata() — for the source citation.
 */
import React, { useState } from 'react';
import { Box, Typography, Paper, Collapse, Button, Chip, Alert } from '@mui/material';
import { ExpandMore, ExpandLess, AccountTree } from '@mui/icons-material';

const SEVERITY_COLORS = {
    critical: '#dc2626',
    high: '#ea580c',
    moderate: '#d97706',
    low: '#65a30d',
};

export default function ResistanceReasoningChain({ resistanceClasses = [], metadata = {} }) {
    const [open, setOpen] = useState(false);

    // Don't render if nothing to explain
    if (resistanceClasses.length === 0) return null;

    const metaInfo = metadata?.meta || {};

    return (
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
            {/* Collapsible header */}
            <Box
                onClick={() => setOpen(o => !o)}
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', userSelect: 'none',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountTree sx={{ fontSize: 20, color: '#475569' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                        Resistance Reasoning Chain
                    </Typography>
                    <Chip
                        label={`${resistanceClasses.length} class${resistanceClasses.length > 1 ? 'es' : ''}`}
                        size="small"
                        sx={{ fontSize: '0.7rem', fontWeight: 700, height: 20 }}
                    />
                </Box>
                <Button
                    size="small"
                    endIcon={open ? <ExpandLess /> : <ExpandMore />}
                    sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#64748b' }}
                >
                    {open ? 'Hide' : 'Show Logic'}
                </Button>
            </Box>

            <Collapse in={open}>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {resistanceClasses.map((rc, i) => {
                        const sevColor = SEVERITY_COLORS[rc.severity] || SEVERITY_COLORS.moderate;
                        return (
                            <Box key={i} sx={{
                                borderLeft: `3px solid ${sevColor}`,
                                pl: 2, py: 0.5,
                            }}>
                                {/* Step 1: Genes detected */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 100 }}>
                                        Gene(s) detected
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {(rc.signals || []).map((gene, j) => (
                                            <Chip key={j} label={gene} size="small" variant="outlined"
                                                sx={{ fontSize: '0.72rem', fontWeight: 700, height: 22 }} />
                                        ))}
                                    </Box>
                                </Box>

                                {/* Step 2: Maps to class */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 100 }}>
                                        → Maps to class
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: sevColor, fontSize: '0.82rem' }}>
                                        {rc.icon} {rc.class_name}
                                    </Typography>
                                </Box>

                                {/* Step 3: Severity */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 100 }}>
                                        → Severity
                                    </Typography>
                                    <Chip
                                        label={rc.severity?.toUpperCase()}
                                        size="small"
                                        sx={{ bgcolor: sevColor + '18', color: sevColor, fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                                    />
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                        (from Kill Chain priority ranking)
                                    </Typography>
                                </Box>

                                {/* Step 4: Treatment shift */}
                                {rc.treatment_shift && (
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.75 }}>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 100 }}>
                                            → Action
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.78rem', fontStyle: 'italic' }}>
                                            {rc.treatment_shift}
                                        </Typography>
                                    </Box>
                                )}

                                {/* compound_rule caveat */}
                                {rc.compound_rule && (
                                    <Alert severity="info" icon={false} sx={{
                                        mt: 0.75, py: 0.4, px: 1.2, borderRadius: 1.5,
                                        '& .MuiAlert-message': { fontSize: '0.72rem' },
                                    }}>
                                        ⚠️ {rc.compound_rule}
                                    </Alert>
                                )}
                            </Box>
                        );
                    })}

                    {/* Source citation */}
                    <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                            Source: Kill Chain Metadata API v{metaInfo.version || '—'}
                            {' '}·{' '}{metaInfo.gene_count || '?'} genes mapped
                            {' '}·{' '}{metaInfo.class_count || '?'} resistance classes
                            {' '}·{' '}Classification via gene → class mapping (heuristic)
                            {' '}·{' '}Authoritative classification available via Clinician mode
                        </Typography>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
}
