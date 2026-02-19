/**
 * PatientKnowledgeBaseCard - Modular Component
 * 
 * Displays patient knowledge base statistics and quick actions.
 * Used in PatientHomeDashboard and Patient KB Dashboard.
 * 
 * Research Use Only - Not for Clinical Decision Making
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Grid,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { API_ROOT } from '../../lib/apiConfig';
import {
  AutoAwesome as AutoAwesomeIcon,
  LibraryBooks as LibraryBooksIcon,
  Science as ScienceIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  QueryStats as QueryStatsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';


export default function PatientKnowledgeBaseCard({
  patientId,
  patientProfile,
  onBuildKB,
  onViewKB,
  onQueryKB,
  stats = null,
  loading = false
}) {
  const handleBuildKB = async () => {
    if (onBuildKB) {
      await onBuildKB();
    } else {
      // Default implementation
      try {
        const response = await fetch(`${API_ROOT}/api/patient-kb/${patientId}/build`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientProfile)
        });
        if (!response.ok) throw new Error('Failed to build KB');
        const result = await response.json();
        console.log('KB Build Result:', result);
        // Refresh stats
        window.location.reload();
      } catch (error) {
        console.error('KB Build Error:', error);
        alert(`Failed to build knowledge base: ${error.message}`);
      }
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch(`${API_ROOT}/api/patient-kb/${patientId}/stats`);
      if (response.ok) {
        const newStats = await response.json();
        if (onViewKB) onViewKB(newStats);
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  if (loading) {
    return (
      <Card sx={{ bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Your Knowledge Base</Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading knowledge base statistics...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const hasKB = stats && stats.papers_count > 0;
  const edgeCasesCount = stats?.edge_cases_count || 0;
  const opportunitiesCount = stats?.opportunities_count || 0;

  return (
    <Card sx={{
      bgcolor: hasKB ? 'success.50' : 'primary.50',
      border: '2px solid',
      borderColor: hasKB ? 'success.main' : 'primary.main',
      position: 'relative'
    }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesomeIcon sx={{ mr: 1, color: hasKB ? 'success.main' : 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Your Knowledge Base
            </Typography>
          </Box>
          <Tooltip title="Refresh stats">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {!hasKB ? (
          /* Empty State */
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Your personalized knowledge base hasn't been built yet.
                Click "Build Knowledge Base" to start collecting research papers on your mutations.
              </Typography>
            </Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleBuildKB}
              startIcon={<AutoAwesomeIcon />}
              sx={{ mb: 1 }}
            >
              Build Knowledge Base
            </Button>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              This will search for research papers on your mutations and biomarkers
            </Typography>
          </Box>
        ) : (
          /* Stats Display */
          <Box>
            {/* Key Metrics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <LibraryBooksIcon sx={{ fontSize: 32, color: 'primary.main', mb: 0.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.papers_count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Research Papers
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <ScienceIcon sx={{ fontSize: 32, color: 'info.main', mb: 0.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.entities_count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mutations Tracked
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <QueryStatsIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 0.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.research_queries_count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Research Queries
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Edge Cases & Opportunities */}
            {(edgeCasesCount > 0 || opportunitiesCount > 0) && (
              <Box sx={{ mb: 2 }}>
                {edgeCasesCount > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={`${edgeCasesCount} Edge Cases Detected`}
                    color="warning"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {opportunitiesCount > 0 && (
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`${opportunitiesCount} Opportunities Found`}
                    color="success"
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>
            )}

            {/* Last Updated */}
            {stats.last_updated && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Last updated: {new Date(stats.last_updated).toLocaleDateString()}
              </Typography>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onViewKB && onViewKB(stats)}
                startIcon={<LibraryBooksIcon />}
              >
                View KB
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onQueryKB && onQueryKB()}
                startIcon={<QueryStatsIcon />}
              >
                Query KB
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleBuildKB}
                startIcon={<RefreshIcon />}
              >
                Update KB
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
