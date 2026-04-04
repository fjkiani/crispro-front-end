/**
 * RepairCapacityEntryForm — Enter HR repair capacity measurement
 * Unlocks: repair_capacity_delta, kc_ddr, hr_restoration_flag
 *
 * Props:
 *   onSave({ repair_score, assay_method, date }) → void
 *   previousScore — previous repair capacity score for delta computation
 */
import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Chip, Alert,
    Stack, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Wrench, Info } from 'lucide-react';

const ASSAY_METHODS = [
    'RAD51 Foci Assay',
    'BRCA1 Foci Formation',
    'Functional HR Assay (ex vivo)',
    'Research / Custom',
    'Not specified',
];

export default function RepairCapacityEntryForm({ onSave, onCancel, previousScore }) {
    const [score, setScore] = useState('');
    const [method, setMethod] = useState('Not specified');
    const [date, setDate] = useState('');
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    const numScore = Number(score);
    const validScore = score.trim() && Number.isFinite(numScore) && numScore >= 0 && numScore <= 1;
    const delta = validScore && previousScore != null ? (numScore - previousScore).toFixed(3) : null;
    const deltaAlert = delta && Math.abs(Number(delta)) > 0.2;

    const validate = () => {
        if (!score.trim() || !Number.isFinite(numScore)) return 'Enter a repair capacity score (0.0–1.0).';
        if (numScore < 0 || numScore > 1) return 'Score must be between 0.0 and 1.0.';
        return null;
    };

    const handleSave = () => {
        const err = validate();
        if (err) { setError(err); return; }
        setError(null);

        onSave?.({
            repair_score: numScore,
            assay_method: method !== 'Not specified' ? method : undefined,
            date: date.trim() || undefined,
        });

        setScore(''); setDate('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <Box>
            {/* Context */}
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', mb: 2 }}>
                <Stack direction="row" gap={1} alignItems="flex-start">
                    <Wrench size={14} color="#eab308" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                        HR Repair Capacity measures the tumor's ability to fix DNA damage.
                        A <strong>delta &gt; 0.2</strong> from baseline triggers a Kill Chain
                        resistance signal. Rising = HR restoration under therapy pressure.
                    </Typography>
                </Stack>
            </Box>

            {previousScore != null && (
                <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                    Previous score on record: <strong>{previousScore}</strong>
                </Alert>
            )}

            <Stack gap={2}>
                {/* Score + delta */}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems="flex-start">
                    <TextField
                        label="Repair Capacity Score"
                        value={score}
                        onChange={e => setScore(e.target.value)}
                        type="number"
                        inputProps={{ min: 0, max: 1, step: 0.01 }}
                        size="small"
                        sx={inputSx}
                        placeholder="e.g. 0.35"
                        helperText="Scale: 0.0 (deficient) → 1.0 (proficient)"
                        fullWidth
                    />
                    {delta != null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', pt: 1, gap: 1 }}>
                            <Chip
                                label={`Δ ${Number(delta) >= 0 ? '+' : ''}${delta}`}
                                size="small"
                                sx={{
                                    fontWeight: 700,
                                    bgcolor: deltaAlert ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                                    color: deltaAlert ? '#ef4444' : '#22c55e',
                                    border: `1px solid ${deltaAlert ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                                }}
                            />
                            {deltaAlert && (
                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, fontSize: '0.68rem' }}>
                                    ⚠ Threshold exceeded
                                </Typography>
                            )}
                        </Box>
                    )}
                </Stack>

                {/* Assay method */}
                <FormControl size="small" fullWidth sx={inputSx}>
                    <InputLabel sx={{ color: '#64748b' }}>Assay Method</InputLabel>
                    <Select
                        value={method}
                        onChange={e => setMethod(e.target.value)}
                        label="Assay Method"
                        sx={{ color: '#e2e8f0', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' } }}
                    >
                        {ASSAY_METHODS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </Select>
                </FormControl>

                {/* Date */}
                <TextField
                    label="Test date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    sx={inputSx}
                />

                {error && <Alert severity="warning" sx={{ py: 0.5 }}>{error}</Alert>}
                {saved && <Alert severity="success" sx={{ py: 0.5 }}>Repair capacity score saved — Kill Chain will recalculate on next run.</Alert>}

                <Stack direction="row" gap={1}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSave}
                        sx={{ bgcolor: '#eab308', color: '#422006', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#ca8a04' } }}
                    >
                        Save Repair Score
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
        '&.Mui-focused fieldset': { borderColor: '#eab308' },
    },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputBase-input': { color: '#e2e8f0' },
    '& .MuiSelect-icon': { color: '#64748b' },
};
