/**
 * MMResistancePanel - Displays MM Resistance Prediction Results
 *
 * This component is an enhanced version of the generic ResistancePanel,
 * specifically tailored for Multiple Myeloma with per-drug-class risk display,
 * high-risk cytogenetics alerts, mechanism breakdown, and alternative therapies.
 *
 * Uses the /api/resistance/predict endpoint.
 *
 * Created: January 29, 2025 (Work Item 5)
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
import { API_ROOT as API_BASE_URL } from '../../lib/apiConfig';
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
  ArrowForward as ArrowForwardIcon,
  Category as CategoryIcon,
  Dna as DnaIcon,
  Healing as HealingIcon
} from '@mui/icons-material';


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
 * Main MMResistancePanel component
 */
const MMResistancePanel = ({
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
    signals: true,
    mechanisms: false,
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
      console.error('MM Resistance prediction failed:', err);
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
          <Typography>Analyzing MM resistance profile...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>MM Resistance Analysis Failed</AlertTitle>
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
        <AlertTitle>MM Resistance Analysis</AlertTitle>
        Add mutations to analyze Multiple Myeloma resistance profile and get alternative drug recommendations.
      </Alert>
    );
  }

  // No prediction yet
  if (!prediction) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Button variant="outlined" onClick={fetchPrediction}>
            Analyze MM Resistance Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Helper to get drug class specific risk
  const getDrugClassRisk = (targetDrugClass) => {
    const signal = prediction.signals_detected.find(s =>
      s.signal_type === 'MM_DRUG_CLASS_RESISTANCE' &&
      s.provenance?.detected_mutations?.some(m =>
        m.drug_classes_affected?.includes(targetDrugClass) ||
        m.drug_class === targetDrugClass
      )
    );
    return signal && signal.detected ? signal.probability : 0;
  };

  // Helper to get cytogenetics risk
  const getCytogeneticsRisk = () => {
    const signal = prediction.signals_detected.find(s => s.signal_type === 'MM_CYTOGENETICS');
    return signal && signal.detected ? signal.probability : 0;
  };

  // Main render
  return (
    <Card sx={{ mb: 2, border: `2px solid ${RISK_COLORS[prediction.risk_level] || '#ccc'}` }}>
      <CardContent>
        {/* Header with Risk Level */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BiotechIcon />
            Multiple Myeloma Resistance Analysis
          </Typography>
          <Chip
            icon={prediction.risk_level === 'HIGH' ? <WarningIcon /> : prediction.risk_level === 'MEDIUM' ? <InfoIcon /> : <CheckCircleIcon />}
            label={`${prediction.risk_level} RISK (${(prediction.probability * 100).toFixed(0)}%)`}
            sx={{
              backgroundColor: RISK_COLORS[prediction.risk_level] || '#888',
              color: 'white',
              fontWeight: 'bold',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        </Box>

        {/* Warnings */}
        {prediction.warnings && prediction.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }} icon={<InfoIcon />}>
            <AlertTitle>Information / Warnings</AlertTitle>
            {prediction.warnings.map((w, i) => (
              <Typography key={i} variant="body2">{w.replace(/_/g, ' ')}</Typography>
            ))}
          </Alert>
        )}

        {/* Overall Rationale */}
        {prediction.rationale && prediction.rationale.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Overall Rationale:
            </Typography>
            <List dense disablePadding>
              {prediction.rationale.map((item, idx) => (
                <ListItem key={idx} sx={{ py: 0, px: 0 }}>
                  <ListItemText primary={<Typography variant="body2">{item}</Typography>} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Detected Signals Section */}
        <Box
          onClick={() => toggleSection('signals')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            py: 1,
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <DnaIcon />
          <Typography variant="subtitle1" sx={{ ml: 1, flex: 1 }}>
            Detected Resistance Signals
            <Chip size="small" label={prediction.signal_count} sx={{ ml: 1 }} />
          </Typography>
          <IconButton size="small">
            {expanded.signals ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded.signals}>
          <Box sx={{ mb: 3, pl: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {prediction.signals_detected.map((signal, idx) => (
                <Chip
                  key={idx}
                  size="small"
                  variant={signal.detected ? 'filled' : 'outlined'}
                  color={signal.detected ? 'error' : 'default'}
                  icon={signal.detected ? <WarningIcon /> : <CheckCircleIcon />}
                  label={signal.signal_type.replace(/_/g, ' ')}
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        </Collapse>

        <Divider sx={{ my: 2 }} />

        {/* Per-Drug-Class Risk Display */}
        <Box
          onClick={() => toggleSection('drugClassRisk')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            py: 1,
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <CategoryIcon />
          <Typography variant="subtitle1" sx={{ ml: 1, flex: 1 }}>
            Drug Class Specific Risk
          </Typography>
          <IconButton size="small">
            {expanded.drugClassRisk ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded.drugClassRisk}>
          <Box sx={{ mb: 3, pl: 2 }}>
            <Grid container spacing={2}>
              {['proteasome_inhibitor', 'imid', 'anti_cd38'].map(dc => {
                const risk = getDrugClassRisk(dc);
                const riskLevel = risk > 0.7 ? 'HIGH' : risk > 0.3 ? 'MEDIUM' : 'LOW';
                return (
                  <Grid item xs={12} sm={6} md={4} key={dc}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {dc.replace(/_/g, ' ').toUpperCase()}
                      </Typography>
                      <Chip
                        label={`${riskLevel} (${(risk * 100).toFixed(0)}%)`}
                        sx={{
                          backgroundColor: RISK_COLORS[riskLevel] || '#888',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Collapse>

        <Divider sx={{ my: 2 }} />

        {/* Alternative Drugs Section */}
        <Box
          onClick={() => toggleSection('alternatives')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            py: 1,
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <DrugIcon />
          <Typography variant="subtitle1" sx={{ ml: 1, flex: 1 }}>
            Next-Line Therapy Options
            <Chip size="small" label={prediction.next_line_options?.length || 0} sx={{ ml: 1 }} />
          </Typography>
          <IconButton size="small">
            {expanded.alternatives ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded.alternatives}>
          <Box sx={{ mb: 3, pl: 2 }}>
            {prediction.next_line_options && prediction.next_line_options.length > 0 ? (
              <Grid container spacing={2}>
                {prediction.next_line_options.slice(0, 6).map((alt, idx) => (
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
                        {alt.drug_class?.replace(/_/g, ' ') || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                        {alt.rationale}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                No alternative drugs recommended at this time.
              </Typography>
            )}
          </Box>
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

export default MMResistancePanel;
