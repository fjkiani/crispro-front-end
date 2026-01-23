import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

/**
 * DemoHeader - Header card with gradient background
 * 
 * Props:
 * - headerData: Object with {h3, h6, body1, body2}
 */
export default function DemoHeader({ headerData }) {
  if (!headerData) {
    return null;
  }

  const { h3, h6, body1, body2 } = headerData;

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)', color: 'white' }}>
      <CardContent>
        {h3 && (
          <Typography variant="h3" gutterBottom align="center">
            {h3}
          </Typography>
        )}
        {h6 && (
          <Typography variant="h6" align="center" sx={{ opacity: 0.9 }}>
            {h6}
          </Typography>
        )}
        {body1 && (
          <Typography variant="body1" align="center" sx={{ mt: 2, opacity: 0.8 }}>
            {body1}
          </Typography>
        )}
        {body2 && (
          <Typography variant="body2" align="center" sx={{ mt: 1, opacity: 0.7 }}>
            {body2}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
