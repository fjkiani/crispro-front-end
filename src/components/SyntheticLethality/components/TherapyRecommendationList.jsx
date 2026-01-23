/**
 * TherapyRecommendationList Component
 * 
 * Displays ranked therapy recommendations based on synthetic lethality analysis.
 * Shows:
 * - Drug name and target
 * - Confidence score with visual bar
 * - Mechanism of action
 * - FDA approval status
 * - Evidence tier
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Stack,
  LinearProgress,
  Divider,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Medication,
  CheckCircle,
  Science,
  EmojiEvents,
  TrendingUp
} from '@mui/icons-material';

/**
 * @typedef {Object} TherapyRecommendation
 * @property {string} drug - Drug name
 * @property {string} target - Molecular target
 * @property {number} confidence - Confidence score [0,1]
 * @property {string} mechanism - How it works
 * @property {string} evidence_tier - "I", "II", "III"
 * @property {boolean} fda_approved - FDA approval status
 * @property {string} sensitivity - "VERY_HIGH", "HIGH", "MODERATE"
 */

/**
 * @param {Object} props
 * @param {Array<TherapyRecommendation>} props.recommendations - Ranked drug list
 * @param {string} [props.suggestedTherapy] - Top suggestion from backend
 */
const TherapyRecommendationList = ({
  recommendations = [],
  suggestedTherapy = ''
}) => {
  // Get color based on sensitivity
  const getSensitivityColor = (sensitivity) => {
    switch (sensitivity) {
      case 'VERY_HIGH': return 'error';
      case 'HIGH': return 'warning';
      case 'MODERATE': return 'info';
      default: return 'default';
    }
  };

  // Get evidence tier display
  const getEvidenceTier = (tier) => {
    switch (tier) {
      case 'I': return { label: 'Tier I', color: 'success', tooltip: 'FDA approved, Phase 3 RCTs' };
      case 'II': return { label: 'Tier II', color: 'warning', tooltip: 'Phase 2 trials, strong preclinical' };
      case 'III': return { label: 'Tier III', color: 'default', tooltip: 'Early clinical or preclinical' };
      default: return { label: 'Unknown', color: 'default', tooltip: 'Evidence not classified' };
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Medication color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Recommended Therapies
        </Typography>
        {recommendations.length > 0 && (
          <Chip
            label={`${recommendations.length} drugs`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {recommendations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No recommendations available. Run analysis to see therapy options.
        </Typography>
      ) : (
        <List disablePadding>
          {recommendations.map((rec, index) => {
            const evidenceTier = getEvidenceTier(rec.evidence_tier);
            const isTopPick = index === 0;

            return (
              <React.Fragment key={`${rec.drug}-${index}`}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 2,
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: isTopPick ? 'success.lighter' : 'grey.50',
                    border: isTopPick ? '2px solid' : '1px solid',
                    borderColor: isTopPick ? 'success.main' : 'grey.200'
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: isTopPick ? 'success.main' : 'grey.400',
                        width: 40,
                        height: 40
                      }}
                    >
                      {isTopPick ? <EmojiEvents /> : index + 1}
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {rec.drug}
                        </Typography>
                        <Chip
                          label={rec.target}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {rec.fda_approved && (
                          <Tooltip title="FDA Approved">
                            <Chip
                              icon={<CheckCircle />}
                              label="FDA"
                              size="small"
                              color="success"
                            />
                          </Tooltip>
                        )}
                        <Tooltip title={evidenceTier.tooltip}>
                          <Chip
                            label={evidenceTier.label}
                            size="small"
                            color={evidenceTier.color}
                            variant="outlined"
                          />
                        </Tooltip>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {/* Confidence Bar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                            Confidence
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={rec.confidence * 100}
                            color={rec.confidence >= 0.8 ? 'success' : rec.confidence >= 0.6 ? 'warning' : 'error'}
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 45 }}>
                            {(rec.confidence * 100).toFixed(0)}%
                          </Typography>
                        </Box>

                        {/* Mechanism */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <Science fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {rec.mechanism}
                        </Typography>

                        {/* Sensitivity Badge */}
                        <Chip
                          icon={<TrendingUp />}
                          label={`Sensitivity: ${rec.sensitivity}`}
                          size="small"
                          color={getSensitivityColor(rec.sensitivity)}
                          variant="filled"
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < recommendations.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            );
          })}
        </List>
      )}

      {/* Footer note */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.lighter', borderRadius: 1 }}>
        <Typography variant="caption" color="info.dark">
          <strong>Note:</strong> Recommendations are based on synthetic lethality analysis and published evidence.
          Clinical decisions should be made in consultation with the treating physician and consider patient-specific factors.
        </Typography>
      </Box>
    </Paper>
  );
};

export default TherapyRecommendationList;




