/**
 * ErrorState Component
 * 
 * Reusable error display component.
 */

import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

export const ErrorState = ({ 
  title = 'Error', 
  message, 
  error, 
  onRetry,
  severity = 'error' 
}) => {
  const displayMessage = message || error?.message || 'An unexpected error occurred';

  return (
    <Alert 
      severity={severity}
      icon={<ErrorIcon />}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            startIcon={<Refresh />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {displayMessage}
      {error?.details && (
        <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error.details, null, 2)}
        </Box>
      )}
    </Alert>
  );
};

