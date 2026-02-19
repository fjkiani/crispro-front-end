/**
 * PatientKBDashboard - Full Knowledge Base Dashboard
 * 
 * Comprehensive view of patient's knowledge base with:
 * - Statistics overview
 * - Papers list
 * - Edge cases
 * - Opportunities
 * - Query interface
 * 
 * Research Use Only - Not for Clinical Decision Making
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  LibraryBooks as LibraryBooksIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
  QueryStats as QueryStatsIcon
} from '@mui/icons-material';
import PatientKnowledgeBaseCard from './PatientKnowledgeBaseCard';
import { API_ROOT } from '../../lib/apiConfig';


export default function PatientKBDashboard({ patientId, patientProfile }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [edgeCases, setEdgeCases] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  // Load KB stats
  useEffect(() => {
    loadStats();
  }, [patientId]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ROOT}/api/patient-kb/${patientId}/stats`);
      if (!response.ok) throw new Error('Failed to load stats');
      const data = await response.json();
      setStats(data);
      
      // Load edge cases and opportunities
      await loadEdgeCases();
      await loadOpportunities();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEdgeCases = async () => {
    try {
      // Edge cases are stored in the KB directory
      // For now, we'll get them from stats or a separate endpoint
      if (stats?.edge_cases_count > 0) {
        // TODO: Add endpoint to get edge cases
        // For now, show count only
      }
    } catch (err) {
      console.error('Failed to load edge cases:', err);
    }
  };

  const loadOpportunities = async () => {
    try {
      // Similar to edge cases
      if (stats?.opportunities_count > 0) {
        // TODO: Add endpoint to get opportunities
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    }
  };

  const handleBuildKB = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ROOT}/api/patient-kb/${patientId}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientProfile)
      });
      if (!response.ok) throw new Error('Failed to build KB');
      const result = await response.json();
      alert(`Knowledge base built! ${result.papers_added} papers added, ${result.edge_cases_detected} edge cases detected.`);
      await loadStats();
    } catch (err) {
      alert(`Failed to build KB: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryKB = async () => {
    if (!queryText.trim()) return;
    
    setQueryLoading(true);
    setQueryResult(null);
    try {
      const response = await fetch(`${API_ROOT}/api/patient-kb/${patientId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          patient_profile: patientProfile
        })
      });
      if (!response.ok) throw new Error('Failed to query KB');
      const result = await response.json();
      setQueryResult(result);
    } catch (err) {
      setQueryResult({ error: err.message });
    } finally {
      setQueryLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Your Knowledge Base
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Card */}
      <PatientKnowledgeBaseCard
        patientId={patientId}
        patientProfile={patientProfile}
        onBuildKB={handleBuildKB}
        onViewKB={loadStats}
        stats={stats}
        loading={loading}
      />

      {stats && stats.papers_count > 0 && (
        <Box sx={{ mt: 4 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
            <Tab label="Query KB" icon={<SearchIcon />} />
            <Tab label="Edge Cases" icon={<WarningIcon />} />
            <Tab label="Opportunities" icon={<TrendingUpIcon />} />
            <Tab label="Statistics" icon={<QueryStatsIcon />} />
          </Tabs>

          {/* Query Tab */}
          {activeTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ask Questions About Your Mutations
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="e.g., What does my MBD4 mutation mean for treatment?"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQueryKB()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleQueryKB}
                    disabled={queryLoading || !queryText.trim()}
                    startIcon={queryLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                  >
                    Query
                  </Button>
                </Box>

                {queryResult && (
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    {queryResult.error ? (
                      <Alert severity="error">{queryResult.error}</Alert>
                    ) : (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Answer:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {queryResult.answer || queryResult.message || 'No answer available'}
                        </Typography>
                        {queryResult.evidence_level && (
                          <Chip
                            label={`Evidence: ${queryResult.evidence_level}`}
                            color={queryResult.evidence_level === 'Strong' ? 'success' : 'default'}
                            sx={{ mr: 1 }}
                          />
                        )}
                        {queryResult.confidence_score && (
                          <Chip
                            label={`Confidence: ${Math.round(queryResult.confidence_score * 100)}%`}
                            color="info"
                          />
                        )}
                        {queryResult.supporting_papers && queryResult.supporting_papers.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Supporting Papers:
                            </Typography>
                            <List dense>
                              {queryResult.supporting_papers.slice(0, 3).map((paper, idx) => (
                                <ListItem key={idx}>
                                  <ListItemIcon>
                                    <LibraryBooksIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={paper.title || paper.pmid}
                                    secondary={paper.pmid ? `PMID: ${paper.pmid}` : ''}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                )}
              </CardContent>
            </Card>
          )}

          {/* Edge Cases Tab */}
          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Edge Cases Detected
                </Typography>
                {stats.edge_cases_count > 0 ? (
                  <Alert severity="warning">
                    {stats.edge_cases_count} edge case(s) detected. These include rare mutations, 
                    VUS requiring resolution, and other notable findings.
                  </Alert>
                ) : (
                  <Alert severity="info">No edge cases detected.</Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Opportunities Tab */}
          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Research Opportunities
                </Typography>
                {stats.opportunities_count > 0 ? (
                  <Alert severity="success">
                    {stats.opportunities_count} opportunity/ies found. These include clinical trials, 
                    emerging treatments, and research gaps.
                  </Alert>
                ) : (
                  <Alert severity="info">No opportunities found yet.</Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Statistics Tab */}
          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detailed Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.papers_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Research Papers
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.entities_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mutations Tracked
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.edge_cases_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Edge Cases
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.opportunities_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Opportunities
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}
