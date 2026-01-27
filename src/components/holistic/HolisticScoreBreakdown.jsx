/**
 * HolisticScoreBreakdown Component
 *
 * Detailed breakdown visualization of D, P, M, T, S sub-scores.
 * Supports bar chart, radar chart visualization options.
 *
 * Props:
 * - holisticScore: HolisticClinicalBenefitResponse object
 * - visualizationType: "bar" | "radar" | "stacked" (default: "bar")
 */
import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Grid,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const COMPONENT_INFO = {
  D: {
    name: 'Diagnostic Fit',
    icon: <ScienceIcon />,
    description: 'Assesses diagnostic context: disease site, tumor subtype, required biomarkers',
    color: '#1976d2', // primary
  },
  P: {
    name: 'Prognostic Risk',
    icon: <AssessmentIcon />,
    description: 'Predicts expected outlook: PFI, PTPI, line of therapy, baseline covariates',
    color: '#0288d1', // info
  },
  M: {
    name: 'Mechanism Fit',
    icon: <SettingsIcon />,
    description: 'Aligns tumor biology with drug mechanism (7D vector alignment)',
    color: '#9c27b0', // secondary
  },
  T: {
    name: 'Therapeutic Dynamics',
    icon: <TrendingUpIcon />,
    description: 'Assesses if current regimen is working (KELIM, CA-125/PSA early decline)',
    color: '#2e7d32', // success
  },
  S: {
    name: 'Safety/Tolerability',
    icon: <SecurityIcon />,
    description: 'Evaluates patient safety: PGx risk, organ function, previous toxicity',
    color: '#ed6c02', // warning
  },
};

const getScoreColor = (score) => {
  if (score >= 0.8) return '#2e7d32'; // success
  if (score >= 0.6) return '#0288d1'; // info
  if (score >= 0.4) return '#ed6c02'; // warning
  return '#d32f2f'; // error
};

export default function HolisticScoreBreakdown({
  holisticScore,
  visualizationType = 'bar',
}) {
  if (!holisticScore) {
    return null;
  }

  const { D, P, M, T, S, weights, overall } = holisticScore;
  const scores = { D, P, M, T, S };

  if (visualizationType === 'bar') {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Score Breakdown
        </Typography>
        <Stack spacing={3}>
          {Object.entries(scores).map(([key, score]) => {
            const info = COMPONENT_INFO[key];
            const weight = weights?.[key];
            const contribution = weight ? (weight * score) : 0;

            return (
              <Box key={key}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {info.icon}
                    <Tooltip title={info.description} arrow>
                      <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'help' }}>
                        {info.name} ({key})
                      </Typography>
                    </Tooltip>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {weight !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        Weight: {(weight * 100).toFixed(0)}%
                      </Typography>
                    )}
                    <Typography variant="body2" fontWeight={600}>
                      {(score * 100).toFixed(1)}%
                    </Typography>
                    {weight !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        Contribution: {(contribution * 100).toFixed(1)}%
                      </Typography>
                    )}
                  </Stack>
                </Stack>
                <Box sx={{ position: 'relative' }}>
                  <LinearProgress
                    variant="determinate"
                    value={score * 100}
                    sx={{
                      height: 12,
                      borderRadius: 1,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getScoreColor(score),
                      },
                    }}
                  />
                  {weight !== undefined && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${score * 100}%`,
                        height: '100%',
                        borderRight: '2px solid',
                        borderColor: 'text.primary',
                        opacity: 0.3,
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
        {overall !== undefined && (
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={600}>
                Overall Score
              </Typography>
              <Typography variant="h6" fontWeight={700} color={getScoreColor(overall)}>
                {(overall * 100).toFixed(1)}%
              </Typography>
            </Stack>
          </Box>
        )}
      </Paper>
    );
  }

  // Stacked bar visualization
  if (visualizationType === 'stacked') {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Weighted Contribution Breakdown
        </Typography>
        <Box sx={{ position: 'relative', height: 40, mb: 2 }}>
          {Object.entries(scores).map(([key, score], idx, arr) => {
            const weight = weights?.[key] || 0;
            const contribution = weight * score;
            const prevWidth = arr.slice(0, idx).reduce((sum, [k]) => {
              const w = weights?.[k] || 0;
              const s = scores[k];
              return sum + (w * s);
            }, 0);

            return (
              <Box
                key={key}
                sx={{
                  position: 'absolute',
                  left: `${prevWidth * 100}%`,
                  width: `${contribution * 100}%`,
                  height: '100%',
                  bgcolor: COMPONENT_INFO[key].color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: idx < arr.length - 1 ? '1px solid white' : 'none',
                }}
              >
                {contribution > 0.05 && (
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                    {key}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
        <Stack spacing={1}>
          {Object.entries(scores).map(([key, score]) => {
            const info = COMPONENT_INFO[key];
            const weight = weights?.[key] || 0;
            const contribution = weight * score;

            return (
              <Stack key={key} direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1}>
                  {info.icon}
                  <Typography variant="body2">{info.name}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {key}: {(score * 100).toFixed(1)}% × {(weight * 100).toFixed(0)}% = {(contribution * 100).toFixed(1)}%
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Paper>
    );
  }

  // Default: horizontal bar chart
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Component Scores
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(scores).map(([key, score]) => {
          const info = COMPONENT_INFO[key];
          return (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Tooltip title={info.description} arrow>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <Stack spacing={1}>
                    {info.icon}
                    <Typography variant="body2" fontWeight={600}>
                      {info.name}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={getScoreColor(score)}>
                      {(score * 100).toFixed(1)}%
                    </Typography>
                  </Stack>
                </Paper>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
