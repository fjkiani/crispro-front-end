/**
 * EssentialityScoreCard Component
 * 
 * Displays gene essentiality score with visual gauge and clinical interpretation.
 * Enhanced with animations and glassmorphism design.
 * Shows:
 * - Gene name and score
 * - Animated visual progress bar
 * - Mutation flags (frameshift, truncation, hotspot)
 * - Pathway impact interpretation
 */

// Animation keyframes
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
`;

const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Science,
  BrokenImage
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

/**
 * @param {Object} props
 * @param {string} props.gene - Gene symbol
 * @param {number} props.score - Essentiality score [0,1]
 * @param {Object} props.flags - {truncation, frameshift, hotspot}
 * @param {string} props.rationale - Explanation text
 * @param {number} props.confidence - Confidence in score
 * @param {string} props.pathwayImpact - Which pathway is affected
 * @param {string} [props.germlineStatus] - "germline" or "somatic"
 */
const EssentialityScoreCard = ({
  gene,
  score = 0,
  flags = {},
  rationale = '',
  confidence = 0.5,
  pathwayImpact = '',
  germlineStatus = ''
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Animate score count-up on mount
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, increment * step);
      setAnimatedScore(current);
      
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  // Determine severity level
  const getSeverity = (score) => {
    if (score >= 0.7) return { level: 'HIGH', color: 'error', label: 'High Essentiality' };
    if (score >= 0.5) return { level: 'MODERATE', color: 'warning', label: 'Moderate Essentiality' };
    return { level: 'LOW', color: 'success', label: 'Low Essentiality' };
  };

  const severity = getSeverity(score);
  const isHighScore = score >= 0.7;

  // Get mutation type chip
  const getMutationTypeChip = () => {
    if (flags.frameshift) return { label: 'Frameshift', color: 'error', icon: <BrokenImage fontSize="small" /> };
    if (flags.truncation) return { label: 'Truncation', color: 'error', icon: <BrokenImage fontSize="small" /> };
    if (flags.hotspot) return { label: 'Hotspot', color: 'warning', icon: <Warning fontSize="small" /> };
    return { label: 'Variant', color: 'default', icon: <Science fontSize="small" /> };
  };

  const mutationType = getMutationTypeChip();

  return (
    <Card
      elevation={isHovered ? 8 : 2}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        minWidth: 280,
        maxWidth: 320,
        border: `2px solid`,
        borderColor: `${severity.color}.main`,
        borderRadius: 3,
        // Glassmorphism effect
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        // Pulsing animation for high scores
        ...(isHighScore && {
          animation: `${pulseAnimation} 2s infinite`
        }),
        '&:hover': {
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          borderColor: `${severity.color}.dark`
        }
      }}
    >
      <CardContent>
        {/* Header: Gene name + Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            {gene}
          </Typography>
          {germlineStatus && (
            <Chip
              label={germlineStatus === 'germline' ? 'Germline' : 'Somatic'}
              size="small"
              color={germlineStatus === 'germline' ? 'secondary' : 'default'}
              variant="outlined"
            />
          )}
        </Box>

        {/* Essentiality Score with Visual Gauge */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Essentiality Score
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              color={`${severity.color}.main`}
              sx={{
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {(animatedScore * 100).toFixed(0)}%
            </Typography>
          </Box>
          
          <Tooltip title={`${severity.label} (${score.toFixed(2)})`}>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={animatedScore * 100}
                color={severity.color}
                sx={{
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: `${severity.color}.lighter`,
                  transition: 'width 0.1s ease-out',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 7,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: `${shimmerAnimation} 2s infinite`
                    }
                  }
                }}
              />
            </Box>
          </Tooltip>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              color: `${severity.color}.main`,
              fontWeight: 'medium'
            }}
          >
            {severity.label}
          </Typography>
        </Box>

        {/* Mutation Type Chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            icon={mutationType.icon}
            label={mutationType.label}
            size="small"
            color={mutationType.color}
          />
          {confidence >= 0.7 && (
            <Chip
              icon={<CheckCircle fontSize="small" />}
              label="High Confidence"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Stack>

        {/* Pathway Impact */}
        {pathwayImpact && (
          <Box
            sx={{
              p: 1.5,
              backgroundColor: `${severity.color}.lighter`,
              borderRadius: 1,
              mb: 1
            }}
          >
            <Typography variant="body2" fontWeight="medium" color={`${severity.color}.dark`}>
              {pathwayImpact}
            </Typography>
          </Box>
        )}

        {/* Rationale */}
        {rationale && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {rationale}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default EssentialityScoreCard;

