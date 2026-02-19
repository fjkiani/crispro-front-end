
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
import HolisticScoreCard from './HolisticScoreCard';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

const TrialMatchCard = ({ trial, rank }) => {
  const [expanded, setExpanded] = useState(false);

  if (!trial) return null;

  const {
    nct_id,
    title,
    phase,
    phases, // Backend might use 'phases' instead of 'phase'
    status,
    interventions: interventionsRaw,
    locations,
    match_score,
    score, // Backend might use 'score' instead of 'match_score'
    total_score, // Backend might use 'total_score'
    reasoning,
    source_url,
    holistic_score,
    mechanism_fit_score,
    eligibility_score,
    pgx_safety_score,
    holistic_interpretation,
    holistic_caveats,
    llm_assessment,
    is_tagged,
    moa_source,
    moa_confidence,
    keyword_matches,
    // ── Pipeline-Hardened Fields (wired Feb 2026) ──
    moa_tags,
    scoring_breakdown,
    why_included,
    trial_line_bucket,
    freshness,
  } = trial;

  // MoA tag color map
  const MOA_TAG_COLORS = {
    parp_inhibitor: '#9c27b0', ddr: '#1565c0', checkpoint_inhibitor: '#2e7d32',
    immunotherapy: '#2e7d32', anti_angiogenic: '#e65100', chemotherapy: '#616161',
    platinum_based: '#78909c', taxane: '#5d4037', adc: '#00838f',
    cell_therapy: '#ad1457', atr_inhibitor: '#283593', wee1_inhibitor: '#4527a0',
    mek_inhibitor: '#bf360c', folate_antagonist: '#00695c', pi3k_akt_mtor: '#f57f17',
    radiation: '#ff6f00',
  };

  // Inclusion reason display
  const INCLUSION_BADGES = {
    pinned: { label: '📌 Pinned', color: '#ff9800' },
    ddr_intervention_match: { label: '🔬 DDR Match', color: '#1565c0' },
    discovery: { label: '🔍 Discovery', color: '#4caf50' },
  };

  // Line bucket display
  const LINE_LABELS = {
    frontline: { label: '1L Frontline', color: 'success' },
    maintenance: { label: 'Maintenance', color: 'info' },
    recurrent: { label: 'Recurrent', color: 'warning' },
    platinum_resistant: { label: 'Plat-Resistant', color: 'error' },
    unknown: { label: 'Line TBD', color: 'default' },
  };

  // Normalize phase - use 'phase' if available, otherwise 'phases'
  const normalizedPhase = phase || phases || 'Unknown Phase';

  // Normalize "match score" for display.
  // Prefer backend holistic_score (already composite), otherwise fall back to match_score/score.
  const rawDisplayScore = (typeof holistic_score === 'number' ? holistic_score : (match_score ?? score ?? total_score ?? 0));
  const normalizedMatchScore =
    (typeof rawDisplayScore === 'number' && rawDisplayScore > 1)
      ? rawDisplayScore / 100
      : rawDisplayScore;

  // Normalize interventions - handle both array of strings and array of objects
  const interventions = Array.isArray(interventionsRaw)
    ? interventionsRaw.map(int => typeof int === 'string' ? int : int.name || int.drug || String(int))
    : (typeof interventionsRaw === 'string' ? [interventionsRaw] : []);

  // Get match score color
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  // Format match score as percentage
  const scorePercent = Math.round(normalizedMatchScore * 100);

  const reasoningObj = typeof reasoning === 'object' && reasoning !== null ? reasoning : null;
  const reasoningText = typeof reasoning === 'string' ? reasoning : null;
  const assessmentObj = typeof llm_assessment === 'object' && llm_assessment !== null ? llm_assessment : null;

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
              <Chip label={normalizedPhase} size="small" variant="outlined" />
              <Chip
                label={status || 'Unknown Status'}
                size="small"
                color={status?.toLowerCase().includes('recruiting') ? 'success' : 'default'}
              />
              {/* Trial Line Bucket */}
              {trial_line_bucket && LINE_LABELS[trial_line_bucket] && (
                <Chip
                  label={LINE_LABELS[trial_line_bucket].label}
                  size="small"
                  color={LINE_LABELS[trial_line_bucket].color}
                  variant="outlined"
                />
              )}
              {/* Inclusion reason provenance */}
              {why_included && INCLUSION_BADGES[why_included] && (
                <Chip
                  label={INCLUSION_BADGES[why_included].label}
                  size="small"
                  sx={{ bgcolor: INCLUSION_BADGES[why_included].color, color: '#fff', fontWeight: 600 }}
                />
              )}
              {/* Freshness indicator */}
              {freshness && (
                <Chip
                  label={freshness.stale ? '⏳ Stale' : '🟢 Fresh'}
                  size="small"
                  color={freshness.stale ? 'warning' : 'success'}
                  variant="outlined"
                  title={freshness.last_refreshed_at ? `Last: ${freshness.last_refreshed_at}` : 'No refresh data'}
                />
              )}
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
            <Typography variant="h5" color={getScoreColor(normalizedMatchScore)}>
              {scorePercent}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Match Score
            </Typography>
            <LinearProgress
              variant="determinate"
              value={scorePercent}
              color={getScoreColor(normalizedMatchScore)}
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

        {/* MoA Tags (from pipeline hardening) */}
        {Array.isArray(moa_tags) && moa_tags.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Mechanism Tags
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {moa_tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag.replace(/_/g, ' ')}
                  size="small"
                  sx={{
                    bgcolor: MOA_TAG_COLORS[tag] || '#757575',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    height: 22,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Tagging / MoA (why it is tagged) */}
        {(is_tagged || moa_source || typeof moa_confidence === 'number' || (keyword_matches && Object.keys(keyword_matches).length > 0)) && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Tagging
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {is_tagged ? (
                <Chip size="small" color="success" variant="outlined" label="Tagged (MoA vector available)" />
              ) : (
                <Chip size="small" variant="outlined" label="Not tagged" />
              )}
              {moa_source ? (
                <Chip size="small" variant="outlined" label={`MoA source: ${moa_source}`} />
              ) : null}
              {typeof moa_confidence === 'number' ? (
                <Chip size="small" variant="outlined" label={`MoA confidence: ${Math.round(moa_confidence * 100)}%`} />
              ) : null}
              {keyword_matches && Object.keys(keyword_matches).length > 0 ? (
                Object.keys(keyword_matches).slice(0, 6).map((k) => (
                  <Chip key={k} size="small" color="info" variant="outlined" label={k} />
                ))
              ) : null}
            </Box>
          </Box>
        )}

        {/* Eligibility Checklist (prefer deterministic llm_assessment contract when present) */}
        {(assessmentObj || reasoningObj) && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Eligibility Checklist
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                icon={<CheckCircleIcon style={{ width: 16, height: 16 }} />}
                label={`Hard: ✅ ${assessmentObj ? (assessmentObj.met_criteria?.length || 0) : (reasoningObj?.why_eligible?.length || 0)} met`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircleIcon style={{ width: 16, height: 16 }} />}
                label={`Soft: ${assessmentObj ? (assessmentObj.unclear_criteria?.length || 0) : (reasoningObj?.why_good_fit?.length || 0)} boosts`}
                size="small"
                color="info"
                variant="outlined"
              />
              {reasoningObj?.conditional_requirements?.length > 0 && (
                <Chip
                  icon={<ExclamationTriangleIcon style={{ width: 16, height: 16 }} />}
                  label={`Conditional: ${reasoningObj.conditional_requirements.length}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {reasoningObj?.red_flags?.length > 0 && (
                <Chip
                  icon={<XCircleIcon style={{ width: 16, height: 16 }} />}
                  label={`Red Flags: ${reasoningObj.red_flags.length}`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
              {assessmentObj?.eligibility_status ? (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<InformationCircleIcon style={{ width: 16, height: 16 }} />}
                  label={assessmentObj.eligibility_status}
                />
              ) : null}
            </Box>
          </Box>
        )}

        {/* Reasoning Sections (Expandable) */}
        {reasoningObj && (
          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ChevronDownIcon style={{ width: 20, height: 20 }} />}>
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

              {/* Scoring Breakdown (from pipeline hardening) */}
              {scoring_breakdown && (
                <Box mt={2} p={1.5} sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
                    Score Weights
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {scoring_breakdown.weights && Object.entries(scoring_breakdown.weights).map(([k, v]) => (
                      <Chip
                        key={k}
                        label={`${k.replace(/_/g, ' ')}: ${Math.round(v * 100)}%`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem' }}
                      />
                    ))}
                  </Box>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                    {typeof scoring_breakdown.mechanism_fit_score === 'number' && (
                      <Typography variant="caption">Mech: {(scoring_breakdown.mechanism_fit_score * 100).toFixed(0)}%</Typography>
                    )}
                    {typeof scoring_breakdown.eligibility_score === 'number' && (
                      <Typography variant="caption">Elig: {(scoring_breakdown.eligibility_score * 100).toFixed(0)}%</Typography>
                    )}
                    {typeof scoring_breakdown.pgx_safety_score === 'number' && (
                      <Typography variant="caption">PGx: {(scoring_breakdown.pgx_safety_score * 100).toFixed(0)}%</Typography>
                    )}
                    {typeof scoring_breakdown.resistance_risk_score === 'number' && (
                      <Typography variant="caption">Resist: {(scoring_breakdown.resistance_risk_score * 100).toFixed(0)}%</Typography>
                    )}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Fallback reasoning text (older payloads) */}
        {reasoningText && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {reasoningText}
          </Alert>
        )}

        {/* Holistic Score Card (backend-computed) */}
        {trial.holistic_score !== undefined && (
          <HolisticScoreCard trial={trial} />
        )}
        {trial.holistic_score === undefined && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Holistic score not attached in this response.
          </Alert>
        )}

        {/* Locations */}
        {locations && locations.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              <MapPinIcon style={{ width: 16, height: 16, display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
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


