/**
 * KB Coverage Chip Component
 * Displays coverage information from Knowledge Base
 */
import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { CheckCircle, Cancel, Help } from '@mui/icons-material';
import KbHelperTooltip from './KbHelperTooltip';

const KbCoverageChip = ({ 
  type, 
  status, 
  source = 'KB',
  provenance = null,
  showHelper = true 
}) => {
  const getChipConfig = () => {
    switch (type) {
      case 'clinvar':
        return {
          label: 'ClinVar',
          icon: status === 'reviewed' ? <CheckCircle /> : 
                status === 'conflicting' ? <Cancel /> : <Help />,
          color: status === 'reviewed' ? 'success' : 
                 status === 'conflicting' ? 'error' : 'default',
          variant: status === 'reviewed' ? 'filled' : 'outlined'
        };
      case 'alphamissense':
        return {
          label: 'AlphaMissense',
          icon: status ? <CheckCircle /> : <Cancel />,
          color: status ? 'success' : 'default',
          variant: status ? 'filled' : 'outlined'
        };
      case 'cohort':
        return {
          label: 'Cohort Coverage',
          icon: status ? <CheckCircle /> : <Help />,
          color: status ? 'primary' : 'default',
          variant: status ? 'filled' : 'outlined'
        };
      default:
        return {
          label: type || 'Coverage',
          icon: <Help />,
          color: 'default',
          variant: 'outlined'
        };
    }
  };

  const getHelperText = () => {
    switch (type) {
      case 'clinvar':
        if (status === 'reviewed') {
          return 'This variant has been reviewed by expert panels in ClinVar with strong evidence for pathogenicity.';
        } else if (status === 'conflicting') {
          return 'This variant has conflicting interpretations in ClinVar - requires additional validation.';
        } else {
          return 'This variant has limited or no ClinVar data - consider additional validation sources.';
        }
      case 'alphamissense':
        if (status) {
          return 'This variant is covered by AlphaMissense predictions, enabling enhanced scoring with structural context.';
        } else {
          return 'This variant is not covered by AlphaMissense - using sequence-based scoring only.';
        }
      case 'cohort':
        if (status) {
          return 'This gene has cohort coverage data available, providing population-level context for interpretation.';
        } else {
          return 'No cohort coverage data available for this gene.';
        }
      default:
        return 'Coverage information from Knowledge Base.';
    }
  };

  const chipConfig = getChipConfig();
  const helperText = getHelperText();

  const chip = (
    <Chip
      icon={chipConfig.icon}
      label={chipConfig.label}
      color={chipConfig.color}
      variant={chipConfig.variant}
      size="small"
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          fontSize: 16
        }
      }}
    />
  );

  if (showHelper && helperText) {
    return (
      <KbHelperTooltip
        helperText={helperText}
        provenance={provenance}
        variant={chipConfig.color === 'success' ? 'verified' : 
                 chipConfig.color === 'error' ? 'warning' : 'info'}
      >
        {chip}
      </KbHelperTooltip>
    );
  }

  return chip;
};

export default KbCoverageChip;

