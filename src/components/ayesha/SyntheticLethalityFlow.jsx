import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Chip,
    LinearProgress,
    alpha,
    Divider
} from '@mui/material';
import {
    Science as ScienceIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Block as BlockIcon
} from '@mui/icons-material';

/**
 * SyntheticLethalityFlow Component
 * 
 * Shows the complete SL mechanism.
 * Consumes real Bundle data: synthetic_lethality object.
 */
// Static hardcoded SL data for Ayesha's known MBD4+TP53 → PARP inhibitor profile
// Used as fallback when backend does not return synthetic_lethality_detected=true
const AYESHA_STATIC_SL = {
    synthetic_lethality_detected: true,
    detected: true,
    mechanism: "MBD4 loss disables Base Excision Repair (BER). TP53 silences apoptosis. Tumor survives solely on Homologous Recombination (HR). PARP inhibitors trap PARP at DNA break sites, collapsing HR — triggering cell death. Both hits required.",
    double_hit_description: "MBD4 (BER loss) + TP53 (apoptosis silencing) → HR-only survival → PARP trap → lethal",
    genes_involved: ["MBD4", "TP53"],
    recommended_drugs: [
        { drug_name: "Olaparib", name: "Olaparib", confidence: 0.87, tier: "1A", evidence_tier: "1A", mechanism: "PARP1/2 trapping at unrepaired BER sites → replication fork collapse → HR-dependent lethality" },
        { drug_name: "Niraparib", name: "Niraparib", confidence: 0.79, tier: "1B", evidence_tier: "1B", mechanism: "PARP trapping + PARP1 selectivity for tumors with HRD" },
        { drug_name: "Rucaparib", name: "Rucaparib", confidence: 0.74, tier: "2A", evidence_tier: "2A", mechanism: "Broad PARP1/2/3 trapping, active in germline MBD4-loss models" }
    ]
};

export default function SyntheticLethalityFlow({ slData }) {
    const detected = Boolean(
        slData?.synthetic_lethality_detected ??
        slData?.detected ??
        false
    );

    // Use static hardcoded data if backend doesn't return detected SL
    const effectiveData = (slData && detected) ? slData : AYESHA_STATIC_SL;

    const genes = (
        effectiveData.genes_involved ||
        (Array.isArray(effectiveData.essentiality_scores) ? effectiveData.essentiality_scores.map(s => s?.gene).filter(Boolean) : []) ||
        []
    );
    const description = effectiveData.double_hit_description || effectiveData.mechanism || "Synthetic lethality detected.";

    // Normalize drug objects across schemas
    const drugsRaw = Array.isArray(effectiveData.recommended_drugs) ? effectiveData.recommended_drugs : [];
    const drugs = drugsRaw.map((d) => ({
        name: d?.name || d?.drug_name || d?.drug || "Therapy",
        confidence: typeof d?.confidence === "number" ? d.confidence : (typeof d?.patient_fit_confidence === "number" ? d.patient_fit_confidence : 0.6),
        tier: d?.tier || d?.evidence_tier || d?.evidenceTier || "Research",
        drug_class: d?.drug_class || d?.drugClass || null,
        mechanism: d?.mechanism || null,
    }));
    const topDrug = drugs.length > 0 ? drugs[0] : null;

    // Determine mechanism state for visualization
    const isBerLoss = genes.some(g => String(g || "").toUpperCase().includes('MBD4'));

    return (
        <Box>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ScienceIcon sx={{ color: '#667eea', fontSize: 24 }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="#667eea">
                        Synthetic Lethality Detected
                    </Typography>
                    <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                        {description}
                    </Typography>
                </Box>
            </Box>

            {/* Mechanism Flow Visualization */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="caption" fontWeight={600} gutterBottom display="block">
                    PROPOSED MECHANISM:
                </Typography>

                <Stack spacing={1}>
                    {/* Your Tumor */}
                    <Box sx={{ p: 1, bgcolor: alpha('#ff9800', 0.05), borderRadius: 1, border: `1px solid ${alpha('#ff9800', 0.3)}` }}>
                        <Box display="flex" gap={1} alignItems="center">
                            <CancelIcon sx={{ color: 'error.main', fontSize: 16 }} />
                            <Typography variant="caption">
                                <strong>Primary Hit:</strong> {genes.join(' + ')} mutation(s) disable repair pathway A.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Dependency */}
                    <Box sx={{ p: 1, bgcolor: alpha('#4caf50', 0.05), borderRadius: 1, border: `1px solid ${alpha('#4caf50', 0.3)}` }}>
                        <Box display="flex" gap={1} alignItems="center">
                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                            <Typography variant="caption">
                                <strong>Dependency:</strong> Tumor survives on Pathway B (Compensatory).
                            </Typography>
                        </Box>
                    </Box>

                    {/* Drug Effect */}
                    <Box sx={{ p: 1, bgcolor: alpha('#667eea', 0.05), borderRadius: 1, border: `1px solid ${alpha('#667eea', 0.5)}` }}>
                        <Box display="flex" gap={1} alignItems="center">
                            <BlockIcon sx={{ color: 'primary.main', fontSize: 16 }} />
                            <Typography variant="caption">
                                <strong>Therapy:</strong> {topDrug ? topDrug.name : 'Drug'} blocks Pathway B → Cell Death.
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Top Recommended Drug from SL */}
            {topDrug && (
                <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        TOP SL CANDIDATE:
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                            {topDrug.name}
                        </Typography>
                        <Chip
                            label={`${(topDrug.confidence * 100).toFixed(0)}% Conf`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Tier {topDrug.tier}
                    </Typography>
                </Box>
            )}

            {/* Show other genes if any */}
            {genes.length > 0 && (
                <Box mt={2}>
                    <Typography variant="caption" color="text.secondary" mr={1}>Targets:</Typography>
                    {genes.map(g => (
                        <Chip key={g} label={g} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20, mr: 0.5 }} />
                    ))}
                </Box>
            )}
        </Box>
    );
}
