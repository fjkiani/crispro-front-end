/**
 * IOProfileSection — Renders IO Profile Card output.
 * Shows HOT/COLD/INTERMEDIATE classification per pathway.
 *
 * Only renders when the test entry has `unlocks_profile_card: true`
 * and IO profile data is available.
 *
 * Props:
 *   entry       — clinicalTestRegistry entry (checks io_signals.unlocks_profile_card)
 *   profileCard — Optional IO profile card result from profile_card.py
 *   cancerType  — Optional cancer type for domain context
 */
import React from 'react';
import { Box, Typography, Paper, Chip, LinearProgress } from '@mui/material';
import { Thermostat, Warning } from '@mui/icons-material';

const CLASSIFICATION_COLORS = {
    HOT: { bg: '#fef2f2', fg: '#991b1b', border: '#fecaca', emoji: '🔥' },
    COLD: { bg: '#eff6ff', fg: '#1e40af', border: '#bfdbfe', emoji: '❄️' },
    INTERMEDIATE: { bg: '#fffbeb', fg: '#92400e', border: '#fde68a', emoji: '⚡' },
};

function PathwayRow({ name, score, classification, percentile }) {
    const cls = CLASSIFICATION_COLORS[classification] || CLASSIFICATION_COLORS.INTERMEDIATE;

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.5, borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.6)',
            border: '1px solid',
            borderColor: 'divider',
        }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                    {name}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={Math.min((percentile || 0) * 100, 100)}
                    sx={{
                        mt: 0.5, height: 6, borderRadius: 3,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': { bgcolor: cls.fg, borderRadius: 3 },
                    }}
                />
            </Box>
            <Chip
                label={`${cls.emoji} ${classification}`}
                size="small"
                sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    bgcolor: cls.bg,
                    color: cls.fg,
                    border: `1.5px solid ${cls.border}`,
                    minWidth: 100,
                }}
            />
            {percentile != null && (
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, minWidth: 45, textAlign: 'right' }}>
                    p{Math.round(percentile * 100)}
                </Typography>
            )}
        </Box>
    );
}

export default function IOProfileSection({ entry, profileCard, cancerType }) {
    if (!entry?.io_signals?.unlocks_profile_card) return null;

    // No profile data yet — show placeholder
    if (!profileCard) {
        return (
            <Paper sx={{
                p: 2.5, borderRadius: 2.5,
                bgcolor: '#fafafa',
                border: '1.5px dashed #d1d5db',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Thermostat sx={{ color: '#94a3b8', fontSize: 22 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.92rem' }}>
                        IO Profile Card
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    RNA expression data not yet available. Submit expression profiling to generate IO pathway classification.
                </Typography>
            </Paper>
        );
    }

    const pathways = profileCard.pathways || [];
    const overallClassification = profileCard.overall_classification || 'INTERMEDIATE';
    const overallColor = CLASSIFICATION_COLORS[overallClassification] || CLASSIFICATION_COLORS.INTERMEDIATE;

    return (
        <Paper sx={{
            p: 2.5, borderRadius: 2.5,
            border: `1.5px solid ${overallColor.border}`,
            bgcolor: overallColor.bg,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Thermostat sx={{ color: overallColor.fg, fontSize: 22 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: overallColor.fg, fontSize: '0.92rem' }}>
                        IO Profile Card
                    </Typography>
                </Box>
                <Chip
                    label={`${overallColor.emoji} ${overallClassification}`}
                    size="small"
                    sx={{
                        fontWeight: 800,
                        bgcolor: overallColor.fg + '18',
                        color: overallColor.fg,
                        border: `2px solid ${overallColor.fg}`,
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {pathways.map((pw, i) => (
                    <PathwayRow
                        key={i}
                        name={pw.name}
                        score={pw.score}
                        classification={pw.classification}
                        percentile={pw.percentile}
                    />
                ))}
            </Box>

            {/* Domain context */}
            {cancerType && entry.io_signals?.domain_context?.[cancerType.toLowerCase()] && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.5)', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.55 }}>
                        <strong>{cancerType}:</strong> {entry.io_signals.domain_context[cancerType.toLowerCase()]}
                    </Typography>
                </Box>
            )}

            {/* RUO */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                <Warning sx={{ fontSize: 14, color: '#f59e0b', mt: 0.2 }} />
                <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.72rem', lineHeight: 1.4 }}>
                    RUO: IO pathway predictions based on retrospective analysis (n=105 melanoma). Not validated for clinical decision-making.
                </Typography>
            </Box>
        </Paper>
    );
}
