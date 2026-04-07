import React from 'react';
import { Box, Drawer, Typography } from '@mui/material';
import { prettyJson } from './slUtils';

export function SlFullJsonDrawer({ open, onClose, payload }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 560, md: 720 }, p: 2, maxWidth: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          Full synthetic_lethality payload (dev)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Enable with VITE_THERAPY_FIT_SL_DEBUG=true (or =1), or run a dev build.
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 1.5,
            bgcolor: '#0b1220',
            color: '#e2e8f0',
            borderRadius: 2,
            overflow: 'auto',
            maxHeight: 'calc(100vh - 120px)',
            fontSize: 11,
          }}
        >
          {prettyJson(payload)}
        </Box>
      </Box>
    </Drawer>
  );
}
