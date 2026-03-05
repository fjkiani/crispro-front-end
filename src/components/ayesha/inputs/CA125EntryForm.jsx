/**
 * CA125EntryForm — Single reading entry with MUI inputs + validation
 *
 * Props:
 *   onSave(entry: {value, date, cycle?, note}) → void
 *   onCancel() → void
 */
import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Chip, Alert,
    InputAdornment, Tooltip, Stack,
} from '@mui/material';
import { FlaskConical, Calendar, Info } from 'lucide-react';

const TODAY = new Date().toISOString().slice(0, 10);

export default function CA125EntryForm({ onSave, onCancel, compact = false }) {
    const [value, setValue] = useState('');
    const [date, setDate] = useState(TODAY);
    const [cycle, setCycle] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    const validate = () => {
        const v = Number(value);
        if (!value.trim() || !Number.isFinite(v) || v <= 0)
            return 'Enter a positive numeric CA-125 value (U/mL).';
        if (v > 100000)
            return 'Value seems unusually high — please double-check.';
        if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date))
            return 'Enter date in YYYY-MM-DD format.';
        return null;
    };

    const handleSave = () => {
        const err = validate();
        if (err) { setError(err); return; }
        setError(null);

        const entry = {
            value: Number(value),
            date: date.trim(),
            ...(cycle.trim() ? { cycle: cycle.trim() } : {}),
            ...(note.trim() ? { note: note.trim() } : {}),
        };
        onSave?.(entry);

        // Reset for serial entry
        setValue('');
        setDate(TODAY);
        setCycle('');
        setNote('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <Box>
            {/* Context explainer */}
            {!compact && (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', mb: 2 }}>
                    <Stack direction="row" gap={1} alignItems="flex-start">
                        <Info size={14} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#7dd3fc', lineHeight: 1.6 }}>
                            Serial CA-125 readings (≥3) activate the Kill Chain monitor.
                            Best value: baseline + on-therapy timepoints.
                            Readings are stored locally and sent with each analysis.
                        </Typography>
                    </Stack>
                </Box>
            )}

            <Stack gap={2}>
                {/* Row 1: Value + Date */}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
                    <TextField
                        label="CA-125 value"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        type="number"
                        inputProps={{ min: 0, step: 0.1 }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">U/mL</InputAdornment>,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FlaskConical size={16} color="#38bdf8" />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                        fullWidth
                        sx={inputSx}
                        placeholder="e.g. 2842"
                        error={Boolean(error && error.includes('value'))}
                    />
                    <TextField
                        label="Date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Calendar size={16} color="#64748b" />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                        fullWidth
                        sx={inputSx}
                        error={Boolean(error && error.includes('date'))}
                    />
                </Stack>

                {/* Row 2: Cycle + Note (optional) */}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
                    <Tooltip title="Which treatment cycle was this drawn at? (e.g. C1D1, C3, post-treatment)" placement="top">
                        <TextField
                            label="Cycle (optional)"
                            value={cycle}
                            onChange={e => setCycle(e.target.value)}
                            size="small"
                            fullWidth
                            sx={inputSx}
                            placeholder="e.g. C1D1, baseline, post-op"
                        />
                    </Tooltip>
                    <TextField
                        label="Note (optional)"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        size="small"
                        fullWidth
                        sx={inputSx}
                        placeholder="e.g. post-carboplatin cycle 2"
                    />
                </Stack>

                {/* Validation error */}
                {error && <Alert severity="warning" sx={{ py: 0.5 }}>{error}</Alert>}

                {/* Save feedback */}
                {saved && (
                    <Alert severity="success" sx={{ py: 0.5 }}>
                        Reading saved — add another or close.
                    </Alert>
                )}

                {/* Actions */}
                <Stack direction="row" gap={1}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSave}
                        sx={{
                            bgcolor: '#6366f1', color: 'white', fontWeight: 700,
                            '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none',
                        }}
                    >
                        Save reading
                    </Button>
                    {onCancel && (
                        <Button size="small" onClick={onCancel} sx={{ color: '#64748b', textTransform: 'none' }}>
                            Cancel
                        </Button>
                    )}
                </Stack>

                {/* RUO footnote */}
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.6rem' }}>
                    ⚠️ Research Use Only. Stored locally in this browser. Not transmitted without your explicit action.
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
    '& .MuiInputAdornment-root p': { color: '#64748b' },
};
