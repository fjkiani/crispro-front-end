/**
 * GatesSidebar — Compact gate summary for the sidebar.
 *
 * Shows gate count, net effect deltas, and expandable details.
 * Designed to fit a narrow sidebar column.
 */
import React, { useState } from 'react';
import {
    Box, Typography, Paper, Chip, Collapse, Divider,
} from '@mui/material';
import { ExpandMore, ExpandLess, Shield } from '@mui/icons-material';
import { humanizeGateName, explainGate, pct } from './explainers';

export default function GatesSidebar({ provenance }) {
    const [expanded, setExpanded] = useState(false);

    if (!provenance || !provenance.gates_applied || provenance.gates_applied.length === 0) {
        return null;
    }

    const gateRationale = provenance.rationale || [];
    const explained = gateRationale.map(g => explainGate(g)).filter(Boolean);
    const netEfficacy = provenance.efficacy_delta || 0;
    const netConfidence = provenance.confidence_delta || 0;

    return (
        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Shield sx={{ fontSize: 18, color: '#6366f1' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.9rem', flex: 1 }}>
                    Score Adjustments
                </Typography>
                <Chip
                    label={`${provenance.gates_applied.length}`}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20, minWidth: 20, bgcolor: '#e0e7ff', color: '#3730a3' }}
                />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.85rem', lineHeight: 1.6 }}>
                Clinical rules automatically adjusted the raw score based on data quality and completeness.
            </Typography>

            {/* Net effect pills */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                        Match Score
                    </Typography>
                    <Typography variant="body1" sx={{
                        fontWeight: 800,
                        color: netEfficacy > 0 ? '#166534' : netEfficacy < 0 ? '#991b1b' : 'text.primary',
                    }}>
                        {netEfficacy > 0 ? '+' : ''}{Math.round(netEfficacy * 100)} pts
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                        Confidence
                    </Typography>
                    <Typography variant="body1" sx={{
                        fontWeight: 800,
                        color: netConfidence > 0 ? '#166534' : netConfidence < 0 ? '#991b1b' : 'text.primary',
                    }}>
                        {netConfidence > 0 ? '+' : ''}{Math.round(netConfidence * 100)} pts
                    </Typography>
                </Box>
            </Box>

            {/* Gate chips */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                {provenance.gates_applied.map((gate, i) => (
                    <Chip
                        key={i}
                        label={humanizeGateName(gate)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', fontWeight: 600, height: 22 }}
                        color={gate.includes('PENALTY') ? 'error' : gate.includes('BOOST') || gate.includes('RESCUE') ? 'success' : 'default'}
                    />
                ))}
            </Box>

            {/* Expand details */}
            {explained.length > 0 && (
                <>
                    <Box
                        onClick={() => setExpanded(x => !x)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5,
                            cursor: 'pointer', color: 'primary.main',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                            {expanded ? 'Hide details' : 'Show details'}
                        </Typography>
                        {expanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
                    </Box>

                    <Collapse in={expanded}>
                        <Box sx={{ mt: 1.5 }}>
                            {explained.map((g, i) => (
                                <Box key={i} sx={{ mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                                            {g.name}
                                        </Typography>
                                        <Chip
                                            label={g.verdict}
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.55rem', fontWeight: 800 }}
                                        />
                                    </Box>
                                    {g.sentences.map((s, j) => (
                                        <Typography key={j} variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5, mt: 0.5 }}>
                                            {s}
                                        </Typography>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Collapse>
                </>
            )}
        </Paper>
    );
}
