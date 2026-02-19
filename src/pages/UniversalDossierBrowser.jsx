/**
 * Universal Dossier Browser Page
 * 
 * Browse trial intelligence dossiers for any patient.
 * Similar to AyeshaDossierBrowser but patient-agnostic.
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import UniversalDossierSummaryCard from '../components/universal/UniversalDossierSummaryCard';
import PatientProfileForm from '../components/universal/PatientProfileForm';
import { API_ROOT } from '../lib/apiConfig';


const UniversalDossierBrowser = () => {
  const [patientId, setPatientId] = useState('');
  const [dossiers, setDossiers] = useState([]);
  const [filteredDossiers, setFilteredDossiers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  const [tierFilter, setTierFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (patientId) {
      loadDossiers();
    }
  }, [patientId]);

  useEffect(() => {
    applyFilters();
  }, [tierFilter, searchQuery, dossiers]);

  const loadDossiers = async () => {
    if (!patientId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/dossiers/intelligence/list/${patientId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDossiers(data.dossiers || []);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to load dossiers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...dossiers];

    // Tier filter
    if (tierFilter !== 'ALL') {
      filtered = filtered.filter(d => d.tier === tierFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.nct_id.toLowerCase().includes(query) ||
        (d.title && d.title.toLowerCase().includes(query))
      );
    }

    setFilteredDossiers(filtered);
  };

  const handleProfileSave = (profile) => {
    setPatientProfile(profile);
    setPatientId(profile.patient_id || profile.demographics?.patient_id);
    setShowProfileForm(false);
  };

  const handleExportDossier = async (nctId) => {
    try {
      const response = await fetch(
        `${API_ROOT}/api/dossiers/intelligence/${patientId}/${nctId}`
      );
      const data = await response.json();
      
      // Create markdown file
      const blob = new Blob([data.markdown], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nctId}_DOSSIER.md`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export dossier:', err);
      alert('Failed to export dossier');
    }
  };

  const topTierCount = dossiers.filter(d => d.tier === 'TOP_TIER').length;
  const goodTierCount = dossiers.filter(d => d.tier === 'GOOD_TIER').length;

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          ⚔️ Universal Clinical Trial Intelligence Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Browse and manage trial intelligence dossiers for any patient
        </Typography>
      </Box>

      {/* Patient Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g., patient_001"
              helperText="Enter patient ID to view their dossiers"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              onClick={() => setShowProfileForm(!showProfileForm)}
              fullWidth
            >
              {showProfileForm ? 'Hide' : 'Create New Patient Profile'}
            </Button>
          </Grid>
        </Grid>

        {showProfileForm && (
          <Box mt={2}>
            <PatientProfileForm onSave={handleProfileSave} />
          </Box>
        )}
      </Paper>

      {!patientId && (
        <Alert severity="info">
          Please select or create a patient profile to view dossiers.
        </Alert>
      )}

      {patientId && (
        <>
          {/* Stats */}
          <Box mb={2} display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label={`Patient: ${patientId}`}
              color="primary"
            />
            <Chip 
              label={`Total: ${dossiers.length}`}
              variant="outlined"
            />
            <Chip 
              label={`Top Tier: ${topTierCount}`}
              variant="outlined"
              color="success"
            />
            <Chip 
              label={`Good Tier: ${goodTierCount}`}
              variant="outlined"
              color="info"
            />
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by NCT ID or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Tier Filter */}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <FilterIcon />
                  <ToggleButtonGroup
                    value={tierFilter}
                    exclusive
                    onChange={(e, value) => value && setTierFilter(value)}
                    size="small"
                  >
                    <ToggleButton value="ALL">
                      All ({dossiers.length})
                    </ToggleButton>
                    <ToggleButton value="TOP_TIER">
                      Top Tier ({topTierCount})
                    </ToggleButton>
                    <ToggleButton value="GOOD_TIER">
                      Good Tier ({goodTierCount})
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {isLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Loading dossiers...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              <Button onClick={loadDossiers} sx={{ mt: 1 }} variant="outlined" size="small">
                Retry
              </Button>
            </Alert>
          )}

          {!isLoading && !error && (
            <>
              {/* Results Count */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredDossiers.length} of {dossiers.length} dossiers
                </Typography>
              </Box>

              {/* Dossier Grid */}
              {filteredDossiers.length === 0 ? (
                <Alert severity="info">
                  {dossiers.length === 0 
                    ? 'No dossiers found for this patient. Generate dossiers using the Trial Intelligence interface.'
                    : 'No dossiers match your filters. Try adjusting your search or tier filter.'}
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {filteredDossiers.map((dossier, idx) => (
                    <Grid item xs={12} key={dossier.nct_id || dossier.dossier_id}>
                      <UniversalDossierSummaryCard 
                        dossier={dossier}
                        rank={idx + 1}
                        patientId={patientId}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default UniversalDossierBrowser;

