/**
 * AdministrativeImpactPanel Component
 * 
 * Displays administrative impact metrics:
 * - Safety alerts prevented
 * - MedWatch reports avoided
 * - Investigation hours saved
 * - Cost avoidance
 * 
 * Props:
 * - preventedEvents: {
 *     safety_alerts_prevented: number,
 *     medwatch_reports_avoided: number,
 *     investigation_hours_saved: number,
 *     cost_avoidance_usd: number
 *   }
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box
} from '@mui/material';
import {
  Warning as WarningIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const AdministrativeImpactPanel = ({ preventedEvents }) => {
  const {
    safety_alerts_prevented = 0,
    medwatch_reports_avoided = 0,
    investigation_hours_saved = 0,
    cost_avoidance_usd = 0
  } = preventedEvents || {};
  
  const metrics = [
    {
      label: 'Safety Alerts Prevented',
      value: safety_alerts_prevented,
      icon: <WarningIcon />,
      color: 'error',
      description: 'PGx toxicity would have occurred'
    },
    {
      label: 'MedWatch Reports Avoided',
      value: medwatch_reports_avoided,
      icon: <DescriptionIcon />,
      color: 'error',
      description: 'Grade 3+ adverse events preventable'
    },
    {
      label: 'Investigation Hours Saved',
      value: investigation_hours_saved,
      icon: <TimeIcon />,
      color: 'error',
      description: 'Retrospective analysis avoided'
    },
    {
      label: 'Cost Avoidance',
      value: cost_avoidance_usd,
      icon: <MoneyIcon />,
      color: 'success',
      description: 'ICU admission / treatment costs avoided',
      format: 'currency'
    }
  ];
  
  const formatValue = (value, format) => {
    if (format === 'currency') {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toFixed(0)}`;
    }
    return value.toLocaleString();
  };
  
  return (
    <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
      <Typography variant="h6" gutterBottom>
        Administrative Impact
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Quantified impact of proactive PGx screening
      </Typography>
      
      <Grid container spacing={2}>
        {metrics.map((metric, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: `${metric.color}.main` }}>
                    {metric.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {metric.label}
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  color={`${metric.color}.main`}
                  fontWeight="bold"
                >
                  {formatValue(metric.value, metric.format)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {metric.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {safety_alerts_prevented === 0 && medwatch_reports_avoided === 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Impact metrics will populate when feasibility analysis identifies prevented events.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

AdministrativeImpactPanel.propTypes = {
  preventedEvents: PropTypes.shape({
    safety_alerts_prevented: PropTypes.number,
    medwatch_reports_avoided: PropTypes.number,
    investigation_hours_saved: PropTypes.number,
    cost_avoidance_usd: PropTypes.number
  })
};

export default AdministrativeImpactPanel;
