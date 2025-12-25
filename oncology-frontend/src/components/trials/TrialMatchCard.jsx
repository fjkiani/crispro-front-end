
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
import { Tooltip } from '@mui/material';
import SAESourceIndicator from './SAESourceIndicator';

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
    // Mechanism fit fields
    mechanism_fit_score,
    combined_score,
    eligibility_score,
    mechanism_alignment,
    low_mechanism_fit_warning,
    mechanism_boost_applied,
    // TRUE SAE fields
    sae_source,
    ddr_bin_score,
  } = trial;

  // Get match score color
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  // Format match score as percentage
  const scorePercent = Math.round(match_score * 100);
  
  // Use combined_score if available, otherwise fall back to match_score
  const displayScore = combined_score !== undefined ? combined_score : match_score;
  const displayScorePercent = Math.round(displayScore * 100);
  
  // Determine if mechanism fit is available
  const hasMechanismFit = mechanism_fit_score !== undefined;

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
            <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end" mb={0.5} flexWrap="wrap">
              {sae_source && (
                <SAESourceIndicator source={sae_source} size="small" />
              )}
              {hasMechanismFit && mechanism_boost_applied && (
                <Chip
                  label="Mechanism-Aligned"
                  size="small"
                  color="success"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
              )}
              {hasMechanismFit && low_mechanism_fit_warning && (
                <Chip
                  label="Low Mechanism Fit"
                  size="small"
                  color="warning"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
              )}
            </Box>
            <Typography variant="h5" color={getScoreColor(displayScore)}>
              {displayScorePercent}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hasMechanismFit ? 'Combined Score' : 'Match Score'}
            </Typography>
            {hasMechanismFit && (
              <Tooltip title="0.7 × Eligibility + 0.3 × Mechanism Fit">
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.25 }}>
                  Formula: 0.7×E + 0.3×M
                </Typography>
              </Tooltip>
            )}
            <LinearProgress
              variant="determinate"
              value={displayScorePercent}
              color={getScoreColor(displayScore)}
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>

        {/* Mechanism Fit Scores (if available) */}
        {hasMechanismFit && (
          <Box mb={2} p={1.5} sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mechanism Fit Scores
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {eligibility_score !== undefined && (
                <Box flex={1} minWidth="120px">
                  <Typography variant="caption" color="text.secondary" display="block">
                    Eligibility
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={eligibility_score * 100}
                    color={getScoreColor(eligibility_score)}
                    sx={{ height: 8, borderRadius: 1, mt: 0.5 }}
                  />
                  <Typography variant="caption" display="block" mt={0.5}>
                    {(eligibility_score * 100).toFixed(0)}%
                  </Typography>
                </Box>
              )}
              {mechanism_fit_score !== undefined && (
                <Box flex={1} minWidth="120px">
                  <Typography variant="caption" color="text.secondary" display="block">
                    Mechanism Fit
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={mechanism_fit_score * 100}
                    color={getScoreColor(mechanism_fit_score)}
                    sx={{ height: 8, borderRadius: 1, mt: 0.5 }}
                  />
                  <Typography variant="caption" display="block" mt={0.5}>
                    {(mechanism_fit_score * 100).toFixed(0)}%
                  </Typography>
                </Box>
              )}
              {combined_score !== undefined && (
                <Box flex={1} minWidth="120px">
                  <Typography variant="caption" color="text.secondary" display="block">
                    Combined
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={combined_score * 100}
                    color={getScoreColor(combined_score)}
                    sx={{ height: 8, borderRadius: 1, mt: 0.5 }}
                  />
                  <Typography variant="caption" display="block" mt={0.5}>
                    {(combined_score * 100).toFixed(0)}%
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Mechanism Alignment Breakdown */}
            {mechanism_alignment && Object.keys(mechanism_alignment).length > 0 && (
              <Box mt={2}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Pathway Alignment:
                  </Typography>
                  {sae_source === "true_sae" && (
                    <SAESourceIndicator source={sae_source} size="small" />
                  )}
                </Box>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {Object.entries(mechanism_alignment).map(([pathway, score]) => {
                    // Show DDR_bin score for DDR pathway when TRUE SAE is used
                    const isDDR = pathway.toLowerCase().includes('ddr');
                    const showDDRBin = isDDR && sae_source === "true_sae" && ddr_bin_score !== undefined;
                    
                    return (
                      <Tooltip
                        key={pathway}
                        title={
                          showDDRBin
                            ? `DDR pathway alignment: ${(score * 100).toFixed(0)}%\nDDR_bin score: ${(ddr_bin_score * 100).toFixed(0)}% (TRUE SAE)`
                            : `${pathway}: ${(score * 100).toFixed(0)}%`
                        }
                        arrow
                      >
                        <Chip
                          label={
                            showDDRBin
                              ? `DDR: ${(score * 100).toFixed(0)}% (DDR_bin: ${(ddr_bin_score * 100).toFixed(0)}%)`
                              : `${pathway}: ${(score * 100).toFixed(0)}%`
                          }
                          size="small"
                          color={score >= 0.5 ? 'success' : score >= 0.3 ? 'warning' : 'default'}
                          variant={showDDRBin ? 'filled' : 'outlined'}
                          sx={{ fontSize: '0.7rem', height: '24px' }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Interventions */}
        {interventions && interventions.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              <strong>Interventions:</strong> {interventions.join(', ')}
            </Typography>
          </Box>
        )}

        {/* Eligibility Checklist */}
        {reasoning && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Eligibility Checklist
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                icon={<CheckCircleIcon className="h-4 w-4" />}
                label={`Hard: ✅ ${reasoning.why_eligible?.length || 0} met`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircleIcon className="h-4 w-4" />}
                label={`Soft: ${reasoning.why_good_fit?.length || 0} boosts`}
                size="small"
                color="info"
                variant="outlined"
              />
              {reasoning.conditional_requirements?.length > 0 && (
                <Chip
                  icon={<ExclamationTriangleIcon className="h-4 w-4" />}
                  label={`Conditional: ${reasoning.conditional_requirements.length}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {reasoning.red_flags?.length > 0 && (
                <Chip
                  icon={<XCircleIcon className="h-4 w-4" />}
                  label={`Red Flags: ${reasoning.red_flags.length}`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Reasoning Sections (Expandable) */}
        {reasoning && (
          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ChevronDownIcon className="h-5 w-5" />}>
              <Typography variant="subtitle2">
                Match Reasoning {expanded ? '(Hide)' : '(Show Details)'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Why Eligible */}
              {reasoning.why_eligible && reasoning.why_eligible.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    ✅ Why Eligible
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {reasoning.why_eligible.map((reason, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{reason}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Why Good Fit */}
              {reasoning.why_good_fit && reasoning.why_good_fit.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="info.main" gutterBottom>
                    🎯 Why Good Fit
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {reasoning.why_good_fit.map((reason, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{reason}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Conditional Requirements */}
              {reasoning.conditional_requirements && reasoning.conditional_requirements.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    ⚠️ Conditional Requirements
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {reasoning.conditional_requirements.map((req, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{req}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Red Flags */}
              {reasoning.red_flags && reasoning.red_flags.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    ❌ Red Flags
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {reasoning.red_flags.map((flag, idx) => (
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
                  label={`Evidence: ${reasoning.evidence_tier || 'Unknown'}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Enrollment: ${reasoning.enrollment_likelihood || 'Unknown'}`}
                  size="small"
                  variant="outlined"
                  color={
                    reasoning.enrollment_likelihood === 'HIGH'
                      ? 'success'
                      : reasoning.enrollment_likelihood === 'MEDIUM'
                      ? 'warning'
                      : 'default'
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>
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


