import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Alert, Chip, Divider } from '@mui/material';
import { CheckCircle, Science, Security, Biotech } from '@mui/icons-material';
import ScoreGauge from './ScoreGauge';
import EndpointBreakdown from './EndpointBreakdown';

const GauntletTrialsDisplay = ({ gauntletData, currentEndpointIndex = null }) => {
  if (!gauntletData || !gauntletData.data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        <Typography variant="h6">Gauntlet systems initializing...</Typography>
      </Box>
    );
  }

  const { endpoints } = gauntletData.data;
  
  if (!endpoints || endpoints.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        <Typography variant="h6">No battle testing data available</Typography>
      </Box>
    );
  }

  const executedEndpoints = currentEndpointIndex !== null 
    ? endpoints.slice(0, currentEndpointIndex + 1)
    : endpoints;

  const structuralEndpoint = executedEndpoints.find(ep => ep.endpoint_name === '/predict_protein_structure');
  const efficacyEndpoint = executedEndpoints.find(ep => ep.endpoint_name === '/simulate_therapeutic_efficacy');

  const endpointsToShow = currentEndpointIndex !== null 
    ? endpoints.slice(0, currentEndpointIndex + 1)
    : endpoints;

  const completedCount = executedEndpoints.length;
  const totalCount = endpoints.length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Header */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.15), rgba(139, 69, 19, 0.05))',
        borderRadius: 3,
        border: '1px solid rgba(139, 69, 19, 0.3)'
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 900, 
          color: '#d97706',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          🛡️ Gauntlet: In Silico Validation Trials
        </Typography>
        
        {/* Enhanced Progress Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Chip 
            icon={completedCount === totalCount ? <CheckCircle /> : <Science />}
            label={completedCount === totalCount ? 'BATTLE TESTING COMPLETE' : 'BATTLE-TESTING IN PROGRESS'}
            sx={{ 
              background: completedCount === totalCount 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                : 'linear-gradient(135deg, #d97706, #b45309)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              px: 2,
              py: 1,
              height: 36
            }}
          />
        </Box>

        <Typography variant="body1" sx={{ 
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1rem',
          fontWeight: 500
        }}>
          Digital trials completed: <strong>{completedCount}/{totalCount}</strong>
        </Typography>
      </Box>

      {/* Battle Results Summary */}
      {executedEndpoints.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: '#60a5fa', 
            mb: 3,
            display: 'flex',
            alignItems: 'center'
          }}>
            ⚔️ Battle Test Results
          </Typography>

          <Grid container spacing={3}>
            {structuralEndpoint && (
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
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
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6', mb: 2, fontSize: '1rem' }}>
                      STRUCTURAL VIABILITY
                    </Typography>
                    <ScoreGauge 
                      value={structuralEndpoint.demoData.plddt_score} 
                      color="#3b82f6" 
                      size={80}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3b82f6', mt: 1, fontSize: '1rem' }}>
                      STABLE
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {efficacyEndpoint && (
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
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
                    background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#a855f7', mb: 2, fontSize: '1rem' }}>
                      CRISPR EFFICACY
                    </Typography>
                    <ScoreGauge 
                      value={efficacyEndpoint.demoData.efficacy_score} 
                      color="#a855f7" 
                      size={80}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#a855f7', mt: 1, fontSize: '1rem' }}>
                      PRECISE
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Current Trial Section */}
      {currentEndpointIndex !== null && currentEndpointIndex < endpoints.length && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
            borderRadius: 3,
            border: '1px solid rgba(168, 85, 247, 0.3)',
            mb: 3
          }}>
            <Typography variant="h5" sx={{ 
              mb: 2, 
              color: '#a855f7', 
              fontWeight: 700, 
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              🧪 Current Trial: {endpoints[currentEndpointIndex].title}
            </Typography>
            <Alert 
              severity="info" 
              sx={{ 
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.05))',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                '& .MuiAlert-icon': { color: '#60a5fa' }
              }}
            >
              <Typography variant="body1" sx={{ 
                fontWeight: 600, 
                color: 'white',
                fontSize: '1rem'
              }}>
                Digital clinical trial in progress - validating therapeutic performance before any lab work
              </Typography>
            </Alert>
          </Box>
          
          <EndpointBreakdown 
            key={endpoints[currentEndpointIndex].id || currentEndpointIndex}
            endpoint={endpoints[currentEndpointIndex].endpoint_name} 
            jsonData={endpoints[currentEndpointIndex].demoData} 
          />
        </Box>
      )}

      {/* Completed Trials Section */}
      {endpointsToShow.length > 1 && (
        <>
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Box sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
            borderRadius: 3,
            border: '1px solid rgba(34, 197, 94, 0.3)',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ 
              color: '#22c55e', 
              fontWeight: 700, 
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              mb: 2
            }}>
              <CheckCircle sx={{ mr: 2, fontSize: 24 }} />
              Completed Digital Trials ({endpointsToShow.length - 1}/{endpoints.length})
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.95rem'
            }}>
              All trials passed with high confidence scores - therapeutics validated for clinical development
            </Typography>
          </Box>
          
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

export default GauntletTrialsDisplay; 