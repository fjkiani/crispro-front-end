import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Collapse, Grid } from '@mui/material';
import { ShieldCheck, ShieldAlert, CircleAlert, CheckCircle2, FlaskConical, Dna } from 'lucide-react';

/**
 * ARSENAL COMPONENT: Resistance Gate Banner
 * Surfaces the "Outcome A" (Go) vs "Outcome B" (Veto) decision from the backend.
 * 
 * Logic:
 * - Outcome A: Subtle, reinforcing confidence.
 * - Outcome B: Prominent, demanding attention (Veto).
 * - Not Evaluated: Hidden or minimal.
 */
const ResistanceGateBanner = ({ data, levelKey }) => {
    const lvl = String(levelKey || 'L1').toUpperCase();
    if (!data || !data.boardroom_outcome) {
        // Patient-safe: render minimal stub instead of silently disappearing.
        return (
            <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <CardContent>
                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#475569', letterSpacing: 1.5 }}>
                        RESISTANCE GATEWAY
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                        Resistance screening data is not available at this analysis level. Additional biomarker data may enable this assessment.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const { risk_level, resistance_probability, boardroom_outcome, signals = [] } = data;
    const { outcome, label, summary, action, evidence } = boardroom_outcome;

    const isVeto = outcome === 'B';
    const isPass = outcome === 'A';
    const isUnknown = !isVeto && !isPass;

    // Theme Colors
    const theme = isVeto ? {
        bg: '#fef2f2', // Red-50
        border: '#fecaca', // Red-200
        text: '#991b1b', // Red-800
        icon: '#dc2626', // Red-600
        accent: '#ef4444' // Red-500
    } : isPass ? {
        bg: '#f0fdf4', // Green-50
        border: '#bbf7d0', // Green-200
        text: '#166534', // Green-800
        icon: '#16a34a', // Green-600
        accent: '#22c55e' // Green-500
    } : {
        bg: '#f8fafc', // Slate-50
        border: '#e2e8f0', // Slate-200
        text: '#475569', // Slate-600
        icon: '#94a3b8', // Slate-400
        accent: '#64748b' // Slate-500
    };

    const [expanded] = React.useState(true); // Always expanded (patient-proof)

    // If NOT_EVALUATED, we still render a minimal banner (Tumor Board requirement).
    const isNotEvaluated = data.status === 'NOT_EVALUATED';
    const probIsNumber = typeof resistance_probability === 'number' && !Number.isNaN(resistance_probability);
    const probText = probIsNumber ? `${(resistance_probability * 100).toFixed(1)}%` : '—';
    const signalsCount = typeof data.signals_detected_count === 'number' ? data.signals_detected_count : '—';

    return (
        <Card sx={{
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${theme.border}`,
            bgcolor: theme.bg,
            boxShadow: isVeto ? '0 4px 12px rgba(220, 38, 38, 0.1)' : 'none',
            overflow: 'visible'
        }}>
            <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>

                    {/* Icon Block */}
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {isVeto ? <ShieldAlert size={32} color={theme.icon} strokeWidth={1.5} /> :
                            isPass ? <ShieldCheck size={32} color={theme.icon} strokeWidth={1.5} /> :
                                <CircleAlert size={32} color={theme.icon} strokeWidth={1.5} />}
                    </Box>

                    {/* Main Content */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: theme.text, letterSpacing: 1.5 }}>
                                RESISTANCE GATEWAY
                            </Typography>
                            {(isVeto || isNotEvaluated) && (
                                <Chip
                                    label={isNotEvaluated ? "NOT EVALUATED" : "INTERVENTION REQUIRED"}
                                    size="small"
                                    sx={{
                                        bgcolor: isNotEvaluated ? '#64748b' : theme.accent,
                                        color: 'white',
                                        fontWeight: 700,
                                        borderRadius: 1.5
                                    }}
                                />
                            )}
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2, mb: 0.5 }}>
                            {label}
                        </Typography>

                        <Typography variant="body2" sx={{ color: theme.text, mb: 1.5, maxWidth: '800px' }}>
                            {summary}
                        </Typography>

                        {/* Metrics Strip */}
                        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                            {!isNotEvaluated && (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                                            RESISTANCE PROBABILITY
                                        </Typography>
                                        <Typography variant="caption" sx={{
                                            fontWeight: 900,
                                            color: theme.icon,
                                            fontSize: '1rem',
                                            fontFamily: 'Roboto Mono'
                                        }}>
                                            {probText}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ height: 24, width: 1, bgcolor: theme.border }} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                                            SIGNALS DETECTED
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                            {signalsCount}
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            <Box sx={{ ml: 'auto' }}>
                                <Chip
                                    label="RUO"
                                    size="small"
                                    sx={{ bgcolor: 'rgba(100,116,139,0.15)', color: '#64748b', fontWeight: 700, fontSize: '0.65rem' }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Expanded Details */}
                <Collapse in={expanded}>
                    <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.border}` }}>
                        {isNotEvaluated ? (
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.6)', border: `1px solid ${theme.border}` }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                                    NOT EVALUATED (missing required inputs)
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#475569' }}>
                                    {data.reason || 'Resistance gating requires SAE features and transcriptomic expression (e.g., MFAP4).'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#475569', mt: 1 }}>
                                    Action: {action}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                                DETECTED SIGNALS (ARSENAL)
                            </Typography>
                        )}

                        {!isNotEvaluated && (
                            <Grid container spacing={2}>
                                {signals.map((signal, idx) => (
                                    <Grid item xs={12} key={idx}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255,255,255,0.6)',
                                            border: `1px solid ${theme.border}`,
                                            display: 'flex',
                                            gap: 2
                                        }}>
                                            {(signal.signal_type || '').includes('GENE') ? <Dna size={20} color={theme.icon} /> : <FlaskConical size={20} color={theme.icon} />}
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                    {(signal.signal_type || 'Unknown').replace(/_/g, ' ')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                                                    {signal.rationale}
                                                </Typography>
                                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                    {signal.provenance?.diamond_source && (
                                                        <Chip label="Diamond SAE" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#e0f2fe', color: '#0369a1' }} />
                                                    )}
                                                    <Chip
                                                        label={`Probability: ${(signal.probability * 100).toFixed(0)}%`}
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.65rem', border: '1px solid #cbd5e1', bgcolor: 'transparent' }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}

                                {signals.length === 0 && (
                                    <Box sx={{ p: 2, width: '100%' }}>
                                        <Typography variant="body2" sx={{ color: '#4ade80', fontWeight: 600, mb: 0.5 }}>
                                            No intrinsic resistance mechanisms detected
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.6, display: 'block' }}>
                                            The resistance screening model did not flag any known resistance-associated mutations or expression patterns in this tumor profile.
                                            This suggests the tumor may be more responsive to mechanism-guided therapies. However, acquired resistance can develop during treatment — ongoing monitoring is recommended.
                                        </Typography>
                                    </Box>
                                )}

                            </Grid>
                        )}

                        <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: theme.text, color: 'white' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8, letterSpacing: 1 }}>
                                RECOMMENDED ACTION
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {action}
                            </Typography>
                        </Box>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

export default ResistanceGateBanner;
