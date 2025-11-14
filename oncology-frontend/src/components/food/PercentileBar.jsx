import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Tooltip,
  Chip
} from '@mui/material';
// Using CSS transitions instead of framer-motion for better compatibility
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';

/**
 * PercentileBar Component
 * 
 * Displays calibrated S/P/E percentile with color-coded interpretation
 * and raw score for context.
 * 
 * Props:
 * - spePercentile: number (0-1) - Calibrated percentile from calibration service
 * - interpretation: string - Human-readable interpretation (e.g., "High (top 25%)")
 * - rawScore: number (0-1) - Raw S/P/E score for comparison
 * - showRawScore: boolean - Whether to show raw score (default: true)
 */
export default function PercentileBar({ 
  spePercentile, 
  interpretation, 
  rawScore, 
  showRawScore = true 
}) {
  // Handle missing data gracefully
  if (spePercentile === null || spePercentile === undefined) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="text.secondary">
          Calibration data not available for this compound-disease pair
        </Typography>
      </Paper>
    );
  }

  // Determine color based on percentile
  const getColor = (percentile) => {
    if (percentile >= 0.90) return 'success';
    if (percentile >= 0.75) return 'info';
    if (percentile >= 0.50) return 'warning';
    return 'error';
  };

  // Determine icon
  const getIcon = (percentile) => {
    if (percentile >= 0.50) return <TrendingUpIcon />;
    return <TrendingDownIcon />;
  };

  const color = getColor(spePercentile);
  const percentilePercent = (spePercentile * 100).toFixed(1);
  const rawScorePercent = rawScore ? (rawScore * 100).toFixed(1) : null;

  return (
    <Paper 
      sx={{ 
        p: 3, 
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: `1px solid ${color === 'success' ? '#4caf50' : color === 'info' ? '#2196f3' : color === 'warning' ? '#ff9800' : '#f44336'}20`
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Calibrated Score Performance
          </Typography>
          <Tooltip 
            title={
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>What is this?</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  This score is calibrated against historical data for similar compounds.
                  Percentile shows how this compound ranks compared to others tested.
                </Typography>
                <Typography variant="body2">
                  <strong>Raw Score:</strong> {rawScorePercent}% (uncalibrated)
                  <br />
                  <strong>Calibrated:</strong> {percentilePercent}% (percentile ranking)
                </Typography>
              </Box>
            }
            arrow
          >
            <InfoIcon sx={{ fontSize: 20, color: 'text.secondary', cursor: 'help' }} />
          </Tooltip>
        </Box>

        {/* Percentile Bar */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Box 
            sx={{ 
              height: 8, 
              bgcolor: 'grey.200', 
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: `${percentilePercent}%`,
                height: '100%',
                bgcolor: 
                  color === 'success' ? '#4caf50' : 
                  color === 'info' ? '#2196f3' : 
                  color === 'warning' ? '#ff9800' : '#f44336',
                borderRadius: 4,
                transition: 'width 0.8s ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                pr: 1
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                {percentilePercent}%
              </Typography>
            </Box>
          </Box>
          
          {/* Percentile Markers */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">0%</Typography>
            <Typography variant="caption" color="text.secondary">25%</Typography>
            <Typography variant="caption" color="text.secondary">50%</Typography>
            <Typography variant="caption" color="text.secondary">75%</Typography>
            <Typography variant="caption" color="text.secondary">100%</Typography>
          </Box>
        </Box>

        {/* Interpretation Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            icon={getIcon(spePercentile)}
            label={interpretation || `Top ${(100 - parseFloat(percentilePercent)).toFixed(0)}%`}
            color={color}
            size="medium"
            sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
          />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
            {percentilePercent}%
          </Typography>
        </Box>

        {/* Raw Score Comparison (if available) */}
        {showRawScore && rawScore !== null && rawScore !== undefined && (
          <Box 
            sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Raw Score (for reference):
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {rawScorePercent}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (uncalibrated S/P/E score)
              </Typography>
            </Box>
          </Box>
        )}

        {/* Calibration Info */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            This score is calibrated against historical validation data for similar compounds.
            Higher percentile indicates better relative performance.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

