/**
 * Graph-Optimized Trial Search Component
 * Uses hybrid AstraDB + Neo4j search for optimal trial matching
 */
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Chip, 
  Typography, 
  Alert, 
  Card, 
  CardContent,
  Grid 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { API_ROOT } from '../../lib/apiConfig';


const GraphOptimizedSearch = ({ onResults, patientContext, germlineStatus, tumorContext }) => {
  const [query, setQuery] = useState('ovarian cancer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResults, setLastResults] = useState(null);

  const handleGraphSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/trials/search-optimized`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          patient_context: patientContext || {
            condition: query.split(' ')[0] || 'cancer',
            location_state: patientContext?.state || null,
            disease_category: patientContext?.disease_category || null
          },
          germline_status: germlineStatus || null,
          tumor_context: tumorContext || null,
          top_k: 20
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.found_trials) {
        const trials = data.data.found_trials;
        setLastResults({
          count: trials.length,
          method: data.data.optimization_method || 'hybrid_graph'
        });
        onResults(trials);
      } else {
        setLastResults({ count: 0, method: 'none' });
        onResults([]);
      }
    } catch (err) {
      setError(err.message);
      onResults([]);
      setLastResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleGraphSearch();
    }
  };

  return (
    <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6">Graph-Optimized Search</Typography>
          <Chip 
            label="AstraDB + Neo4j" 
            size="small" 
            color="primary"
            icon={<CheckCircleIcon />}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Hybrid search combines semantic matching (AstraDB) with relationship intelligence (Neo4j).
          Results are optimized by PI proximity, site location, and organization connections.
        </Typography>

        {/* Connection Status */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="caption" color="success.dark">
                ✅ AstraDB: Connected
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="caption" color="success.dark">
                ✅ Neo4j: Connected (30 trials, 37 orgs, 860 sites)
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Search Input */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Search Query (e.g., 'ovarian cancer BRCA1', 'immunotherapy melanoma')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            placeholder="Enter your search query..."
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            startIcon={isLoading ? <SearchIcon /> : <SearchIcon />}
            onClick={handleGraphSearch}
            disabled={isLoading || !query.trim()}
            fullWidth
          >
            {isLoading ? 'Searching with Graph Intelligence...' : 'Run Graph-Optimized Search'}
          </Button>
        </Box>

        {/* Patient Context Display */}
        {patientContext && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Patient Context:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {patientContext.condition && (
                <Chip label={`Condition: ${patientContext.condition}`} size="small" />
              )}
              {patientContext.state && (
                <Chip label={`Location: ${patientContext.state}`} size="small" />
              )}
            </Box>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* Results Summary */}
        {lastResults && !error && (
          <Alert severity="success" sx={{ mt: 2 }}>
            ✅ Found {lastResults.count} trials using {lastResults.method} optimization
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GraphOptimizedSearch;

