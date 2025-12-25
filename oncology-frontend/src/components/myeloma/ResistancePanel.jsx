/**
 * ResistancePanel - Displays MM Resistance Prediction Results
 * 
 * Shows:
 * - Detected resistance genes (DIS3, TP53)
 * - Cytogenetic abnormalities (del(17p), t(4;14), 1q gain)
 * - Risk level with visual indicator
 * - Alternative drug recommendations
 * - Suggested regimen changes
 * - Monitoring schedule updates
 * - Escalation triggers
 * 
 * Uses shared /api/resistance/predict endpoint
 * 
 * Created: January 28, 2025
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  Collapse,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
  Paper,
  Grid
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalHospital as DrugIcon,
  Timeline as TimelineIcon,
  MonitorHeart as MonitorIcon,
  Science as ScienceIcon,
  Biotech as BiotechIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

// Risk level colors
const RISK_COLORS = {
  HIGH: '#d32f2f',
  MEDIUM: '#ed6c02',
  LOW: '#2e7d32'
};

// Evidence level badges
const EVIDENCE_BADGES = {
  VALIDATED: { label: 'Validated', color: 'success' },
  TREND: { label: 'Trend', color: 'warning' },
  CLINICAL_TRIAL: { label: 'Clinical Trial', color: 'info' },
  STANDARD_OF_CARE: { label: 'Standard of Care', color: 'success' },
  LITERATURE_BASED: { label: 'Literature', color: 'default' },
  LOW_EVIDENCE: { label: 'Low Evidence', color: 'warning' },
  EXPERT_OPINION: { label: 'Expert Opinion', color: 'default' }
};

/**
 * Main ResistancePanel component
 */
