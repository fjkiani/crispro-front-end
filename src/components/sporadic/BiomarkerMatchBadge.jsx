import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * BiomarkerMatchBadge Component (Zo - Clinical Trials Integration)
 * 
 * Simple badge component for displaying backend-provided biomarker matches.
 * Used in trial cards to show why a trial matches patient's tumor profile.
 * 
 * Props:
 * - biomarker: Object with {name, value, tier} structure from backend
 */
export default function BiomarkerMatchBadge({ biomarker }) {
  if (!biomarker || !biomarker.name) {
    return null;
  }

  const { name, value, tier } = biomarker;
  
  // Color based on tier
  const color = tier === 'high' ? 'success' : tier === 'intermediate' ? 'warning' : 'default';
  
  // Tooltip text
  const tooltipText = value 
    ? `${name}: ${value} - Trial matches this biomarker`
    : `${name} - Trial matches this biomarker`;

  return (
    <Tooltip title={tooltipText} arrow>
      <Chip
        icon={<CheckCircleIcon />}
        label={name}
        size="small"
        color={color}
        variant="filled"
        sx={{ 
          fontSize: '0.7rem', 
          height: '22px',
          fontWeight: 500
        }}
      />
    </Tooltip>
  );
}



