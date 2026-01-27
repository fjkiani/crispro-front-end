/**
 * ResistanceCard Component
 * 
 * Displays resistance prediction results.
 * Modular, self-contained component.
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import { Warning, TrendingUp, TrendingDown } from '@mui/icons-material';

export const ResistanceCard = ({ resistancePrediction, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography sx={{ mt: 1 }}>Loading resistance analysis...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!resistancePrediction) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No resistance data available</Typography>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = resistancePrediction.risk_level || 'LOW';
  const resistanceProbability = resistancePrediction.resistance_probability || 0;
  const confidence = resistancePrediction.confidence || 'MEDIUM';
  const signals = resistancePrediction.signals_detected || [];
  const recommendations = resistancePrediction.recommendations || [];

  const getRiskColor = (level) => {
    if (level === 'HIGH') return 'error';
    if (level === 'MEDIUM') return 'warning';
    return 'success';
  };

  const getConfidenceColor = (conf) => {
    if (conf === 'HIGH') return 'success';
    if (conf === 'MEDIUM') return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader
        avatar={<Warning />}
        title="Resistance Prediction"
        subheader={`Risk Level: ${riskLevel}`}
      />
      <CardContent>
        {/* Risk Level Alert */}
        <Alert severity={getRiskColor(riskLevel)} sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            Resistance Risk: {riskLevel}
          </Typography>
          {resistanceProbability > 0 && (
            <Typography variant="body2">
              Probability: {(resistanceProbability * 100).toFixed(1)}%
            </Typography>
          )}
        </Alert>

        {/* Confidence */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Confidence
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip
              label={confidence}
              color={getConfidenceColor(confidence)}
              size="small"
            />
          </Box>
        </Box>

        {/* Signals Detected */}
        {signals.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resistance Signals ({signals.length})
            </Typography>
            {signals.map((signal, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {signal.type || signal.mechanism || 'Unknown Signal'}
                </Typography>
                {signal.confidence && (
                  <Typography variant="caption" color="text.secondary">
                    Confidence: {(signal.confidence * 100).toFixed(0)}%
                  </Typography>
                )}
                {signal.evidence && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {signal.evidence}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Recommendations
            </Typography>
            {recommendations.map((rec, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 1,
                  mb: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {rec.action || rec.recommendation}
                  </Typography>
                  {rec.urgency && (
                    <Chip
                      label={rec.urgency}
                      size="small"
                      color={rec.urgency === 'IMMEDIATE' ? 'error' : 'warning'}
                    />
                  )}
                </Box>
                {rec.rationale && (
                  <Typography variant="caption" color="text.secondary">
                    {rec.rationale}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Pathway Information */}
        {resistancePrediction.pathway_impact && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Pathway Impact
            </Typography>
            <Typography variant="body2">
              {resistancePrediction.pathway_impact}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

