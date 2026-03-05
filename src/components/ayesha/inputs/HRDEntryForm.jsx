/**
 * HRDEntryForm — Enter HRD score + assay details
 * Unlocks L2 (DDR/PARP mechanism axis)
 *
 * Props:
 *   onSave({hrd_score, hrd_status, assay, lab, date}) → void
 *   currentValue — existing hrd_score if any (shown as pre-fill hint)
 */
import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Chip, Alert,
    Stack, Select, MenuItem, FormControl, InputLabel, Divider,
} from '@mui/material';
import { Dna, Info } from 'lucide-react';

const HRD_ASSAYS = [
    'Myriad myChoice CDx',
    'FoundationOne CDx (LOH)',
    'Tempus xT (HRD)',
    'Guardant360 CDx',
    'Custom / Research',
    'Not specified',
];

export default function HRDEntryForm({ onSave, onCancel, currentValue }) {
    const [score, setScore] = useState('');
    const [assay, setAssay] = useState('Not specified');
    const [lab, setLab] = useState('');
    const [date, setDate] = useState('');
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    // HRD status is derived from the score (≥42 is generally HIGH — myChoice cutoff)
    const derivedStatus = () => {
        const v = Number(score);
        if (!Number.isFinite(v)) return null;
        return v >= 42 ? 'HIGH' : 'LOW';
    };

    const validate = () => {
        const v = Number(score);
        if (!score.trim() || !Number.isFinite(v) || v < 0)
            return 'Enter a numeric HRD score (e.g. 42.5).';
        if (v > 200)
            return 'HRD scores are typically 0–100. Check your value.';
        return null;
    };

    const handleSave = () => {
        const err = validate();
        if (err) { setError(err); return; }
        setError(null);

        const status = derivedStatus();
        onSave?.({
            hrd_score: Number(score),
            hrd_status: status,
            assay: assay !== 'Not specified' ? assay : undefined,
            lab: lab.trim() || undefined,
            date: date.trim() || undefined,
        });

        setScore(''); setLab(''); setDate('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const s = derivedStatus();

    return (
        <Box>
            {/* Context: what this unlocks */}
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', mb: 2 }}>
                <Stack direction="row" gap={1} alignItems="flex-start">
                    <Dna size={14} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#a5b4fc', lineHeight: 1.6 }}>
                        HRD score unlocks <strong>DDR/PARP mechanism axis</strong> (L2).
                        Recommended cutoff: ≥42 (Myriad myChoice) = HRD-HIGH.
                        The backend will use this to improve PARP inhibitor and platinum confidence.
                    </Typography>
                </Stack>
            </Box>

            {currentValue != null && (
                <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                    Current value on record: <strong>{currentValue}</strong>. Entering a new score will override it.
                </Alert>
            )}

            <Stack gap={2}>
                {/* Score + derived status */}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems="flex-start">
                    <TextField
                        label="HRD score"
                        value={score}
                        onChange={e => setScore(e.target.value)}
                        type="number"
                        inputProps={{ min: 0, step: 0.1 }}
                        size="small"
                        sx={inputSx}
                        placeholder="e.g. 52.0"
                        fullWidth
                    />
                    {s && (
                        <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                            <Chip
                                label={`Derived: HRD-${s}`}
                                sx={{
                                    fontWeight: 700,
                                    bgcolor: s === 'HIGH' ? 'rgba(99,102,241,0.15)' : 'rgba(100,116,139,0.15)',
                                    color: s === 'HIGH' ? '#818cf8' : '#94a3b8',
                                    border: `1px solid ${s === 'HIGH' ? 'rgba(99,102,241,0.3)' : 'rgba(100,116,139,0.2)'}`,
                                }}
                            />
                        </Box>
                    )}
                </Stack>

                {/* Assay */}
                <FormControl size="small" fullWidth sx={inputSx}>
                    <InputLabel sx={{ color: '#64748b' }}>Assay</InputLabel>
                    <Select
                        value={assay}
                        onChange={e => setAssay(e.target.value)}
                        label="Assay"
                        sx={{ color: '#e2e8f0', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' } }}
                    >
                        {HRD_ASSAYS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </Select>
                </FormControl>

                {/* Lab + Date */}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
                    <TextField
                        label="Lab (optional)"
                        value={lab}
                        onChange={e => setLab(e.target.value)}
                        size="small"
                        fullWidth
                        sx={inputSx}
                        placeholder="e.g. Foundation Medicine"
                    />
                    <TextField
                        label="Report date (optional)"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        fullWidth
                        sx={inputSx}
                    />
                </Stack>

                {error && <Alert severity="warning" sx={{ py: 0.5 }}>{error}</Alert>}
                {saved && <Alert severity="success" sx={{ py: 0.5 }}>HRD score saved — analysis will use it on next run.</Alert>}

                <Stack direction="row" gap={1}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSave}
                        sx={{ bgcolor: '#6366f1', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#4f46e5' } }}
                    >
                        Save HRD score
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
        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
    },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputBase-input': { color: '#e2e8f0' },
    '& .MuiSelect-icon': { color: '#64748b' },
};
