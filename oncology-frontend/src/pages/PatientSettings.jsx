import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';

/**
 * PatientSettings - Settings page for patients
 * 
 * Allows patients to manage:
 * - Account information
 * - Notification preferences
 * - Privacy settings
 */
const PatientSettings = () => {
  const navigate = useNavigate();
  const { user, profile: authProfile } = useAuth();
  const { currentPatient, patientProfile } = usePatient();
  
  const patient = currentPatient || patientProfile || authProfile;
  
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: patient?.email || user?.email || '',
    phone: patient?.phone || '',
    notifications: {
      emailNotifications: true,
      trialAlerts: true,
      carePlanUpdates: true,
    },
    privacy: {
      shareDataForResearch: false,
      allowAnalytics: true,
    },
  });

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      // TODO: Implement API call to save settings
      // const response = await fetch(`${import.meta.env.VITE_API_ROOT}/api/patient/settings`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/patient/dashboard')}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight="bold">
            Settings
          </Typography>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Settings saved successfully!
          </Alert>
        )}

        {/* Account Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Notification Preferences */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notifications.emailNotifications}
                  onChange={(e) =>
                    handleChange('notifications.emailNotifications', e.target.checked)
                  }
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notifications.trialAlerts}
                  onChange={(e) =>
                    handleChange('notifications.trialAlerts', e.target.checked)
                  }
                />
              }
              label="Clinical Trial Alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notifications.carePlanUpdates}
                  onChange={(e) =>
                    handleChange('notifications.carePlanUpdates', e.target.checked)
                  }
                />
              }
              label="Care Plan Updates"
            />
          </Box>
        </Box>

        {/* Privacy Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Privacy Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.privacy.shareDataForResearch}
                  onChange={(e) =>
                    handleChange('privacy.shareDataForResearch', e.target.checked)
                  }
                />
              }
              label="Share anonymized data for research purposes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.privacy.allowAnalytics}
                  onChange={(e) =>
                    handleChange('privacy.allowAnalytics', e.target.checked)
                  }
                />
              }
              label="Allow analytics and usage tracking"
            />
          </Box>
        </Box>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/patient/dashboard')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Paper>

      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Research Use Only:</strong> This platform is for research and educational purposes only. 
          Consult with your healthcare provider for clinical decision-making.
        </Typography>
      </Alert>
    </Container>
  );
};

export default PatientSettings;
