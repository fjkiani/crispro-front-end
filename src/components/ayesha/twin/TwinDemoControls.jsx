import React from 'react';
import { Box, Typography, Button, Card, CircularProgress } from '@mui/material';
import { Science } from '@mui/icons-material';

/**
 * Controls component for running the demo analysis
 */
export default function TwinDemoControls({ onRun, loading }) {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Run Complete Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyzes food/supplement recommendations + drug efficacy using public case profile
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={onRun}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Science />}
        >
          {loading ? 'Analyzing...' : 'Run Demo Analysis'}
        </Button>
      </Box>
    </Card>
  );
}
