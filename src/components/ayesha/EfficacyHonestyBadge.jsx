/**
 * EfficacyHonestyBadge — Shared honesty disclosure badge for drug efficacy scores
 * =================================================================================
 * Renders a compact disclosure badge when the backend used heuristic scoring
 * instead of a full sequence-engine run. Designed to be placed inline next to
 * drug efficacy scores or section headers.
 *
 * FE-AK-003 (2026-05-10): Created as shared component to replace inline
 *   HeuristicScoringBadge duplicates in AyeshaTherapyFit.jsx and
 *   AyeshaWeaponCompatibility.jsx.
 *
 * Props:
 *   honesty  - object from bundle.levels.L1.efficacy.honesty:
 *              { heuristic_sequence_used: bool,
 *                sequence_engine: string,
 *                evidence_status: string,
 *                allow_heuristic_was_set: bool,
 *                drug_count: number,
 *                ruo_disclaimer: string }
 *   size     - 'small' (default) | 'medium'
 *   sx       - MUI sx prop passthrough for positioning
 *
 * Renders nothing when:
 *   - honesty is null/undefined
 *   - honesty.heuristic_sequence_used is false/undefined
 *
 * Research Use Only — Not for Clinical Decision Making
 */

import React, { useState } from 'react';
import {
    Chip,
    Tooltip,
    Box,
    Typography,
    Popover,
    Divider,
} from '@mui/material';
import {
    Science as ScienceIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const BADGE_STYLES = {
    heuristic: {
        bg: '#fef3c7',
        border: '#f59e0b',
        fg: '#92400e',
        chipBg: '#f59e0b',
        chipFg: '#fff',
        label: 'Heuristic score',
        icon: '⚗️',
    },
    sequence_engine: {
        bg: '#ecfdf5',
        border: '#10b981',
        fg: '#065f46',
        chipBg: '#10b981',
        chipFg: '#fff',
        label: 'Sequence-engine score',
        icon: '🔬',
    },
};

// ============================================================================
// POPOVER DETAIL PANEL
// ============================================================================
function HonestyDetailPopover({ honesty, anchorEl, onClose }) {
    const open = Boolean(anchorEl);
    if (!honesty) return null;

    const isHeuristic = !!honesty.heuristic_sequence_used;
    const style = isHeuristic ? BADGE_STYLES.heuristic : BADGE_STYLES.sequence_engine;

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
                sx: {
                    p: 2,
                    maxWidth: 340,
                    border: `1px solid ${style.border}`,
                    borderRadius: '8px',
                    background: style.bg,
                }
            }}
        >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: style.fg, mb: 0.5 }}>
                {style.icon} Scoring Method
            </Typography>
            <Divider sx={{ mb: 1, borderColor: style.border }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {honesty.sequence_engine && (
                    <Box>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Engine
                        </Typography>
                        <Typography variant="body2" sx={{ color: style.fg, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {honesty.sequence_engine}
                        </Typography>
                    </Box>
                )}

                {honesty.evidence_status && (
                    <Box>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Evidence Status
                        </Typography>
                        <Typography variant="body2" sx={{ color: style.fg }}>
                            {honesty.evidence_status}
                        </Typography>
                    </Box>
                )}

                {honesty.drug_count != null && (
                    <Box>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Drugs Scored
                        </Typography>
                        <Typography variant="body2" sx={{ color: style.fg }}>
                            {honesty.drug_count}
                        </Typography>
                    </Box>
                )}

                {isHeuristic && (
                    <Box sx={{ mt: 0.5, p: 1, background: 'rgba(245,158,11,0.1)', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <Typography variant="caption" sx={{ color: '#92400e', lineHeight: 1.4 }}>
                            Heuristic scoring uses evidence-tier weights and biomarker alignment
                            instead of a full sequence-engine run. Scores are directionally
                            correct but less precise than sequence-engine output.
                        </Typography>
                    </Box>
                )}

                {honesty.ruo_disclaimer && (
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontStyle: 'italic', mt: 0.5 }}>
                        {honesty.ruo_disclaimer}
                    </Typography>
                )}
            </Box>
        </Popover>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
/**
 * EfficacyHonestyBadge
 *
 * Usage:
 *   <EfficacyHonestyBadge honesty={bundle?.levels?.L1?.efficacy?.honesty} />
 */
export default function EfficacyHonestyBadge({ honesty, size = 'small', sx = {} }) {
    const [anchorEl, setAnchorEl] = useState(null);

    // Render nothing if no honesty data or heuristic not active
    if (!honesty?.heuristic_sequence_used) return null;

    const style = BADGE_STYLES.heuristic;

    const handleClick = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <Tooltip
                title="Efficacy scores computed via heuristic method — click for details"
                placement="top"
                arrow
            >
                <Chip
                    icon={<ScienceIcon sx={{ fontSize: size === 'small' ? '0.85rem' : '1rem', color: `${style.chipFg} !important` }} />}
                    label={style.label}
                    size={size}
                    onClick={handleClick}
                    sx={{
                        bgcolor: style.chipBg,
                        color: style.chipFg,
                        fontWeight: 600,
                        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
                        height: size === 'small' ? '22px' : '28px',
                        cursor: 'pointer',
                        border: `1px solid ${style.border}`,
                        '& .MuiChip-label': { px: 1 },
                        '&:hover': { bgcolor: '#d97706', transform: 'scale(1.02)' },
                        transition: 'all 0.15s ease',
                        ...sx,
                    }}
                    deleteIcon={<InfoIcon sx={{ fontSize: '0.75rem !important', color: `${style.chipFg} !important` }} />}
                    onDelete={handleClick}
                />
            </Tooltip>

            <HonestyDetailPopover
                honesty={honesty}
                anchorEl={anchorEl}
                onClose={handleClose}
            />
        </>
    );
}
