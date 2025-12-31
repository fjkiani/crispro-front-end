import React from 'react';
import { Alert, AlertTitle, Box, Chip, Stack, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/**
 * GermlineStatusBanner Component (Day 4 - Module M5)
 * 
 * Displays germline status banner for sporadic cancer patients.
 * Critical for Ayesha: Shows when germline testing is negative/unknown.
 * 
 * Props:
 * - germlineStatus: "positive", "negative", "unknown"
 * - onQuickIntake: Callback to open Quick Intake form
 */
export default function GermlineStatusBanner({ germlineStatus = "unknown", onQuickIntake }) {
  if (!germlineStatus || germlineStatus === "positive") {
    // Don't show banner for germline-positive (hereditary) cases
    return null;
  }

  const isNegative = germlineStatus === "negative";
  const isUnknown = germlineStatus === "unknown";

  // Banner configuration
  const config = {
    negative: {
      severity: "info",
      icon: <CheckCircleOutlineIcon />,
      title: "Germline Testing: Negative",
      message: "Your germline (inherited) genetic testing did not show BRCA1/2 or other hereditary mutations.",
      implication: "Analysis will focus on tumor-specific mutations and biomarkers (TMB, MSI, HRD).",
      color: "#1976d2", // Blue
    },
    unknown: {
      severity: "warning",
      icon: <WarningAmberIcon />,
      title: "Germline Status: Unknown",
      message: "Germline testing status is not available.",
      implication: "Recommendations will use conservative estimates. Upload tumor NGS report for better accuracy.",
      color: "#ed6c02", // Orange
    }
  };

  const currentConfig = isNegative ? config.negative : config.unknown;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert 
        severity={currentConfig.severity}
        icon={currentConfig.icon}
        sx={{ 
          backgroundColor: 'rgba(25, 118, 210, 0.05)',
          border: `1px solid ${currentConfig.color}`,
          '& .MuiAlert-icon': {
            color: currentConfig.color
          }
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentConfig.title}
          <Chip 
            label="Sporadic Cancer"
            size="small"
            sx={{ 
              ml: 1,
              backgroundColor: currentConfig.color,
              color: 'white',
              fontWeight: 500
            }}
          />
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          {currentConfig.message}
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          {currentConfig.implication}
        </Typography>

        {/* Quick Intake CTA */}
        {onQuickIntake && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Chip
              icon={<InfoOutlinedIcon />}
              label="Quick Intake (No Report Needed)"
              clickable
              onClick={onQuickIntake}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
            <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
              Get immediate recommendations using disease priors
            </Typography>
          </Stack>
        )}
      </Alert>
      
      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 2, backgroundColor: 'rgba(25, 118, 210, 0.1)', border: '1px solid #1976d2' }}>
        <AlertTitle sx={{ fontWeight: 'bold' }}>Research Use Only (RUO)</AlertTitle>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          Sporadic cancer analysis based on tumor genomics and disease priors. Not validated for clinical decision-making.
          Validated gates: PARP penalty (HRD-based), Immunotherapy boost (TMB/MSI-based), Confidence caps (L0/L1/L2).
        </Typography>
      </Alert>
    </Box>
  );
}



