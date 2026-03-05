/**
 * PageContextSection — "Understanding This Page"
 *
 * Apple-philosophy context module. Translates engineering architecture
 * into plain language for patients and their families.
 *
 * Design principle: Every section on this page is a building block.
 * Like apps on a phone — each does one thing well, and they compose
 * together to form a complete picture. When new science arrives,
 * we add a block. Nothing breaks.
 *
 * Props:
 *   entry     — clinicalTestRegistry entry (determines which sections are visible)
 *   sections  — Array of { key, visible, title, plain, technical }
 */
import React, { useState } from 'react';
import { Box, Typography, Paper, Collapse, Chip, Divider } from '@mui/material';
import {
    HelpOutline, ExpandMore, ExpandLess,
    AutoAwesome, Extension, Visibility, Shield,
} from '@mui/icons-material';

// ── Section descriptions in PLAIN LANGUAGE ────────────────────────────────────
// Written as if explaining to a smart person who's never seen this system.

function getSections(entry) {
    const sections = [
        {
            key: 'hero',
            visible: true,
            icon: '🎯',
            title: 'At a Glance',
            plain: 'The top card summarizes this test, its priority, and verification status.',
            technical: 'Validation status from clinicalTestRegistry. Priority by clinical relevance.',
        },
        {
            key: 'signals',
            visible: (entry?.what_it_captures?.length > 0 || entry?.resistance_tracked?.length > 0),
            icon: '🔬',
            title: 'What This Test Measures',
            plain: 'Green cards = what it detects. Orange cards = resistance patterns it catches early.',
            technical: 'Mapped to Kill Chain signals. Each feeds specific 7D vector axes.',
        },
        {
            key: 'axis_map',
            visible: (entry?.kill_chain_axes?.length > 0),
            icon: '🧭',
            title: 'Treatment Connections',
            plain: 'Cancer resists through multiple pathways. This map shows which ones this test monitors — highlighted = early warning active.',
            technical: '7 axes from vectors.py: DDR, MAPK, PI3K, VEGF, HER2, IO, Efflux.',
        },
        {
            key: 'io',
            visible: !!entry?.io_signals?.unlocks_profile_card,
            icon: '🌡️',
            title: 'Immune System Profile',
            plain: 'Shows if the immune system is "hot" (fighting), "cold" (not engaged), or in between. Immunotherapy works best with existing immune activity.',
            technical: 'IO profile card from profile_card.py. HOT/COLD/INTERMEDIATE per validated thresholds.',
        },
        {
            key: 'kelim',
            visible: !!entry?.kelim,
            icon: '📉',
            title: 'CA-125 Speed Tracking',
            plain: 'Measures how fast CA-125 changes, not just the number. Speed of change is more telling.',
            technical: 'KELIM engine. Genotype-stratified from Oza et al. JCO 2022.',
        },
        {
            key: 'monitoring',
            visible: entry?.type === 'monitoring',
            icon: '📊',
            title: 'Trend & Alert System',
            plain: 'Tracks patterns over time with automatic alert thresholds.',
            technical: 'Static thresholds from clinicalTestRegistry. Future: dynamic from longitudinal data.',
        },
        {
            key: 'provenance',
            visible: !!entry?.validation,
            icon: '📎',
            title: 'Sources & Verification',
            plain: 'Every claim links to published research (PMIDs), datasets, and accuracy metrics. Optimistic and honest numbers both shown.',
            technical: 'Apparent AUC, Bootstrap-corrected, Nested CV AUC. Permutation p-value.',
        },
    ];

    return sections.filter(s => s.visible);
}

// ── Architecture Philosophy (for developers/oncologists) ─────────────────────

const ARCHITECTURE_PRINCIPLES = [
    {
        icon: <Extension sx={{ fontSize: 20 }} />,
        title: 'Modular by Design',
        description: 'Each section is independent. New research = new block. Like LEGO, not concrete.',
    },
    {
        icon: <Shield sx={{ fontSize: 20 }} />,
        title: 'No Hidden Assumptions',
        description: 'Missing data shows as missing. No placeholders, no AI filler.',
    },
    {
        icon: <Visibility sx={{ fontSize: 20 }} />,
        title: 'Source-Linked',
        description: 'Every metric traces to a PMID, dataset, and computation date.',
    },
    {
        icon: <AutoAwesome sx={{ fontSize: 20 }} />,
        title: 'Honest by Default',
        description: 'Overfit AND corrected numbers shown. Small studies flagged as estimates.',
    },
];

