import React from 'react';
import { Card, CardContent, Typography, LinearProgress } from '@mui/material';

/**
 * DemoNarrator - AI narrator with progress bar
 * 
 * Props:
 * - text: Narrator text to display
 * - progress: Progress percentage (0-100)
 * - isRunning: Whether demo is running
 */
export default function DemoNarrator({ text, progress, isRunning }) {
  return (
    <Card sx={{ mb: 3, border: '2px solid #ff9800' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🤖 AI Narrator
        </Typography>
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#ff9800' }}>
          {text}
        </Typography>
        {isRunning && (
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ mt: 2, height: 8, borderRadius: 4 }}
          />
        )}
      </CardContent>
    </Card>
  );
}



