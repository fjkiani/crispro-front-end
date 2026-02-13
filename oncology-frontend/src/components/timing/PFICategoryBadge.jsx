/**
 * PFICategoryBadge Component
 * 
 * Color-coded badge for PFI (Platinum-Free Interval) categories.
 * 
 * Props:
 * - pfiDays: number (PFI in days)
 * - pfiCategory: string ("<6m", "6-12m", ">12m" or "resistant", "partially_sensitive", "sensitive")
 */
import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { AccessTime as ClockIcon } from '@mui/icons-material';

const PFICategoryBadge = ({ pfiDays = null, pfiCategory = null }) => {
  if (pfiDays === null && pfiCategory === null) {
    return null;
  }

  // Normalize category format
  let category = pfiCategory;
  if (!category && pfiDays !== null) {
    // Compute category from days
    const months = pfiDays / 30.44; // Average days per month
    if (months < 6) {
      category = '<6m';
    } else if (months <= 12) {
      category = '6-12m';
    } else {
      category = '>12m';
    }
  }

  // Map category to color and label
  const getCategoryInfo = (cat) => {
    if (!cat) return { color: 'default', label: 'Unknown', description: 'PFI category unknown' };

    const normalized = cat.toLowerCase().replace(/[<>]/g, '');

    if (normalized.includes('6m') || normalized.includes('resistant') || normalized.includes('<6')) {
      return {
        color: 'error',
        label: 'Resistant',
        description: 'PFI < 6 months - Platinum-resistant. Consider non-platinum alternatives.'
      };
    } else if (normalized.includes('12m') || normalized.includes('partial') || normalized.includes('6-12')) {
      return {
        color: 'warning',
        label: 'Partially Sensitive',
        description: 'PFI 6-12 months - Partially platinum-sensitive. Platinum-based regimens may have reduced efficacy.'
      };
    } else if (normalized.includes('>12') || normalized.includes('sensitive')) {
      return {
        color: 'success',
        label: 'Sensitive',
        description: 'PFI > 12 months - Platinum-sensitive. Platinum-based regimens likely effective.'
      };
    }

    return { color: 'default', label: cat, description: `PFI category: ${cat}` };
  };

  const categoryInfo = getCategoryInfo(category);
  const displayText = pfiDays !== null
    ? `${categoryInfo.label} (${Math.round(pfiDays / 30.44)}m)`
    : categoryInfo.label;

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {categoryInfo.description}
          </Typography>
          {pfiDays !== null && (
            <Typography variant="caption">
              PFI: {pfiDays} days ({Math.round(pfiDays / 30.44)} months)
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <Chip
        icon={<ClockIcon />}
        label={displayText}
        size="small"
        color={categoryInfo.color}
        sx={{ fontWeight: 600 }}
      />
    </Tooltip>
  );
};

export default PFICategoryBadge;
