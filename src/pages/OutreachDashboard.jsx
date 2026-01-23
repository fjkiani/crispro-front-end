import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Alert,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';

import TrialSearchForm from '../components/personalized_outreach/TrialSearchForm';
import IntelligenceExtractor from '../components/personalized_outreach/IntelligenceExtractor';
import EmailGenerator from '../components/personalized_outreach/EmailGenerator';
import TrialMatchCard from '../components/trials/TrialMatchCard';

const OutreachDashboard = () => {
  const [trials, setTrials] = useState([]);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [intelligence, setIntelligence] = useState(null);

  const handleTrialResults = (results) => {
    setTrials(results);
    setSelectedTrial(null);
    setIntelligence(null);
  };

  const handleTrialSelect = (trial) => {
    setSelectedTrial(trial);
    setIntelligence(null);
  };

  const handleIntelligence = (data) => {
    setIntelligence(data);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <CampaignIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Personalized Outreach Dashboard
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        This system helps you find clinical trials, extract deep intelligence about PIs,
        and generate highly personalized outreach emails to maximize engagement.
      </Alert>

      <Grid container spacing={3}>
        {/* Left Column: Search & Intelligence */}
        <Grid item xs={12} md={6}>
          <TrialSearchForm onResults={handleTrialResults} />

          {trials.length > 0 && (
            <Paper sx={{ p: 2, mb: 3, maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Search Results ({trials.length} trials)
              </Typography>
              {trials.slice(0, 10).map((trial, idx) => (
                <Box
                  key={trial.nct_id || idx}
                  sx={{
                    p: 1,
                    mb: 1,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedTrial?.nct_id === trial.nct_id ? 'primary.main' : 'grey.300',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleTrialSelect(trial)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {trial.title || trial.brief_title || 'No Title'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {trial.nct_id} • {trial.phase || 'Unknown Phase'}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}

          {selectedTrial && (
            <IntelligenceExtractor
              nctId={selectedTrial.nct_id}
              onIntelligence={handleIntelligence}
            />
          )}

          {intelligence && (
            <EmailGenerator
              intelligenceProfile={intelligence}
            onEmailGenerated={(email) => {
                console.log('Email generated:', email);
              }}
            />
          )}
        </Grid>

        {/* Right Column: Trial Details */}
        <Grid item xs={12} md={6}>
          {selectedTrial ? (
            <TrialMatchCard trial={selectedTrial} rank={1} />
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Select a trial from search results to view details and extract intelligence.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default OutreachDashboard;
