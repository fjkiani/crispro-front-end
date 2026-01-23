import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  Paper
} from '@mui/material';
import { Science } from '@mui/icons-material';

/**
 * DDRBinGauge Component
 * 
 * Displays DDR_bin score from TRUE SAE (9 diamond features)
 * 
 * @param {Object} props
 * @param {number} props.score - DDR_bin score (0.0-1.0)
 * @param {boolean} props.showLabel - Show "DDR_bin" label (default: true)
 */
const DDRBinGauge = ({ score, showLabel = true }) => {
  if (score === undefined || score === null) return null;

  const percent = Math.round(score * 100);
  
  // Color zones: Low (red), Medium (yellow), High (green)
  const getColor = () => {
    if (score >= 0.7) return 'success'; // Green - High DDR burden
    if (score >= 0.4) return 'warning'; // Yellow - Medium DDR burden
    return 'error'; // Red - Low DDR burden (but still detected)
  };

  const getZoneLabel = () => {
    if (score >= 0.7) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    return 'LOW';
  };

  const tooltipText = `DDR_bin Score: ${score.toFixed(3)} (${percent}%)
    
Computed from 9 TRUE SAE "diamond" features mapped to DNA Damage Repair pathway.

Validation:
- AUROC: 0.783 (vs PROXY SAE: 0.628)
- Cohen's d: 0.642 (medium-large effect)
- p-value: 0.0020 (highly significant)

Higher scores indicate stronger DNA repair deficiency signals from sequence-level analysis.`;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        bgcolor: 'grey.50',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.300'
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Science sx={{ fontSize: 18, color: 'primary.main' }} />
        {showLabel && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            DDR_bin Score
          </Typography>
        )}
        <Box flex={1} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: getColor() === 'success' ? 'success.main' : 
                   getColor() === 'warning' ? 'warning.main' : 'error.main'
          }}
        >
          {getZoneLabel()}
        </Typography>
      </Box>
      
      <Tooltip title={tooltipText} arrow>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="h6" color={getColor()}>
              {percent}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {score.toFixed(3)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percent}
            color={getColor()}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200'
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
            9 diamond features • AUROC 0.783
          </Typography>
        </Box>
      </Tooltip>
    </Paper>
  );
};

export default DDRBinGauge;


