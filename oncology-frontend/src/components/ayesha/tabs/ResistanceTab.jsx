import React from 'react';
import { Box, Typography, Alert, Paper, Chip } from '@mui/material';
import ResistanceAlertBanner from '../ResistanceAlertBanner';
import ResistancePlaybook from '../ResistancePlaybook';
import AyeshaSAEFeaturesCard from '../AyeshaSAEFeaturesCard';

const ResistanceTab = ({ resistanceAlert, resistancePlaybook, resistancePrediction, saeFeatures }) => {
  return (
    <Box>
      {/* Resistance Alert */}
      {resistanceAlert && (
        <Box mb={3}>
          <ResistanceAlertBanner resistance_alert={resistanceAlert} />
        </Box>
      )}

      {/* Resistance Playbook */}
      {resistancePlaybook ? (
        <Box mb={3}>
          <ResistancePlaybook resistance_playbook={resistancePlaybook} />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Resistance playbook requires tumor NGS data.
        </Alert>
      )}

      {/* Resistance Prophet Prediction */}
      {resistancePrediction && (
        <Box mb={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🔮 Resistance Prophet (3-6 Month Early Warning)
            </Typography>
            {resistancePrediction.status === 'insufficient_data' ? (
              <Alert severity="warning">{resistancePrediction.message}</Alert>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={`Risk: ${resistancePrediction.risk_level}`}
                    color={resistancePrediction.risk_level === 'HIGH' ? 'error' : resistancePrediction.risk_level === 'MEDIUM' ? 'warning' : 'success'}
                  />
                  <Chip label={`Probability: ${Math.round(resistancePrediction.probability * 100)}%`} />
                  <Chip label={`Confidence: ${Math.round(resistancePrediction.confidence * 100)}%`} variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {resistancePrediction.rationale}
                </Typography>
                {resistancePrediction.recommended_actions?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Recommended Actions:</Typography>
                    <ul>
                      {resistancePrediction.recommended_actions.map((action, idx) => (
                        <li key={idx}><Typography variant="body2">{action}</Typography></li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* SAE Features */}
      {saeFeatures && saeFeatures.status !== 'awaiting_ngs' && (
        <Box mb={3}>
          <AyeshaSAEFeaturesCard sae_features={saeFeatures} />
        </Box>
      )}
    </Box>
  );
};

export default ResistanceTab;
