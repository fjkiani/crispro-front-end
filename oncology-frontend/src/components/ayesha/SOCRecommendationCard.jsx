/**
 * SOC (Standard of Care) Recommendation Card
 * 
 * Displays recommended first-line treatment regimen with:
 * - Regimen name
 * - Confidence score
 * - Rationale
 * - Evidence citations
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';

const SOCRecommendationCard = ({
  regimen,
  confidence,
  rationale,
  evidence,
  add_ons = [],
}) => {
  if (!regimen) return null;

  const confidencePercent = Math.round((confidence || 0) * 100);
  const confidenceColor = confidence >= 0.9 ? 'success' : confidence >= 0.7 ? 'warning' : 'error';                                                

  // Format regimen for display - handle both string and object formats
  const formatRegimen = () => {
    try {
      // Handle string directly
      if (typeof regimen === 'string') {
        return regimen;
      }
      
      // Handle object formats
      if (typeof regimen === 'object' && regimen !== null && !Array.isArray(regimen)) {
        // First, try to extract string values from the object
        const values = Object.values(regimen);
        const validValues = values
          .filter(v => v != null && typeof v === 'string')
          .map(v => String(v).trim())
          .filter(v => v.length > 0);
        
        if (validValues.length > 0) {
          // Join string values with " + " separator
          return validValues.join(' + ');
        }
        
        // Fallback: format keys as readable drug names
        const keys = Object.keys(regimen);
        if (keys.length > 0) {
          const formatted = keys
            .map(key => {
              // Convert snake_case to Title Case
              return String(key)
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            })
            .join(' + ');
          return formatted || 'Standard Regimen';
        }
        
        return 'Standard Regimen';
      }
      
      // Fallback for any other type
      return String(regimen || 'Standard Regimen');
    } catch (error) {
      console.error('Error formatting regimen:', error, regimen);
      return 'Standard Regimen';
    }
  };

  const regimenText = formatRegimen();

  // Ensure all props are safe for rendering
  const safeRationale = typeof rationale === 'string' ? rationale : (rationale ? JSON.stringify(rationale) : null);
  const safeEvidence = typeof evidence === 'string' ? evidence : (evidence ? JSON.stringify(evidence) : null);

  return (
    <Card sx={{ bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>                                                       
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="h6">
            Standard of Care Recommendation
          </Typography>
        </Box>

        {/* Regimen */}
        <Box mb={2}>
          <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {regimenText}
          </Typography>
          {add_ons && Array.isArray(add_ons) && add_ons.length > 0 && (
            <Box mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Add-ons:</strong>
              </Typography>
              {add_ons.map((addon, idx) => {
                // Ensure addon is an object with a drug property
                const drugName = addon?.drug || addon?.name || String(addon);
                const addonRationale = addon?.rationale || null;
                const addonEvidence = addon?.evidence || null;
                
                return (
                  <Box key={idx} mb={1} sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'primary.main' }}>                                       
                    <Typography variant="body2" fontWeight="bold">
                      {String(drugName)}
                    </Typography>
                    {addonRationale && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>                                              
                        {String(addonRationale)}
                      </Typography>
                    )}
                    {addonEvidence && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>                 
                        Evidence: {String(addonEvidence)}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Confidence */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2">
              <strong>Confidence:</strong>
            </Typography>
            <Typography variant="body2" fontWeight="bold" color={`${confidenceColor}.main`}>                                                      
              {confidencePercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(confidencePercent, 100)}
            color={confidenceColor}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Chip
            label="NCCN Guideline-Aligned"
            size="small"
            color="success"
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Rationale */}
        {safeRationale && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Rationale
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {safeRationale}
            </Typography>
          </Box>
        )}

        {/* Evidence */}
        {safeEvidence && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Evidence
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {safeEvidence}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SOCRecommendationCard;
