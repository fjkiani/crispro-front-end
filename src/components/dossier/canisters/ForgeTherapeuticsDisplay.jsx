import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Alert, Divider } from '@mui/material';
import { CheckCircle, Science, Biotech, Engineering } from '@mui/icons-material';
import EndpointBreakdown from './EndpointBreakdown';

const ForgeTherapeuticsDisplay = ({ forgeData, currentEndpointIndex = null }) => {
  if (!forgeData || !forgeData.data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        <Typography variant="h6">Forge systems initializing...</Typography>
      </Box>
    );
  }

  const { endpoints } = forgeData.data;
  
  if (!endpoints || endpoints.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        <Typography variant="h6">No therapeutic synthesis data available</Typography>
      </Box>
    );
  }

  const executedEndpoints = currentEndpointIndex !== null 
    ? endpoints.slice(0, currentEndpointIndex + 1)
    : endpoints;

  const endpointsToShow = currentEndpointIndex !== null 
    ? endpoints.slice(0, currentEndpointIndex + 1)
    : endpoints;

  const completedCount = executedEndpoints.length;
  const totalCount = endpoints.filter(ep => ep.endpoint_name !== '/generate_hdr_template').length; // Exclude HDR from UI count

  const crisprEndpoint = executedEndpoints.find(ep => ep.endpoint_name === '/generate_optimized_guide_rna');
  const inhibitorEndpoint = executedEndpoints.find(ep => ep.endpoint_name === '/generate_protein_inhibitor');

  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Header */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
        borderRadius: 3,
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 900, 
          color: '#3b82f6',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          ⚗️ Forge: AI-Generated Therapeutics
        </Typography>
        
        {/* Enhanced Progress Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Chip 
            icon={completedCount >= totalCount ? <CheckCircle /> : <Engineering />}
            label={completedCount >= totalCount ? 'THERAPEUTIC FORGING COMPLETE' : 'FORGING NOVEL THERAPEUTICS IN PROGRESS'}
            sx={{ 
              background: completedCount >= totalCount 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
          Novel Therapeutics synthesized: <strong>{completedCount}/{totalCount}</strong>
        </Typography>
      </Box>

      {/* Synthesis Results Summary */}
      {executedEndpoints.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: '#60a5fa', 
            mb: 3,
            display: 'flex',
            alignItems: 'center'
          }}>
            ⚔️ Synthesized Arsenal
          </Typography>

          <Grid container spacing={3}>
            {crisprEndpoint && (
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 180,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Biotech sx={{ color: '#22c55e', fontSize: 28, mr: 1.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e', fontSize: '1.1rem' }}>
                        CRISPR Guides Generated
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                      High-efficacy guides with minimal off-target effects
                    </Typography>
                    <Chip 
                      label={`${crisprEndpoint.demoData.predicted_efficacy || '94.5%'} Efficacy`}
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}

            {inhibitorEndpoint && (
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 180,
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
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Science sx={{ color: '#a855f7', fontSize: 28, mr: 1.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#a855f7', fontSize: '1.1rem' }}>
                        Novel Protein Inhibitors
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                      Optimized inhibitor: <strong>High affinity</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Designed for maximum specificity and minimal toxicity
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Current Synthesis Section */}
      {currentEndpointIndex !== null && currentEndpointIndex < endpoints.length && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
            borderRadius: 3,
            border: '1px solid rgba(59, 130, 246, 0.3)',
            mb: 3
          }}>
            <Typography variant="h5" sx={{ 
              mb: 2, 
              color: '#3b82f6', 
              fontWeight: 700, 
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              🔬 Current Synthesis: {endpoints[currentEndpointIndex].title}
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
                AI systems are generating novel therapeutic candidates with optimized properties
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

      {/* Completed Syntheses Section */}
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
              Completed Syntheses ({endpointsToShow.length - 1}/{endpoints.length})
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.95rem'
            }}>
              Novel therapeutic candidates successfully generated with optimized binding and drug-like properties
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

export default ForgeTherapeuticsDisplay; 