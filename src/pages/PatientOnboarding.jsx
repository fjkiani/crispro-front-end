/**
 * Patient Onboarding Page
 * 
 * Collect required patient information for initial profile setup.
 * Enhanced with optional biomarkers and sporadic gates intake level display.
 * 
 * Following PERSONA_ACCESS_QUICK_START.md patterns:
 * - Persona: patient (or oncologist helping a patient)
 * - Access: Patient and Oncologist personas (route-level protection via PersonaRoute)
 * - Uses persona context for consistency with other onboarding flows
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science';
import InfoIcon from '@mui/icons-material/Info';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { usePersona } from '../context/PersonaContext';
import { API_ROOT } from '../lib/apiConfig';


/**
 * Patient Onboarding Page
 * 
 * Collect required patient information for initial profile setup.
 * Enhanced with optional biomarkers and sporadic gates intake level display.
 * 
 * Following PERSONA_ACCESS_QUICK_START.md patterns:
 * - Persona: patient (or oncologist helping a patient)
 * - Access: Patient and Oncologist personas (route-level protection via PersonaRoute)
 * - Uses persona context for consistency
 */
export default function PatientOnboarding() {
  const { user, session } = useAuth();
  const { loadPatientContext } = usePatient();
  const { persona, isPatient, isOncologist } = usePersona();
  const navigate = useNavigate();
  
  // Persona access check - only patient or oncologist persona can access
  React.useEffect(() => {
    if (persona && !isPatient && !isOncologist) {
      navigate('/home');
    }
  }, [persona, isPatient, isOncologist, navigate]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    disease: 'ovarian_cancer_hgs',
    stage: 'IVB',
    ca125_value: '',
    germline_status: 'negative',
    treatment_line: '0',
    location_state: 'NY',
    location_city: 'NYC Metro',
    // Optional biomarkers (for L0/L1/L2 intake level)
    tmb: '',
    msi_status: '',
    hrd_score: '',
    platinum_response: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!session?.access_token) {
      setError('Not authenticated. Please log in first.');
      setLoading(false);
      return;
    }

    try {
      // Build request body with optional biomarkers
      const requestBody = {
        full_name: formData.full_name,
        disease: formData.disease,
        stage: formData.stage,
        ca125_value: formData.ca125_value ? parseFloat(formData.ca125_value) : null,
        germline_status: formData.germline_status,
        treatment_line: parseInt(formData.treatment_line) || 0,
        location_state: formData.location_state,
        location_city: formData.location_city,
        // Optional biomarkers (only include if provided)
        ...(formData.tmb && { tmb: parseFloat(formData.tmb) }),
        ...(formData.msi_status && { msi_status: formData.msi_status }),
        ...(formData.hrd_score && { hrd_score: parseFloat(formData.hrd_score) }),
        ...(formData.platinum_response && ['ovarian_cancer_hgs', 'ovarian_cancer_lgs', 'breast_cancer'].includes(formData.disease) && { platinum_response: formData.platinum_response })
      };

      const response = await fetch(`${API_ROOT}/api/patient/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || 'Failed to create profile');
      }

      const data = await response.json();
      
      // Store completion data (intake level, recommendations)
      setCompletionData({
        intake_level: data.intake_level || 'L0',
        confidence_cap: data.confidence_cap || 0.4,
        recommendations: data.recommendations || []
      });

      // Reload patient context
      if (loadPatientContext) {
        await loadPatientContext();
      }

      // Show completion screen instead of redirecting
      setShowCompletion(true);
    } catch (err) {
      setError(err.message || 'Failed to create patient profile');
    } finally {
      setLoading(false);
    }
  };

  const getIntakeLevelColor = (level) => {
    if (level === 'L2') return 'success';
    if (level === 'L1') return 'warning';
    return 'error';
  };

  const getIntakeLevelLabel = (level) => {
    if (level === 'L2') return 'L2 - Full Data';
    if (level === 'L1') return 'L1 - Partial Data';
    return 'L0 - Minimal Data';
  };

  const getIntakeLevelExplanation = (level) => {
    if (level === 'L2') {
      return 'You have full biomarker data available (mutations + biomarkers). This enables the highest confidence predictions (up to 80% confidence cap).';
    }
    if (level === 'L1') {
      return 'You have partial biomarker data (either mutations OR biomarkers, but not both). This enables moderate confidence predictions (up to 60% confidence cap).';
    }
    return 'You have minimal data (disease priors only). We can still provide value using disease statistics, but confidence is capped at 40%. Order biomarker tests to unlock higher confidence predictions.';
  };

  // Completion Screen
  if (showCompletion && completionData) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Profile Created Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your patient profile has been set up. Here's your data completeness level.
              </Typography>
            </Box>
          </Box>

          {/* Intake Level Badge */}
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Your Intake Level:
                </Typography>
                <Chip
                  label={getIntakeLevelLabel(completionData.intake_level)}
                  color={getIntakeLevelColor(completionData.intake_level)}
                  size="large"
                  sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Confidence Cap: {Math.round((completionData.confidence_cap || 0.4) * 100)}%
              </Typography>
            </CardContent>
          </Card>

          {/* What Does This Mean? Accordion */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  What does this intake level mean?
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {getIntakeLevelExplanation(completionData.intake_level)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Why confidence caps?</strong> We use conservative confidence limits to ensure safety. 
                As you add more biomarker data, confidence caps increase, allowing more precise predictions.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Next Test Recommendations */}
          {completionData.recommendations && completionData.recommendations.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ScienceIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Recommended Next Tests
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Order these tests to unlock higher confidence predictions:
                </Typography>
                <List>
                  {completionData.recommendations.map((rec, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <ArrowForwardIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Continue Button */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => setShowCompletion(false)}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/ayesha-complete-care')}
              startIcon={<LocalHospitalIcon />}
            >
              Continue to Care Plan
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Main Onboarding Form
  return (
    <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Patient Onboarding
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please provide your basic information to get started. We'll use disease priors to generate 
          treatment recommendations even without full biomarker data.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name (Optional)"
                value={formData.full_name}
                onChange={handleChange('full_name')}
                placeholder="Ayesha Kiani"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Disease Type"
                value={formData.disease}
                onChange={handleChange('disease')}
                required
              >
                <MenuItem value="ovarian_cancer_hgs">Ovarian Cancer (HGS)</MenuItem>
                <MenuItem value="ovarian_cancer_lgs">Ovarian Cancer (LGS)</MenuItem>
                <MenuItem value="breast_cancer">Breast Cancer</MenuItem>
                <MenuItem value="lung_cancer">Lung Cancer</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stage"
                value={formData.stage}
                onChange={handleChange('stage')}
              required
                placeholder="IVB"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="CA-125 Value (U/mL)"
                value={formData.ca125_value}
                onChange={handleChange('ca125_value')}
                placeholder="2842"
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Germline Status"
                value={formData.germline_status}
                onChange={handleChange('germline_status')}
                required
              >
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Treatment Line"
                value={formData.treatment_line}
                onChange={handleChange('treatment_line')}
              required
                inputProps={{ min: 0 }}
                helperText="0 = treatment-naive"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.location_state}
                onChange={handleChange('location_state')}
                placeholder="NY"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="City"
                value={formData.location_city}
                onChange={handleChange('location_city')}
                placeholder="NYC Metro"
              />
            </Grid>

            {/* Optional Biomarkers Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Optional Biomarkers (Skip if you don't have these yet)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    If you have biomarker test results, enter them here to unlock higher confidence predictions. 
                    If you don't have these yet, that's okay! We can still provide value using disease priors.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="TMB (mutations per megabase)"
                        value={formData.tmb}
                        onChange={handleChange('tmb')}
                        placeholder="e.g., 5.2"
                        inputProps={{ min: 0, step: 0.1 }}
                        helperText="Tumor mutational burden"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="MSI Status"
                        value={formData.msi_status}
                        onChange={handleChange('msi_status')}
                      >
                        <MenuItem value="">Not specified</MenuItem>
                        <MenuItem value="MSI-H">MSI-High</MenuItem>
                        <MenuItem value="MSS">MSS (Microsatellite Stable)</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="HRD Score"
                        value={formData.hrd_score}
                        onChange={handleChange('hrd_score')}
                        placeholder="e.g., 42"
                        inputProps={{ min: 0, max: 100 }}
                        helperText="HRD score (0-100, ≥42 = HRD-high)"
                      />
                    </Grid>

                    {['ovarian_cancer_hgs', 'ovarian_cancer_lgs', 'breast_cancer'].includes(formData.disease) && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Platinum Response (Optional)"
                          value={formData.platinum_response}
                          onChange={handleChange('platinum_response')}
                        >
                          <MenuItem value="">Not specified</MenuItem>
                          <MenuItem value="sensitive">Platinum-sensitive</MenuItem>
                          <MenuItem value="resistant">Platinum-resistant</MenuItem>
                          <MenuItem value="refractory">Platinum-refractory</MenuItem>
                        </TextField>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
              type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {loading ? 'Creating Profile...' : 'Create Profile'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
