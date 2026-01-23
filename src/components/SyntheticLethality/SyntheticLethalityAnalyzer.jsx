/**
 * SyntheticLethalityAnalyzer
 * 
 * Main page for synthetic lethality analysis.
 * Allows clinicians to:
 * 1. Input patient mutations
 * 2. Select disease context
 * 3. Run synthetic lethality analysis
 * 4. View essentiality scores, pathway dependencies, and drug recommendations
 * 5. Generate clinical dossier
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Science,
  PlayArrow,
  Refresh,
  Description,
  Psychology,
  Biotech
} from '@mui/icons-material';

// Import components
import EssentialityScoreCard from './components/EssentialityScoreCard';
import PathwayDependencyDiagram from './components/PathwayDependencyDiagram';
import TherapyRecommendationList from './components/TherapyRecommendationList';
import MutationInputForm from './components/MutationInputForm';
import ClinicalDossierModal from './components/ClinicalDossierModal';
import AIExplanationPanel from './components/AIExplanationPanel';

// Import hook
import { useSyntheticLethality } from './hooks/useSyntheticLethality';

// Disease options
const DISEASE_OPTIONS = [
  { value: 'ovarian_cancer', label: 'Ovarian Cancer' },
  { value: 'breast_cancer', label: 'Breast Cancer' },
  { value: 'prostate_cancer', label: 'Prostate Cancer' },
  { value: 'pancreatic_cancer', label: 'Pancreatic Cancer' },
  { value: 'colorectal_cancer', label: 'Colorectal Cancer' },
  { value: 'lung_cancer', label: 'Lung Cancer' },
  { value: 'multiple_myeloma', label: 'Multiple Myeloma' },
  { value: 'other', label: 'Other' }
];

// Subtype options by disease
const SUBTYPE_OPTIONS = {
  ovarian_cancer: [
    { value: 'high_grade_serous', label: 'High-Grade Serous' },
    { value: 'low_grade_serous', label: 'Low-Grade Serous' },
    { value: 'clear_cell', label: 'Clear Cell' },
    { value: 'endometrioid', label: 'Endometrioid' },
    { value: 'mucinous', label: 'Mucinous' }
  ],
  breast_cancer: [
    { value: 'er_positive', label: 'ER+ (Hormone Receptor Positive)' },
    { value: 'her2_positive', label: 'HER2+' },
    { value: 'triple_negative', label: 'Triple Negative' }
  ]
};

// Stage options
const STAGE_OPTIONS = ['I', 'II', 'III', 'IIIC', 'IV', 'IVA', 'IVB'];

// Analysis steps
const ANALYSIS_STEPS = [
  'Damage Assessment',
  'Pathway Mapping',
  'Essentiality Scoring',
  'Synthetic Lethality Detection',
  'Drug Recommendations'
];

const SyntheticLethalityAnalyzer = () => {
  // State
  const [disease, setDisease] = useState('ovarian_cancer');
  const [subtype, setSubtype] = useState('high_grade_serous');
  const [stage, setStage] = useState('IVB');
  const [mutations, setMutations] = useState([]);
  const [showDossierModal, setShowDossierModal] = useState(false);

  // Use synthetic lethality hook
  const {
    analyze,
    reset,
    loading,
    error,
    results,
    stepProgress
  } = useSyntheticLethality({
    disease,
    subtype,
    stage,
    mutations
  });

  // Handle analysis
  const handleAnalyze = useCallback(async () => {
    if (mutations.length === 0) return;
    await analyze();
  }, [analyze, mutations]);

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
    setMutations([]);
  }, [reset]);

  // Get subtypes for current disease
  const currentSubtypes = SUBTYPE_OPTIONS[disease] || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
          borderRadius: 3
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Psychology sx={{ fontSize: 48, color: 'white' }} />
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              🧬 Synthetic Lethality Analyzer
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Identify therapeutic vulnerabilities from genetic mutations
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Input */}
        <Grid item xs={12} lg={5}>
          {/* Disease Context */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Science color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Patient Context
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Disease</InputLabel>
                  <Select
                    value={disease}
                    onChange={(e) => {
                      setDisease(e.target.value);
                      setSubtype('');
                    }}
                    label="Disease"
                  >
                    {DISEASE_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    label="Stage"
                  >
                    {STAGE_OPTIONS.map(s => (
                      <MenuItem key={s} value={s}>Stage {s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {currentSubtypes.length > 0 && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Subtype</InputLabel>
                    <Select
                      value={subtype}
                      onChange={(e) => setSubtype(e.target.value)}
                      label="Subtype"
                    >
                      {currentSubtypes.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Mutation Input */}
          <MutationInputForm
            mutations={mutations}
            onMutationsChange={setMutations}
          />

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={handleAnalyze}
              disabled={loading || mutations.length === 0}
              sx={{ flex: 1 }}
            >
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {/* Progress Stepper */}
          {loading && (
            <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Analysis Progress
              </Typography>
              <Stepper activeStep={stepProgress - 1} alternativeLabel>
                {ANALYSIS_STEPS.map((step, index) => (
                  <Step key={step} completed={stepProgress > index + 1}>
                    <StepLabel>{step}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          )}
        </Grid>

        {/* Right Column: Results */}
        <Grid item xs={12} lg={7}>
          {!results && !loading && (
            <Paper
              elevation={1}
              sx={{
                p: 6,
                textAlign: 'center',
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <Biotech sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Analysis Results Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add mutations and click "Run Analysis" to identify synthetic lethality opportunities
              </Typography>
            </Paper>
          )}

          {results && (
            <Stack spacing={3}>
              {/* Success Banner */}
              <Alert
                severity="success"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<Description />}
                    onClick={() => setShowDossierModal(true)}
                  >
                    Generate Dossier
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight="medium">
                  Analysis Complete — {results.essentiality?.length || 0} genes analyzed,{' '}
                  {results.recommended_therapies?.length || 0} therapies identified
                </Typography>
              </Alert>

              {/* Essentiality Scores */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Science color="primary" />
                  Essentiality Scores
                </Typography>
                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                  {(results.essentiality || []).map((ess, idx) => (
                    <EssentialityScoreCard
                      key={`${ess.gene}-${idx}`}
                      gene={ess.gene}
                      score={ess.score}
                      flags={ess.flags}
                      rationale={ess.rationale}
                      confidence={ess.confidence}
                      pathwayImpact={ess.pathwayImpact}
                      germlineStatus={
                        mutations.find(m => m.gene === ess.gene)?.germline_status
                      }
                    />
                  ))}
                </Stack>
              </Box>

              {/* Pathway Dependency Diagram */}
              {results.pathway_analysis && (
                <PathwayDependencyDiagram
                  brokenPathways={results.pathway_analysis.broken_pathways}
                  essentialPathways={results.pathway_analysis.essential_pathways}
                  doubleHitDetected={results.pathway_analysis.double_hit_detected}
                  syntheticLethalityScore={results.pathway_analysis.synthetic_lethality_score}
                />
              )}

              {/* AI Explanation Panel */}
              <AIExplanationPanel results={results} />

              {/* Therapy Recommendations */}
              <TherapyRecommendationList
                recommendations={results.recommended_therapies || []}
                suggestedTherapy={results.suggested_therapy}
              />
            </Stack>
          )}
        </Grid>
      </Grid>

      {/* Clinical Dossier Modal */}
      <ClinicalDossierModal
        open={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        results={results}
        mutations={mutations}
        diseaseContext={{ disease, subtype, stage }}
      />
    </Container>
  );
};

export default SyntheticLethalityAnalyzer;

