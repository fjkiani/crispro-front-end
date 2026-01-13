
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Alert,
} from '@mui/material';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';

const TrialMatchCard = ({ trial, rank }) => {
  const [expanded, setExpanded] = useState(false);

  if (!trial) return null;

  const {
    nct_id,
    title,
    phase,
    status,
    interventions,
    locations,
    match_score,
    reasoning,
    source_url,
  } = trial;

  // Get match score color
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  // Format match score as percentage
  const scorePercent = Math.round(match_score * 100);

  const reasoningObj = typeof reasoning === 'object' && reasoning !== null ? reasoning : null;
  const reasoningText = typeof reasoning === 'string' ? reasoning : null;

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'grey.300' }}>
      <CardContent>
        {/* Header Row */}
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                label={`#${rank}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="h6" component="h3">
                {title || 'No Title'}
              </Typography>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
              <Chip label={phase || 'Unknown Phase'} size="small" variant="outlined" />
              <Chip
                label={status || 'Unknown Status'}
                size="small"
                color={status?.toLowerCase().includes('recruiting') ? 'success' : 'default'}
              />
              {nct_id && (
                <Link
                  href={source_url || `https://clinicaltrials.gov/study/${nct_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontSize: '0.75rem' }}
                >
                  {nct_id}
                </Link>
              )}
            </Box>
          </Box>
          <Box textAlign="right">
            <Typography variant="h5" color={getScoreColor(match_score)}>
              {scorePercent}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Match Score
            </Typography>
            <LinearProgress
              variant="determinate"
              value={scorePercent}
              color={getScoreColor(match_score)}
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>

        {/* Interventions */}
        {interventions && interventions.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              <strong>Interventions:</strong> {interventions.join(', ')}
            </Typography>
          </Box>
        )}

        {/* Eligibility Checklist */}
        {reasoningObj && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Eligibility Checklist
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                icon={<CheckCircleIcon className="h-4 w-4" />}
                label={`Hard: ✅ ${reasoningObj.why_eligible?.length || 0} met`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircleIcon className="h-4 w-4" />}
                label={`Soft: ${reasoningObj.why_good_fit?.length || 0} boosts`}
                size="small"
                color="info"
                variant="outlined"
              />
              {reasoningObj.conditional_requirements?.length > 0 && (
                <Chip
                  icon={<ExclamationTriangleIcon className="h-4 w-4" />}
                  label={`Conditional: ${reasoningObj.conditional_requirements.length}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {reasoningObj.red_flags?.length > 0 && (
                <Chip
                  icon={<XCircleIcon className="h-4 w-4" />}
                  label={`Red Flags: ${reasoningObj.red_flags.length}`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Reasoning Sections (Expandable) */}
        {reasoningObj && (
          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ChevronDownIcon className="h-5 w-5" />}>
              <Typography variant="subtitle2">
                Match Reasoning {expanded ? '(Hide)' : '(Show Details)'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Why Eligible */}
              {reasoningObj.why_eligible && reasoningObj.why_eligible.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    ✅ Why Eligible
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {reasoningObj.why_eligible.map((reason, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{reason}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Why Good Fit */}
              {reasoningObj.why_good_fit && reasoningObj.why_good_fit.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="info.main" gutterBottom>
                    🎯 Why Good Fit
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {reasoningObj.why_good_fit.map((reason, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{reason}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Conditional Requirements */}
              {reasoningObj.conditional_requirements && reasoningObj.conditional_requirements.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    ⚠️ Conditional Requirements
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {reasoningObj.conditional_requirements.map((req, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{req}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Red Flags */}
              {reasoningObj.red_flags && reasoningObj.red_flags.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    ❌ Red Flags
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {reasoningObj.red_flags.map((flag, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{flag}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Evidence Tier & Enrollment Likelihood */}
              <Box display="flex" gap={2} mt={2}>
                <Chip
                  label={`Evidence: ${reasoningObj.evidence_tier || 'Unknown'}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Enrollment: ${reasoningObj.enrollment_likelihood || 'Unknown'}`}
                  size="small"
                  variant="outlined"
                  color={
                    reasoningObj.enrollment_likelihood === 'HIGH'
                      ? 'success'
                      : reasoningObj.enrollment_likelihood === 'MEDIUM'
                      ? 'warning'
                      : 'default'
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Fallback reasoning text (older payloads) */}
        {reasoningText && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {reasoningText}
          </Alert>
        )}

        {/* Locations */}
        {locations && locations.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Locations
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {locations.slice(0, 5).map((loc, idx) => (
                <Chip
                  key={idx}
                  label={`${loc.facility || 'Unknown'}, ${loc.city || ''}, ${loc.state || ''}`}
                  size="small"
                  variant="outlined"
                  color={['NY', 'NJ', 'CT'].includes(loc.state) ? 'primary' : 'default'}
                />
              ))}
              {locations.length > 5 && (
                <Chip
                  label={`+${locations.length - 5} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TrialMatchCard;


