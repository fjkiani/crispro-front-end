import React from 'react';
import { Box, Typography, Stack, Card } from '@mui/material';
import { Science } from '@mui/icons-material';

/**
 * Header component for Ayesha Twin Demo
 * Displays title and description with gradient background
 */
export default function TwinDemoHeader() {
  return (
    <Card sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Science sx={{ fontSize: 48, color: 'white' }} />
        <Box>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            🔬 Ayesha's Digital Twin
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Your personalized precision oncology analysis powered by AI
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
