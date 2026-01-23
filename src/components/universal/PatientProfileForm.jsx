/**
 * Patient Profile Form Component
 * 
 * Supports both simple and full profile formats.
 * Simple format for quick adoption, full format for power users.
 */
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const PatientProfileForm = ({ initialProfile = null, onSave, mode = 'simple' }) => {
  const [profileMode, setProfileMode] = useState(mode);
  const [simpleProfile, setSimpleProfile] = useState({
    patient_id: initialProfile?.demographics?.patient_id || '',
    name: initialProfile?.demographics?.name || '',
    disease: initialProfile?.disease?.primary_diagnosis || '',
    treatment_line: initialProfile?.treatment?.line || 'first-line',
    location: initialProfile?.logistics?.location || '',
    zip_code: initialProfile?.logistics?.zip_code || initialProfile?.logistics?.home_zip || '',
    age: initialProfile?.demographics?.age || '',
    sex: initialProfile?.demographics?.sex || '',
    stage: initialProfile?.disease?.stage || initialProfile?.disease?.figo_stage || '',
    biomarkers: initialProfile?.biomarkers || {
      her2_status: 'UNKNOWN',
      hrd_status: 'UNKNOWN',
      germline_status: 'NEGATIVE',
    },
  });

  const [fullProfile, setFullProfile] = useState(initialProfile || {
    demographics: {
      patient_id: '',
      name: '',
      age: null,
      sex: '',
      location: '',
    },
    disease: {
      primary_diagnosis: '',
      stage: '',
      figo_stage: '',
      tumor_burden: 'MODERATE',
      performance_status: 1,
    },
    treatment: {
      line: 'first-line',
      line_number: 1,
      status: 'treatment_naive',
      prior_therapies: [],
    },
    biomarkers: {
      her2_status: 'UNKNOWN',
      hrd_status: 'UNKNOWN',
      germline_status: 'NEGATIVE',
    },
    logistics: {
      location: '',
      zip_code: '',
      home_zip: '',
      travel_radius_miles: 50,
      willing_to_travel: true,
    },
    eligibility: {
      age_eligible: true,
      performance_status: 'ECOG 0-2',
      organ_function: {
        hepatic: 'normal',
        renal: 'normal',
        cardiac: 'normal',
        pulmonary: 'normal',
      },
    },
  });

  const handleSimpleChange = (field, value) => {
    setSimpleProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleFullChange = (section, field, value) => {
    setFullProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleBiomarkerChange = (field, value) => {
    if (profileMode === 'simple') {
      setSimpleProfile(prev => ({
        ...prev,
        biomarkers: {
          ...prev.biomarkers,
          [field]: value,
        },
      }));
    } else {
      handleFullChange('biomarkers', field, value);
    }
  };

  const handleSave = () => {
    const profile = profileMode === 'simple' ? simpleProfile : fullProfile;
    if (onSave) {
      onSave(profile);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Patient Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {profileMode === 'simple' 
            ? 'Simple format - Quick and easy to use'
            : 'Full format - Comprehensive patient data'}
        </Typography>
      </Box>

      <Tabs value={profileMode} onChange={(e, v) => setProfileMode(v)} sx={{ mb: 3 }}>
        <Tab label="Simple" value="simple" />
        <Tab label="Full" value="full" />
      </Tabs>

      {profileMode === 'simple' ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Patient ID"
              value={simpleProfile.patient_id}
              onChange={(e) => handleSimpleChange('patient_id', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              value={simpleProfile.name}
              onChange={(e) => handleSimpleChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Disease"
              value={simpleProfile.disease}
              onChange={(e) => handleSimpleChange('disease', e.target.value)}
              required
              placeholder="e.g., ovarian cancer, breast cancer"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Treatment Line</InputLabel>
              <Select
                value={simpleProfile.treatment_line}
                onChange={(e) => handleSimpleChange('treatment_line', e.target.value)}
                label="Treatment Line"
              >
                <MenuItem value="first-line">First-Line</MenuItem>
                <MenuItem value="second-line">Second-Line</MenuItem>
                <MenuItem value="third-line">Third-Line</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={simpleProfile.location}
              onChange={(e) => handleSimpleChange('location', e.target.value)}
              placeholder="e.g., NYC, Los Angeles"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ZIP Code"
              value={simpleProfile.zip_code}
              onChange={(e) => handleSimpleChange('zip_code', e.target.value)}
              placeholder="e.g., 10029"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={simpleProfile.age}
              onChange={(e) => handleSimpleChange('age', parseInt(e.target.value) || '')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sex</InputLabel>
              <Select
                value={simpleProfile.sex}
                onChange={(e) => handleSimpleChange('sex', e.target.value)}
                label="Sex"
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Stage"
              value={simpleProfile.stage}
              onChange={(e) => handleSimpleChange('stage', e.target.value)}
              placeholder="e.g., IVB, III"
            />
          </Grid>
          
          {/* Biomarkers */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Biomarkers
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>HER2 Status</InputLabel>
              <Select
                value={simpleProfile.biomarkers.her2_status}
                onChange={(e) => handleBiomarkerChange('her2_status', e.target.value)}
                label="HER2 Status"
              >
                <MenuItem value="UNKNOWN">Unknown</MenuItem>
                <MenuItem value="POSITIVE">Positive</MenuItem>
                <MenuItem value="NEGATIVE">Negative</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>HRD Status</InputLabel>
              <Select
                value={simpleProfile.biomarkers.hrd_status}
                onChange={(e) => handleBiomarkerChange('hrd_status', e.target.value)}
                label="HRD Status"
              >
                <MenuItem value="UNKNOWN">Unknown</MenuItem>
                <MenuItem value="POSITIVE">Positive</MenuItem>
                <MenuItem value="NEGATIVE">Negative</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Germline Status</InputLabel>
              <Select
                value={simpleProfile.biomarkers.germline_status}
                onChange={(e) => handleBiomarkerChange('germline_status', e.target.value)}
                label="Germline Status"
              >
                <MenuItem value="NEGATIVE">Negative</MenuItem>
                <MenuItem value="POSITIVE">Positive</MenuItem>
                <MenuItem value="UNKNOWN">Unknown</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Full profile mode - Advanced fields available. Use simple mode for quick setup.
        </Alert>
      )}

      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!simpleProfile.patient_id || !simpleProfile.disease}
        >
          Save Profile
        </Button>
      </Box>
    </Paper>
  );
};

export default PatientProfileForm;


