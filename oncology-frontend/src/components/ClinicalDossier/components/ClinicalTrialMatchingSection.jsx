import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  LinearProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  ClinicalNotes,
  CheckCircle,
  Warning,
  Info,
  OpenInNew,
  FilterList,
  Sort
} from '@mui/icons-material';

/**
 * ClinicalTrialMatchingSection Component
 *
 * Displays matched clinical trials with eligibility and mechanism fit scores
 *
 * @param {Object} props
 * @param {Array} props.trials - Array of trial match objects
 */
const ClinicalTrialMatchingSection = ({ trials = [] }) => {
  const [expandedTrial, setExpandedTrial] = useState(null);
  const [sortBy, setSortBy] = useState('combined_score'); // 'combined_score', 'eligibility', 'mechanism_fit'
  const [filterPhase, setFilterPhase] = useState('all');

  // Calculate combined score if not provided
  const calculateCombinedScore = (trial) => {
    if (trial.combined_score !== undefined) {
      return trial.combined_score;
    }
    const eligibility = trial.eligibility_score || trial.match_score || 0;
    const mechanismFit = trial.mechanism_fit_score || 0;
    return 0.7 * eligibility + 0.3 * mechanismFit;
  };

  // Process and enrich trials
  const processedTrials = (trials || []).map(trial => ({
    ...trial,
    combined_score: calculateCombinedScore(trial),
    eligibility_score: trial.eligibility_score || trial.match_score || 0,
    mechanism_fit_score: trial.mechanism_fit_score || 0
  }));

  // Sort trials
  const sortedTrials = [...processedTrials].sort((a, b) => {
    if (sortBy === 'combined_score') {
      return b.combined_score - a.combined_score;
    }
    if (sortBy === 'eligibility') {
      return b.eligibility_score - a.eligibility_score;
    }
    if (sortBy === 'mechanism_fit') {
      return b.mechanism_fit_score - a.mechanism_fit_score;
    }
    return 0;
  });

  // Filter by phase
  const filteredTrials = filterPhase === 'all'
    ? sortedTrials
    : sortedTrials.filter(trial => {
        const phase = (trial.phase || '').toLowerCase();
        return phase.includes(filterPhase.toLowerCase());
      });

  // Get unique phases for filter
  const phases = [...new Set(processedTrials.map(t => t.phase).filter(Boolean))];

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.5) return 'warning';
    return 'default';
  };

  if (!trials || trials.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          5. Clinical Trial Matching
        </Typography>
        <Alert severity="info">
          <Typography variant="body2">
            No clinical trials matched. This may indicate:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>Rare genetic combination (e.g., MBD4 germline + TP53 somatic)</li>
            <li>Limited trial availability for this disease type</li>
            <li>Need to search broader eligibility criteria</li>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Consider consulting with a clinical trials coordinator or searching 
            ClinicalTrials.gov directly for basket trials targeting DNA repair pathways.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }} id="clinical-trials">
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        5. Clinical Trial Matching
      </Typography>

      {/* Filters and Sort */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Phase:
          </Typography>
          <Chip
            label="All"
            size="small"
            color={filterPhase === 'all' ? 'primary' : 'default'}
            onClick={() => setFilterPhase('all')}
            clickable
          />
          {phases.map(phase => (
            <Chip
              key={phase}
              label={phase}
              size="small"
              color={filterPhase === phase ? 'primary' : 'default'}
              onClick={() => setFilterPhase(phase)}
              clickable
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sort fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Sort by:
          </Typography>
          <Chip
            label="Combined Score"
            size="small"
            color={sortBy === 'combined_score' ? 'primary' : 'default'}
            onClick={() => setSortBy('combined_score')}
            clickable
          />
          <Chip
            label="Eligibility"
            size="small"
            color={sortBy === 'eligibility' ? 'primary' : 'default'}
            onClick={() => setSortBy('eligibility')}
            clickable
          />
          <Chip
            label="Mechanism Fit"
            size="small"
            color={sortBy === 'mechanism_fit' ? 'primary' : 'default'}
            onClick={() => setSortBy('mechanism_fit')}
            clickable
          />
        </Box>
      </Box>

      {/* Trial Cards */}
      <Grid container spacing={2}>
        {filteredTrials.map((trial, idx) => {
          const combinedScore = trial.combined_score;
          const eligibilityScore = trial.eligibility_score;
          const mechanismFitScore = trial.mechanism_fit_score;
          const isExpanded = expandedTrial === trial.nct_id;

          return (
            <Grid item xs={12} key={trial.nct_id || idx}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderLeft: `4px solid ${
                    getScoreColor(combinedScore) === 'success' ? '#2e7d32' :
                    getScoreColor(combinedScore) === 'warning' ? '#ed6c02' :
                    '#757575'
                  }`
                }}
              >
                {/* Trial Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {trial.title || 'Unknown Trial'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip
                        label={`NCT: ${trial.nct_id || 'N/A'}`}
                        size="small"
                        variant="outlined"
                      />
                      {trial.phase && (
                        <Chip
                          label={trial.phase}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {trial.status && (
                        <Chip
                          label={trial.status}
                          size="small"
                          color={trial.status === 'Recruiting' ? 'success' : 'default'}
                        />
                      )}
                    </Box>
                  </Box>
                  {trial.nct_id && (
                    <Link
                      href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconButton size="small">
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </Link>
                  )}
                </Box>

                {/* Scores */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Combined Score
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(combinedScore * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={combinedScore * 100}
                        color={getScoreColor(combinedScore)}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        0.7 × Eligibility + 0.3 × Mechanism Fit
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Eligibility Score
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(eligibilityScore * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={eligibilityScore * 100}
                        color={getScoreColor(eligibilityScore)}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Mechanism Fit
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(mechanismFitScore * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={mechanismFitScore * 100}
                        color={getScoreColor(mechanismFitScore)}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Match Reasoning (Expandable) */}
                {(trial.match_reasons || trial.reasoning || trial.eligibility_summary) && (
                  <Accordion
                    expanded={isExpanded}
                    onChange={() => setExpandedTrial(isExpanded ? null : trial.nct_id)}
                    sx={{ boxShadow: 'none' }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Match Reasoning
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {trial.reasoning && (
                        <Box>
                          {trial.reasoning.why_eligible && trial.reasoning.why_eligible.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Eligibility Reasons:
                              </Typography>
                              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {trial.reasoning.why_eligible.map((reason, idx) => (
                                  <li key={idx}>
                                    <Typography variant="body2">{reason}</Typography>
                                  </li>
                                ))}
                              </Box>
                            </Box>
                          )}
                          {trial.reasoning.why_good_fit && trial.reasoning.why_good_fit.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Mechanism Fit Reasons:
                              </Typography>
                              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {trial.reasoning.why_good_fit.map((reason, idx) => (
                                  <li key={idx}>
                                    <Typography variant="body2">{reason}</Typography>
                                  </li>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                      {trial.match_reasons && trial.match_reasons.length > 0 && (
                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                          {trial.match_reasons.map((reason, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">{reason}</Typography>
                            </li>
                          ))}
                        </Box>
                      )}
                      {trial.eligibility_summary && (
                        <Typography variant="body2" color="text.secondary">
                          {trial.eligibility_summary}
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Interventions */}
                {trial.interventions && trial.interventions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Interventions:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {trial.interventions.map((intervention, idx) => (
                        <Chip
                          key={idx}
                          label={intervention}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Summary */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Clinical Trial Matching:</strong> Trials are ranked by combined score 
          (70% eligibility + 30% mechanism fit). Eligibility reflects hard/soft criteria 
          matching, while mechanism fit reflects pathway alignment. 
          <strong> These scores indicate match quality, not validated enrollment probability.</strong>
        </Typography>
      </Alert>
    </Box>
  );
};

export default ClinicalTrialMatchingSection;

