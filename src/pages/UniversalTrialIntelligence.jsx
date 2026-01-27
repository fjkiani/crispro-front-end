/**
 * Universal Trial Intelligence Interface
 * 
 * Complete interface for searching, filtering trials and generating dossiers for any patient.
 * Integrates with the universal trial intelligence pipeline.
 * 
 * THREE SEARCH MODES:
 * 1. Keyword Search - Basic text search (Free tier)
 * 2. Mechanism Search - Match by 7D SAE vector (Pro tier)
 * 3. Holistic Search - Full SAE + PGx ranking (Premium tier)
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  AutoAwesome as GenerateIcon,
  PlayArrow as RunIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
  Lock as LockIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import PatientProfileForm from '../components/universal/PatientProfileForm';
import UniversalDossierSummaryCard from '../components/universal/UniversalDossierSummaryCard';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

/**
 * Compute SAE mechanism vector from tumor_context
 * Returns 7D vector: [DDR, MAPK, PI3K, VEGF, HER2, IO, Efflux]
 */
const computeSAEVector = (tumorContext) => {
  if (!tumorContext) return [0, 0, 0, 0, 0, 0, 0];
  
  const vector = [0, 0, 0, 0, 0, 0, 0];
  
  // DDR inference (BRCA, HRD, p53 mutant, MBD4)
  const mutations = tumorContext.somatic_mutations || [];
  const hasBRCA = mutations.some(m => ['BRCA1', 'BRCA2'].includes(m.gene?.toUpperCase()));
  const hasP53 = mutations.some(m => m.gene?.toUpperCase() === 'TP53');
  const hasMBD4 = mutations.some(m => m.gene?.toUpperCase() === 'MBD4');
  const hrdScore = tumorContext.hrd_score || 0;
  
  if (hasBRCA || hrdScore >= 42 || hasP53 || hasMBD4) {
    vector[0] = Math.min(0.95, 0.5 + (hrdScore / 100) + (hasBRCA ? 0.2 : 0) + (hasP53 ? 0.1 : 0));
  }
  
  // MAPK inference (KRAS, NRAS, BRAF)
  const hasMAPK = mutations.some(m => ['KRAS', 'NRAS', 'BRAF'].includes(m.gene?.toUpperCase()));
  if (hasMAPK) vector[1] = 0.75;
  
  // PI3K inference (PIK3CA, PTEN)
  const hasPI3K = mutations.some(m => ['PIK3CA', 'PTEN'].includes(m.gene?.toUpperCase()));
  if (hasPI3K) vector[2] = 0.70;
  
  // VEGF inference (ascites, peritoneal disease)
  if (tumorContext.has_ascites || tumorContext.has_peritoneal_disease) {
    vector[3] = 0.60;
  }
  
  // HER2 inference
  const hasHER2 = mutations.some(m => ['ERBB2', 'HER2'].includes(m.gene?.toUpperCase()));
  if (hasHER2 || tumorContext.her2_status === 'positive') {
    vector[4] = 0.85;
  }
  
  // IO inference (PD-L1, TMB, MSI)
  const tmb = tumorContext.tmb || 0;
  const msiHigh = tumorContext.msi_status === 'high';
  const pdl1Positive = (tumorContext.pd_l1?.cps >= 1) || (tumorContext.pd_l1?.tps >= 1);
  if (pdl1Positive || tmb >= 20 || msiHigh) {
    vector[5] = Math.min(0.90, 0.5 + (tmb / 50) + (msiHigh ? 0.2 : 0));
  }
  
  return vector;
};

