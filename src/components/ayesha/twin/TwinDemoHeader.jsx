import React from 'react';
import { Box, Typography, Stack, Card } from '@mui/material';
import { Science } from '@mui/icons-material';

/**
 * Header component for Ayesha Twin Demo
 * Displays title and description with gradient background
 */
export default function TwinDemoHeader() {
  return (
    <Card sx={{ p: 3, mb: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Science sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, mb: 0.5 }}>
            AK — digital twin
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Research-use analysis to discuss with your care team (RUO).
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
