import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Alert } from '@mui/material';
import ScoreGauge from './ScoreGauge';
import EndpointBreakdown from './EndpointBreakdown';

const OracleValidationDisplay = ({ oracleData, currentEndpointIndex = null }) => {
  if (!oracleData || !oracleData.data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        <Typography variant="h6">CrisPRO.ai initializing...</Typography>
      </Box>
    );
  }

  const { validation_metrics, endpoints } = oracleData.data;
  
  if (!endpoints || endpoints.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        <Typography variant="h6">No validation data available</Typography>
      </Box>
    );
  }

  const executedEndpoints = currentEndpointIndex !== null 
    ? endpoints.slice(0, currentEndpointIndex + 1)
    : endpoints;

  const pathogenicityEndpoint = executedEndpoints.find(ep => ep.endpoint_name === '/predict_variant_impact');
  const essentialityEndpoint = executedEndpoints.find(ep => ep.endpoint_name === '/predict_gene_essentiality');
  const accessibilityEndpoint = executedEndpoints.find(ep => ep.endpoint_name === '/predict_chromatin_accessibility');

  const endpointsToShow = currentEndpointIndex !== null 
    ? endpoints.slice(0, currentEndpointIndex + 1)
    : endpoints;

  return (
    <Box sx={{ p: 3 }}>
      {/* Summary Gauges */}
      {executedEndpoints.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {pathogenicityEndpoint && (
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(229, 62, 62, 0.1), rgba(229, 62, 62, 0.05))',
                border: '1px solid rgba(229, 62, 62, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                height: 200,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #e53e3e, #c53030)',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#e53e3e', mb: 2, fontSize: '1rem' }}>
                    PATHOGENICITY
                  </Typography>
                  <ScoreGauge 
                    value={Math.abs(pathogenicityEndpoint.demoData.delta_likelihood_score)} 
                    color="#e53e3e" 
                    size={80}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e53e3e', mt: 1, fontSize: '1rem' }}>
                    CATASTROPHIC
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {essentialityEndpoint && (
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(253, 127, 40, 0.1), rgba(253, 127, 40, 0.05))',
                border: '1px solid rgba(253, 127, 40, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                height: 200,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #fd7f28, #ea580c)',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#fd7f28', mb: 2, fontSize: '1rem' }}>
                    ESSENTIALITY
                  </Typography>
                  <ScoreGauge 
                    value={essentialityEndpoint.demoData.essentiality_score * 100} 
                    color="#fd7f28" 
                    size={80}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fd7f28', mt: 1, fontSize: '1rem' }}>
                    CRITICAL
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {accessibilityEndpoint && (
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(56, 161, 105, 0.1), rgba(56, 161, 105, 0.05))',
                border: '1px solid rgba(56, 161, 105, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                height: 200,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #38a169, #2f855a)',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#38a169', mb: 2, fontSize: '1rem' }}>
                    ACCESSIBILITY
                  </Typography>
                  <ScoreGauge 
                    value={accessibilityEndpoint.demoData.accessibility_score * 100} 
                    color="#38a169" 
                    size={80}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#38a169', mt: 1, fontSize: '1rem' }}>
                    DRUGGABLE
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Current Analysis Section */}
      {currentEndpointIndex !== null && currentEndpointIndex < endpoints.length && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ 
            mb: 2, 
            color: '#60a5fa', 
            fontWeight: 700, 
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            🔍 Current Analysis: {endpoints[currentEndpointIndex].title}
          </Typography>
          <EndpointBreakdown 
            key={endpoints[currentEndpointIndex].id || currentEndpointIndex}
            endpoint={endpoints[currentEndpointIndex].endpoint_name} 
            jsonData={endpoints[currentEndpointIndex].demoData} 
          />
        </Box>
      )}

      {/* Completed Analyses Section */}
      {endpointsToShow.length > 1 && (
        <>
          <Typography variant="h6" sx={{ 
            mt: 3, 
            mb: 2, 
            color: 'rgba(255,255,255,0.8)', 
            fontWeight: 600, 
            fontSize: '1.2rem'
          }}>
            ✅ Completed Analyses ({endpointsToShow.length - 1}/{endpoints.length})
          </Typography>
          {endpointsToShow.slice(0, -1).map((endpoint, index) => (
            <EndpointBreakdown 
              key={endpoint.id || index}
              endpoint={endpoint.endpoint_name} 
              jsonData={endpoint.demoData} 
            />
          ))}
        </>
      )}
    </Box>
  );
};

export default OracleValidationDisplay; 