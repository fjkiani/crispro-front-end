/**
 * PrimaryWeaponCard — Top-ranked drug hero card.
 *
 * S15/S16/S17/S18 anti-slop rewrite:
 *   - No STATIC_BACKUP_EXPLANATION — explanation derived from API data or honest fallback
 *   - "Recommended Treatment" → "Top Ranked Option (RUO)"
 *   - clinical_band defaults to null (no "Likely Responsive")
 *   - "Compatibility" → "Model Confidence (RUO)"
 *   - Tier chip uses evidence_tier, not tier
 *   - SourceSlug for data lineage
 */
import React, { useState } from 'react';
import { Alert, Card, CardContent, Typography, Box, Chip, Button, Collapse, Divider } from '@mui/material';
import { Crosshair, Target, Zap, ScrollText, BookOpen, AlertCircle } from 'lucide-react';
import SourceSlug from './shared/SourceSlug';

const PrimaryWeaponCard = ({ topDrug, drug, patientContext, onInform, isSimulation, levelData }) => {
    const resolvedDrug = topDrug || drug;
    if (!resolvedDrug) return null;

    const confidence = resolvedDrug.confidence != null ? Math.round(resolvedDrug.confidence * 100) : null;
    const [showEvidence, setShowEvidence] = useState(false);

    // S40: evidence_tier takes priority over tier
    const rawTier = resolvedDrug.evidence_tier || resolvedDrug.tier || null;
    const tierDisplay = (() => {
        if (!rawTier) return 'Unclassified';
        const t = String(rawTier).toLowerCase();
        if (t === 'supported' || t === '1' || t === 'i') return 'Tier 1 Evidence';
        if (t === 'consider' || t === '2' || t === 'ii') return 'Tier 2 Option';
        return `Tier ${rawTier}`;
    })();

    const citations = resolvedDrug.citations_count || 0;
    const clinicalBand = resolvedDrug.clinical_band || null;

    // Derive explanation from API data, not hardcoded narrative
    const hasSL = levelData?.synthetic_lethality?.synthetic_lethality_detected;
    const hrdStatus = levelData?.inputs_used?.tumor_context?.hrd_status;
    const hrdScore = levelData?.inputs_used?.tumor_context?.hrd_score;
    const hasHRD = hrdStatus === 'positive' || (hrdScore != null && hrdScore >= 42);

    const explanation = (() => {
        // Prefer API rationale
        if (resolvedDrug.rationale) {
            if (typeof resolvedDrug.rationale === 'string') return resolvedDrug.rationale;
            if (Array.isArray(resolvedDrug.rationale)) {
                const slItem = resolvedDrug.rationale.find(r => r.type === 'synthetic_lethality');
                if (slItem?.explanation) return slItem.explanation;
                const first = resolvedDrug.rationale[0];
                if (first?.explanation) return first.explanation;
            }
        }
        // Derive from SL/HRD flags
        if (hasSL && hasHRD) return 'Synthetic lethality detected with HRD-positive status — this drug targets the tumor\'s DNA repair vulnerability.';
        if (hasSL) return 'Synthetic lethality detected — this drug exploits a dual-hit vulnerability in the tumor.';
        if (hasHRD) return 'HRD-positive status detected — this drug targets the tumor\'s impaired DNA repair capacity.';
        // Honest fallback
        return 'This drug was ranked highest by the scoring model. Specific mechanistic rationale was not provided in this API response.';
    })();

    return (
        <Card sx={{
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: isSimulation ? '2px solid' : '1px solid',
            borderColor: isSimulation ? 'secondary.main' : 'divider',
            boxShadow: isSimulation ? '0 4px 20px rgba(124, 58, 237, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        }}>
            {/* Simulation Banner */}
            {isSimulation && (
                <Box sx={{ bgcolor: 'secondary.main', color: '#fff', py: 0.75, textAlign: 'center', fontWeight: 700, letterSpacing: 1, fontSize: '0.8125rem' }}>
                    SIMULATION MODE — HYPOTHETICAL OUTCOME
                </Box>
            )}

            <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-start' }, gap: 4 }}>

                    {/* Left Content */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Crosshair color="#2563eb" size={20} />
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1, fontSize: '0.8125rem' }}>
                                Top Ranked Option (RUO)
                            </Typography>
                            <Chip
                                label={tierDisplay}
                                size="small"
                                icon={<BookOpen size={12} />}
                                sx={{ fontWeight: 600, bgcolor: rawTier?.toLowerCase() === 'supported' || rawTier === '1' || rawTier === 'i' ? 'success.light' : '#f1f5f9', color: rawTier?.toLowerCase() === 'supported' || rawTier === '1' || rawTier === 'i' ? 'success.dark' : 'text.secondary' }}
                            />
                        </Box>

                        <Typography variant="h2" component="h1" sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.75rem' },
                            color: 'text.primary',
                            mb: 1.5,
                            letterSpacing: '-1px',
                        }}>
                            {resolvedDrug.name}
                        </Typography>

                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '600px', lineHeight: 1.6, fontSize: '1.0625rem' }}>
                            {clinicalBand || 'Ranked #1 by model'} — {explanation.split('.')[0]}.
                        </Typography>

                        {/* Tabs: How It Works / Clinical Evidence */}
                        <Box sx={{ mt: 4, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Box
                                    onClick={() => setShowEvidence(false)}
                                    sx={{
                                        p: 1.5, px: 2.5, cursor: 'pointer',
                                        borderBottom: !showEvidence ? '2px solid' : 'none',
                                        borderColor: 'primary.main',
                                        color: !showEvidence ? 'primary.main' : 'text.secondary',
                                        fontWeight: !showEvidence ? 600 : 400,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Target size={16} />
                                        <Typography variant="body2" fontWeight="inherit">How It Works</Typography>
                                    </Box>
                                </Box>
                                <Box
                                    onClick={() => setShowEvidence(true)}
                                    sx={{
                                        p: 1.5, px: 2.5, cursor: 'pointer',
                                        borderBottom: showEvidence ? '2px solid' : 'none',
                                        borderColor: 'primary.main',
                                        color: showEvidence ? 'primary.main' : 'text.secondary',
                                        fontWeight: showEvidence ? 600 : 400,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ScrollText size={16} />
                                        <Typography variant="body2" fontWeight="inherit">Clinical Evidence ({citations})</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                p: 3,
                                background: '#fafbff',
                                borderLeft: '4px solid',
                                borderColor: 'primary.main',
                                minHeight: 100
                            }}>
                                {!showEvidence ? (
                                    <Box>
                                        <Typography variant="body1" sx={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'text.primary' }}>
                                            {explanation}
                                        </Typography>
                                        <SourceSlug
                                            source={resolvedDrug.rationale ? 'API response' : (hasSL || hasHRD ? 'profile-derived' : null)}
                                            label="Explanation source"
                                        />
                                    </Box>
                                ) : (
                                    <Box>
                                        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Clinical Band</Typography>
                                                <Typography variant="body2" color="text.primary" fontWeight="700">{clinicalBand || '—'}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Evidence Tier</Typography>
                                                <Typography variant="body2" color="text.primary" fontWeight="700">{tierDisplay}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Citations</Typography>
                                                <Typography variant="body2" color="text.primary" fontWeight="700">{citations} Papers</Typography>
                                            </Box>
                                        </Box>
                                        <Alert severity="info" icon={<AlertCircle size={20} />}>
                                            {clinicalBand
                                                ? `Clinical band: ${clinicalBand}. Evidence tier: ${tierDisplay}.`
                                                : `Evidence tier: ${tierDisplay}. No clinical band assigned in this response.`
                                            }
                                        </Alert>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        {onInform && !isSimulation && (
                            <Box sx={{ mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => onInform(resolvedDrug)}
                                    startIcon={<Zap size={18} />}
                                    sx={{
                                        py: 1.5,
                                        px: 4,
                                        fontWeight: 700,
                                        fontSize: '0.9375rem',
                                    }}
                                >
                                    Generate Detailed Report
                                </Button>
                            </Box>
                        )}
                        {isSimulation && (
                            <Box sx={{ mt: 3 }}>
                                <Button disabled variant="outlined" sx={{ color: 'text.disabled', borderColor: 'divider' }}>
                                    Simulation Mode — Report Generation Locked
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Right Metric */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        justifyContent: 'center',
                        minWidth: 160,
                        p: 3,
                        bgcolor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <Typography variant="h1" sx={{
                            fontSize: { xs: '3.5rem', md: '4.5rem' },
                            fontWeight: 900,
                            color: confidence != null ? 'primary.main' : 'text.disabled',
                            lineHeight: 1,
                            letterSpacing: '-3px',
                        }}>
                            {confidence != null ? `${confidence}%` : '—'}
                        </Typography>
                        <Typography variant="overline" sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            letterSpacing: 2,
                            mt: 1,
                            textAlign: 'center',
                        }}>
                            Model Confidence (RUO)
                        </Typography>
                        <SourceSlug
                            source={resolvedDrug.sporadic_gates_provenance?.engine || null}
                            label="Score engine"
                            compact
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PrimaryWeaponCard;
