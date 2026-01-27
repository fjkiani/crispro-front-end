

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * MetastasisReport Component
 * 
 * Displays 8-step metastasis cascade assessment with:
 * - Step bar chart (risk scores per step)
 * - Drivers table (variants linked to steps)
 * - Rationale bullets per step
 * - Provenance chips (run_id, ruleset_version, profile)
 * - RUO disclaimer
 */
const MetastasisReport = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Metastasis Risk Assessment
          </Typography>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Analyzing 8-step cascade...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load metastasis assessment: {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.steps) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No metastasis assessment data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { steps, overall_risk, drivers, provenance } = data;

  // Color coding for risk levels
  const getRiskColor = (score) => {
    if (score >= 0.7) return 'error';
    if (score >= 0.4) return 'warning';
    return 'success';
  };

  return (
    <Card>
      <CardContent>
        {/* Header with RUO disclaimer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Metastasis Risk Assessment
          </Typography>
          <Chip 
            label="RESEARCH USE ONLY" 
            color="warning" 
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* Overall Risk Score */}
        {overall_risk !== undefined && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Overall Metastatic Risk
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={overall_risk * 100} 
                  color={getRiskColor(overall_risk)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="h6" color={getRiskColor(overall_risk) + '.main'}>
                {(overall_risk * 100).toFixed(0)}%
              </Typography>
            </Box>
          </Box>
        )}

        {/* 8-Step Cascade Bar Chart */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            8-Step Metastatic Cascade
          </Typography>
          {steps && steps.map((step, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 200 }}>
                    {index + 1}. {step.name}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={step.risk_score * 100} 
                      color={getRiskColor(step.risk_score)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                    {(step.risk_score * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {step.rationale && step.rationale.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Rationale:
                    </Typography>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                      {step.rationale.map((reason, i) => (
                        <li key={i}>
                          <Typography variant="body2">{reason}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
                {step.contribution_score !== undefined && (
                  <Typography variant="caption" color="text.secondary">
                    Contribution: {(step.contribution_score * 100).toFixed(1)}%
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Drivers Table */}
        {drivers && drivers.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Metastatic Drivers
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Gene</TableCell>
                    <TableCell>Variant</TableCell>
                    <TableCell>Linked Steps</TableCell>
                    <TableCell align="right">Impact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drivers.map((driver, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {driver.gene}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {driver.variant || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {driver.steps && driver.steps.map((stepNum, i) => (
                            <Chip 
                              key={i} 
                              label={stepNum} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={driver.impact || 'Unknown'}
                          size="small"
                          color={
                            driver.impact === 'High' ? 'error' :
                            driver.impact === 'Medium' ? 'warning' : 'success'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Provenance */}
        {provenance && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {provenance.run_id && (
                <Chip 
                  label={`Run: ${provenance.run_id.slice(0, 8)}...`}
                  size="small"
                  variant="outlined"
                />
              )}
              {provenance.ruleset_version && (
                <Chip 
                  label={`Ruleset: ${provenance.ruleset_version}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {provenance.profile && (
                <Chip 
                  label={`Profile: ${provenance.profile}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {provenance.model && (
                <Chip 
                  label={`Model: ${provenance.model}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* RUO Footer */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Research Use Only:</strong> This assessment is for research purposes only 
            and should not be used for clinical decision-making. Consult with healthcare 
            professionals for medical advice.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MetastasisReport;
