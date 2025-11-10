import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ScienceIcon from '@mui/icons-material/Science';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const API_ROOT = import.meta.env.VITE_API_ROOT || '';

/**
 * TumorQuickIntake Component (Day 4 - Module M5)
 * 
 * Quick intake form for sporadic cancer patients WITHOUT a full NGS report.
 * Generates Level 0/1 TumorContext using disease priors and optional biomarker inputs.
 * 
 * Critical for Ayesha: Get immediate recommendations without waiting for full report.
 * 
 * Calls: POST /api/tumor/quick_intake
 */
export default function TumorQuickIntake({ 
  patientId = "unknown", 
  onContextGenerated,
  onError 
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tumor_type: '',
    tumor_sub_type: '',
    age: '',
    sex: '',
    ecog_performance_status: '',
    platinum_response: '',
    manual_tmb: '',
    manual_hrd: '',
    manual_msi_status: '',
  });
  const [result, setResult] = useState(null);

  // Disease options (from Agent Jr's expanded disease_priors.json)
  const diseaseOptions = [
    { value: 'ovarian_hgs', label: 'Ovarian Cancer (High-Grade Serous)' },
    { value: 'breast_tnbc', label: 'Breast Cancer (Triple-Negative)' },
    { value: 'colorectal', label: 'Colorectal Cancer' },
    { value: 'lung_nsclc', label: 'Lung Cancer (NSCLC)' },
    { value: 'pancreatic', label: 'Pancreatic Cancer' },
    { value: 'prostate_adenocarcinoma', label: 'Prostate Adenocarcinoma' },
    { value: 'melanoma_cutaneous', label: 'Melanoma (Cutaneous)' },
    { value: 'bladder_urothelial', label: 'Bladder Cancer (Urothelial)' },
    { value: 'endometrial_uterine', label: 'Endometrial Cancer' },
    { value: 'gastric_adenocarcinoma', label: 'Gastric Adenocarcinoma' },
    { value: 'esophageal_adenocarcinoma', label: 'Esophageal Adenocarcinoma' },
    { value: 'head_neck_squamous', label: 'Head & Neck Cancer (Squamous)' },
    { value: 'glioblastoma_multiforme', label: 'Glioblastoma' },
    { value: 'renal_clear_cell', label: 'Renal Cell Carcinoma (Clear Cell)' },
    { value: 'acute_myeloid_leukemia', label: 'Acute Myeloid Leukemia' },
  ];

  const handleSubmit = async () => {
    if (!formData.tumor_type) {
      onError?.("Please select a cancer type");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = {
        patient_id: patientId,
        tumor_type: formData.tumor_type,
        tumor_sub_type: formData.tumor_sub_type || null,
        age: formData.age ? parseInt(formData.age) : null,
        sex: formData.sex || null,
        ecog_performance_status: formData.ecog_performance_status ? parseInt(formData.ecog_performance_status) : null,
        platinum_response: formData.platinum_response || null,
        manual_tmb: formData.manual_tmb ? parseFloat(formData.manual_tmb) : null,
        manual_hrd: formData.manual_hrd ? parseFloat(formData.manual_hrd) : null,
        manual_msi_status: formData.manual_msi_status || null,
      };

      const response = await fetch(`${API_ROOT}/api/tumor/quick_intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Quick Intake failed');
      }

      const data = await response.json();
      setResult(data);
      onContextGenerated?.(data);

    } catch (err) {
      console.error('Quick Intake error:', err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
      <CardHeader
        avatar={<ScienceIcon sx={{ color: '#00bcd4' }} />}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Quick Intake</Typography>
            <Chip label="No Report Needed" size="small" color="primary" />
          </Stack>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Get immediate recommendations using disease priors (Level 0/1)
          </Typography>
        }
      />

      <Divider />

      <CardContent>
        {/* Info Alert */}
        <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            This Quick Intake generates a <strong>Level 0</strong> analysis using statistical disease priors.
            Add optional biomarkers (TMB, HRD, MSI) for <strong>Level 1</strong> accuracy.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {/* Required: Cancer Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Cancer Type *</InputLabel>
              <Select
                value={formData.tumor_type}
                onChange={(e) => setFormData({ ...formData, tumor_type: e.target.value })}
                label="Cancer Type *"
              >
                {diseaseOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Optional: Subtype */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Subtype (Optional)"
              value={formData.tumor_sub_type}
              onChange={(e) => setFormData({ ...formData, tumor_sub_type: e.target.value })}
              placeholder="e.g., Serous, Mucinous"
            />
          </Grid>

          {/* Age */}
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="60"
            />
          </Grid>

          {/* Sex */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sex</InputLabel>
              <Select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                label="Sex"
              >
                <MenuItem value="">Unknown</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* ECOG Performance Status */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel>ECOG Performance Status</FormLabel>
              <RadioGroup
                row
                value={formData.ecog_performance_status}
                onChange={(e) => setFormData({ ...formData, ecog_performance_status: e.target.value })}
              >
                <FormControlLabel value="0" control={<Radio size="small" />} label="0" />
                <FormControlLabel value="1" control={<Radio size="small" />} label="1" />
                <FormControlLabel value="2" control={<Radio size="small" />} label="2" />
                <FormControlLabel value="3" control={<Radio size="small" />} label="3" />
                <FormControlLabel value="4" control={<Radio size="small" />} label="4" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Chip label="Optional: Enhance Accuracy (Level 1)" size="small" />
            </Divider>
          </Grid>

          {/* Platinum Response (HRD Proxy) */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Platinum Response (HRD Proxy)</InputLabel>
              <Select
                value={formData.platinum_response}
                onChange={(e) => setFormData({ ...formData, platinum_response: e.target.value })}
                label="Platinum Response (HRD Proxy)"
              >
                <MenuItem value="">Unknown</MenuItem>
                <MenuItem value="sensitive">Sensitive (≥12 months)</MenuItem>
                <MenuItem value="resistant">Resistant (6-12 months)</MenuItem>
                <MenuItem value="refractory">Refractory (&lt;6 months)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Manual TMB */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="TMB (mutations/Mb)"
              type="number"
              value={formData.manual_tmb}
              onChange={(e) => setFormData({ ...formData, manual_tmb: e.target.value })}
              placeholder="e.g., 25.0"
              helperText="If known from report"
            />
          </Grid>

          {/* Manual HRD */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="HRD Score (0-100)"
              type="number"
              value={formData.manual_hrd}
              onChange={(e) => setFormData({ ...formData, manual_hrd: e.target.value })}
              placeholder="e.g., 50"
              helperText="If known from report"
            />
          </Grid>

          {/* Manual MSI */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>MSI Status</InputLabel>
              <Select
                value={formData.manual_msi_status}
                onChange={(e) => setFormData({ ...formData, manual_msi_status: e.target.value })}
                label="MSI Status"
              >
                <MenuItem value="">Unknown</MenuItem>
                <MenuItem value="MSI-High">MSI-High</MenuItem>
                <MenuItem value="MSI-Stable">MSI-Stable</MenuItem>
                <MenuItem value="MSI-Low">MSI-Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={loading || !formData.tumor_type}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                }
              }}
            >
              {loading ? 'Generating Context...' : 'Generate Tumor Context'}
            </Button>
          </Grid>
        </Grid>

        {/* Result Display */}
        {result && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#252525', borderRadius: 1, border: '1px solid #00bcd4' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <CheckCircleOutlineIcon sx={{ color: '#00bcd4' }} />
              <Typography variant="h6">Tumor Context Generated</Typography>
              <Chip 
                label={`Level ${result.tumor_context?.completeness_score < 0.3 ? '0' : '1'}`}
                size="small"
                color="success"
              />
            </Stack>

            {/* Quick Stats */}
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">TMB</Typography>
                <Typography variant="h6">
                  {result.tumor_context?.tmb?.toFixed(1) || 'N/A'} mut/Mb
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">HRD Score</Typography>
                <Typography variant="h6">
                  {result.tumor_context?.hrd_score !== null ? result.tumor_context?.hrd_score?.toFixed(0) : 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">MSI Status</Typography>
                <Typography variant="h6">
                  {result.tumor_context?.msi_status || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">Completeness</Typography>
                <Typography variant="h6">
                  {((result.tumor_context?.completeness_score || 0) * 100).toFixed(0)}%
                </Typography>
              </Grid>
            </Grid>

            {/* Data Source */}
            <Alert severity="info" sx={{ mt: 2 }} icon={<InfoOutlinedIcon />}>
              <Typography variant="caption">
                <strong>Data Source:</strong> Disease priors from TCGA 
                {formData.manual_tmb || formData.manual_hrd || formData.manual_msi_status 
                  ? ' + manual biomarker inputs'
                  : ' (statistical estimates)'
                }
              </Typography>
            </Alert>

            {/* Next Steps */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // Copy context to clipboard for manual use
                  navigator.clipboard.writeText(JSON.stringify(result.tumor_context, null, 2));
                }}
              >
                Copy Context (JSON)
              </Button>
              <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                Context ID: {result.context_id?.slice(0, 8)}...
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

