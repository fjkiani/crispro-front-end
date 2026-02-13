import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    CircularProgress,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Science as ScienceIcon, Terminal as TerminalIcon, Psychology as BrainIcon } from '@mui/icons-material';

// Components (To be built)
import SimulationControls from '../../components/ayesha/resistance/SimulationControls';
import ResistanceLogicStream from '../../components/ayesha/resistance/ResistanceLogicStream';
import ProphetGauges from '../../components/ayesha/resistance/ProphetGauges';
import NextTestDisplay from '../../components/ayesha/resistance/NextTestDisplay';
import EMTRiskGauge from '../../components/ayesha/EMTRiskGauge'; // Day 3 Deliverable
import GeneToggle from '../../components/ayesha/GeneToggle'; // Day 3 Deliverable

// Hooks & Data (The Bridge)
import { useTimingChemoFeatures } from '../../hooks/useTimingChemoFeatures';
import { AYESHA_11_17_25_PROFILE } from '../../constants/patients/ayesha_11_17_25';

const PageWrapper = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: '#0a0e14', // Deep cyber dark
    color: '#e0e0e0',
    padding: theme.spacing(4, 2),
}));

const HeaderPanel = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(90deg, #1a202c 0%, #2d3748 100%)',
    border: '1px solid #4a5568',
    borderRadius: '8px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
}));

const LabGrid = styled(Grid)(({ theme }) => ({
    height: '80vh', // Fixed height for dashboard feel
}));

const PanelWrapper = styled(Paper)(({ theme }) => ({
    height: '100%',
    background: '#151b24',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'border-color 0.3s ease',
    '&:hover': {
        borderColor: '#4fd1c5', // Teal highlight
    },
}));

const PanelHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderBottom: '1px solid #2d3748',
    background: '#1a202c',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& .MuiTypography-root': {
        fontWeight: 700,
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#a0aec0',
    },
    '& .MuiSvgIcon-root': {
        color: '#4fd1c5',
        fontSize: '1.2rem',
    },
}));

const PanelContent = styled(Box)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(2),
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#4a5568',
        borderRadius: '3px',
    },
}));

