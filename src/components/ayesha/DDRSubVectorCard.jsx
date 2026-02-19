import React, { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Grid,
    Stack,
} from '@mui/material';
import BiotechIcon from '@mui/icons-material/Biotech';

/**
 * DDRSubVectorCard — shows which DDR sub-modules are broken vs functional vs not assessed.
 *
 * Computed ONLY from slData.broken_pathways and slData.essential_pathways.
 * Never shows a numeric score unless disruption_score exists in the payload for that pathway.
 * Shows "Not Assessed" for any DDR sub-module not present in the payload.
 */

const safeArray = (v) => (Array.isArray(v) ? v : []);

// Known DDR sub-modules to check for
const DDR_SUBMODULES = [
    { id: 'BER', name: 'Base Excision Repair' },
    { id: 'HR', name: 'Homologous Recombination' },
    { id: 'NER', name: 'Nucleotide Excision Repair' },
    { id: 'MMR', name: 'Mismatch Repair' },
    { id: 'FA', name: 'Fanconi Anemia' },
    { id: 'NHEJ', name: 'Non-Homologous End Joining' },
];

const STATUS_CONFIG = {
    non_functional: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'NON-FUNCTIONAL' },
    functional: { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'FUNCTIONAL' },
    not_assessed: { color: '#6b7280', bg: '#f9fafb', border: '#d1d5db', label: 'NOT ASSESSED' },
};

function DDRSubVectorCard({ slData }) {
    if (!slData || slData.synthetic_lethality_detected !== true) return null;

    const broken = safeArray(slData.broken_pathways);
    const essential = safeArray(slData.essential_pathways);

    // Build lookup map: pathway_id → { status, description, disruption_score, genes_affected }
    const pathwayMap = useMemo(() => {
        const map = {};
        for (const bp of broken) {
            if (bp.pathway_id) {
                map[bp.pathway_id] = {
                    status: bp.status || 'non_functional',
                    description: bp.description,
                    disruption_score: bp.disruption_score,
                    genes_affected: safeArray(bp.genes_affected),
                };
            }
        }
        for (const ep of essential) {
            if (ep.pathway_id && !map[ep.pathway_id]) {
                map[ep.pathway_id] = {
                    status: ep.status || 'functional',
                    description: ep.description,
                    disruption_score: ep.disruption_score,
                    genes_affected: safeArray(ep.genes_affected),
                };
            }
        }
        return map;
    }, [broken, essential]);

    // Build display list
    const submodules = DDR_SUBMODULES.map(sm => {
        const data = pathwayMap[sm.id];
        if (data) {
            return { ...sm, ...data };
        }
        return { ...sm, status: 'not_assessed', description: null, disruption_score: null, genes_affected: [] };
    });

    // Count assessed vs not
    const assessedCount = submodules.filter(s => s.status !== 'not_assessed').length;

    return (
        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <BiotechIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        DDR Pathway Status
                    </Typography>
                    <Chip
                        size="small"
                        label="From SL analysis · RUO"
                        variant="outlined"
                        sx={{ ml: 'auto', fontSize: '0.65rem' }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    DNA Damage Response sub-module status derived from the Synthetic Lethality analysis.
                    {assessedCount < DDR_SUBMODULES.length && (
                        <> ({DDR_SUBMODULES.length - assessedCount} of {DDR_SUBMODULES.length} sub-modules not assessed — additional testing may resolve.)</>
                    )}
                </Typography>

                <Grid container spacing={1.5}>
                    {submodules.map(sm => {
                        const config = STATUS_CONFIG[sm.status] || STATUS_CONFIG.not_assessed;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={sm.id}>
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: `1px solid ${config.border}`,
                                    bgcolor: config.bg,
                                    height: '100%',
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                                            {sm.id}
                                        </Typography>
                                        <Chip
                                            label={config.label}
                                            size="small"
                                            sx={{
                                                fontSize: '0.6rem',
                                                height: 20,
                                                fontWeight: 700,
                                                color: config.color,
                                                borderColor: config.color,
                                            }}
                                            variant="outlined"
                                        />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                        {sm.name}
                                    </Typography>
                                    {sm.description && (
                                        <Typography variant="caption" sx={{ color: '#374151', display: 'block', mt: 0.5, fontSize: '0.72rem' }}>
                                            {sm.description}
                                        </Typography>
                                    )}
                                    {sm.genes_affected && sm.genes_affected.length > 0 && (
                                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                            {sm.genes_affected.map(g => (
                                                <Chip key={g} label={g} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                                            ))}
                                        </Stack>
                                    )}
                                    {typeof sm.disruption_score === 'number' && (
                                        <Typography variant="caption" sx={{ color: config.color, fontWeight: 700, display: 'block', mt: 0.5 }}>
                                            Disruption: {(sm.disruption_score * 100).toFixed(0)}%
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </Card>
    );
}

export default DDRSubVectorCard;
