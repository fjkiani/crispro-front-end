/**
 * AnalysisLoadingCard
 *
 * Shows elapsed time + progress bar so the user knows the request is in flight,
 * not hung. A "Retry" button appears after a configurable threshold.
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

const AnalysisLoadingCard = ({ onRetry, showRetryAfterMs = 12000 }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    // Expected: ~7-8s on warm backend, up to 30s on cold start
    const expectedSeconds = 8;
    const progress = Math.min((elapsed / expectedSeconds) * 100, 95); // cap at 95 until done
    const showRetry = elapsed * 1000 >= showRetryAfterMs;

    return (
        <Box sx={{
            p: 3, borderRadius: 3, textAlign: 'center',
            border: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc',
        }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Analyzing treatment options...
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                {elapsed < 3
                    ? 'Connecting to analysis service...'
                    : elapsed < 10
                        ? `Running therapy fit analysis... (${elapsed}s)`
                        : `Still working — complex analysis in progress (${elapsed}s)`}
            </Typography>

            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ borderRadius: 2, height: 6, mb: 2, bgcolor: '#e2e8f0' }}
            />

            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Analysis typically takes 7–10 seconds
            </Typography>

            {showRetry && onRetry && (
                <Box sx={{ mt: 2 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={onRetry}
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    >
                        Taking too long? Retry
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default AnalysisLoadingCard;