const ResistanceLab = () => {
    const [loading, setLoading] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);
    const [params, setParams] = useState({
        simulate_germline: 'negative',
        simulate_hrd: 42,
        simulate_treatment: ['carboplatin', 'paclitaxel'],
        gene_toggles: {} // New: Specific gene state overrides
    });

    // Timing Engine Integration
    const { timingFeatures, computeTimingFeatures } = useTimingChemoFeatures();

    // Load Truth on Mount (Replicating AyeshaTrialExplorer pattern)
    React.useEffect(() => {
        const loadEngineContext = async () => {
            if (timingFeatures) return; // Already loaded

            const profile = AYESHA_11_17_25_PROFILE;
            const txHistory = profile.treatment_history || [];

            if (txHistory.length > 0) {
                const regimenTable = txHistory.map((tx, idx) => ({
                    patient_id: profile.patient?.patient_id || 'AK',
                    regimen_id: `regimen_${idx + 1}`,
                    regimen_start_date: tx.start_date || new Date().toISOString(),
                    regimen_end_date: tx.end_date || null,
                    regimen_type: tx.regimen_type || (tx.drugs?.join('+') || 'unknown'),
                    line_of_therapy: tx.line || idx + 1,
                    setting: tx.setting || (idx === 0 ? 'frontline' : 'recurrent'),
                    last_platinum_dose_date: tx.last_platinum_dose_date || null,
                    progression_date: tx.progression_date || null,
                    best_response: tx.outcome || tx.best_response || null,
                }));

                const survivalTable = [{
                    patient_id: profile.patient?.patient_id || 'AK',
                    vital_status: 'Alive',
                    death_date: null,
                    last_followup_date: new Date().toISOString(),
                }];

                const clinicalTable = [{
                    patient_id: profile.patient?.patient_id || 'AK',
                    disease_site: profile.disease?.type || 'ovary',
                    tumor_subtype: profile.disease?.histology || 'HGSOC',
                }];

                const ca125Measurements = profile.labs?.ca125_measurements || null;

                try {
                    console.log("[ResistanceLab] Bridging to Timing Engine...");
                    await computeTimingFeatures({
                        regimenTable,
                        survivalTable,
                        clinicalTable,
                        ca125MeasurementsTable: ca125Measurements
                    });
                } catch (e) {
                    console.error("[ResistanceLab] Failed to load timing context:", e);
                }
            }
        };
        loadEngineContext();
    }, [computeTimingFeatures, timingFeatures]);

    // Auto-Run Simulation Once Context is Ready (Day 3 UX)
    React.useEffect(() => {
        if (timingFeatures && !simulationResult && !loading) {
            console.log("[ResistanceLab] Auto-triggering simulation...");
            handleSimulate();
        }
    }, [timingFeatures, simulationResult, loading]);

    const handleGeneToggle = (gene, isMutated) => {
        setParams(prev => ({
            ...prev,
            gene_toggles: {
                ...prev.gene_toggles,
                [gene]: isMutated
            }
        }));
    };

    const transformToContract = (featuresData) => {
        if (!featuresData || !featuresData.timing_features_table) return null;

        const regimens = featuresData.timing_features_table.map(r => ({
            regimen_id: r.regimen_id,
            regimen_name: r.regimen_type,
            regimen_class: r.regimen_type, // simplified
            start_date: r.regimen_start_date,
            end_date: r.regimen_end_date,

            timing_features: {
                pfi_months: r.PFI_days ? (r.PFI_days / 30.4375) : null,
                ptpi_months: r.PTPI_days ? (r.PTPI_days / 30.4375) : null,
                tfi_months: r.TFI_days ? (r.TFI_days / 30.4375) : null,
                pfs_months: r.PFS_from_regimen_days ? (r.PFS_from_regimen_days / 30.4375) : null,
                os_months: r.OS_from_regimen_days ? (r.OS_from_regimen_days / 30.4375) : null,
                platinum_sensitivity_category: r.PFI_category
            },

            chemosensitivity_features: {
                kelim_ca125: r.kelim_category || r.kelim_k_value ? {
                    k: r.kelim_k_value,
                    kelim: r.kelim_value,
                    category: r.kelim_category,
                    modeling_approach: 'loglinear', // default for now
                    time_window_days: 100
                } : null,
                ca125_measurements_used: null // Not passed in flat view yet
            },

            data_quality: {
                has_regimen_history: true,
                has_ca125_data: r.has_ca125_data || false,
                warnings: []
            },

            source_refs: []
        }));

        return {
            schema_version: "patient_regimen_feature_table.v1",
            patient_id: "AK_11_17", // Should come from profile in real app
            disease_type: "ovarian_cancer",
            regimens: regimens,
            provenance: {
                computed_at: new Date().toISOString(),
                engine: "timing_chemosensitivity_engine",
                ruo_disclaimer: "Frontend-Bridge-Transformed",
                inputs_used: {
                    source: "precomputed_ca125_features"
                }
            }
        };
    };

    const handleSimulate = async () => {
        setLoading(true);
        setSimulationResult(null); // Clear previous
        try {
            // Transform Truth to Contract
            const timingContext = transformToContract(timingFeatures);
            console.log("[ResistanceLab] Injecting Contract:", timingContext);

            const response = await fetch('/api/ayesha/resistance/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...params,
                    timing_context: timingContext // Inject The Truth (Transformed)
                }),
            });
            const data = await response.json();
            setSimulationResult(data);
        } catch (error) {
            console.error("Simulation failed:", error);
            // Mock result for offline dev if needed
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <Container maxWidth="xl">
                <HeaderPanel elevation={0}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
                                RESISTANCE LAB <span style={{ color: '#4fd1c5', fontSize: '0.6em', verticalAlign: 'super' }}>BETA</span>
                            </Typography>
                            {simulationResult?.prediction?.provenance?.engine === 'ClinicalHeuristicEngine' && (
                                <Box sx={{
                                    border: '1px solid #4fd1c5',
                                    color: '#4fd1c5',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}>
                                    <BrainIcon sx={{ fontSize: 14 }} />
                                    ENGINE-VERIFIED
                                </Box>
                            )}
                        </Box>
                        <Typography variant="subtitle2" sx={{ color: '#a0aec0', mt: 0.5 }}>
                            PROPHET ENGINE V2.0 // GLASS BOX SIMULATION
                        </Typography>
                    </Box>
                    <Box>
                        {/* Status indicators like CPU load could go here */}
                        <Button
                            variant="contained"
                            startIcon={<ScienceIcon />}
                            onClick={handleSimulate}
                            disabled={loading}
                            sx={{
                                bgcolor: '#4fd1c5',
                                color: '#000',
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: '#38b2ac' }
                            }}
                        >
                            {loading ? 'CALCULATING...' : 'RUN SIMULATION'}
                        </Button>
                    </Box>
                </HeaderPanel>

                <LabGrid container spacing={3}>
                    {/* LEFT: CONTROLS */}
                    <Grid item xs={12} md={3}>
                        <PanelWrapper>
                            <PanelHeader>
                                <ScienceIcon />
                                <Typography>Simulation Inputs</Typography>
                            </PanelHeader>
                            <PanelContent>
                                <SimulationControls params={params} setParams={setParams} />
                                <Box sx={{ mt: 3 }}>
                                    <GeneToggle
                                        genes={{
                                            "NF1": params.gene_toggles?.["NF1"] || false,
                                            "BRCA1": params.gene_toggles?.["BRCA1"] || false,
                                            "TP53": params.gene_toggles?.["TP53"] || false,
                                            "PTEN": params.gene_toggles?.["PTEN"] || false
                                        }}
                                        onToggle={handleGeneToggle}
                                    />
                                </Box>
                            </PanelContent>
                        </PanelWrapper>
                    </Grid>

                    {/* CENTER: LOGIC STREAM (The Glass Box) */}
                    <Grid item xs={12} md={5}>
                        <PanelWrapper>
                            <PanelHeader>
                                <TerminalIcon />
                                <Typography>Logic Stream</Typography>
                            </PanelHeader>
                            <PanelContent sx={{ bgcolor: '#000', fontFamily: 'monospace' }}>
                                {loading && (
                                    <Box sx={{ display: 'center', justifyContent: 'center', p: 4, color: '#4fd1c5' }}>
                                        <CircularProgress color="inherit" size={24} />
                                        <Typography sx={{ mt: 2, fontSize: '0.8rem' }}>Executing Prophet Algorithms...</Typography>
                                    </Box>
                                )}
                                {simulationResult && (
                                    <ResistanceLogicStream steps={simulationResult.logic_steps} />
                                )}
                                {!simulationResult && !loading && (
                                    <Typography sx={{ color: '#4a5568', p: 2, textAlign: 'center' }}>
                                        Waiting for input...
                                    </Typography>
                                )}
                            </PanelContent>
                        </PanelWrapper>
                    </Grid>

                    {/* RIGHT: OUTCOME */}
                    <Grid item xs={12} md={4}>
                        <PanelWrapper>
                            <PanelHeader>
                                <BrainIcon />
                                <Typography>Clinical Orders</Typography>
                            </PanelHeader>
                            <PanelContent>
                                {simulationResult && (
                                    <>
                                        <ProphetGauges prediction={simulationResult.prediction} />

                                        {/* Day 3 Widget: EMTRiskGauge */}
                                        {/* Extract risk score if available, or mock for demo if engine doesn't return it yet */}
                                        <Box sx={{ mt: 2 }}>
                                            <EMTRiskGauge
                                                // Assuming engine returns transcription_risk or we infer it
                                                // For now, let's look for a signal "GENE_LEVEL_RESISTANCE" or similar
                                                riskScore={simulationResult.prediction?.probability || 0}
                                                zScore={simulationResult.prediction?.provenance?.transcriptomic_z_score}
                                            />
                                        </Box>

                                        <Divider sx={{ my: 3, borderColor: '#2d3748' }} />
                                        <NextTestDisplay tests={simulationResult.recommended_tests} />
                                    </>
                                )}
                            </PanelContent>
                        </PanelWrapper>
                    </Grid>
                </LabGrid>
            </Container>
        </PageWrapper>
    );
};

export default ResistanceLab;
