/**
 * Ayesha Trials Only Page - Simplified, No Nested Tabs
 * 
 * Clean trials page showing only:
 * - Top ranked trials
 * - Trial match cards with eligibility
 * - No nested tabs - navigation via sidebar
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import TrialMatchCard from '../../components/trials/TrialMatchCard';
import TrialSafetyGate from '../../components/safety/TrialSafetyGate';
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const queryClient = new QueryClient();

const AyeshaTrialsOnlyContent = () => {
  const navigate = useNavigate();
  const { profile, buildRequest } = useAyeshaProfile();
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    try {
      const requestBody = buildRequest({
        include_trials: true,
        include_soc: false,
        include_ca125: false,
        include_wiwfm: false,
        include_food: false,
        include_resistance: false,
        max_trials: 20,
        location_state: 'NY' // Explicitly set location for discovery
      });

      const response = await fetch(`${API_ROOT}/api/ayesha/trials/search`, { // Updated to use the correct modular endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTrials(data.trials || []);
    } catch (err) {
      console.error('Failed to load trials:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading clinical trials...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load trials: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Back Button */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/ayesha-trials')}
            sx={{ color: '#00ff7f' }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Clinical Trials (Real-Time Discovery)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Top {trials.length} trials from live database • Ranked by Runtime Tagging & Holistic Score
        </Typography>
      </Paper>

      {/* Trials List */}
      {trials.length === 0 ? (
        <Alert severity="info">
          No trials found matching {profile.patient?.display_name || 'Patient'}'s profile.
          Try adjusting filters or check back later.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {trials.map((trial, index) => (
            <Box key={trial.nct_id || index}>
              <TrialMatchCard trial={trial} rank={index + 1} />
              {/* PGx Trial Safety Gate (RUO) */}
              {trial?.pgx_safety && <TrialSafetyGate trial={trial} />}
            </Box>
          ))}
        </Box>
      )}

      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 4, borderRadius: '8px' }}>
        <Typography variant="body2">
          <strong>Research Use Only (RUO):</strong> Trial recommendations should be reviewed by a qualified
          oncologist before making treatment decisions.
        </Typography>
      </Alert>
    </Container>
  );
};

// Wrapper Component to provide Context
const AyeshaTrialsOnly = () => (
  <QueryClientProvider client={queryClient}>
    <AyeshaTrialsOnlyContent />
  </QueryClientProvider>
);

export default AyeshaTrialsOnly;
