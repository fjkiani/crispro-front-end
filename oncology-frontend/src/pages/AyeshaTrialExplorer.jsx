/**
 * Ayesha Trial Explorer Page
 * 
 * Precision trial matching for Ayesha's Stage IVB ovarian cancer.
 * Displays top 10 ranked trials with transparent reasoning.
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import TrialMatchCard from '../components/trials/TrialMatchCard';
import CA125Tracker from '../components/ayesha/CA125Tracker';
import SOCRecommendationCard from '../components/ayesha/SOCRecommendationCard';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const AyeshaTrialExplorer = () => {
  const [trials, setTrials] = useState([]);
  const [ca125Intelligence, setCa125Intelligence] = useState(null);
  const [socRecommendation, setSocRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provenance, setProvenance] = useState(null);

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/ayesha/trials/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Use default Ayesha profile (all fields have defaults)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setTrials(data.trials || []);
      setCa125Intelligence(data.ca125_intelligence);
      setSocRecommendation(data.soc_recommendation || null);  // ✅ FIXED: Use API response instead of hardcoded
      setProvenance(data.provenance);

    } catch (err) {
      console.error('Failed to load trials:', err);
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
          Ayesha's Clinical Trial Explorer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Stage IVB Ovarian Cancer • Treatment-Naive • Germline-Negative
        </Typography>
      </Box>

      {/* Profile Summary */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Patient Profile
        </Typography>
        <Typography variant="body2">
          <strong>Stage:</strong> IVB • <strong>CA-125:</strong> 2,842 U/mL (EXTENSIVE burden) • 
          <strong> Germline Status:</strong> Negative • <strong>Treatment Line:</strong> 0 (treatment-naive) • 
          <strong> Location:</strong> NYC Metro
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

