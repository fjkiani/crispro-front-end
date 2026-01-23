/**
 * ⚔️ PATIENT PROFILE INPUT COMPONENT ⚔️
 * 
 * Captures patient context for personalized analysis:
 * - Cancer type and stage
 * - Current/prior therapies
 * - Demographics (age, ethnicity for PharmGKB)
 * - Biomarkers and genetic context
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Chip,
  Autocomplete
} from '@mui/material';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';

const CANCER_TYPES = [
  'Breast Cancer',
  'Lung Cancer (NSCLC)',
  'Lung Cancer (SCLC)',
  'Colorectal Cancer',
  'Multiple Myeloma',
  'Leukemia (AML)',
  'Leukemia (CML)',
  'Lymphoma',
  'Melanoma',
  'Ovarian Cancer',
  'Prostate Cancer',
  'Pancreatic Cancer',
  'Other'
];

const STAGES = ['I', 'II', 'III', 'IV', 'Unknown'];

const COMMON_DRUGS = [
  'Trastuzumab',
  'Pertuzumab',
  'Trastuzumab Deruxtecan',
  'Paclitaxel',
  'Carboplatin',
  'Cisplatin',
  'Doxorubicin',
  'Bortezomib',
  'Lenalidomide',
  'Dexamethasone',
  'Osimertinib',
  'Erlotinib',
  'Pembrolizumab',
  'Nivolumab',
  'Tamoxifen',
  'Letrozole',
  'Palbociclib'
];

const ETHNICITIES = [
  'Caucasian',
  'African American',
  'Asian (East Asian)',
  'Asian (South Asian)',
  'Hispanic/Latino',
  'Native American',
  'Pacific Islander',
  'Mixed',
  'Unknown'
];

export const PatientProfile = () => {
  const { patientProfile, updatePatientProfile } = useClinicalGenomicsContext();

  const handleFieldChange = (field, value) => {
    updatePatientProfile({ [field]: value });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        👤 Patient Context (Optional)
      </Typography>

      <Grid container spacing={2}>
        {/* Cancer Type */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Cancer Type</InputLabel>
            <Select
              value={patientProfile.cancer_type || ''}
              label="Cancer Type"
              onChange={(e) => handleFieldChange('cancer_type', e.target.value)}
            >
              {CANCER_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Stage */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Stage</InputLabel>
            <Select
              value={patientProfile.stage || ''}
              label="Stage"
              onChange={(e) => handleFieldChange('stage', e.target.value)}
            >
              {STAGES.map(stage => (
                <MenuItem key={stage} value={stage}>{stage}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Age */}
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Age (years)"
            type="number"
            value={patientProfile.age || ''}
            onChange={(e) => handleFieldChange('age', parseInt(e.target.value) || null)}
            placeholder="e.g., 55"
          />
        </Grid>

        {/* Ethnicity */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Ethnicity (for PharmGKB)</InputLabel>
            <Select
              value={patientProfile.ethnicity || ''}
              label="Ethnicity (for PharmGKB)"
              onChange={(e) => handleFieldChange('ethnicity', e.target.value)}
            >
              {ETHNICITIES.map(eth => (
                <MenuItem key={eth} value={eth}>{eth}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Current Drugs */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            size="small"
            options={COMMON_DRUGS}
            value={patientProfile.current_drugs || []}
            onChange={(e, newValue) => handleFieldChange('current_drugs', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Current Therapies"
                placeholder="Select drugs..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Grid>

        {/* Prior Therapies */}
        <Grid item xs={12}>
          <Autocomplete
            multiple
            size="small"
            freeSolo
            options={COMMON_DRUGS}
            value={patientProfile.prior_therapies || []}
            onChange={(e, newValue) => handleFieldChange('prior_therapies', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Prior Therapies (Type to add custom)"
                placeholder="Select or type drugs..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  color="secondary"
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        ℹ️ Patient context improves trial matching, resistance prediction, and PharmGKB analysis
      </Typography>
    </Paper>
  );
};

export default PatientProfile;


