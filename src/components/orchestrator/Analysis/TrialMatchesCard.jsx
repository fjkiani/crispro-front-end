/**
 * TrialMatchesCard Component
 * 
 * Displays clinical trial matches.
 * Modular, self-contained component.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import {
  Description as ClinicalNotes,
  ExpandMore,
  OpenInNew,
  LocationOn,
  Person,
} from '@mui/icons-material';

export const TrialMatchesCard = ({ trialMatches, loading = false }) => {
  const [expandedTrial, setExpandedTrial] = useState(null);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography sx={{ mt: 1 }}>Loading trial matches...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!trialMatches || trialMatches.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No trial matches found</Typography>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.5) return 'warning';
    return 'default';
  };

  const getPhaseColor = (phase) => {
    if (phase === 'PHASE3') return 'success';
    if (phase === 'PHASE2') return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader
        avatar={<ClinicalNotes />}
        title="Clinical Trial Matches"
        subheader={`${trialMatches.length} trials found`}
      />
      <CardContent>
        <List>
          {trialMatches.slice(0, 10).map((trial, idx) => (
            <Accordion
              key={idx}
              expanded={expandedTrial === idx}
              onChange={() => setExpandedTrial(expandedTrial === idx ? null : idx)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {trial.title || trial.nct_id}
                    </Typography>
                    {(trial.holistic_score ?? trial.combined_score) !== undefined && (
                      <Chip
                        label={`${((trial.holistic_score ?? trial.combined_score) * 100).toFixed(0)}% match`}
                        size="small"
                        color={getScoreColor(trial.holistic_score ?? trial.combined_score)}
                      />
                    )}
                    {trial.holistic_interpretation && (
                      <Chip
                        label={trial.holistic_interpretation}
                        size="small"
                        variant="outlined"
                        color={trial.holistic_interpretation === 'HIGH' ? 'success' : trial.holistic_interpretation === 'MEDIUM' ? 'warning' : 'default'}
                      />
                    )}
                    {trial.pgx_safety_score !== undefined && trial.pgx_safety_score < 1.0 && (
                      <Chip
                        label={trial.pgx_safety_score === 0 ? 'PGx HIGH RISK' : 'PGx MODERATE'}
                        size="small"
                        color="error"
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {trial.phase && (
                      <Chip
                        label={trial.phase}
                        size="small"
                        color={getPhaseColor(trial.phase)}
                        variant="outlined"
                      />
                    )}
                    {trial.status && (
                      <Chip
                        label={trial.status}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {trial.nct_id && (
                      <Chip
                        label={trial.nct_id}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Brief Summary */}
                {trial.brief_summary && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trial.brief_summary}
                    </Typography>
                  </Box>
                )}

                {/* Scores */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Match Scores
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {trial.eligibility_score !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Eligibility
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={trial.eligibility_score * 100}
                          sx={{ width: 100, height: 8, borderRadius: 1 }}
                          color={getScoreColor(trial.eligibility_score)}
                        />
                        <Typography variant="caption">
                          {(trial.eligibility_score * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    )}
                    {trial.mechanism_fit_score !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Mechanism Fit
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={trial.mechanism_fit_score * 100}
                          sx={{ width: 100, height: 8, borderRadius: 1 }}
                          color={getScoreColor(trial.mechanism_fit_score)}
                        />
                        <Typography variant="caption">
                          {(trial.mechanism_fit_score * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    )}
                    {trial.pgx_safety_score !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          PGx Safety
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={trial.pgx_safety_score * 100}
                          sx={{ width: 100, height: 8, borderRadius: 1 }}
                          color={trial.pgx_safety_score >= 0.8 ? 'success' : trial.pgx_safety_score >= 0.5 ? 'warning' : 'error'}
                        />
                        <Typography variant="caption">
                          {trial.pgx_safety_score === 1.0 ? 'SAFE' : trial.pgx_safety_score === 0 ? 'HIGH RISK' : (trial.pgx_safety_score * 100).toFixed(0) + '%'}
                        </Typography>
                      </Box>
                    )}
                    {trial.holistic_score !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Holistic
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={trial.holistic_score * 100}
                          sx={{ width: 100, height: 8, borderRadius: 1 }}
                          color={getScoreColor(trial.holistic_score)}
                        />
                        <Typography variant="caption">
                          {(trial.holistic_score * 100).toFixed(0)}% ({trial.holistic_interpretation || ''})
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Why Matched */}
                {trial.why_matched && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Why Matched
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trial.why_matched}
                    </Typography>
                  </Box>
                )}

                {/* Locations */}
                {trial.locations && trial.locations.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <LocationOn sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Locations ({trial.locations.length})
                    </Typography>
                    <List dense>
                      {trial.locations.slice(0, 3).map((location, locIdx) => (
                        <ListItem key={locIdx}>
                          <ListItemText
                            primary={location.facility || location.name}
                            secondary={`${location.city || ''}, ${location.state || ''}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Contact */}
                {trial.contact && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <Person sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Contact
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trial.contact.name || 'N/A'}
                    </Typography>
                    {trial.contact.email && (
                      <Typography variant="caption" color="primary">
                        {trial.contact.email}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {trial.url && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<OpenInNew />}
                      href={trial.url}
                      target="_blank"
                    >
                      View on ClinicalTrials.gov
                    </Button>
                  )}
                  {trial.nct_id && (
                    <Button
                      size="small"
                      variant="outlined"
                      href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
                      target="_blank"
                    >
                      NCT: {trial.nct_id}
                    </Button>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

