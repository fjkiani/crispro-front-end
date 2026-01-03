/**
 * Evidence Tier Badge Component
 * 
 * Displays evidence tier (Supported/Consider/Insufficient) with color coding
 * and evidence badges (Pathway-Aligned, RCT, ClinVar-Strong, Guideline)
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Box,
  Chip,
  Typography,
  Tooltip
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const TIER_COLORS = {
  'Supported': '#4CAF50',      // Green
  'Consider': '#FF9800',        // Orange
  'Insufficient': '#9E9E9E'    // Gray
};

const BADGE_CONFIG = {
  'Pathway-Aligned': {
    color: 'primary',
    icon: AccountTreeIcon,
    tooltip: 'Mechanism aligns with known disease pathways'
  },
  'RCT': {
    color: 'secondary',
    icon: ScienceIcon,
    tooltip: 'Evidence from randomized controlled trials'
  },
  'ClinVar-Strong': {
    color: 'success',
    icon: CheckCircleIcon,
    tooltip: 'Strong clinical variant evidence from ClinVar'
  },
  'Guideline': {
    color: 'warning',
    icon: MenuBookIcon,
    tooltip: 'Supported by clinical guidelines'
  }
};

export default function EvidenceTierBadge({ tier, badges = [], size = 'medium' }) {
  if (!tier) {
    return null;
  }

  const tierColor = TIER_COLORS[tier] || TIER_COLORS['Insufficient'];
  const chipSize = size === 'small' ? 'small' : 'medium';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* Evidence Tier */}
      <Chip
        label={tier}
        sx={{
          backgroundColor: tierColor,
          color: 'white',
          fontWeight: 'bold',
          fontSize: size === 'small' ? '0.75rem' : '0.875rem'
        }}
        size={chipSize}
      />

      {/* Evidence Badges */}
      {badges && badges.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {badges.map((badge, idx) => {
            const config = BADGE_CONFIG[badge] || {
              color: 'default',
              icon: CheckCircleIcon,
              tooltip: badge
            };
            const IconComponent = config.icon;

            return (
              <Tooltip key={idx} title={config.tooltip} arrow>
                <Chip
                  icon={<IconComponent fontSize="small" />}
                  label={badge}
                  color={config.color}
                  variant="outlined"
                  size={chipSize}
                  sx={{
                    fontSize: size === 'small' ? '0.7rem' : '0.8rem'
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      )}
    </Box>
  );
}


