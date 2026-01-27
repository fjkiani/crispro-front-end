/**
 * TreatmentHistoryTimeline Component
 * 
 * Visual timeline of treatment history with timing features.
 * 
 * Props:
 * - timingFeaturesTable: Array of TimingFeatureRecord objects (from API response)
 * - orientation: "horizontal" | "vertical" (default: "horizontal")
 * - showTFI: boolean (default: true) - Show treatment-free intervals
 * - showPFI: boolean (default: true) - Show platinum-free interval markers
 * - showPTPI: boolean (default: true) - Show platinum-to-PARPi interval markers
 * - compact: boolean (default: false) - Compact view for mobile
 */
import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Tooltip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import PFICategoryBadge from './PFICategoryBadge';

const TreatmentHistoryTimeline = ({
  timingFeaturesTable = [],
  orientation = 'horizontal',
  showTFI = true,
  showPFI = true,
  showPTPI = true,
  compact = false,
}) => {
  if (!timingFeaturesTable || timingFeaturesTable.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No treatment history data available
        </Typography>
      </Paper>
    );
  }

  // Sort regimens by line_of_therapy
  const sortedRegimens = useMemo(() => {
    return [...timingFeaturesTable].sort((a, b) => {
      return (a.line_of_therapy || 0) - (b.line_of_therapy || 0);
    });
  }, [timingFeaturesTable]);

  // Format days to readable string
  const formatDays = (days) => {
    if (days === null || days === undefined) return null;
    const months = Math.round(days / 30.44);
    if (months < 12) {
      return `${months}m`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
  };

  // Calculate timeline width (for horizontal layout)
  const maxDays = useMemo(() => {
    const allDays = sortedRegimens
      .map(r => [
        r.PFS_from_regimen_days,
        r.OS_from_regimen_days,
        r.PFI_days,
        r.PTPI_days,
      ])
      .flat()
      .filter(d => d !== null && d !== undefined);
    return Math.max(...allDays, 365); // Default to 1 year if no data
  }, [sortedRegimens]);

  if (orientation === 'vertical') {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Treatment History Timeline
        </Typography>
        <Stack spacing={3}>
          {sortedRegimens.map((regimen, idx) => {
            const isLast = idx === sortedRegimens.length - 1;
            return (
              <Box key={regimen.regimen_id || idx}>
                {/* Regimen Card */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Line {regimen.line_of_therapy}: {regimen.regimen_type || 'Unknown'}
                      </Typography>
                      {regimen.setting && (
                        <Chip
                          label={regimen.setting.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                    <Box textAlign="right">
                      {regimen.regimen_id && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {regimen.regimen_id}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* PFI Badge */}
                  {showPFI && regimen.PFI_days !== null && (
                    <Box mb={1}>
                      <PFICategoryBadge
                        pfiDays={regimen.PFI_days}
                        pfiCategory={regimen.PFI_category}
                      />
                    </Box>
                  )}

                  {/* PTPI */}
                  {showPTPI && regimen.PTPI_days !== null && (
                    <Box mb={1}>
                      <Chip
                        icon={<CalendarIcon />}
                        label={`PTPI: ${formatDays(regimen.PTPI_days)}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  {/* PFS/OS */}
                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                    {regimen.PFS_from_regimen_days !== null && (
                      <Chip
                        icon={<TrendingUpIcon />}
                        label={`PFS: ${formatDays(regimen.PFS_from_regimen_days)}`}
                        size="small"
                        color={regimen.PFS_event === 1 ? 'error' : 'info'}
                        variant="outlined"
                      />
                    )}
                    {regimen.OS_from_regimen_days !== null && (
                      <Chip
                        icon={<TrendingUpIcon />}
                        label={`OS: ${formatDays(regimen.OS_from_regimen_days)}`}
                        size="small"
                        color={regimen.OS_event === 1 ? 'error' : 'info'}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Paper>

                {/* TFI Gap */}
                {!isLast && showTFI && regimen.TFI_days !== null && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      my: 2,
                      position: 'relative',
                    }}
                  >
                    <Divider sx={{ width: '100%' }} />
                    <Tooltip
                      title={`Treatment-Free Interval: ${regimen.TFI_days} days (${formatDays(regimen.TFI_days)})`}
                      arrow
                    >
                      <Chip
                        icon={<ClockIcon />}
                        label={`TFI: ${formatDays(regimen.TFI_days)}`}
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{
                          position: 'absolute',
                          bgcolor: 'background.paper',
                        }}
                      />
                    </Tooltip>
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </Paper>
    );
  }

  // Horizontal layout
  return (
    <Paper sx={{ p: 3, overflowX: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Treatment History Timeline
      </Typography>
      <Box
        sx={{
          position: 'relative',
          minHeight: compact ? '200px' : '300px',
          mt: 3,
        }}
      >
        {/* Timeline axis */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            bgcolor: 'grey.300',
          }}
        />

        {/* Regimens */}
        {sortedRegimens.map((regimen, idx) => {
          const startPosition = idx * 20; // Vertical spacing
          const widthPercent = regimen.PFS_from_regimen_days
            ? Math.min(100, (regimen.PFS_from_regimen_days / maxDays) * 100)
            : 20;

          return (
            <Box
              key={regimen.regimen_id || idx}
              sx={{
                position: 'absolute',
                bottom: `${startPosition}px`,
                left: 0,
                width: `${widthPercent}%`,
                minWidth: '100px',
              }}
            >
              {/* Regimen bar */}
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Line {regimen.line_of_therapy}: {regimen.regimen_type}
                    </Typography>
                    {regimen.PFS_from_regimen_days !== null && (
                      <Typography variant="caption">
                        PFS: {formatDays(regimen.PFS_from_regimen_days)}
                      </Typography>
                    )}
                    {regimen.PFI_days !== null && (
                      <Typography variant="caption">
                        PFI: {formatDays(regimen.PFI_days)}
                      </Typography>
                    )}
                  </Box>
                }
                arrow
              >
                <Box
                  sx={{
                    height: compact ? '30px' : '40px',
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    L{regimen.line_of_therapy}: {regimen.regimen_type?.substring(0, 10) || 'Unknown'}
                  </Typography>
                </Box>
              </Tooltip>

              {/* PFI marker */}
              {showPFI && regimen.PFI_days !== null && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: compact ? '-25px' : '-30px',
                    left: 0,
                  }}
                >
                  <PFICategoryBadge
                    pfiDays={regimen.PFI_days}
                    pfiCategory={regimen.PFI_category}
                  />
                </Box>
              )}

              {/* PTPI marker */}
              {showPTPI && regimen.PTPI_days !== null && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: compact ? '-50px' : '-60px',
                    left: 0,
                  }}
                >
                  <Chip
                    icon={<CalendarIcon />}
                    label={`PTPI: ${formatDays(regimen.PTPI_days)}`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          );
        })}

        {/* TFI gaps (shown as breaks between regimens) */}
        {showTFI &&
          sortedRegimens.slice(0, -1).map((regimen, idx) => {
            if (regimen.TFI_days === null) return null;
            const startPosition = idx * 20;
            const nextRegimen = sortedRegimens[idx + 1];
            const gapStart = regimen.PFS_from_regimen_days
              ? (regimen.PFS_from_regimen_days / maxDays) * 100
              : 20;
            const gapWidth = (regimen.TFI_days / maxDays) * 100;

            return (
              <Box
                key={`tfi-${idx}`}
                sx={{
                  position: 'absolute',
                  bottom: `${startPosition + 20}px`,
                  left: `${gapStart}%`,
                  width: `${gapWidth}%`,
                  height: '2px',
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Tooltip
                  title={`Treatment-Free Interval: ${regimen.TFI_days} days (${formatDays(regimen.TFI_days)})`}
                  arrow
                >
                  <Chip
                    icon={<ClockIcon />}
                    label={formatDays(regimen.TFI_days)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: 'warning.light',
                    }}
                  />
                </Tooltip>
              </Box>
            );
          })}
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: 'primary.main',
              borderRadius: 1,
            }}
          />
          <Typography variant="caption">Regimen</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 20,
              height: 2,
              bgcolor: 'warning.main',
            }}
          />
          <Typography variant="caption">TFI Gap</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <ClockIcon fontSize="small" color="info" />
          <Typography variant="caption">PTPI Marker</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default TreatmentHistoryTimeline;
