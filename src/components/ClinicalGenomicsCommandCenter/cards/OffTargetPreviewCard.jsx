import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

export const OffTargetPreviewCard = ({ result, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Off-Target Preview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Analyzing guide RNAs...</Typography>
        </Box>
      </Paper>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Off-Target Preview
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }
  
  // No result state
  if (!result || !result.guides || result.guides.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Off-Target Preview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No guide RNAs available for off-target preview. 
          Generate guides from the CRISPR Co-Pilot tab first.
        </Typography>
      </Paper>
    );
  }
  
  const { guides, summary } = result;
  
  // Color coding for safety score
  const getSafetyColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.5) return 'warning';
    return 'error';
  };
  
  const getSafetyIcon = (score) => {
    if (score >= 0.8) return <CheckCircleIcon fontSize="small" />;
    if (score >= 0.5) return <WarningIcon fontSize="small" />;
    return <ErrorIcon fontSize="small" />;
  };
  
  const getSafetyLabel = (score) => {
    if (score >= 0.8) return 'Safe';
    if (score >= 0.5) return 'Moderate';
    return 'Risky';
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Off-Target Preview (Heuristic)
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Preliminary assessment of CRISPR guide RNA specificity using GC content and homopolymer detection
      </Typography>
      
      {/* Summary Stats */}
      {summary && (
        <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Summary:</strong> {guides.length} guide(s) analyzed • 
            Average GC: {(summary.avg_gc * 100).toFixed(1)}% • 
            Guides with homopolymers: {summary.homopolymer_count || 0}
          </Typography>
        </Box>
      )}
      
      {/* Guide Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Guide Sequence</TableCell>
              <TableCell align="center">GC%</TableCell>
              <TableCell align="center">Homopolymer</TableCell>
              <TableCell align="center">Safety Score</TableCell>
              <TableCell align="center">Assessment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guides.map((guide, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontFamily="monospace"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {guide.seq}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={`${(guide.gc * 100).toFixed(0)}%`}
                    size="small"
                    variant="outlined"
                    color={guide.gc >= 0.4 && guide.gc <= 0.7 ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={guide.homopolymer ? 'Yes' : 'No'}
                    size="small"
                    color={guide.homopolymer ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ minWidth: 80 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ minWidth: 32 }}>
                        {(guide.heuristic_score * 100).toFixed(0)}%
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={guide.heuristic_score * 100}
                          color={getSafetyColor(guide.heuristic_score)}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={getSafetyLabel(guide.heuristic_score)}
                    size="small"
                    color={getSafetyColor(guide.heuristic_score)}
                    icon={getSafetyIcon(guide.heuristic_score)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Method Explanation */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="caption">
          <strong>Heuristic Method:</strong> Safety score based on GC content (40-70% ideal) and 
          absence of homopolymers (4+ repeats). For production use, run full genome alignment 
          with BLAST/minimap2 against GRCh38.
        </Typography>
      </Alert>
      
      {/* RUO Disclaimer */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        ⚠️ Research Use Only - Heuristic preview not validated for clinical CRISPR design
      </Typography>
    </Paper>
  );
};
