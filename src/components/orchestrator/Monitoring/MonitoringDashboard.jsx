/**
 * MonitoringDashboard Component
 * 
 * Displays monitoring configuration and alerts.
 * Modular, self-contained component.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Grid,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  MonitorHeart,
  ExpandMore,
  CheckCircle,
  Warning,
  Error,
  Notifications,
  Schedule,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

export const MonitoringDashboard = ({ monitoringConfig, loading = false }) => {
  const [alertsEnabled, setAlertsEnabled] = useState(monitoringConfig?.alerts_enabled ?? true);
  const [expandedMetric, setExpandedMetric] = useState(null);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography sx={{ mt: 1 }}>Loading monitoring configuration...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!monitoringConfig) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No monitoring configuration available</Typography>
        </CardContent>
      </Card>
    );
  }

  const frequency = monitoringConfig.frequency || 'monthly';
  const biomarkers = monitoringConfig.biomarkers || [];
  const imaging = monitoringConfig.imaging || 'Not specified';
  const escalationThresholds = monitoringConfig.escalation_thresholds || {};
  const diseaseSpecific = monitoringConfig.disease_specific_monitoring || false;

  const getFrequencyColor = (freq) => {
    if (freq.includes('week') || freq.includes('WEEKLY')) return 'error';
    if (freq.includes('month') || freq.includes('MONTHLY')) return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader
        avatar={<MonitorHeart />}
        title="Monitoring Dashboard"
        subheader={`Frequency: ${frequency}`}
        action={
          <FormControlLabel
            control={
              <Switch
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Alerts Enabled"
          />
        }
      />
      <CardContent>
        {/* Status Alert */}
        <Alert severity={alertsEnabled ? 'success' : 'info'} sx={{ mb: 2 }}>
          <Typography variant="body2">
            Monitoring is {alertsEnabled ? 'active' : 'disabled'}
          </Typography>
        </Alert>

        <Grid container spacing={2}>
          {/* Biomarkers Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <Schedule sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Biomarkers to Monitor ({biomarkers.length})
              </Typography>
              <List dense>
                {biomarkers.map((biomarker, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={biomarker}
                      secondary={`Track every ${frequency}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Imaging Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Imaging Schedule
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  {imaging}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Escalation Thresholds */}
        {Object.keys(escalationThresholds).length > 0 && (
          <Accordion
            expanded={expandedMetric === 'thresholds'}
            onChange={() => setExpandedMetric(expandedMetric === 'thresholds' ? null : 'thresholds')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">
                Escalation Thresholds
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {Object.entries(escalationThresholds).map(([key, value]) => (
                  <ListItem key={key}>
                    <ListItemIcon>
                      <Warning color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      secondary={
                        typeof value === 'boolean'
                          ? value ? 'Enabled' : 'Disabled'
                          : typeof value === 'number'
                          ? `${value}%`
                          : String(value)
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Disease-Specific Monitoring */}
        {diseaseSpecific && monitoringConfig.disease_specific_config && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Disease-Specific Configuration
            </Typography>
            <Alert severity="info">
              <Typography variant="body2">
                Custom monitoring protocol for {monitoringConfig.disease || 'this disease'}
              </Typography>
              {monitoringConfig.disease_specific_config.description && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {monitoringConfig.disease_specific_config.description}
                </Typography>
              )}
            </Alert>
          </Box>
        )}

        {/* Monitoring Schedule */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Monitoring Schedule
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Frequency: ${frequency}`}
              color={getFrequencyColor(frequency)}
              size="small"
            />
            {monitoringConfig.next_check_date && (
              <Chip
                label={`Next: ${new Date(monitoringConfig.next_check_date).toLocaleDateString()}`}
                size="small"
                variant="outlined"
              />
            )}
            {monitoringConfig.last_check_date && (
              <Chip
                label={`Last: ${new Date(monitoringConfig.last_check_date).toLocaleDateString()}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Alert Configuration */}
        {monitoringConfig.alert_rules && monitoringConfig.alert_rules.length > 0 && (
          <Accordion
            expanded={expandedMetric === 'alerts'}
            onChange={() => setExpandedMetric(expandedMetric === 'alerts' ? null : 'alerts')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">
                Alert Rules ({monitoringConfig.alert_rules.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {monitoringConfig.alert_rules.map((rule, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Notifications color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={rule.condition || rule.name}
                      secondary={rule.action || rule.description}
                    />
                    {rule.enabled !== undefined && (
                      <Switch
                        checked={rule.enabled}
                        size="small"
                        disabled
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // TODO: Implement schedule update
              console.log('Update schedule');
            }}
          >
            Update Schedule
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // TODO: Implement test alert
              console.log('Test alert');
            }}
          >
            Test Alert
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

