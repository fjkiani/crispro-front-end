import React from 'react';
import { Alert } from '@mui/material';

/**
 * StageRenderer - Generic stage renderer that dynamically renders stage components
 * 
 * Props:
 * - stageId: Stage ID (e.g., 'target_acquisition')
 * - stageData: Data object to pass to the stage component
 * - stageComponents: Object mapping stage component names to React components
 * 
 * Component naming convention:
 * - Stage ID: 'target_acquisition' → Component: 'TargetAcquisitionCard'
 * - Converts snake_case to PascalCase and appends 'Card'
 */
export default function StageRenderer({ stageId, stageData, stageComponents }) {
  if (!stageId || !stageComponents) {
    return (
      <Alert severity="warning">
        Missing stageId or stageComponents
      </Alert>
    );
  }

  // Convert stageId (snake_case) to component name (PascalCase + 'Card')
  // e.g., 'target_acquisition' → 'TargetAcquisitionCard'
  const componentName = stageId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Card';

  const StageComponent = stageComponents[componentName];

  if (!StageComponent) {
    return (
      <Alert severity="info">
        Stage component "{componentName}" not found for stage "{stageId}".
        Available components: {Object.keys(stageComponents).join(', ')}
      </Alert>
    );
  }

  // Pass data as 'data' prop (matching the stage component API)
  return <StageComponent data={stageData} />;
}
