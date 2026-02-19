/**
 * Oncologist/Clinician Onboarding Page
 * 
 * Collect required oncologist information for initial profile setup.
 * Uses persona-based access control (oncologist persona).
 * 
 * Following PERSONA_ACCESS_QUICK_START.md patterns:
 * - Persona: oncologist (maps from role: 'clinician')
 * - Access: Oncologist persona only
 * - Stores: Professional info in user_profiles or metadata
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
  Chip,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Autocomplete
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessIcon from '@mui/icons-material/Business';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';
import { API_ROOT } from '../lib/apiConfig';


const CANCER_TYPES = [
  'Ovarian Cancer',
  'Breast Cancer',
  'Lung Cancer',
  'Colorectal Cancer',
  'Prostate Cancer',
  'Pancreatic Cancer',
  'Liver Cancer',
  'Kidney Cancer',
  'Bladder Cancer',
  'Leukemia',
  'Lymphoma',
  'Multiple Myeloma',
  'Melanoma',
  'Brain Cancer',
  'Other'
];

const RESEARCH_INTERESTS_OPTIONS = [
  'PARP inhibitors',
  'IO therapy',
  'Precision medicine',
  'Targeted therapy',
  'CAR-T therapy',
  'Biomarker discovery',
  'Clinical trials',
  'Resistance mechanisms',
  'Combinatorial therapies',
  'Early detection',
  'Other'
];

function OncologistOnboarding() {
  const { user, session } = useAuth();
  const { persona, isOncologist } = usePersona();
  const navigate = useNavigate();
  
  // Persona access check - only oncologist persona can access
  React.useEffect(() => {
    if (persona && !isOncologist) {
      navigate('/home');
    }
  }, [persona, isOncologist, navigate]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    specialty: '',
    sub_specialty: '',
    npi: '',
    license_number: '',
    license_state: '',
    institution_name: '',
    institution_type: '',
    institution_city: '',
    institution_state: '',
    primary_cancer_types: [],
    clinical_trials_enrollment: false,
    research_interests: [],
    preferred_communication: 'email'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const handleChange = (field) => (e) => {
    if (field === 'clinical_trials_enrollment') {
      setFormData({ ...formData, [field]: e.target.checked });
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
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
      // Store professional info via doctor profile endpoint
      const response = await fetch(`${API_ROOT}/api/doctor/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          specialty: formData.specialty,
          sub_specialty: formData.sub_specialty || null,
          npi: formData.npi || null,
          license_number: formData.license_number || null,
          license_state: formData.license_state || null,
          institution_name: formData.institution_name,
          institution_type: formData.institution_type || null,
          institution_city: formData.institution_city || null,
          institution_state: formData.institution_state || null,
          primary_cancer_types: formData.primary_cancer_types,
          clinical_trials_enrollment: formData.clinical_trials_enrollment,
          research_interests: formData.research_interests,
          preferred_communication: formData.preferred_communication
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || 'Failed to create profile');
      }

      const data = await response.json();
      
      // Show completion screen
      setShowCompletion(true);
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  // Completion Screen
  if (showCompletion) {
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
                Your doctor profile has been set up. You can now access clinical features.
              </Typography>
            </Box>
          </Box>

          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Welcome, {formData.full_name || 'Doctor'}!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your profile has been configured with the following information:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.specialty && (
                  <Chip label={`Specialty: ${formData.specialty}`} size="small" />
                )}
                {formData.institution_name && (
                  <Chip label={`Institution: ${formData.institution_name}`} size="small" />
                )}
                {formData.primary_cancer_types.length > 0 && (
                  <Chip 
                    label={`${formData.primary_cancer_types.length} Cancer Type(s)`} 
                    size="small" 
                  />
                )}
                {formData.clinical_trials_enrollment && (
                  <Chip label="Clinical Trials Enrollment" color="primary" size="small" />
                )}
              </Box>
            </CardContent>
          </Card>

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
              onClick={() => navigate('/universal-complete-care')}
              disabled={!isOncologist}
              startIcon={<LocalHospitalIcon />}
            >
              Continue to Clinical Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Main Onboarding Form
  return (
    <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Oncologist Onboarding
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please provide your professional information to get started. This helps us personalize your clinical experience and enable access to MOAT clinical features.
        </Typography>
        
        {persona && !isOncologist && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This page is only accessible to oncologist persona. Your current persona: {persona}
          </Alert>
        )}

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
                Professional Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={handleChange('full_name')}
                required
                placeholder="Dr. Jane Smith"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Medical Specialty"
                value={formData.specialty}
                onChange={handleChange('specialty')}
                required
              >
                <MenuItem value="Medical Oncology">Medical Oncology</MenuItem>
                <MenuItem value="Gynecologic Oncology">Gynecologic Oncology</MenuItem>
                <MenuItem value="Hematology/Oncology">Hematology/Oncology</MenuItem>
                <MenuItem value="Radiation Oncology">Radiation Oncology</MenuItem>
                <MenuItem value="Surgical Oncology">Surgical Oncology</MenuItem>
                <MenuItem value="Pediatric Oncology">Pediatric Oncology</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sub-Specialty (Optional)"
                value={formData.sub_specialty}
                onChange={handleChange('sub_specialty')}
                placeholder="e.g., Breast Cancer, Gynecologic Oncology"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NPI (Optional)"
                value={formData.npi}
                onChange={handleChange('npi')}
                placeholder="10-digit NPI"
                inputProps={{ maxLength: 10 }}
                helperText="National Provider Identifier (10 digits)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medical License Number (Optional)"
                value={formData.license_number}
                onChange={handleChange('license_number')}
                placeholder="MD12345"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License State (Optional)"
                value={formData.license_state}
                onChange={handleChange('license_state')}
                placeholder="NY"
                inputProps={{ maxLength: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Institution/Organization
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Institution Name"
                value={formData.institution_name}
                onChange={handleChange('institution_name')}
                required
                placeholder="Memorial Sloan Kettering Cancer Center"
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Institution Type"
                value={formData.institution_type}
                onChange={handleChange('institution_type')}
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value="Academic">Academic Medical Center</MenuItem>
                <MenuItem value="Community">Community Hospital</MenuItem>
                <MenuItem value="Private Practice">Private Practice</MenuItem>
                <MenuItem value="Research Institute">Research Institute</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.institution_city}
                onChange={handleChange('institution_city')}
                placeholder="New York"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.institution_state}
                onChange={handleChange('institution_state')}
                placeholder="NY"
                inputProps={{ maxLength: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Clinical Focus
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={CANCER_TYPES}
                value={formData.primary_cancer_types}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, primary_cancer_types: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Primary Cancer Types Treated"
                    placeholder="Select cancer types"
                    helperText="Select all cancer types you primarily treat"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.clinical_trials_enrollment}
                    onChange={handleChange('clinical_trials_enrollment')}
                    color="primary"
                  />
                }
                label="I enroll patients in clinical trials"
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={RESEARCH_INTERESTS_OPTIONS}
                value={formData.research_interests}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, research_interests: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Research Interests (Optional)"
                    placeholder="Select research interests"
                    helperText="Select areas of research interest"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Preferred Communication Method"
                value={formData.preferred_communication}
                onChange={handleChange('preferred_communication')}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="both">Email + SMS</MenuItem>
                <MenuItem value="none">No notifications</MenuItem>
              </TextField>
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

export default OncologistOnboarding;
