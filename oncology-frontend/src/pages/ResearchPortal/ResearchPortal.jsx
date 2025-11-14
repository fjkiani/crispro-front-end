import React, { useState, useCallback } from 'react';
import SearchBar from '../../components/research/SearchBar';
import ResultsDisplay from '../../components/research/ResultsDisplay';
import TrialFilters from '../../components/research/TrialFilters';
import RefreshStatusButton from '../../components/research/RefreshStatusButton';
import GraphOptimizedSearch from '../../components/research/GraphOptimizedSearch';
import AutonomousTrialAgent from '../../components/research/AutonomousTrialAgent';
import { exportTrialsPDF } from '../../utils/exportTrialsPDF';
import { Button, Box, Tabs, Tab, Alert, Typography } from '@mui/material';
import { useSporadic } from '../../context/SporadicContext';

// Define API URLs (adjust port if necessary)
const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const ResearchPortal = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTab, setSearchTab] = useState(0); // 0: Manual, 1: Graph, 2: Agent
  const [patientData, setPatientData] = useState(null); // For autonomous agent
  const [filters, setFilters] = useState({
    diseaseCategory: '',
    phase: [],
    state: ''
  });
  
  // Sporadic context integration (Zo - Clinical Trials)
  const { germlineStatus, tumorContext } = useSporadic();
  const [excludedMessage, setExcludedMessage] = useState('');

  // Filter application logic (defined before use in handleSearch)
  const applyFilters = useCallback((filterState, allResults) => {
    if (!allResults || allResults.length === 0) return [];

    return allResults.filter(trial => {
      // Disease category filter
      if (filterState.diseaseCategory && 
          trial.disease_category !== filterState.diseaseCategory) {
        return false;
      }

      // Phase filter (multi-select)
      if (filterState.phase.length > 0) {
        const trialPhases = trial.phase?.split(', ').map(p => p.trim()) || [];
        const hasMatch = filterState.phase.some(selectedPhase => 
          trialPhases.includes(selectedPhase)
        );
        if (!hasMatch) return false;
      }

      // State filter
      if (filterState.state) {
        try {
          const locations = JSON.parse(trial.locations_data || '[]');
          const hasStateMatch = locations.some(loc => loc.state === filterState.state);
          if (!hasStateMatch) return false;
        } catch (e) {
          return false; // Invalid JSON = no match
        }
      }

      return true;
    });
  }, []);

  const handleSearch = async (query, type) => {
    console.log(`Searching ${type} for: ${query}`);
    setIsLoading(true);
    setSearchResults([]); 
    setError(null); // Clear previous errors

    let url = '';
    let body = {};

    if (type === 'pubmed') {
      // Keep PubMed on research endpoint for now
      url = `${API_ROOT}/api/research/pubmed/search`;
      body = { query: query }; // Send query directly
    } else if (type === 'clinicaltrials') {
      // Switch to real endpoint for clinical trials
      url = `${API_ROOT}/api/search-trials`;
      // Simple query format - backend handles parsing
      body = { query: query };
    } else {
      console.error("Unknown search type:", type);
      setError("Invalid search type selected.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization headers if/when needed
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Try to get error detail from response body
        let errorDetail = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (jsonError) {
             // Ignore if response body is not JSON
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (type === 'clinicaltrials') {
        // Real endpoint returns: { success: true, data: { found_trials: [...] } }
        if (data.success && data.data && data.data.found_trials) {
          const trials = data.data.found_trials;
          setSearchResults(trials);
          // Apply filters to initial results
          const filtered = applyFilters(filters, trials);
          setFilteredResults(filtered);
        } else {
          setSearchResults([]);
          setFilteredResults([]);
        }
      } else {
        // PubMed endpoint returns direct array
        setSearchResults(data);
        setFilteredResults(data);
      }

    } catch (err) {
      console.error("API Call failed:", err);
      setError(err.message || "Failed to fetch search results.");
      setSearchResults([]); // Clear results on error
    } finally {
      setIsLoading(false); // Ensure loading is set to false
    }
  };

  // Filter change handler
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    const filtered = applyFilters(newFilters, searchResults);
    setFilteredResults(filtered);
  }, [searchResults, applyFilters]);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    const emptyFilters = { diseaseCategory: '', phase: [], state: '' };
    setFilters(emptyFilters);
    setFilteredResults(searchResults);
  }, [searchResults]);

  // Refresh complete handler
  const handleRefreshComplete = useCallback((refreshedData) => {
    const updated = searchResults.map(trial => {
      const live = refreshedData.trial_data?.[trial.nct_id];
      if (live) {
        return {
          ...trial,
          status: live.status,
          locations_data: JSON.stringify(live.locations || []),
          live_refreshed: true
        };
      }
      return trial;
    });

    setSearchResults(updated);
    const filtered = applyFilters(filters, updated);
    setFilteredResults(filtered);
  }, [searchResults, filters, applyFilters]);

  const handleAgentResults = useCallback((data) => {
    // Handle different response formats
    const trials = data?.data?.matched_trials || data?.data?.found_trials || data?.trials || (Array.isArray(data) ? data : []);
    setSearchResults(Array.isArray(trials) ? trials : []);
    
    // Extract excluded count from response (sporadic filtering metadata)
    const excludedCount = data?.excluded_count || data?.data?.excluded_count || 0;
    if (excludedCount > 0) {
      setExcludedMessage(`${excludedCount} germline-required trial${excludedCount > 1 ? 's' : ''} excluded (sporadic cancer filtering active)`);
    } else {
      setExcludedMessage('');
    }
    
    const filtered = applyFilters(filters, Array.isArray(trials) ? trials : []);
    setFilteredResults(filtered);
  }, [filters, applyFilters]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Clinical Trials Research</h1>
      <p>Search for PubMed articles and Clinical Trials with graph-optimized matching.</p>
      
      {/* Search Mode Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={searchTab} onChange={(e, v) => setSearchTab(v)}>
          <Tab label="Manual Search" />
          <Tab label="Graph-Optimized" />
          <Tab label="Autonomous Agent" />
        </Tabs>
      </Box>

      {/* Autonomous Agent (Tab 2) */}
      {searchTab === 2 && (
        <AutonomousTrialAgent
          patientData={patientData || {
            disease: 'ovarian cancer',
            mutations: [{ gene: 'BRCA1', hgvs_p: 'V600E' }],
            state: 'CA'
          }}
          onResults={handleAgentResults}
        />
      )}

      {/* Excluded Count Message (Sporadic Filtering) */}
      {excludedMessage && (
        <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
          <Typography variant="body2">
            🔒 {excludedMessage}
          </Typography>
        </Alert>
      )}

      {/* Graph-Optimized Search (Tab 1) */}
      {searchTab === 1 && (
        <GraphOptimizedSearch
          onResults={handleAgentResults}
          patientContext={patientData}
          germlineStatus={germlineStatus}
          tumorContext={tumorContext}
        />
      )}

      {/* Manual Search (Tab 0) */}
      {searchTab === 0 && (
        <SearchBar onSearch={handleSearch} />
      )}

      {/* Filters - Only show for clinical trials */}
      {filteredResults.length > 0 && (
        <TrialFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      )}
      
      {/* Action Buttons */}
      {filteredResults.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <RefreshStatusButton
            nctIds={filteredResults.map(t => t.nct_id || t.nctId).filter(Boolean)}
            stateFilter={filters.state || null}
            onRefreshComplete={handleRefreshComplete}
            disabled={isLoading}
          />
          <Button
            variant="outlined"
            onClick={() => exportTrialsPDF(filteredResults)}
            disabled={filteredResults.length === 0}
          >
            📄 Export PDF
          </Button>
        </Box>
      )}
      
      {error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>} 
      
      <ResultsDisplay 
        results={filteredResults.length > 0 ? filteredResults : searchResults} 
        loading={isLoading} 
      />
    </div>
  );
};

export default ResearchPortal; 