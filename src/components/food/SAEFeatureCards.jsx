import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TimelineIcon from '@mui/icons-material/Timeline';

/**
 * SAEFeatureCards - Displays SAE features as cards
 * 
 * Shows 3 cards:
 * - Line Fitness (appropriateness for current treatment line)
 * - Cross-Resistance Risk (overlap with prior therapies)
 * - Sequencing Fitness (optimal timing)
 * 
 * Props:
 * @param {Object} saeFeatures - Structured SAE features from API
 */
export default function SAEFeatureCards({ saeFeatures }) {
  if (!saeFeatures) {
    return null;
  }

  const { line_fitness, cross_resistance, sequencing_fitness } = saeFeatures;

  const getStatusColor = (status) => {
    if (status === 'appropriate' || status === 'optimal') return 'success';
    if (status === 'moderate') return 'warning';
    return 'error';
  };

  const getRiskColor = (risk) => {
    if (risk === 'LOW') return 'success';
    if (risk === 'MEDIUM') return 'warning';
    return 'error';
  };

  const cards = [
    {
      key: 'line_fitness',
      title: 'Line Fitness',
      icon: <CheckCircleIcon />,
      data: line_fitness,
      scoreKey: 'score',
      statusKey: 'status',
      reasonKey: 'reason',
      colorFn: getStatusColor,
      label: 'Score'
    },
    {
      key: 'cross_resistance',
      title: 'Cross-Resistance',
      icon: <WarningIcon />,
      data: cross_resistance,
      scoreKey: 'score',
      statusKey: 'risk',
      reasonKey: 'reason',
      colorFn: getRiskColor,
      label: 'Risk'
    },
    {
      key: 'sequencing_fitness',
      title: 'Sequencing',
      icon: <TimelineIcon />,
      data: sequencing_fitness,
      scoreKey: 'score',
      statusKey: 'optimal',
      reasonKey: 'reason',
      colorFn: (status) => status ? 'success' : 'warning',
      label: 'Score',
      isBoolean: true
    }
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {cards.map((card) => {
        if (!card.data) return null;

        const score = card.data[card.scoreKey] || 0;
        const status = card.data[card.statusKey];
        const reason = card.data[card.reasonKey] || 'N/A';
        
        // Handle boolean status for sequencing_fitness
        const displayStatus = card.isBoolean 
          ? (status ? 'YES' : 'NO')
          : status?.toUpperCase() || 'N/A';

        const color = card.colorFn(status);
        const percentScore = Math.round(score * 100);

        return (
          <Card 
            key={card.key}
            sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)', md: '1 1 calc(33.333% - 16px)' },
              minWidth: 200,
              maxWidth: { xs: '100%', sm: 350 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: `${color}.main` }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {card.title}
                </Typography>
              </Box>

              {/* Status Chip */}
              <Box sx={{ mb: 2 }}>
                {card.isBoolean ? (
                  <Chip
                    label={`Optimal: ${displayStatus}`}
                    color={color}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                ) : (
                  <Chip
                    label={`${card.label}: ${displayStatus}`}
                    color={color}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>

              {/* Score Display */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Score:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {percentScore}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentScore}
                  color={color}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>

              {/* Reason */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                  <CheckCircleIcon fontSize="inherit" sx={{ mt: 0.25, color: `${color}.main` }} />
                  <span>{reason}</span>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

SAEFeatureCards.propTypes = {
  saeFeatures: PropTypes.shape({
    line_fitness: PropTypes.shape({
      score: PropTypes.number,
      status: PropTypes.string,
      reason: PropTypes.string
    }),
    cross_resistance: PropTypes.shape({
      risk: PropTypes.string,
      score: PropTypes.number,
      reason: PropTypes.string
    }),
    sequencing_fitness: PropTypes.shape({
      score: PropTypes.number,
      optimal: PropTypes.bool,
      reason: PropTypes.string
    })
  })
};

