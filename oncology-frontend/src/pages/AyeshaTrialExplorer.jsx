/**
 * Ayesha Trial Explorer Page
 * 
 * Precision trial matching for Ayesha's Stage IVB ovarian cancer.
 * Displays top 10 ranked trials with transparent reasoning.
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper, Grid, Tabs, Tab, Chip } from '@mui/material';
import TrialMatchCard from '../components/trials/TrialMatchCard';
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
  
  // Meta
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provenance, setProvenance] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use unified complete_care_v2 endpoint with ALL capabilities enabled
      const response = await fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Ayesha's profile (Patient 11-17-25)
          stage: "IVB",
          // Treatment line is not explicitly specified in the source-of-truth docs; do not guess.
          treatment_line: "either",
          germline_status: "negative",
          location_state: "NY",
          // From CT Abdomen/Pelvis (10/28/2025): small volume ascites + extensive peritoneal carcinomatosis
          has_ascites: true,
          has_peritoneal_disease: true,
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
          tumor_context: {
            // Source of truth: PATIENT_ANALYSIS_11-17-25.md
            // Do NOT guess TP53 sequence; pathology indicates "p53 mutant type" staining pattern.
            p53_status: "MUTANT_TYPE",
            pd_l1: { cps: 10, status: "POSITIVE" },
            er_percent: 50,
            er_status: "WEAKLY_POSITIVE",
            pr_status: "NEGATIVE",
            mmr_status: "PRESERVED",
            her2_status: "NEGATIVE",
            folr1_status: "NEGATIVE",
            ntrk_status: "NEGATIVE"
          }
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
            Ayesha's Complete Care Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stage IVB High-Grade Serous Carcinoma (Mullerian origin) • PD-L1+ (CPS 10) • p53 mutant type
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
          Patient Profile (11-17-25)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip label="Stage IVB" color="error" size="small" />
          <Chip label="CA-125: not provided" variant="outlined" color="warning" size="small" />
          <Chip label="Germline: Negative" size="small" />
          <Chip label="PD-L1+ (CPS 10)" color="success" size="small" />
          <Chip label="p53 Mutant" color="info" size="small" />
          <Chip label="MMR Preserved" size="small" />
          <Chip label="ER Weakly+" size="small" />
          <Chip label="HER2-" size="small" />
          <Chip label="FOLR1-" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          <strong>Components Loaded:</strong> {summary?.components_included?.join(', ') || 'Loading...'}
        </Typography>
      </Paper>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label={`Overview`} />
          <Tab label={`Trials (${trials.length})`} />
          <Tab label="Treatment" />
          <Tab label="Monitoring" />
          <Tab label="Resistance" />
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
              No trials found matching Ayesha's profile. Try adjusting filters or check back later.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {trials.map((trial, index) => (
                <TrialMatchCard
                  key={trial.nct_id || index}
                  trial={trial}
                  rank={index + 1}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 2: TREATMENT (SOC + Drug Efficacy + Food) */}
      {activeTab === 2 && (
        <Box>
          {/* SOC */}
          {socRecommendation && (
            <Box mb={3}>
              <SOCRecommendationCard {...socRecommendation} />
            </Box>
          )}

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
                current_value={2842.0}
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
                  <Alert severity="warning">{resistancePrediction.message}</Alert>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Chip 
                        label={`Risk: ${resistancePrediction.risk_level}`} 
                        color={resistancePrediction.risk_level === 'HIGH' ? 'error' : resistancePrediction.risk_level === 'MEDIUM' ? 'warning' : 'success'}
                      />
                      <Chip label={`Probability: ${Math.round(resistancePrediction.probability * 100)}%`} />
                      <Chip label={`Confidence: ${Math.round(resistancePrediction.confidence * 100)}%`} variant="outlined" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {resistancePrediction.rationale}
                    </Typography>
                    {resistancePrediction.recommended_actions?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Recommended Actions:</Typography>
                        <ul>
                          {resistancePrediction.recommended_actions.map((action, idx) => (
                            <li key={idx}><Typography variant="body2">{action}</Typography></li>
                          ))}
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

