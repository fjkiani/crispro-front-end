/**
 * SafetyGateCard Component
 * 
 * Drug-level PGx safety card (Research Use Only).
 *
 * Renders Safety Gate results attached to a WIWFM drug object:
 * - drug.pgx_screening.toxicity_tier (HIGH/MODERATE/LOW)
 * - drug.pgx_screening.adjustment_factor (0-1)
 * - drug.pgx_screening.alerts[]
 * - drug.pgx_screening.recommendations[]
 * - drug.composite_score, drug.action_label, drug.risk_benefit_rationale
 * 
 * Props:
 * - drug: object (from result.wiwfm.drugs[*])
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const SafetyGateCard = ({ drug }) => {
  if (!drug) {
    return null;
  }
  
  const drugName = drug.name || drug.drug || drug.drug_name || 'Unknown drug';
  const pgx = drug.pgx_screening || null;
  const compositeScore = typeof drug.composite_score === 'number' ? drug.composite_score : null;
  const actionLabel = drug.action_label || null;
  const rationale = drug.risk_benefit_rationale || pgx?.rationale || null;

  if (!pgx) {
    return null;
  }

  const toxicityTier = pgx.toxicity_tier || 'LOW';
  const adjustmentFactor = typeof pgx.adjustment_factor === 'number' ? pgx.adjustment_factor : 1.0;
  const alerts = Array.isArray(pgx.alerts) ? pgx.alerts : [];
  const recommendations = Array.isArray(pgx.recommendations) ? pgx.recommendations : [];

  const gateTriggered = toxicityTier === 'HIGH' || toxicityTier === 'MODERATE' || adjustmentFactor < 1.0;
  const isHighRisk = toxicityTier === 'HIGH' || adjustmentFactor <= 0.1;
  const isModerateRisk = !isHighRisk && (toxicityTier === 'MODERATE' || (adjustmentFactor > 0.1 && adjustmentFactor < 1.0));
  const severity = isHighRisk ? 'error' : isModerateRisk ? 'warning' : 'success';
  
  return (
    <Paper sx={{ p: 3, mb: 2, border: gateTriggered ? '2px solid' : '1px solid', borderColor: gateTriggered ? 'warning.main' : 'divider' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon color={gateTriggered ? 'warning' : 'primary'} />
        PGx Safety Gate (Drug-Level, RUO)
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Drug: {drugName}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Tier: ${toxicityTier}`}
            color={toxicityTier === 'HIGH' ? 'error' : toxicityTier === 'MODERATE' ? 'warning' : 'success'}
            size="small"
          />
          <Chip
            label={`Adj: ${Math.round(adjustmentFactor * 100)}%`}
            color={adjustmentFactor < 1.0 ? 'warning' : 'success'}
            size="small"
          />
          {actionLabel && (
            <Chip
              label={actionLabel}
              color={severity}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          )}
          {typeof compositeScore === 'number' && (
            <Chip
              label={`Composite: ${compositeScore.toFixed(3)}`}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>
      
      {gateTriggered && (
        <Alert
          severity={severity}
          icon={<WarningIcon />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>🚨 SAFETY GATE TRIGGERED</AlertTitle>
          <Typography variant="body2" sx={{ mt: 1 }}>
            → {toxicityTier} PGx risk detected (adjustment factor: {adjustmentFactor})
          </Typography>
          <Divider sx={{ my: 1 }} />
          {alerts.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Alerts
              </Typography>
              <List dense>
                {alerts.slice(0, 6).map((a, idx) => (
                  <ListItem key={idx} sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={`${a.gene || 'GENE'}${a.variant ? ` ${a.variant}` : ''}`}
                      secondary={a.message || ''}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {recommendations.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Recommendations
              </Typography>
              <List dense>
                {recommendations.slice(0, 4).map((r, idx) => (
                  <ListItem key={idx} sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={`${r.gene || 'GENE'}${r.variant ? ` ${r.variant}` : ''}`}
                      secondary={r.recommendation || (Array.isArray(r.alternatives) ? `Alternatives: ${r.alternatives.join(', ')}` : '')}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
            ✅ ACTION: {actionLabel || (isHighRisk ? 'AVOID / use alternative' : 'Dose adjust / monitor')}
          </Typography>
          {rationale && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {rationale}
            </Typography>
          )}
        </Alert>
      )}
      
      {!gateTriggered && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
          <AlertTitle>✅ No Safety Gate Triggered</AlertTitle>
          <Typography variant="body2">
            No actionable PGx risk detected. Standard dosing appropriate.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

SafetyGateCard.propTypes = {
  drug: PropTypes.shape({
    name: PropTypes.string,
    drug: PropTypes.string,
    drug_name: PropTypes.string,
    efficacy_score: PropTypes.number,
    composite_score: PropTypes.number,
    action_label: PropTypes.string,
    risk_benefit_rationale: PropTypes.string,
    pgx_screening: PropTypes.shape({
      toxicity_tier: PropTypes.string,
      adjustment_factor: PropTypes.number,
      alerts: PropTypes.arrayOf(PropTypes.object),
      recommendations: PropTypes.arrayOf(PropTypes.object),
      rationale: PropTypes.string,
    }),
  }),
};

export default SafetyGateCard;
