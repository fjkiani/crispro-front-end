/**
 * Phase 4 — Monitoring ("How will we know if it's working?")
 *
 * Dashboard with lanes:
 *   0. Kill Chain Signal Dashboard (EnginePanel) — full 8-signal view
 *   1. CA-125 trend
 *   2. ctDNA / MRD status
 *   3. Imaging / visits cadence
 *   4. irAE watchlist
 *
 * Each lane renders only present fields.
 * Missing monitoring inputs route back to Phase 2 tests.
 * IntakeRiskWarning shows conditionally when ≥2 baseline signals fire.
 */
import React from 'react';
import {
    Box, Typography, Paper, Grid, Alert, Chip, Divider, Button,
} from '@mui/material';
import {
    Timeline, Bloodtype, Camera, ArrowForward, Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import { useAyeshaProfile } from '../../../hooks/ayesha/useAyeshaProfile';
import { useKillChainSignals } from '../../../hooks/ayesha/useKillChainSignals';
import TriggerFeedStrip from '../../../components/ayesha/resistance/TriggerFeedStrip';
import EnginePanel from '../../../components/ayesha/test-detail/EnginePanel';
import IntakeRiskWarning from '../../../components/ayesha/test-detail/IntakeRiskWarning';
import { SIGNAL_DEFINITIONS } from '../../../constants/kill-chain/signalDefinitions';

// ── Monitoring Lane ──────────────────────────────────────────────────────────

const MonitoringLane = ({ icon, title, subtitle, status, children, onClick }) => (
    <Paper
        onClick={onClick}
        sx={{
            p: 3, borderRadius: 3,
            border: '1px solid', borderColor: 'divider',
            height: '100%',
            ...(onClick && {
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                transition: 'all 0.2s ease',
            }),
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            {icon}
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    {title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {subtitle}
                </Typography>
            </Box>
            <Chip
                label={status}
                size="small"
                color={status === 'Active' ? 'success' : status === 'Pending' ? 'warning' : 'default'}
                sx={{ fontWeight: 600 }}
            />
        </Box>
        {children}
    </Paper>
);

// ── Intake Risk Helper ───────────────────────────────────────────────────────

function computeIntakeRiskProps(signals) {
    let baselineCount = 0;
    let activeCount = 0;
    const baselineSignals = [];
    const signalSlugs = [];     // { name, slug } for each firing baseline signal

    for (const id of Object.keys(SIGNAL_DEFINITIONS)) {
        const sig = signals[id];
        const def = SIGNAL_DEFINITIONS[id];
        const key = sig?.state?.key;

        if (def.type === 'BASELINE' && (key === 'FIRED' || key === 'BASELINE_NOTED')) {
            baselineCount++;
            baselineSignals.push(def.name);
            if (def.slug) signalSlugs.push({ name: def.shortName || def.name, slug: def.slug });
        }
        if (def.type === 'ACTIVE' && key === 'FIRED') {
            activeCount++;
        }
    }

    return { baselineCount, activeCount, baselineSignals, signalSlugs };
}

// ── Page Orchestrator ────────────────────────────────────────────────────────

const Phase4Monitoring = () => {
    const navigate = useNavigate();
    const { labs, profile } = useAyeshaProfile();
    const { signals } = useKillChainSignals();

    const ca125Value = labs?.ca125_value;
    const hasMRD = profile?.mrd?.detected ?? false;
    const imagingReports = profile?.imaging ? Object.values(profile.imaging) : [];
    const hasImaging = imagingReports.length > 0;
    const diagnosticTimeline = profile?.diagnostic_timeline || [];

    // Compute intake risk props from signal state
    const intakeRiskProps = computeIntakeRiskProps(signals);

    return (
        <JourneyLayout>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                <Alert severity="info">
                    <strong>Monitoring is about change over time.</strong> Single values are incomplete.
                    If data is missing, we say "Unknown."
                </Alert>

                {/* Intake Risk Warning (conditional — only shows when ≥2 baseline, 0 active) */}
                <IntakeRiskWarning {...intakeRiskProps} />

                {/* Kill Chain Signal Dashboard — full 8-signal view */}
                <EnginePanel />

                {/* Active Alerts Strip */}
                <TriggerFeedStrip triggerEvents={[
                    { trigger_id: 'CA125_ELEVATION', severity: 'high', metric: 'CA-125', current_value: ca125Value, baseline_value: 35, percentage_change: null }
                ].filter(t => t.current_value && t.current_value > t.baseline_value)} />

                <Grid container spacing={3}>
                    {/* Lane 1: CA-125 */}
                    <Grid item xs={12} md={4}>
                        <MonitoringLane
                            icon={<Timeline sx={{ fontSize: 24, color: '#0ea5e9' }} />}
                            title="CA-125 Trend"
                            subtitle="Tumor marker kinetics"
                            status={ca125Value != null ? 'Active' : 'Not Available'}
                            onClick={() => navigate('/ayesha/journey/monitor/ca125_kinetics')}
                        >
                            {ca125Value != null ? (
                                <Box>
                                    <Box sx={{
                                        p: 2, borderRadius: 2, bgcolor: '#f0f9ff',
                                        border: '1px solid #bfdbfe', mb: 2,
                                    }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            Last Value
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                            {ca125Value} <Typography component="span" variant="body2">{labs?.ca125_units || 'U/mL'}</Typography>
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Baseline value. Trend analysis requires repeat measurements over time.
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                        Not available — CA-125 baseline needed.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate('/ayesha/journey/tests')}
                                    >
                                        Add CA-125 Test
                                    </Button>
                                </Box>
                            )}
                        </MonitoringLane>
                    </Grid>

                    {/* Lane 2: ctDNA / MRD */}
                    <Grid item xs={12} md={4}>
                        <MonitoringLane
                            icon={<Bloodtype sx={{ fontSize: 24, color: '#ec4899' }} />}
                            title="ctDNA / MRD"
                            subtitle="Circulating tumor DNA tracking"
                            status={hasMRD ? 'Active' : 'Not Available'}
                            onClick={() => navigate('/ayesha/journey/monitor/ctdna_mrd')}
                        >
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                                    Not available — ctDNA / MRD panel needed.
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                                    To enable sWGS MRD: order sWGS ctDNA panel.
                                    Tumor Fraction (TF) and Pathological Fraction (PF)
                                    signals only render when modality is sWGS.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => navigate('/ayesha/journey/tests')}
                                >
                                    Add ctDNA Test
                                </Button>
                            </Box>
                        </MonitoringLane>
                    </Grid>

                    {/* Lane 3: Imaging / Visits */}
                    <Grid item xs={12} md={4}>
                        <MonitoringLane
                            icon={<Camera sx={{ fontSize: 24, color: '#10b981' }} />}
                            title="Diagnostic Timeline"
                            subtitle="Scans and procedures"
                            status={diagnosticTimeline.length > 0 ? 'Active' : 'Pending'}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {diagnosticTimeline.slice(0, 3).map((event, i) => (
                                    <Box key={i} sx={{ borderLeft: '2px solid #e2e8f0', pl: 2, position: 'relative' }}>
                                        <Box sx={{
                                            position: 'absolute', left: -5, top: 4, width: 8, height: 8,
                                            borderRadius: '50%', bgcolor: '#10b981',
                                        }} />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                                            {event.date}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {event.report_type}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                                            {event.finding}
                                        </Typography>
                                    </Box>
                                ))}

                                {diagnosticTimeline.length === 0 && (
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Imaging schedule: per treating physician.
                                            Update with results as they become available.
                                        </Typography>
                                    </Box>
                                )}

                                {imagingReports.length > 0 && (
                                    <Box sx={{ mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>LATEST SCAN FINDINGS</Typography>
                                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                            {imagingReports[0].key_findings?.[0] || 'No key findings structured.'}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </MonitoringLane>
                    </Grid>

                    {/* Lane 4: irAE Monitoring — IO Safety */}
                    <Grid item xs={12} md={4}>
                        <MonitoringLane
                            icon={<Warning sx={{ fontSize: 24, color: '#dc2626' }} />}
                            title="IO Side Effects (irAE)"
                            subtitle="Immune-related adverse events"
                            status="Watchlist"
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {[
                                    { organ: '🫁 Lungs', event: 'Pneumonitis', watch: 'Cough, dyspnea' },
                                    { organ: '❤️ Heart', event: 'Myocarditis', watch: 'Chest pain, arrhythmia' },
                                    { organ: '🟤 Liver', event: 'Hepatitis', watch: 'ALT/AST elevation' },
                                    { organ: '🩺 Colon', event: 'Colitis', watch: 'Diarrhea, cramping' },
                                    { organ: '🦋 Thyroid', event: 'Thyroiditis', watch: 'TSH abnormality' },
                                ].map(item => (
                                    <Box key={item.organ} sx={{
                                        p: 1, borderRadius: 1.5,
                                        bgcolor: '#fef2f2', border: '1px solid #fecaca',
                                        display: 'flex', alignItems: 'center', gap: 1,
                                    }}>
                                        <Typography sx={{ fontSize: '0.85rem', minWidth: 28 }}>{item.organ.split(' ')[0]}</Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                {item.event}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Watch: {item.watch}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                                    Report any new symptoms immediately. Early detection of irAEs improves outcomes.
                                </Typography>
                            </Box>
                        </MonitoringLane>
                    </Grid>
                </Grid>

                {/* Alert trigger CTA */}
                <Paper sx={{
                    p: 3, borderRadius: 3, textAlign: 'center',
                    border: '1px solid', borderColor: 'warning.light',
                    bgcolor: '#fffbeb',
                }}>
                    <Warning sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        If Something Changes
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Rising markers, new symptoms, or imaging changes may trigger the resistance analysis.
                    </Typography>
                    <Button
                        variant="contained"
                        color="warning"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/ayesha/journey/resistance')}
                        sx={{ fontWeight: 600 }}
                    >
                        View Resistance Plan
                    </Button>
                </Paper>

                <Box sx={{
                    textAlign: 'center', pt: 4, pb: 2,
                    display: 'flex', flexDirection: 'column', gap: 1
                }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: '0.5px' }}>
                        PROVENANCE LOG
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                        Monitoring engine: static_dashboard_v1 // Data mapped from: profile.labs, profile.mrd, profile.imaging // Data generated: {new Date().toLocaleDateString()}
                    </Typography>
                </Box>
            </Box>
        </JourneyLayout>
    );
};

export default Phase4Monitoring;
