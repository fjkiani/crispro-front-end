/**
 * CtDNAEntryForm — Enter ctDNA / MRD test results
 * Unlocks: MRD status, BRCA reversion alert, clonal evolution flag
 *
 * Props:
 *   onSave({ ctdna_detected, vaf_percent, draw_date, assay }) → void
 *   currentDetected — existing boolean if any
 */
import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Chip, Alert,
    Stack, Select, MenuItem, FormControl, InputLabel,
    FormControlLabel, Switch,
} from '@mui/material';
import { Droplet, Info } from 'lucide-react';

const CTDNA_ASSAYS = [
    'Signatera (Natera)',
    'Guardant360 CDx',
    'FoundationOne Liquid CDx',
    'Tempus xF',
    'Custom / Research Panel',
    'Not specified',
];

export default function CtDNAEntryForm({ onSave, onCancel, currentDetected }) {
    const [detected, setDetected] = useState(false);
    const [vaf, setVaf] = useState('');
    const [assay, setAssay] = useState('Not specified');
    const [drawDate, setDrawDate] = useState('');
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    const validate = () => {
        if (detected && vaf.trim()) {
            const v = Number(vaf);
            if (!Number.isFinite(v) || v < 0 || v > 100) {
                return 'VAF must be between 0% and 100%.';
            }
        }
        return null;
    };

    const handleSave = () => {
        const err = validate();
        if (err) { setError(err); return; }
        setError(null);

        onSave?.({
            ctdna_detected: detected,
            vaf_percent: detected && vaf.trim() ? Number(vaf) : undefined,
            draw_date: drawDate.trim() || undefined,
            assay: assay !== 'Not specified' ? assay : undefined,
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <Box>
            {/* Context */}
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', mb: 2 }}>
                <Stack direction="row" gap={1} alignItems="flex-start">
                    <Droplet size={14} color="#60a5fa" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                        ctDNA detects <strong>molecular residual disease</strong> before clinical progression.
                        Clearance by cycle 3 = favorable prognosis. Rising ctDNA = clonal evolution alert.
                    </Typography>
                </Stack>
            </Box>

            {currentDetected != null && (
                <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                    Current value: <strong>{currentDetected ? 'Detected (MRD+)' : 'Not Detected (MRD−)'}</strong>
                </Alert>
            )}

            <Stack gap={2}>
                {/* Detection toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={detected}
                                onChange={e => setDetected(e.target.checked)}
                                color={detected ? 'error' : 'success'}
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: detected ? '#ef4444' : '#22c55e' }}>
                                {detected ? 'ctDNA Detected (MRD+)' : 'ctDNA Not Detected (MRD−)'}
                            </Typography>
                        }
                    />
                    <Chip
                        label={detected ? 'POSITIVE' : 'NEGATIVE'}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: detected ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                            color: detected ? '#ef4444' : '#22c55e',
                            border: `1px solid ${detected ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                        }}
                    />
                </Box>

                {/* VAF (only if detected) */}
                {detected && (
                    <TextField
                        label="Variant Allele Frequency (%)"
                        value={vaf}
                        onChange={e => setVaf(e.target.value)}
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                        size="small"
                        sx={inputSx}
                        placeholder="e.g. 2.5"
                        helperText="Tumor fraction percentage from liquid biopsy"
                        fullWidth
                    />
                )}

                {/* Assay */}
                <FormControl size="small" fullWidth sx={inputSx}>
                    <InputLabel sx={{ color: '#64748b' }}>Assay</InputLabel>
                    <Select
                        value={assay}
                        onChange={e => setAssay(e.target.value)}
                        label="Assay"
                        sx={{ color: '#e2e8f0', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' } }}
                    >
                        {CTDNA_ASSAYS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </Select>
                </FormControl>

                {/* Draw date */}
                <TextField
                    label="Draw date"
                    value={drawDate}
                    onChange={e => setDrawDate(e.target.value)}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    sx={inputSx}
                />

                {error && <Alert severity="warning" sx={{ py: 0.5 }}>{error}</Alert>}
                {saved && <Alert severity="success" sx={{ py: 0.5 }}>ctDNA result saved — resistance engine will use on next evaluation.</Alert>}

                <Stack direction="row" gap={1}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSave}
                        sx={{ bgcolor: '#3b82f6', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#2563eb' } }}
                    >
                        Save ctDNA Result
                    </Button>
                    {onCancel && (
                        <Button size="small" onClick={onCancel} sx={{ color: '#64748b', textTransform: 'none' }}>
                            Cancel
                        </Button>
                    )}
                </Stack>

                <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.6rem' }}>
                    ⚠️ Research Use Only. Stored locally. Not clinical guidance.
                </Typography>
            </Stack>
        </Box>
    );
}

const inputSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: 'rgba(255,255,255,0.03)',
        '& fieldset': { borderColor: '#334155' },
        '&:hover fieldset': { borderColor: '#64748b' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
    },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputBase-input': { color: '#e2e8f0' },
    '& .MuiSelect-icon': { color: '#64748b' },
};
