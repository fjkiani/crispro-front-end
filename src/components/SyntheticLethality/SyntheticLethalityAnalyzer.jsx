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
  Chip
} from '@mui/material';
import {
  Science,
  PlayArrow,
  Refresh,
  Description,
  Psychology,
  Biotech,
  AutoAwesome,
  Timeline,
  Hub,
  Shield
} from '@mui/icons-material';

// Import components
import EssentialityScoreCard from './components/EssentialityScoreCard';
import PathwayDependencyDiagram from './components/PathwayDependencyDiagram';
import TherapyRecommendationList from './components/TherapyRecommendationList';
import MutationInputForm from './components/MutationInputForm';
import ClinicalDossierModal from './components/ClinicalDossierModal';
import AIExplanationPanel from './components/AIExplanationPanel';
import { EvidenceMatrixTable } from './components/EvidenceMatrixTable';
import { getSyntheticLethalityTierBucket } from './utils/displayFormat';

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

const humanize = (value = '') =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatConfidence = (value) =>
  typeof value === 'number' && !Number.isNaN(value) ? `${Math.round(value * 100)}%` : 'Unknown';

const summarizeMatrix = (matrix) => {
  const rows = matrix?.rows || [];
  const summary = {
    total: rows.length,
    validated: 0,
    strong: 0,
    mechanistic: 0,
    unsupported: 0,
    unknown: 0
  };

  rows.forEach((row) => {
    switch (getSyntheticLethalityTierBucket(row?.recommendation_tier)) {
      case 'validated':
        summary.validated += 1;
        break;
      case 'strong':
        summary.strong += 1;
        break;
      case 'mechanistic':
        summary.mechanistic += 1;
        break;
      case 'unsupported':
        summary.unsupported += 1;
        break;
      default:
        summary.unknown += 1;
        break;
    }
  });

  return summary;
};

const getTopRecommendation = (results) => {
  const recommendations = results?.recommended_therapies || [];
  return recommendations[0] || null;
};

