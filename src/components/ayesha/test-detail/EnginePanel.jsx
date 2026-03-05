/**
 * EnginePanel — Kill Chain Engine Light Dashboard (Modular)
 * ==========================================================
 * Orchestrator component. Sub-components live in ./engine-panel/
 *
 * Structure:
 *   engine-panel/SignalLight.jsx    — single signal circle
 *   engine-panel/GeneBox.jsx       — single gene indicator
 *   engine-panel/ActionItem.jsx    — prioritized action card
 *   engine-panel/StateIndicator.jsx — 2-of-N state display
 *   engine-panel/index.js          — barrel export
 *
 * Source doctrine: ENGINE_LIGHT_DASHBOARD.mdc §7 Layer 3
 */
import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess, Shield } from '@mui/icons-material';

import { useKillChainSignals } from '../../../hooks/ayesha/useKillChainSignals';
import { GENE_COVERAGE_MAP, GENE_DISPLAY_ORDER } from '../../../constants/signalStateEngine';

// ── Modular sub-components ───────────────────────────────────────────────────
import { SignalLight, GeneBox, ActionItem, StateIndicator } from './engine-panel';

export default function EnginePanel() {
    const { signals, geneCoverage, summary, actions } = useKillChainSignals();
    const [expanded, setExpanded] = useState(false);
    const [showGenes, setShowGenes] = useState(false);

    const signalArray = Object.values(signals);

    // Group genes by resistance class for display
    const geneGroups = {};
    GENE_DISPLAY_ORDER.forEach(gene => {
        const gcm = GENE_COVERAGE_MAP[gene];
        const group = gcm?.group || 'Other';
        if (!geneGroups[group]) geneGroups[group] = [];
        geneGroups[group].push(gene);
    });

    return (
        <Paper sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: expanded ? '#e2e8f0' : 'divider',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            ...(expanded && { boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }),
        }}>
            {/* ── Header (always visible) ── */}
            <Box
                onClick={() => setExpanded(!expanded)}
                sx={{
                    p: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#fafafa' },
                    transition: 'background-color 0.2s ease',
                }}
            >
                <Shield sx={{ fontSize: 24, color: 'var(--text-primary)' }} />
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>
                        Kill Chain Engine Monitor
                    </Typography>
                    <Typography sx={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {summary.fired > 0
                            ? `${summary.fired} signal${summary.fired > 1 ? 's' : ''} firing`
                            : summary.no_data === 8
                                ? '8 signals unchecked — tests needed'
                                : `${8 - summary.no_data}/8 signals active`}
                        {' · '}
                        {summary.covered_genes}/{summary.total_genes} genes covered
                    </Typography>
                </Box>

                {/* Mini signal dots preview */}
                <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                    {signalArray.map(sig => (
                        <Box key={sig.id} sx={{
                            width: 10, height: 10, borderRadius: '50%',
                            bgcolor: sig.state?.color || '#94a3b8',
                        }} />
                    ))}
                </Box>

                {expanded ? <ExpandLess sx={{ color: 'var(--text-muted)' }} /> : <ExpandMore sx={{ color: 'var(--text-muted)' }} />}
            </Box>

            {/* ── Expanded Detail ── */}
            <Collapse in={expanded}>
                <Box sx={{ px: 2.5, pb: 3 }}>

                    {/* State Machine Indicator */}
                    <StateIndicator summary={summary} />

                    {/* Signal Light Row (instrument cluster) */}
                    <Box sx={{ mt: 2.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            8 Kill Chain Signals
                        </Typography>
                        <Box sx={{
                            display: 'flex', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: 2,
                            p: 2.5, borderRadius: 2.5,
                            bgcolor: '#0f172a',
                        }}>
                            {signalArray.map(sig => (
                                <SignalLight key={sig.id} signal={sig} />
                            ))}
                        </Box>
                    </Box>

                    {/* Gene Coverage Grid (collapsible) */}
                    <Box sx={{ mt: 2.5 }}>
                        <Box
                            onClick={() => setShowGenes(!showGenes)}
                            sx={{
                                display: 'flex', alignItems: 'center', cursor: 'pointer',
                                '&:hover': { opacity: 0.8 },
                            }}
                        >
                            <Typography sx={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                26-Gene Resistance Coverage
                            </Typography>
                            <Chip
                                label={`${summary.covered_genes}/${summary.total_genes}`}
                                size="small"
                                sx={{
                                    ml: 1, fontWeight: 700, fontSize: 'var(--text-xs)', height: 22,
                                    bgcolor: summary.covered_genes > 10 ? '#dcfce7' : '#f1f5f9',
                                    color: summary.covered_genes > 10 ? '#15803d' : 'var(--text-muted)',
                                }}
                            />
                            {showGenes
                                ? <ExpandLess sx={{ fontSize: 18, color: 'var(--text-muted)', ml: 0.5 }} />
                                : <ExpandMore sx={{ fontSize: 18, color: 'var(--text-muted)', ml: 0.5 }} />
                            }
                        </Box>

                        <Collapse in={showGenes}>
                            <Box sx={{ mt: 1.5 }}>
                                {Object.entries(geneGroups).map(([groupName, genes]) => (
                                    <Box key={groupName} sx={{ mb: 1.5 }}>
                                        <Typography sx={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-hint)', mb: 0.75, textTransform: 'uppercase' }}>
                                            {groupName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {genes.map(gene => (
                                                <GeneBox key={gene} gene={gene} coverage={geneCoverage[gene]} />
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Collapse>
                    </Box>

                    {/* What Needs Checking */}
                    {actions.length > 0 && (
                        <Box sx={{ mt: 2.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                What Needs Checking
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {actions.map((action, i) => (
                                    <ActionItem key={i} action={action} />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Footer */}
                    <Box sx={{
                        mt: 2.5, p: 2, borderRadius: 2,
                        bgcolor: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        textAlign: 'center',
                    }}>
                        <Typography sx={{ color: 'var(--text-hint)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
                            Display-layer monitor only. Clinical decisions require backend 2-of-N state machine.
                            {' '}Signals update when patient data changes. Grey lights = tests to order.
                        </Typography>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
}
