/**
 * CA125HistoryList — Displays saved CA-125 readings from localStorage
 * with trend indicator and delete capability
 *
 * Props:
 *   history: [{value, date, cycle?, note?}]
 *   onDelete(index) → void
 */
import React from 'react';
import {
    Box, Typography, Chip, IconButton, Stack, Tooltip,
} from '@mui/material';
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function trend(history) {
    if (!Array.isArray(history) || history.length < 2) return null;
    const sorted = [...history].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const first = Number(sorted[0]?.value) || 0;
    const last = Number(sorted[sorted.length - 1]?.value) || 0;
    const delta = last - first;
    const pct = first > 0 ? ((delta / first) * 100).toFixed(0) : null;
    return { delta, pct, direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat' };
}

export default function CA125HistoryList({ history = [], onDelete }) {
    const sorted = [...history].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const t = trend(history);

    if (sorted.length === 0) {
        return (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.15)', border: '1px solid #1e293b' }}>
                <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic' }}>
                    No readings yet. Add the first reading above.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Trend summary */}
            {t && sorted.length >= 2 && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5, p: 1, borderRadius: 1.5, bgcolor: 'rgba(0,0,0,0.1)', border: '1px solid #1e293b' }}>
                    {t.direction === 'up' && <TrendingUp size={14} color="#ef4444" />}
                    {t.direction === 'down' && <TrendingDown size={14} color="#4ade80" />}
                    {t.direction === 'flat' && <Minus size={14} color="#64748b" />}
                    <Typography variant="caption" sx={{ color: t.direction === 'up' ? '#f87171' : t.direction === 'down' ? '#4ade80' : '#94a3b8' }}>
                        {t.direction === 'up' ? '↑ Rising' : t.direction === 'down' ? '↓ Falling' : 'Stable'} —{' '}
                        {sorted[0].value.toLocaleString()} → {sorted[sorted.length - 1].value.toLocaleString()} U/mL
                        {t.pct !== null ? ` (${t.pct > 0 ? '+' : ''}${t.pct}%)` : ''}
                    </Typography>
                    <Chip
                        label={`${sorted.length} reading${sorted.length > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: sorted.length >= 3 ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)', color: sorted.length >= 3 ? '#4ade80' : '#fbbf24', ml: 'auto' }}
                    />
                </Box>
            )}

            {/* Reading rows */}
            <Stack gap={0.75}>
                {sorted.map((entry, i) => {
                    const originalIdx = history.findIndex(h => h.date === entry.date && h.value === entry.value);
                    const prevVal = i > 0 ? Number(sorted[i - 1]?.value) : null;
                    const currVal = Number(entry.value);
                    const delta = prevVal !== null ? currVal - prevVal : null;

                    return (
                        <Box
                            key={`${entry.date}-${i}`}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                p: 1, borderRadius: 1.5,
                                bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid #1e293b',
                            }}
                        >
                            {/* Value */}
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0', minWidth: 64, fontFamily: 'Roboto Mono, monospace' }}>
                                {currVal.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>U/mL</Typography>

                            {/* Delta arrow */}
                            {delta !== null && (
                                <Typography variant="caption" sx={{ color: delta > 0 ? '#f87171' : '#4ade80', fontWeight: 700, minWidth: 36 }}>
                                    {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                                </Typography>
                            )}

                            {/* Date */}
                            <Typography variant="caption" sx={{ color: '#64748b', flex: 1 }}>
                                {entry.date}
                                {entry.cycle ? ` · ${entry.cycle}` : ''}
                                {entry.note ? ` · ${entry.note}` : ''}
                            </Typography>

                            {/* Delete */}
                            {onDelete && (
                                <Tooltip title="Remove this reading">
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete(originalIdx)}
                                        sx={{ color: '#475569', '&:hover': { color: '#f87171' }, p: 0.5 }}
                                    >
                                        <Trash2 size={13} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    );
                })}
            </Stack>

            {sorted.length < 3 && (
                <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block', mt: 1, fontSize: '0.62rem' }}>
                    ⚡ {3 - sorted.length} more reading{3 - sorted.length > 1 ? 's' : ''} needed to activate Kill Chain monitor.
                </Typography>
            )}
        </Box>
    );
}
