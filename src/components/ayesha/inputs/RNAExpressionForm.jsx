/**
 * RNAExpressionForm — Submit gene expression values for live axis scoring.
 *
 * Calls POST /api/expression/ingest → returns IO/VEGF/Efflux/HER2 axis scores.
 *
 * Genes accepted (log2 TPM scale):
 *   IO:     CD274 (PD-L1), PDCD1LG2 (PD-L2)
 *   VEGF:   VEGFA, KDR, FLT1
 *   Efflux: ABCB1, ABCC1, ABCG2
 *   HER2:   ERBB2
 *
 * Thresholds (from expected_mechanism.py):
 *   HIGH ≥9.0 → IO=0.70, VEGF=0.80, Efflux=0.80, HER2=0.70
 *   MODERATE 7.0–9.0 → IO=0.55, VEGF=0.50, Efflux=0.50
 *
 * Honest caveat: GSE91061 classifier NOT deployed (permutation p=0.191).
 * These are gene-level threshold scores, not a validated classifier.
 */
import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Chip, Alert,
    Stack, Divider, CircularProgress, Collapse,
} from '@mui/material';
import { Activity, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { API_ROOT } from '../../../lib/apiConfig';

// Gene groups with axis labels
const GENE_GROUPS = [
    { axis: 'IO', genes: ['CD274', 'PDCD1LG2'], color: '#6366f1', desc: 'PD-L1/PD-L2 — IO checkpoint axis' },
    { axis: 'VEGF', genes: ['VEGFA', 'KDR', 'FLT1'], color: '#0ea5e9', desc: 'Angiogenesis axis' },
    { axis: 'Efflux', genes: ['ABCB1', 'ABCC1', 'ABCG2'], color: '#f59e0b', desc: 'Drug efflux / resistance axis' },
    { axis: 'HER2', genes: ['ERBB2'], color: '#ec4899', desc: 'HER2 amplification axis' },
];

const ALL_GENES = GENE_GROUPS.flatMap(g => g.genes);

function ScoreBar({ axis, score, color }) {
    if (score == null) return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', width: 60, fontWeight: 700 }}>{axis}</Typography>
            <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic' }}>No data submitted</Typography>
        </Box>
    );
    const pct = Math.round(score * 100);
    const label = score >= 0.7 ? 'HIGH' : score >= 0.5 ? 'MODERATE' : 'LOW';
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#e2e8f0', width: 60, fontWeight: 700 }}>{axis}</Typography>
            <Box sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#1e293b', overflow: 'hidden' }}>
                <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
            </Box>
            <Typography variant="caption" sx={{ color, fontWeight: 800, width: 28, textAlign: 'right' }}>{pct}%</Typography>
            <Chip label={label} size="small" sx={{
                fontWeight: 700, fontSize: '0.65rem', height: 18,
                bgcolor: color + '22', color, border: `1px solid ${color}44`,
            }} />
        </Box>
    );
}

