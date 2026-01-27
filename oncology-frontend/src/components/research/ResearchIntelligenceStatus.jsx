/**
 * ResearchIntelligenceStatus - Status display section
 * 
 * Displays:
 * - Loading state with progress and skeleton
 * - Error state with retry option
 */

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ResearchIntelligenceSkeleton from './ResearchIntelligenceSkeleton';

const ResearchIntelligenceStatus = ({
  loading,
  error,
  errorDetails,
  onRetry,
}) => {
  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <LinearProgress />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
          Running research intelligence pipeline: Question formulation → Portal query → Deep parsing → LLM synthesis → MOAT analysis...
        </Typography>
        <Box sx={{ mt: 3 }}>
          <ResearchIntelligenceSkeleton />
        </Box>
      </Box>
    );
  }

  if (error && !loading) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 3 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        }
      >
        <AlertTitle>Error</AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {error}
        </Typography>
        {errorDetails && errorDetails.actionable && (
          <Typography variant="caption" color="text.secondary">
            <strong>What to do:</strong> {errorDetails.actionable}
          </Typography>
        )}
      </Alert>
    );
  }

  return null;
};

export default ResearchIntelligenceStatus;
