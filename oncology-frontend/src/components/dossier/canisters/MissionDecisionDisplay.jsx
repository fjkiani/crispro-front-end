import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import WarningIcon from '@mui/icons-material/Warning';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

const MissionDecisionDisplay = ({ oracleData }) => {
  // Get the Oracle endpoints data - using the correct path structure
  const oracleEndpoints = oracleData?.data?.endpoints || [];
  
  // Extract the actual values using array indices (more reliable)
  const targetDamageEndpoint = oracleEndpoints[0]; // /predict_variant_impact
  const cancerDependencyEndpoint = oracleEndpoints[1]; // /predict_gene_essentiality  
  const druggabilityEndpoint = oracleEndpoints[2]; // /predict_chromatin_accessibility

  const targetDamageRaw = targetDamageEndpoint?.demoData?.delta_likelihood_score || 0;
  const targetDamage = Math.abs(targetDamageRaw);
  const cancerDependency = cancerDependencyEndpoint?.demoData?.essentiality_score || 0;
  const druggabilityScore = druggabilityEndpoint?.demoData?.accessibility_score || 0;

  // Decision logic: GO if all three criteria are met
  const isTargetDamageGO = targetDamage > 1000;
  const isCancerDependencyGO = cancerDependency > 0.8;
  const isDruggabilityGO = druggabilityScore > 0.7;

  const overallDecision = isTargetDamageGO && isCancerDependencyGO && isDruggabilityGO;

  const decisionAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px) scale(0.9)' },
    to: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    config: { tension: 200, friction: 20 },
    delay: 800,
  });

  const AnimatedBox = animated(Box);

  return (
    <AnimatedBox style={decisionAnimation}>
      <Box sx={{ p: 4 }}>
        {/* Mission Decision Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 4
        }}>
          <GpsFixedIcon sx={{ 
            fontSize: 32, 
            color: '#60a5fa', 
            mr: 2 
          }} />
          <Typography variant="h4" sx={{
            fontWeight: 900,
            color: 'white',
            textAlign: 'center'
          }}>
            🎯 Mission Decision Matrix
          </Typography>
        </Box>

        {/* Decision Card */}
        <Card sx={{
          background: overallDecision 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
          border: overallDecision 
            ? '3px solid rgba(34, 197, 94, 0.6)'
            : '3px solid rgba(239, 68, 68, 0.6)',
          borderRadius: 4,
          backdropFilter: 'blur(20px)',
          boxShadow: overallDecision
            ? '0 25px 80px rgba(34, 197, 94, 0.4)'
            : '0 25px 80px rgba(239, 68, 68, 0.4)',
          maxWidth: 700,
          mx: 'auto',
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Main Decision Display */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3
            }}>
              {overallDecision ? (
                <CheckCircleIcon sx={{ fontSize: 48, color: '#22c55e', mr: 2 }} />
              ) : (
                <CancelIcon sx={{ fontSize: 48, color: '#ef4444', mr: 2 }} />
              )}
              <Typography variant="h3" sx={{ 
                fontWeight: 900, 
                color: overallDecision ? '#22c55e' : '#ef4444',
                textShadow: '0 0 30px currentColor',
                fontSize: { xs: '2rem', md: '3rem' }
              }}>
                {overallDecision ? '✅ MISSION GO' : '❌ MISSION NO-GO'}
              </Typography>
            </Box>

            {/* Decision Explanation */}
            <Typography variant="h5" sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 2,
              textAlign: 'center'
            }}>
              {overallDecision 
                ? "🎯 We have a 'GO' on the mission!" 
                : "⚠️ Target validation failed - mission abort recommended"
              }
            </Typography>

            <Typography variant="body1" sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              mb: 4,
              lineHeight: 1.8,
              textAlign: 'center',
              fontSize: '1.1rem'
            }}>
              {overallDecision 
                ? "All critical validation criteria have been met. PIK3CA E542K shows catastrophic vulnerability with high cancer dependency and excellent druggability. Authorization granted to proceed with weapon development phase."
                : "One or more validation criteria have failed. Target does not meet minimum thresholds for therapeutic development. Recommend target reassessment or alternative approaches before proceeding."
              }
            </Typography>

            {/* Validation Criteria Grid */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 4
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  icon={isTargetDamageGO ? <CheckCircleIcon /> : <CancelIcon />}
                  label="Target Damage"
                  color={isTargetDamageGO ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    mb: 1,
                    px: 2,
                    py: 0.5
                  }}
                />
                <Typography variant="h4" sx={{ 
                  color: isTargetDamageGO ? '#22c55e' : '#ef4444',
                  fontWeight: 900
                }}>
                  {targetDamage.toFixed(0)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Functional Impact
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  icon={isCancerDependencyGO ? <CheckCircleIcon /> : <CancelIcon />}
                  label="Cancer Dependency"
                  color={isCancerDependencyGO ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    mb: 1,
                    px: 2,
                    py: 0.5
                  }}
                />
                <Typography variant="h4" sx={{ 
                  color: isCancerDependencyGO ? '#22c55e' : '#ef4444',
                  fontWeight: 900
                }}>
                  {(cancerDependency * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Essential in Cancer
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  icon={isDruggabilityGO ? <CheckCircleIcon /> : <CancelIcon />}
                  label="Druggability"
                  color={isDruggabilityGO ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    mb: 1,
                    px: 2,
                    py: 0.5
                  }}
                />
                <Typography variant="h4" sx={{ 
                  color: isDruggabilityGO ? '#22c55e' : '#ef4444',
                  fontWeight: 900
                }}>
                  {(druggabilityScore * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Target Accessibility
                </Typography>
              </Box>
            </Box>

            {/* Next Steps */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 3,
              background: overallDecision 
                ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.05))'
                : 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.05))',
              borderRadius: 3,
              border: `1px solid ${overallDecision ? 'rgba(96, 165, 250, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
            }}>
              {overallDecision ? (
                <RocketLaunchIcon sx={{ color: '#60a5fa', mr: 2, fontSize: 28 }} />
              ) : (
                <WarningIcon sx={{ color: '#fbbf24', mr: 2, fontSize: 28 }} />
              )}
              <Typography variant="h6" sx={{ 
                color: overallDecision ? '#60a5fa' : '#fbbf24', 
                fontWeight: 700,
                fontSize: '1.2rem'
              }}>
                {overallDecision 
                  ? '🚀 Proceeding to Novel Therapeutic Development Phase'
                  : '⚠️ Mission Parameters Require Adjustment'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AnimatedBox>
  );
};

export default MissionDecisionDisplay; 