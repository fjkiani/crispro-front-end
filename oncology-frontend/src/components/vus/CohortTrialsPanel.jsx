/**
 * CohortTrialsPanel Component
 * 
 * Displays cohort context and clinical trial matches for a given efficacy result.
 * Shows how the variant appears in cohorts and related trial opportunities.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Chip, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CohortTrialsPanel = ({ efficacy }) => {
  const navigate = useNavigate();

  if (!efficacy) {
    return null;
  }

  // Extract cohort context if available
  const cohortContext = efficacy?.cohort_context;
  const trialMatches = efficacy?.trial_matches || [];

  return (
    <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        Cohort Context & Trial Matches
      </Typography>

      {/* Cohort Context */}
      {cohortContext && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Cohort Coverage:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {cohortContext.studies && cohortContext.studies.map((study, idx) => (
              <Chip
                key={idx}
                label={study}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Trial Matches */}
      {trialMatches.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Related Clinical Trials:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {trialMatches.slice(0, 5).map((trial, idx) => (
              <Paper
                key={idx}
                variant="outlined"
                sx={{ p: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: '#fafafa' } }}
                onClick={() => {
                  if (trial.nct_id) {
                    navigate(`/ayesha-dossiers/${trial.nct_id}`);
                  }
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {trial.title || trial.nct_id || `Trial ${idx + 1}`}
                </Typography>
                {trial.nct_id && (
                  <Typography variant="caption" color="text.secondary">
                    {trial.nct_id}
                  </Typography>
                )}
                {trial.match_score && (
                  <Chip
                    label={`Match: ${(trial.match_score * 100).toFixed(0)}%`}
                    size="small"
                    sx={{ mt: 0.5 }}
                    color={trial.match_score >= 0.7 ? 'success' : trial.match_score >= 0.5 ? 'warning' : 'default'}
                  />
                )}
              </Paper>
            ))}
          </Box>
          {trialMatches.length > 5 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              + {trialMatches.length - 5} more trials
            </Typography>
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No trial matches available. Check Ayesha's Dossier Browser for all available trials.
        </Typography>
      )}

      {/* Link to full dossier browser */}
      <Box sx={{ mt: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/ayesha-dossiers')}
          sx={{ cursor: 'pointer' }}
        >
          View All 60+ Trial Dossiers →
        </Link>
      </Box>
    </Paper>
  );
};

CohortTrialsPanel.propTypes = {
  efficacy: PropTypes.shape({
    cohort_context: PropTypes.shape({
      studies: PropTypes.arrayOf(PropTypes.string)
    }),
    trial_matches: PropTypes.arrayOf(PropTypes.shape({
      nct_id: PropTypes.string,
      title: PropTypes.string,
      match_score: PropTypes.number
    }))
  })
};

export default CohortTrialsPanel;
