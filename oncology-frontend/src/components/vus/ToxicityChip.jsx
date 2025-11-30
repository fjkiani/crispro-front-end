
/**
 * ToxicityChip Component
 * 
 * Displays toxicity risk assessment for germline variants.
 * Shows risk level, confidence, and key factors affecting toxicity.
 * 
 * Props:
 * - patient: { germlineVariants: Array }
 * - candidate: { type: string, moa: string }
 * - context: { disease: string, tissue?: string }
 * - options: { evidence: boolean, profile: string }
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Tooltip, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ToxicityChip = ({ patient, candidate, context, options = {} }) => {
  // If no germline variants, don't show anything
  if (!patient?.germlineVariants || patient.germlineVariants.length === 0) {
    return null;
  }

  // For now, show a placeholder chip
  // TODO: Integrate with actual toxicity risk API endpoint
  // This would call something like /api/toxicity/assess with patient + candidate data
  
  const hasGermlineData = patient.germlineVariants.length > 0;
  
  if (!hasGermlineData) {
    return null;
  }

  // Placeholder: Show that toxicity assessment is available
  // In production, this would fetch actual toxicity risk scores
  return (
    <Tooltip 
      title={
        <Box>
          <div><strong>Toxicity Risk Assessment (RUO)</strong></div>
          <div>Germline variants detected: {patient.germlineVariants.length}</div>
          <div>Drug: {candidate?.moa || 'Unknown'}</div>
          <div>Disease: {context?.disease || 'Unknown'}</div>
          <div style={{ marginTop: '8px', fontSize: '11px' }}>
            ⚠️ Toxicity assessment requires backend integration
          </div>
        </Box>
      }
      arrow
    >
      <Chip
        icon={<WarningIcon />}
        label="Toxicity Risk (RUO)"
        size="small"
        color="warning"
        variant="outlined"
        sx={{ 
          cursor: 'help',
          fontSize: '12px'
        }}
      />
    </Tooltip>
  );
};

ToxicityChip.propTypes = {
  patient: PropTypes.shape({
    germlineVariants: PropTypes.arrayOf(PropTypes.object)
  }),
  candidate: PropTypes.shape({
    type: PropTypes.string,
    moa: PropTypes.string
  }),
  context: PropTypes.shape({
    disease: PropTypes.string,
    tissue: PropTypes.string
  }),
  options: PropTypes.shape({
    evidence: PropTypes.bool,
    profile: PropTypes.string
  })
};

export default ToxicityChip;
