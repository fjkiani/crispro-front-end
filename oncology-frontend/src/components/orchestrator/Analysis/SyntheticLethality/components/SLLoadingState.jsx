/**
 * SLLoadingState Component
 * 
 * Loading state for synthetic lethality analysis.
 */
import React from 'react';
import { Card, CardContent, LinearProgress, Typography } from '@mui/material';

export const SLLoadingState = () => {
  return (
    <Card>
      <CardContent>
        <LinearProgress />
        <Typography sx={{ mt: 1 }}>Loading synthetic lethality analysis...</Typography>
      </CardContent>
    </Card>
  );
};
