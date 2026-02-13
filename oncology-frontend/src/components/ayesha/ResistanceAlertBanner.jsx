/**
 * Resistance Alert Banner Component (CIC v1)
 * 
 * Displays resistance detection alerts from SAE service:
 * - 2-of-3 trigger logic (HRD drop, DNA repair drop, CA-125 inadequate)
 * - HR Restoration patterns (Immediate Alert)
 * - Honest UI: Explicitly handles missing baselines/inputs
 * 
 * Manager Policy: MANAGER_ANSWERS_TO_ZO_SAE_QUESTIONS.md (C1, C3, C7)
 * Owner: Zo
 * Date: February 10, 2026 (CIC v1 Update)
 */
import React, { useEffect } from 'react';
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
import { ResistanceAlertSchema } from '../../schemas/cic_v1';

const ResistanceAlertBanner = ({ resistance_alert }) => {
  const [expanded, setExpanded] = React.useState(false);

  // Runtime Validation
  useEffect(() => {
    if (resistance_alert) {
      const result = ResistanceAlertSchema.safeParse(resistance_alert);
      if (!result.success) {
        console.warn('❌ ResistanceAlertBanner: CIC v1 Contract Violation', result.error);
      }
    }
  }, [resistance_alert]);

  // CIC v1: Check status instead of boolean flags
  if (!resistance_alert || resistance_alert.status === 'clear' || resistance_alert.status === 'awaiting_ngs') {
    return null;
  }

  // Extract signals and metadata
  const {
    status,
    rule,
    signals = [],
    provenance = {}
  } = resistance_alert;

  // Identify met signals and missing inputs
  const metSignals = signals.filter(s => s.met === true);
  const unknownSignals = signals.filter(s => s.met === null);

  // If we are awaiting baseline but have no active alerts, show a different message
  if (status === 'awaiting_baseline' && metSignals.length === 0) {
    return (
      <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
        <AlertTitle>Resistance Monitoring: Awaiting Baselines</AlertTitle>
        <Typography variant="caption">
          Cannot fully evaluate resistance risk due to missing baseline data:
          {unknownSignals.map(s => ` ${s.name} (${s.missing_inputs.join(', ')})`).join('; ')}
        </Typography>
      </Alert>
    );
  }

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Determine title based on rule
  const title = rule === 'hr_restoration_pattern'
    ? '🚨 CRITICAL: HR Restoration Pattern Detected'
    : '⚠️ Resistance Signal Detected (SAE)';

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
          {title}
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
        <strong>Detected Signals ({metSignals.length} active):</strong>
      </Typography>
      <Box sx={{ mb: 1, pl: 2 }}>
        {metSignals.map((signal, index) => (
          <Box key={index} mb={0.5}>
            <Typography variant="body2" fontWeight="medium">
              • {signal.name.replace(/_/g, ' ').toUpperCase()}
            </Typography>
            {signal.details?.message && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 2 }}>
                {signal.details.message}
              </Typography>
            )}
          </Box>
        ))}
        {unknownSignals.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            <em>* {unknownSignals.length} signals evaluating (awaiting data)</em>
          </Typography>
        )}
      </Box>

      {/* Expand/Collapse for Policy Details */}
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
          Policy & Provenance
        </Typography>
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Box>

      <Collapse in={expanded}>
        {/* Detection Details */}
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Detection Method: {rule === 'hr_restoration_pattern' ? 'HR Restoration Logic (R2)' : '2-of-3 Trigger Rule (C7)'}
            <br />
            Policy: {provenance.policy || 'Manager C7 + CIC v1'}
            <br />
            Timestamp: {provenance.timestamp || 'N/A'}
          </Typography>
        </Box>

        {/* RUO Disclaimer */}
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Important:</strong> This is a research-grade signal based on SAE (Sparse Autoencoder) analysis.
            Clinical decisions should be made in consultation with the oncology team.
          </Typography>
        </Box>
      </Collapse>
    </Alert>
  );
};

export default ResistanceAlertBanner;







