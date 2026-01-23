import React from 'react';
import {
  Box,
  Skeleton,
  Paper,
  Typography,
  LinearProgress
} from '@mui/material';

/**
 * Loading skeleton for Executive Summary
 */
export const ExecutiveSummarySkeleton = () => (
  <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Skeleton variant="rectangular" width="45%" height={120} />
      <Skeleton variant="rectangular" width="45%" height={120} />
    </Box>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Skeleton variant="rectangular" width="45%" height={120} />
      <Skeleton variant="rectangular" width="45%" height={120} />
    </Box>
  </Paper>
);

/**
 * Loading skeleton for variant cards
 */
export const VariantCardSkeleton = () => (
  <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
    <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
    <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Skeleton variant="rectangular" width={100} height={32} />
      <Skeleton variant="rectangular" width={100} height={32} />
    </Box>
  </Paper>
);

/**
 * Loading skeleton for drug recommendations
 */
export const DrugCardSkeleton = () => (
  <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
    <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Skeleton variant="rectangular" width={80} height={24} />
      <Skeleton variant="rectangular" width={80} height={24} />
    </Box>
  </Paper>
);

/**
 * Progress indicator for loading sections
 */
export const LoadingProgressIndicator = ({ currentSection, totalSections, sectionName }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Loading {sectionName || 'analysis'}... ({currentSection}/{totalSections} sections)
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {Math.round((currentSection / totalSections) * 100)}%
      </Typography>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={(currentSection / totalSections) * 100}
      sx={{ height: 8, borderRadius: 1 }}
    />
  </Box>
);

/**
 * Full page loading state
 */
export const FullPageLoadingState = ({ message = 'Loading clinical dossier...' }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    minHeight: '400px',
    p: 4
  }}>
    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
      {message}
    </Typography>
    <LinearProgress sx={{ width: '100%', maxWidth: 400, height: 8, borderRadius: 1 }} />
    <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
      This may take 10-30 seconds...
    </Typography>
  </Box>
);


