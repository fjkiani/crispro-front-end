/**
 * ⚔️ VARIANT INPUT COMPONENT ⚔️
 * 
 * Multi-mode variant entry:
 * - Genomic coordinates (chrom:pos ref>alt)
 * - HGVS notation (protein or cDNA)
 * - Gene + consequence
 * 
 * Validation and auto-completion for common genes
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Typography,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { PlayArrow, Clear, Help } from '@mui/icons-material';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';
import { validateVariant, formatVariant } from '../utils/genomicsUtils';

// Common cancer genes for autocomplete
const COMMON_GENES = [
  'BRCA1', 'BRCA2', 'TP53', 'BRAF', 'KRAS', 'NRAS', 'PIK3CA',
  'EGFR', 'ALK', 'ROS1', 'ERBB2', 'MET', 'RET', 'PTEN',
  'APC', 'ATM', 'CHEK2', 'PALB2', 'CDH1', 'STK11',
  'PSMB5', 'CRBN', 'FGFR1', 'FGFR2', 'FGFR3'
];

const CHROMOSOMES = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', 'X', 'Y', 'MT'
];

const CONSEQUENCES = [
  'missense_variant',
  'frameshift_variant',
  'stop_gained',
  'stop_lost',
  'splice_donor_variant',
  'splice_acceptor_variant',
  'inframe_insertion',
  'inframe_deletion'
];

export const VariantInput = ({ onSubmit }) => {
  const { variant, updateVariant, clearAll } = useClinicalGenomicsContext();
  const [mode, setMode] = useState('genomic'); // 'genomic', 'hgvs', 'gene'
  const [validationError, setValidationError] = useState(null);

  const handleFieldChange = (field, value) => {
    updateVariant({ [field]: value });
    setValidationError(null);
  };

  const handleSubmit = () => {
    const validation = validateVariant(variant);
    
    if (!validation.isValid) {
      setValidationError(Object.values(validation.errors).join('; '));
      return;
    }

    setValidationError(null);
    if (onSubmit) {
      onSubmit(variant);
    }
  };

  const handleClear = () => {
    clearAll();
    setValidationError(null);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          🧬 Variant Input
        </Typography>
        <Box>
          <Tooltip title="Accepts genomic coordinates, HGVS notation, or gene + variant">
            <IconButton size="small">
              <Help />
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<Clear />}
            onClick={handleClear}
            size="small"
          >
            Clear
          </Button>
        </Box>
      </Box>

      {/* Mode Selector */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Input Mode</InputLabel>
          <Select
            value={mode}
            label="Input Mode"
            onChange={(e) => setMode(e.target.value)}
          >
            <MenuItem value="genomic">Genomic Coordinates</MenuItem>
            <MenuItem value="hgvs">HGVS Notation</MenuItem>
            <MenuItem value="gene">Gene + Consequence</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Genomic Mode */}
      {mode === 'genomic' && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Gene Symbol"
              value={variant.gene || ''}
              onChange={(e) => handleFieldChange('gene', e.target.value.toUpperCase())}
              placeholder="e.g., BRAF"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Chr</InputLabel>
              <Select
                value={variant.chrom || ''}
                label="Chr"
                onChange={(e) => handleFieldChange('chrom', e.target.value)}
              >
                {CHROMOSOMES.map(chr => (
                  <MenuItem key={chr} value={chr}>{chr}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Position"
              type="number"
              value={variant.pos || ''}
              onChange={(e) => handleFieldChange('pos', e.target.value)}
              placeholder="e.g., 140753336"
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              size="small"
              label="REF"
              value={variant.ref || ''}
              onChange={(e) => handleFieldChange('ref', e.target.value.toUpperCase())}
              placeholder="A"
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              size="small"
              label="ALT"
              value={variant.alt || ''}
              onChange={(e) => handleFieldChange('alt', e.target.value.toUpperCase())}
              placeholder="T"
            />
          </Grid>
        </Grid>
      )}

      {/* HGVS Mode */}
      {mode === 'hgvs' && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Gene Symbol"
              value={variant.gene || ''}
              onChange={(e) => handleFieldChange('gene', e.target.value.toUpperCase())}
              placeholder="e.g., BRAF"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="HGVS Protein (p.)"
              value={variant.hgvs_p || ''}
              onChange={(e) => handleFieldChange('hgvs_p', e.target.value)}
              placeholder="e.g., p.Val600Glu or V600E"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="HGVS cDNA (c.)"
              value={variant.hgvs_c || ''}
              onChange={(e) => handleFieldChange('hgvs_c', e.target.value)}
              placeholder="e.g., c.1799T>A"
            />
          </Grid>
        </Grid>
      )}

      {/* Gene + Consequence Mode */}
      {mode === 'gene' && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Gene Symbol"
              value={variant.gene || ''}
              onChange={(e) => handleFieldChange('gene', e.target.value.toUpperCase())}
              placeholder="e.g., BRAF"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Consequence</InputLabel>
              <Select
                value={variant.consequence || ''}
                label="Consequence"
                onChange={(e) => handleFieldChange('consequence', e.target.value)}
              >
                {CONSEQUENCES.map(csq => (
                  <MenuItem key={csq} value={csq}>
                    {csq.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="HGVS (optional)"
              value={variant.hgvs_p || ''}
              onChange={(e) => handleFieldChange('hgvs_p', e.target.value)}
              placeholder="e.g., V600E"
            />
          </Grid>
        </Grid>
      )}

      {/* Validation Error */}
      {validationError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {validationError}
        </Alert>
      )}

      {/* Current Variant Display */}
      {variant.gene && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Current variant:</Typography>
          <Chip
            label={formatVariant(variant)}
            color="primary"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>
      )}

      {/* Submit Button */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrow />}
          onClick={handleSubmit}
          disabled={!variant.gene}
        >
          Analyze Variant
        </Button>
      </Box>

      {/* Quick Examples */}
      <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Quick Examples:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="BRCA1 frameshift"
            size="small"
            onClick={() => {
              updateVariant({
                gene: 'BRCA1',
                chrom: '17',
                pos: '43044295',
                ref: 'C',
                alt: 'CA',
                consequence: 'frameshift_variant'
              });
            }}
          />
          <Chip
            label="BRAF V600E"
            size="small"
            onClick={() => {
              updateVariant({
                gene: 'BRAF',
                hgvs_p: 'p.Val600Glu',
                consequence: 'missense_variant'
              });
            }}
          />
          <Chip
            label="TP53 R175H"
            size="small"
            onClick={() => {
              updateVariant({
                gene: 'TP53',
                hgvs_p: 'p.Arg175His',
                consequence: 'missense_variant'
              });
            }}
          />
        </Box>
      </Box>

      {/* Research Use Disclaimer */}
      <Alert severity="warning" sx={{ mt: 2 }}>
        <strong>Research Use Only</strong> - Not for clinical diagnosis or treatment decisions
      </Alert>
    </Paper>
  );
};

export default VariantInput;


