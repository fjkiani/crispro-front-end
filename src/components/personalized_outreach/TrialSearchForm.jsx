import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { API_ROOT } from '../../lib/apiConfig';


const TrialSearchForm = ({ onResults }) => {
  const [conditions, setConditions] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [phases, setPhases] = useState([]);
  const [status, setStatus] = useState(['RECRUITING']);
  const [maxResults, setMaxResults] = useState(100);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/personalized-outreach/search-trials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conditions: conditions.map(c => typeof c === 'string' ? c : c.label),
          interventions: interventions.map(i => typeof i === 'string' ? i : i.label),
          keywords: keywords.map(k => typeof k === 'string' ? k : k.label),
          phases: phases.map(p => typeof p === 'string' ? p : p.label),
          status: status.map(s => typeof s === 'string' ? s : s.label),
          max_results: maxResults,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      onResults(data.trials || []);
    } catch (err) {
      setError(err.message);
      onResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Search Clinical Trials
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={conditions}
            onChange={(e, newValue) => setConditions(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Conditions (e.g., ovarian cancer)" />
            )}
          />

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={interventions}
            onChange={(e, newValue) => setInterventions(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Interventions (e.g., carboplatin)" />
            )}
          />

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={keywords}
            onChange={(e, newValue) => setKeywords(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Keywords (e.g., CA-125, biomarker)" />
            )}
          />

          <Autocomplete
            multiple
            options={['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']}
            value={phases}
            onChange={(e, newValue) => setPhases(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Phases" />
            )}
          />

          <Autocomplete
            multiple
            options={['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'COMPLETED', 'TERMINATED']}
            value={status}
            onChange={(e, newValue) => setStatus(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Status" />
            )}
          />

          <TextField
            type="number"
            label="Max Results"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value) || 100)}
            inputProps={{ min: 1, max: 500 }}
          />

          <Button
            variant="contained"
            startIcon={isSearching ? <CircularProgress size={16} /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={isSearching}
            fullWidth
          >
            {isSearching ? 'Searching...' : 'Search Trials'}
          </Button>

          {error && (
            <Alert severity="error">{error}</Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrialSearchForm;
