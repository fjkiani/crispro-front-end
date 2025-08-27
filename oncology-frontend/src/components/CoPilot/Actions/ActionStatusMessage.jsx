import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';

/**
 * Action Status Message Component
 * Renders different states of an action (in progress, completed, error)
 */
export const ActionStatusMessage = ({ message }) => {
  const isInProgress = message.isActionInProgress;
  const isResult = message.isActionResult;
  const isError = message.isActionError;

  if (isInProgress) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          {message.content}
        </Typography>
      </Box>
    );
  }

  if (isResult) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            Action Completed Successfully
          </Typography>
        </Box>
        <Typography variant="body2">{message.content}</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
            Action Failed
          </Typography>
        </Box>
        <Typography variant="body2">{message.content}</Typography>
      </Box>
    );
  }

  return <Typography variant="body2">{message.content}</Typography>;
};