export default function PageContextSection({ entry }) {
    const [expanded, setExpanded] = useState(false);
    const [showTechnical, setShowTechnical] = useState(false);
    const sections = getSections(entry);

    if (!entry) return null;

    return (
        <Paper sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: expanded ? '#bfdbfe' : 'divider',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            ...(expanded && {
                bgcolor: '#fafcff',
                boxShadow: '0 4px 24px rgba(37, 99, 235, 0.06)',
            }),
        }}>
            {/* Collapsed header — always visible */}
            <Box
                onClick={() => setExpanded(!expanded)}
                sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc' },
                    transition: 'background-color 0.2s ease',
                }}
            >
                <HelpOutline sx={{ fontSize: 24, color: '#2563eb' }} />
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>
                        Understanding This Page
                    </Typography>
                    <Typography sx={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        What each section means — in plain language
                    </Typography>
                </Box>
                <Chip
                    label={`${sections.length} sections`}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: 'var(--text-xs)', bgcolor: '#dbeafe', color: '#1d4ed8' }}
                />
                {expanded ? (
                    <ExpandLess sx={{ color: 'var(--text-muted)' }} />
                ) : (
                    <ExpandMore sx={{ color: 'var(--text-muted)' }} />
                )}
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ px: 2.5, pb: 3 }}>
                    {/* Philosophy toggle */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                        <Chip
                            label="Patients & Families"
                            size="small"
                            onClick={() => setShowTechnical(false)}
                            sx={{
                                fontWeight: 700,
                                fontSize: 'var(--text-xs)',
                                bgcolor: !showTechnical ? '#1d4ed8' : '#f1f5f9',
                                color: !showTechnical ? '#fff' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.9 },
                            }}
                        />
                        <Chip
                            label="Clinicians & Developers"
                            size="small"
                            onClick={() => setShowTechnical(true)}
                            sx={{
                                fontWeight: 700,
                                fontSize: 'var(--text-xs)',
                                bgcolor: showTechnical ? '#1d4ed8' : '#f1f5f9',
                                color: showTechnical ? '#fff' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.9 },
                            }}
                        />
                    </Box>

                    {/* Section explanations — concise cards */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {sections.map((section) => (
                            <Box key={section.key} sx={{
                                p: 2, borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.7)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography component="span" sx={{ fontSize: '1.1rem' }}>
                                        {section.icon}
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                                        {section.title}
                                    </Typography>
                                </Box>
                                <Typography sx={{
                                    color: 'var(--text-secondary)',
                                    fontSize: 'var(--text-sm)',
                                    lineHeight: 1.7,
                                }}>
                                    {showTechnical ? section.technical : section.plain}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Architecture principles — clinician/dev mode only */}
                    {showTechnical && (
                        <>
                            <Divider sx={{ my: 2.5 }} />
                            <Typography sx={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--text-primary)', mb: 1.5 }}>
                                Architecture Philosophy
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
                                {ARCHITECTURE_PRINCIPLES.map((principle, i) => (
                                    <Box key={i} sx={{
                                        p: 2, borderRadius: 2,
                                        bgcolor: '#f0f9ff',
                                        border: '1px solid #bfdbfe',
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Box sx={{ color: '#2563eb' }}>{principle.icon}</Box>
                                            <Typography sx={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#1e3a8a' }}>
                                                {principle.title}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--text-sm)',
                                            lineHeight: 1.6,
                                        }}>
                                            {principle.description}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}

                    {/* Bottom note */}
                    <Box sx={{
                        mt: 2.5, p: 2, borderRadius: 2,
                        bgcolor: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        textAlign: 'center',
                    }}>
                        <Typography sx={{ color: 'var(--text-hint)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
                            Sections appear when relevant. Every number links to its source.
                        </Typography>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
}
