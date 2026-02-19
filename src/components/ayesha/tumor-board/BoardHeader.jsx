
import React, { useMemo, useState } from 'react';
import { Box, Typography, Chip, Paper, Button, Dialog, DialogTitle, DialogContent, Divider } from '@mui/material';

function prettyJson(obj) {
    try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
}

export default function BoardHeader({ metadata, isPreview, rawBundle, title }) {
    const { patient_id, generated_at, contract_version, requested_levels, run_id, efficacy_mode } = metadata || {};
    const [open, setOpen] = useState(false);

    const fmtIso = (v) => {
        if (!v) return '—';
        try {
            return new Date(String(v)).toLocaleString();
        } catch {
            return String(v);
        }
    };

    const rawText = useMemo(() => prettyJson(rawBundle), [rawBundle]);

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background decoration */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 200,
                        height: 200,
                        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                                {/* Override title prop or default to Zeta Strategy Board */}
                                {title || "Zeta Strategy Board"}
                            </Typography>
                            <Chip
                                label="Research Use Only"
                                size="small"
                                sx={{
                                    bgcolor: '#f1f5f9',
                                    color: '#64748b',
                                    border: '1px solid #e2e8f0',
                                    height: 24,
                                    fontWeight: 600,
                                }}
                            />
                            {isPreview && (
                                <Chip
                                    label="Preview Mode"
                                    size="small"
                                    sx={{
                                        bgcolor: '#fef3c7',
                                        color: '#92400e',
                                        border: '1px solid #fde68a',
                                        height: 24,
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <span>
                                Patient: <strong style={{ color: '#0f172a' }}>{patient_id || '—'}</strong>
                            </span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span>
                                Generated: <strong style={{ color: '#0f172a' }}>{fmtIso(generated_at)}</strong>
                            </span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span>
                                Contract: <strong style={{ color: '#0f172a' }}>{contract_version || '—'}</strong>
                            </span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span>
                                Run ID: <strong style={{ color: '#0f172a' }}>{run_id || '—'}</strong>
                            </span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span>
                                Mode: <strong style={{ color: '#0f172a' }}>{efficacy_mode || '—'}</strong>
                            </span>
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                            Requested Levels
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            {(requested_levels || []).length > 0 ? (
                                requested_levels.map(l => (
                                    <Chip
                                        key={l}
                                        label={l}
                                        size="small"
                                        sx={{
                                            bgcolor: '#eef2ff',
                                            color: '#4f46e5',
                                            border: '1px solid #c7d2fe',
                                            height: 20,
                                            fontSize: '0.7rem',
                                            fontWeight: 700
                                        }}
                                    />
                                ))
                            ) : (
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>—</Typography>
                            )}
                        </Box>

                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setOpen(true)}
                            sx={{
                                mt: 1.5,
                                color: '#475569',
                                borderColor: '#cbd5e1',
                                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            Show raw bundle JSON
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 900 }}>
                    Raw bundle JSON (verbatim)
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        This is the exact payload returned by the backend for the currently displayed run.
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box component="pre" sx={{ m: 0, p: 2, bgcolor: '#0b1220', color: '#e2e8f0', borderRadius: 2, overflow: 'auto', maxHeight: 520 }}>
                        {rawText}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}
