/**
 * Hint Tiles Panel Component
 * 
 * Displays max 4 clinician action hints in a 2x2 grid:
 * - Category badges (Test/Trials/Monitor/Avoid)
 * - Icon (science, monitor_heart, local_hospital, warning)
 * - Title and message (suggestive tone)
 * - Priority indicator (subtle)
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import WarningIcon from '@mui/icons-material/Warning';

const HintTilesPanel = ({ tiles = [] }) => {
  if (!tiles || tiles.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No hints available at this time.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Max 4 tiles (Manager's policy)
  const displayTiles = tiles.slice(0, 4);

  const getIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'science':
      case 'test':
        return <ScienceIcon />;
      case 'local_hospital':
      case 'trials':
      case 'hospital':
        return <LocalHospitalIcon />;
      case 'monitor_heart':
      case 'monitor':
      case 'monitoring':
        return <MonitorHeartIcon />;
      case 'warning':
      case 'avoid':
        return <WarningIcon />;
      default:
        return <ScienceIcon />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'next_test':
      case 'test':
        return 'primary';
      case 'trials_lever':
      case 'trials':
        return 'info';
      case 'monitoring':
      case 'monitor':
        return 'success';
      case 'avoid':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category?.toLowerCase()) {
      case 'next_test':
      case 'test':
        return 'Test';
      case 'trials_lever':
      case 'trials':
        return 'Trials';
      case 'monitoring':
      case 'monitor':
        return 'Monitor';
      case 'avoid':
        return 'Avoid';
      default:
        return category || 'Hint';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          💡 Clinical Hints
        </Typography>

        <Grid container spacing={2}>
          {displayTiles.map((tile, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  {/* Header: Icon + Category Badge */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box color="primary.main">
                        {getIcon(tile.icon)}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {tile.title || 'Hint'}
                      </Typography>
                    </Box>
                    <Chip
                      label={getCategoryLabel(tile.category)}
                      size="small"
                      color={getCategoryColor(tile.category)}
                    />
                  </Box>

                  {/* Message */}
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {tile.message || 'No message available'}
                  </Typography>

                  {/* Reasons (if available) */}
                  {tile.reasons && Array.isArray(tile.reasons) && tile.reasons.length > 0 && (
                    <Box>
                      {tile.reasons.slice(0, 2).map((reason, idx) => (
                        <Typography
                          key={idx}
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          • {reason}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* Priority Indicator (subtle) */}
                  {tile.priority && (
                    <Box mt={1} display="flex" justifyContent="flex-end">
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: tile.priority <= 2 ? 'primary.main' : 'grey.400',
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HintTilesPanel;







