/**
 * Research Intelligence Page
 * 
 * Standalone page for Research Intelligence:
 * - Natural language question input
 * - Patient context (disease, treatment line, biomarkers)
 * - Options (portals, synthesize, run_moat_analysis)
 * - Results display using ResearchIntelligenceResults component
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Stack
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useResearchIntelligence } from '../hooks/useResearchIntelligence';
import ResearchIntelligenceResults from '../components/research/ResearchIntelligenceResults';
import ResearchIntelligenceSkeleton from '../components/research/ResearchIntelligenceSkeleton';
import ResearchIntelligenceErrorBoundary from '../components/research/ResearchIntelligenceErrorBoundary';

const DISEASE_OPTIONS = [
  { value: 'ovarian_cancer_hgs', label: 'Ovarian Cancer (HGS)' },
  { value: 'breast_cancer', label: 'Breast Cancer' },
  { value: 'multiple_myeloma', label: 'Multiple Myeloma' },
  { value: 'pancreatic_cancer', label: 'Pancreatic Cancer' },
  { value: 'lung_cancer', label: 'Lung Cancer' },
  { value: 'colorectal_cancer', label: 'Colorectal Cancer' }
];

const TREATMENT_LINE_OPTIONS = [
  { value: 'L1', label: 'First Line (L1)' },
  { value: 'L2', label: 'Second Line (L2)' },
  { value: 'L3', label: 'Third Line (L3)' },
  { value: 'maintenance', label: 'Maintenance' }
];

export default function ResearchIntelligence() {
  const [question, setQuestion] = useState('');
  const [disease, setDisease] = useState('ovarian_cancer_hgs');
  const [treatmentLine, setTreatmentLine] = useState('L2');
  const [biomarkers, setBiomarkers] = useState('{"HRD": "POSITIVE"}');
  const [synthesize, setSynthesize] = useState(true);
  const [runMoatAnalysis, setRunMoatAnalysis] = useState(true);
  
  // Validation state
  const [questionError, setQuestionError] = useState('');
  const [biomarkersError, setBiomarkersError] = useState('');

  const { result, loading, error, errorDetails, researchQuestion, reset } = useResearchIntelligence();

  // Validate inputs
  const validateInputs = () => {
    let isValid = true;
    
    // Validate question
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setQuestionError('Question is required');
      isValid = false;
    } else if (trimmedQuestion.length < 10) {
      setQuestionError('Question must be at least 10 characters');
      isValid = false;
    } else if (trimmedQuestion.length > 500) {
      setQuestionError('Question must be less than 500 characters');
      isValid = false;
    } else {
      setQuestionError('');
    }
    
    // Validate biomarkers JSON
    if (biomarkers.trim()) {
      try {
        JSON.parse(biomarkers);
        setBiomarkersError('');
      } catch (e) {
        setBiomarkersError('Invalid JSON format. Use format: {"HRD": "POSITIVE", "TMB": 8}');
        isValid = false;
      }
    } else {
      setBiomarkersError('');
    }
    
    return isValid;
  };

  const handleResearch = async () => {
    // Clear previous errors
    setQuestionError('');
    setBiomarkersError('');
    
    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    try {
      // Parse biomarkers JSON
      let biomarkersObj = {};
      if (biomarkers.trim()) {
        biomarkersObj = JSON.parse(biomarkers);
      }

      const context = {
        disease,
        treatment_line: treatmentLine,
        biomarkers: biomarkersObj
      };

      const options = {
        synthesize,
        run_moat_analysis: runMoatAnalysis
      };

      await researchQuestion(question.trim(), context, options);
    } catch (err) {
      // Error is handled by hook, but we can add additional handling here if needed
      console.error('Research failed:', err);
    }
  };

  const handleExport = () => {
    if (!result) return;

    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-intelligence-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    reset();
    setQuestion('');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="primary" fontSize="large" />
          Research Intelligence
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Full LLM-based research with deep parsing and MOAT integration. Ask complex questions like "How do purple potatoes help with ovarian cancer?"
        </Typography>
        
        {/* Example Questions */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Example Questions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {[
              "How do purple potatoes help with ovarian cancer?",
              "What mechanisms does resveratrol use against breast cancer?",
              "How does curcumin affect inflammation pathways in cancer?"
            ].map((example, idx) => (
              <Button
                key={idx}
                size="small"
                variant="outlined"
                onClick={() => setQuestion(example)}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                {example}
              </Button>
            ))}
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Research Use Only</strong> - This tool provides evidence-based research intelligence but should not replace medical advice.
        </Alert>
      </Box>

      {/* Input Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Question Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Research Question"
              placeholder="e.g., How do purple potatoes help with ovarian cancer?"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (questionError) setQuestionError(''); // Clear error on change
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleResearch();
                }
              }}
              error={!!questionError}
              helperText={questionError || "Enter a natural language research question (10-500 characters). Press Ctrl+Enter to submit."}
              inputProps={{
                'aria-label': 'Research question input',
                'aria-describedby': questionError ? 'question-error' : 'question-helper'
              }}
            />
            {questionError && (
              <Typography variant="caption" color="error" id="question-error" sx={{ mt: 0.5, display: 'block' }}>
                {questionError}
              </Typography>
            )}
          </Grid>

          {/* Patient Context */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Disease</InputLabel>
              <Select
                value={disease}
                label="Disease"
                onChange={(e) => setDisease(e.target.value)}
              >
                {DISEASE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Treatment Line</InputLabel>
              <Select
                value={treatmentLine}
                label="Treatment Line"
                onChange={(e) => setTreatmentLine(e.target.value)}
              >
                {TREATMENT_LINE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Biomarkers (JSON)"
              placeholder='{"HRD": "POSITIVE", "TMB": 8}'
              value={biomarkers}
              onChange={(e) => {
                setBiomarkers(e.target.value);
                if (biomarkersError) setBiomarkersError(''); // Clear error on change
              }}
              error={!!biomarkersError}
              helperText={biomarkersError || 'JSON format: {"HRD": "POSITIVE", "TMB": 8} (optional)'}
              inputProps={{
                'aria-label': 'Biomarkers JSON input',
                'aria-describedby': biomarkersError ? 'biomarkers-error' : 'biomarkers-helper'
              }}
            />
            {biomarkersError && (
              <Typography variant="caption" color="error" id="biomarkers-error" sx={{ mt: 0.5, display: 'block' }}>
                {biomarkersError}
              </Typography>
            )}
          </Grid>

          {/* Options */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={synthesize}
                    onChange={(e) => setSynthesize(e.target.checked)}
                  />
                }
                label="Synthesize (LLM synthesis)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={runMoatAnalysis}
                    onChange={(e) => setRunMoatAnalysis(e.target.checked)}
                  />
                }
                label="Run MOAT Analysis"
              />
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <RefreshIcon /> : <SearchIcon />}
                onClick={handleResearch}
                disabled={loading || !question.trim() || !!questionError || !!biomarkersError}
                size="large"
                aria-label="Start research intelligence query"
              >
                {loading ? 'Researching...' : 'Research'}
              </Button>
              {result && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Running research intelligence pipeline: Question formulation → Portal query → Deep parsing → LLM synthesis → MOAT analysis...
          </Typography>
          <Box sx={{ mt: 3 }}>
            <ResearchIntelligenceSkeleton />
          </Box>
        </Box>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleResearch}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error</AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {error}
          </Typography>
          {errorDetails && errorDetails.actionable && (
            <Typography variant="caption" color="text.secondary">
              <strong>What to do:</strong> {errorDetails.actionable}
            </Typography>
          )}
        </Alert>
      )}

      {/* Results */}
      {result && !loading && (
        <ResearchIntelligenceErrorBoundary onReset={reset}>
          <ResearchIntelligenceResults
            result={result}
            context={{
              disease,
              treatment_line: treatmentLine,
              biomarkers: JSON.parse(biomarkers || '{}')
            }}
          />
        </ResearchIntelligenceErrorBoundary>
      )}
    </Box>
  );
}



