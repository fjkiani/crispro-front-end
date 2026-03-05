/**
 * ResistanceLab — Thin Orchestrator (modularized Feb 2026)
 *
 * Single responsibility: orchestrate data loading, simulation API call,
 * and lay out the 3 modular panels. All UI lives in components/.
 *
 * Architecture:
 *   TumorSettingsPanel → left (inputs + gene toggles + ScenarioExplainer)
 *   ReasoningPanel     → center (glass-box logic stream)
 *   OutcomePanel       → right (Evo2 score + Prophet gauges + trigger alerts)
 *
 * Data contract transform (profile → timing_context) lives in
 *   hooks/useTimingContractTransform (to be extracted if it grows).
 */
import React, { useState, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    Alert,
    Collapse,
    IconButton,
} from '@mui/material';
import { Science as ScienceIcon, Psychology as BrainIcon, Close as CloseIcon } from '@mui/icons-material';

// Modular panels (each independently testable and scalable)
import TumorSettingsPanel from '../../components/ayesha/resistance/TumorSettingsPanel';
import ReasoningPanel from '../../components/ayesha/resistance/ReasoningPanel';
import OutcomePanel from '../../components/ayesha/resistance/OutcomePanel';

// Shared styles
import { PageWrapper, HeaderPanel, LabGrid } from '../../components/ayesha/resistance/LabStyles';

// Data bridge
import { useTimingChemoFeatures } from '../../hooks/useTimingChemoFeatures';
import { AYESHA_11_17_25_PROFILE } from '../../constants/patients/ayesha_11_17_25';

// ─── Data Transform (profile → timing_context contract) ──────────────────────
const buildTimingContext = (featuresData) => {
    if (!featuresData?.timing_features_table) return null;

    const regimens = featuresData.timing_features_table.map((r) => ({
        regimen_id: r.regimen_id,
        regimen_name: r.regimen_type,
        regimen_class: r.regimen_type,
        start_date: r.regimen_start_date,
        end_date: r.regimen_end_date,
        timing_features: {
            pfi_months: r.PFI_days ? r.PFI_days / 30.4375 : null,
            ptpi_months: r.PTPI_days ? r.PTPI_days / 30.4375 : null,
            tfi_months: r.TFI_days ? r.TFI_days / 30.4375 : null,
            pfs_months: r.PFS_from_regimen_days ? r.PFS_from_regimen_days / 30.4375 : null,
            os_months: r.OS_from_regimen_days ? r.OS_from_regimen_days / 30.4375 : null,
            platinum_sensitivity_category: r.PFI_category,
        },
        chemosensitivity_features: {
            kelim_ca125:
                r.kelim_category || r.kelim_k_value
                    ? {
                        k: r.kelim_k_value,
                        kelim: r.kelim_value,
                        category: r.kelim_category,
                        modeling_approach: 'loglinear',
                        time_window_days: 100,
                    }
                    : null,
            ca125_measurements_used: null,
        },
        data_quality: {
            has_regimen_history: true,
            has_ca125_data: r.has_ca125_data || false,
            warnings: [],
        },
        source_refs: [],
    }));

    return {
        schema_version: 'patient_regimen_feature_table.v1',
        patient_id: 'AK_11_17',
        disease_type: 'ovarian_cancer',
        regimens,
        provenance: {
            computed_at: new Date().toISOString(),
            engine: 'timing_chemosensitivity_engine',
            ruo_disclaimer: 'Frontend-Bridge-Transformed',
            inputs_used: { source: 'precomputed_ca125_features' },
        },
    };
};

