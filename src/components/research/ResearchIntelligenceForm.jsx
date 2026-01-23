/**
 * ResearchIntelligenceForm - Form section for Research Intelligence
 * 
 * Displays:
 * - Question input field
 * - Patient context selectors (disease, treatment line, biomarkers)
 * - Persona selector
 * - Options checkboxes (synthesize, run_moat_analysis)
 * - Action buttons (Research, Export, Reset)
 */

import React from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

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

const ResearchIntelligenceForm = ({
  // Form values
  question,
  disease,
  treatmentLine,
  biomarkers,
  persona,
  synthesize,
  runMoatAnalysis,
  
  // Form handlers
  onQuestionChange,
  onDiseaseChange,
  onTreatmentLineChange,
  onBiomarkersChange,
  onPersonaChange,
  onSynthesizeChange,
  onRunMoatAnalysisChange,
  
  // Validation errors
  questionError,
  biomarkersError,
  
  // Actions
  onResearch,
  onExport,
  onReset,
  
  // State
  loading,
  hasResult,
}) => {
  return (
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
              onQuestionChange(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                onResearch();
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
              onChange={(e) => onDiseaseChange(e.target.value)}
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
              onChange={(e) => onTreatmentLineChange(e.target.value)}
            >
              {TREATMENT_LINE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Biomarkers (JSON)"
            placeholder='{"HRD": "POSITIVE", "TMB": 8}'
            value={biomarkers}
            onChange={(e) => {
              onBiomarkersChange(e.target.value);
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

        {/* Persona Selector */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>View As</InputLabel>
            <Select
              value={persona}
              label="View As"
              onChange={(e) => onPersonaChange(e.target.value)}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="r&d">R&D</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Options */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={synthesize}
                  onChange={(e) => onSynthesizeChange(e.target.checked)}
                />
              }
              label="Synthesize (LLM synthesis)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={runMoatAnalysis}
                  onChange={(e) => onRunMoatAnalysisChange(e.target.checked)}
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
              onClick={onResearch}
              disabled={loading || !question.trim() || !!questionError || !!biomarkersError}
              size="large"
              aria-label="Start research intelligence query"
            >
              {loading ? 'Researching...' : 'Research'}
            </Button>
            {hasResult && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={onExport}
                >
                  Export JSON
                </Button>
                <Button
                  variant="outlined"
                  onClick={onReset}
                >
                  Reset
                </Button>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ResearchIntelligenceForm;
