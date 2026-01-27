import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const ToxicityRiskCard = ({ result, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Toxicity Risk Assessment (RUO)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Assessing toxicity risk...
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Toxicity Risk Assessment (RUO)
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Paper>
    );
  }
  
  // No result state
  if (!result) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Toxicity Risk Assessment (RUO)
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            No germline data available. Toxicity assessment requires germline variants.
          </Typography>
        </Alert>
      </Paper>
    );
  }
  
  const { risk_score, confidence, reason, factors } = result;
  
  // Derive risk level from score
  const getRiskLevel = (score) => {
    if (score >= 0.5) return 'high';
    if (score >= 0.3) return 'moderate';
    return 'low';
  };
  
  const riskLevel = getRiskLevel(risk_score);
  
  // Color coding for risk level
  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return 'error';
      case 'moderate': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  const getRiskIcon = (level) => {
    if (level === 'high' || level === 'moderate') {
      return <WarningIcon />;
    }
    return <CheckCircleIcon />;
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Toxicity Risk Assessment (RUO)
      </Typography>
      
      {/* Risk Score Visualization */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Risk Score</Typography>
          <Typography variant="body2" fontWeight="bold">
            {(risk_score * 100).toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={risk_score * 100} 
          color={getRiskColor(riskLevel)}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>
      
      {/* Risk Level & Confidence Badges */}
      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          label={`Risk: ${riskLevel.toUpperCase()}`}
          color={getRiskColor(riskLevel)}
          icon={getRiskIcon(riskLevel)}
        />
        <Chip 
          label={`Confidence: ${(confidence * 100).toFixed(0)}%`}
          variant="outlined"
        />
      </Box>
      
      {/* Reason */}
      {reason && (
        <Alert severity={riskLevel === 'high' ? 'warning' : 'info'} sx={{ mt: 2 }}>
          <Typography variant="body2">
            {reason}
          </Typography>
        </Alert>
      )}
      
      {/* Contributing Factors */}
      {factors && factors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Contributing Factors:
          </Typography>
          <List dense>
            {factors.map((factor, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={factor.detail}
                  secondary={`Type: ${factor.type} | Weight: ${(factor.weight * 100).toFixed(0)}% | Confidence: ${(factor.confidence * 100).toFixed(0)}%`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="caption">
          <strong>Research Use Only.</strong> Heuristic assessment using static pharmacogene list. 
          Clinical decisions require PharmGKB validation and specialist review.
        </Typography>
      </Alert>
    </Paper>
  );
};


