/**
 * TumorBoardPage - shell for the hospital-persona tumor board.
 * Wraps the existing PatientStrategyBoard component so hospital users
 * get a familiar entry point at /hospital/tumor-board.
 */
import React, { Suspense } from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';

const PatientStrategyBoard = React.lazy(
  () => import('../ayesha/PatientStrategyBoard'),
);

export default function TumorBoardPage() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 1 }}>
        <Typography variant="h5" gutterBottom>Tumor Board</Typography>
        <Typography variant="body2" color="text.secondary">
          Multi-disciplinary case review — trial matching, resistance forecast,
          and dossier assembly.
        </Typography>
      </Container>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        <PatientStrategyBoard />
      </Suspense>
    </Box>
  );
}
