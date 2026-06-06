/**
 * LpWGSForm — Submit COSMIC CN signature exposures for live prognosis scoring.
 *
 * Calls POST /api/ayesha/lpwgs/score → returns prognosis_state (POOR/FAVORABLE/UNCERTAIN).
 *
 * Key signature: Sig7 (chromothripsis / structural instability)
 *   Threshold: 0.25 (BriTROC midpoint — resistant=0.333, sensitive=0.166)
 *   Sig7 ≥ 0.25 → POOR prognosis
 *   Sig7 < 0.25 → FAVORABLE prognosis
 *
 * Reference: Macintyre et al. 2018, BriTROC cohort N=117. PMID 30017478.
 * Validated post-treatment only. Confidence capped at MEDIUM. RUO.
 */
import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Chip, Alert,
    Stack, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Collapse, Switch, FormControlLabel,
} from '@mui/material';
import { Dna, Info, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { getApiBaseUrl } from '../../../config/apiConfig';

// Common COSMIC CN signatures in HGSOC
const CN_SIGS = [
    { key: 'Sig1', label: 'Sig1', desc: 'Diploid / low instability' },
    { key: 'Sig2', label: 'Sig2', desc: 'Deletion-enriched' },
    { key: 'Sig3', label: 'Sig3', desc: 'HRD-associated' },
    { key: 'Sig4', label: 'Sig4', desc: 'Tandem duplication' },
    { key: 'Sig5', label: 'Sig5', desc: 'Amplification-enriched' },
    { key: 'Sig6', label: 'Sig6', desc: 'Oscillating CN' },
    { key: 'Sig7', label: 'Sig7 ★', desc: 'Chromothripsis / structural chaos (key prognostic)' },
];

const SOURCE_OPTIONS = ['ichorCNA', 'QDNAseq', 'GATK CNV', 'manual', 'other'];

const STATE_CONFIG = {
    POOR: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'POOR PROGNOSIS', icon: '⚠️' },
    FAVORABLE: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'FAVORABLE PROGNOSIS', icon: '✓' },
    UNCERTAIN: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'UNCERTAIN', icon: '?' },
};

