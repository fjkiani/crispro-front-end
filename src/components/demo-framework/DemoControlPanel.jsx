import React from 'react';
import { Card, CardContent, Grid, Box, Button, Typography, Chip } from '@mui/material';
import { PlayArrow, Pause, Replay, Science } from '@mui/icons-material';

/**
 * DemoControlPanel - Play/Pause/Reset controls with stats
 * 
 * Props:
 * - isRunning: Whether demo is running
 * - isPaused: Whether demo is paused
 * - onStart: Start handler
 * - onPause: Pause handler
 * - onReset: Reset handler
 * - elapsedTime: Time elapsed in milliseconds
 * - totalSavings: Total savings in dollars
 * - currentStage: Current stage index (0-based)
 * - totalStages: Total number of stages
 */
export default function DemoControlPanel({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  elapsedTime,
  totalSavings,
  currentStage,
  totalStages
}) {
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrow />}
                onClick={onStart}
                disabled={isRunning && !isPaused}
                sx={{ fontWeight: 'bold' }}
              >
                🚀 Begin Validation Campaign
              </Button>
              <Button
                variant="outlined"
                startIcon={isPaused ? <PlayArrow /> : <Pause />}
                onClick={onPause}
                disabled={!isRunning}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Replay />}
                onClick={onReset}
              >
                Reset
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">
                Time Elapsed: {formatTime(elapsedTime)}
              </Typography>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                Clinical Trial Failures Avoided: ${(totalSavings / 1000000).toFixed(0)}M
              </Typography>
              <Chip 
                icon={<Science />}
                label={`Stage ${currentStage + 1} of ${totalStages}`}
                color="primary"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}



