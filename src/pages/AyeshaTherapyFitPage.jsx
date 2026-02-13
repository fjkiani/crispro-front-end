/**
 * Ayesha Therapy Fit Page
 * 
 * Multi-level therapy fit analysis for Ayesha with scenario selection.
 * - L1: Actual data (germline + IHC)
 * - L2: Preview with NGS + HRD (multiple scenarios)
 * - L3: Preview with expression + CA-125 (multiple scenarios)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DrugRankingPanel from '../components/ayesha/DrugRankingPanel';
import { AYESHA_11_17_25_PROFILE } from '../constants/patients';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

export default function AyeshaTherapyFitPage() {
  // Tab state (L1, L2, L3)
  const [activeTab, setActiveTab] = useState(0);

  // Scenario selection
  const [l2ScenarioId, setL2ScenarioId] = useState('L2A_HRDhi_TMBhi');
  const [l3ScenarioId, setL3ScenarioId] = useState('L3A_VEGFhigh_CA125high');

  // Available scenarios (loaded from API)
  const [scenarios, setScenarios] = useState(null);

  // Results
  const [l1Result, setL1Result] = useState(null);
  const [l2Result, setL2Result] = useState(null);
  const [l3Result, setL3Result] = useState(null);

  // Loading/error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingScenarios, setLoadingScenarios] = useState(true);

  // Load available scenarios on mount
  useEffect(() => {
    loadScenarios();
  }, []);

  // Load analysis when scenario changes
  useEffect(() => {
    if (scenarios) {
      loadAnalysis();
    }
  }, [activeTab, l2ScenarioId, l3ScenarioId, scenarios]);

  const loadScenarios = async () => {
    try {
      const response = await fetch(`${API_ROOT}/api/ayesha/therapy-fit/scenarios`);
      if (!response.ok) throw new Error(`Failed to load scenarios: ${response.statusText}`);
      const data = await response.json();
      setScenarios(data);
    } catch (err) {
      console.error('Error loading scenarios:', err);
      setError(`Failed to load scenarios: ${err.message}`);
    } finally {
      setLoadingScenarios(false);
    }
  };

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine which level to load based on active tab
      let level = 'all';
      let scenarioId = null;

      if (activeTab === 1) {
        level = 'l2';
        scenarioId = l2ScenarioId;
      } else if (activeTab === 2) {
        level = 'l3';
        scenarioId = l3ScenarioId;
      }

      const url = new URL(`${API_ROOT}/api/ayesha/therapy-fit/analyze`);
      url.searchParams.set('level', level);
      if (scenarioId) {
        url.searchParams.set('scenario_id', scenarioId);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results) {
        if (data.results.l1) setL1Result(data.results.l1);
        if (data.results.l2) setL2Result(data.results.l2);
        if (data.results.l3) setL3Result(data.results.l3);
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError(err.message || 'Failed to load therapy fit analysis');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentResult = () => {
    if (activeTab === 0) return l1Result;
    if (activeTab === 1) return l2Result;
    if (activeTab === 2) return l3Result;
    return null;
  };

  const getCurrentScenario = () => {
    if (activeTab === 1) {
      return scenarios?.l2_scenarios?.[l2ScenarioId];
    }
    if (activeTab === 2) {
      return scenarios?.l3_scenarios?.[l3ScenarioId];
    }
    return null;
  };

  const currentResult = getCurrentResult();
  const currentScenario = getCurrentScenario();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospitalIcon color="primary" fontSize="large" />
          Ayesha Therapy Fit - Multi-Level Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Compare therapy fit predictions across different data completeness levels (L1, L2, L3)
          with scenario-based previews for missing data.
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Research Use Only (RUO)</strong> - Scenario-based previews show predictions
          if additional data were available. Always consult oncologist before making treatment decisions.
        </Alert>
      </Box>

      {/* Scenario Loading */}
      {loadingScenarios && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs for L1/L2/L3 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="L1: Actual Data" />
          <Tab label="L2: + NGS + HRD" />
          <Tab label="L3: + Expression + CA-125" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Scenario Selector (L2 and L3 only) */}
          {activeTab === 1 && scenarios?.l2_scenarios && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>L2 Scenario</InputLabel>
              <Select
                value={l2ScenarioId}
                onChange={(e) => setL2ScenarioId(e.target.value)}
                label="L2 Scenario"
              >
                {Object.entries(scenarios.l2_scenarios).map(([id, scenario]) => (
                  <MenuItem key={id} value={id}>
                    <Box>
                      <Typography variant="body1">{id}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {scenario.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {activeTab === 2 && scenarios?.l3_scenarios && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>L3 Scenario</InputLabel>
              <Select
                value={l3ScenarioId}
                onChange={(e) => setL3ScenarioId(e.target.value)}
                label="L3 Scenario"
              >
                {Object.entries(scenarios.l3_scenarios).map(([id, scenario]) => (
                  <MenuItem key={id} value={id}>
                    <Box>
                      <Typography variant="body1">{id}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {scenario.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Scenario Details Card */}
          {currentScenario && (
            <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scenario Details
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{currentScenario.description}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Completeness Score
                    </Typography>
                    <Chip
                      label={currentScenario.completeness_score}
                      color={currentScenario.completeness_score >= 0.85 ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  {activeTab === 1 && (
                    <>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          HRD Score
                        </Typography>
                        <Typography variant="body1">
                          {currentScenario.hrd_score} ({currentScenario.hrd_status})
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          TMB
                        </Typography>
                        <Typography variant="body1">
                          {currentScenario.tmb} ({currentScenario.tmb_status})
                        </Typography>
                      </Box>
                    </>
                  )}
                  {activeTab === 2 && (
                    <>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          CA-125 Value
                        </Typography>
                        <Typography variant="body1">{currentScenario.ca125_value} U/mL</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Expression Coverage
                        </Typography>
                        <Typography variant="body1">{currentScenario.expression_coverage}</Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Preview Context Alert */}
          {currentResult?.preview_context && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {currentResult.preview_context.status}
              </Typography>
              <Typography variant="body2">
                {currentResult.preview_context.message}
              </Typography>
              {currentResult.preview_context.scenario_notes && (
                <Box sx={{ mt: 1 }}>
                  {Object.entries(currentResult.preview_context.scenario_notes).map(([key, value]) => (
                    <Typography key={key} variant="caption" display="block">
                      <strong>{key}:</strong> {value}
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Results */}
      {currentResult && !loading && (
        <Box>
          {/* Completeness Info */}
          {currentResult.completeness && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Data Completeness: {currentResult.completeness.level_name} (Level {currentResult.completeness.level})
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {currentResult.completeness.has_germline && (
                  <Chip label="Germline" color="success" size="small" />
                )}
                {currentResult.completeness.has_somatic_ngs && (
                  <Chip label="NGS" color="success" size="small" />
                )}
                {currentResult.completeness.has_hrd && (
                  <Chip label="HRD" color="success" size="small" />
                )}
                {currentResult.completeness.has_tmb && (
                  <Chip label="TMB" color="success" size="small" />
                )}
                {currentResult.completeness.has_expression && (
                  <Chip label="Expression" color="success" size="small" />
                )}
                {currentResult.completeness.has_ca125 && (
                  <Chip label="CA-125" color="success" size="small" />
                )}
              </Stack>
              {currentResult.completeness.missing && currentResult.completeness.missing.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Missing Data:
                  </Typography>
                  <Typography variant="body2">
                    {currentResult.completeness.missing.join(', ')}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Drug Rankings */}
          {currentResult.drugs && currentResult.drugs.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Drug Rankings ({currentResult.level})
              </Typography>
              <DrugRankingPanel drugs={currentResult.drugs} />
            </Box>
          )}

          {/* Pathway Scores */}
          {currentResult.pathway_scores && Object.keys(currentResult.pathway_scores).length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pathway Scores
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(currentResult.pathway_scores).map(([pathway, score]) => (
                  <Grid item xs={6} md={3} key={pathway}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {pathway.toUpperCase()}
                      </Typography>
                      <Typography variant="h6">{score.toFixed(3)}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Provenance */}
          {currentResult.provenance && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Provenance
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
                {JSON.stringify(currentResult.provenance, null, 2)}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Empty State */}
      {!currentResult && !loading && !error && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Select a level above to see therapy fit analysis
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
