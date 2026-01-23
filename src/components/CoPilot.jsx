import React from 'react';
import { Box, Drawer, Fade, Fab, Badge, Tooltip, Typography } from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';

/**
 * Main CoPilot Component - Now Modular and Clean
 * Simplified version for testing
 */
const CoPilot = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  return (
    <>
      {/* Floating Action Button */}
      <Fade in={!isOpen}>
        <Tooltip title="Open Clinical Co-Pilot">
          <Fab
            color="primary"
            onClick={() => setIsOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000
            }}
          >
            <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
              <AIIcon />
            </Badge>
          </Fab>
        </Tooltip>
      </Fade>

      {/* Simple Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', md: 400 },
            height: '100vh',
          },
        }}
      >
        <Box sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6">Clinical Co-Pilot</Typography>
          <Typography variant="body2">Modular Architecture Test - Success!</Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default CoPilot;
