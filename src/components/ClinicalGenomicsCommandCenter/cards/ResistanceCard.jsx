/**
 * ⚔️ RESISTANCE PREDICTION CARD ⚔️
 */

import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore, Shield } from '@mui/icons-material';

export const ResistanceCard = ({ result, loading, error }) => {
  if (loading) return (<Paper sx={{ p: 3 }}><Typography variant="h6">🛡️ Resistance</Typography><LinearProgress /></Paper>);
  if (error) return (<Paper sx={{ p: 3 }}><Typography variant="h6">🛡️ Resistance</Typography><Alert severity="error">{error}</Alert></Paper>);
  if (!result) return (<Paper sx={{ p: 3 }}><Typography variant="h6">🛡️ Resistance</Typography><Typography variant="body2" color="text.secondary">Add drug class to analyze</Typography></Paper>);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>🛡️ Resistance Prediction</Typography>
      <Chip label={`Risk: ${result.risk}`} color={result.risk === 'High' ? 'error' : 'warning'} icon={<Shield />} />
      <Typography variant="body2" sx={{ mt: 1 }}>Confidence: {(result.confidence * 100).toFixed(0)}%</Typography>
      {result.mechanisms && result.mechanisms.length > 0 && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Mechanisms ({result.mechanisms.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {result.mechanisms.map((m, i) => (
              <Box key={i} sx={{ mb: 1 }}>
                <Typography variant="body2"><strong>{m.gene}</strong>: {m.mechanism}</Typography>
                <Typography variant="caption" color="text.secondary">{m.evidence}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

export default ResistanceCard;


