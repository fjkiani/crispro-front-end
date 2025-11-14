import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const EfficacyCard = ({ result }) => {
  if (!result?.efficacy?.drugs) return null;
  
  const { drugs, confidence, evidence_tier, badges, insights } = result.efficacy;
  
  // Color coding for confidence
  const getConfidenceColor = (conf) => {
    if (conf >= 0.7) return 'success';
    if (conf >= 0.5) return 'warning';
    return 'error';
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Drug Efficacy Predictions (S/P/E)</Typography>
      
      {/* Confidence & Tier */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`Confidence: ${(confidence * 100).toFixed(0)}%`}
          color={getConfidenceColor(confidence)}
          size="small"
        />
        <Chip 
          label={`Tier: ${evidence_tier}`}
          color={evidence_tier === 'supported' ? 'success' : 'warning'}
          size="small"
        />
        {badges?.map((badge, i) => (
          <Chip key={i} label={badge} variant="outlined" size="small" />
        ))}
      </Box>
      
      {/* Top 5 Drugs */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Top Ranked Therapies:</Typography>
        {drugs.slice(0, 5).map((drug, i) => (
          <Box 
            key={i} 
            sx={{ 
              mb: 1, 
              p: 1.5, 
              border: '1px solid #eee', 
              borderRadius: 1,
              bgcolor: 'grey.50'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                {drug.name || drug.therapy}
              </Typography>
              <Chip 
                label={`${(drug.efficacy_score * 100).toFixed(0)}%`}
                size="small"
                color={drug.efficacy_score >= 0.7 ? 'success' : 'default'}
              />
            </Box>
            {drug.rationale?.[0] && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ mt: 0.5, display: 'block' }}
              >
                {drug.rationale[0]}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      
      {/* Insights chips (mechanistic) */}
      {insights && Object.keys(insights).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Mechanistic Insights:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(insights).map(([key, value]) => (
              <Chip 
                key={key} 
                label={`${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Provenance */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Provenance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" component="div">
            <strong>Run ID:</strong> {result.provenance?.run_id}<br />
            <strong>Profile:</strong> {result.provenance?.profile}<br />
            <strong>Timestamp:</strong> {result.provenance?.timestamp}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

