/**
 * DDRMutationSummary Component
 * 
 * Displays a table of mutations that contributed to DDR classification.
 */
import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box } from '@mui/material';
import { Science } from '@mui/icons-material';

const DDRMutationSummary = ({ mutations = [] }) => {
  if (!mutations || mutations.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Science color="action" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mutation Summary
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            No mutations provided for DDR analysis.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getClassificationColor = (classification) => {
    if (classification?.toLowerCase().includes('pathogenic')) return 'error';
    if (classification?.toLowerCase().includes('likely_pathogenic')) return 'warning';
    if (classification?.toLowerCase().includes('vus')) return 'info';
    return 'default';
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Science color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Mutation Summary
          </Typography>
          <Chip label={`${mutations.length} mutation(s)`} size="small" />
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Gene</strong></TableCell>
                <TableCell><strong>Classification</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mutations.map((mutation, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {mutation.gene_symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={mutation.variant_classification || 'N/A'}
                      size="small"
                      color={getClassificationColor(mutation.variant_classification)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {mutation.variant_type || 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default DDRMutationSummary;
