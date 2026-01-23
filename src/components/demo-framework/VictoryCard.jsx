import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

/**
 * VictoryCard - Victory celebration card
 * 
 * Props:
 * - victoryMessage: Object with {h3, h5, body1, body2}
 */
export default function VictoryCard({ victoryMessage }) {
  if (!victoryMessage) return null;

  const { h3, h5, body1, body2 } = victoryMessage;

  return (
    <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)', color: 'white' }}>
      <CardContent sx={{ textAlign: 'center' }}>
        {h3 && (
          <Typography variant="h3" gutterBottom>
            {h3}
          </Typography>
        )}
        {h5 && (
          <Typography variant="h5" gutterBottom>
            {h5}
          </Typography>
        )}
        {body1 && (
          <Typography variant="body1" gutterBottom>
            <strong>{body1}</strong>
          </Typography>
        )}
        {body2 && (
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {body2}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
