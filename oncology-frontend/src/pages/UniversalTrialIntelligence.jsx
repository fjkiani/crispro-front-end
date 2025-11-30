/**
 * Universal Trial Intelligence Interface
 * 
 * Complete interface for filtering trials and generating dossiers for any patient.
 * Integrates with the universal trial intelligence pipeline.
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
} from '@mui/material';
import {
  FilterList as FilterIcon,
  AutoAwesome as GenerateIcon,
  PlayArrow as RunIcon,
} from '@mui/icons-material';
import PatientProfileForm from '../components/universal/PatientProfileForm';
import UniversalDossierSummaryCard from '../components/universal/UniversalDossierSummaryCard';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

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

  const handleProfileSave = (profile) => {
    setPatientProfile(profile);
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
        <Tab label="2. Filter Trials" />
        <Tab label="3. Generate Dossiers" />
        <Tab label="4. Autonomous Flow" />
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

      {/* Tab 2: Filter Trials */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Trials
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Provide trial candidates (from search) and filter using the intelligence pipeline.
            You can get candidates from the Research Portal or paste JSON directly.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Tip: Use the Research Portal to search for trials, then copy the results and paste them here.
          </Alert>
          
          <Box mt={2}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Trial Candidates (JSON array)"
              placeholder='[{"nct_id": "NCT12345678", "title": "...", "status": "RECRUITING", ...}]'
              helperText="Paste trial candidates from search results (JSON format). Each trial should have nct_id, title, status, disease_category, etc."
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setCandidates(Array.isArray(parsed) ? parsed : []);
                } catch {
                  // Invalid JSON, ignore
                }
              }}
            />
            <Box mt={1} display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // Example candidates for testing
                  const example = JSON.stringify([
                    {
                      nct_id: "NCT12345678",
                      title: "Example Trial",
                      status: "RECRUITING",
                      disease_category: "ovarian cancer",
                      description_text: "A trial for testing",
                      eligibility_text: "Stage IV ovarian cancer",
                      locations_data: [{"facility": "Test Hospital", "city": "New York", "state": "NY"}]
                    }
                  ], null, 2);
                  setCandidates(JSON.parse(example));
                }}
              >
                Load Example
              </Button>
              {candidates.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => setCandidates([])}
                >
                  Clear
                </Button>
              )}
            </Box>
            {candidates.length > 0 && (
              <Alert severity="success" sx={{ mt: 1 }}>
                {candidates.length} trial candidate(s) loaded
              </Alert>
            )}
          </Box>

          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleFilterTrials}
              disabled={!patientProfile || !candidates.length || isLoading}
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

      {/* Tab 3: Generate Dossiers */}
      {activeTab === 2 && (
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

      {/* Tab 4: Autonomous Flow */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Autonomous End-to-End Flow
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Automatically search for trials, filter them, and generate dossiers
          </Typography>

          <Box mt={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RunIcon />}
              onClick={handleAutonomousFlow}
              disabled={!patientProfile || isLoading}
            >
              Run Autonomous Flow
            </Button>
          </Box>
        </Paper>
      )}

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