export default function RNAExpressionForm({ onSave }) {
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showCaveat, setShowCaveat] = useState(false);

    const handleChange = (gene, val) => {
        setValues(prev => ({ ...prev, [gene]: val }));
    };

    const buildPayload = () => {
        const expression = {};
        for (const gene of ALL_GENES) {
            const raw = values[gene];
            if (raw !== undefined && raw !== '') {
                const num = parseFloat(raw);
                if (!isNaN(num)) expression[gene] = num;
            }
        }
        return expression;
    };

    const handleSubmit = async () => {
        const expression = buildPayload();
        if (Object.keys(expression).length === 0) {
            setError('Enter at least one gene expression value (log2 TPM).');
            return;
        }
        setError(null);
        setLoading(true);
        setResult(null);

        try {
            const resp = await fetch(`${API_ROOT}/api/expression/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: 'ayesha-digital-twin',
                    expression,
                    source: 'manual_entry',
                }),
            });
            if (!resp.ok) {
                const body = await resp.json().catch(() => ({}));
                throw new Error(body?.detail || `HTTP ${resp.status}`);
            }
            const data = await resp.json();
            setResult(data);
            onSave?.({ expression, axis_scores: data.axis_scores });
        } catch (err) {
            setError(err.message || 'Scoring failed. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const AXIS_COLORS = { IO: '#6366f1', VEGF: '#0ea5e9', Efflux: '#f59e0b', HER2: '#ec4899' };

    return (
        <Box>
            {/* Context banner */}
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', mb: 2 }}>
                <Stack direction="row" gap={1} alignItems="flex-start">
                    <Activity size={14} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#a5b4fc', lineHeight: 1.6 }}>
                        Enter gene expression values (log2 TPM) to score IO/VEGF/Efflux/HER2 axes.
                        Thresholds: HIGH ≥9.0, MODERATE ≥7.0. Leave blank to skip an axis.
                    </Typography>
                </Stack>
            </Box>

            {/* Gene input groups */}
            <Stack gap={2} sx={{ mb: 2 }}>
                {GENE_GROUPS.map(({ axis, genes, color, desc }) => (
                    <Box key={axis}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip label={axis} size="small" sx={{
                                fontWeight: 800, fontSize: '0.7rem', height: 20,
                                bgcolor: color + '22', color, border: `1px solid ${color}44`,
                            }} />
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>{desc}</Typography>
                        </Box>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {genes.map(gene => (
                                <TextField
                                    key={gene}
                                    label={gene}
                                    value={values[gene] ?? ''}
                                    onChange={e => handleChange(gene, e.target.value)}
                                    type="number"
                                    inputProps={{ min: 0, max: 20, step: 0.1 }}
                                    size="small"
                                    placeholder="log2 TPM"
                                    sx={{ width: 120, ...inputSx }}
                                />
                            ))}
                        </Stack>
                    </Box>
                ))}
            </Stack>

            {error && <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>{error}</Alert>}

            <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
                sx={{ bgcolor: '#6366f1', fontWeight: 700, textTransform: 'none', mb: 2, '&:hover': { bgcolor: '#4f46e5' } }}
            >
                {loading ? 'Scoring…' : 'Score Expression'}
            </Button>

            {/* Results */}
            {result && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, mb: 1.5, display: 'block' }}>
                        AXIS SCORES
                    </Typography>
                    <Stack gap={1}>
                        {Object.entries(result.axis_scores || {}).map(([axis, score]) => (
                            <ScoreBar key={axis} axis={axis} score={score} color={AXIS_COLORS[axis] || '#64748b'} />
                        ))}
                    </Stack>
                    {result.top_axes?.length > 0 && (
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #1e293b' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                                Top axes: {result.top_axes.map(a => `${a.axis} (${Math.round(a.score * 100)}%)`).join(' · ')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Caveat toggle */}
            <Box
                onClick={() => setShowCaveat(v => !v)}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', mb: 0.5 }}
            >
                <Info size={12} color="#854d0e" />
                <Typography variant="caption" sx={{ color: '#854d0e', fontWeight: 700, fontSize: '0.72rem' }}>
                    Statistical caveats
                </Typography>
                {showCaveat ? <ChevronUp size={12} color="#854d0e" /> : <ChevronDown size={12} color="#854d0e" />}
            </Box>
            <Collapse in={showCaveat}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fef9c3', border: '1px solid #fde68a' }}>
                    <Typography variant="caption" sx={{ color: '#854d0e', fontSize: '0.72rem', lineHeight: 1.6, display: 'block' }}>
                        • Gene-level threshold scoring only (IO/VEGF/Efflux/HER2). Not a validated classifier.<br />
                        • GSE91061 classifier NOT deployed — permutation p=0.191 (not statistically significant).<br />
                        • Bootstrap AUC=0.699; nested CV AUC=0.601 (near chance). EPV=2.9 (overfit risk).<br />
                        • Directional signal only. Must be interpreted by a clinical genomics specialist.<br />
                        • RUO: Research Use Only.
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
};
