import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import ArticleIcon from '@mui/icons-material/Article';
import MedicationIcon from '@mui/icons-material/Medication';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

// Phase 2: New UI Components
import PercentileBar from '../components/food/PercentileBar';
import EvidenceQualityChips from '../components/food/EvidenceQualityChips';
import MechanismPanel from '../components/food/MechanismPanel';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

export default function DynamicFoodValidator() {
  const [compound, setCompound] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientMedications, setPatientMedications] = useState('');
  const [useEvo2, setUseEvo2] = useState(false);

  const handleValidate = async () => {
    if (!compound.trim()) {
      setError('Please enter a compound name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        compound: compound.trim(),
        disease_context: {
          disease: 'ovarian_cancer_hgs',
          mutations: [{ gene: 'TP53', hgvs_p: 'R248Q' }],
          biomarkers: { HRD: 'POSITIVE', TMB: 8.2 },
          pathways_disrupted: ['DNA repair', 'Cell cycle', 'Angiogenesis']
        },
        treatment_history: {
          current_line: 'L3',
          prior_therapies: ['carboplatin', 'paclitaxel']
        },
        patient_medications: patientMedications
          ? patientMedications.split(',').map(m => m.trim())
          : [],
        use_evo2: useEvo2
      };

      const response = await fetch(`${API_ROOT}/api/hypothesis/validate_food_dynamic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'ERROR') {
        throw new Error(data.error || 'Validation failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'SUPPORTED') return 'success';
    if (verdict === 'WEAK_SUPPORT') return 'warning';
    return 'error';
  };

  const getVerdictIcon = (verdict) => {
    if (verdict === 'SUPPORTED') return <CheckCircleIcon color="success" />;
    if (verdict === 'WEAK_SUPPORT') return <InfoIcon color="warning" />;
    return <CancelIcon color="error" />;
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="primary" fontSize="large" />
          Dynamic Food & Supplement Validator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Works for ANY food or supplement - dynamically extracts targets, pathways, evidence, and provides dietician-grade recommendations.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Research Use Only</strong> - This tool provides evidence-based recommendations but should not replace medical advice.
        </Alert>
      </Box>

      {/* Input Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Food or Supplement Name"
              placeholder="e.g., Resveratrol, Quercetin, Sulforaphane..."
              value={compound}
              onChange={(e) => setCompound(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
              helperText="Enter any compound name - works dynamically for all foods/supplements"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Medications (optional)"
              placeholder="e.g., warfarin, metformin (comma-separated)"
              value={patientMedications}
              onChange={(e) => setPatientMedications(e.target.value)}
              helperText="Check for drug interactions"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              onClick={handleValidate}
              disabled={loading || !compound.trim()}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Validating...' : 'Validate Compound'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Section */}
      {result && result.status === 'SUCCESS' && (
        <Box>
          {/* Main Verdict Card */}
          <Card sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              {getVerdictIcon(result.verdict)}
              <Typography variant="h5">
                {result.compound} - {result.verdict}
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h4">{(result.overall_score * 100).toFixed(1)}%</Typography>
                  <Typography variant="caption">Overall Score</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <Typography variant="h4">{(result.confidence * 100).toFixed(1)}%</Typography>
                  <Typography variant="caption">Confidence</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${getVerdictColor(result.verdict)}.light` }}>
                  <Typography variant="h6">{result.verdict.replace('_', ' ')}</Typography>
                  <Typography variant="caption">Recommendation</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Card>

          {/* PHASE 2: Calibrated Percentile Display */}
          {result.spe_percentile !== null && result.spe_percentile !== undefined && (
            <Box sx={{ mb: 3 }}>
              <PercentileBar
                spePercentile={result.spe_percentile}
                interpretation={result.interpretation}
                rawScore={result.overall_score}
                showRawScore={true}
              />
            </Box>
          )}

          {/* S/P/E Breakdown (Legacy - Keep for reference) */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              S/P/E Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Sequence (S)</Typography>
                  <Typography variant="h5">{(result.spe_breakdown?.sequence * 100).toFixed(0)}%</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {useEvo2 ? 'Evo2 plausibility' : 'Neutral (Phase 1)'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Pathway (P)</Typography>
                  <Typography variant="h5">{(result.spe_breakdown?.pathway * 100).toFixed(0)}%</Typography>
                  <Typography variant="caption" color="text.secondary">Target-pathway alignment</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Evidence (E)</Typography>
                  <Typography variant="h5">{(result.spe_breakdown?.evidence * 100).toFixed(0)}%</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {result.evidence?.evidence_grade || 'INSUFFICIENT'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* PHASE 2: Evidence Quality Indicators */}
          {result.evidence && result.evidence.papers && result.evidence.papers.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <EvidenceQualityChips
                papers={result.evidence.papers}
                evidenceGrade={result.evidence.evidence_grade}
                totalPapers={result.evidence.total_papers || result.evidence.papers.length}
                rctCount={result.evidence.rct_count || 0}
              />
            </Box>
          )}

          {/* PHASE 2: Mechanism Panel (Enhanced) */}
          {(result.targets || result.pathways || result.mechanisms) && (
            <Box sx={{ mb: 3 }}>
              <MechanismPanel
                targets={result.targets || []}
                pathways={result.pathways || []}
                mechanisms={result.mechanisms || []}
                mechanismScores={result.mechanism_scores || {}}
                tcgaWeights={result.provenance?.tcga_weights?.pathway_weights || result.provenance?.tcga_weights?.pathways || {}}
                disease={result.provenance?.disease_name || result.provenance?.disease || ''}
              />
            </Box>
          )}

          {/* Legacy Targets & Pathways (Fallback - only show if MechanismPanel not available) */}
          {(!result.targets || result.targets.length === 0) && 
           (!result.pathways || result.pathways.length === 0) && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Molecular Targets & Pathways
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No molecular targets or pathways identified for this compound.
              </Typography>
            </Card>
          )}

          {/* Treatment Line Intelligence (SAE) */}
          {result.sae_features && Object.keys(result.sae_features).length > 0 && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Treatment Line Intelligence
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Line Appropriateness
                    </Typography>
                    <Typography variant="h5">
                      {(result.sae_features.line_appropriateness * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      How appropriate for current treatment line
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cross-Resistance Risk
                    </Typography>
                    <Typography variant="h5">
                      {(result.sae_features.cross_resistance * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Risk of interfering with therapies
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sequencing Fitness
                    </Typography>
                    <Typography variant="h5">
                      {(result.sae_features.sequencing_fitness * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fit for sequencing with other treatments
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          )}

          {/* Evidence Section */}
          {result.evidence && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Evidence Summary
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip
                  label={`Grade: ${result.evidence.evidence_grade}`}
                  color={result.evidence.evidence_grade === 'STRONG' ? 'success' : 'default'}
                />
                <Chip label={`${result.evidence.total_papers || 0} Papers`} />
                {result.evidence.rct_count > 0 && (
                  <Chip label={`${result.evidence.rct_count} RCTs`} color="primary" />
                )}
              </Stack>

              {result.evidence.papers && result.evidence.papers.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Top Papers ({result.evidence.papers.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {result.evidence.papers.slice(0, 5).map((paper, i) => (
                        <ListItem key={i}>
                          <ListItemIcon>
                            <ArticleIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {paper.title}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  PMID: {paper.pmid}
                                </Typography>
                                {paper.abstract && (
                                  <Typography variant="caption" color="text.secondary">
                                    {paper.abstract.slice(0, 200)}...
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                            target="_blank"
                          >
                            View
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
            </Card>
          )}

          {/* Dietician Recommendations */}
          {result.dietician_recommendations && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospitalIcon color="primary" />
                Dietician Recommendations
              </Typography>

              <Grid container spacing={2}>
                {/* Dosage */}
                {result.dietician_recommendations.dosage && (
                  <Grid item xs={12} md={6}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MedicationIcon color="primary" />
                          <Typography variant="subtitle2">Dosage & Administration</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2">
                          <strong>Recommended:</strong>{' '}
                          {result.dietician_recommendations.dosage.recommended_dose || 'As directed'}
                        </Typography>
                        {result.dietician_recommendations.dosage.target_level && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Target Level:</strong>{' '}
                            {result.dietician_recommendations.dosage.target_level}
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

                {/* Timing */}
                {result.dietician_recommendations.timing && (
                  <Grid item xs={12} md={6}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon color="primary" />
                          <Typography variant="subtitle2">Timing & Administration</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2">
                          <strong>Best Time:</strong>{' '}
                          {result.dietician_recommendations.timing.best_time || 'As directed'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>With Food:</strong>{' '}
                          {result.dietician_recommendations.timing.with_food ? 'Yes' : 'No'}
                        </Typography>
                        {result.dietician_recommendations.timing.timing_rationale && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {result.dietician_recommendations.timing.timing_rationale}
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

                {/* Interactions */}
                {result.dietician_recommendations.interactions && (
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon color={result.dietician_recommendations.interactions.safe ? 'success' : 'warning'} />
                          <Typography variant="subtitle2">
                            Drug Interactions
                            {!result.dietician_recommendations.interactions.safe && ' ⚠️'}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {result.dietician_recommendations.interactions.interactions?.length > 0 ? (
                          <List>
                            {result.dietician_recommendations.interactions.interactions.map((interaction, i) => (
                              <ListItem key={i}>
                                <ListItemIcon>
                                  <WarningIcon color="warning" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${interaction.drug} + ${interaction.compound}`}
                                  secondary={
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">
                                        Severity: {interaction.severity}
                                      </Typography>
                                      <Typography variant="caption" display="block">
                                        {interaction.action}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="success.main">
                            ✅ No known interactions detected
                          </Typography>
                        )}
                        {result.dietician_recommendations.interactions.warnings?.length > 0 && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            {result.dietician_recommendations.interactions.warnings.map((w, i) => (
                              <Typography key={i} variant="body2">
                                {w}
                              </Typography>
                            ))}
                          </Alert>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

                {/* Safety */}
                {result.dietician_recommendations.safety && (
                  <Grid item xs={12} md={6}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">Safety Information</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {result.dietician_recommendations.safety.max_dose && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Max Dose:</strong> {result.dietician_recommendations.safety.max_dose}
                          </Typography>
                        )}
                        {result.dietician_recommendations.safety.contraindications?.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" color="error" gutterBottom>
                              Contraindications:
                            </Typography>
                            <List dense>
                              {result.dietician_recommendations.safety.contraindications.map((contra, i) => (
                                <ListItem key={i}>
                                  <ListItemText primary={contra} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

                {/* Monitoring */}
                {result.dietician_recommendations.monitoring && (
                  <Grid item xs={12} md={6}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MonitorHeartIcon color="primary" />
                          <Typography variant="subtitle2">Lab Monitoring</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {result.dietician_recommendations.monitoring.labs_to_monitor?.length > 0 ? (
                          <List>
                            {result.dietician_recommendations.monitoring.labs_to_monitor.map((lab, i) => (
                              <ListItem key={i}>
                                <ListItemText
                                  primary={lab.lab}
                                  secondary={
                                    <Box>
                                      <Typography variant="caption">
                                        Frequency: {lab.frequency}
                                      </Typography>
                                      {lab.target && (
                                        <Typography variant="caption" display="block">
                                          Target: {lab.target}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No specific monitoring required
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

                {/* Meal Planning */}
                {result.dietician_recommendations.meal_planning && (
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <RestaurantIcon color="primary" />
                          <Typography variant="subtitle2">Meal Planning</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {result.dietician_recommendations.meal_planning.food_sources?.length > 0 && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                Food Sources:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {result.dietician_recommendations.meal_planning.food_sources.map((food, i) => (
                                  <Chip key={i} label={food} size="small" />
                                ))}
                              </Box>
                            </Grid>
                          )}
                          {result.dietician_recommendations.meal_planning.combine_with?.length > 0 && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                Combine With:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {result.dietician_recommendations.meal_planning.combine_with.map((food, i) => (
                                  <Chip key={i} label={food} size="small" color="success" variant="outlined" />
                                ))}
                              </Box>
                            </Grid>
                          )}
                          {result.dietician_recommendations.meal_planning.avoid_with?.length > 0 && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="error" gutterBottom>
                                Avoid With:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {result.dietician_recommendations.meal_planning.avoid_with.map((food, i) => (
                                  <Chip key={i} label={food} size="small" color="error" variant="outlined" />
                                ))}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
              </Grid>

              {/* Patient Instructions */}
              {result.dietician_recommendations.patient_instructions && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Patient Instructions:
                  </Typography>
                  <Typography variant="body2">
                    {result.dietician_recommendations.patient_instructions}
                  </Typography>
                </Alert>
              )}
            </Card>
          )}

          {/* Provenance */}
          {result.provenance && (
            <Card sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary">
                Run ID: {result.provenance.run_id} | Method: {result.provenance.method} | 
                Sources: {result.provenance.sources?.join(', ')}
              </Typography>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}

