import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  LinearProgress,
  Chip,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export const EvidenceBand = ({ result }) => {
  // Extract confidence breakdown from efficacy provenance
  const breakdown = result?.efficacy?.provenance?.confidence_breakdown;
  
  if (!breakdown) return null;
  
  const { top_drug, confidence, tier, badges } = breakdown;
  
  // Color coding for confidence
  const getConfidenceColor = (conf) => {
    if (conf >= 0.7) return 'success';
    if (conf >= 0.5) return 'warning';
    return 'error';
  };
  
  const getConfidenceLabel = (conf) => {
    if (conf >= 0.7) return 'High Confidence';
    if (conf >= 0.5) return 'Moderate Confidence';
    return 'Low Confidence';
  };
  
  // Tier color coding
  const getTierColor = (t) => {
    if (t === 'supported') return 'success';
    if (t === 'consider') return 'warning';
    return 'default';
  };
  
  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Evidence Band
        </Typography>
        <Tooltip title="Confidence derived from S/P/E framework, evidence tier, and mechanistic insights">
          <InfoIcon fontSize="small" sx={{ opacity: 0.8, cursor: 'pointer' }} />
        </Tooltip>
      </Box>
      
      {/* Top Drug */}
      <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
        Top Recommendation: <strong>{top_drug}</strong>
      </Typography>
      
      {/* Confidence Bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">{getConfidenceLabel(confidence)}</Typography>
          <Typography variant="body2" fontWeight="bold">
            {(confidence * 100).toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={confidence * 100}
          sx={{ 
            height: 8, 
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: confidence >= 0.7 ? '#4caf50' : confidence >= 0.5 ? '#ff9800' : '#f44336'
            }
          }}
        />
      </Box>
      
      {/* Evidence Tier */}
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={`Evidence Tier: ${tier?.toUpperCase() || 'N/A'}`}
          size="small"
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </Box>
      
      {/* Badges */}
      {badges && badges.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {badges.map((badge, idx) => (
            <Chip 
              key={idx}
              label={badge}
              size="small"
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            />
          ))}
        </Box>
      )}

      {/* SAE Attribution (if present) */}
      {breakdown?.sae_attribution && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, mb: 0.5 }}>
            SAE Explainability
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip 
              label={`Overall Impact: ${(breakdown.sae_attribution.overall_impact * 100).toFixed(0)}%`}
              size="small"
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            {(breakdown.sae_attribution.boosting_features || []).map((f, i) => (
              <Chip key={`boost-${i}`} label={`+ ${f}`} size="small" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.35)', color: 'white' }} />
            ))}
            {(breakdown.sae_attribution.limiting_features || []).map((f, i) => (
              <Chip key={`limit-${i}`} label={`- ${f}`} size="small" sx={{ backgroundColor: 'rgba(255, 152, 0, 0.35)', color: 'white' }} />
            ))}
          </Box>
        </Box>
      )}
      
      <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.8 }}>
        💡 Confidence modulated by S/P/E alignment, evidence strength, and mechanistic insights
      </Typography>
    </Paper>
  );
};














