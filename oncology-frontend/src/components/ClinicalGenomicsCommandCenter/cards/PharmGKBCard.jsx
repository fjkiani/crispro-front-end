/**
 * ⚔️ PHARMGKB CARD ⚔️
 * 
 * Displays pharmacogenomics analysis:
 * - Metabolizer status (CYP2D6, CYP2C19)
 * - Drug interactions and significance
 * - Clinical recommendations
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Box, Paper, Typography, Chip, LinearProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails, Table,
  TableBody, TableRow, TableCell
} from '@mui/material';
import { ExpandMore, Science } from '@mui/icons-material';

export const PharmGKBCard = ({ result, loading, error }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>💊 PharmGKB Analysis</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>💊 PharmGKB Analysis</Typography>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!result) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>💊 PharmGKB Analysis</Typography>
        <Typography variant="body2" color="text.secondary">
          Add CYP2D6/CYP2C19 diplotype or drug to analyze
        </Typography>
      </Paper>
    );
  }

  const metabolizer = result.metabolizer;
  const drugInteraction = result.drug_interaction;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>💊 PharmGKB Analysis</Typography>

      {/* Metabolizer Status */}
      {metabolizer && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Metabolizer Status:</Typography>
          <Chip
            label={`${metabolizer.gene}: ${metabolizer.phenotype}`}
            color={metabolizer.phenotype.includes('Poor') ? 'error' : metabolizer.phenotype.includes('Ultrarapid') ? 'warning' : 'success'}
            icon={<Science />}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Confidence: {(metabolizer.confidence * 100).toFixed(0)}%
          </Typography>
        </Box>
      )}

      {/* Drug Interaction */}
      {drugInteraction && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Drug Interaction:</Typography>
          <Chip
            label={`${drugInteraction.drug} - ${drugInteraction.significance}`}
            color={drugInteraction.significance === 'High' ? 'error' : 'warning'}
          />
          {drugInteraction.recommendation && (
            <Alert severity="info" sx={{ mt: 1 }}>
              {drugInteraction.recommendation}
            </Alert>
          )}
        </Box>
      )}

      {/* Provenance */}
      {(metabolizer?.provenance || drugInteraction?.provenance) && (
        <Accordion sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Provenance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableBody>
                {metabolizer?.provenance?.method && (
                  <TableRow>
                    <TableCell><strong>Method:</strong></TableCell>
                    <TableCell>{metabolizer.provenance.method}</TableCell>
                  </TableRow>
                )}
                {drugInteraction?.provenance?.method && (
                  <TableRow>
                    <TableCell><strong>Drug Analysis:</strong></TableCell>
                    <TableCell>{drugInteraction.provenance.method}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

export default PharmGKBCard;


