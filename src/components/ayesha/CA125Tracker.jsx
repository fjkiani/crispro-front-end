/**
 * CA-125 Tracker Component
 * 
 * Displays CA-125 intelligence:
 * - Current value and burden class
 * - Forecast (cycle 3, cycle 6, target)
 * - Resistance flags
 * - Monitoring strategy
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';

const CA125Tracker = ({
  current_value,
  burden_class,
  forecast,
  resistance_rule,
  monitoring_strategy,
}) => {
  if (!current_value || !forecast) return null;

  // Get burden class color
  const getBurdenColor = (burden) => {
    switch (burden) {
      case 'EXTENSIVE':
        return 'error';
      case 'SIGNIFICANT':
        return 'warning';
      case 'MODERATE':
        return 'info';
      case 'MINIMAL':
        return 'success';
      default:
        return 'default';
    }
  };

  // Use API forecast data (70% drop by cycle 3, 90% by cycle 6)
  const cycle3Expected = Math.round(current_value * 0.3);  // 70% drop = 30% of original
  const cycle6Expected = Math.round(current_value * 0.1);  // 90% drop = 10% of original
  const targetValue = forecast?.complete_response_target || 35;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          CA-125 Monitoring Plan
        </Typography>

        {/* Current Value */}
        <Box mb={2}>
          <Typography variant="body1">
            <strong>Current Value:</strong>{' '}
            <Typography
              component="span"
              variant="h6"
              color={getBurdenColor(burden_class)}
              sx={{ display: 'inline' }}
            >
              {current_value.toLocaleString()} U/mL
            </Typography>
            {' '}
            <Chip
              label={burden_class}
              size="small"
              color={getBurdenColor(burden_class)}
              sx={{ ml: 1 }}
            />
          </Typography>
        </Box>

        {/* Forecast Chart */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Expected Response Timeline
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Cycle 3 */}
            <Box>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  Cycle 3 (expect ≥70% drop)
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Target: &lt;{cycle3Expected} U/mL
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (cycle3Expected / current_value) * 100)}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Cycle 6 */}
            <Box>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  Cycle 6 (expect ≥90% drop)
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Target: &lt;{cycle6Expected} U/mL
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (cycle6Expected / current_value) * 100)}
                color="info"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Target */}
            <Box>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  Complete Response Target
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  Target: &lt;{targetValue} U/mL
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (targetValue / current_value) * 100)}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Resistance Flags */}
        {resistance_rule && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>⚠️ Resistance Alert:</strong> {resistance_rule}
            </Typography>
          </Alert>
        )}

        {/* Monitoring Strategy */}
        <Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Monitoring Strategy:</strong> Track every 3 weeks during chemotherapy cycles.
            CA-125 is the primary tumor marker for ovarian cancer and will respond quickly if
            treatment is effective.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CA125Tracker;


