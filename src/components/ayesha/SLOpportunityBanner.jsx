/**
 * SLOpportunityBanner Component
 * 
 * Prominent alert banner displayed when synthetic lethality opportunities are detected.
 * Shows suggested therapy (e.g., Olaparib) and double-hit description.
 * 
 * Props:
 * - slDetected: boolean
 * - suggestedTherapy: string (e.g., "Olaparib")
 * - doubleHitDescription: string (e.g., "BER + checkpoint loss")
 * - confidence: number (0.0 - 1.0)
 * - onViewDetails: function (optional callback)
 */
import React from 'react';
import {
  Alert,
  AlertTitle,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Psychology, ArrowForward } from '@mui/icons-material';

const SLOpportunityBanner = ({
  slDetected = false,
  suggestedTherapy = null,
  doubleHitDescription = null,
  confidence = null,
  onViewDetails = null,
}) => {
  if (!slDetected) {
    return null;
  }

  const confidencePercent = confidence ? (confidence * 100).toFixed(0) : null;
  const confidenceColor = confidence && confidence >= 0.7 ? 'success' : confidence && confidence >= 0.5 ? 'warning' : 'default';

  return (
    <Alert
      severity="info"
      icon={<Psychology />}
      sx={{
        mb: 3,
        borderRadius: 2,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
      action={
        onViewDetails && (
          <Button
            color="inherit"
            size="small"
            onClick={onViewDetails}
            endIcon={<ArrowForward sx={{ display: { xs: 'none', sm: 'block' } }} />}
            sx={{ 
              ml: { xs: 1, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'block', sm: 'block' } }}>
              View Details
            </Box>
          </Button>
        )
      }
    >
      <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
        Synthetic Lethality Opportunity Detected
      </AlertTitle>
      
      <Box>
        {suggestedTherapy && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body1" component="span" fontWeight={600}>
              Suggested Therapy:
            </Typography>
            <Chip
              label={suggestedTherapy}
              color="primary"
              size="medium"
              sx={{ fontWeight: 600 }}
            />
            {confidencePercent && (
              <Chip
                label={`${confidencePercent}% confidence`}
                size="small"
                color={confidenceColor}
                variant="outlined"
              />
            )}
          </Box>
        )}

        {doubleHitDescription && (
          <Typography variant="body2" color="text.secondary">
            <strong>Mechanism:</strong> {doubleHitDescription}
            {suggestedTherapy && ` → ${suggestedTherapy} candidate`}
          </Typography>
        )}

        {!doubleHitDescription && suggestedTherapy && (
          <Typography variant="body2" color="text.secondary">
            Your genetic profile creates a therapeutic vulnerability that can be targeted with {suggestedTherapy}.
          </Typography>
        )}
      </Box>
    </Alert>
  );
};

export default SLOpportunityBanner;