const UniversalTrialIntelligence = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [patientProfile, setPatientProfile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [filteredResults, setFilteredResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNctIds, setSelectedNctIds] = useState([]);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [generatedDossiers, setGeneratedDossiers] = useState([]);
  
  // NEW: Search mode state
  const [searchMode, setSearchMode] = useState('keyword'); // 'keyword' | 'mechanism' | 'holistic'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [saeVector, setSaeVector] = useState(null);
  const userTier = 'premium'; // TODO: Get from auth context

  const handleProfileSave = (profile) => {
    setPatientProfile(profile);
    // Compute SAE vector when profile is saved
    if (profile?.tumor_context) {
      const vector = computeSAEVector(profile.tumor_context);
      setSaeVector(vector);
    }
  };

  const handleFilterTrials = async () => {
    if (!patientProfile || !candidates.length) {
      setError('Please provide patient profile and trial candidates');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/dossiers/intelligence/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_profile: patientProfile,
          candidates: candidates,
          use_llm: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFilteredResults(data);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to filter trials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDossier = async (nctId) => {
    if (!patientProfile) {
      setError('Please provide patient profile first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/dossiers/intelligence/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_profile: patientProfile,
          nct_id: nctId,
          use_llm: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedDossiers(prev => [...prev, data]);
      alert(`Dossier generated: ${data.dossier_id}`);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to generate dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!patientProfile || selectedNctIds.length === 0) {
      setError('Please select trials to generate dossiers for');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBatchDialogOpen(false);

    try {
      const response = await fetch(`${API_ROOT}/api/dossiers/intelligence/batch-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_profile: patientProfile,
          nct_ids: selectedNctIds,
          use_llm: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedDossiers(prev => [...prev, ...data.dossiers]);
      alert(`Generated ${data.generated_count} dossiers`);
      setSelectedNctIds([]);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to batch generate dossiers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutonomousFlow = async () => {
    if (!patientProfile) {
      setError('Please provide patient profile first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/trials/agent/generate-dossiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_profile: patientProfile,
          nct_ids: null, // Will search first
          use_llm: true,
          max_dossiers: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setGeneratedDossiers(prev => [...prev, ...data.data.dossiers_generated]);
        alert(`Autonomous flow complete: ${data.data.dossiers_generated.length} dossiers generated`);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Failed autonomous flow:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle multi-mode search with timeout and error handling
   * Keyword → /api/trials/agent/search
   * Mechanism → /api/holistic-score/batch with MoA matching
   * Holistic → /api/holistic-score/batch with full scoring
   */
  const handleTrialSearch = async () => {
    if (!patientProfile && searchMode !== 'keyword') {
      setError('Please provide patient profile for mechanism/holistic search');
      return;
    }
    if (!searchQuery && searchMode === 'keyword') {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      // Create AbortController for 30-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      let response, data;
      
      try {
        if (searchMode === 'keyword') {
          // Keyword search - basic text query
          response = await fetch(`${API_ROOT}/api/trials/agent/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: searchQuery,
              disease: patientProfile?.disease?.type || searchQuery,
              top_k: 20,
            }),
            signal: controller.signal
          });
        } else if (searchMode === 'mechanism') {
          // Mechanism search - use SAE vector for matching
          const mechanismVector = saeVector || computeSAEVector(patientProfile?.tumor_context);
          
          // First get candidates, then rank by mechanism
          const searchRes = await fetch(`${API_ROOT}/api/trials/agent/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: patientProfile?.disease?.type || 'cancer',
              disease: patientProfile?.disease?.type,
              top_k: 50,
            }),
            signal: controller.signal
          });
          
          if (!searchRes.ok) throw new Error('Trial search failed');
          const candidates = await searchRes.json();
          
          // Rank by mechanism fit using holistic score batch (mechanism only)
          response = await fetch(`${API_ROOT}/api/holistic-score/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patient_profile: {
                ...patientProfile,
                mechanism_vector: mechanismVector,
              },
              trials: (candidates.results || candidates.trials || []).slice(0, 20),
              pharmacogenes: [], // No PGx for mechanism-only search
            }),
            signal: controller.signal
          });
        } else if (searchMode === 'holistic') {
          // Holistic search - full SAE + PGx ranking
          const mechanismVector = saeVector || computeSAEVector(patientProfile?.tumor_context);
          
          // Get candidates first
          const searchRes = await fetch(`${API_ROOT}/api/trials/agent/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: patientProfile?.disease?.type || 'cancer',
              disease: patientProfile?.disease?.type,
              top_k: 50,
            }),
            signal: controller.signal
          });
          
          if (!searchRes.ok) throw new Error('Trial search failed');
          const candidates = await searchRes.json();
          
          // Full holistic scoring with PGx
          response = await fetch(`${API_ROOT}/api/holistic-score/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patient_profile: {
                ...patientProfile,
                mechanism_vector: mechanismVector,
              },
              trials: (candidates.results || candidates.trials || []).slice(0, 20),
              pharmacogenes: patientProfile?.germline_variants || [],
            }),
            signal: controller.signal
          });
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorDetail = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
          } catch {
            // Response not JSON
          }
          throw new Error(errorDetail);
        }

        data = await response.json();
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Search timed out after 30 seconds. The server may be slow or overloaded. Please try again.');
        }
        throw fetchError;
      }
      
      // Normalize results
      let results = [];
      if (searchMode === 'keyword') {
        results = data.results || data.trials || [];
      } else {
        // Holistic/mechanism results
        results = (data.results || []).map(r => ({
          ...r,
          nct_id: r.nct_id || r.nctId,
          holistic_score: r.holistic_score,
          mechanism_fit_score: r.mechanism_fit_score,
          eligibility_score: r.eligibility_score,
          pgx_safety_score: r.pgx_safety_score,
          interpretation: r.interpretation,
        }));
      }
      
      setSearchResults(results);
      setCandidates(results); // Also set as candidates for filtering
      
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(`Search failed: ${errorMessage}`);
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        ⚔️ Universal Trial Intelligence
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Filter trials and generate intelligence dossiers for any patient
      </Typography>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, mt: 3 }}>
        <Tab label="1. Patient Profile" />
        <Tab label="2. Search Trials" />
        <Tab label="3. Filter & Rank" />
        <Tab label="4. Generate Dossiers" />
      </Tabs>

      {/* Tab 1: Patient Profile */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <PatientProfileForm onSave={handleProfileSave} />
          {patientProfile && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Profile saved: {patientProfile.patient_id || patientProfile.demographics?.patient_id}
            </Alert>
          )}
        </Paper>
      )}

      {/* Tab 2: Search Trials - Multi-Mode Search */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🔍 Search Clinical Trials
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Search for trials automatically. Choose your search mode based on your needs.
          </Typography>
          
          {/* SAE Vector Display */}
          {saeVector && (
          <Alert severity="info" sx={{ mb: 2 }}>
              <strong>SAE Mechanism Vector Computed:</strong> DDR={saeVector[0].toFixed(2)}, 
              MAPK={saeVector[1].toFixed(2)}, PI3K={saeVector[2].toFixed(2)}, 
              VEGF={saeVector[3].toFixed(2)}, HER2={saeVector[4].toFixed(2)}, 
              IO={saeVector[5].toFixed(2)}
            </Alert>
          )}
          
          {/* Search Mode Toggle */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Search Mode:</Typography>
            <ToggleButtonGroup
              value={searchMode}
              exclusive
              onChange={(e, v) => v && setSearchMode(v)}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="keyword">
                <SearchIcon sx={{ mr: 1 }} /> Keyword Search
              </ToggleButton>
              <Tooltip title={userTier === 'free' ? 'Pro feature: Mechanism matching' : 'Match by 7D mechanism vector'}>
                <span>
                  <ToggleButton value="mechanism" disabled={userTier === 'free'}>
                    <ScienceIcon sx={{ mr: 1 }} /> Mechanism Match
                    {userTier === 'free' && <LockIcon sx={{ ml: 1, fontSize: 16 }} />}
                  </ToggleButton>
                </span>
              </Tooltip>
              <Tooltip title={userTier !== 'premium' ? 'Premium feature: Full holistic scoring' : 'Full SAE + PGx safety ranking'}>
                <span>
                  <ToggleButton value="holistic" disabled={userTier !== 'premium'}>
                    <TrendingUpIcon sx={{ mr: 1 }} /> Holistic Score
                    {userTier !== 'premium' && <LockIcon sx={{ ml: 1, fontSize: 16 }} />}
                  </ToggleButton>
                </span>
              </Tooltip>
            </ToggleButtonGroup>
            
            {/* Mode description */}
            <Typography variant="caption" color="text.secondary" display="block">
              {searchMode === 'keyword' && '🔤 Basic text search across trial titles and descriptions'}
              {searchMode === 'mechanism' && '🧬 Rank trials by mechanism of action alignment with patient profile'}
              {searchMode === 'holistic' && '⚡ Full scoring: Mechanism Fit (50%) + Eligibility (30%) + PGx Safety (20%)'}
            </Typography>
          </Box>
          
          {/* Search Input */}
          <Box sx={{ mb: 3 }}>
            {searchMode === 'keyword' ? (
              <TextField
                fullWidth
                label="Search Query"
                placeholder="e.g., ovarian cancer PARP inhibitor phase 3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                helperText="Enter keywords to search for clinical trials"
              />
            ) : (
              <Alert severity="success" icon={<ScienceIcon />}>
                {searchMode === 'mechanism' 
                  ? 'Mechanism search uses your patient profile to find trials with matching mechanisms of action.'
                  : 'Holistic search ranks trials by mechanism fit, eligibility, and PGx safety screening.'}
                {!patientProfile && ' ⚠️ Please save a patient profile first (Tab 1).'}
          </Alert>
            )}
          </Box>
          
          {/* Search Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={handleTrialSearch}
            disabled={isLoading || (searchMode === 'keyword' && !searchQuery) || (searchMode !== 'keyword' && !patientProfile)}
            sx={{ mb: 3 }}
          >
            {isLoading ? 'Searching...' : `Search with ${searchMode.charAt(0).toUpperCase() + searchMode.slice(1)} Mode`}
          </Button>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                🎯 Found {searchResults.length} Trials
                {searchMode !== 'keyword' && ` (Ranked by ${searchMode === 'holistic' ? 'Holistic Score' : 'Mechanism Fit'})`}
              </Typography>
              
              <Grid container spacing={2}>
                {searchResults.map((trial, idx) => (
                  <Grid item xs={12} key={trial.nct_id || trial.nctId || idx}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              #{idx + 1} {trial.nct_id || trial.nctId}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {trial.title || trial.brief_title}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              <Chip size="small" label={trial.overall_status || trial.status || 'Unknown'} color="primary" />
                              {trial.phase && <Chip size="small" label={trial.phase} />}
                            </Box>
                          </Box>
                          
                          {/* Holistic Score Display */}
                          {searchMode !== 'keyword' && trial.holistic_score !== undefined && (
                            <Box sx={{ minWidth: 120, textAlign: 'right' }}>
                              <Typography variant="h5" color={trial.holistic_score >= 0.7 ? 'success.main' : trial.holistic_score >= 0.4 ? 'warning.main' : 'error.main'}>
                                {(trial.holistic_score * 100).toFixed(0)}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Holistic Score
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={trial.holistic_score * 100} 
                                color={trial.holistic_score >= 0.7 ? 'success' : trial.holistic_score >= 0.4 ? 'warning' : 'error'}
                                sx={{ mt: 0.5 }}
                              />
                              {trial.interpretation && (
                                <Chip 
                                  size="small" 
                                  label={trial.interpretation} 
                                  color={trial.interpretation === 'HIGH' ? 'success' : trial.interpretation === 'MEDIUM' ? 'warning' : 'error'}
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                        
                        {/* Score Breakdown */}
                        {searchMode === 'holistic' && trial.mechanism_fit_score !== undefined && (
                          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="caption">
                              🧬 Mechanism: {(trial.mechanism_fit_score * 100).toFixed(0)}%
                            </Typography>
                            <Typography variant="caption">
                              📋 Eligibility: {(trial.eligibility_score * 100).toFixed(0)}%
                            </Typography>
                            <Typography variant="caption">
                              💊 PGx Safety: {(trial.pgx_safety_score * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleGenerateDossier(trial.nct_id || trial.nctId)}
                          >
                            Generate Dossier
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      )}

      {/* Tab 3: Filter & Rank (old Tab 2 content for advanced users) */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            ⚙️ Advanced: Filter & Rank Candidates
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            For advanced users: Manually provide trial candidates or use results from search.
            {searchResults.length > 0 && ` (${searchResults.length} trials loaded from search)`}
          </Typography>
          
          {searchResults.length > 0 ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {searchResults.length} trials loaded from search. Click "Filter Trials" to apply intelligence pipeline.
            </Alert>
          ) : (
          <Box mt={2}>
            <TextField
              fullWidth
              multiline
                rows={6}
              label="Trial Candidates (JSON array)"
              placeholder='[{"nct_id": "NCT12345678", "title": "...", "status": "RECRUITING", ...}]'
                helperText="Paste trial candidates from external search (JSON format)."
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setCandidates(Array.isArray(parsed) ? parsed : []);
                } catch {
                  // Invalid JSON, ignore
                }
              }}
            />
            </Box>
            )}

          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleFilterTrials}
              disabled={!patientProfile || (!candidates.length && !searchResults.length) || isLoading}
            >
              Filter Trials
            </Button>
          </Box>

          {filteredResults && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Filtered Results
              </Typography>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip label={`Top Tier: ${filteredResults.top_tier?.length || 0}`} color="success" />
                <Chip label={`Good Tier: ${filteredResults.good_tier?.length || 0}`} color="info" />
                <Chip label={`Rejected: ${filteredResults.rejected?.length || 0}`} />
              </Box>

              <Grid container spacing={2}>
                {[...(filteredResults.top_tier || []), ...(filteredResults.good_tier || [])].map((trial, idx) => (
                  <Grid item xs={12} key={trial.nct_id || idx}>
                    <UniversalDossierSummaryCard
                      dossier={{
                        nct_id: trial.nct_id,
                        title: trial.title,
                        tier: trial._composite_score >= 0.8 ? 'TOP_TIER' : 'GOOD_TIER',
                        match_score: trial._composite_score,
                        phase: trial.phase,
                      }}
                      rank={idx + 1}
                      patientId={patientProfile?.patient_id || patientProfile?.demographics?.patient_id}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      )}

      {/* Tab 4: Generate Dossiers */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generate Dossiers
          </Typography>
          
          <Box mt={2} display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<GenerateIcon />}
              onClick={() => setBatchDialogOpen(true)}
              disabled={!patientProfile || isLoading}
            >
              Batch Generate
            </Button>
            <Button
              variant="outlined"
              startIcon={<RunIcon />}
              onClick={handleAutonomousFlow}
              disabled={!patientProfile || isLoading}
            >
              Autonomous Flow (Search → Filter → Generate)
            </Button>
          </Box>

          {generatedDossiers.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Generated Dossiers ({generatedDossiers.length})
              </Typography>
              <Grid container spacing={2}>
                {generatedDossiers.map((dossier, idx) => (
                  <Grid item xs={12} key={dossier.dossier_id || idx}>
                    <UniversalDossierSummaryCard
                      dossier={dossier.metadata || dossier}
                      rank={idx + 1}
                      patientId={patientProfile?.patient_id || patientProfile?.demographics?.patient_id}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      )}

      {/* Autonomous flow is now integrated into Generate Dossiers tab */}

      {/* Batch Generate Dialog */}
      <Dialog open={batchDialogOpen} onClose={() => setBatchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Trials for Batch Generation</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="NCT IDs (one per line or comma-separated)"
            placeholder="NCT12345678&#10;NCT87654321&#10;..."
            onChange={(e) => {
              const ids = e.target.value
                .split(/[,\n]/)
                .map(id => id.trim())
                .filter(id => id);
              setSelectedNctIds(ids);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBatchGenerate} variant="contained" disabled={selectedNctIds.length === 0}>
            Generate {selectedNctIds.length} Dossiers
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading & Error */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Processing...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default UniversalTrialIntelligence;

