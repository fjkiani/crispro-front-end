import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export function EvidenceMatrixTable({ matrix }) {
  if (!matrix || !matrix.rows || matrix.rows.length === 0) return null;

  const modalities = [
    { key: 'crispr', label: 'CRISPR' },
    { key: 'expression', label: 'Express' },
    { key: 'prism', label: 'PRISM' },
    { key: 'gdsc', label: 'GDSC' },
    { key: 'in_vitro', label: 'In Vitro' },
    { key: 'in_vivo', label: 'In Vivo' },
    { key: 'clinical', label: 'Clinical' },
  ];

  const getStatusColor = (status) => {
    switch (String(status).toLowerCase()) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'mixed': return '#f59e0b';
      default: return '#cbd5e1';
    }
  };

  const getStatusIcon = (status) => {
    switch (String(status).toLowerCase()) {
      case 'positive': return <CheckCircleIcon fontSize="inherit" sx={{ color: 'white' }} />;
      case 'negative': return <CancelIcon fontSize="inherit" sx={{ color: 'white' }} />;
      case 'mixed': return <ScienceIcon fontSize="inherit" sx={{ color: 'white' }} />;
      default: return <Typography variant="caption" sx={{ color: '#475569', fontWeight: 900, lineHeight: 1 }}>—</Typography>;
    }
  };

  return (
    <Box sx={{ mt: 1, overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <Box component="thead">
          <tr>
            <Box component="th" sx={{ p: 1, textAlign: 'left', borderBottom: '2px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>Axis</Typography>
            </Box>
            {modalities.map((m) => (
              <Box key={m.key} component="th" sx={{ p: 1, textAlign: 'center', borderBottom: '2px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>{m.label}</Typography>
              </Box>
            ))}
          </tr>
        </Box>
        <Box component="tbody">
          {matrix.rows.map((row) => (
            <tr key={row.axis} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <Box component="td" sx={{ p: 1, maxWidth: 120 }}>
                <Tooltip title={row.mechanism} placement="right" arrow>
                  <Typography variant="body2" sx={{ fontWeight: 900, cursor: 'help', display: 'inline-block', borderBottom: '1px dotted #94a3b8' }}>
                    {row.axis_label.split(' (')[0]}
                  </Typography>
                </Tooltip>
              </Box>
              {modalities.map((m) => {
                const cell = row[m.key];
                const status = cell ? cell.status : 'missing';
                const summary = cell && cell.summary ? cell.summary : 'No data evaluated.';
                return (
                  <Box component="td" key={m.key} sx={{ p: 0.5, textAlign: 'center' }}>
                    <Tooltip title={summary} placement="top" arrow>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: getStatusColor(status),
                          cursor: 'help',
                          boxShadow: status !== 'missing' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {getStatusIcon(status)}
                      </Box>
                    </Tooltip>
                  </Box>
                );
              })}
            </tr>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default EvidenceMatrixTable;
