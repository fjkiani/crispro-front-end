/**
 * Drug Interactions Card Component
 * 
 * Displays drug-drug interactions with pathway overlap and severity
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import WarningIcon from '@mui/icons-material/Warning';

export default function DrugInteractionsCard({ drugInteractions }) {
  if (!drugInteractions) {
    return null;
  }

  const interactions = drugInteractions.interactions || [];
  const pathwaysChecked = drugInteractions.pathways_checked || drugInteractions.pathways || [];

  const getSeverityColor = (severity) => {
    const severityUpper = severity?.toUpperCase() || '';
    if (severityUpper.includes('SEVERE') || severityUpper.includes('MAJOR')) return 'error';
    if (severityUpper.includes('MODERATE') || severityUpper.includes('MODERATE')) return 'warning';
    if (severityUpper.includes('MINOR') || severityUpper.includes('MILD')) return 'info';
    return 'default';
  };

  if (interactions.length === 0) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MedicationIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Drug Interactions</Typography>
          </Box>
          <Alert severity="success">
            No significant drug interactions detected in checked pathways.
          </Alert>
          {pathwaysChecked.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Pathways checked: {pathwaysChecked.join(', ')}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MedicationIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Drug Interactions</Typography>
          <Chip
            label={`${interactions.length} interaction${interactions.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ ml: 2 }}
            color="warning"
            variant="outlined"
          />
        </Box>

        {pathwaysChecked.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pathways checked: {pathwaysChecked.join(', ')}
          </Typography>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Drug A</strong></TableCell>
                <TableCell><strong>Drug B</strong></TableCell>
                <TableCell><strong>Pathway</strong></TableCell>
                <TableCell><strong>Severity</strong></TableCell>
                <TableCell><strong>Recommendation</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interactions.map((interaction, idx) => {
                const drugA = interaction.drug_a || interaction.drug1 || 'Unknown';
                const drugB = interaction.drug_b || interaction.drug2 || 'Unknown';
                const pathway = interaction.pathway || interaction.pathway_name || 'Unknown';
                const severity = interaction.severity || interaction.risk_level || 'Unknown';
                const recommendation = interaction.recommendation || interaction.action || 'Monitor';

                return (
                  <TableRow
                    key={idx}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>{drugA}</TableCell>
                    <TableCell>{drugB}</TableCell>
                    <TableCell>
                      <Chip label={pathway} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={severity}
                        size="small"
                        color={getSeverityColor(severity)}
                        icon={<WarningIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {recommendation}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}















