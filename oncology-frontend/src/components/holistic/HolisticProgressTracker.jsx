import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Paper,
  Stack,
  Fade,
  alpha
} from '@mui/material';
import {
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

/**
 * HolisticProgressTracker Component
 * 
 * Beautiful progress display with:
 * - Gradient progress bar
 * - Animated completion states
 * - Real-time updates
 */
export default function HolisticProgressTracker({ progress, total }) {
  const { completed, current, errors } = progress || { completed: 0, current: null, errors: [] };
  const percentComplete = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = completed >= total;

  return (
    <Fade in timeout={500}>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          background: isComplete
            ? 'linear-gradient(135deg, #4caf5015 0%, #45a04915 100%)'
            : 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          border: '2px solid',
          borderColor: isComplete ? alpha('#4caf50', 0.3) : alpha('#667eea', 0.3),
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                {isComplete ? (
                  <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />
                ) : (
                  <HourglassEmptyIcon sx={{ fontSize: 32, color: 'primary.main', animation: 'spin 2s linear infinite' }} />
                )}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {isComplete ? 'Validation Complete!' : 'Processing Compounds...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {completed} of {total} complete ({percentComplete.toFixed(0)}%)
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentComplete}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: alpha('#667eea', 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: isComplete
                    ? 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)'
                    : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: isComplete
                    ? '0 2px 8px rgba(76, 175, 80, 0.3)'
                    : '0 2px 8px rgba(102, 126, 234, 0.3)'
                }
              }}
            />
          </Box>

          {current && !isComplete && (
            <Fade in timeout={300}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha('#667eea', 0.1),
                  border: `1px solid ${alpha('#667eea', 0.2)}`
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Currently processing: <strong>{current}</strong>
                </Typography>
              </Box>
            </Fade>
          )}

          {errors.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#f44336', 0.1),
                border: `1px solid ${alpha('#f44336', 0.2)}`
              }}
            >
              <Typography variant="body2" color="error" gutterBottom sx={{ fontWeight: 600 }}>
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
    </Fade>
  );
}






