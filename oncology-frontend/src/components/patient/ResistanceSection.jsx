/**
 * ResistanceSection - Resistance playbook section
 * 
 * Displays:
 * - Resistance detection and next-line recommendations
 */

import React from 'react';
import { Box } from '@mui/material';
import ResistancePlaybook from '../ayesha/ResistancePlaybook';

const ResistanceSection = ({
  result,
}) => {
  if (!result || !result.resistance_playbook) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <ResistancePlaybook resistance_playbook={result.resistance_playbook} />
    </Box>
  );
};

export default ResistanceSection;
