/**
 * Ayesha Trial Explorer Page
 * 
 * Precision trial matching for Ayesha's Stage IVB ovarian cancer.
 * Displays top 10 ranked trials with transparent reasoning.
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper, Grid } from '@mui/material';
import TrialMatchCard from '../components/trials/TrialMatchCard';
import CA125Tracker from '../components/ayesha/CA125Tracker';
import SOCRecommendationCard from '../components/ayesha/SOCRecommendationCard';
import NextTestCard from '../components/ayesha/NextTestCard';
import HintTilesPanel from '../components/ayesha/HintTilesPanel';
import MechanismChips from '../components/ayesha/MechanismChips';
import ResistanceAlertBanner from '../components/ayesha/ResistanceAlertBanner';  // ⚔️ P1.2
import ResistancePlaybook from '../components/ayesha/ResistancePlaybook';  // ⚔️ Gap 1: Resistance Playbook
import AyeshaSAEFeaturesCard from '../components/ayesha/AyeshaSAEFeaturesCard';  // ⚔️ Gap 2: SAE Features
import { usePatient } from '../context/PatientContext';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const AyeshaTrialExplorer = () => {
  const { patientProfile, saveCarePlan, loading: patientLoading } = usePatient();
  const [trials, setTrials] = useState([]);
  const [ca125Intelligence, setCa125Intelligence] = useState(null);
  const [socRecommendation, setSocRecommendation] = useState(null);
  const [nextTestRecommender, setNextTestRecommender] = useState(null);
  const [hintTiles, setHintTiles] = useState([]);
  const [mechanismMap, setMechanismMap] = useState(null);
  const [resistanceAlert, setResistanceAlert] = useState(null);  // ⚔️ P1.2: SAE resistance detection
  const [resistancePlaybook, setResistancePlaybook] = useState(null);  // ⚔️ Gap 1: Resistance Playbook
  const [saeFeatures, setSaeFeatures] = useState(null);  // ⚔️ Gap 2: SAE Features
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provenance, setProvenance] = useState(null);

  useEffect(() => {
    // Only load if patient context is ready (or not a patient)
    if (!patientLoading) {
      loadTrials();
    }
  }, [patientProfile, patientLoading]);

  const loadTrials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build request body from patient profile if available, otherwise use defaults
      const requestBody = patientProfile ? {
        ca125_value: patientProfile.ca125_value || 2842.0,
        stage: patientProfile.stage || "IVB",
        treatment_line: patientProfile.treatment_line?.toString() || "first-line",
        germline_status: patientProfile.germline_status || "negative",
        location_state: patientProfile.location_state || "NY",
        tumor_context: patientProfile.tumor_context || null
      } : {
        // Use default Ayesha profile (all fields have defaults)
      };

      // Use unified complete_care_v2 endpoint (includes SAE Phase 3 services)
      const response = await fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract all sections from unified response
      // Note: trials is nested in data.trials.trials
      setTrials(data.trials?.trials || []);
      setCa125Intelligence(data.ca125_intelligence);
      setSocRecommendation(data.soc_recommendation || null);
      setNextTestRecommender(data.next_test_recommender || null);
      // hint_tiles is nested: data.hint_tiles.hint_tiles
      setHintTiles(data.hint_tiles?.hint_tiles || []);
      setMechanismMap(data.mechanism_map || null);
      setResistanceAlert(data.resistance_alert || null);  // ⚔️ P1.2: SAE resistance detection
      setResistancePlaybook(data.resistance_playbook || null);  // ⚔️ Gap 1: Resistance Playbook
      setSaeFeatures(data.sae_features || null);  // ⚔️ Gap 2: SAE Features
      setProvenance(data.provenance);

      // Auto-save care plan if patient profile exists
      if (patientProfile && saveCarePlan) {
        try {
          await saveCarePlan(data);
        } catch (saveErr) {
          console.warn('Failed to auto-save care plan:', saveErr);
          // Don't fail the request if save fails
        }
      }

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

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          {patientProfile?.full_name || 'Ayesha'}'s Clinical Trial Explorer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Stage {patientProfile?.stage || 'IVB'} • {patientProfile?.ca125_value ? `${patientProfile.ca125_value.toLocaleString()} U/mL` : 'CA-125: N/A'} • 
          Germline: {patientProfile?.germline_status || 'Negative'} • 
          Treatment Line: {patientProfile?.treatment_line || 0}
        </Typography>
      </Box>

      {/* Profile Summary */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Patient Profile
        </Typography>
        <Typography variant="body2">
          <strong>Stage:</strong> {patientProfile?.stage || 'IVB'} • 
          <strong>CA-125:</strong> {patientProfile?.ca125_value ? `${patientProfile.ca125_value.toLocaleString()} U/mL` : 'N/A'} • 
          <strong>Germline Status:</strong> {patientProfile?.germline_status || 'Negative'} • 
          <strong>Treatment Line:</strong> {patientProfile?.treatment_line || 0} • 
          <strong>Location:</strong> {patientProfile?.location_city || 'NYC Metro'}
        </Typography>
        <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
          ⚠️ Awaiting NGS: Somatic BRCA, HRD score, TMB, MSI status pending
        </Typography>
      </Paper>

      {/* SOC Recommendation */}
      {socRecommendation && (
        <Box mb={3}>
          <SOCRecommendationCard {...socRecommendation} />
        </Box>
      )}

      {/* CA-125 Tracker */}
      {ca125Intelligence && (
        <Box mb={3}>
          <CA125Tracker
            current_value={2842.0}  // Ayesha's CA-125 value
            burden_class={ca125Intelligence.burden_class}
            forecast={ca125Intelligence.forecast}
            resistance_rule={ca125Intelligence.resistance_signals}
            monitoring_strategy={ca125Intelligence.monitoring_strategy}
          />
        </Box>
      )}

      {/* ⚔️ P1.2: Resistance Alert Banner (if triggered) */}
      {resistanceAlert && resistanceAlert.alert_triggered && (
        <Box mb={3}>
          <ResistanceAlertBanner resistance_alert={resistanceAlert} />
        </Box>
      )}

      {/* SAE Phase 3: Next Test Recommender + Hint Tiles + Mechanism Map */}
      <Grid container spacing={3} mb={3}>
        {/* Next Test Recommender */}
        <Grid item xs={12} md={4}>
          <NextTestCard recommendations={nextTestRecommender?.recommendations || []} />
        </Grid>

        {/* Hint Tiles Panel */}
        <Grid item xs={12} md={8}>
          <HintTilesPanel tiles={hintTiles} />
        </Grid>
      </Grid>

      {/* Mechanism Map Chips */}
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

      {/* ⚔️ Gap 1: Resistance Playbook */}
      {resistancePlaybook && (
        <Box mb={3}>
          <ResistancePlaybook resistance_playbook={resistancePlaybook} />
        </Box>
      )}

      {/* ⚔️ Gap 2: SAE Features */}
      {saeFeatures && (
        <Box mb={3}>
          <AyeshaSAEFeaturesCard sae_features={saeFeatures} />
        </Box>
      )}

      {/* Trials List */}
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Top {trials.length} Clinical Trials
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ranked by match score with transparent reasoning
        </Typography>
      </Box>

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

      {/* Provenance Bar */}
      {provenance && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Filters Applied:</strong> {provenance.filters_applied} •
            <strong> Boost Strategy:</strong> {provenance.boost_strategy} •
            <strong> Awaiting NGS:</strong> {provenance.awaiting_ngs?.join(', ')}
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

