/**
 * FeasibilityScoreCard Component
 * 
 * Displays integrated feasibility score for a patient-trial combination.
 * Shows mechanism fit, eligibility, PGx safety, and composite score.
 * 
 * Props:
 * - feasibility: {
 *     trial_id: string,
 *     mechanism_fit: float,
 *     eligibility: float,
 *     pgx_safety: { risk_level, adjustment_factor },
 *     composite_score: float,
 *     action_label: string
 *   }
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Grid
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const FeasibilityScoreCard = ({ feasibility }) => {
  if (!feasibility) return null;
  
  const {
    trial_id,
    mechanism_fit,
    eligibility,
    pgx_safety,
    composite_score,
    action_label
  } = feasibility;
  
  const getScoreColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.4) return 'warning';
    return 'error';
  };
  
  const getActionColor = (label) => {
    if (!label) return 'default';
    const upper = label.toUpperCase();
    if (upper.includes('PREFERRED') || upper.includes('PROCEED')) return 'success';
    if (upper.includes('CONSIDER') || upper.includes('MONITORING')) return 'warning';
    if (upper.includes('AVOID') || upper.includes('HIGH-RISK')) return 'error';
    return 'default';
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {trial_id || 'Trial Assessment'}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Mechanism Fit
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(mechanism_fit || 0) * 100}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  color={getScoreColor(mechanism_fit || 0)}
                />
                <Typography variant="body2" fontWeight="bold">
                  {(mechanism_fit || 0).toFixed(3)}
                </Typography>
              </Box>
              <Chip
                icon={<TrendingUpIcon />}
                label={mechanism_fit > 0.8 ? 'EXCELLENT' : mechanism_fit > 0.5 ? 'GOOD' : 'LOW'}
                size="small"
                color={getScoreColor(mechanism_fit || 0)}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Eligibility
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(eligibility || 0) * 100}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  color={getScoreColor(eligibility || 0)}
                />
                <Typography variant="body2" fontWeight="bold">
                  {(eligibility || 0).toFixed(3)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                PGx Safety
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {pgx_safety?.risk_level === 'HIGH' && <WarningIcon color="error" />}
                {pgx_safety?.risk_level === 'MODERATE' && <WarningIcon color="warning" />}
                {(!pgx_safety || pgx_safety?.risk_level === 'LOW') && <CheckCircleIcon color="success" />}
                <Chip
                  icon={<SecurityIcon />}
                  label={pgx_safety?.risk_level || 'LOW'}
                  size="small"
                  color={pgx_safety?.risk_level === 'HIGH' ? 'error' : pgx_safety?.risk_level === 'MODERATE' ? 'warning' : 'success'}
                />
              </Box>
              {pgx_safety?.adjustment_factor && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Adjustment: {Math.round(pgx_safety.adjustment_factor * 100)}%
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Composite Feasibility Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={(composite_score || 0) * 100}
              sx={{ flexGrow: 1, height: 12, borderRadius: 6 }}
              color={getScoreColor(composite_score || 0)}
            />
            <Typography variant="h5" fontWeight="bold" color={`${getScoreColor(composite_score || 0)}.main`}>
              {(composite_score || 0).toFixed(3)}
            </Typography>
          </Box>
          {action_label && (
            <Chip
              label={action_label}
              color={getActionColor(action_label)}
              sx={{ mt: 1 }}
              size="medium"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

FeasibilityScoreCard.propTypes = {
  feasibility: PropTypes.shape({
    trial_id: PropTypes.string,
    mechanism_fit: PropTypes.number,
    eligibility: PropTypes.number,
    pgx_safety: PropTypes.shape({
      risk_level: PropTypes.string,
      adjustment_factor: PropTypes.number
    }),
    composite_score: PropTypes.number,
    action_label: PropTypes.string
  })
};

export default FeasibilityScoreCard;
