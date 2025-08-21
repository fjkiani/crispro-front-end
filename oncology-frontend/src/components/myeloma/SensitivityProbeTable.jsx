import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

const SensitivityProbeTable = ({ probes = [] }) => {
  if (!Array.isArray(probes) || probes.length === 0) return null;
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell width={60}>Alt</TableCell>
          <TableCell>Δ</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {probes.map((p, i) => (
          <TableRow key={i}>
            <TableCell width={60}>{p.alt}</TableCell>
            <TableCell>{typeof p.delta === 'number' ? p.delta.toFixed(6) : p.delta}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SensitivityProbeTable; 