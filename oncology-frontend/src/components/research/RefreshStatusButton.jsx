import React from 'react';
import { Button, CircularProgress, Alert, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTrialRefresh } from '../../hooks/useTrialRefresh';

/**
 * RefreshStatusButton Component
 * 
 * Button that calls /api/trials/refresh_status to update live trial status and locations.
 * 
 * @param {Object} props
 * @param {string[]} props.nctIds - Array of NCT IDs to refresh
 * @param {string|null} [props.stateFilter] - Optional state filter (e.g., 'NY')
 * @param {Function} props.onRefreshComplete - Callback when refresh completes
 * @param {boolean} [props.disabled] - Disable button
 */
const RefreshStatusButton = ({ 
  nctIds, 
  stateFilter = null, 
  onRefreshComplete,
  disabled = false 
}) => {
  const { refreshing, error, refreshStatus } = useTrialRefresh();

  const handleClick = async () => {
    if (!nctIds || nctIds.length === 0) {
      return;
    }

    try {
      const data = await refreshStatus(nctIds, stateFilter);
      
      if (onRefreshComplete) {
        onRefreshComplete(data);
      }
    } catch (err) {
      console.error('Failed to refresh trial status:', err);
      // Error is handled by hook and displayed below
    }
  };

  const isDisabled = disabled || refreshing || !nctIds || nctIds.length === 0;

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
        onClick={handleClick}
        disabled={isDisabled}
        sx={{ mb: error ? 1 : 0 }}
      >
        {refreshing ? 'Refreshing...' : '🔄 Refresh Live Status'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          Failed to refresh trial status: {error}
        </Alert>
      )}
    </Box>
  );
};

export default RefreshStatusButton;

