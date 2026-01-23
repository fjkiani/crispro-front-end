/**
 * HolisticClinicalBenefitCard Component
 *
 * Main component displaying overall Holistic Clinical Benefit Score + 5 sub-scores.
 *
 * Props:
 * - holisticScore: HolisticClinicalBenefitResponse object from API
 * - useCase: "trial_enrollment" | "next_line" | "monitoring"
 * - showDetails: boolean (default: true)
 * - showWeights: boolean (default: false)
 * - showCaveats: boolean (default: true)
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip,
  Alert,
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import HolisticScoreBadge from './HolisticScoreBadge';
import ComponentAvailabilityIndicator from './ComponentAvailabilityIndicator';

const COMPONENT_INFO = {
  D: {
    name: 'Diagnostic Fit',
    icon: <ScienceIcon />,
    description: 'Assesses diagnostic context: disease site, tumor subtype, required biomarkers',
    color: 'primary',
  },
  P: {
    name: 'Prognostic Risk',
    icon: <AssessmentIcon />,
    description: 'Predicts expected outlook: PFI, PTPI, line of therapy, baseline covariates',
    color: 'info',
  },
  M: {
    name: 'Mechanism Fit',
    icon: <SettingsIcon />,
    description: 'Aligns tumor biology with drug mechanism (7D vector alignment)',
    color: 'secondary',
  },
  T: {
    name: 'Therapeutic Dynamics',
    icon: <TrendingUpIcon />,
    description: 'Assesses if current regimen is working (KELIM, CA-125/PSA early decline)',
    color: 'success',
  },
  S: {
    name: 'Safety/Tolerability',
    icon: <SecurityIcon />,
    description: 'Evaluates patient safety: PGx risk, organ function, previous toxicity',
    color: 'warning',
  },
};

const getScoreColor = (score) => {
  if (score >= 0.8) return 'success';
  if (score >= 0.6) return 'info';
  if (score >= 0.4) return 'warning';
  return 'error';
};

export default function HolisticClinicalBenefitCard({
  holisticScore,
  useCase = 'next_line',
  showDetails = true,
  showWeights = false,
  showCaveats = true,
}) {
  if (!holisticScore) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Computing holistic clinical benefit score...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const {
    overall,
    D,
    P,
    M,
    T,
    S,
    weights,
    component_available,
    interpretation,
    recommendation,
    caveats = [],
    pgx_details,
    mechanism_alignment,
  } = holisticScore;

  const overallPercent = Math.round(overall * 100);

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title="🎯 Holistic Clinical Benefit Score"
        subheader={`Use Case: ${useCase.replace(/_/g, ' ').toUpperCase()}`}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
      />
      <CardContent>
        {/* Overall Score */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mb={2}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: `8px solid`,
                borderColor: `${getScoreColor(overall)}.main`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${getScoreColor(overall)}.light`,
              }}
            >
              <Typography variant="h4" fontWeight={700} color={`${getScoreColor(overall)}.dark`}>
                {overallPercent}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Overall Score
              </Typography>
              <HolisticScoreBadge interpretation={interpretation} score={overall} />
            </Box>
          </Stack>
          {recommendation && (
            <Alert severity={interpretation === 'HIGH' ? 'success' : interpretation === 'MEDIUM' ? 'info' : 'warning'} sx={{ mt: 2 }}>
              <Typography variant="body2">{recommendation}</Typography>
            </Alert>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Sub-Scores */}
        {showDetails && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Component Scores
            </Typography>
            <Stack spacing={2}>
              {Object.entries({ D, P, M, T, S }).map(([key, score]) => {
                const info = COMPONENT_INFO[key];
                const weight = weights?.[key];
                const isAvailable = component_available?.[key];

                return (
                  <Box key={key}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {info.icon}
                        <Tooltip title={info.description} arrow>
                          <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'help' }}>
                            {info.name} ({key})
                          </Typography>
                        </Tooltip>
                        {!isAvailable && (
                          <Chip label="Default" size="small" variant="outlined" color="default" />
                        )}
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {(score * 100).toFixed(1)}%
                        </Typography>
                        {showWeights && weight !== undefined && (
                          <Chip
                            label={`${(weight * 100).toFixed(0)}% weight`}
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        )}
                      </Stack>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={score * 100}
                      color={getScoreColor(score)}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Component Availability */}
        {component_available && (
          <Box sx={{ mb: 3 }}>
            <ComponentAvailabilityIndicator componentAvailable={component_available} />
          </Box>
        )}

        {/* Mechanism Alignment */}
        {mechanism_alignment && Object.keys(mechanism_alignment).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mechanism Alignment (per pathway)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {Object.entries(mechanism_alignment).map(([pathway, alignment]) => (
                <Chip
                  key={pathway}
                  label={`${pathway}: ${(alignment * 100).toFixed(0)}%`}
                  size="small"
                  color={alignment >= 0.7 ? 'success' : alignment >= 0.5 ? 'warning' : 'default'}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* PGx Details */}
        {pgx_details && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Pharmacogenomics (PGx) Safety
            </Typography>
            {pgx_details.contraindicated ? (
              <Alert severity="error">
                <Typography variant="body2">
                  <strong>Contraindicated:</strong> {pgx_details.reason || 'High toxicity risk detected'}
                </Typography>
              </Alert>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {pgx_details.toxicity_tier && (
                  <Chip
                    label={`Toxicity: ${pgx_details.toxicity_tier}`}
                    size="small"
                    color={pgx_details.toxicity_tier === 'HIGH' ? 'error' : pgx_details.toxicity_tier === 'MODERATE' ? 'warning' : 'success'}
                    variant="outlined"
                  />
                )}
                {pgx_details.adjustment_factor !== undefined && (
                  <Chip
                    label={`Adjustment: ${(pgx_details.adjustment_factor * 100).toFixed(0)}%`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            )}
          </Box>
        )}

        {/* Caveats */}
        {showCaveats && caveats && caveats.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Warnings & Caveats
            </Typography>
            <Stack spacing={1}>
              {caveats.map((caveat, idx) => (
                <Alert key={idx} severity="warning" icon={<InfoIcon />}>
                  <Typography variant="body2">{caveat}</Typography>
                </Alert>
              ))}
            </Stack>
          </Box>
        )}

        {/* Provenance */}
        {holisticScore.provenance && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Formula: {holisticScore.provenance.formula || 'N/A'}
              </Typography>
              {holisticScore.provenance.csi_source === 'yes' && (
                <Chip label="CSI Source" size="small" color="info" variant="outlined" />
              )}
              <Chip
                label={holisticScore.provenance.ruo || 'Research Use Only'}
                size="small"
                color="error"
                variant="outlined"
              />
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
