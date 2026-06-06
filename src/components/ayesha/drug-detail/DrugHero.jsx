/**
 * DrugHero — Hero section (score ring extracted to sidebar).
 *
 * Shows drug name, tier/band callout, MOA chip, RUO reasons with
 * "Why?" tooltips, and all badges.
 */
import React from 'react';
import {
    Box, Typography, Paper, Chip, Tooltip,
} from '@mui/material';
import { Info } from '@mui/icons-material';
import { explainClinicalBand, explainRuoReason, tierColor } from './explainers';

export default function DrugHero({ drug, rank, totalDrugs }) {
    const band = drug.clinical_band || '';
    const bandInfo = explainClinicalBand(band);
    const effectiveTier = drug.evidence_tier || drug.tier;
    const tc = tierColor(effectiveTier);
    const ruo = drug.ruo_reasons || [];
    const moaLabel = drug.moa_category || drug.moa || '';

    return (
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            {/* Rank context */}
            {rank != null && totalDrugs != null && (
                <Chip
                    label={`#${rank} of ${totalDrugs} evaluated`}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.75rem', mb: 1.5, bgcolor: '#dbeafe', color: '#1e40af' }}
                />
            )}

            {/* Drug name */}
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                {drug.name || drug.drug_name}
            </Typography>

            {/* Badge row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {effectiveTier && (
                    <Chip label={effectiveTier} size="small" sx={{ fontWeight: 800, bgcolor: tc.bg, color: tc.fg }} />
                )}
                {band && bandInfo && (
                    <Tooltip title={bandInfo.long} arrow>
                        <Chip label={`${band.charAt(0)} — ${bandInfo.short}`} size="small"
                            sx={{ fontWeight: 700, cursor: 'help' }} />
                    </Tooltip>
                )}
                {moaLabel && (
                    <Chip label={moaLabel} size="small" icon={<Box component="span" sx={{ fontSize: '0.8rem' }}>⚗️</Box>}
                        sx={{ fontWeight: 600 }} />
                )}
                {(drug.badges || []).map(b => (
                    <Chip key={b} label={b} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                ))}
            </Box>

            {/* Clinical Band callout */}
            {bandInfo && (
                <Box sx={{
                    p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', mb: 2,
                }}>
                    <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.7 }}>
                        {bandInfo.long}
                    </Typography>
                </Box>
            )}

            {/* RUO Reasons — informative, not alarming */}
            {ruo.length > 0 && (
                <Box sx={{
                    p: 2.5, borderRadius: 2.5,
                    bgcolor: '#f0f4ff',
                    border: '1.5px solid #c7d7f4',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                        <Info sx={{ fontSize: 20, color: '#3b5bdb', mt: 0.15 }} />
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.95rem', lineHeight: 1.3 }}>
                                Why this drug is shown as Research Use Only
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#3b5bdb', fontSize: '0.82rem', mt: 0.4, lineHeight: 1.5 }}>
                                RUO is our system&apos;s default for any drug not yet manually curated for this exact cancer + mutation pairing.
                                It is a transparency label — not a statement about the drug&apos;s effectiveness.
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 0.5 }}>
                        {ruo.map((reason, i) => {
                            const info = explainRuoReason(reason);
                            return (
                                <Box key={i} sx={{
                                    p: 1.5, borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.65)',
                                    border: '1px solid #c7d7f4',
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.88rem' }}>
                                        {info.text}
                                    </Typography>
                                    {info.why && (
                                        <Typography variant="body2" sx={{ color: '#334155', mt: 0.3, fontSize: '0.82rem', lineHeight: 1.55 }}>
                                            {info.why}
                                        </Typography>
                                    )}
                                    {info.note && (
                                        <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, fontSize: '0.78rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                                            💡 {info.note}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Paper>
    );
}


