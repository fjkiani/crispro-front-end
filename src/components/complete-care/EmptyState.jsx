import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

/**
 * EmptyState Component
 * 
 * Displays empty state when a section has no data.
 */
export default function EmptyState({ title, message, icon: Icon = InfoIcon }) {
  return (
    <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Icon color="disabled" />
        <Box>
          {title && (
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {message || 'No data available for this section.'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}




