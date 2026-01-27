/**
 * DosingGuidanceCard Component
 * 
 * Displays pharmacogenomics-based dosing recommendations.
 * Shows dose adjustments, CPIC evidence levels, monitoring requirements, and alternatives.
 * 
 * Props:
 * - guidance: DosingGuidanceResponse from /api/dosing/guidance
 * - loading: boolean
 * - error: string | null
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
  CircularProgress,
  Divider
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

const DosingGuidanceCard = ({ guidance, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          💊 Dosing Guidance (RUO)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Computing dosing recommendations...
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          💊 Dosing Guidance (RUO)
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Paper>
    );
  }
  
  // No result state
  if (!guidance || !guidance.recommendations || guidance.recommendations.length === 0) {
    return null;
  }
  
  const rec = guidance.recommendations[0];
  
  // Color coding for adjustment type
  const getChipColor = (adjustmentType) => {
    switch (adjustmentType) {
      case 'avoid':
        return 'error';
      case 'reduce_50_percent_or_more':
        return 'warning';
      case 'reduce_25_to_50_percent':
        return 'warning';
      case 'reduce_less_than_25_percent':
        return 'info';
      case 'standard_dose':
        return 'success';
      default:
        return 'default';
    }
  };
  
  const getChipIcon = (adjustmentType) => {
    if (adjustmentType === 'avoid' || adjustmentType === 'reduce_50_percent_or_more') {
      return <WarningIcon />;
    }
    return <CheckCircleIcon />;
  };
  
  const getAdjustmentLabel = (adjustmentType, adjustmentFactor) => {
    if (adjustmentType === 'avoid') {
      return 'AVOID';
    }
    if (adjustmentFactor) {
      return `${Math.round(adjustmentFactor * 100)}% Dose`;
    }
    return 'Standard Dose';
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        💊 Dosing Guidance (RUO)
      </Typography>
      
      {/* RUO Disclaimer */}
      <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
        ⚠️ Research Use Only - Not for clinical decision making. Consult pharmacist/physician.
      </Alert>
      
      {/* Main Recommendation */}
      <Box sx={{ mb: 2 }}>
        <Chip
          icon={getChipIcon(rec.adjustment_type)}
          label={getAdjustmentLabel(rec.adjustment_type, rec.adjustment_factor)}
          color={getChipColor(rec.adjustment_type)}
          sx={{ mb: 1, fontWeight: rec.adjustment_type === 'avoid' ? 'bold' : 'normal' }}
        />
        {rec.phenotype && (
          <Chip
            label={rec.phenotype.replace('_', ' ').toUpperCase()}
            variant="outlined"
            size="small"
            sx={{ ml: 1 }}
          />
        )}
        {rec.cpic_level && (
          <Chip
            label={`CPIC Level ${rec.cpic_level}`}
            variant="outlined"
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Box>
      
      {/* Recommendation Text */}
      <Alert 
        severity={rec.adjustment_type === 'avoid' ? 'error' : rec.adjustment_type.includes('reduce') ? 'warning' : 'info'}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          Recommendation:
        </Typography>
        <Typography variant="body2">
          {rec.recommendation}
        </Typography>
        {rec.rationale && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.875rem' }}>
            {rec.rationale}
          </Typography>
        )}
      </Alert>
      
      {/* Adjustment Factor */}
      {rec.adjustment_factor && rec.adjustment_factor !== 1.0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Dose Adjustment:
          </Typography>
          <Typography variant="h6" color="primary">
            {Math.round(rec.adjustment_factor * 100)}% of standard dose
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Monitoring Requirements */}
      {rec.monitoring && rec.monitoring.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon fontSize="small" />
            Monitoring Requirements:
          </Typography>
          <List dense>
            {rec.monitoring.map((item, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Alternatives */}
      {rec.alternatives && rec.alternatives.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            🔄 Alternative Drugs:
          </Typography>
          <List dense>
            {rec.alternatives.map((alt, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={alt}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Cumulative Toxicity Alert */}
      {guidance.cumulative_toxicity_alert && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            Cumulative Toxicity Alert
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {guidance.cumulative_toxicity_alert}
          </Typography>
        </Alert>
      )}
      
      {/* Confidence */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Confidence: {Math.round(guidance.confidence * 100)}%
        </Typography>
        {guidance.contraindicated && (
          <Chip
            label="CONTRAINDICATED"
            color="error"
            size="small"
          />
        )}
      </Box>
    </Paper>
  );
};

DosingGuidanceCard.propTypes = {
  guidance: PropTypes.shape({
    recommendations: PropTypes.arrayOf(PropTypes.object),
    cumulative_toxicity_alert: PropTypes.string,
    contraindicated: PropTypes.bool,
    confidence: PropTypes.number
  }),
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default DosingGuidanceCard;

