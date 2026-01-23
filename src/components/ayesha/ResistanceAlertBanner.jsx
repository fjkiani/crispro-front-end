/**
 * Resistance Alert Banner Component (P1.2)
 * 
 * Displays resistance detection alerts from SAE service:
 * - 2-of-3 trigger logic (HRD drop, DNA repair drop, CA-125 inadequate)
 * - Recommended actions (ATR/CHK1 trials, re-biopsy, imaging)
 * - RUO label for research use
 * 
 * Manager Policy: MANAGER_ANSWERS_TO_ZO_SAE_QUESTIONS.md (C1, C3)
 * Owner: Zo
 * Date: January 13, 2025
 */
import React from 'react';
import {
  Alert,
  AlertTitle,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const ResistanceAlertBanner = ({ resistance_alert }) => {
  const [expanded, setExpanded] = React.useState(false);

  // Don't render if no alert or alert not triggered
  if (!resistance_alert || !resistance_alert.alert_triggered) {
    return null;
  }

  const {
    triggers = [],
    recommended_actions = [],
    detection_time,
    confidence,
    mechanism_suspected,
  } = resistance_alert;

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Alert
      severity="warning"
      icon={<WarningIcon />}
      sx={{
        mb: 2,
        border: '2px solid',
        borderColor: 'warning.main',
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <AlertTitle sx={{ mb: 1, fontWeight: 'bold' }}>
          ⚠️ Resistance Signal Detected (SAE)
        </AlertTitle>
        <Chip
          label="RESEARCH USE ONLY"
          size="small"
          color="warning"
          variant="outlined"
        />
      </Box>

      {/* Triggers */}
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Detected Signals ({triggers.length} of 3):</strong>
      </Typography>
      <Box sx={{ mb: 1, pl: 2 }}>
        {triggers.map((trigger, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
            • {trigger}
          </Typography>
        ))}
      </Box>

      {/* Mechanism Suspected (if available) */}
      {mechanism_suspected && (
        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
          <strong>Suspected Mechanism:</strong> {mechanism_suspected}
        </Typography>
      )}

      {/* Expand/Collapse for Recommended Actions */}
      <Box
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          mb: 1,
          '&:hover': {
            opacity: 0.8,
          },
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          Recommended Actions
        </Typography>
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Box>

      <Collapse in={expanded}>
        <List dense sx={{ py: 0 }}>
          {recommended_actions.map((action, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemText
                primary={action}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.secondary',
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Detection Details */}
        {(detection_time || confidence) && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Detection Time: {detection_time || 'N/A'} |
              Confidence: {confidence ? `${(confidence * 100).toFixed(0)}%` : 'N/A'}
            </Typography>
          </Box>
        )}

        {/* Provenance & RUO Disclaimer */}
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Important:</strong> This is a research-grade signal based on SAE (Sparse Autoencoder) analysis.
            Clinical decisions should be made in consultation with the oncology team and confirmed with clinical/imaging evidence.
          </Typography>
        </Box>
      </Collapse>

      {/* Quick Action Hint (Collapsed State) */}
      {!expanded && recommended_actions.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Click to view {recommended_actions.length} recommended action(s)
        </Typography>
      )}
    </Alert>
  );
};

export default ResistanceAlertBanner;







