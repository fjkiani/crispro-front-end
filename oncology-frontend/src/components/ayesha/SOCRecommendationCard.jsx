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
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';

const SOCRecommendationCard = ({
  regimen,
  confidence,
  rationale,
  evidence,
  add_ons = [],
}) => {
  if (!regimen) return null;

  const confidencePercent = Math.round(confidence * 100);
  const confidenceColor = confidence >= 0.9 ? 'success' : confidence >= 0.7 ? 'warning' : 'error';

  return (
    <Card sx={{ bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
          <Typography variant="h6">
            Standard of Care Recommendation
          </Typography>
        </Box>

        {/* Regimen */}
        <Box mb={2}>
          <Typography variant="h5" gutterBottom>
            {regimen}
          </Typography>
          {add_ons && add_ons.length > 0 && (
            <Box mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Add-ons:</strong>
              </Typography>
              {add_ons.map((addon, idx) => (
                <Box key={idx} mb={1} sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {addon.drug}
                  </Typography>
                  {addon.rationale && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {addon.rationale}
                    </Typography>
                  )}
                  {addon.evidence && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                      Evidence: {addon.evidence}
                    </Typography>
                  )}
                </Box>
              ))}
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
            value={confidencePercent}
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
        {rationale && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Rationale
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {rationale}
            </Typography>
          </Box>
        )}

        {/* Evidence */}
        {evidence && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Evidence
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {evidence}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SOCRecommendationCard;


