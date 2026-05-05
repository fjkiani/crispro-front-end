/**
 * ThreatRadarSection — 4 ZetaSignalCards in a grid
 *
 * Extracted from Phase1Profile.jsx monolith.
 */
import React from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import { Biotech as SLIcon, ShowChart as VelocityIcon, LocalFireDepartment as IOIcon, Shield as ResistanceIcon } from '@mui/icons-material';
import { ZetaSignalCard } from '../../../pages/ayesha/ZetaDashboardComponents';
import { getSyntheticLethalitySignal } from '../../../utils/ayesha/syntheticLethalitySignals';

export default function ThreatRadarSection({ careLoading, slResult, ca125, io, resistance, profile, navigate }) {
    const slSignal = getSyntheticLethalitySignal(slResult);

    return (
        <Box sx={{ mt: 3, mb: 3 }}>
            <Typography
                variant="overline"
                sx={{
                    fontWeight: 900, color: 'var(--zeta-slate)',
                    letterSpacing: 2, mb: 1.5, display: 'block', fontSize: '0.7rem',
                }}
            >
                THREAT RADAR
            </Typography>

            {careLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4, justifyContent: 'center' }}>
                    <CircularProgress size={24} sx={{ color: 'var(--zeta-indigo)' }} />
                    <Typography variant="body2" color="text.secondary">Loading intelligence…</Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <ZetaSignalCard
                            title="Synthetic Lethality"
                            icon={<SLIcon fontSize="small" />}
                            status={slSignal.status}
                            color={slSignal.color}
                            evidenceLevel={slSignal.evidenceLevel}
                            evidenceText={slSignal.text}
                            inputsUsed="NGS • Pathway Map"
                            actionLabel="Digital Twin"
                            onAction={() => navigate('/ayesha-digital-twin')}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <ZetaSignalCard
                            title="Tumor Velocity"
                            icon={<VelocityIcon fontSize="small" />}
                            status={ca125?.burden_class || 'UNKNOWN'}
                            color={ca125?.burden_class === 'EXTENSIVE' ? 'error' : ca125?.burden_class === 'SIGNIFICANT' ? 'warning' : 'success'}
                            evidenceLevel="L2"
                            evidenceText={ca125?.forecast
                                ? `Doubling Time: ${ca125.doubling_time || 'N/A'}`
                                : 'Insufficient Kinetic Data'}
                            inputsUsed={`CA-125 Series (${profile?.ca125_history?.length || 1} pts)`}
                            actionLabel="View Kinetics"
                            onAction={() => navigate('/ayesha/journey/monitoring')}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <ZetaSignalCard
                            title="Immune Profile"
                            icon={<IOIcon fontSize="small" />}
                            status={io?.eligible ? 'HOT' : 'COLD'}
                            color={io?.eligible ? 'success' : 'default'}
                            evidenceLevel={profile?.tumor_context?.biomarkers?.tmb ? 'L2' : 'L1'}
                            evidenceText={io?.eligible ? 'Immunotherapy Eligible' : 'Low Immune Markers'}
                            inputsUsed={profile?.tumor_context?.biomarkers?.tmb ? 'TMB • PD-L1 Verified' : 'Markers Missing'}
                            actionLabel="Therapy Fit"
                            onAction={() => navigate('/ayesha/therapy-fit')}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <ZetaSignalCard
                            title="Resistance"
                            icon={<ResistanceIcon fontSize="small" />}
                            status={resistance?.alert_triggered ? 'CRITICAL' : 'LOW'}
                            color={resistance?.alert_triggered ? 'error' : 'success'}
                            evidenceLevel={resistance?.ctdna_trend ? 'L3' : 'L2'}
                            evidenceText={resistance?.alert_triggered
                                ? resistance.message
                                : 'No Overt Resistance'}
                            inputsUsed="Clinical History"
                            actionLabel="Resistance Lab"
                            onAction={() => navigate('/ayesha/journey/resistance')}
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}
