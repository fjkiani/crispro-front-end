import React from 'react';
import { Grid } from '@mui/material';
import MetricDisplay from './MetricDisplay';

const MetricsBar = ({ oracleData, forgeData, gauntletData, currentStep, isLoading }) => {
  const oracleEndpoints = oracleData?.data?.endpoints || [];
  const forgeEndpoints = forgeData?.data?.endpoints || [];
  const gauntletEndpoints = gauntletData?.data?.endpoints || [];

  const metrics = [
    // Oracle Metrics
    { title: 'Pathogenicity', endpoint: oracleEndpoints[0], color: '#d32f2f', valueKey: 'delta_likelihood_score', statusKey: 'pathogenicity_prediction', stepIndex: 0 },
    { title: 'Essentiality', endpoint: oracleEndpoints[1], color: '#f57c00', valueKey: 'essentiality_score', statusKey: 'essentiality_category', stepIndex: 1 },
    { title: 'Accessibility', endpoint: oracleEndpoints[2], color: '#388e3c', valueKey: 'accessibility_score', statusKey: 'accessibility_state', stepIndex: 2 },
    // Forge Metrics
    { title: 'gRNA Design', endpoint: forgeEndpoints[0], color: '#1976d2', valueKey: 'predicted_efficacy', statusKey: 'status', stepIndex: 3 },
    { title: 'Inhibitor Design', endpoint: forgeEndpoints[2], color: '#9c27b0', valueKey: 'predicted_binding_affinity', statusKey: 'status', stepIndex: 4 },
    // Gauntlet Metrics
    { title: 'Structure Validation', endpoint: gauntletEndpoints[0], color: '#0288d1', valueKey: 'plddt_score', statusKey: 'structural_class', stepIndex: 5 },
    { title: 'Efficacy Simulation', endpoint: gauntletEndpoints[1], color: '#689f38', valueKey: 'efficacy_score', statusKey: 'status', stepIndex: 6 },
  ];

  const formatValue = (metric, endpoint) => {
    const rawValue = endpoint.demoData[metric.valueKey];
    if (typeof rawValue === 'number') {
        if (metric.title === 'Pathogenicity') return `${Math.abs(rawValue).toFixed(0)}%`;
        if (metric.title === 'Structure Validation' || metric.title === 'Efficacy Simulation') return `${rawValue.toFixed(1)}%`;
        return `${(rawValue * 100).toFixed(0)}%`;
    }
    return rawValue; // Handle strings like affinity
  };

  return (
    <Grid container spacing={2}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={1.7} key={index}>
          <MetricDisplay
            title={metric.title}
            value={metric.endpoint ? formatValue(metric, metric.endpoint) : 'N/A'}
            status={metric.endpoint ? metric.endpoint.demoData[metric.statusKey] || 'Completed' : 'Pending'}
            color={metric.color}
            isLoading={isLoading && currentStep === metric.stepIndex}
            isCompleted={currentStep > metric.stepIndex}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricsBar; 