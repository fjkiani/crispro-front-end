/**
 * MOACard — Mechanism of Action + Evidence + Citations.
 *
 * Iteration 2: Bigger text, why-callouts for empty data
 * (no FDA label, no citations), pill chips for key values.
 */
import React, { useState } from 'react';
import {
    Box, Typography, Paper, Grid, Chip, Divider, Collapse,
} from '@mui/material';
import {
    Science, Biotech, LocalHospital, Timeline, OpenInNew,
    CheckCircle, Cancel, ExpandMore, ExpandLess, Info, HelpOutline,
} from '@mui/icons-material';
import { Shield } from 'lucide-react';
import { pct, explainNoFdaLabel, explainNoCitations } from './explainers';

// ── Why-Callout Box ──────────────────────────────────────────────────────────

function WhyCallout({ title, sentences, color = '#fef3c7', borderColor = '#fcd34d', textColor = '#92400e' }) {
    const [open, setOpen] = useState(false);
    return (
        <Box sx={{ bgcolor: color, border: '1.5px solid', borderColor, borderRadius: 2.5, p: 2, mt: 1 }}>
            <Box
                onClick={() => setOpen(x => !x)}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    cursor: 'pointer',
                }}
            >
                <HelpOutline sx={{ fontSize: 18, color: textColor }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: textColor, flex: 1, fontSize: '0.95rem' }}>
                    {title}
                </Typography>
                {open ? <ExpandLess sx={{ fontSize: 18, color: textColor }} /> : <ExpandMore sx={{ fontSize: 18, color: textColor }} />}
            </Box>
            <Collapse in={open}>
                <Box sx={{ mt: 1.5 }}>
                    {sentences.map((s, i) => (
                        <Typography key={i} variant="body2" sx={{ color: textColor, mb: 1, lineHeight: 1.7, fontSize: '0.85rem' }}>
                            {s}
                        </Typography>
                    ))}
                </Box>
            </Collapse>
        </Box>
    );
}

// ── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, secondary, pill }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.5 }}>
            {icon}
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{
                    color: 'text.secondary', fontWeight: 700, display: 'block',
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                    {label}
                </Typography>
                {pill ? (
                    <Chip
                        label={value || '—'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.85rem', height: 28, mt: 0.5 }}
                    />
                ) : (
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {value || '—'}
                    </Typography>
                )}
                {secondary && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.6, fontSize: '0.85rem' }}>
                        {secondary}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

// ── Evidence Tier Descriptions ───────────────────────────────────────────────

const EVIDENCE_DESCRIPTIONS = {
    'strong': 'Multiple high-quality clinical trials or meta-analyses support this drug in similar contexts.',
    'moderate': 'Some published evidence exists, with ongoing trials or smaller sample sizes.',
    'insufficient': 'Limited or no direct clinical evidence for this specific drug–mutation pairing.',
    'research': 'Purely computational — no direct clinical evidence available yet.',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function MOACard({ drug }) {
    const [showClinVar, setShowClinVar] = useState(false);
    const moaCategory = drug.moa_category || drug.moa || 'Unknown mechanism';
    const evidenceTier = drug.evidence_tier || 'research';
    const labelStatus = drug.label_status || 'UNKNOWN';
    const clinvar = drug.clinvar || {};
    const manifest = drug.evidence_manifest || {};
    const meetsGate = drug.meets_evidence_gate;
    const drugName = drug.name || drug.drug_name || 'This drug';
    const manifestCitations = Array.isArray(manifest.citations) ? manifest.citations : [];
    const citations = Array.isArray(drug.citations) && drug.citations.length > 0
        ? drug.citations.map((pmid) => ({ pmid }))
        : manifestCitations;
    const citationsCount = drug.citations_count || citations.length || 0;

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Biotech sx={{ fontSize: 22, color: '#059669' }} />
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
                    Mechanism of Action & Evidence
                </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5, fontSize: '1rem', lineHeight: 1.7 }}>
                How this drug works, what evidence supports it, and its regulatory status.
            </Typography>

            <Grid container spacing={3}>
                {/* Left column */}
                <Grid item xs={12} md={6}>
                    <InfoRow
                        icon={<Science sx={{ fontSize: 20, color: 'primary.main' }} />}
                        label="Drug Class / Mechanism"
                        value={moaCategory}
                        pill
                        secondary={`This drug is classified as a ${moaCategory.toLowerCase()}, targeting a specific biological mechanism in tumor cells.`}
                    />
                    <InfoRow
                        icon={<Biotech sx={{ fontSize: 20, color: 'secondary.main' }} />}
                        label="Evidence Tier"
                        value={evidenceTier.charAt(0).toUpperCase() + evidenceTier.slice(1)}
                        pill
                        secondary={EVIDENCE_DESCRIPTIONS[evidenceTier]}
                    />
                    <InfoRow
                        icon={<LocalHospital sx={{ fontSize: 20, color: 'success.main' }} />}
                        label="FDA Label Status"
                        value={labelStatus === 'UNKNOWN' ? 'Not evaluated' : labelStatus}
                        pill
                    />
                    {/* WHY no FDA label? */}
                    {labelStatus === 'UNKNOWN' && (
                        <WhyCallout
                            title="Why is there no FDA label?"
                            sentences={explainNoFdaLabel(drugName)}
                        />
                    )}
                </Grid>

                {/* Right column */}
                <Grid item xs={12} md={6}>
                    <InfoRow
                        icon={<Timeline sx={{ fontSize: 20, color: 'warning.main' }} />}
                        label="Citations Found"
                        value={citationsCount > 0 ? `${citationsCount} publication${citationsCount > 1 ? 's' : ''}` : 'No citations found'}
                        pill
                    />
                    {/* WHY no citations? */}
                    {citationsCount === 0 && (
                        <WhyCallout
                            title="Why were no citations found?"
                            sentences={explainNoCitations(drugName)}
                            color="#f0f4ff"
                            borderColor="#bfdbfe"
                            textColor="#1e40af"
                        />
                    )}

                    {drug.confidence != null && (
                        <InfoRow
                            icon={<Shield size={20} color="#6366f1" />}
                            label="Confidence"
                            value={pct(drug.confidence)}
                            pill
                            secondary="How certain the scoring engine is about this match, given available data."
                        />
                    )}

                    {/* Evidence gate */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                        {meetsGate ? (
                            <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                        ) : (
                            <Cancel sx={{ fontSize: 20, color: 'text.disabled' }} />
                        )}
                        <Box>
                            <Typography variant="caption" sx={{
                                color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem',
                                textTransform: 'uppercase', letterSpacing: 0.5,
                            }}>
                                Evidence Gate
                            </Typography>
                            <Chip
                                label={meetsGate ? 'Passed' : 'Not met'}
                                size="small"
                                sx={{
                                    fontWeight: 700, fontSize: '0.8rem', height: 26, ml: 0,
                                    bgcolor: meetsGate ? '#dcfce7' : '#f1f5f9',
                                    color: meetsGate ? '#166534' : '#475569',
                                    display: 'block', mt: 0.5, width: 'fit-content',
                                }}
                            />
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.85rem' }}>
                                {meetsGate
                                    ? 'Sufficient published evidence exists to pass the evidence threshold.'
                                    : 'Insufficient published evidence — this is an exploratory candidate.'}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                {/* ClinVar */}
                {(clinvar.classification || clinvar.review_status) && (
                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box
                            onClick={() => setShowClinVar(x => !x)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', py: 1 }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                🏥 ClinVar Data
                            </Typography>
                            {showClinVar ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                        </Box>
                        <Collapse in={showClinVar}>
                            <Box sx={{ pl: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {clinvar.classification && (
                                    <Chip label={`Classification: ${clinvar.classification}`} sx={{ fontWeight: 600 }} />
                                )}
                                {clinvar.review_status && (
                                    <Chip label={`Review: ${clinvar.review_status}`} sx={{ fontWeight: 600 }} />
                                )}
                                {clinvar.prior != null && (
                                    <Chip label={`Prior: ${clinvar.prior}`} sx={{ fontWeight: 600 }} />
                                )}
                            </Box>
                        </Collapse>
                    </Grid>
                )}

                {/* PubMed Citations */}
                {citations.length > 0 && (
                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>
                            📚 PubMed References
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {citations.map((citation, idx) => (
                                <Chip
                                    key={citation.pmid || idx}
                                    label={`PMID:${citation.pmid}`}
                                    size="small"
                                    component="a"
                                    href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}`}
                                    target="_blank"
                                    clickable
                                    icon={<OpenInNew sx={{ fontSize: 12 }} />}
                                    sx={{ fontWeight: 600, transition: 'all 0.15s', '&:hover': { bgcolor: '#dbeafe' } }}
                                />
                            ))}
                        </Box>
                    </Grid>
                )}

                {/* Provenance: How we computed this */}
                <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{
                        p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider',
                    }}>
                        <Typography variant="caption" sx={{
                            fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase',
                            letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 1,
                        }}>
                            Evidence Provenance
                        </Typography>

                        {manifest.pubmed_query && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                                <Info sx={{ fontSize: 14, color: '#94a3b8', mt: 0.3 }} />
                                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>
                                    <strong>PubMed search:</strong> "{manifest.pubmed_query}"
                                </Typography>
                            </Box>
                        )}

                        {manifest.sources_checked && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                                <Info sx={{ fontSize: 14, color: '#94a3b8', mt: 0.3 }} />
                                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>
                                    <strong>Sources checked:</strong> {Array.isArray(manifest.sources_checked) ? manifest.sources_checked.join(', ') : manifest.sources_checked}
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Info sx={{ fontSize: 14, color: '#94a3b8', mt: 0.3 }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5 }}>
                                {drug.sporadic_gates_provenance?.engine || 'therapy_fit'} · {drug.data_level || 'L1'} scoring
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
