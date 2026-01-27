import React from 'react';
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Box,
  Typography
} from '@mui/material';

/**
 * TrialFilters Component
 * 
 * Filter component for Disease Category, Phase, and State.
 * 
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {string} props.filters.diseaseCategory - Selected disease category
 * @param {string[]} props.filters.phase - Selected phases (multi-select)
 * @param {string} props.filters.state - Selected state
 * @param {Function} props.onFiltersChange - Callback when filters change
 * @param {Function} props.onClearFilters - Callback to clear all filters
 */
const TrialFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const handleDiseaseChange = (event) => {
    onFiltersChange({
      ...filters,
      diseaseCategory: event.target.value
    });
  };

  const handlePhaseChange = (event) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      phase: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleStateChange = (event) => {
    onFiltersChange({
      ...filters,
      state: event.target.value
    });
  };

  const hasActiveFilters = 
    filters.diseaseCategory || 
    filters.phase.length > 0 || 
    filters.state;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Disease Category Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Disease Category</InputLabel>
            <Select
              value={filters.diseaseCategory}
              onChange={handleDiseaseChange}
              label="Disease Category"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="gynecologic_oncology">Gynecologic Oncology</MenuItem>
              <MenuItem value="breast_cancer">Breast Cancer</MenuItem>
              <MenuItem value="lung_cancer">Lung Cancer</MenuItem>
            </Select>
          </FormControl>

          {/* Phase Filter (Multi-select) */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Phase</InputLabel>
            <Select
              multiple
              value={filters.phase}
              onChange={handlePhaseChange}
              label="Phase"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="PHASE2">Phase 2</MenuItem>
              <MenuItem value="PHASE3">Phase 3</MenuItem>
              <MenuItem value="PHASE4">Phase 4</MenuItem>
            </Select>
          </FormControl>

          {/* State Filter */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>State</InputLabel>
            <Select
              value={filters.state}
              onChange={handleStateChange}
              label="State"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="NY">New York</MenuItem>
              <MenuItem value="NJ">New Jersey</MenuItem>
              <MenuItem value="CT">Connecticut</MenuItem>
              <MenuItem value="CA">California</MenuItem>
            </Select>
          </FormControl>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outlined"
              onClick={onClearFilters}
              sx={{ alignSelf: 'flex-end' }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrialFilters;

