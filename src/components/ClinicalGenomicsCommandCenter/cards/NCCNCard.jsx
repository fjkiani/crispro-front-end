/**
 * ⚔️ NCCN GUIDELINE CARD ⚔️
 */

import React from 'react';
import { Paper, Typography, Chip, LinearProgress, Alert, Box } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

export const NCCNCard = ({ result, loading, error }) => {
  if (loading) return (<Paper sx={{ p: 3 }}><Typography variant="h6">📋 NCCN Guidelines</Typography><LinearProgress /></Paper>);
  if (error) return (<Paper sx={{ p: 3 }}><Typography variant="h6">📋 NCCN Guidelines</Typography><Alert severity="error">{error}</Alert></Paper>);
  if (!result) return (<Paper sx={{ p: 3 }}><Typography variant="h6">📋 NCCN Guidelines</Typography><Typography variant="body2" color="text.secondary">Add cancer type and therapy to check</Typography></Paper>);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>📋 NCCN Guidelines</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip
          label={result.compliant ? 'COMPLIANT' : 'NOT COMPLIANT'}
          color={result.compliant ? 'success' : 'error'}
          icon={result.compliant ? <CheckCircle /> : <Cancel />}
        />
        {result.category && <Chip label={`Category: ${result.category}`} size="small" variant="outlined" />}
      </Box>
      {result.evidence && <Typography variant="body2" sx={{ mt: 1 }}>Evidence: {result.evidence}</Typography>}
      {result.recommendation && <Alert severity="info" sx={{ mt: 1 }}>{result.recommendation}</Alert>}
    </Paper>
  );
};

export default NCCNCard;


