import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import WarningIcon from '@mui/icons-material/Warning';

const MissionStatusSidebar = ({ results, currentStep }) => {
  // Get the Oracle data and extract metrics
  const oracleData = results?.oracle?.data;
  const oracleEndpoints = oracleData?.stages?.[0]?.endpoints || [];
  
  // Extract the actual values - fix the target damage calculation
  const targetDamageEndpoint = oracleEndpoints.find(ep => ep.name === '/predict_variant_impact');
  const cancerDependencyEndpoint = oracleEndpoints.find(ep => ep.name === '/predict_gene_essentiality');
  const druggabilityEndpoint = oracleEndpoints.find(ep => ep.name === '/predict_chromatin_accessibility');

  // Fix: Use the correct field names from demo data
  const targetDamageRaw = targetDamageEndpoint?.demoData?.delta_likelihood_score || 0;
  const targetDamage = Math.abs(targetDamageRaw); // Convert negative score to positive percentage
  const cancerDependency = cancerDependencyEndpoint?.demoData?.essentiality_score || 0;
  const druggabilityScore = druggabilityEndpoint?.demoData?.accessibility_score || 0;

  // Decision logic: GO if all three criteria are met
  const isTargetDamageGO = targetDamage > 1000; // >1000 is significant (18750 easily qualifies)
  const isCancerDependencyGO = cancerDependency > 0.8; // >80% dependency
  const isDruggabilityGO = druggabilityScore > 0.7; // >70% accessibility

  const overallDecision = isTargetDamageGO && isCancerDependencyGO && isDruggabilityGO;

  // Only show after step 2 (when druggability is assessed)
  if (currentStep < 2) {
    return null;
  }

  const sidebarAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(100px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: { tension: 200, friction: 20 },
    delay: 800,
  });

  return (
    <animated.div style={sidebarAnimation}>
      <Box sx={{
        position: 'fixed',
        top: '50%',
        right: 24,
        transform: 'translateY(-50%)',
        zIndex: 1001,
        width: 320,
      }}>
        <Card sx={{
          background: overallDecision 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
          border: overallDecision 
            ? '2px solid rgba(34, 197, 94, 0.5)'
            : '2px solid rgba(239, 68, 68, 0.5)',
          borderRadius: 4,
          backdropFilter: 'blur(20px)',
          boxShadow: overallDecision
            ? '0 20px 60px rgba(34, 197, 94, 0.3)'
            : '0 20px 60px rgba(239, 68, 68, 0.3)',
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {overallDecision ? (
                <CheckCircleIcon sx={{ fontSize: 32, color: '#22c55e', mr: 1.5 }} />
              ) : (
                <CancelIcon sx={{ fontSize: 32, color: '#ef4444', mr: 1.5 }} />
              )}
              <Typography variant="h6" sx={{ 
                fontWeight: 900, 
                color: overallDecision ? '#22c55e' : '#ef4444',
                fontSize: '1.1rem'
              }}>
                {overallDecision ? '✅ MISSION GO' : '❌ MISSION NO-GO'}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              mb: 2,
              fontSize: '0.9rem'
            }}>
              {overallDecision 
                ? "🎯 We have a 'GO' on the mission!" 
                : "⚠️ Target validation failed - mission abort recommended"
              }
            </Typography>

            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.8)', 
              mb: 3,
              lineHeight: 1.5,
              fontSize: '0.8rem'
            }}>
              {overallDecision 
                ? "All criteria met. Target shows catastrophic vulnerability with high cancer dependency and excellent druggability."
                : "One or more validation criteria have failed. Target does not meet minimum thresholds for therapeutic development."
              }
            </Typography>

            {/* Criteria Breakdown */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Chip 
                icon={isTargetDamageGO ? <CheckCircleIcon sx={{fontSize: 16}} /> : <CancelIcon sx={{fontSize: 16}} />}
                label={`Target Damage: ${(targetDamage).toFixed(0)}%`}
                color={isTargetDamageGO ? 'success' : 'error'}
                variant="outlined"
                size="small"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
              <Chip 
                icon={isCancerDependencyGO ? <CheckCircleIcon sx={{fontSize: 16}} /> : <CancelIcon sx={{fontSize: 16}} />}
                label={`Cancer Dependency: ${(cancerDependency * 100).toFixed(0)}%`}
                color={isCancerDependencyGO ? 'success' : 'error'}
                variant="outlined"
                size="small"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
              <Chip 
                icon={isDruggabilityGO ? <CheckCircleIcon sx={{fontSize: 16}} /> : <CancelIcon sx={{fontSize: 16}} />}
                label={`Druggability: ${druggabilityScore > 0 ? (druggabilityScore * 100).toFixed(0) + '%' : 'Standby'}`}
                color={isDruggabilityGO ? 'success' : 'error'}
                variant="outlined"
                size="small"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </Box>

            {overallDecision && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RocketLaunchIcon sx={{ color: '#60a5fa', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ 
                  color: '#60a5fa', 
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '0.8rem'
                }}>
                  Initiating weapon development...
                </Typography>
              </Box>
            )}

            {!overallDecision && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WarningIcon sx={{ color: '#fbbf24', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ 
                  color: '#fbbf24', 
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '0.8rem'
                }}>
                  Mission abort recommended
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </animated.div>
  );
};

export default MissionStatusSidebar; 