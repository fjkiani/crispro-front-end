import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

/**
 * IntegratedConfidenceBar - Displays integrated confidence from drug + food
 * 
 * Props:
 * @param {number} integratedConfidence - Combined confidence (0-1)
 * @param {Object} confidenceBreakdown - {drug_component, food_component, integration_method}
 */
export default function IntegratedConfidenceBar({ 
  integratedConfidence = 0,
  confidenceBreakdown = {}
}) {
  const drugComponent = confidenceBreakdown.drug_component || 0;
  const foodComponent = confidenceBreakdown.food_component || 0;
  const method = confidenceBreakdown.integration_method || 'weighted_average';

  const percentConfidence = Math.round(integratedConfidence * 100);
  const percentDrug = Math.round(drugComponent * 100);
  const percentFood = Math.round(foodComponent * 100);

  const getConfidenceColor = (value) => {
    if (value >= 0.8) return 'success';
    if (value >= 0.6) return 'warning';
    return 'error';
  };

  const color = getConfidenceColor(integratedConfidence);

  return (
    <Card sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Integrated Confidence
        </Typography>
        <Chip
          label={`${percentConfidence}%`}
          color={color}
          sx={{ fontWeight: 'bold', ml: 'auto' }}
        />
      </Box>

      {/* Main Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={percentConfidence}
          color={color}
          sx={{ height: 16, borderRadius: 1 }}
        />
      </Box>

      {/* Breakdown */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 150 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Drug Component:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentDrug}
              color="primary"
              sx={{ flex: 1, height: 8, borderRadius: 1 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 40 }}>
              {percentDrug}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 150 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Food Component:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentFood}
              color="success"
              sx={{ flex: 1, height: 8, borderRadius: 1 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 40 }}>
              {percentFood}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Method Info */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Integration Method: <strong>{method}</strong> (Drug 60% + Food 40% weighted average)
        </Typography>
      </Box>
    </Card>
  );
}

IntegratedConfidenceBar.propTypes = {
  integratedConfidence: PropTypes.number.isRequired,
  confidenceBreakdown: PropTypes.shape({
    drug_component: PropTypes.number,
    food_component: PropTypes.number,
    integration_method: PropTypes.string
  })
};

