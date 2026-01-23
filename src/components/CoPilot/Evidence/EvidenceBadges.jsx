import React from 'react';
import { Box, Chip } from '@mui/material';

/**
 * Evidence Quality Badges Component
 * Displays evidence quality indicators like RCT, Guideline, ClinVar-Strong
 */
export const EvidenceBadges = ({ badges, evidenceLevel, confidence }) => {
  if (!badges && !evidenceLevel && !confidence) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
      {/* Evidence Quality Badges */}
      {badges && badges.map((badge, index) => (
        <Chip
          key={index}
          size="small"
          label={badge}
          color={
            badge.includes('RCT') ? 'success' :
            badge.includes('Guideline') ? 'info' :
            badge.includes('ClinVar-Strong') ? 'warning' :
            badge.includes('Meta-Analysis') ? 'secondary' : 'default'
          }
          variant="filled"
          sx={{
            fontSize: '0.7rem',
            height: '20px',
            '& .MuiChip-label': { px: 1 }
          }}
        />
      ))}

      {/* Evidence Level */}
      {evidenceLevel && (
        <Chip
          size="small"
          label={`Evidence: ${evidenceLevel}`}
          color={
            evidenceLevel === 'Strong' ? 'success' :
            evidenceLevel === 'Moderate' ? 'warning' :
            evidenceLevel === 'Weak' ? 'error' : 'default'
          }
          variant="outlined"
        />
      )}

      {/* Confidence Score */}
      {confidence && (
        <Chip
          size="small"
          label={`Confidence: ${Math.round(confidence * 100)}%`}
          color={
            confidence > 0.8 ? 'success' :
            confidence > 0.6 ? 'warning' : 'error'
          }
          variant="outlined"
        />
      )}
    </Box>
  );
};

