import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * PatientContextEditor - Editable patient context for food validation
 * 
 * Allows editing:
 * - Disease type
 * - Treatment line and history
 * - Key biomarkers
 * 
 * Props:
 * @param {Object} initialContext - Initial patient context
 * @param {Function} onUpdate - Callback when context is updated (triggers re-analysis)
 * @param {Function} onReset - Callback to reset to default values
 */
export default function PatientContextEditor({ 
  initialContext = {},
  onUpdate,
  onReset 
}) {
  const [context, setContext] = useState({
    disease: initialContext.disease || 'ovarian_cancer_hgs',
    treatment_line: initialContext.treatment_line || 3,
    prior_therapies: initialContext.prior_therapies || ['carboplatin', 'paclitaxel'],
    biomarkers: {
      brca1_mutant: initialContext.biomarkers?.brca1_mutant || false,
      brca2_mutant: initialContext.biomarkers?.brca2_mutant || false,
      hrd_positive: initialContext.biomarkers?.hrd_positive || false,
      tp53_mutant: initialContext.biomarkers?.tp53_mutant || false,
      high_tmb: initialContext.biomarkers?.high_tmb || false
    }
  });

  const [newTherapy, setNewTherapy] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const diseases = [
    { value: 'ovarian_cancer_hgs', label: 'Ovarian Cancer (HGS)' },
    { value: 'breast_cancer', label: 'Breast Cancer' },
    { value: 'lung_cancer', label: 'Lung Cancer' }
  ];

  useEffect(() => {
    // Compare with initial to detect changes
    const changed = 
      context.disease !== initialContext.disease ||
      context.treatment_line !== initialContext.treatment_line ||
      JSON.stringify(context.prior_therapies) !== JSON.stringify(initialContext.prior_therapies) ||
      JSON.stringify(context.biomarkers) !== JSON.stringify(initialContext.biomarkers || {});
    
    setHasChanges(changed);
  }, [context, initialContext]);

  const handleDiseaseChange = (event) => {
    setContext({ ...context, disease: event.target.value });
  };

  const handleTreatmentLineChange = (event) => {
    setContext({ ...context, treatment_line: parseInt(event.target.value) || 0 });
  };

  const handleAddTherapy = () => {
    if (newTherapy.trim() && !context.prior_therapies.includes(newTherapy.trim())) {
      setContext({
        ...context,
        prior_therapies: [...context.prior_therapies, newTherapy.trim()]
      });
      setNewTherapy('');
    }
  };

  const handleRemoveTherapy = (therapy) => {
    setContext({
      ...context,
      prior_therapies: context.prior_therapies.filter(t => t !== therapy)
    });
  };

  const handleBiomarkerChange = (biomarker) => {
    setContext({
      ...context,
      biomarkers: {
        ...context.biomarkers,
        [biomarker]: !context.biomarkers[biomarker]
      }
    });
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(context);
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultContext = {
      disease: 'ovarian_cancer_hgs',
      treatment_line: 3,
      prior_therapies: ['carboplatin', 'paclitaxel'],
      biomarkers: {
        brca1_mutant: false,
        brca2_mutant: false,
        hrd_positive: false,
        tp53_mutant: false,
        high_tmb: false
      }
    };
    setContext(defaultContext);
    if (onReset) {
      onReset(defaultContext);
    }
    setHasChanges(false);
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Patient Context {hasChanges && <Chip label="Modified" size="small" color="warning" sx={{ ml: 1 }} />}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasChanges && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleUpdate}
                size="small"
              >
                Update Analysis
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                size="small"
              >
                Reset
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Disease Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Disease</InputLabel>
        <Select
          value={context.disease}
          onChange={handleDiseaseChange}
          label="Disease"
        >
          {diseases.map((disease) => (
            <MenuItem key={disease.value} value={disease.value}>
              {disease.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Treatment Line */}
      <TextField
        fullWidth
        label="Treatment Line"
        type="number"
        value={context.treatment_line}
        onChange={handleTreatmentLineChange}
        inputProps={{ min: 1, max: 10 }}
        sx={{ mb: 2 }}
      />

      {/* Treatment History */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Treatment History:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          {context.prior_therapies.map((therapy, idx) => (
            <Chip
              key={idx}
              label={`Line ${idx + 1}: ${therapy}`}
              onDelete={() => handleRemoveTherapy(therapy)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="e.g., Olaparib, Bevacizumab"
            value={newTherapy}
            onChange={(e) => setNewTherapy(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTherapy();
              }
            }}
            size="small"
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddTherapy}
            size="small"
          >
            Add Therapy
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Key Biomarkers */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Key Biomarkers:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={context.biomarkers.brca1_mutant || context.biomarkers.brca2_mutant}
                onChange={() => {
                  // Toggle both BRCA1 and BRCA2 together
                  const newValue = !(context.biomarkers.brca1_mutant || context.biomarkers.brca2_mutant);
                  setContext({
                    ...context,
                    biomarkers: {
                      ...context.biomarkers,
                      brca1_mutant: newValue,
                      brca2_mutant: newValue
                    }
                  });
                }}
              />
            }
            label="BRCA1/2 mutant"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={context.biomarkers.hrd_positive}
                onChange={() => handleBiomarkerChange('hrd_positive')}
              />
            }
            label="HRD-positive"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={context.biomarkers.tp53_mutant}
                onChange={() => handleBiomarkerChange('tp53_mutant')}
              />
            }
            label="TP53 mutant"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={context.biomarkers.high_tmb}
                onChange={() => handleBiomarkerChange('high_tmb')}
              />
            }
            label="High TMB"
          />
        </Box>
      </Box>

      {hasChanges && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Patient context has been modified. Click "Update Analysis" to re-run validation with new parameters.
        </Alert>
      )}
    </Card>
  );
}

PatientContextEditor.propTypes = {
  initialContext: PropTypes.shape({
    disease: PropTypes.string,
    treatment_line: PropTypes.number,
    prior_therapies: PropTypes.arrayOf(PropTypes.string),
    biomarkers: PropTypes.shape({
      brca1_mutant: PropTypes.bool,
      brca2_mutant: PropTypes.bool,
      hrd_positive: PropTypes.bool,
      tp53_mutant: PropTypes.bool,
      high_tmb: PropTypes.bool
    })
  }),
  onUpdate: PropTypes.func,
  onReset: PropTypes.func
};

