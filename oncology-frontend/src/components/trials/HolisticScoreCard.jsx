/**
 * HolisticScoreCard Component
 * 
 * Displays holistic feasibility score breakdown for a trial.
 * Shows: Mechanism Fit + Eligibility + PGx Safety (+ Resistance Risk when available)
 * 
 * NOTE: The backend HolisticScoreService supports 4-component scoring. This UI renders
 * weights dynamically when `trial.holistic_weights` is present, otherwise falls back
 * to the legacy 3-component display for backward compatibility.
 */

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Paper,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export default function HolisticScoreCard({ trial }) {
  if (!trial || trial.holistic_score === undefined) {
    return null;
  }

  const {
    holistic_score,
    mechanism_fit_score,
    eligibility_score,
    pgx_safety_score,
    resistance_risk_score,
    holistic_interpretation,
    holistic_recommendation,
    holistic_caveats = [],
    holistic_weights,
  } = trial;

  // Normalize backend weight keys to UI-friendly keys.
  // Backend may return:
  // - { mechanism_fit, eligibility, pgx_safety, resistance_risk }
  // plus aliases: { mechanism, pgx, resistance }
  const weightsRaw = (holistic_weights && typeof holistic_weights === 'object')
    ? holistic_weights
    : null;

  const weights = {
    mechanism: weightsRaw?.mechanism ?? weightsRaw?.mechanism_fit ?? 0.5,
    eligibility: weightsRaw?.eligibility ?? 0.3,
    pgx: weightsRaw?.pgx ?? weightsRaw?.pgx_safety ?? 0.2,
    resistance: weightsRaw?.resistance ?? weightsRaw?.resistance_risk ?? 0,
  };

  const hasResistance = typeof resistance_risk_score === 'number' && Number.isFinite(resistance_risk_score);
  const resistanceWeight = typeof weights.resistance === 'number' ? weights.resistance : 0;

  const getInterpretationColor = (interpretation) => {
    if (interpretation === 'HIGH') return 'success';
    if (interpretation === 'MEDIUM') return 'warning';
    if (interpretation === 'LOW' || interpretation === 'VERY_LOW') return 'error';
    if (interpretation === 'CONTRAINDICATED' || interpretation === 'INELIGIBLE') return 'error';
    return 'default';
  };

  const getScoreColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.5) return 'warning';
    return 'error';
  };

  const interpretationColor = getInterpretationColor(holistic_interpretation);

  return (
    <Paper
      sx={{
        mt: 2,
        p: 2,
        bgcolor: alpha('#667eea', 0.05),
        borderRadius: 2,
        border: `1px solid ${alpha('#667eea', 0.2)}`,
      }}
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Holistic Feasibility Score
      </Typography>

      {/* Overall Score */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {(holistic_score * 100).toFixed(1)}%
          </Typography>
          {holistic_interpretation && (
            <Chip
              label={holistic_interpretation}
              size="small"
              color={interpretationColor}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>
        <LinearProgress
          variant="determinate"
          value={holistic_score * 100}
          color={getScoreColor(holistic_score)}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      {/* Breakdown */}
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {/* Mechanism Fit */}
        {mechanism_fit_score !== undefined && (
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Mechanism Fit ({Math.round(weights.mechanism * 100)}% weight)
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {(mechanism_fit_score * 100).toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={mechanism_fit_score * 100}
              color={getScoreColor(mechanism_fit_score)}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Eligibility */}
        {eligibility_score !== undefined && (
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Eligibility ({Math.round(weights.eligibility * 100)}% weight)
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {(eligibility_score * 100).toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={eligibility_score * 100}
              color={getScoreColor(eligibility_score)}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* PGx Safety */}
        {pgx_safety_score !== undefined && (
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                PGx Safety ({Math.round(weights.pgx * 100)}% weight)
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {(pgx_safety_score * 100).toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={pgx_safety_score * 100}
              color={pgx_safety_score >= 0.8 ? 'success' : pgx_safety_score >= 0.5 ? 'warning' : 'error'}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Resistance Risk (optional; only when backend provided it) */}
        {hasResistance && resistanceWeight > 0 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Resistance Risk ({Math.round(resistanceWeight * 100)}% weight)
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {(resistance_risk_score * 100).toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={resistance_risk_score * 100}
              color={getScoreColor(resistance_risk_score)}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}
      </Stack>

      {/* Recommendation */}
      {holistic_recommendation && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {holistic_recommendation}
          </Typography>
        </Box>
      )}

      {/* Caveats */}
      {holistic_caveats && holistic_caveats.length > 0 && (
        <Box>
          {holistic_caveats.map((caveat, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
              {caveat.includes('CONTRAINDICATED') ? (
                <ErrorIcon sx={{ fontSize: 16, color: 'error.main', mt: 0.25 }} />
              ) : (
                <WarningIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.25 }} />
              )}
              <Typography variant="caption" color="text.secondary">
                {caveat}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Formula note */}
      <Box sx={{ mt: 2, pt: 1, borderTop: `1px solid ${alpha('#667eea', 0.1)}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Score = ({weights.mechanism} × Mechanism) + ({weights.eligibility} × Eligibility) + ({weights.pgx} × PGx)
          {hasResistance && resistanceWeight > 0 ? ` + (${resistanceWeight} × Resistance)` : ''}
        </Typography>
      </Box>

      {/* RUO Disclaimer */}
      <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${alpha('#f44336', 0.2)}` }}>
        <Chip
          label="Research Use Only - Not for Clinical Decision Making"
          size="small"
          color="error"
          variant="outlined"
          sx={{ 
            fontWeight: 600,
            fontSize: '0.7rem',
            borderColor: 'error.main',
            color: 'error.main'
          }}
        />
      </Box>
    </Paper>
  );
}
