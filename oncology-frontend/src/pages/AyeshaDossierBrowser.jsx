/**
 * Ayesha Dossier Browser Page
 * 
 * Browse all trial intelligence dossiers with:
 * - Tier filtering (Top/Good/All)
 * - Search by NCT ID or keywords
 * - Sort by match score
 * - Click to view full dossier
 * 
 * Modular architecture:
 * - Uses DossierSummaryCard component (reusable)
 * - Separate filtering logic (can be extracted to hook)
 * - API calls isolated (can be extracted to hook)
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
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import DossierSummaryCard from '../components/ayesha/DossierSummaryCard';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const AyeshaDossierBrowser = () => {
  const [dossiers, setDossiers] = useState([]);
  const [filteredDossiers, setFilteredDossiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [tierFilter, setTierFilter] = useState('ALL'); // ALL | TOP_TIER | GOOD_TIER
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDossiers();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tierFilter, searchQuery, dossiers]);

  const loadDossiers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/ayesha/dossiers/list`);
      
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

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_ROOT}/api/ayesha/dossiers/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
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
        d.title.toLowerCase().includes(query)
      );
    }

    setFilteredDossiers(filtered);
  };

  const handleBatchExport = async (tier = 'TOP_TIER') => {
    const dossiersToExport = dossiers.filter(d => d.tier === tier);
    
    for (const dossier of dossiersToExport) {
      try {
        const response = await fetch(
          `${API_ROOT}/api/ayesha/dossiers/export/${dossier.nct_id}?format=markdown`
        );
        const blob = await response.blob();
        
        // Download each file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dossier.nct_id}_DOSSIER.md`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        // Rate limit downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to export ${dossier.nct_id}:`, err);
      }
    }
    
    alert(`Exported ${dossiersToExport.length} ${tier} dossiers`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading dossiers...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Dossiers</Typography>
          <Typography variant="body2">{error}</Typography>
          <Button onClick={loadDossiers} sx={{ mt: 2 }} variant="outlined">
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  const topTierCount = dossiers.filter(d => d.tier === 'TOP_TIER').length;
  const goodTierCount = dossiers.filter(d => d.tier === 'GOOD_TIER').length;

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          ⚔️ Ayesha's Clinical Trial Intelligence Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {dossiers.length} Commander-grade dossiers with mechanistic fit analysis
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
          <Chip 
            label={`Patient: Ayesha Kiani (Stage IVB HGSOC)`}
            color="primary"
          />
          {stats && (
            <>
              <Chip 
                label={`Avg Score: ${Math.round(stats.avg_score * 100)}%`}
                variant="outlined"
              />
              <Chip 
                label={`LLM Enhanced: ${stats.with_llm}/${stats.total}`}
                variant="outlined"
                color={stats.with_llm > 0 ? 'success' : 'default'}
              />
            </>
          )}
        </Box>
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

      {/* Results Count & Export */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredDossiers.length} of {dossiers.length} dossiers
        </Typography>
        {topTierCount > 0 && (
          <Button
            startIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
            onClick={() => handleBatchExport('TOP_TIER')}
            variant="outlined"
            size="small"
          >
            Export All Top-Tier ({topTierCount})
          </Button>
        )}
      </Box>

      {/* Dossier Grid */}
      {filteredDossiers.length === 0 ? (
        <Alert severity="info">
          No dossiers match your filters. Try adjusting your search or tier filter.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredDossiers.map((dossier, idx) => (
            <Grid item xs={12} key={dossier.nct_id}>
              <DossierSummaryCard 
                dossier={dossier}
                rank={idx + 1}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AyeshaDossierBrowser;






