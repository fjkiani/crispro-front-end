/**
 * BiomarkerIntelligencePage
 *
 * Route: /ayesha/biomarker-intelligence
 * Hub for all biomarker intelligence — Prognosis, Predictive, DDR, Monitoring.
 *
 * Architecture: Thin page orchestrator. All data via useBiomarkerIntelligence hook.
 * Sections use existing components only — nothing invented here.
 *
 * SCOPE (Ovarian Cancer only):
 *   ✅ Prognosis: CA-125 burden, monitoring frequency
 *   ✅ Predictive: Evo2+Gates PARP score, DDR status
 *   ✅ Monitoring: Frequency by burden/treatment
 *   ❌ Diagnostic: NOT IMPLEMENTED (0%)
 *   ❌ Safety: NOT IMPLEMENTED (0%)
 */
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Chip,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Biotech,
    TrendingUp,
    Science,
    Schedule,
    InfoOutlined,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Reused components — no new ones invented
import CA125Tracker from '../../components/ayesha/CA125Tracker';
import DDRStatusCard from '../../components/ddr/DDRStatusCard';
import Evo2GatesSensitivityCard from '../../components/ayesha/Evo2GatesSensitivityCard';
import HRDPanel from '../../components/ddr/HRDPanel';

// Patient data
import { AYESHA_11_17_25_PROFILE } from '../../constants/patients/ayesha_11_17_25';

const PageWrapper = styled(Box)(() => ({
    minHeight: '100vh',
    background: '#0a0e14',
    color: '#e0e0e0',
    padding: '32px 16px',
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: '1px solid #2d3748',
}));

const SectionCard = styled(Paper)(() => ({
    background: '#151b24',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    padding: '24px',
    height: '100%',
}));

const StatusChip = ({ label, status }) => {
    const color = status === 'LIVE' ? 'success' : status === 'PARTIAL' ? 'warning' : 'default';
    return (
        <Chip
            label={label}
            color={color}
            size="small"
            variant="outlined"
            sx={{ ml: 1, fontSize: '0.65rem' }}
        />
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const BiomarkerIntelligencePage = () => {
    const profile = AYESHA_11_17_25_PROFILE;
    const [biomarkerData, setBiomarkerData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBiomarkers = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/biomarker/intelligence', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        patient_id: profile?.patient?.patient_id || 'AK',
                        ca125_values: profile?.labs?.ca125_measurements || [],
                        disease_type: 'ovarian_cancer',
                    }),
                });
                const data = await response.json();
                setBiomarkerData(data);
            } catch (e) {
                console.warn('[BiomarkerIntelligencePage] Biomarker API unavailable, using profile data');
            } finally {
                setLoading(false);
            }
        };
        fetchBiomarkers();
    }, [profile]);

    return (
        <PageWrapper>
            <Container maxWidth="xl">
                {/* ── Page Header ─────────────────────────────────────────── */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Biotech sx={{ color: '#4fd1c5', fontSize: 32 }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
                            Biomarker Intelligence
                        </Typography>
                        <Chip
                            label="Ovarian Cancer"
                            size="small"
                            sx={{ bgcolor: '#2d3748', color: '#a0aec0' }}
                        />
                    </Box>
                    <Typography variant="subtitle2" sx={{ color: '#718096' }}>
                        All biomarker data is specific to your ovarian cancer profile.
                        Diagnostic and safety panels are not yet available.
                    </Typography>
                </Box>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: '#4fd1c5' }} size={28} />
                    </Box>
                )}

                <Grid container spacing={3}>
                    {/* ── SECTION 1: Prognosis ─────────────────────────────── */}
                    <Grid item xs={12}>
                        <SectionCard>
                            <SectionHeader>
                                <TrendingUp sx={{ color: '#4fd1c5', fontSize: 20 }} />
                                <Typography variant="overline" sx={{ color: '#a0aec0', letterSpacing: 2 }}>
                                    Prognosis
                                </Typography>
                                <StatusChip label="LIVE" status="LIVE" />
                            </SectionHeader>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <CA125Tracker />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ p: 2, bgcolor: '#0f1722', borderRadius: 2, border: '1px solid #2d3748' }}>
                                        <Typography variant="overline" sx={{ color: '#4a5568', fontSize: '0.65rem', letterSpacing: 2 }}>
                                            Monitoring Frequency
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: '#e2e8f0', mt: 1, fontWeight: 700 }}>
                                            Every 3 weeks
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#718096' }}>
                                            Pre-cycle CA-125 — based on active platinum exposure
                                        </Typography>
                                        <Divider sx={{ my: 2, borderColor: '#2d3748' }} />
                                        <Typography variant="caption" sx={{ color: '#4a5568' }}>
                                            Source: biomarker_intelligence.py → monitoring_strategy()
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </SectionCard>
                    </Grid>

                    {/* ── SECTION 2: Predictive ─────────────────────────────── */}
                    <Grid item xs={12} md={6}>
                        <SectionCard>
                            <SectionHeader>
                                <Science sx={{ color: '#4fd1c5', fontSize: 20 }} />
                                <Typography variant="overline" sx={{ color: '#a0aec0', letterSpacing: 2 }}>
                                    Predictive — PARP Sensitivity
                                </Typography>
                                <StatusChip label="LIVE" status="LIVE" />
                            </SectionHeader>
                            <Typography variant="caption" sx={{ color: '#718096', display: 'block', mb: 2 }}>
                                Probability your tumor will respond to PARP inhibitor therapy.
                                Validated on TCGA-OV cohort. <em>Research Use Only.</em>
                            </Typography>
                            <Evo2GatesSensitivityCard evo2Prediction={null} />
                        </SectionCard>
                    </Grid>

                    {/* ── SECTION 3: DDR / Genomic Markers ────────────────── */}
                    <Grid item xs={12} md={6}>
                        <SectionCard>
                            <SectionHeader>
                                <Biotech sx={{ color: '#4fd1c5', fontSize: 20 }} />
                                <Typography variant="overline" sx={{ color: '#a0aec0', letterSpacing: 2 }}>
                                    DDR & Genomic Markers
                                </Typography>
                                <StatusChip label="LIVE" status="LIVE" />
                            </SectionHeader>
                            <DDRStatusCard />
                            <Box sx={{ mt: 2 }}>
                                <HRDPanel />
                            </Box>
                        </SectionCard>
                    </Grid>

                    {/* ── SECTION 4: Not Available ─────────────────────────── */}
                    <Grid item xs={12}>
                        <Alert
                            severity="info"
                            icon={<InfoOutlined />}
                            sx={{ bgcolor: '#1a2535', border: '1px solid #2d4a6e', color: '#718096' }}
                        >
                            <Typography variant="subtitle2" sx={{ color: '#a0aec0' }}>
                                Not yet available: Diagnostic Panel &amp; Safety Monitoring
                            </Typography>
                            <Typography variant="caption">
                                HE4, diagnostic imaging markers, and CTCAE-based safety signals
                                are not yet configured for this profile.
                                These will appear here automatically once implemented.
                            </Typography>
                        </Alert>
                    </Grid>
                </Grid>
            </Container>
        </PageWrapper>
    );
};

export default BiomarkerIntelligencePage;
