/**
 * LoadingState Component
 * 
 * Reusable loading indicator component.
 */

import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

export const LoadingState = ({ message = 'Loading...', variant = 'circular', fullScreen = false }) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      {variant === 'circular' ? (
        <CircularProgress />
      ) : (
        <LinearProgress sx={{ width: '100%' }} />
      )}
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

