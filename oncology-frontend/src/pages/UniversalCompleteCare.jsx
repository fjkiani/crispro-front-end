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

// Import reusable components
import DrugRankingPanel from '../components/ayesha/DrugRankingPanel';
import { DrugRankingCard } from '../components/orchestrator/Analysis/DrugRankingCard';
import { BiomarkerCard } from '../components/orchestrator/Analysis/BiomarkerCard';
import { ResistanceCard } from '../components/orchestrator/Analysis/ResistanceCard';
import { ToxicityRiskCard } from '../components/ClinicalGenomicsCommandCenter/cards/ToxicityRiskCard';
import { TrialMatchesCard } from '../components/orchestrator/Analysis/TrialMatchesCard';
import SOCRecommendationCard from '../components/ayesha/SOCRecommendationCard';
import NextTestCard from '../components/ayesha/NextTestCard';
import HintTilesPanel from '../components/ayesha/HintTilesPanel';
import MechanismChips from '../components/ayesha/MechanismChips';
import ResistanceAlertBanner from '../components/ayesha/ResistanceAlertBanner';
import ProvenancePanel from '../components/food/ProvenancePanel';
import { CompleteCareLoadingSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/complete-care/ErrorState';
import EmptyState from '../components/complete-care/EmptyState';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

/**
 * UniversalCompleteCare - Universal complete care plan page
 * 
 * Works with any patient profile (not just Ayesha).
 * Orchestrates all MOAT capabilities via /api/complete_care/v2.
 */
export default function UniversalCompleteCare() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [patientProfile, setPatientProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);

  // Default AK profile for demo (MBD4+TP53+NF1)
  const DEFAULT_AK_PROFILE = {
    patient_id: 'AK',
    name: 'AK',
    disease: {
      type: 'ovarian_cancer_hgs',
      stage: 'IVB'
    },
    demographics: {
      age: 40,
      sex: 'F',
      location: 'New York',
      zip_code: '10001'
    },
    treatment: {
      line: 'first-line',
      history: []
    },
    biomarkers: {
      ca125_value: 2842.0
    },
    tumor_context: {
      somatic_mutations: [
        {
          gene: 'MBD4',
          hgvs_p: 'c.1239delA',
          consequence: 'frameshift',
          zygosity: 'homozygous'
        },
        {
          gene: 'TP53',
          hgvs_p: 'p.R273H',
          consequence: 'missense'
        },
        {
          gene: 'NF1',
          hgvs_p: 'p.R1276*',
          consequence: 'stop_gained'
        }
      ],
      hrd_score: 42.0
    }
  };

  // Load patient profile if patientId provided
  useEffect(() => {
    if (patientId) {
      loadPatientProfile(patientId);
    } else {
      // Use default AK profile for demo
      setPatientProfile(DEFAULT_AK_PROFILE);
    }
  }, [patientId]);

  // Generate care plan when profile is ready
  useEffect(() => {
    if (patientProfile && !result && !loading) {
      handleGeneratePlan();
    }
  }, [patientProfile]);

  const loadPatientProfile = async (id) => {
    try {
      const response = await fetch(`${API_ROOT}/api/patients/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPatientProfile(data);
      } else {
        // Fallback to default profile
        setPatientProfile(DEFAULT_AK_PROFILE);
      }
    } catch (err) {
      console.error('Failed to load patient profile:', err);
      setPatientProfile(DEFAULT_AK_PROFILE);
    }
  };

  const handleGeneratePlan = async () => {
    if (!patientProfile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_ROOT}/api/complete_care/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_profile: patientProfile,
          include_trials: true,
          include_soc: true,
          include_biomarker: true,
          include_wiwfm: true,
          include_resistance: true,
          max_trials: 10
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
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
                  <Typography variant="body2" color="text.secondary">
                    Alternative treatment options if resistance is detected
                  </Typography>
                  {/* TODO: Create ResistancePlaybook component */}
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Resistance playbook data available. Component display coming soon.
                  </Alert>
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
                    Research use only - DNA repair capacity and pathway burdens
                  </Typography>
                  {/* TODO: Create SAEFeatures component */}
                  <Alert severity="info" sx={{ mt: 2 }}>
                    SAE features available. Component display coming soon.
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

