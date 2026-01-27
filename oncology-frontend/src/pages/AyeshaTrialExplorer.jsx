/**
 * Ayesha Trial Explorer Page
 * 
 * Precision trial matching for Ayesha's Stage IVB ovarian cancer.
 * Displays top 10 ranked trials with transparent reasoning.
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper, Grid, Tabs, Tab, Chip } from '@mui/material';
import TrialMatchCard from '../components/trials/TrialMatchCard';
import TrialSafetyGate from '../components/safety/TrialSafetyGate';
import SafetyGateCard from '../components/safety/SafetyGateCard';
import CA125Tracker from '../components/ayesha/CA125Tracker';
import SOCRecommendationCard from '../components/ayesha/SOCRecommendationCard';
import NextTestCard from '../components/ayesha/NextTestCard';
import HintTilesPanel from '../components/ayesha/HintTilesPanel';
import MechanismChips from '../components/ayesha/MechanismChips';
import ResistanceAlertBanner from '../components/ayesha/ResistanceAlertBanner';
import ResistancePlaybook from '../components/ayesha/ResistancePlaybook';
import AyeshaSAEFeaturesCard from '../components/ayesha/AyeshaSAEFeaturesCard';
import DrugRankingPanel from '../components/ayesha/DrugRankingPanel';
import FoodRankingPanel from '../components/ayesha/FoodRankingPanel';
import {
  MechanismVectorVisualization,
  SLOpportunityBanner,
  PathwayDisruptionCard,
  EssentialPathwaysCard,
  SLDrugRecommendations,
} from '../components/ayesha';
import { SyntheticLethalityCard } from '../components/orchestrator/Analysis/SyntheticLethalityCard';
import { useSyntheticLethality } from '../hooks/useSyntheticLethality';
import { useTimingChemoFeatures } from '../hooks/useTimingChemoFeatures';
import {
  TimingFeaturesCard,
  TreatmentHistoryTimeline,
  ChemosensitivityFeaturesCard,
} from '../components/timing';
import { AYESHA_11_17_25_PROFILE } from '../constants/patients/ayesha_11_17_25';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const AyeshaTrialExplorer = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Core data
  const [trials, setTrials] = useState([]);
  const [ca125Intelligence, setCa125Intelligence] = useState(null);
  const [socRecommendation, setSocRecommendation] = useState(null);
  const [nextTestRecommender, setNextTestRecommender] = useState(null);
  const [hintTiles, setHintTiles] = useState([]);
  const [mechanismMap, setMechanismMap] = useState(null);
  const [resistanceAlert, setResistanceAlert] = useState(null);
  const [resistancePlaybook, setResistancePlaybook] = useState(null);
  const [saeFeatures, setSaeFeatures] = useState(null);
  
  // NEW: Drug efficacy (WIWFM) and Food validation
  const [wiwfm, setWiwfm] = useState(null);
  const [foodValidation, setFoodValidation] = useState(null);
  const [resistancePrediction, setResistancePrediction] = useState(null);
  
  // NEW: Synthetic Lethality (SL) analysis
  const { slResult, loading: slLoading, error: slError, analyzeSL } = useSyntheticLethality();
  
  // NEW: Timing & Chemosensitivity Features
  const {
    timingFeatures,
    loading: timingLoading,
    error: timingError,
    computeTimingFeatures,
  } = useTimingChemoFeatures();
  
  // Meta
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provenance, setProvenance] = useState(null);
  const [summary, setSummary] = useState(null);

  // Extract PGx-flagged drugs from WIWFM response (post-orchestrator enrichment)
  const getPGxDrugs = () => {
    if (!wiwfm?.drugs) return [];
    return (wiwfm.drugs || []).filter((d) => {
      const pgx = d?.pgx_screening;
      if (!pgx) return false;
      const tier = pgx.toxicity_tier;
      const af = typeof pgx.adjustment_factor === 'number' ? pgx.adjustment_factor : 1.0;
      return tier === 'HIGH' || tier === 'MODERATE' || af < 1.0;
    });
  };

  useEffect(() => {
    loadTrials();
    // Trigger SL analysis on page load
    analyzeSL(AYESHA_11_17_25_PROFILE);
  }, []);

  const loadTrials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use patient profile from source-of-truth constant
      const profile = AYESHA_11_17_25_PROFILE;
      
      // Map treatment_line: 0 = frontline, >0 = recurrent
      const treatmentLineValue = profile.inferred_fields?.treatment_line?.value ?? 0;
      const treatmentLine = treatmentLineValue === 0 ? "frontline" : "recurrent";
      
      // Build tumor context from profile
      const biomarkers = profile.tumor_context?.biomarkers || {};
      const tumorContext = {
        p53_status: biomarkers.p53_status || null,
        pd_l1: biomarkers.pd_l1_status ? {
          cps: biomarkers.pd_l1_cps || null,
          status: biomarkers.pd_l1_status
        } : null,
        er_percent: biomarkers.er_percent || null,
        er_status: biomarkers.er_status || null,
        pr_status: biomarkers.pr_status || null,
        mmr_status: biomarkers.mmr_status || null,
        her2_status: biomarkers.her2_status || null,
        folr1_status: biomarkers.folr1_status || null,
        ntrk_status: biomarkers.ntrk_status || null,
        // Include somatic mutations if available
        somatic_mutations: profile.tumor_context?.somatic_mutations || [],
        // Include germline variants
        germline_variants: profile.germline?.mutations?.map(m => ({
          gene: m.gene,
          variant: m.variant,
          classification: m.classification
        })) || []
      };

      // Use unified complete_care_v2 endpoint with ALL capabilities enabled
      const response = await fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Ayesha's profile from source-of-truth constant (Patient 11-17-25)
          stage: profile.disease?.stage || "IVB",
          treatment_line: treatmentLine,
          germline_status: profile.germline_status || "positive", // MBD4 mutation = positive
          location_state: profile.patient?.demographics?.location_state || "NY",
          // Clinical findings from profile
          has_ascites: profile.clinical?.has_ascites || false,
          has_peritoneal_disease: profile.clinical?.has_peritoneal_disease || false,
          // CA-125 value (null if not available)
          ca125_value: profile.labs?.ca125_value || null,
          // Enable ALL capabilities
          include_trials: true,
          include_soc: true,
          include_ca125: true,
          include_wiwfm: true,
          include_food: true,
          include_resistance: true,
          include_resistance_prediction: true,
          max_trials: 10,
          // Ayesha's tumor context from pathology report (11-17-25)
          tumor_context: tumorContext
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract ALL sections from unified response
      setTrials(data.trials?.trials || []);
      setCa125Intelligence(data.ca125_intelligence);
      setSocRecommendation(data.soc_recommendation || null);
      setNextTestRecommender(data.next_test_recommender || null);
      setHintTiles(data.hint_tiles?.hint_tiles || []);
      setMechanismMap(data.mechanism_map || null);
      setResistanceAlert(data.resistance_alert || null);
      setResistancePlaybook(data.resistance_playbook || null);
      setSaeFeatures(data.sae_features || null);
      
      // NEW: Extract WIWFM, Food, Resistance Prophet
      setWiwfm(data.wiwfm || null);
      setFoodValidation(data.food_validation || null);
      setResistancePrediction(data.resistance_prediction || null);
      
      // Meta
      setProvenance(data.provenance);
      setSummary(data.summary);

    } catch (err) {
      console.error('Failed to load complete care:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading trials...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load trials: {error}
        </Alert>
      </Box>
    );
  }

  // Calculate opportunity score (unified scoring across all capabilities)
  const calculateOpportunityScore = () => {
    let score = 0;
    let maxScore = 0;
    
    // Trials (20 points max)
    if (trials.length > 0) {
      score += Math.min(trials.length * 2, 20);
    }
    maxScore += 20;
    
    // SOC (15 points)
    if (socRecommendation?.confidence) {
      score += socRecommendation.confidence * 15;
    }
    maxScore += 15;
    
    // CA-125 trackable (10 points)
    if (ca125Intelligence?.burden_class) {
      score += 10;
    }
    maxScore += 10;
    
    // Drug efficacy available (20 points)
    if (wiwfm?.drugs?.length > 0 || wiwfm?.status !== 'awaiting_ngs') {
      score += 20;
    } else if (wiwfm?.status === 'awaiting_ngs') {
      score += 5; // Partial credit for pathway-only
    }
    maxScore += 20;
    
    // SAE features (15 points)
    if (saeFeatures?.dna_repair_capacity !== undefined) {
      score += 15;
    }
    maxScore += 15;
    
    // Resistance playbook (10 points)
    if (resistancePlaybook?.risks?.length > 0) {
      score += 10;
    }
    maxScore += 10;
    
    // Resistance prediction (10 points)
    if (resistancePrediction?.risk_level) {
      score += 10;
    }
    maxScore += 10;
    
    return Math.round((score / maxScore) * 100);
  };

  const opportunityScore = calculateOpportunityScore();

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header with Opportunity Score */}
      <Box mb={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {AYESHA_11_17_25_PROFILE.patient?.display_name || 'Ayesha'}'s Complete Care Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stage {AYESHA_11_17_25_PROFILE.disease?.stage || 'IVB'} {AYESHA_11_17_25_PROFILE.disease?.histology?.replace(/_/g, ' ') || 'High-Grade Serous Carcinoma'} ({AYESHA_11_17_25_PROFILE.disease?.primary_site || 'Mullerian origin'}) • 
            {AYESHA_11_17_25_PROFILE.tumor_context?.biomarkers?.pd_l1_status === 'POSITIVE' 
              ? ` PD-L1+ (CPS ${AYESHA_11_17_25_PROFILE.tumor_context.biomarkers.pd_l1_cps || 'N/A'})` 
              : ' PD-L1-'} • 
            {AYESHA_11_17_25_PROFILE.tumor_context?.biomarkers?.p53_status === 'MUTANT_TYPE' ? ' p53 mutant type' : ''}
          </Typography>
        </Box>
        <Paper sx={{ p: 2, bgcolor: opportunityScore >= 70 ? 'success.light' : opportunityScore >= 40 ? 'warning.light' : 'error.light' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            {opportunityScore}%
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
            Opportunity Score
          </Typography>
        </Paper>
      </Box>

      {/* Profile Summary with Biomarkers */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Patient Profile ({AYESHA_11_17_25_PROFILE.meta?.last_updated?.split('-').slice(1).join('/') || '11-17-25'})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={`Stage ${AYESHA_11_17_25_PROFILE.disease?.stage || 'IVB'}`} 
            color="error" 
            size="small" 
          />
          <Chip 
            label={AYESHA_11_17_25_PROFILE.labs?.ca125_value 
              ? `CA-125: ${AYESHA_11_17_25_PROFILE.labs.ca125_value.toLocaleString()} ${AYESHA_11_17_25_PROFILE.labs.ca125_units || 'U/mL'}` 
              : "CA-125: not provided"} 
            variant={AYESHA_11_17_25_PROFILE.labs?.ca125_value ? "filled" : "outlined"} 
            color={AYESHA_11_17_25_PROFILE.labs?.ca125_value ? "success" : "warning"} 
            size="small" 
          />
          <Chip 
            label={`Germline: ${AYESHA_11_17_25_PROFILE.germline_status === 'positive' ? 'Positive (MBD4)' : 'Negative'}`} 
            color={AYESHA_11_17_25_PROFILE.germline_status === 'positive' ? 'error' : 'default'} 
            size="small" 
          />
          {AYESHA_11_17_25_PROFILE.tumor_context?.biomarkers?.pd_l1_status === 'POSITIVE' && (
            <Chip 
              label={`PD-L1+ (CPS ${AYESHA_11_17_25_PROFILE.tumor_context.biomarkers.pd_l1_cps || 'N/A'})`} 
              color="success" 
              size="small" 
            />
          )}
          {AYESHA_11_17_25_PROFILE.tumor_context?.biomarkers?.p53_status === 'MUTANT_TYPE' && (
            <Chip label="p53 Mutant" color="info" size="small" />
          )}
          {AYESHA_11_17_25_PROFILE.tumor_context?.biomarkers?.mmr_status === 'PRESERVED' && (
            <Chip label="MMR Preserved" size="small" />
          )}
          {AYESHA_11_17_25_PROFILE.tumor_context?.biomarkers?.er_status && (
            <Chip 
              label={`ER ${AYESHA_11_17_25_PROFILE.tumor_context.biomarkers.er_status.replace('_', ' ')}`} 
              size="small" 
            />
          )}
          {AYESHA_11_17_25_PROFILE.tumor_context?.biomarkers?.her2_status === 'NEGATIVE' && (
            <Chip label="HER2-" size="small" />
          )}
          {AYESHA_11_17_25_PROFILE.tumor_context?.biomarkers?.folr1_status === 'NEGATIVE' && (
            <Chip label="FOLR1-" size="small" />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          <strong>Components Loaded:</strong> {summary?.components_included?.join(', ') || 'Loading...'}
        </Typography>
      </Paper>

      {/* NEW: SL Opportunity Banner (if detected) */}
      <SLOpportunityBanner
        slDetected={slResult?.synthetic_lethality_detected}
        suggestedTherapy={slResult?.suggested_therapy}
        doubleHitDescription={slResult?.double_hit_description}
        confidence={slResult?.recommended_drugs?.[0]?.confidence}
        onViewDetails={() => setActiveTab(5)} // Navigate to SL tab
      />

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label={`Overview`} />
          <Tab label={`Trials (${trials.length})`} />
          <Tab label="Treatment" />
          <Tab label="Monitoring" />
          <Tab label="Resistance" />
          <Tab label={`Synthetic Lethality${slResult?.synthetic_lethality_detected ? ' ⚡' : ''}`} />
        </Tabs>
      </Paper>

      {/* Resistance Alert Banner (always visible if triggered) */}
      {resistanceAlert && resistanceAlert.alert_triggered && (
        <Box mb={3}>
          <ResistanceAlertBanner resistance_alert={resistanceAlert} />
        </Box>
      )}

      {/* TAB 0: OVERVIEW */}
      {activeTab === 0 && (
        <Box>
          {/* NEW: Mechanism Intelligence Section */}
          <Box mb={3}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mb: 2,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              🧬 Mechanism Intelligence
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 2 }}>
              <Grid item xs={12} md={6}>
                <MechanismVectorVisualization
                  mechanismVector={[0.88, 0.12, 0.15, 0.10, 0.05, 0.2, 0.0]}
                  mutations={[
                    ...(AYESHA_11_17_25_PROFILE.germline?.mutations || []),
                    ...(AYESHA_11_17_25_PROFILE.tumor_context?.somatic_mutations || [])
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PathwayDisruptionCard brokenPathways={slResult?.broken_pathways} />
              </Grid>
              {slResult?.essential_pathways && slResult.essential_pathways.length > 0 && (
                <Grid item xs={12}>
                  <EssentialPathwaysCard essentialPathways={slResult.essential_pathways} />
                </Grid>
              )}
            </Grid>
          </Box>

          {/* SOC Recommendation */}
          {socRecommendation && (
            <Box mb={3}>
              <SOCRecommendationCard {...socRecommendation} />
            </Box>
          )}

          {/* Hint Tiles + Next Tests */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
              <NextTestCard recommendations={nextTestRecommender?.recommendations || []} />
            </Grid>
            <Grid item xs={12} md={8}>
              <HintTilesPanel tiles={hintTiles} />
            </Grid>
          </Grid>

          {/* Mechanism Map */}
          {mechanismMap && (
            <Box mb={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🧬 Pathway Mechanism Map
                </Typography>
                <MechanismChips mechanism_map={mechanismMap} />
              </Paper>
            </Box>
          )}

          {/* SAE Features */}
          {saeFeatures && saeFeatures.status !== 'awaiting_ngs' && (
            <Box mb={3}>
              <AyeshaSAEFeaturesCard sae_features={saeFeatures} />
            </Box>
          )}
        </Box>
      )}

      {/* TAB 1: TRIALS */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Top {trials.length} Clinical Trials
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ranked by match score with transparent reasoning • PD-L1+ and p53 mutant boost IO and DDR trials
          </Typography>
          
          {trials.length === 0 ? (
            <Alert severity="info">
              No trials found matching {AYESHA_11_17_25_PROFILE.patient?.display_name || 'Patient'}'s profile. Try adjusting filters or check back later.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {trials.map((trial, index) => (
                <Box key={trial.nct_id || index}>
                  <TrialMatchCard
                    trial={trial}
                    rank={index + 1}
                  />
                  {/* PGx Trial Safety Gate (RUO) */}
                  {trial?.pgx_safety && (
                    <TrialSafetyGate trial={trial} />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 2: TREATMENT (SOC + Drug Efficacy + Food + Timing) */}
      {activeTab === 2 && (
        <Box>
          {/* SOC */}
          {socRecommendation && (
            <Box mb={3}>
              <SOCRecommendationCard {...socRecommendation} />
            </Box>
          )}

          {/* NEW: Treatment History & Timing Features */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              ⏱️ Treatment History & Timing
            </Typography>
            {(() => {
              // Check if patient has treatment history
              const treatmentHistory = AYESHA_11_17_25_PROFILE.treatment_history || [];
              const treatmentLine = AYESHA_11_17_25_PROFILE.inferred_fields?.treatment_line?.value || 0;
              
              // If treatment-naive, show helpful message
              if (treatmentLine === 0 && (!treatmentHistory || treatmentHistory.length === 0)) {
                return (
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Treatment-Naive Patient:</strong> Timing features (PFI, PTPI, TFI, PFS, OS, KELIM) 
                      will be available once treatment begins. These metrics help assess treatment response 
                      and guide future therapy decisions.
                    </Typography>
                  </Alert>
                );
              }

              // If treatment history exists, compute timing features
              if (treatmentHistory && treatmentHistory.length > 0 && !timingFeatures && !timingLoading) {
                // Build request data from treatment history
                const regimenTable = treatmentHistory.map((tx, idx) => ({
                  patient_id: AYESHA_11_17_25_PROFILE.patient?.patient_id || 'AK',
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
                  patient_id: AYESHA_11_17_25_PROFILE.patient?.patient_id || 'AK',
                  vital_status: 'Alive', // Default - should be updated from patient data
                  death_date: null,
                  last_followup_date: new Date().toISOString(),
                }];

                const clinicalTable = [{
                  patient_id: AYESHA_11_17_25_PROFILE.patient?.patient_id || 'AK',
                  disease_site: AYESHA_11_17_25_PROFILE.disease?.type?.replace(/_/g, ' ') || 'ovary',
                  tumor_subtype: AYESHA_11_17_25_PROFILE.disease?.histology || 'HGSOC',
                }];

                // CA-125 measurements if available
                const ca125Measurements = AYESHA_11_17_25_PROFILE.labs?.ca125_measurements || null;

                // Trigger computation
                computeTimingFeatures({
                  regimenTable,
                  survivalTable,
                  clinicalTable,
                  ca125MeasurementsTable: ca125Measurements,
                }).catch(err => {
                  console.error('[AyeshaTrialExplorer] Timing features computation failed:', err);
                });
              }

              // Display timing features
              if (timingLoading) {
                return (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      Computing timing and chemosensitivity features...
                    </Typography>
                  </Box>
                );
              }

              if (timingError) {
                return (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Error computing timing features:</strong> {timingError}
                    </Typography>
                  </Alert>
                );
              }

              if (timingFeatures?.timing_features_table && timingFeatures.timing_features_table.length > 0) {
                return (
                  <Grid container spacing={3}>
                    {/* Timeline View */}
                    <Grid item xs={12}>
                      <TreatmentHistoryTimeline
                        timingFeaturesTable={timingFeatures.timing_features_table}
                        orientation="vertical"
                        showTFI={true}
                        showPFI={true}
                        showPTPI={true}
                      />
                    </Grid>

                    {/* Individual Regimen Cards */}
                    {timingFeatures.timing_features_table.map((features, idx) => (
                      <Grid item xs={12} md={6} key={features.regimen_id || idx}>
                        <TimingFeaturesCard
                          timingFeatures={features}
                          showDetails={true}
                          highlightPFI={true}
                          highlightPTPI={true}
                        />
                        {/* KELIM/CA-125 Features */}
                        {features.has_ca125_data && (
                          <ChemosensitivityFeaturesCard
                            kelimFeatures={{
                              kelim_k_value: features.kelim_k_value,
                              kelim_category: features.kelim_category,
                              ca125_percent_change_day21: features.ca125_percent_change_day21,
                              ca125_percent_change_day42: features.ca125_percent_change_day42,
                              ca125_time_to_50pct_reduction_days: features.ca125_time_to_50pct_reduction_days,
                              ca125_normalized_by_cycle3: features.ca125_normalized_by_cycle3,
                            }}
                            diseaseSite={features.disease_site || 'ovary'}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                );
              }

              return null;
            })()}
          </Box>

          {/* Drug Efficacy (WIWFM) */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              💊 Drug Efficacy Ranking (WIWFM)
            </Typography>
            {wiwfm?.status === 'awaiting_ngs' ? (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Awaiting NGS Data:</strong> {wiwfm.message}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  NGS Fast-Track: {wiwfm.ngs_fast_track?.ctDNA}
                </Typography>
              </Alert>
            ) : wiwfm?.drugs ? (
              <DrugRankingPanel drugs={wiwfm.drugs} />
            ) : (
              <Alert severity="info">Drug efficacy data not available</Alert>
            )}
          </Box>

          {/* Food Validation */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              🥗 Food/Supplement Validation
            </Typography>
            {foodValidation ? (
              <FoodRankingPanel foods={[foodValidation]} />
            ) : (
              <Alert severity="info">
                Food validation not requested. Enable with a specific food query (e.g., "curcumin").
              </Alert>
            )}
          </Box>
        </Box>
      )}

      {/* TAB 3: MONITORING (CA-125) */}
      {activeTab === 3 && (
        <Box>
          {/* CA-125 Tracker */}
          {ca125Intelligence && (
            <Box mb={3}>
              <CA125Tracker
                current_value={AYESHA_11_17_25_PROFILE.labs?.ca125_value || null}
                burden_class={ca125Intelligence.burden_class || ca125Intelligence.disease_burden}
                forecast={ca125Intelligence.forecast || ca125Intelligence.expected_response}
                resistance_rule={ca125Intelligence.resistance_signals}
                monitoring_strategy={ca125Intelligence.monitoring_strategy}
              />
            </Box>
          )}

          {/* Next Test Recommender */}
          <Box mb={3}>
            <NextTestCard recommendations={nextTestRecommender?.recommendations || []} />
          </Box>
        </Box>
      )}

      {/* TAB 4: RESISTANCE */}
      {activeTab === 4 && (
        <Box>
          {/* Resistance Alert */}
          {resistanceAlert && (
            <Box mb={3}>
              <ResistanceAlertBanner resistance_alert={resistanceAlert} />
            </Box>
          )}

          {/* Resistance Playbook */}
          {resistancePlaybook ? (
            <Box mb={3}>
              <ResistancePlaybook resistance_playbook={resistancePlaybook} />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              Resistance playbook requires tumor NGS data.
            </Alert>
          )}

          {/* Resistance Prophet Prediction */}
          {resistancePrediction && (
            <Box mb={3}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🔮 Resistance Prophet (3-6 Month Early Warning)
                </Typography>
                {resistancePrediction.status === 'insufficient_data' ? (
                  <Alert severity="warning">{resistancePrediction.message || 'Insufficient data for resistance prediction'}</Alert>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Chip 
                        label={`Risk: ${resistancePrediction.risk_level || 'UNKNOWN'}`} 
                        color={resistancePrediction.risk_level === 'HIGH' ? 'error' : resistancePrediction.risk_level === 'MEDIUM' ? 'warning' : 'success'}
                      />
                      {resistancePrediction.probability !== undefined && (
                        <Chip label={`Probability: ${Math.round((resistancePrediction.probability || 0) * 100)}%`} />
                      )}
                      {resistancePrediction.confidence !== undefined && (
                        <Chip label={`Confidence: ${Math.round((resistancePrediction.confidence || 0) * 100)}%`} variant="outlined" />
                      )}
                    </Box>
                    {resistancePrediction.rationale && (
                      <Typography variant="body2" color="text.secondary">
                        {resistancePrediction.rationale}
                      </Typography>
                    )}
                    {resistancePrediction.recommended_actions && Array.isArray(resistancePrediction.recommended_actions) && resistancePrediction.recommended_actions.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Recommended Actions:</Typography>
                        <ul>
                          {resistancePrediction.recommended_actions.map((action, idx) => {
                            // Handle both string and object formats
                            let actionText = '';
                            if (typeof action === 'string') {
                              actionText = action;
                            } else if (typeof action === 'object' && action !== null) {
                              // Extract text from object (could have action, rationale, timeframe, etc.)
                              actionText = action.action || action.rationale || action.text || JSON.stringify(action);
                            } else {
                              actionText = String(action);
                            }
                            return (
                              <li key={idx}>
                                <Typography variant="body2">{actionText}</Typography>
                              </li>
                            );
                          })}
                        </ul>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          )}

          {/* SAE Features */}
          {saeFeatures && saeFeatures.status !== 'awaiting_ngs' && (
            <Box mb={3}>
              <AyeshaSAEFeaturesCard sae_features={saeFeatures} />
            </Box>
          )}
        </Box>
      )}

      {/* TAB 5: SYNTHETIC LETHALITY */}
      {activeTab === 5 && (
        <Box>
          {slLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Analyzing synthetic lethality opportunities...
              </Typography>
            </Box>
          )}

          {slError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Error:</strong> {slError}
              </Typography>
            </Alert>
          )}

          {slResult && !slLoading && (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Full SL Analysis Card */}
              <Grid item xs={12}>
                <SyntheticLethalityCard slResult={slResult} loading={slLoading} />
              </Grid>

              {/* Essential Pathways */}
              {slResult.essential_pathways && slResult.essential_pathways.length > 0 && (
                <Grid item xs={12} md={6}>
                  <EssentialPathwaysCard essentialPathways={slResult.essential_pathways} />
                </Grid>
              )}

              {/* SL Drug Recommendations */}
              {slResult.recommended_drugs && slResult.recommended_drugs.length > 0 && (
                <Grid item xs={12} md={6}>
                  <SLDrugRecommendations recommendedDrugs={slResult.recommended_drugs} />
                </Grid>
              )}

              {/* Pathway Disruption (if not shown in Overview) */}
              {slResult.broken_pathways && slResult.broken_pathways.length > 0 && (
                <Grid item xs={12}>
                  <PathwayDisruptionCard brokenPathways={slResult.broken_pathways} />
                </Grid>
              )}
            </Grid>
          )}

          {!slResult && !slLoading && !slError && (
            <Alert severity="info">
              <Typography variant="body2">
                No synthetic lethality analysis available. Click "Analyze" to run SL detection.
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Provenance Bar */}
      {provenance && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Run ID:</strong> {provenance.run_id} • 
            <strong> Components:</strong> {provenance.endpoints_called?.join(', ')} • 
            <strong> NGS Status:</strong> {provenance.ngs_status}
          </Typography>
        </Paper>
      )}

      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="caption">
          <strong>Research Use Only (RUO):</strong> This tool is for research purposes only. 
          All trial recommendations should be reviewed by a qualified oncologist before making treatment decisions.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AyeshaTrialExplorer;

