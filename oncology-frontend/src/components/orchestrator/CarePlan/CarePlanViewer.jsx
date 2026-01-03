/**
 * CarePlanViewer Component
 * 
 * Displays the complete unified care plan.
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
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Assignment,
  ExpandMore,
  CheckCircle,
  Warning,
  Error,
  Info,
  Download,
  Print,
} from '@mui/icons-material';

export const CarePlanViewer = ({ carePlan, loading = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading care plan...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!carePlan) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No care plan available</Typography>
        </CardContent>
      </Card>
    );
  }

  const sections = carePlan.sections || [];
  const alerts = carePlan.alerts || [];
  const executiveSummary = carePlan.executive_summary || 'No summary available';

  const getAlertSeverity = (alert) => {
    if (alert.severity === 'CRITICAL' || alert.level === 'HIGH') return 'error';
    if (alert.severity === 'WARNING' || alert.level === 'MEDIUM') return 'warning';
    return 'info';
  };

  const getAlertIcon = (alert) => {
    if (alert.severity === 'CRITICAL' || alert.level === 'HIGH') return <Error />;
    if (alert.severity === 'WARNING' || alert.level === 'MEDIUM') return <Warning />;
    return <Info />;
  };

  const handleExport = (format) => {
    // TODO: Implement export functionality
    console.log(`Exporting care plan as ${format}`);
  };

  return (
    <Card>
      <CardHeader
        avatar={<Assignment />}
        title="Unified Care Plan"
        subheader={`Generated: ${carePlan.generated_at ? new Date(carePlan.generated_at).toLocaleString() : 'Unknown'}`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExport('pdf')}
            >
              PDF
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Print />}
              onClick={() => handleExport('print')}
            >
              Print
            </Button>
          </Box>
        }
      />
      <CardContent>
        {/* Executive Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Executive Summary
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body1" color="text.secondary">
              {executiveSummary}
            </Typography>
          </Paper>
        </Box>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alerts ({alerts.length})
            </Typography>
            {alerts.map((alert, idx) => (
              <Alert
                key={idx}
                severity={getAlertSeverity(alert)}
                icon={getAlertIcon(alert)}
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {alert.title || alert.message || 'Alert'}
                </Typography>
                {alert.message && alert.title && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {alert.message}
                  </Typography>
                )}
                {alert.recommended_action && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Action: {alert.recommended_action}
                  </Typography>
                )}
              </Alert>
            ))}
          </Box>
        )}

        {/* Sections Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {sections.map((section, idx) => (
              <Tab
                key={idx}
                label={section.title || `Section ${idx + 1}`}
                icon={section.icon || <Info />}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {/* Active Section Content */}
        {sections[activeTab] && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {sections[activeTab].title}
            </Typography>

            {/* Render section content based on type */}
            {sections[activeTab].content && (
              <Box>
                {typeof sections[activeTab].content === 'string' ? (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {sections[activeTab].content}
                  </Typography>
                ) : Array.isArray(sections[activeTab].content) ? (
                  <List>
                    {sections[activeTab].content.map((item, itemIdx) => (
                      <ListItem key={itemIdx}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={typeof item === 'string' ? item : item.title || item.name}
                          secondary={typeof item === 'object' ? item.description || item.rationale : null}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : typeof sections[activeTab].content === 'object' ? (
                  <Box>
                    {/* Drug Ranking Section */}
                    {sections[activeTab].content.ranked_drugs && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Top Drugs
                        </Typography>
                        {sections[activeTab].content.ranked_drugs.slice(0, 5).map((drug, drugIdx) => (
                          <Box
                            key={drugIdx}
                            sx={{
                              p: 1,
                              mb: 1,
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {drug.drug_name || drug.name}
                            </Typography>
                            {drug.efficacy_score !== undefined && (
                              <Typography variant="caption" color="text.secondary">
                                Efficacy: {(drug.efficacy_score * 100).toFixed(0)}%
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Trial Matches Section */}
                    {sections[activeTab].content.trials && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Clinical Trials ({sections[activeTab].content.trials.length})
                        </Typography>
                        {sections[activeTab].content.trials.slice(0, 3).map((trial, trialIdx) => (
                          <Box
                            key={trialIdx}
                            sx={{
                              p: 1,
                              mb: 1,
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {trial.title || trial.nct_id}
                            </Typography>
                            {trial.combined_score && (
                              <Chip
                                label={`${(trial.combined_score * 100).toFixed(0)}% match`}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Nutrition Section */}
                    {sections[activeTab].content.supplements && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Supplements ({sections[activeTab].content.supplements.length})
                        </Typography>
                        {sections[activeTab].content.supplements.map((supplement, suppIdx) => (
                          <Chip
                            key={suppIdx}
                            label={`${supplement.name} - ${supplement.dosage || ''}`}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Resistance Section */}
                    {sections[activeTab].content.risk_level && (
                      <Alert severity={sections[activeTab].content.risk_level === 'HIGH' ? 'error' : 'warning'}>
                        <Typography variant="body2" fontWeight="medium">
                          Resistance Risk: {sections[activeTab].content.risk_level}
                        </Typography>
                        {sections[activeTab].content.resistance_probability && (
                          <Typography variant="caption" color="text.secondary">
                            Probability: {(sections[activeTab].content.resistance_probability * 100).toFixed(1)}%
                          </Typography>
                        )}
                      </Alert>
                    )}

                    {/* Generic object rendering */}
                    {Object.entries(sections[activeTab].content).map(([key, value]) => {
                      if (['ranked_drugs', 'trials', 'supplements', 'risk_level', 'resistance_probability'].includes(key)) {
                        return null; // Already handled above
                      }
                      return (
                        <Box key={key} sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {key}:
                          </Typography>
                          <Typography variant="body2">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ) : null}
              </Box>
            )}

            {/* Section Metadata */}
            {sections[activeTab].metadata && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Generated: {sections[activeTab].metadata.generated_at || 'Unknown'}
                </Typography>
                {sections[activeTab].metadata.confidence && (
                  <Chip
                    label={`Confidence: ${(sections[activeTab].metadata.confidence * 100).toFixed(0)}%`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Patient Info */}
        {carePlan.patient_id && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Patient ID: {carePlan.patient_id}
              </Typography>
              {carePlan.disease && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Disease: {carePlan.disease}
                </Typography>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

