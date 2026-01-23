/**
 * HolisticScoreBadge Component
 *
 * Color-coded badge for Holistic Clinical Benefit Score interpretation levels.
 *
 * Props:
 * - interpretation: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "CONTRAINDICATED"
 * - score: number (0.0 - 1.0, optional, for tooltip)
 */
import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Block as BlockIcon,
} from '@mui/icons-material';

const getInterpretationProps = (interpretation, score) => {
  switch (interpretation) {
    case 'HIGH':
      return {
        label: 'HIGH CLINICAL BENEFIT',
        color: 'success',
        icon: <CheckCircleIcon />,
        tooltip: `High clinical benefit score (${score !== undefined ? (score * 100).toFixed(1) + '%' : 'N/A'}). This regimen shows strong alignment across diagnostic fit, mechanism, and safety.`,
      };
    case 'MEDIUM':
      return {
        label: 'MODERATE CLINICAL BENEFIT',
        color: 'warning',
        icon: <WarningIcon />,
        tooltip: `Moderate clinical benefit score (${score !== undefined ? (score * 100).toFixed(1) + '%' : 'N/A'}). This regimen shows reasonable alignment but may have some limitations.`,
      };
    case 'LOW':
      return {
        label: 'LOW CLINICAL BENEFIT',
        color: 'warning',
        icon: <WarningIcon />,
        tooltip: `Low clinical benefit score (${score !== undefined ? (score * 100).toFixed(1) + '%' : 'N/A'}). This regimen shows limited alignment and may not be optimal.`,
      };
    case 'VERY_LOW':
      return {
        label: 'VERY LOW CLINICAL BENEFIT',
        color: 'error',
        icon: <ErrorIcon />,
        tooltip: `Very low clinical benefit score (${score !== undefined ? (score * 100).toFixed(1) + '%' : 'N/A'}). This regimen shows poor alignment and is not recommended.`,
      };
    case 'CONTRAINDICATED':
      return {
        label: 'CONTRAINDICATED',
        color: 'error',
        icon: <BlockIcon />,
        tooltip: `Contraindicated: This regimen is not recommended due to safety concerns or poor fit.`,
      };
    default:
      return {
        label: 'UNKNOWN',
        color: 'default',
        icon: null,
        tooltip: `Unknown interpretation level.`,
      };
  }
};

export default function HolisticScoreBadge({ interpretation, score }) {
  if (!interpretation) {
    return null;
  }

  const { label, color, icon, tooltip } = getInterpretationProps(interpretation, score);

  return (
    <Tooltip title={tooltip} arrow>
      <Chip
        icon={icon}
        label={label}
        color={color}
        variant="filled"
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      />
    </Tooltip>
  );
}
