import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Paper,
  Stack
} from '@mui/material';

/**
 * BatchProgressTracker Component
 * 
 * Displays real-time progress for batch validation.
 * Shows:
 * - Overall progress (X/Y complete)
 * - Current item being processed
 * - Estimated time remaining
 */
export default function BatchProgressTracker({ progress, total }) {
  const { completed, current, errors } = progress || { completed: 0, current: null, errors: [] };
  const percentComplete = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Stack spacing={2}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Processing compounds...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {completed} of {total} complete ({percentComplete.toFixed(0)}%)
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={percentComplete} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {current && (
          <Typography variant="body2" color="text.secondary">
            Currently processing: <strong>{current}</strong>
          </Typography>
        )}

        {errors.length > 0 && (
          <Box>
            <Typography variant="body2" color="error" gutterBottom>
              Errors ({errors.length}):
            </Typography>
            {errors.map((error, index) => (
              <Typography key={index} variant="caption" color="error" display="block">
                {error.compound}: {error.message}
              </Typography>
            ))}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}






