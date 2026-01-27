/**
 * TrialSafetyGate Component
 * 
 * Displays PGx safety gate for clinical trials.
 * Shows safety flags, high-risk drug alerts, and trial-level safety status.
 * 
 * Props:
 * - trial: Trial object with pgx_safety field
 * - loading: boolean
 * - error: string | null
 * 
 * Sprint 5: Trial-Level Safety Gate
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import ShieldIcon from '@mui/icons-material/Shield';
import ClinicalTrialIcon from '@mui/icons-material/MedicalServices';

const TrialSafetyGate = ({ trial, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon color="primary" />
          Trial Safety Gate (RUO)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Screening trial for PGx safety...
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon color="error" />
          Trial Safety Gate (RUO)
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Paper>
    );
  }
  
  // No safety data
  if (!trial || !trial.pgx_safety) {
    return null;
  }
  
  const safety = trial.pgx_safety;
  const hasHighRisk = safety.has_high_risk_drug;
  const hasModerateRisk = safety.has_moderate_risk_drug;
  const safetyStatus = safety.safety_status;
  const alerts = safety.alerts || [];
  const isUnknown = safetyStatus === 'UNKNOWN_NO_INTERVENTIONS';
  
  // Determine severity
  const getSeverity = () => {
    if (isUnknown) {
      return 'info';
    }
    if (hasHighRisk || safetyStatus === 'HIGH_RISK') {
      return 'error';
    }
    if (hasModerateRisk || safetyStatus === 'MODERATE_RISK') {
      return 'warning';
    }
    return 'success';
  };
  
  // Get status label
  const getStatusLabel = () => {
    if (isUnknown) {
      return 'UNKNOWN — INTERVENTIONS NOT PROVIDED';
    }
    if (safetyStatus === 'HIGH_RISK') {
      return 'HIGH RISK - REVIEW REQUIRED';
    }
    if (safetyStatus === 'MODERATE_RISK') {
      return 'MODERATE RISK - MONITOR';
    }
    return 'SAFE - PROCEED';
  };
  
  // Get icon
  const getIcon = () => {
    if (isUnknown) {
      return <ShieldIcon />;
    }
    if (hasHighRisk) {
      return <BlockIcon />;
    }
    if (hasModerateRisk) {
      return <WarningIcon />;
    }
    return <CheckCircleIcon />;
  };
  
  // Get chip color
  const getChipColor = () => {
    if (isUnknown) {
      return 'default';
    }
    if (hasHighRisk) {
      return 'error';
    }
    if (hasModerateRisk) {
      return 'warning';
    }
    return 'success';
  };
  
  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        border: '2px solid',
        borderColor: getSeverity() === 'error' ? 'error.main' : 
                     getSeverity() === 'warning' ? 'warning.main' : 
                     'success.main',
        backgroundColor: getSeverity() === 'error' ? 'error.light' : 
                         getSeverity() === 'warning' ? 'warning.light' : 
                         'success.light',
        opacity: 0.95
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ClinicalTrialIcon color={getSeverity()} />
        <Typography variant="h6" fontWeight="bold">
          Trial Safety Gate
        </Typography>
        <Chip
          icon={getIcon()}
          label={getStatusLabel()}
          color={getChipColor()}
          sx={{ ml: 'auto', fontWeight: 'bold' }}
        />
      </Box>
      
      {/* RUO Disclaimer */}
      <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
        ⚠️ Research Use Only - Not for clinical decision making. Consult trial coordinator/physician.
      </Alert>
      
      {/* Main Alert */}
      <Alert 
        severity={getSeverity()}
        icon={getIcon()}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          Trial Safety Assessment:
        </Typography>
        <Typography variant="body2">
          {isUnknown && 'Trial drug interventions were not included in this payload, so PGx safety could not be computed. This is not a SAFE result.'}
          {hasHighRisk && 'This trial contains drugs with HIGH PGx toxicity risk. Review required before enrollment.'}
          {!hasHighRisk && hasModerateRisk && 'This trial contains drugs with MODERATE PGx toxicity risk. Dose adjustments may be required.'}
          {!isUnknown && !hasHighRisk && !hasModerateRisk && 'This trial has no identified PGx safety concerns. Standard enrollment procedures apply.'}
        </Typography>
      </Alert>
      
      {/* Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon fontSize="small" />
            PGx Safety Alerts:
          </Typography>
          <List dense>
            {alerts.map((alert, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {alert.gene} {alert.variant && `(${alert.variant})`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Trial Info */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Trial: {trial.nct_id || trial.title || 'Unknown'}
        </Typography>
      </Box>
    </Paper>
  );
};

TrialSafetyGate.propTypes = {
  trial: PropTypes.shape({
    nct_id: PropTypes.string,
    title: PropTypes.string,
    pgx_safety: PropTypes.shape({
      has_high_risk_drug: PropTypes.bool,
      has_moderate_risk_drug: PropTypes.bool,
      safety_status: PropTypes.oneOf(['HIGH_RISK', 'MODERATE_RISK', 'SAFE', 'UNKNOWN_NO_INTERVENTIONS']),
      alerts: PropTypes.arrayOf(PropTypes.object)
    })
  }),
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default TrialSafetyGate;


