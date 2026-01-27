/**
 * Patient Profile Page
 * 
 * Display and edit patient profile information.
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
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { usePatient } from '../context/PatientContext';
import { useNavigate } from 'react-router-dom';

export default function PatientProfile() {
  const { patientProfile, loading, updatePatientProfile, updateCA125 } = usePatient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [ca125Value, setCa125Value] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (patientProfile?.ca125_value) {
      setCa125Value(patientProfile.ca125_value.toString());
    }
  }, [patientProfile]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!patientProfile) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Patient profile not found. Please complete onboarding.
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/patient/onboarding')}
        >
          Go to Onboarding
        </Button>
      </Box>
    );
  }

  const handleSaveCA125 = async () => {
    const value = parseFloat(ca125Value);
    if (isNaN(value) || value < 0) {
      setError('CA-125 value must be a positive number');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateCA125(value);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update CA-125');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Patient Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Full Name
              </Typography>
              <Typography variant="body1">
                {patientProfile.full_name || 'Not provided'}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Patient ID
              </Typography>
              <Typography variant="body1">
                {patientProfile.patient_id || 'Not assigned'}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Disease
              </Typography>
              <Typography variant="body1">
                {patientProfile.disease || 'Not specified'}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Stage
              </Typography>
              <Typography variant="body1">
                {patientProfile.stage || 'Not specified'}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Histology
              </Typography>
              <Typography variant="body1">
                {patientProfile.histology || 'Not specified'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Biomarkers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Biomarkers
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                CA-125 Value (U/mL)
              </Typography>
              {editing ? (
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    type="number"
                    value={ca125Value}
                    onChange={(e) => setCa125Value(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveCA125}
                    disabled={saving}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditing(false);
                      setCa125Value(patientProfile.ca125_value?.toString() || '');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="body1">
                    {patientProfile.ca125_value ? patientProfile.ca125_value.toLocaleString() : 'Not available'}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                </Box>
              )}
              {patientProfile.ca125_last_updated && (
                <Typography variant="caption" color="text.secondary">
                  Last updated: {new Date(patientProfile.ca125_last_updated).toLocaleDateString()}
                </Typography>
              )}
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Germline Status
              </Typography>
              <Chip
                label={patientProfile.germline_status || 'Unknown'}
                color={patientProfile.germline_status === 'positive' ? 'error' : 'default'}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Treatment Line
              </Typography>
              <Typography variant="body1">
                {patientProfile.treatment_line || 0} {patientProfile.treatment_line === 0 ? '(treatment-naive)' : ''}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Treatment History */}
        {patientProfile.treatment_history && patientProfile.treatment_history.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Treatment History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {patientProfile.treatment_history.map((treatment, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`Line ${treatment.line}: ${treatment.drugs?.join(', ') || 'N/A'}`}
                      secondary={
                        <>
                          {treatment.start_date && `Start: ${treatment.start_date}`}
                          {treatment.end_date && ` • End: ${treatment.end_date}`}
                          {treatment.outcome && ` • Outcome: ${treatment.outcome}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Location */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              {patientProfile.location_city || 'Not specified'}
              {patientProfile.location_state && `, ${patientProfile.location_state}`}
            </Typography>
          </Paper>
        </Grid>

        {/* Tumor Context */}
        {patientProfile.tumor_context && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tumor Context (NGS Data)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                NGS data available
              </Typography>
              {patientProfile.tumor_context.tmb && (
                <Typography variant="body2">
                  TMB: {patientProfile.tumor_context.tmb} mutations/Mb
                </Typography>
              )}
              {patientProfile.tumor_context.hrd_score && (
                <Typography variant="body2">
                  HRD Score: {patientProfile.tumor_context.hrd_score}
                </Typography>
              )}
              {patientProfile.tumor_context.msi_status && (
                <Typography variant="body2">
                  MSI Status: {patientProfile.tumor_context.msi_status}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}







