/**
 * Ayesha Dossier Browser Page
 * 
 * Browse all doctor-initiated dossiers with:
 * - Tier filtering (Top/Good/All)
 * - Search by ID or keywords
 * - Sort by match score
 * - Click to view full dossier
 * 
 * Data source: localStorage via dossierStore (no backend dependency)
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Paper,
  InputAdornment,
  Chip,
  Button,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import DossierSummaryCard from '../../components/ayesha/DossierSummaryCard';
import { listDossiers, getDossierStats } from '../../utils/dossierStore';


const AyeshaDossierBrowser = () => {
  const [dossiers, setDossiers] = useState([]);
  const [filteredDossiers, setFilteredDossiers] = useState([]);
  const [stats, setStats] = useState(null);

  const [tierFilter, setTierFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const all = listDossiers();
    setDossiers(all);
    setStats(getDossierStats());
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tierFilter, searchQuery, dossiers]);

  const applyFilters = () => {
    let filtered = [...dossiers];

    if (tierFilter !== 'ALL') {
      filtered = filtered.filter(d => d.tier === tierFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        (d.nct_id || '').toLowerCase().includes(query) ||
        (d.title || '').toLowerCase().includes(query)
      );
    }

    setFilteredDossiers(filtered);
  };

  const handleExportAll = () => {
    for (const dossier of filteredDossiers) {
      if (!dossier.markdown) continue;
      const blob = new Blob([dossier.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dossier.nct_id}_DOSSIER.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
    if (filteredDossiers.length > 0) {
      alert(`Exported ${filteredDossiers.length} dossiers`);
    }
  };

  const topTierCount = dossiers.filter(d => d.tier === 'TOP_TIER').length;
  const goodTierCount = dossiers.filter(d => d.tier === 'GOOD_TIER').length;

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          ⚔️ Ayesha's Clinical Intelligence Dossiers
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {dossiers.length} Commander-grade dossiers with mechanistic fit analysis
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
          <Chip
            label="Patient: AK (Stage IVB HGSOC)"
            color="primary"
          />
          {stats && stats.total > 0 && (
            <Chip
              label={`Avg Score: ${Math.round(stats.avg_score * 100)}%`}
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by ID or keywords..."
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
        {filteredDossiers.length > 0 && (
          <Button
            onClick={handleExportAll}
            variant="outlined"
            size="small"
          >
            Export All ({filteredDossiers.length})
          </Button>
        )}
      </Box>

      {/* Empty State */}
      {dossiers.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>No dossiers generated yet</Typography>
          <Typography variant="body2">
            Go to the <strong>Strategy Board</strong> → click <strong>"Inform Doctor"</strong> on any drug recommendation to generate your first dossier.
          </Typography>
        </Alert>
      ) : filteredDossiers.length === 0 ? (
        <Alert severity="info">
          No dossiers match your filters. Try adjusting your search or tier filter.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredDossiers.map((dossier, idx) => (
            <Grid item xs={12} key={dossier.nct_id || idx}>
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
