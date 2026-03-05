/**
 * BiologySignalCards — Three-panel signal cards for test detail pages.
 * Cloned from SignalCards, adapted for clinicalTestRegistry schema.
 *
 * Renders:
 *   Green  — "What It Captures" (what_it_captures[])
 *   Orange — "Resistance Tracked" (resistance_tracked[])
 *   Blue   — "IO Engine Signals" (io_signals{})
 *
 * Props:
 *   entry      — A clinicalTestRegistry entry object
 *   cancerType — Optional cancer type for domain-specific context
 */
import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import {
    CheckCircleOutline,
    ShieldOutlined,
    BubbleChart,
} from '@mui/icons-material';

const CARD_CONFIGS = [
    {
        key: 'captures',
        label: 'What It Captures',
        color: '#16a34a',
        bgColor: '#f0fdf4',
        borderColor: '#bbf7d0',
        Icon: CheckCircleOutline,
        getItems: (entry) => entry.what_it_captures || [],
    },
    {
        key: 'resistance',
        label: 'Resistance Tracked',
        color: '#ea580c',
        bgColor: '#fff7ed',
        borderColor: '#fed7aa',
        Icon: ShieldOutlined,
        getItems: (entry) => entry.resistance_tracked || [],
    },
];

function SignalItem({ item, color }) {
    return (
        <Box sx={{
            p: 2, borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.7)',
            border: '1px solid',
            borderColor: 'divider',
        }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color, fontSize: '0.92rem', mb: 0.5 }}>
                {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {item.description}
            </Typography>
        </Box>
    );
}

function IOSignalCard({ entry, cancerType }) {
    const io = entry.io_signals;
    if (!io) return null;

    const hasAnySignal = io.unlocks_profile_card || io.unlocks_domain_boost;
    if (!hasAnySignal && !io.domain_context) return null;

    const domainMsg = cancerType && io.domain_context?.[cancerType.toLowerCase()];

    return (
        <Paper sx={{
            p: 2.5, borderRadius: 2.5,
            bgcolor: '#eff6ff',
            border: '1.5px solid #bfdbfe',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <BubbleChart sx={{ color: '#2563eb', fontSize: 22 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', fontSize: '0.92rem' }}>
                    IO Engine Signals
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: domainMsg ? 1.5 : 0 }}>
                {io.unlocks_profile_card && (
                    <Chip label="Unlocks IO Profile Card" size="small"
                        sx={{ fontWeight: 700, bgcolor: '#dbeafe', color: '#1d4ed8' }} />
                )}
                {io.unlocks_domain_boost && (
                    <Chip label="Unlocks Domain Boost" size="small"
                        sx={{ fontWeight: 700, bgcolor: '#dbeafe', color: '#1d4ed8' }} />
                )}
                {!hasAnySignal && (
                    <Chip label="No IO signals" size="small" variant="outlined"
                        sx={{ fontWeight: 600, color: '#64748b' }} />
                )}
            </Box>

            {domainMsg && (
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.6)', border: '1px solid #bfdbfe' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.55 }}>
                        <strong>{cancerType}:</strong> {domainMsg}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}

export default function BiologySignalCards({ entry, cancerType }) {
    if (!entry) return null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {CARD_CONFIGS.map(({ key, label, color, bgColor, borderColor, Icon, getItems }) => {
                const items = getItems(entry);
                if (items.length === 0) return null;
                return (
                    <Paper key={key} sx={{
                        p: 2.5, borderRadius: 2.5,
                        bgcolor: bgColor,
                        border: `1.5px solid ${borderColor}`,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Icon sx={{ color, fontSize: 22 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color, fontSize: '0.92rem' }}>
                                {label}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {items.map((item, i) => (
                                <SignalItem key={i} item={item} color={color} />
                            ))}
                        </Box>
                    </Paper>
                );
            })}

            <IOSignalCard entry={entry} cancerType={cancerType} />
        </Box>
    );
}
