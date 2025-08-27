import React from 'react';
import { Box, Paper, Typography, Avatar, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Close as CloseIcon, SmartToy as AIIcon } from '@mui/icons-material';
import { CoPilotTabs } from './CoPilotTabs';
import { CoPilotHeader } from './CoPilotHeader';

/**
 * Main CoPilot Drawer Component
 * Handles the drawer layout and content
 */
export const CoPilotDrawer = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  drawerContent
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <CoPilotHeader onClose={onClose} />

      {/* Tabs */}
      <CoPilotTabs
        currentTab={currentTab}
        onTabChange={onTabChange}
      />

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {drawerContent}
      </Box>
    </Box>
  );
};

