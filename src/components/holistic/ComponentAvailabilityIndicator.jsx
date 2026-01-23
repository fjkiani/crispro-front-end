/**
 * ComponentAvailabilityIndicator Component
 *
 * Shows which components (D, P, M, T, S) were available for computation.
 *
 * Props:
 * - componentAvailable: { D: boolean, P: boolean, M: boolean, T: boolean, S: boolean }
 */
import React from 'react';
import { Box, Typography, Stack, Chip, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Remove as RemoveIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const COMPONENT_LABELS = {
  D: { name: 'Diagnostic Fit', icon: <ScienceIcon />, description: 'Assesses diagnostic context: disease site, tumor subtype, required biomarkers' },
  P: { name: 'Prognostic Risk', icon: <AssessmentIcon />, description: 'Predicts expected outlook: PFI, PTPI, line of therapy, baseline covariates' },
  M: { name: 'Mechanism Fit', icon: <SettingsIcon />, description: 'Aligns tumor biology with drug mechanism (7D vector alignment)' },
  T: { name: 'Therapeutic Dynamics', icon: <TrendingUpIcon />, description: 'Assesses if current regimen is working (KELIM, CA-125/PSA early decline)' },
  S: { name: 'Safety/Tolerability', icon: <SecurityIcon />, description: 'Evaluates patient safety: PGx risk, organ function, previous toxicity' },
};

export default function ComponentAvailabilityIndicator({ componentAvailable }) {
  if (!componentAvailable) {
    return null;
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
        Component Availability
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {Object.entries(COMPONENT_LABELS).map(([key, label]) => {
          const isAvailable = componentAvailable[key];
          return (
            <Tooltip
              key={key}
              title={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {label.name} ({key})
                  </Typography>
                  <Typography variant="caption">
                    {label.description}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    Status: {isAvailable ? 'Available' : 'Not Available (using default)'}
                  </Typography>
                </Box>
              }
              arrow
            >
              <Chip
                icon={isAvailable ? <CheckCircleIcon /> : <RemoveIcon />}
                label={`${key}: ${isAvailable ? 'Available' : 'Default'}`}
                size="small"
                color={isAvailable ? 'success' : 'default'}
                variant={isAvailable ? 'filled' : 'outlined'}
                sx={{ fontWeight: isAvailable ? 600 : 400 }}
              />
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}