const ResultSection = ({ icon, title, subtitle, children }) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.50',
            color: 'primary.main',
            flexShrink: 0
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>
      {children}
    </Stack>
  </Paper>
);

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
  const evidenceMatrix = results?.evidence_matrix || results?.provenance?.evidence_matrix;
  const matrixSummary = summarizeMatrix(evidenceMatrix);
  const topRecommendation = getTopRecommendation(results);
  const brokenCount = results?.pathway_analysis?.broken_pathways?.length || 0;
  const backupCount = results?.pathway_analysis?.essential_pathways?.length || 0;
  const slScore = results?.pathway_analysis?.synthetic_lethality_score;

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
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Psychology sx={{ fontSize: 48, color: 'white' }} />
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                🧬 Synthetic Lethality Analyzer
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                Identify mechanistic therapeutic vulnerabilities from genetic mutations, pathway dependencies, and evidence receipts.
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={humanize(disease)} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
            {subtype ? (
              <Chip label={humanize(subtype)} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
            ) : null}
            <Chip label={`Stage ${stage}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
            <Chip label={`${mutations.length} mutation${mutations.length === 1 ? '' : 's'}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
          </Stack>
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)', maxWidth: 820 }}>
              Best for mutation sets where you want a fast answer to three questions: is there a real synthetic lethality signal, how well is it supported across evidence modalities, and which therapy axis is strongest right now.
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

          <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              What this run produces
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                1. A multi-modal evidence matrix showing where each therapeutic axis is validated, mechanistic-only, or unsupported.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2. Gene-level essentiality signals and pathway dependency context for the submitted alterations.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Ranked therapy candidates plus an LLM interpretation layer for clinician, patient, or researcher framing.
              </Typography>
            </Stack>
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
                p: 4,
                backgroundColor: 'grey.50',
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <Stack spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Biotech sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Analysis Results Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add mutations and run the analysis to generate a full synthetic lethality briefing.
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Evidence matrix
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        See which therapeutic axes are supported by CRISPR, expression, PRISM, GDSC, preclinical, and clinical evidence.
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Pathway dependency
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Understand whether the mutation set breaks core repair pathways and forces backup pathway dependence.
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Ranked therapies
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review the strongest mechanistic candidates, then generate a clinician-ready dossier from the same run.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Stack>
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

              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(26,35,126,0.06) 0%, rgba(74,20,140,0.08) 100%)',
                  border: '1px solid',
                  borderColor: 'primary.100'
                }}
              >
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1 }}>
                      Analysis Briefing
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {topRecommendation?.drug || results.suggested_therapy || 'No top therapeutic lever surfaced'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {topRecommendation?.mechanism || 'This summary card highlights the strongest candidate plus the state of pathway damage and evidence support for this run.'}
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                        <Stack spacing={1}>
                          <AutoAwesome color="primary" />
                          <Typography variant="caption" color="text.secondary">Top confidence</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {formatConfidence(topRecommendation?.confidence)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Highest-confidence therapy in the current ranked list.
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                        <Stack spacing={1}>
                          <Hub color="primary" />
                          <Typography variant="caption" color="text.secondary">Pathway state</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {brokenCount}/{backupCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Broken pathways / essential backups detected in this run.
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                        <Stack spacing={1}>
                          <Shield color="primary" />
                          <Typography variant="caption" color="text.secondary">Evidence posture</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {matrixSummary.validated}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {matrixSummary.strong} strong candidates, {matrixSummary.mechanistic} mechanistic-only axes, and {matrixSummary.unsupported} unsupported or negative axes.
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                        <Stack spacing={1}>
                          <Timeline color="primary" />
                          <Typography variant="caption" color="text.secondary">SL score</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {typeof slScore === 'number' ? `${Math.round(slScore * 100)}%` : 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Composite synthetic lethality score from the pathway dependency stage.
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>

              {/* V3 Evidence Matrix */}
              {evidenceMatrix && (
                <ResultSection
                  icon={<Biotech />}
                  title="Multi-Modal Evidence Matrix"
                  subtitle="Use this as the receipt layer: validated axes should read as supported across modalities, while mechanistic-only rows remain hypotheses that still need stronger backing."
                >
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <EvidenceMatrixTable matrix={evidenceMatrix} />
                  </Paper>
                </ResultSection>
              )}

              {/* Essentiality Scores */}
              <ResultSection
                icon={<Science />}
                title="Essentiality Scores"
                subtitle="These cards show how dependent the tumor may be on each submitted gene context. High essentiality helps explain why a damaged pathway can create a therapeutic opening."
              >
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
              </ResultSection>

              {/* Pathway Dependency Diagram */}
              {results.pathway_analysis && (
                <ResultSection
                  icon={<Hub />}
                  title="Pathway Dependency Analysis"
                  subtitle="This is the mechanistic bridge between damaged pathways and backup dependencies. If the diagram is sparse, the matrix and therapy panels still tell you whether the run found pan-cancer or transcriptional evidence."
                >
                  <PathwayDependencyDiagram
                    brokenPathways={results.pathway_analysis.broken_pathways}
                    essentialPathways={results.pathway_analysis.essential_pathways}
                    doubleHitDetected={results.pathway_analysis.double_hit_detected}
                    syntheticLethalityScore={results.pathway_analysis.synthetic_lethality_score}
                  />
                </ResultSection>
              )}

              {/* AI Explanation Panel */}
              <ResultSection
                icon={<Psychology />}
                title="AI Clinical Interpretation"
                subtitle="Generate a clinician, patient, or researcher explanation from the exact run payload, then ask follow-up questions against the same result set."
              >
                <AIExplanationPanel results={results} />
              </ResultSection>

              {/* Therapy Recommendations */}
              <ResultSection
                icon={<AutoAwesome />}
                title="Therapy Recommendations"
                subtitle="These recommendations are ranked outputs from the SL analysis. Use the matrix above to separate validated levers from mechanistic candidates before escalating any clinical discussion."
              >
                <TherapyRecommendationList
                  recommendations={results.recommended_therapies || []}
                  suggestedTherapy={results.suggested_therapy}
                />
              </ResultSection>
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

