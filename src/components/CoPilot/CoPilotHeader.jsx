import React from 'react';
import { Box, Avatar, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon, SmartToy as AIIcon } from '@mui/icons-material';

/**
 * CoPilot Header Component
 * Displays the header with avatar, title, and close button
 */
export const CoPilotHeader = ({ onClose }) => {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
            <AIIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">Clinical Co-Pilot</Typography>
            <Typography variant="caption" color="text.secondary">
              AI-Powered Clinical Assistant
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

