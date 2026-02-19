/**
 * WeeklyStrategyLoop — 4-step patient care narrative
 * 
 * Measure → Detect → Decide → Act
 * 
 * Schema: TherapyFit /analyze bundle (levels.L1.completeness / levels.L1.drugs)
 * Every status badge is deterministic — derived from documented fields only.
 * "Detect" is honestly ⏳ until resistance monitoring is integrated.
 * 
 * Three-state rendering: Loading → Data → Not Available (reason)
 */
import React from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Typography,
    Chip,
    Button,
    Paper,
    Skeleton,
    Alert,
} from '@mui/material';
import {
    Science as MeasureIcon,
    Radar as DetectIcon,
    Analytics as DecideIcon,
    PlaylistAddCheck as ActIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Status badge config
const STATUS_CONFIG = {
    complete: { label: 'Available', color: 'success', variant: 'filled' },
    action: { label: 'Action Needed', color: 'warning', variant: 'filled' },
    pending: { label: 'Pending', color: 'default', variant: 'outlined' },
    preview: { label: 'Preview', color: 'info', variant: 'outlined' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <Chip
            label={cfg.label}
            color={cfg.color}
            variant={cfg.variant}
            size="small"
            sx={{ ml: 1, fontWeight: 600, fontSize: '0.7rem' }}
        />
    );
}

/**
 * Derive stepper state deterministically from TherapyFit bundle.
 * 
 * Input shape (from useAyeshaTherapyFitBundle):
 *   bundle.levels.L1.completeness.missing: string[]
 *   bundle.levels.L1.completeness.confidence_cap: number (0–1)
 *   bundle.levels.L1.completeness.completeness_score: number (0–1)
 *   bundle.levels.L1.drugs: Array<{ drug_name, efficacy_score, ... }>
 */
function deriveStepperState(bundle) {
    const L1 = bundle?.levels?.L1;
    const completeness = L1?.completeness ?? {};
    const missing = completeness.missing ?? [];
    const drugs = L1?.drugs ?? [];
    const confidenceCap = completeness.confidence_cap;
    const completenessScore = completeness.completeness_score;

    return {
        measure: {
            status: missing.length === 0 ? 'complete' : 'action',
            label: missing.length === 0
                ? 'All core measurements available'
                : `Missing: ${missing[0]}${missing.length > 1 ? ` (+${missing.length - 1} more)` : ''}`,
            detail: missing.length > 0
                ? `Completeness: ${((completenessScore || 0) * 100).toFixed(0)}% — ${missing.join(', ')}`
                : `Completeness: ${((completenessScore || 0) * 100).toFixed(0)}%`,
            link: '/ayesha/tests',
        },
        detect: {
            status: 'pending',
            label: 'Resistance monitoring not yet integrated',
            detail: 'Weekly CA-125 + ctDNA monitoring will enable real-time resistance detection. This module is under development.',
            link: '/ayesha-digital-twin',
        },
        decide: {
            status: drugs.length > 0 ? 'complete' : 'pending',
            label: drugs.length > 0
                ? `${drugs.length} drugs ranked (confidence cap: ${confidenceCap != null ? ((confidenceCap) * 100).toFixed(0) + '%' : 'N/A'})`
                : 'Drug ranking not available — analysis pending',
            detail: drugs.length > 0
                ? `Top: ${drugs.slice(0, 3).map(d => d.name || d.drug_name || '?').join(', ')}`
                : 'Run TherapyFit analysis to generate personalized drug rankings.',
            link: '/ayesha/therapy-fit',
        },
        act: {
            status: missing.length > 0 ? 'action' : 'complete',
            label: missing.length > 0
                ? `${missing.length} test(s) recommended to unlock higher confidence`
                : 'All available analyses complete',
            detail: missing.length > 0
                ? `Order: ${missing.join(', ')} to improve from ${((completenessScore || 0) * 100).toFixed(0)}% → higher confidence ranking.`
                : 'No additional tests needed at this time.',
            link: '/ayesha-trials',
        },
    };
}

const STEPS = [
    { key: 'measure', icon: <MeasureIcon />, title: 'Measure', subtitle: 'What we know' },
    { key: 'detect', icon: <DetectIcon />, title: 'Detect', subtitle: 'Signals found' },
    { key: 'decide', icon: <DecideIcon />, title: 'Decide', subtitle: 'Analysis ran' },
    { key: 'act', icon: <ActIcon />, title: 'Act', subtitle: 'Next steps' },
];

export default function WeeklyStrategyLoop({ bundle, bundleLoading, bundleError }) {
    const navigate = useNavigate();

    // Three-state: Loading
    if (bundleLoading) {
        return (
            <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🔄 Weekly Strategy Loop
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rounded" width="25%" height={80} sx={{ borderRadius: 2 }} />
                    ))}
                </Box>
            </Paper>
        );
    }

    // Three-state: Error
    if (bundleError) {
        return (
            <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>🔄 Weekly Strategy Loop</Typography>
                <Alert severity="warning">
                    Strategy loop unavailable: {bundleError?.message || 'Failed to load TherapyFit data'}
                </Alert>
            </Paper>
        );
    }

    // Three-state: Data
    const state = deriveStepperState(bundle);

    return (
        <Paper sx={{
            p: 3, mb: 3, borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.03), rgba(99,102,241,0.04))',
            border: '1px solid rgba(99,102,241,0.15)',
        }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                🔄 Weekly Strategy Loop
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, fontWeight: 400 }}>
                    Your adaptive care cycle
                </Typography>
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                {STEPS.map(({ key, icon, title, subtitle }) => {
                    const step = state[key];
                    return (
                        <Box
                            key={key}
                            onClick={() => navigate(step.link)}
                            sx={{
                                flex: 1, minWidth: { xs: '45%', md: 0 },
                                p: 2, borderRadius: 2, cursor: 'pointer',
                                border: '1px solid',
                                borderColor: step.status === 'complete' ? 'rgba(34,197,94,0.3)'
                                    : step.status === 'action' ? 'rgba(245,158,11,0.3)'
                                        : 'rgba(148,163,184,0.2)',
                                bgcolor: step.status === 'complete' ? 'rgba(34,197,94,0.04)'
                                    : step.status === 'action' ? 'rgba(245,158,11,0.04)'
                                        : 'rgba(148,163,184,0.02)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    borderColor: step.status === 'complete' ? 'rgba(34,197,94,0.5)'
                                        : step.status === 'action' ? 'rgba(245,158,11,0.5)'
                                            : 'rgba(99,102,241,0.4)',
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ color: step.status === 'complete' ? '#22c55e' : step.status === 'action' ? '#f59e0b' : '#94a3b8' }}>
                                    {icon}
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                        {title}
                                        <StatusBadge status={step.status} />
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {subtitle}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.4 }}>
                                {step.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.disabled', textAlign: 'center' }}>
                Research Use Only (RUO). Click any step to see details.
            </Typography>
        </Paper>
    );
}
