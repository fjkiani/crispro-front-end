/**
 * DDRTreatmentEligibility Component
 * 
 * PARP inhibitor eligibility indicator based on DDR status.
 */
import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Alert, Button } from '@mui/material';
import { CheckCircle, Cancel, HelpOutline, Launch } from '@mui/icons-material';

const DDRTreatmentEligibility = ({ ddrStatus, onViewTrials }) => {
  if (!ddrStatus) return null;

  const status = ddrStatus.DDR_bin_status;
  const isEligible = status === 'DDR_defective';

  const getEligibilityConfig = () => {
    if (isEligible) {
      return {
        color: 'success',
        icon: <CheckCircle />,
        label: 'PARP INHIBITOR ELIGIBLE',
        severity: 'success',
        message: 'Patient has DDR deficiency and may benefit from PARP inhibitor therapy.',
        actionText: 'View PARP Inhibitor Trials'
      };
    } else if (status === 'DDR_proficient') {
      return {
        color: 'error',
        icon: <Cancel />,
        label: 'PARP INHIBITOR NOT RECOMMENDED',
        severity: 'info',
        message: 'Patient has intact DDR pathways. PARP inhibitors may have limited efficacy.',
        actionText: null
      };
    } else {
      return {
        color: 'default',
        icon: <HelpOutline />,
        label: 'ELIGIBILITY UNKNOWN',
        severity: 'warning',
        message: 'Insufficient data to determine PARP inhibitor eligibility. Additional testing recommended.',
        actionText: null
      };
    }
  };

  const config = getEligibilityConfig();

  return (
    <Card sx={{ mb: 3, border: `2px solid ${isEligible ? '#28a745' : '#6c757d'}`, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box
            sx={{
              bgcolor: isEligible ? '#28a745' : '#6c757d',
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
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
              PARP Inhibitor Eligibility
            </Typography>
            <Chip
              label={config.label}
              color={config.color}
              size="large"
              sx={{ fontWeight: 600, fontSize: '0.9rem', height: 32 }}
            />
          </Box>
        </Box>

        <Alert severity={config.severity} sx={{ mb: 2 }}>
          <Typography variant="body2">{config.message}</Typography>
        </Alert>

        {isEligible && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Rationale:</strong> DDR deficiency creates synthetic lethality with PARP inhibitors, making them an effective treatment option.
            </Typography>
            {onViewTrials && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Launch />}
                onClick={onViewTrials}
                sx={{ mt: 2 }}
              >
                {config.actionText}
              </Button>
            )}
          </Box>
        )}

        {status === 'DDR_proficient' && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Consider alternative targeted therapies based on other genomic alterations (e.g., PI3K, MAPK pathways).
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DDRTreatmentEligibility;
