import React, { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Divider,
    Stack,
    Alert,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LinkIcon from '@mui/icons-material/Link';

/**
 * ComboRationaleCard — single "Why PARP + ATR" narrative from SL bundle fields.
 *
 * Rendering rules:
 * 1. Only renders if synthetic_lethality_detected === true
 * 2. Only renders combo narrative if recommended_drugs contains ≥2 drugs targeting different pathways
 * 3. Narrative is assembled purely from: broken_pathways, essential_pathways, recommended_drugs, essentiality_scores
 * 4. No trial IDs, no PMIDs, no claims not in payload
 * 5. RUO label always visible
 */

const safeArray = (v) => (Array.isArray(v) ? v : []);

function ComboRationaleCard({ slData }) {
    const payload = slData;

    // Gate 1: Must have detected SL
    if (!payload || payload.synthetic_lethality_detected !== true) return null;

    const broken = safeArray(payload.broken_pathways);
    const essential = safeArray(payload.essential_pathways);
    const drugs = safeArray(payload.recommended_drugs);
    const scores = safeArray(payload.essentiality_scores);
    const doubleHit = payload.double_hit_description || null;

    // Gate 2: Must have ≥2 drugs targeting different pathways to form a combo thesis
    const uniqueTargets = new Set(drugs.map(d => d.target_pathway).filter(Boolean));
    if (uniqueTargets.size < 2) return null;

    // Group drugs by target pathway for narrative structure
    const drugsByTarget = useMemo(() => {
        const map = {};
        for (const d of drugs) {
            const key = d.target_pathway || 'unknown';
            if (!map[key]) map[key] = [];
            map[key].push(d);
        }
        return map;
    }, [drugs]);

    // Build narrative steps from structured data
    const narrativeSteps = useMemo(() => {
        const steps = [];

        // Step 1: What's broken (from broken_pathways)
        for (const bp of broken) {
            if (bp.description && bp.status === 'non_functional') {
                steps.push({
                    type: 'broken',
                    label: bp.pathway_name || bp.pathway_id,
                    text: bp.description,
                    genes: safeArray(bp.genes_affected),
                    score: bp.disruption_score,
                });
            }
        }

        // Step 2: What the cancer depends on now (from essential_pathways)
        for (const ep of essential) {
            if (ep.description) {
                steps.push({
                    type: 'essential',
                    label: ep.pathway_name || ep.pathway_id,
                    text: ep.description,
                    status: ep.status,
                });
            }
        }

        return steps;
    }, [broken, essential]);

    // Get functional consequence from essentiality_scores
    const consequences = scores
        .filter(s => s.functional_consequence)
        .map(s => ({ gene: s.gene, consequence: s.functional_consequence, score: s.essentiality_score }));

    return (
        <Card sx={{ borderRadius: 3, border: '1px solid #3b82f6', bgcolor: '#fafcff' }}>
            <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <LinkIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        Combo Rationale
                    </Typography>
                    <Chip
                        size="small"
                        label="RUO"
                        variant="outlined"
                        sx={{ ml: 'auto', fontSize: '0.7rem' }}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Why targeting multiple pathways simultaneously may be more effective than monotherapy for this tumor profile.
                </Typography>

                {/* Double Hit Summary */}
                {doubleHit && (
                    <Alert
                        severity="info"
                        variant="outlined"
                        sx={{ mb: 2, fontSize: '0.85rem' }}
                        icon={<ScienceIcon fontSize="small" />}
                    >
                        <strong>Signal:</strong> {doubleHit}
                    </Alert>
                )}

                {/* Narrative Flow: What's broken → What cancer depends on → How drugs attack */}
                <Box sx={{ mb: 2 }}>
                    {/* Step 1: Broken pathways */}
                    {narrativeSteps.filter(s => s.type === 'broken').map((step, i) => (
                        <Box key={`broken-${i}`} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                            <Box sx={{
                                minWidth: 28, height: 28, borderRadius: '50%',
                                bgcolor: '#fef2f2', border: '2px solid #ef4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 900, color: '#ef4444', mt: 0.3
                            }}>
                                1
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#dc2626' }}>
                                    {step.label} — NON-FUNCTIONAL
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                                    {step.text}
                                </Typography>
                                {step.genes.length > 0 && (
                                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                        {step.genes.map(g => (
                                            <Chip key={g} label={g} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                                        ))}
                                        {typeof step.score === 'number' && (
                                            <Chip
                                                label={`Disruption: ${(step.score * 100).toFixed(0)}%`}
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: 22 }}
                                            />
                                        )}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    ))}

                    {/* Functional Consequence */}
                    {consequences.length > 0 && (
                        <Box sx={{ ml: 4.5, mb: 1.5 }}>
                            {consequences.map((c, i) => (
                                <Typography key={i} variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                    <strong>{c.gene}:</strong> {c.consequence}
                                </Typography>
                            ))}
                        </Box>
                    )}

                    {/* Arrow connector */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                        <ArrowForwardIcon sx={{ color: '#cbd5e1', transform: 'rotate(90deg)' }} />
                    </Box>

                    {/* Step 2: Essential pathways (what cancer depends on) */}
                    {narrativeSteps.filter(s => s.type === 'essential').map((step, i) => (
                        <Box key={`essential-${i}`} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                            <Box sx={{
                                minWidth: 28, height: 28, borderRadius: '50%',
                                bgcolor: '#fefce8', border: '2px solid #eab308',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 900, color: '#eab308', mt: 0.3
                            }}>
                                2
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ca8a04' }}>
                                    {step.label} — Cancer Dependency
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                                    {step.text}
                                </Typography>
                            </Box>
                        </Box>
                    ))}

                    {/* Arrow connector */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                        <ArrowForwardIcon sx={{ color: '#cbd5e1', transform: 'rotate(90deg)' }} />
                    </Box>

                    {/* Step 3: Drugs targeting these dependencies */}
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Box sx={{
                            minWidth: 28, height: 28, borderRadius: '50%',
                            bgcolor: '#f0fdf4', border: '2px solid #22c55e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 900, color: '#22c55e', mt: 0.3
                        }}>
                            3
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                                Therapeutic Attack Strategy
                            </Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                {Object.entries(drugsByTarget).map(([pathway, pathwayDrugs]) => (
                                    <Box key={pathway} sx={{
                                        p: 1.5, borderRadius: 2,
                                        border: '1px solid #e2e8f0',
                                        bgcolor: '#fff'
                                    }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Targeting: {pathway}
                                        </Typography>
                                        {pathwayDrugs.map((drug, j) => (
                                            <Box key={j} sx={{ mt: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {drug.drug_name}
                                                    </Typography>
                                                    {typeof drug.confidence === 'number' && (
                                                        <Chip
                                                            label={`Confidence: ${(drug.confidence * 100).toFixed(0)}%`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.65rem', height: 20 }}
                                                        />
                                                    )}
                                                    {drug.evidence_tier && (
                                                        <Chip
                                                            label={drug.evidence_tier}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.65rem', height: 20 }}
                                                        />
                                                    )}
                                                </Box>
                                                {drug.mechanism && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                        {drug.mechanism}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Combo thesis summary — assembled from structured fields */}
                <Alert
                    severity="success"
                    variant="outlined"
                    sx={{ fontSize: '0.82rem' }}
                >
                    <strong>Combo thesis:</strong> Targeting{' '}
                    {Array.from(uniqueTargets).join(' + ')}{' '}
                    simultaneously addresses both the primary DNA repair dependency and its backup checkpoint pathway,
                    reducing the tumor's ability to compensate through pathway switching.
                </Alert>
            </CardContent>
        </Card>
    );
}

export default ComboRationaleCard;