export default function LpWGSForm({ onSave }) {
    const [sigValues, setSigValues] = useState({});
    const [source, setSource] = useState('manual');
    const [isPostTreatment, setIsPostTreatment] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showCaveat, setShowCaveat] = useState(false);

    const handleSigChange = (key, val) => {
        setSigValues(prev => ({ ...prev, [key]: val }));
    };

    const buildPayload = () => {
        const cn_signatures = {};
        for (const { key } of CN_SIGS) {
            const raw = sigValues[key];
            if (raw !== undefined && raw !== '') {
                const num = parseFloat(raw);
                if (!isNaN(num) && num >= 0 && num <= 1) {
                    cn_signatures[key] = num;
                }
            }
        }
        return cn_signatures;
    };

    const handleSubmit = async () => {
        const cn_signatures = buildPayload();
        if (!('Sig7' in cn_signatures)) {
            setError('Sig7 is required for scoring. Enter a value between 0.0 and 1.0.');
            return;
        }
        setError(null);
        setLoading(true);
        setResult(null);

        try {
            const base = getApiBaseUrl();
            const resp = await fetch(`${base}/api/ayesha/lpwgs/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: 'ayesha-digital-twin',
                    cn_signatures,
                    source,
                    is_post_treatment: isPostTreatment,
                }),
            });
            if (!resp.ok) {
                const body = await resp.json().catch(() => ({}));
                throw new Error(body?.detail || `HTTP ${resp.status}`);
            }
            const data = await resp.json();
            setResult(data);
            onSave?.({ cn_signatures, prognosis_state: data.prognosis_state });
        } catch (err) {
            setError(err.message || 'Scoring failed. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const stateConfig = result ? (STATE_CONFIG[result.prognosis_state] || STATE_CONFIG.UNCERTAIN) : null;

    return (
        <Box>
            {/* Context banner */}
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', mb: 2 }}>
                <Stack direction="row" gap={1} alignItems="flex-start">
                    <Dna size={14} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#a5b4fc', lineHeight: 1.6 }}>
                        Enter COSMIC CN signature exposures (0.0–1.0) from your lpWGS report.
                        <strong> Sig7 is required</strong> — it drives the prognosis call.
                        Threshold: Sig7 ≥ 0.25 → POOR (BriTROC, N=117).
                    </Typography>
                </Stack>
            </Box>

            {/* Sig7 prominent input */}
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.2)', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#fca5a5', fontWeight: 800, fontSize: '0.75rem', mb: 1, display: 'block' }}>
                    ★ Sig7 — Chromothripsis / Structural Instability (required)
                </Typography>
                <Stack direction="row" gap={1.5} alignItems="center">
                    <TextField
                        label="Sig7 exposure"
                        value={sigValues['Sig7'] ?? ''}
                        onChange={e => handleSigChange('Sig7', e.target.value)}
                        type="number"
                        inputProps={{ min: 0, max: 1, step: 0.01 }}
                        size="small"
                        placeholder="0.00 – 1.00"
                        sx={{ width: 140, ...inputSx }}
                    />
                    {sigValues['Sig7'] !== undefined && sigValues['Sig7'] !== '' && (
                        <Chip
                            label={parseFloat(sigValues['Sig7']) >= 0.25 ? 'Above threshold → POOR' : 'Below threshold → FAVORABLE'}
                            size="small"
                            sx={{
                                fontWeight: 700, fontSize: '0.68rem',
                                bgcolor: parseFloat(sigValues['Sig7']) >= 0.25 ? 'rgba(220,38,38,0.15)' : 'rgba(22,163,74,0.15)',
                                color: parseFloat(sigValues['Sig7']) >= 0.25 ? '#dc2626' : '#16a34a',
                                border: `1px solid ${parseFloat(sigValues['Sig7']) >= 0.25 ? 'rgba(220,38,38,0.3)' : 'rgba(22,163,74,0.3)'}`,
                            }}
                        />
                    )}
                </Stack>
            </Box>

            {/* Other signatures (optional) */}
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', mb: 1, display: 'block' }}>
                Other CN signatures (optional)
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                {CN_SIGS.filter(s => s.key !== 'Sig7').map(({ key, label, desc }) => (
                    <TextField
                        key={key}
                        label={label}
                        value={sigValues[key] ?? ''}
                        onChange={e => handleSigChange(key, e.target.value)}
                        type="number"
                        inputProps={{ min: 0, max: 1, step: 0.01 }}
                        size="small"
                        placeholder="0.0–1.0"
                        sx={{ width: 100, ...inputSx }}
                    />
                ))}
            </Stack>

            {/* Source + treatment status */}
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mb: 2 }} alignItems="center">
                <FormControl size="small" sx={{ width: 160, ...inputSx }}>
                    <InputLabel sx={{ color: '#64748b' }}>Source</InputLabel>
                    <Select
                        value={source}
                        onChange={e => setSource(e.target.value)}
                        label="Source"
                        sx={{ color: '#e2e8f0', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' } }}
                    >
                        {SOURCE_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isPostTreatment}
                            onChange={e => setIsPostTreatment(e.target.checked)}
                            size="small"
                            sx={{ '& .MuiSwitch-thumb': { bgcolor: isPostTreatment ? '#6366f1' : '#64748b' } }}
                        />
                    }
                    label={
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                            Post-treatment sample
                        </Typography>
                    }
                />
            </Stack>

            {!isPostTreatment && (
                <Alert severity="info" sx={{ mb: 1.5, py: 0.5, fontSize: '0.78rem' }}>
                    BriTROC validation was post-treatment only. Pre-treatment samples will return UNCERTAIN.
                </Alert>
            )}

            {error && <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>{error}</Alert>}

            <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
                sx={{ bgcolor: '#6366f1', fontWeight: 700, textTransform: 'none', mb: 2, '&:hover': { bgcolor: '#4f46e5' } }}
            >
                {loading ? 'Scoring…' : 'Score CN Signatures'}
            </Button>

            {/* Results */}
            {result && stateConfig && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: stateConfig.bg, border: `1.5px solid ${stateConfig.border}`, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography sx={{ fontSize: '1.1rem' }}>{stateConfig.icon}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: stateConfig.color, fontSize: '0.88rem' }}>
                            {stateConfig.label}
                        </Typography>
                        <Chip
                            label={`Sig7 = ${result.sig7_exposure?.toFixed(3) ?? 'N/A'}`}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: stateConfig.color + '22', color: stateConfig.color }}
                        />
                        <Chip
                            label={`Confidence: ${result.confidence}`}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.65rem', bgcolor: '#1e293b', color: '#94a3b8' }}
                        />
                    </Box>
                    {result.rationale?.map((r, i) => (
                        <Typography key={i} variant="caption" sx={{ color: stateConfig.color, fontSize: '0.75rem', display: 'block', lineHeight: 1.5 }}>
                            • {r}
                        </Typography>
                    ))}
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', mt: 1, display: 'block', fontWeight: 700 }}>
                        Recommendation: {result.action_recommendation?.replace(/_/g, ' ')}
                    </Typography>
                </Box>
            )}

            {/* Caveat toggle */}
            <Box
                onClick={() => setShowCaveat(v => !v)}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', mb: 0.5 }}
            >
                <Info size={12} color="#1e40af" />
                <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, fontSize: '0.72rem' }}>
                    Validation caveats
                </Typography>
                {showCaveat ? <ChevronUp size={12} color="#1e40af" /> : <ChevronDown size={12} color="#1e40af" />}
            </Box>
            <Collapse in={showCaveat}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontSize: '0.72rem', lineHeight: 1.6, display: 'block' }}>
                        • BriTROC cohort N=117 (Macintyre et al. 2018, PMID 30017478).<br />
                        • Sig7 threshold=0.25 is a draft heuristic (resistant midpoint=0.333, sensitive=0.166).<br />
                        • Validated post-treatment only. Pre-treatment → UNCERTAIN.<br />
                        • Confidence capped at MEDIUM pending multi-cohort validation.<br />
                        • Manual CN signature input only — no WGS pipeline runs here.<br />
                        • RUO: Research Use Only. Not clinical guidance.
                    </Typography>
                </Box>
            </Collapse>
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
