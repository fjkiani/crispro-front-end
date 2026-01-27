import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * TumorQuickIntakeForm - Quick intake form for patients without full NGS
 * 
 * Allows patients to enter minimal clinical data (cancer type, stage, partial biomarkers)
 * and generates TumorContext using disease priors (L0/L1 support).
 */
export default function TumorQuickIntakeForm({ onTumorContextGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    cancer_type: '',
    stage: '',
    line: '',
    platinum_response: '',
    tmb: '',
    msi_status: '',
    hrd_score: '',
    somatic_mutations: []
  });

  const cancerTypes = [
    { value: 'ovarian_hgs', label: 'Ovarian Cancer (HGSOC)' },
    { value: 'breast_tnbc', label: 'Triple-Negative Breast Cancer' },
    { value: 'colorectal', label: 'Colorectal Adenocarcinoma' },
    { value: 'endometrial', label: 'Endometrial Cancer' },
    { value: 'pancreatic', label: 'Pancreatic Cancer' }
  ];

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        cancer_type: formData.cancer_type,
        stage: formData.stage || null,
        line: formData.line ? parseInt(formData.line) : null,
        platinum_response: formData.platinum_response || null,
        tmb: formData.tmb ? parseFloat(formData.tmb) : null,
        msi_status: formData.msi_status || null,
        hrd_score: formData.hrd_score ? parseFloat(formData.hrd_score) : null,
        somatic_mutations: formData.somatic_mutations || []
      };

      const response = await fetch(`${import.meta.env.VITE_API_ROOT || 'http://localhost:8000'}/api/tumor/quick_intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      // Callback to parent component
      if (onTumorContextGenerated) {
        onTumorContextGenerated(data.tumor_context);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate tumor context');
    } finally {
      setLoading(false);
    }
  };

  const getLevelFromCompleteness = (completeness) => {
    if (completeness >= 0.7) return 'L2';
    if (completeness >= 0.3) return 'L1';
    return 'L0';
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <ScienceIcon color="primary" fontSize="large" />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Quick Intake (No NGS Required)
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter what you know about your cancer. We'll use disease priors to estimate biomarkers
        and provide treatment recommendations even without full tumor sequencing.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Cancer Type (Required) */}
          <FormControl fullWidth required>
            <InputLabel>Cancer Type</InputLabel>
            <Select
              value={formData.cancer_type}
              onChange={handleChange('cancer_type')}
              label="Cancer Type"
            >
              {cancerTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Stage (Optional) */}
          <FormControl fullWidth>
            <InputLabel>Stage (Optional)</InputLabel>
            <Select
              value={formData.stage}
              onChange={handleChange('stage')}
              label="Stage (Optional)"
            >
              <MenuItem value="">Not specified</MenuItem>
              <MenuItem value="I">Stage I</MenuItem>
              <MenuItem value="II">Stage II</MenuItem>
              <MenuItem value="III">Stage III</MenuItem>
              <MenuItem value="IV">Stage IV</MenuItem>
            </Select>
          </FormControl>

          {/* Treatment Line (Optional) */}
          <TextField
            label="Treatment Line (Optional)"
            type="number"
            value={formData.line}
            onChange={handleChange('line')}
            helperText="e.g., 1 for first-line, 2 for second-line"
            inputProps={{ min: 1, max: 10 }}
          />

          {/* Platinum Response (Optional, for ovarian/breast) */}
          {['ovarian_hgs', 'breast_tnbc'].includes(formData.cancer_type) && (
            <FormControl fullWidth>
              <InputLabel>Platinum Response (Optional)</InputLabel>
              <Select
                value={formData.platinum_response}
                onChange={handleChange('platinum_response')}
                label="Platinum Response (Optional)"
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value="sensitive">Platinum-sensitive</MenuItem>
                <MenuItem value="resistant">Platinum-resistant</MenuItem>
                <MenuItem value="refractory">Platinum-refractory</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Partial Biomarkers Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Partial Biomarkers (Optional - Enter if you know them)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="TMB (mutations per megabase)"
                  type="number"
                  value={formData.tmb}
                  onChange={handleChange('tmb')}
                  helperText="e.g., 5.2 for 5.2 mut/Mb"
                  inputProps={{ min: 0, step: 0.1 }}
                />

                <FormControl fullWidth>
                  <InputLabel>MSI Status</InputLabel>
                  <Select
                    value={formData.msi_status}
                    onChange={handleChange('msi_status')}
                    label="MSI Status"
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    <MenuItem value="MSI-H">MSI-High</MenuItem>
                    <MenuItem value="MSS">MSS (Microsatellite Stable)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="HRD Score"
                  type="number"
                  value={formData.hrd_score}
                  onChange={handleChange('hrd_score')}
                  helperText="e.g., 42 for HRD-high threshold"
                  inputProps={{ min: 0 }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !formData.cancer_type}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            sx={{ mt: 2 }}
          >
            {loading ? 'Generating...' : 'Generate Tumor Context'}
          </Button>
        </Box>
      </form>

      {/* Results */}
      {result && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Tumor context generated successfully!
          </Alert>

          <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Generated Tumor Context
                </Typography>
                {result.tumor_context?.completeness_score !== undefined && (
                  <Chip
                    label={`${getLevelFromCompleteness(result.tumor_context.completeness_score)} Intake`}
                  color={result.tumor_context.completeness_score >= 0.7 ? 'success' : 
                           result.tumor_context.completeness_score >= 0.3 ? 'warning' : 'error'}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {result.confidence_cap && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Confidence capped at {Math.round(result.confidence_cap * 100)}% due to incomplete biomarker data.
                </Alert>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Recommendations:
                  </Typography>
                  {result.recommendations.map((rec, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                      • {rec}
                    </Typography>
                  ))}
              </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Completeness: {Math.round((result.tumor_context?.completeness_score || 0) * 100)}%
                </Typography>
                {result.tumor_context?.tmb && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Estimated TMB: {result.tumor_context.tmb.toFixed(1)} mut/Mb
                  </Typography>
                )}
                {result.tumor_context?.hrd_score !== undefined && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Estimated HRD: {result.tumor_context.hrd_score.toFixed(0)}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Card>
  );
}
