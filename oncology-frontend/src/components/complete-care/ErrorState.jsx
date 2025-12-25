import React from 'react';
import { Alert, Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * ErrorState Component
 * 
 * Displays error state for complete care plan generation failures.
 */
export default function ErrorState({ error, onRetry }) {
  return (
    <Box sx={{ p: 3 }}>
      <Alert 
        severity="error" 
        icon={<ErrorOutlineIcon />}
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Error Generating Care Plan
        </Typography>
        <Typography variant="body2">
          {error || 'An unexpected error occurred while generating the complete care plan.'}
        </Typography>
      </Alert>
      
      {onRetry && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry
          </Button>
        </Box>
      )}
    </Box>
  );
}




