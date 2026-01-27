/**
 * ChemosensitivityFeaturesCard Component
 * 
 * Displays KELIM/CA-125 features when available.
 * 
 * Props:
 * - kelimFeatures: Object with kelim_k_value, kelim_category, ca125_percent_change_day21, etc.
 * - diseaseSite: string (e.g., "ovary") - determines if component should display
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const ChemosensitivityFeaturesCard = ({
  kelimFeatures,
  diseaseSite = 'ovary',
}) => {
  // Only display for ovarian cancer (CA-125 is not used for other diseases in current implementation)
  if (!kelimFeatures || diseaseSite?.toLowerCase() !== 'ovary') {
    return null;
  }

  const {
    kelim_k_value,
    kelim_category,
    ca125_percent_change_day21,
    ca125_percent_change_day42,
    ca125_time_to_50pct_reduction_days,
    ca125_normalized_by_cycle3,
  } = kelimFeatures;

  // Get KELIM category color
  const getKELIMColor = (category) => {
    if (category === 'favorable') return 'success';
    if (category === 'intermediate') return 'warning';
    if (category === 'unfavorable') return 'error';
    return 'default';
  };

  // Get KELIM category label
  const getKELIMLabel = (category) => {
    if (category === 'favorable') return 'Favorable';
    if (category === 'intermediate') return 'Intermediate';
    if (category === 'unfavorable') return 'Unfavorable';
    return category || 'Unknown';
  };

  // Format percentage change (positive = bad, negative = good for CA-125)
  const formatPercentChange = (change) => {
    if (change === null || change === undefined) return 'N/A';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change) => {
    if (change === null || change === undefined) return 'default';
    // Negative change = decreasing = good (green)
    // Positive change = increasing = bad (red)
    if (change < -50) return 'success'; // Significant drop
    if (change < -20) return 'info'; // Moderate drop
    if (change < 20) return 'warning'; // Stable
    return 'error'; // Rising
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <AssessmentIcon />
            <Typography variant="h6">CA-125 Chemosensitivity Features</Typography>
          </Box>
        }
        subheader="KELIM (Kinetic-ELIMination rate constant)"
      />
      <CardContent>
        <Stack spacing={2}>
          {/* KELIM K-value and Category */}
          {kelim_k_value !== null && kelim_k_value !== undefined && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="subtitle2">KELIM K-value</Typography>
                {kelim_category && (
                  <Chip
                    label={getKELIMLabel(kelim_category)}
                    size="small"
                    color={getKELIMColor(kelim_category)}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h6" color={getKELIMColor(kelim_category)}>
                  {kelim_k_value.toFixed(2)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (kelim_k_value / 1.5) * 100)} // Scale to 1.5 max
                  color={getKELIMColor(kelim_category)}
                  sx={{ flex: 1, height: 8, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                K ≥ 1.0 = Favorable (good chemosensitivity) • K &lt; 0.5 = Unfavorable (poor chemosensitivity)
              </Typography>
            </Box>
          )}

          {/* CA-125 Percentage Changes */}
          {(ca125_percent_change_day21 !== null || ca125_percent_change_day42 !== null) && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                CA-125 Response Kinetics
              </Typography>
              <Stack spacing={1}>
                {ca125_percent_change_day21 !== null && (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Day 21 Change:
                    </Typography>
                    <Chip
                      icon={ca125_percent_change_day21 < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />}
                      label={formatPercentChange(ca125_percent_change_day21)}
                      size="small"
                      color={getChangeColor(ca125_percent_change_day21)}
                    />
                  </Box>
                )}
                {ca125_percent_change_day42 !== null && (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Day 42 Change:
                    </Typography>
                    <Chip
                      icon={ca125_percent_change_day42 < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />}
                      label={formatPercentChange(ca125_percent_change_day42)}
                      size="small"
                      color={getChangeColor(ca125_percent_change_day42)}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Time to 50% Reduction */}
          {ca125_time_to_50pct_reduction_days !== null && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Time to 50% Reduction
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {ca125_time_to_50pct_reduction_days} days
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Days from treatment start to 50% CA-125 reduction
              </Typography>
            </Box>
          )}

          {/* Normalization Status */}
          {ca125_normalized_by_cycle3 !== null && (
            <Box>
              <Chip
                icon={ca125_normalized_by_cycle3 ? <TrendingDownIcon /> : null}
                label={ca125_normalized_by_cycle3 ? 'Normalized by Cycle 3' : 'Not Normalized by Cycle 3'}
                size="small"
                color={ca125_normalized_by_cycle3 ? 'success' : 'warning'}
              />
            </Box>
          )}

          {/* Explanation */}
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="caption">
              <strong>KELIM:</strong> CA-125 Kinetic-ELIMination rate constant. 
              Measures how quickly CA-125 declines under effective therapy. 
              Higher K = better chemosensitivity. K ≥ 1.0 suggests favorable response.
            </Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChemosensitivityFeaturesCard;
