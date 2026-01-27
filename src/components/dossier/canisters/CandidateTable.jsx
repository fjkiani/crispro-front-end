import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

const CandidateTable = ({ candidates }) => {
  return (
    <TableContainer component={Paper} sx={{ background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)', borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Sequence</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Efficacy Score</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Safety Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {candidates.map((candidate, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                  {candidate.sequence}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Chip label={`${(candidate.efficacy_score * 100).toFixed(1)}%`} color="success" variant="outlined" sx={{ mr: 2 }}/>
                  <SparkLineChart data={[0, candidate.efficacy_score * 100]} height={40} width={80} colors={['#4caf50']} />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Chip label={`${(candidate.safety_score * 100).toFixed(1)}%`} color="primary" variant="outlined" sx={{ mr: 2 }}/>
                  <SparkLineChart data={[0, candidate.safety_score * 100]} height={40} width={80} colors={['#2196f3']} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CandidateTable; 