const ResistancePanel = ({
  mutations = [],
  disease = 'myeloma',
  drugClass = null,
  treatmentLine = 1,
  priorTherapies = null,
  cytogenetics = null,
  patientId = null,
  currentRegimen = null,
  autoFetch = true,
  onPredictionComplete = null
}) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({
    alternatives: true,
    monitoring: false,
    triggers: false
  });

  // Fetch resistance prediction
  const fetchPrediction = useCallback(async () => {
    if (!mutations || mutations.length === 0) {
      setPrediction(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resistance/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease,
          mutations: mutations.map(m => ({
            gene: m.gene || '',
            hgvs_p: m.hgvs_p || '',
            consequence: m.consequence || ''
          })),
          patient_id: patientId,
          current_drug_class: drugClass,
          current_regimen: currentRegimen,
          treatment_line: treatmentLine,
          prior_therapies: priorTherapies,
          cytogenetics
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data);

      if (onPredictionComplete) {
        onPredictionComplete(data);
      }
    } catch (err) {
      console.error('Resistance prediction failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mutations, disease, drugClass, treatmentLine, priorTherapies, cytogenetics, patientId, currentRegimen, onPredictionComplete]);

  // Auto-fetch on mount and when inputs change
  useEffect(() => {
    if (autoFetch) {
      fetchPrediction();
    }
  }, [autoFetch, fetchPrediction]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Loading state
  if (loading) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Analyzing resistance profile...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Resistance Analysis Failed</AlertTitle>
        {error}
        <Button size="small" onClick={fetchPrediction} sx={{ mt: 1 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  // No mutations
  if (!mutations || mutations.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Resistance Analysis</AlertTitle>
        Add mutations to analyze resistance profile and get alternative drug recommendations.
      </Alert>
    );
  }

  // No prediction yet
  if (!prediction) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Button variant="outlined" onClick={fetchPrediction}>
            Analyze Resistance Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <Card sx={{ mb: 2, border: `2px solid ${RISK_COLORS[prediction.risk_level] || '#ccc'}` }}>
      <CardContent>
        {/* Header with Risk Level */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BiotechIcon />
            Resistance Analysis
          </Typography>
          <RiskBadge riskLevel={prediction.risk_level} probability={prediction.probability} />
        </Box>

        {/* Warnings */}
        {prediction.warnings && prediction.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }} icon={<InfoIcon />}>
            {prediction.warnings.map((w, i) => (
              <Typography key={i} variant="body2">{w.replace(/_/g, ' ')}</Typography>
            ))}
          </Alert>
        )}

        {/* Detected Signals */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Detected Resistance Signals ({prediction.signal_count})
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {prediction.signals_detected.map((signal, idx) => (
              <SignalChip key={idx} signal={signal} />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Alternative Drugs Section */}
        <SectionHeader
          title="Alternative Drugs"
          icon={<DrugIcon />}
          count={prediction.alternatives?.length || 0}
          expanded={expanded.alternatives}
          onToggle={() => toggleSection('alternatives')}
        />
        <Collapse in={expanded.alternatives}>
          <AlternativesList alternatives={prediction.alternatives} />
        </Collapse>

        {/* Regimen Changes */}
        {prediction.regimen_changes && prediction.regimen_changes.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Suggested Regimen Changes
            </Typography>
            <Stack spacing={1}>
              {prediction.regimen_changes.map((change, idx) => (
                <RegimenChangeCard key={idx} change={change} />
              ))}
            </Stack>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Monitoring Section */}
        <SectionHeader
          title="Monitoring Updates"
          icon={<MonitorIcon />}
          expanded={expanded.monitoring}
          onToggle={() => toggleSection('monitoring')}
        />
        <Collapse in={expanded.monitoring}>
          <MonitoringPanel monitoring={prediction.monitoring_changes} />
        </Collapse>

        <Divider sx={{ my: 2 }} />

        {/* Escalation Triggers */}
        <SectionHeader
          title="Escalation Triggers"
          icon={<WarningIcon />}
          count={prediction.escalation_triggers?.length || 0}
          expanded={expanded.triggers}
          onToggle={() => toggleSection('triggers')}
        />
        <Collapse in={expanded.triggers}>
          <EscalationTriggersList triggers={prediction.escalation_triggers} />
        </Collapse>

        {/* Provenance */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #ccc' }}>
          <Typography variant="caption" color="text.secondary">
            Model: {prediction.provenance?.model_version || 'N/A'} •
            Treatment Line: {prediction.provenance?.treatment_line || 1} •
            Confidence: {(prediction.confidence * 100).toFixed(0)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Risk level badge with probability
 */
const RiskBadge = ({ riskLevel, probability }) => {
  const color = RISK_COLORS[riskLevel] || '#888';
  const icon = riskLevel === 'HIGH' ? <WarningIcon /> :
               riskLevel === 'MEDIUM' ? <InfoIcon /> :
               <CheckCircleIcon />;

  return (
    <Chip
      icon={icon}
      label={`${riskLevel} RISK (${(probability * 100).toFixed(0)}%)`}
      sx={{
        backgroundColor: color,
        color: 'white',
        fontWeight: 'bold',
        '& .MuiChip-icon': { color: 'white' }
      }}
    />
  );
};

/**
 * Signal chip for detected resistance mechanisms
 */
const SignalChip = ({ signal }) => {
  const isDetected = signal.detected;
  const color = isDetected ? 'error' : 'default';
  const variant = isDetected ? 'filled' : 'outlined';

  return (
    <Tooltip title={signal.rationale}>
      <Chip
        size="small"
        variant={variant}
        color={color}
        icon={isDetected ? <WarningIcon /> : <CheckCircleIcon />}
        label={signal.signal_type.replace(/_/g, ' ')}
        sx={{ mb: 0.5 }}
      />
    </Tooltip>
  );
};

/**
 * Collapsible section header
 */
const SectionHeader = ({ title, icon, count, expanded, onToggle }) => (
  <Box
    onClick={onToggle}
    sx={{
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      py: 1,
      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
    }}
  >
    {icon}
    <Typography variant="subtitle1" sx={{ ml: 1, flex: 1 }}>
      {title}
      {count !== undefined && (
        <Chip size="small" label={count} sx={{ ml: 1 }} />
      )}
    </Typography>
    <IconButton size="small">
      {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </IconButton>
  </Box>
);

/**
 * Alternative drugs list
 */
const AlternativesList = ({ alternatives = [] }) => {
  if (!alternatives || alternatives.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
        No alternative drugs recommended at this time.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2} sx={{ pl: 2, pr: 2 }}>
      {alternatives.slice(0, 6).map((alt, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {alt.drug}
              </Typography>
              {EVIDENCE_BADGES[alt.evidence_level] && (
                <Chip
                  size="small"
                  label={EVIDENCE_BADGES[alt.evidence_level].label}
                  color={EVIDENCE_BADGES[alt.evidence_level].color}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block">
              {alt.drug_class.replace(/_/g, ' ')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
              {alt.rationale}
            </Typography>
            {alt.requires && alt.requires.length > 0 && (
              <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                Requires: {alt.requires.join(', ')}
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Regimen change card
 */
const RegimenChangeCard = ({ change }) => (
  <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Chip label={change.from_regimen} variant="outlined" />
    <ArrowForwardIcon color="primary" />
    <Chip label={change.to_regimen} color="primary" />
    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
      {change.rationale}
    </Typography>
  </Paper>
);

/**
 * Monitoring panel
 */
const MonitoringPanel = ({ monitoring }) => {
  if (!monitoring) return null;

  const items = [
    { label: 'MRD Frequency', value: monitoring.mrd_frequency },
    { label: 'ctDNA Targets', value: monitoring.ctdna_targets?.join(', ') },
    { label: 'Imaging', value: monitoring.imaging_frequency },
    { label: 'Biomarkers', value: monitoring.biomarker_frequency },
    { label: 'Bone Marrow', value: monitoring.bone_marrow_frequency }
  ].filter(item => item.value);

  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
        No specific monitoring changes recommended.
      </Typography>
    );
  }

  return (
    <List dense sx={{ pl: 2 }}>
      {items.map((item, idx) => (
        <ListItem key={idx}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <TimelineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            secondary={item.value}
          />
        </ListItem>
      ))}
    </List>
  );
};

/**
 * Escalation triggers list
 */
const EscalationTriggersList = ({ triggers = [] }) => {
  if (!triggers || triggers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
        No escalation triggers defined.
      </Typography>
    );
  }

  return (
    <List dense sx={{ pl: 2 }}>
      {triggers.map((trigger, idx) => (
        <ListItem key={idx}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <WarningIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText primary={trigger} />
        </ListItem>
      ))}
    </List>
  );
};

export default ResistancePanel;

