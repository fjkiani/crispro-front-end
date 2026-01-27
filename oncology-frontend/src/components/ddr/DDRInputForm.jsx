/**
 * DDRInputForm Component
 * 
 * Input form for DDR status calculation.
 * Supports disease site, tumor subtype, mutations, CNA, and HRD assay inputs.
 */
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  IconButton,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { Add, Delete, Science } from '@mui/icons-material';

const DISEASE_SITES = [
  { value: 'ovary', label: 'Ovary' },
  { value: 'breast', label: 'Breast' },
  { value: 'pancreas', label: 'Pancreas' },
  { value: 'prostate', label: 'Prostate' },
  { value: 'other', label: 'Other' }
];

const VARIANT_CLASSIFICATIONS = [
  'pathogenic',
  'likely_pathogenic',
  'VUS',
  'likely_benign',
  'benign'
];

const VARIANT_TYPES = [
  'SNV',
  'indel',
  'rearrangement',
  'CNV'
];

const DDRInputForm = ({ onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState({
    patient_id: initialData?.patient_id || '',
    disease_site: initialData?.disease_site || 'ovary',
    tumor_subtype: initialData?.tumor_subtype || '',
    mutations: initialData?.mutations || [],
    cna: initialData?.cna || [],
    hrd_assay: initialData?.hrd_assay || {
      hrd_score: null,
      hrd_status: '',
      assay_name: ''
    }
  });

  const [newMutation, setNewMutation] = useState({
    gene_symbol: '',
    variant_classification: 'pathogenic',
    variant_type: 'SNV'
  });

  const handleAddMutation = () => {
    if (newMutation.gene_symbol.trim()) {
      setFormData({
        ...formData,
        mutations: [...formData.mutations, { ...newMutation }]
      });
      setNewMutation({ gene_symbol: '', variant_classification: 'pathogenic', variant_type: 'SNV' });
    }
  };

  const handleRemoveMutation = (index) => {
    setFormData({
      ...formData,
      mutations: formData.mutations.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestData = {
      patient_id: formData.patient_id,
      disease_site: formData.disease_site,
      tumor_subtype: formData.tumor_subtype || null,
      mutations: formData.mutations,
      cna: formData.cna.length > 0 ? formData.cna : null,
      hrd_assay: formData.hrd_assay.hrd_score || formData.hrd_assay.hrd_status
        ? formData.hrd_assay
        : null
    };
    onSubmit(requestData);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Science color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            DDR Status Input Form
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Patient ID */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Patient ID"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                required
                fullWidth
              />
            </Grid>

            {/* Disease Site */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Disease Site"
                value={formData.disease_site}
                onChange={(e) => setFormData({ ...formData, disease_site: e.target.value })}
                required
                fullWidth
              >
                {DISEASE_SITES.map((site) => (
                  <MenuItem key={site.value} value={site.value}>
                    {site.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Tumor Subtype */}
            <Grid item xs={12}>
              <TextField
                label="Tumor Subtype (Optional)"
                value={formData.tumor_subtype}
                onChange={(e) => setFormData({ ...formData, tumor_subtype: e.target.value })}
                placeholder="e.g., HGSOC, TNBC, PDAC"
                fullWidth
              />
            </Grid>

            {/* Mutations */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Mutations
              </Typography>

              {/* Existing Mutations */}
              {formData.mutations.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {formData.mutations.map((mutation, idx) => (
                    <Chip
                      key={idx}
                      label={`${mutation.gene_symbol} (${mutation.variant_classification})`}
                      onDelete={() => handleRemoveMutation(idx)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}

              {/* Add Mutation */}
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Gene Symbol"
                      value={newMutation.gene_symbol}
                      onChange={(e) => setNewMutation({ ...newMutation, gene_symbol: e.target.value.toUpperCase() })}
                      placeholder="e.g., BRCA1"
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Classification"
                      value={newMutation.variant_classification}
                      onChange={(e) => setNewMutation({ ...newMutation, variant_classification: e.target.value })}
                      fullWidth
                      size="small"
                    >
                      {VARIANT_CLASSIFICATIONS.map((cls) => (
                        <MenuItem key={cls} value={cls}>
                          {cls}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Type"
                      value={newMutation.variant_type}
                      onChange={(e) => setNewMutation({ ...newMutation, variant_type: e.target.value })}
                      fullWidth
                      size="small"
                    >
                      {VARIANT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="primary"
                      onClick={handleAddMutation}
                      disabled={!newMutation.gene_symbol.trim()}
                    >
                      <Add />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !formData.patient_id || !formData.disease_site}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Calculating...' : 'Calculate DDR Status'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default DDRInputForm;
