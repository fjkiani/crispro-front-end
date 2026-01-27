/**
 * DiseaseSelector Component
 * 
 * Universal disease selector with validation and normalization feedback.
 * Supports abbreviations (MM, CRC, hgsoc) and case-insensitive matching.
 */

import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Box,
  Typography,
} from '@mui/material';

// Disease options (matches backend DISEASE_MAPPINGS)
const DISEASE_OPTIONS = [
  { value: 'ovarian_cancer', label: 'Ovarian Cancer', aliases: ['ovarian', 'hgsoc'] },
  { value: 'ovarian_cancer_hgs', label: 'Ovarian Cancer (HGSOC)', aliases: ['hgsoc'] },
  { value: 'melanoma', label: 'Melanoma' },
  { value: 'multiple_myeloma', label: 'Multiple Myeloma', aliases: ['myeloma', 'mm'] },
  { value: 'breast_cancer', label: 'Breast Cancer', aliases: ['breast'] },
  { value: 'colorectal_cancer', label: 'Colorectal Cancer', aliases: ['colorectal', 'crc'] },
  { value: 'pancreatic_cancer', label: 'Pancreatic Cancer', aliases: ['pancreatic'] },
  { value: 'lung_cancer', label: 'Lung Cancer', aliases: ['lung'] },
  { value: 'prostate_cancer', label: 'Prostate Cancer', aliases: ['prostate'] },
];

// Create alias mapping for quick lookup
const ALIAS_MAP = {};
DISEASE_OPTIONS.forEach(option => {
  ALIAS_MAP[option.value] = option.value; // Direct match
  if (option.aliases) {
    option.aliases.forEach(alias => {
      ALIAS_MAP[alias.toLowerCase()] = option.value;
    });
  }
});

/**
 * Normalize disease input (matches backend logic)
 */
const normalizeDisease = (disease) => {
  if (!disease) return null;
  const normalized = disease.toLowerCase().replace(/\s+/g, '_');
  return ALIAS_MAP[normalized] || normalized;
};

export default function DiseaseSelector({
  value,
  onChange,
  onValidation,
  error,
  helperText,
  ...props
}) {
  const [normalizedDisease, setNormalizedDisease] = useState(null);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    if (value) {
      const normalized = normalizeDisease(value);
      const option = DISEASE_OPTIONS.find(opt => opt.value === normalized);
      
      if (option) {
        setNormalizedDisease(option.label);
        setWarning(null);
        if (onValidation) {
          onValidation({ isValid: true, normalized: normalized, original: value });
        }
      } else {
        // Disease not recognized - show warning
        setNormalizedDisease(`Unknown: ${value}`);
        setWarning(`Disease "${value}" not recognized. Using fallback panel.`);
        if (onValidation) {
          onValidation({ isValid: false, normalized: normalized, original: value });
        }
      }
    } else {
      setNormalizedDisease(null);
      setWarning(null);
    }
  }, [value, onValidation]);

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <Box>
      <FormControl fullWidth error={!!error} {...props}>
        <InputLabel id="disease-select-label">Cancer Type</InputLabel>
        <Select
          labelId="disease-select-label"
          id="disease-select"
          value={value || ''}
          onChange={handleChange}
          label="Cancer Type"
        >
          {DISEASE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
      
      {normalizedDisease && !warning && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Normalized: {normalizedDisease}
        </Typography>
      )}
      
      {warning && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {warning}
        </Alert>
      )}
    </Box>
  );
}
