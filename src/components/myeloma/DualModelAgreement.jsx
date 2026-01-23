import React from 'react';
import { Box, Typography, LinearProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from '@mui/material';
import { CheckCircle, Cancel, Help } from '@mui/icons-material';

const DualModelAgreement = ({ data }) => {
  if (!data || !data.alt_model || data.agree_rate === undefined) {
    return null;
  }

  const { alt_model, agree_rate, detailed } = data;
  const agreementPercentage = (agree_rate * 100).toFixed(1);
  
  // Find disagreements
  const disagreements = detailed.filter(variant => 
    variant.alt_call && variant.calculated_impact_level !== variant.alt_call
  );

  const getCallIcon = (call) => {
    switch (call) {
      case 'Likely Disruptive': return <Cancel color="error" fontSize="small" />;
      case 'Likely Neutral': return <CheckCircle color="success" fontSize="small" />;
      default: return <Help color="warning" fontSize="small" />;
    }
  };

  const getCallChip = (call) => {
    const color = call === 'Likely Disruptive' ? 'error' : 
                  call === 'Likely Neutral' ? 'success' : 'warning';
    return <Chip label={call} color={color} size="small" />;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Dual Model Agreement
      </Typography>
      
      <Alert severity={agree_rate >= 0.8 ? 'success' : agree_rate >= 0.6 ? 'warning' : 'error'} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">
            <strong>{agreementPercentage}% agreement</strong> between primary model and {alt_model}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={agree_rate * 100} 
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
            color={agree_rate >= 0.8 ? 'success' : agree_rate >= 0.6 ? 'warning' : 'error'}
          />
        </Box>
      </Alert>

      {disagreements.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="error">
            Disagreements ({disagreements.length} variants)
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Variant</TableCell>
                  <TableCell>Primary Call</TableCell>
                  <TableCell>Alt Call</TableCell>
                  <TableCell>Zeta Score</TableCell>
                  <TableCell>Alt Zeta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disagreements.map((variant, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Typography variant="caption" component="div">
                        {variant.gene || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {variant.variant_info}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCallIcon(variant.calculated_impact_level)}
                        {getCallChip(variant.calculated_impact_level)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCallIcon(variant.alt_call)}
                        {getCallChip(variant.alt_call)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {variant.zeta_score?.toFixed(1) || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {variant.alt_zeta?.toFixed(1) || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default DualModelAgreement; 