// ─── Page Orchestrator ────────────────────────────────────────────────────────
const ResistanceLab = () => {
    const [loading, setLoading] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [params, setParams] = useState({
        simulate_germline: 'negative',
        simulate_hrd: 42,
        simulate_treatment: ['carboplatin', 'paclitaxel'],
        gene_toggles: {},
    });

    const { timingFeatures, computeTimingFeatures } = useTimingChemoFeatures();

    // Load timing context from patient profile on mount
    React.useEffect(() => {
        const loadContext = async () => {
            if (timingFeatures) return;
            const profile = AYESHA_11_17_25_PROFILE;
            const txHistory = profile.treatment_history || [];
            if (!txHistory.length) return;

            const regimenTable = txHistory.map((tx, idx) => ({
                patient_id: profile.patient?.patient_id || 'AK',
                regimen_id: `regimen_${idx + 1}`,
                regimen_start_date: tx.start_date || new Date().toISOString(),
                regimen_end_date: tx.end_date || null,
                regimen_type: tx.regimen_type || tx.drugs?.join('+') || 'unknown',
                line_of_therapy: tx.line || idx + 1,
                setting: tx.setting || (idx === 0 ? 'frontline' : 'recurrent'),
                last_platinum_dose_date: tx.last_platinum_dose_date || null,
                progression_date: tx.progression_date || null,
                best_response: tx.outcome || tx.best_response || null,
            }));

            try {
                await computeTimingFeatures({
                    regimenTable,
                    survivalTable: [{
                        patient_id: profile.patient?.patient_id || 'AK',
                        vital_status: 'Alive',
                        death_date: null,
                        last_followup_date: new Date().toISOString(),
                    }],
                    clinicalTable: [{
                        patient_id: profile.patient?.patient_id || 'AK',
                        disease_site: profile.disease?.type || 'ovary',
                        tumor_subtype: profile.disease?.histology || 'HGSOC',
                    }],
                    ca125MeasurementsTable: profile.labs?.ca125_measurements || null,
                });
            } catch (e) {
                console.error('[ResistanceLab] Failed to load timing context:', e);
            }
        };
        loadContext();
    }, [computeTimingFeatures, timingFeatures]);

    // Auto-run when context is ready
    React.useEffect(() => {
        if (timingFeatures && !simulationResult && !loading) {
            handleSimulate();
        }
    }, [timingFeatures, simulationResult, loading]); // eslint-disable-line

    const handleGeneToggle = useCallback((gene, isMutated) => {
        setParams((prev) => ({
            ...prev,
            gene_toggles: { ...prev.gene_toggles, [gene]: isMutated },
        }));
    }, []);

    const handleSimulate = async () => {
        setLoading(true);
        setSimulationResult(null);
        try {
            const timingContext = buildTimingContext(timingFeatures);
            const response = await fetch('/api/ayesha/resistance/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...params, timing_context: timingContext }),
            });
            const data = await response.json();
            setSimulationResult(data);
        } catch (error) {
            console.error('[ResistanceLab] Simulation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const isVerified = simulationResult?.prediction?.provenance?.engine === 'ClinicalHeuristicEngine';

    return (
        <PageWrapper>
            <Container maxWidth="xl">
                {/* ── Header ─────────────────────────────────────────────── */}
                <HeaderPanel elevation={0}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
                                Resistance Intelligence
                            </Typography>
                            {isVerified && (
                                <Box sx={{
                                    border: '1px solid', borderColor: 'primary.main', color: 'primary.main',
                                    px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem',
                                    fontWeight: 'bold', letterSpacing: '0.5px',
                                    display: 'flex', alignItems: 'center', gap: 0.5,
                                }}>
                                    <BrainIcon sx={{ fontSize: 14 }} />
                                    Analysis Verified
                                </Box>
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            Your tumor's resistance profile — updated each cycle
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<ScienceIcon />}
                        onClick={handleSimulate}
                        disabled={loading}
                        sx={{ fontWeight: 'bold', '&:hover': { bgcolor: 'primary.dark' } }}
                    >
                        {loading ? 'Calculating...' : 'Update My Analysis'}
                    </Button>
                </HeaderPanel>

                {/* ── Onboarding ──────────────────────────────────────────── */}
                <Collapse in={showOnboarding}>
                    <Alert
                        severity="info"
                        sx={{ mb: 3 }}
                        action={
                            <IconButton size="small" onClick={() => setShowOnboarding(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                    >
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 0.5 }}>How this works</Typography>
                        <Typography variant="body2">
                            <strong>Left:</strong> Adjust your tumor settings and explore what each scenario means.&nbsp;
                            <strong>Center:</strong> See transparent step-by-step clinical reasoning.&nbsp;
                            <strong>Right:</strong> Your PARP sensitivity score and next clinical steps.
                        </Typography>
                    </Alert>
                </Collapse>

                {/* ── 3-Panel Layout ──────────────────────────────────────── */}
                <LabGrid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <TumorSettingsPanel
                            params={params}
                            setParams={setParams}
                            onGeneToggle={handleGeneToggle}
                        />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <ReasoningPanel
                            simulationResult={simulationResult}
                            loading={loading}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <OutcomePanel
                            simulationResult={simulationResult}
                            loading={loading}
                        />
                    </Grid>
                </LabGrid>
            </Container>
        </PageWrapper>
    );
};

export default ResistanceLab;
