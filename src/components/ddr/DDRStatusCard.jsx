/**
 * DDRStatusCard Component
 * 
 * Primary status badge displaying DDR_bin classification.
 * Shows: DDR_defective (red), DDR_proficient (green), or unknown (gray)
 */
import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Alert } from '@mui/material';
import { Warning, CheckCircle, HelpOutline } from '@mui/icons-material';

const DDRStatusCard = ({ ddrStatus }) => {
  if (!ddrStatus) return null;

  const status = ddrStatus.DDR_bin_status;
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'DDR_defective':
        return {
          color: 'error',
          bgColor: '#dc3545',
          label: 'DDR Defective',
          icon: <Warning />,
          severity: 'error',
          description: 'Patient has DNA damage repair deficiency. May be eligible for PARP inhibitors.'
        };
      case 'DDR_proficient':
        return {
          color: 'success',
          bgColor: '#28a745',
          label: 'DDR Proficient',
          icon: <CheckCircle />,
          severity: 'success',
          description: 'Patient has intact DNA damage repair pathways.'
        };
      case 'unknown':
      default:
        return {
          color: 'default',
          bgColor: '#6c757d',
          label: 'Unknown',
          icon: <HelpOutline />,
          severity: 'info',
          description: 'Insufficient data to determine DDR status. Additional genomic testing may be needed.'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Card sx={{ mb: 3, border: `2px solid ${config.bgColor}`, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box
            sx={{
              bgcolor: config.bgColor,
              color: 'white',
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {config.icon}
          </Box>
          <Box flex={1}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
              DDR Status
            </Typography>
            <Chip
              label={config.label}
              color={config.color}
              size="large"
              sx={{ fontWeight: 600, fontSize: '1rem', height: 32 }}
            />
          </Box>
        </Box>

        <Alert severity={config.severity} sx={{ mb: 2 }}>
          <Typography variant="body2">{config.description}</Typography>
        </Alert>

        {ddrStatus.DDR_score !== undefined && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              DDR Score: <strong>{ddrStatus.DDR_score.toFixed(3)}</strong>
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DDRStatusCard;
