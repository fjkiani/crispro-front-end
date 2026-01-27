import React from 'react';
import { 
  Box, Typography, Card, CardContent, CardHeader, 
  Chip, LinearProgress, Grid, Divider
} from '@mui/material';
import { 
  Assessment, Science, Security, CheckCircle, 
  Warning, Info, TrendingUp
} from '@mui/icons-material';

const EvidenceMapper = ({ 
  analysisResult,     // Raw analysis data
  fdaRequirement,     // Specific FDA requirement
  mappingFunction,    // How to transform our data
  evidenceStrength,   // Calculated strength score (0-100)
  dataSource = "Zeta Platform AI Analysis",
  complianceLevel = "strong" // "strong", "moderate", "supportive", "insufficient"
}) => {
  
  const getStrengthColor = (strength) => {
    if (strength >= 90) return '#059669';  // Strong (Green)
    if (strength >= 70) return '#d97706';  // Moderate (Orange) 
    if (strength >= 50) return '#3b82f6';  // Supportive (Blue)
    return '#dc2626';                      // Insufficient (Red)
  };

  const getStrengthLabel = (strength) => {
    if (strength >= 90) return 'STRONG';
    if (strength >= 70) return 'MODERATE';
    if (strength >= 50) return 'SUPPORTIVE';
    return 'INSUFFICIENT';
  };

  const getComplianceIcon = (level) => {
    switch (level) {
      case 'strong': return <CheckCircle />;
      case 'moderate': return <Assessment />;
      case 'supportive': return <Info />;
      default: return <Warning />;
    }
  };

  const formatEvidence = () => {
    try {
      if (mappingFunction && analysisResult) {
        return mappingFunction(analysisResult);
      }
      return "Analysis data not available";
    } catch (error) {
      console.error('Evidence mapping error:', error);
      return "Error processing analysis data";
    }
  };

  const strengthColor = getStrengthColor(evidenceStrength);
  const strengthLabel = getStrengthLabel(evidenceStrength);

  return (
    <Card sx={{ 
      border: `2px solid ${strengthColor}`,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      backdropFilter: 'blur(20px)',
      borderRadius: 3,
      mb: 3,
      overflow: 'hidden'
    }}>
      <CardHeader
        sx={{ 
          background: `linear-gradient(135deg, ${strengthColor}22, ${strengthColor}11)`,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          pb: 2
        }}
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: 'white',
              fontSize: '1.3rem'
            }}>
              {fdaRequirement}
            </Typography>
            <EvidenceStrengthBadge 
              strength={evidenceStrength} 
              label={strengthLabel}
              color={strengthColor}
            />
          </Box>
        }
        subheader={
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.7)',
            mt: 1,
            fontWeight: 500
          }}>
            Source: {dataSource}
          </Typography>
        }
      />
      
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Our Evidence */}
          <Grid item xs={12} md={8}>
            <Box>
              <Typography variant="subtitle2" sx={{ 
                color: strengthColor, 
                fontWeight: 700, 
                mb: 2,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Science sx={{ fontSize: 20 }} />
                Our Computational Evidence:
              </Typography>
              
              <Box sx={{ 
                p: 3,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 2,
                border: `1px solid ${strengthColor}40`,
                mb: 2
              }}>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  fontWeight: 500
                }}>
                  {formatEvidence()}
                </Typography>
              </Box>

              {/* Data Confidence Metrics */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  minWidth: 80
                }}>
                  Confidence:
                </Typography>
                <Box sx={{ flex: 1, maxWidth: 200 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={evidenceStrength}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: strengthColor,
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ 
                  color: strengthColor,
                  fontWeight: 700,
                  minWidth: 40
                }}>
                  {evidenceStrength}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Compliance Indicator */}
          <Grid item xs={12} md={4}>
            <ComplianceIndicator 
              requirement={fdaRequirement}
              evidenceStrength={evidenceStrength}
              complianceLevel={complianceLevel}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Evidence Strength Badge Component
const EvidenceStrengthBadge = ({ strength, label, color }) => (
  <Chip 
    icon={<TrendingUp />}
    label={`${label} (${strength}%)`}
    sx={{ 
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      color: 'white',
      fontWeight: 700,
      fontSize: '0.9rem',
      height: 32,
      '& .MuiChip-icon': {
        color: 'white'
      }
    }}
  />
);

// Compliance Indicator Component
const ComplianceIndicator = ({ requirement, evidenceStrength, complianceLevel }) => {
  const getComplianceColor = (level) => {
    switch (level) {
      case 'strong': return '#059669';
      case 'moderate': return '#d97706';
      case 'supportive': return '#3b82f6';
      default: return '#dc2626';
    }
  };

  const getComplianceIcon = (level) => {
    switch (level) {
      case 'strong': return <CheckCircle />;
      case 'moderate': return <Assessment />;
      case 'supportive': return <Info />;
      default: return <Warning />;
    }
  };

  const getComplianceDescription = (level, strength) => {
    switch (level) {
      case 'strong': 
        return `Computational evidence provides strong support for FDA requirement with ${strength}% confidence.`;
      case 'moderate':
        return `Predictive analysis indicates moderate support. Additional validation may strengthen submission.`;
      case 'supportive':
        return `Preliminary computational analysis provides supportive evidence. Consider supplemental studies.`;
      default:
        return `Evidence strength below threshold. Additional data required for regulatory submission.`;
    }
  };

  const color = getComplianceColor(complianceLevel);
  const complianceIcon = getComplianceIcon(complianceLevel);

  return (
    <Box sx={{ 
      p: 3,
      background: `linear-gradient(135deg, ${color}20, ${color}10)`,
      border: `1px solid ${color}40`,
      borderRadius: 2,
      height: 'fit-content'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ color: color, fontSize: 24 }}>
          {complianceIcon}
        </Box>
        <Typography variant="h6" sx={{ 
          color: color, 
          fontWeight: 700,
          fontSize: '1.2rem'
        }}>
          FDA Compliance
        </Typography>
      </Box>
      
      <Chip 
        label={complianceLevel.toUpperCase()}
        sx={{ 
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          color: 'white',
          fontWeight: 700,
          mb: 2,
          width: '100%'
        }}
      />
      
      <Typography variant="body2" sx={{ 
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 1.5,
        fontSize: '0.95rem'
      }}>
        {getComplianceDescription(complianceLevel, evidenceStrength)}
      </Typography>
      
      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Typography variant="caption" sx={{ 
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'monospace',
        fontSize: '0.8rem'
      }}>
        21 CFR 312.23 - Content Requirements
      </Typography>
    </Box>
  );
};

export default EvidenceMapper; 