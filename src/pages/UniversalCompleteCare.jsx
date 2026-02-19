import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  CircularProgress
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

// Import reusable components
import DrugRankingPanel from '../components/ayesha/DrugRankingPanel';
import { DrugRankingCard } from '../components/orchestrator/Analysis/DrugRankingCard';
import { BiomarkerCard } from '../components/orchestrator/Analysis/BiomarkerCard';
import { ResistanceCard } from '../components/orchestrator/Analysis/ResistanceCard';
import { ToxicityRiskCard } from '../components/ClinicalGenomicsCommandCenter/cards/ToxicityRiskCard';
import SafetyGateCard from '../components/safety/SafetyGateCard';
import TrialSafetyGate from '../components/safety/TrialSafetyGate';
import { TrialMatchesCard } from '../components/orchestrator/Analysis/TrialMatchesCard';
import SOCRecommendationCard from '../components/ayesha/SOCRecommendationCard';
import NextTestCard from '../components/ayesha/NextTestCard';
import HintTilesPanel from '../components/ayesha/HintTilesPanel';
import MechanismChips from '../components/ayesha/MechanismChips';
import TumorQuickIntakeForm from '../components/ayesha/TumorQuickIntakeForm';
import CA125Tracker from '../components/ayesha/CA125Tracker';
import ResistanceAlertBanner from '../components/ayesha/ResistanceAlertBanner';
import ResistancePlaybook from '../components/ayesha/ResistancePlaybook';
import AyeshaSAEFeaturesCard from '../components/ayesha/AyeshaSAEFeaturesCard';
import ProvenancePanel from '../components/food/ProvenancePanel';
import { CompleteCareLoadingSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/complete-care/ErrorState';
import EmptyState from '../components/complete-care/EmptyState';


// Import main patient profile constant
import { AYESHA_11_17_25_PROFILE } from '../constants/patients';
import { API_ROOT } from '../lib/apiConfig';

/**
 * UniversalCompleteCare - Universal complete care plan page
 * 
 * Works with any patient profile (not just Ayesha).
 * Orchestrates all MOAT capabilities via /api/ayesha/complete_care_v2.
 */

export default function UniversalCompleteCare() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  // State - Initialize with main patient profile constant if no patientId
  const [patientProfile, setPatientProfile] = useState(patientId ? null : AYESHA_11_17_25_PROFILE);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);

  // Load patient profile if patientId provided
  useEffect(() => {
    if (patientId) {
      loadPatientProfile(patientId);
    }
    // If no patientId, we already initialized with AYESHA_11_17_25_PROFILE
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]); // Only depend on patientId

  // Note: Auto-generation removed - user must click "Generate" button explicitly

  const loadPatientProfile = async (id) => {
    try {
      const response = await fetch(`${API_ROOT}/api/patients/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPatientProfile(data);
      } else {
        // Fallback to main patient profile constant
        setPatientProfile(AYESHA_11_17_25_PROFILE);
      }
    } catch (err) {
      console.error('Failed to load patient profile:', err);
      setPatientProfile(AYESHA_11_17_25_PROFILE);
    }
  };

  /**
   * Compute SAE mechanism vector from tumor_context
   * Returns 7D vector: [DDR, MAPK, PI3K, VEGF, HER2, IO, Efflux]
   */
  const computeSAEVector = (tumorContext) => {
    if (!tumorContext) return [0, 0, 0, 0, 0, 0, 0];
    
    const vector = [0, 0, 0, 0, 0, 0, 0];
    
    // DDR inference (BRCA, HRD, p53 mutant, MBD4)
    const mutations = tumorContext.somatic_mutations || [];
    const hasBRCA = mutations.some(m => ['BRCA1', 'BRCA2'].includes(m.gene?.toUpperCase()));
    const hasP53 = mutations.some(m => m.gene?.toUpperCase() === 'TP53');
    const hasMBD4 = mutations.some(m => m.gene?.toUpperCase() === 'MBD4');
    const hrdScore = tumorContext.hrd_score || 0;
    
    if (hasBRCA || hrdScore >= 42 || hasP53 || hasMBD4) {
      vector[0] = Math.min(0.95, 0.5 + (hrdScore / 100) + (hasBRCA ? 0.2 : 0) + (hasP53 ? 0.1 : 0));
    }
    
    // MAPK inference (KRAS, NRAS, BRAF)
    const hasMAPK = mutations.some(m => ['KRAS', 'NRAS', 'BRAF'].includes(m.gene?.toUpperCase()));
    if (hasMAPK) vector[1] = 0.75;
    
    // PI3K inference (PIK3CA, PTEN)
    const hasPI3K = mutations.some(m => ['PIK3CA', 'PTEN'].includes(m.gene?.toUpperCase()));
    if (hasPI3K) vector[2] = 0.70;
    
    // VEGF inference (ascites, peritoneal disease)
    if (tumorContext.has_ascites || tumorContext.has_peritoneal_disease) {
      vector[3] = 0.60;
    }
    
    // HER2 inference
    const hasHER2 = mutations.some(m => ['ERBB2', 'HER2'].includes(m.gene?.toUpperCase()));
    if (hasHER2 || tumorContext.her2_status === 'positive') {
      vector[4] = 0.85;
    }
    
    // IO inference (PD-L1, TMB, MSI)
    const tmb = tumorContext.tmb || 0;
    const msiHigh = tumorContext.msi_status === 'high';
    const pdl1Positive = (tumorContext.pd_l1?.cps >= 1) || (tumorContext.pd_l1?.tps >= 1);
    if (pdl1Positive || tmb >= 20 || msiHigh) {
      vector[5] = Math.min(0.90, 0.5 + (tmb / 50) + (msiHigh ? 0.2 : 0));
    }
    
    return vector;
  };

  const handleGeneratePlan = async () => {
    if (!patientProfile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Compute SAE mechanism vector from tumor context
      const saeVector = computeSAEVector(patientProfile.tumor_context);
      
      // Create AbortController for timeout (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      try {
        // Transform patient profile to match CompleteCareV2Request schema
        const requestBody = {
          stage: patientProfile.disease?.stage || 'IVB',
          treatment_line: patientProfile.treatment?.line || 'first-line',
          germline_status: patientProfile.biomarkers?.germline_status || patientProfile.germline_status || 'unknown',
          location_state: patientProfile.demographics?.location || patientProfile.demographics?.location_state || 'NY',
          has_ascites: patientProfile.biomarkers?.ascites || patientProfile.clinical?.has_ascites || false,
          has_peritoneal_disease: patientProfile.biomarkers?.peritoneal_disease || patientProfile.clinical?.has_peritoneal_disease || false,
          tumor_context: patientProfile.tumor_context || null,
          ca125_value: patientProfile.biomarkers?.ca125 || patientProfile.labs?.ca125_value || null,
          ecog_status: patientProfile.clinical?.ecog_status || null,
          treatment_history: patientProfile.treatment?.history || [],
          germline_variants: patientProfile.germline?.mutations || patientProfile.germline_variants || [],
          include_trials: true,
          include_soc: true,
          include_ca125: true,
          include_wiwfm: true,
          include_resistance: true,
          include_food: false,
          include_resistance_prediction: false,
          max_trials: 10
        };

        const response = await fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorDetail = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
          } catch {
            // Response not JSON
          }
          throw new Error(errorDetail);
        }

        const data = await response.json();
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format from server');
        }
        
        setResult(data);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 60 seconds. The server may be overloaded. Please try again or check backend logs.');
        }
        throw fetchError;
      }
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(`Failed to generate care plan: ${errorMessage}`);
      console.error('Complete care plan generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complete_care_plan_${result.provenance?.run_id || Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Extract drug ranking from wiwfm response
  const getDrugRanking = () => {
    if (!result?.wiwfm) return null;
    
    // Convert wiwfm response to drug ranking format
    const drugs = result.wiwfm.drugs || [];
    return {
      ranked_drugs: drugs.map(drug => ({
        drug_name: drug.name || drug.drug_name,
        moa: drug.moa,
        efficacy_score: drug.efficacy_score || drug.confidence,
        confidence: drug.confidence,
        evidence_tier: drug.evidence_tier,
        badges: drug.badges || [],
        rationale: drug.rationale || []
      })),
      evidence_tier: result.wiwfm.evidence_tier,
      run_signature: result.wiwfm.run_signature
    };

  };

  // Extract PGx-flagged drugs from WIWFM response
  const getPGxDrugs = () => {
    if (!result?.wiwfm?.drugs) return [];
    return (result.wiwfm.drugs || []).filter((d) => {
      const pgx = d?.pgx_screening;
      if (!pgx) return false;
      const tier = pgx.toxicity_tier;
      const af = typeof pgx.adjustment_factor === 'number' ? pgx.adjustment_factor : 1.0;
      return tier === 'HIGH' || tier === 'MODERATE' || af < 1.0;
    });
  };


  // Extract trials from response
  const getTrials = () => {
    if (!result?.trials) return [];
    // Handle nested structure: trials.trials or just trials array
    return result.trials.trials || result.trials || [];
  };

  // Extract hint tiles from response
  const getHintTiles = () => {
    if (!result?.hint_tiles) return [];
    // Handle nested structure: hint_tiles.hint_tiles or just hint_tiles array
    return result.hint_tiles.hint_tiles || result.hint_tiles || [];
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospitalIcon color="primary" fontSize="large" />
          Complete Care Plan - Universal
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Comprehensive care planning orchestrating all MOAT capabilities: biomarker intelligence, 
          resistance prediction, drug efficacy, trial matching, and monitoring setup.
        </Typography>
        <Alert severity="info" icon={<LocalHospitalIcon />} sx={{ mb: 2 }}>
          <strong>Research Use Only (RUO)</strong> - This analysis supports, not replaces, clinical judgment.
          Always consult oncologist before making treatment decisions.
        </Alert>
      </Box>

      {/* Patient Profile Info */}
      {patientProfile && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Patient Profile
          </Typography>
          <Typography variant="body2">
            <strong>Patient:</strong> {patientProfile.name || patientProfile.patient_id} • 
            <strong> Disease:</strong> {patientProfile.disease?.type || patientProfile.disease} • 
            <strong> Stage:</strong> {patientProfile.disease?.stage || 'Unknown'}
            {patientProfile.demographics?.age && ` • Age: ${patientProfile.demographics.age}`}
          </Typography>
          {patientProfile.tumor_context?.somatic_mutations && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Mutations:</strong> {patientProfile.tumor_context.somatic_mutations
                .map(m => `${m.gene}${m.hgvs_p ? ` (${m.hgvs_p})` : ''}`)
                .join(', ')}
            </Typography>
          )}
        </Paper>
      )}

      {/* Generate Plan Button */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGeneratePlan}
          disabled={loading || !patientProfile}
          size="large"
          sx={{ px: 4 }}
        >
          {loading ? 'Generating Complete Care Plan...' : 'Generate Complete Care Plan'}
        </Button>
        {!patientProfile && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Loading patient profile... If this persists, refresh the page or use the default profile.
          </Alert>
        )}
        {result && (
          <>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportJSON}
              size="large"
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => setProvenanceModalOpen(true)}
              size="large"
            >
              View Provenance
            </Button>
          </>
        )}
      </Box>

      {/* Loading */}
      {loading && <CompleteCareLoadingSkeleton />}

      {/* Error */}
      {error && (
        <ErrorState error={error} onRetry={handleGeneratePlan} />
      )}

      {/* Results */}
      {result && (
        <Box>
          {/* Summary Stats */}
          <Card sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Care Plan Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Components Included:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.summary?.components_included?.length || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  NGS Status:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.summary?.ngs_status || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Trials Found:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {getTrials().length}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Drugs Ranked:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {getDrugRanking()?.ranked_drugs?.length || 0}
                </Typography>
              </Grid>
            </Grid>
          </Card>

          {/* Resistance Alert Banner */}

          {/* CA-125 Tracker */}
          {result.biomarker_intelligence?.ca125 && (
            <Box mb={3}>
              <CA125Tracker {...result.biomarker_intelligence.ca125} />
            </Box>
          )}
          {result.resistance_alert && result.resistance_alert.alert_triggered && (
            <Box mb={3}>
              <ResistanceAlertBanner resistance_alert={result.resistance_alert} />
            </Box>
          )}

          {/* Next Test Recommender + Hint Tiles */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              {result.next_test_recommender && (
                <NextTestCard recommendations={result.next_test_recommender.recommendations || []} />
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              {getHintTiles().length > 0 && (
                <HintTilesPanel tiles={getHintTiles()} />
              )}
            </Grid>
          </Grid>

          {/* SOC Recommendation */}
          {result.soc_recommendation && (
            <Box mb={3}>
              <SOCRecommendationCard {...result.soc_recommendation} />
            </Box>
          )}


          {/* Tumor Quick Intake - Show if no tumor context yet */}
          {!result?.tumor_context && (
            <Box mb={3}>
              <TumorQuickIntakeForm onTumorContextGenerated={(tumorContext) => {
                // When tumor context is generated, reload complete care with new context
                if (tumorContext) {
                  console.log("Tumor context generated:", tumorContext);
                  // TODO: Integrate with patient profile and reload complete care
                }
              }} />
            </Box>
          )}
          {/* Main Analysis Grid */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Biomarker Intelligence */}
            <Grid item xs={12} md={6}>
              {result.biomarker_intelligence && (
                <BiomarkerCard 
                  biomarkerProfile={result.biomarker_intelligence}
                  loading={false}
                />
              )}
            </Grid>

            {/* Resistance Prediction */}
            <Grid item xs={12} md={6}>
              {result.resistance_prediction && (
                <ResistanceCard 
                  resistancePrediction={result.resistance_prediction}
                  loading={false}
                />
              )}
            </Grid>

            {/* Drug Efficacy (WIWFM) */}
            <Grid item xs={12} md={6}>
              {getDrugRanking() && (
                <DrugRankingCard 
                  drugRanking={getDrugRanking()}
                  mechanismVector={result.mechanism_map?.vector || [0, 0, 0, 0, 0, 0, 0]}
                  loading={false}
                />
              )}
            </Grid>

            {/* Trial Matches */}
            <Grid item xs={12} md={6}>
              {getTrials().length > 0 && (
                <TrialMatchesCard 
                  trialMatches={getTrials()}
                  loading={false}
                />
              )}
            </Grid>

          
            {/* PGx Safety Gate */}
            {(getPGxDrugs().length > 0 || (getTrials().length > 0 && getTrials().some(t => t?.pgx_safety))) && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  PGx Safety Gate (RUO)
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pre-treatment pharmacogenomics screening using germline variants. Unknown means trial drug interventions were not provided, not that the trial is safe.
                </Typography>

                {/* Drug-level PGx */}
                {getPGxDrugs().length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Drug Safety Gate
                    </Typography>
                    <Grid container spacing={2}>
                      {getPGxDrugs().map((drug, idx) => (
                        <Grid item xs={12} md={6} key={drug?.name || drug?.drug || idx}>
                          <SafetyGateCard drug={drug} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Trial-level PGx */}
                {getTrials().length > 0 && getTrials().some(t => t?.pgx_safety) && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Trial Safety Gate
                    </Typography>
                    {getTrials().slice(0, 6).map((trial, idx) => (
                      <TrialSafetyGate key={trial?.nct_id || trial?.title || idx} trial={trial} />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Toxicity Risk Assessment */}
          {result.toxicity_assessments && result.toxicity_assessments.toxicity_assessments?.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                Toxicity Risk Assessment
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pre-enrollment toxicity screening based on germline variants and drug mechanisms.
              </Typography>
              
              <Grid container spacing={2}>
                {result.toxicity_assessments.toxicity_assessments.map((risk, idx) => {
                  const riskColor = risk.risk_level === "HIGH" ? "error" : 
                                   risk.risk_level === "MODERATE" ? "warning" : "success";
                  
                  return (
                    <Grid item xs={12} key={idx}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">{risk.drug_name}</Typography>
                            <Chip 
                              label={`${risk.risk_level} RISK`}
                              color={riskColor}
                              icon={<WarningIcon />}
                            />
                          </Box>
                          
                          <ToxicityRiskCard
                            result={{
                              risk_score: risk.risk_score,
                              confidence: risk.confidence,
                              reason: risk.reason,
                              factors: risk.factors,
                              mitigating_foods: risk.mitigating_foods
                            }}
                          />
                          
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/toxicity-risk?drug=${encodeURIComponent(risk.drug_name)}`)}
                            >
                              View Detailed Assessment
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
          </Grid>

          {/* Mechanism Map */}
          {result.mechanism_map && (
            <Box mb={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🧬 Pathway Mechanism Map
                </Typography>
                <MechanismChips mechanism_map={result.mechanism_map} />
              </Paper>
            </Box>
          )}

          {/* Resistance Playbook */}
          {result.resistance_playbook && (
            <Box mb={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resistance Playbook
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Research use only — suggested next-line strategies require clinician review.
                  </Typography>
                  <ResistancePlaybook resistance_playbook={result.resistance_playbook} />
                </CardContent>
              </Card>
            </Box>
          )}

          {/* SAE Features */}
          {result.sae_features && (
            <Box mb={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SAE Features (DNA Repair Capacity)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Research use only — DNA repair capacity and pathway burdens.
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <AyeshaSAEFeaturesCard sae_features={result.sae_features} />
                  </Alert>
                </CardContent>
              </Card>
              </Box>
          )}

          {/* Provenance Bar */}
          {result.provenance && (
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.100' }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Orchestrator:</strong> {result.provenance.orchestrator} • 
                <strong> Run ID:</strong> {result.provenance.run_id} • 
                <strong> Generated:</strong> {new Date(result.provenance.generated_at).toLocaleString()}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Provenance Modal */}
      <Dialog
        open={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Analysis Provenance</DialogTitle>
        <DialogContent>
          {result?.provenance && (
            <ProvenancePanel provenance={result.provenance} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProvenanceModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

