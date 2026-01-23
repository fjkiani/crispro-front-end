/**
 * MutationInputForm Component
 * 
 * Form for entering patient mutations for synthetic lethality analysis.
 * Supports multiple mutations with gene, variant, and consequence.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add,
  Delete,
  Science,
  Biotech
} from '@mui/icons-material';

// Common cancer genes for autocomplete
const COMMON_GENES = [
  'BRCA1', 'BRCA2', 'TP53', 'MBD4', 'ATM', 'ATR', 'CHEK2', 'PALB2',
  'RAD51', 'MLH1', 'MSH2', 'MSH6', 'PMS2', 'PTEN', 'RB1', 'MUTYH',
  'KRAS', 'BRAF', 'NRAS', 'PIK3CA', 'APC', 'EGFR', 'HER2', 'ALK'
];

// Consequence types
const CONSEQUENCE_TYPES = [
  { value: 'frameshift_variant', label: 'Frameshift' },
  { value: 'stop_gained', label: 'Stop Gained (Nonsense)' },
  { value: 'missense_variant', label: 'Missense' },
  { value: 'splice_donor_variant', label: 'Splice Donor' },
  { value: 'splice_acceptor_variant', label: 'Splice Acceptor' },
  { value: 'inframe_deletion', label: 'In-frame Deletion' },
  { value: 'inframe_insertion', label: 'In-frame Insertion' }
];

// Germline status options
const GERMLINE_OPTIONS = [
  { value: 'germline', label: 'Germline' },
  { value: 'somatic', label: 'Somatic' },
  { value: 'unknown', label: 'Unknown' }
];

/**
 * @param {Object} props
 * @param {Array} props.mutations - Current mutations array
 * @param {Function} props.onMutationsChange - Callback when mutations change
 */
const MutationInputForm = ({
  mutations = [],
  onMutationsChange
}) => {
  const [newMutation, setNewMutation] = useState({
    gene: '',
    hgvs_p: '',
    consequence: 'missense_variant',
    germline_status: 'unknown',
    chrom: '',
    pos: '',
    ref: '',
    alt: ''
  });

  const handleAddMutation = () => {
    if (!newMutation.gene) return;

    const mutation = {
      ...newMutation,
      id: Date.now() // Unique ID for key
    };

    onMutationsChange([...mutations, mutation]);
    
    // Reset form
    setNewMutation({
      gene: '',
      hgvs_p: '',
      consequence: 'missense_variant',
      germline_status: 'unknown',
      chrom: '',
      pos: '',
      ref: '',
      alt: ''
    });
  };

  const handleRemoveMutation = (index) => {
    const updated = mutations.filter((_, i) => i !== index);
    onMutationsChange(updated);
  };

  const handleFieldChange = (field, value) => {
    setNewMutation(prev => ({ ...prev, [field]: value }));
  };

  // Pre-fill example for Ayesha case
  const loadAyeshaExample = () => {
    onMutationsChange([
      {
        id: 1,
        gene: 'MBD4',
        hgvs_p: 'p.Ile413Serfs*2',
        consequence: 'frameshift_variant',
        germline_status: 'germline',
        chrom: '3',
        pos: 129430456,
        ref: 'A',
        alt: ''
      },
      {
        id: 2,
        gene: 'TP53',
        hgvs_p: 'p.Arg175His',
        consequence: 'missense_variant',
        germline_status: 'somatic',
        chrom: '17',
        pos: 7577120,
        ref: 'G',
        alt: 'A'
      }
    ]);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Biotech color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Genetic Mutations
          </Typography>
        </Box>
        <Tooltip title="Load example case (MBD4 + TP53)">
          <Button
            size="small"
            variant="outlined"
            onClick={loadAyeshaExample}
          >
            Load Example
          </Button>
        </Tooltip>
      </Box>

      {/* Current Mutations List */}
      {mutations.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Added Mutations ({mutations.length})
          </Typography>
          <Stack spacing={1}>
            {mutations.map((mut, index) => (
              <Box
                key={mut.id || index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={mut.gene}
                    color="primary"
                    size="small"
                  />
                  <Typography variant="body2">
                    {mut.hgvs_p || 'Variant'}
                  </Typography>
                  <Chip
                    label={mut.consequence?.replace('_variant', '').replace('_', ' ')}
                    size="small"
                    variant="outlined"
                    color={mut.consequence?.includes('frameshift') ? 'error' : 'default'}
                  />
                  {mut.germline_status && mut.germline_status !== 'unknown' && (
                    <Chip
                      label={mut.germline_status}
                      size="small"
                      variant="outlined"
                      color={mut.germline_status === 'germline' ? 'secondary' : 'default'}
                    />
                  )}
                </Stack>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveMutation(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Add New Mutation Form */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Add Mutation
      </Typography>
      
      <Grid container spacing={2}>
        {/* Gene */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Gene</InputLabel>
            <Select
              value={newMutation.gene}
              onChange={(e) => handleFieldChange('gene', e.target.value)}
              label="Gene"
            >
              {COMMON_GENES.map(gene => (
                <MenuItem key={gene} value={gene}>{gene}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Protein Change */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Protein Change (HGVS)"
            placeholder="e.g., p.R175H"
            value={newMutation.hgvs_p}
            onChange={(e) => handleFieldChange('hgvs_p', e.target.value)}
          />
        </Grid>

        {/* Consequence */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Consequence</InputLabel>
            <Select
              value={newMutation.consequence}
              onChange={(e) => handleFieldChange('consequence', e.target.value)}
              label="Consequence"
            >
              {CONSEQUENCE_TYPES.map(c => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Germline Status */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Origin</InputLabel>
            <Select
              value={newMutation.germline_status}
              onChange={(e) => handleFieldChange('germline_status', e.target.value)}
              label="Origin"
            >
              {GERMLINE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Add Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddMutation}
            disabled={!newMutation.gene}
          >
            Add Mutation
          </Button>
        </Grid>
      </Grid>

      {/* Optional Genomic Coordinates */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Optional: Genomic Coordinates (for enhanced Evo2 scoring)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Chromosome"
              placeholder="17"
              value={newMutation.chrom}
              onChange={(e) => handleFieldChange('chrom', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Position"
              placeholder="7577120"
              value={newMutation.pos}
              onChange={(e) => handleFieldChange('pos', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Ref"
              placeholder="G"
              value={newMutation.ref}
              onChange={(e) => handleFieldChange('ref', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Alt"
              placeholder="A"
              value={newMutation.alt}
              onChange={(e) => handleFieldChange('alt', e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MutationInputForm;




