/**
 * HRDPanel Component
 * 
 * Displays HRD (Homologous Recombination Deficiency) assay information.
 */
import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Alert } from '@mui/material';
import { Science, TrendingUp, HelpOutline } from '@mui/icons-material';

const HRDPanel = ({ ddrStatus }) => {
  if (!ddrStatus) return null;

  const hrdStatus = ddrStatus.HRD_status_inferred;
  const hrdScore = ddrStatus.HRD_score_raw;

  if (hrdStatus === 'unknown' && !hrdScore) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Science color="action" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              HRD Assay Information
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              No HRD assay data available. HRD status was inferred from genomic variants.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getHRDConfig = (status) => {
    switch (status) {
      case 'HRD_positive':
        return {
          color: 'error',
          label: 'HRD Positive',
          severity: 'error',
          description: 'Genomic scar pattern indicates homologous recombination deficiency'
        };
      case 'HRD_negative':
        return {
          color: 'success',
          label: 'HRD Negative',
          severity: 'success',
          description: 'No genomic scar pattern detected'
        };
      default:
        return {
          color: 'default',
          label: 'Unknown',
          severity: 'info',
          description: 'HRD status could not be determined'
        };
    }
  };

  const config = getHRDConfig(hrdStatus);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Science color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            HRD Assay Information
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            HRD Status
          </Typography>
          <Chip
            label={config.label}
            color={config.color}
            size="medium"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {hrdScore !== null && hrdScore !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              HRD Score
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUp color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {hrdScore.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}

        <Alert severity={config.severity}>
          <Typography variant="body2">{config.description}</Typography>
        </Alert>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> HRD status is inferred from genomic data. Clinical HRD assays (e.g., Myriad, FoundationOne) may provide additional validation.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HRDPanel;
