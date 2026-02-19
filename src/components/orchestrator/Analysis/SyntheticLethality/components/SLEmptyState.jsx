/**
 * SLEmptyState Component
 * 
 * Empty state when no synthetic lethality data is available.
 */
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export const SLEmptyState = () => {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary">No synthetic lethality data available</Typography>
      </CardContent>
    </Card>
  );
};
