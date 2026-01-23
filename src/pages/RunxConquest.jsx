import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Alert } from '@mui/material';
import { MultiStepWorkflow } from '../components/demo-framework';
import { DEMO_CONFIGS } from '../config/demoConfigs';
import useAppStore from '../store';

/**
 * RunxConquest - Modular demo page with route-based demo selection
 * 
 * Supports multiple demos via URL parameter:
 * - /runx-conquest/pik3ca (default PIK3CA demo)
 * - /runx-conquest/metastasis (future metastasis demo)
 * 
 * Architecture:
 * - Route-based demo selection via useParams
 * - Demo data extracted to data/demos/
 * - Stage components extracted to components/demo-stages/
 * - Workflow logic extracted to components/demo-framework/
 */
const RunxConquest = () => {
  const { demoId = 'pik3ca' } = useParams(); // Default to 'pik3ca' if no demoId
  const { setActiveMutation } = useAppStore();

  // Get demo configuration
  const demoConfig = DEMO_CONFIGS[demoId];

  // Handle unknown demo IDs
  if (!demoConfig) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Demo "{demoId}" not found. Available demos: {Object.keys(DEMO_CONFIGS).join(', ')}
        </Alert>
      </Box>
    );
  }

  // Set initial mutation in store if provided
  if (demoConfig.data.initialMutation) {
    setActiveMutation(demoConfig.data.initialMutation);
  }

  // Render the modular workflow component
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <MultiStepWorkflow demoConfig={demoConfig} />
    </Box>
  );
};

export default RunxConquest;
