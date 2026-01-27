/**
 * Patient Onboarding Page
 * 
 * Collect required patient information for initial profile setup.
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
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

export default function PatientOnboarding() {
  const { user, session } = useAuth();
  const { loadPatientContext } = usePatient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    disease: 'ovarian_cancer_hgs',
    stage: 'IVB',
    ca125_value: '',
    germline_status: 'negative',
    treatment_line: '0',
    location_state: 'NY',
    location_city: 'NYC Metro'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await fetch(`${API_ROOT}/api/patient/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          disease: formData.disease,
          stage: formData.stage,
          ca125_value: formData.ca125_value ? parseFloat(formData.ca125_value) : null,
          germline_status: formData.germline_status,
          treatment_line: parseInt(formData.treatment_line) || 0,
          location_state: formData.location_state,
          location_city: formData.location_city
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || 'Failed to create profile');
      }

      // Reload patient context
      if (loadPatientContext) {
        await loadPatientContext();
      }

      // Redirect to trials page
      navigate('/ayesha-trials');
    } catch (err) {
      setError(err.message || 'Failed to create patient profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Patient Onboarding
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please provide your basic information to get started.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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
                  startIcon={loading ? <CircularProgress size={20} /> : null}
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







