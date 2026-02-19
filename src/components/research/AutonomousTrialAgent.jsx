/**
 * Autonomous Clinical Trial Agent Component
 * Automatically searches for trials based on patient genomic/demographic data
 */
import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import { useSporadic } from '../../context/SporadicContext';
import { API_ROOT } from '../../lib/apiConfig';


const AutonomousTrialAgent = ({ patientData, onResults }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchResult, setLastSearchResult] = useState(null);
  
  // Sporadic context integration (Zo - Clinical Trials)
  const { germlineStatus, tumorContext } = useSporadic();

  const handleAutonomousSearch = async () => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/trials/agent/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mutations: patientData?.mutations || [],
          disease: patientData?.disease,
          location: patientData?.location,
          biomarkers: patientData?.biomarkers,
          state: patientData?.state,
          germline_status: germlineStatus || null,
          tumor_context: tumorContext || null
        })
      });

      if (!response.ok) {
        throw new Error(`Agent search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setLastSearchResult(data.data);
        onResults(data.data.matched_trials || []);
      } else {
        onResults([]);
      }
    } catch (err) {
      setError(err.message);
      onResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6">Autonomous Trial Agent</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Automatically searches for relevant trials based on patient genomic profile.
          No query needed - the agent extracts context and generates search queries.
        </Typography>

        {patientData && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Patient Context:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {patientData.disease && <Chip label={`Disease: ${patientData.disease}`} size="small" />}
              {patientData.mutations?.length > 0 && (
                <Chip label={`${patientData.mutations.length} mutations`} size="small" />
              )}
              {patientData.state && <Chip label={`Location: ${patientData.state}`} size="small" />}
            </Box>
          </Box>
        )}

        <Button
          variant="contained"
          startIcon={isSearching ? <CircularProgress size={16} /> : <SearchIcon />}
          onClick={handleAutonomousSearch}
          disabled={isSearching || !patientData}
          fullWidth
        >
          {isSearching ? 'Agent Searching...' : 'Run Autonomous Search'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}

        {lastSearchResult && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="caption" color="success.dark">
              ✅ Found {lastSearchResult.total_found} trials using {lastSearchResult.queries_used?.length || 0} queries
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AutonomousTrialAgent;






