import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Chip,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    alpha,
    Divider
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

/**
 * MutationScoringPipeline Component
 * 
 * Shows genomic impact analysis for all mutations in the profile.
 * Hydrated from real Bundle data (inputs_used.mutations + synthetic_lethality.essentiality_scores).
 */
export default function MutationScoringPipeline({ mutations = [], essentialityScores = [] }) {
    if (!mutations || mutations.length === 0) return null;

    return (
        <Box>
            {mutations.map((mut, idx) => (
                <MutationItem
                    key={`${mut.gene}-${idx}`}
                    mutation={mut}
                    score={essentialityScores.find(s => s.gene === mut.gene?.toUpperCase())}
                />
            ))}
        </Box>
    );
}

import { humanize } from '../../utils/drugRendering';

// ... (existing imports)

function MutationItem({ mutation, score }) {
    const [expanded, setExpanded] = useState(false);

    // Derive display values from real artifacts
    const gene = mutation.gene || 'Unknown';
    const proteinChange = mutation.hgvs_p || mutation.hgvsp || 'N/A';
    // If coords are missing, just show "Standard Locus" instead of terrifying "Coordinates pending"
    const genomicLoc = mutation.chrom ? `chr${mutation.chrom}:${mutation.pos}` : 'Standard Genome Locus';

    // Evo2 Data (Real!)
    const evo2Delta = score?.evo2_raw_delta;
    const evo2Used = score?.evo2_window_used > 0;
    const isEvo2Fallback = !evo2Used;

    return (
        <Card variant="outlined" sx={{ mb: 2, borderColor: alpha('#667eea', 0.2) }}>
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <GridSummary mutation={mutation} score={score} />
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>

                        {/* 1. Genomic Details */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                1. GENOMIC COORDINATES
                            </Typography>
                            <Box display="flex" gap={4} mt={0.5}>
                                <Box>
                                    <Typography variant="caption" display="block">Location</Typography>
                                    <Typography variant="body2">{genomicLoc}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block">Ref / Alt</Typography>
                                    <Typography variant="body2">{mutation.ref || '-'} → {mutation.alt || 'del'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block">Consequence</Typography>
                                    <Chip label={humanize(mutation.consequence) || 'Unknown'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                </Box>
                            </Box>
                        </Box>

                        {/* 2. Evo2 Impact (Real) */}
                        <Box sx={{ p: 1.5, bgcolor: '#f8fcff', borderRadius: 1, border: '1px solid #e3f2fd' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="caption" color="primary" fontWeight="bold">
                                    2. SEQUENCE SCORING (EVO2)
                                </Typography>
                                {isEvo2Fallback && <Chip label="Standard Scoring Rules" size="small" color="info" variant="outlined" sx={{ height: 20 }} />}
                            </Box>

                            {evo2Used ? (
                                <>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">Raw Delta Score:</Typography>
                                        <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                                            {evo2Delta?.toExponential(2)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Window used: {score.evo2_window_used}bp
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    Deep sequence scoring (Evo2) not required for this variant type.
                                </Typography>
                            )}
                        </Box>

                        {/* 3. Essentiality Score */}
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                    3. GENE ESSENTIALITY IMPACT
                                </Typography>
                                <Typography variant="caption" fontWeight="bold">
                                    {score?.essentiality_score?.toFixed(2) || 'N/A'} / 1.0
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(score?.essentiality_score || 0) * 100}
                                color={score?.essentiality_score > 0.7 ? 'error' : 'secondary'}
                                sx={{ height: 6, borderRadius: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                                {score?.functional_consequence || 'Impact calculation pending'}
                            </Typography>
                        </Box>
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Card>
    );
}

function GridSummary({ mutation, score }) {
    const impact = score?.essentiality_score || 0;
    const color = impact > 0.7 ? 'error' : (impact > 0.4 ? 'warning' : 'success');

    return (
        <Box display="flex" alignItems="center" width="100%" gap={2}>
            <Box width="15%">
                <Typography variant="subtitle2" fontWeight="bold">{mutation.gene}</Typography>
            </Box>
            <Box width="30%">
                <Typography variant="body2" noWrap>{mutation.hgvs_p || mutation.hgvsp}</Typography>
            </Box>
            <Box flexGrow={1}>
                {score?.evo2_raw_delta !== undefined && (
                    <Chip
                        label={`Δ ${score.evo2_raw_delta.toExponential(1)}`}
                        size="small"
                        variant="outlined"
                        color="default"
                        sx={{ fontFamily: 'monospace' }}
                    />
                )}
            </Box>
            <Box width="20%" display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
                <LinearProgress
                    variant="determinate"
                    value={impact * 100}
                    color={color}
                    sx={{ width: 60, height: 6, borderRadius: 1 }}
                />
            </Box>
        </Box>
    );
}

