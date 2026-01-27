/**
 * TimingFeaturesCard Component
 * 
 * Displays timing features (PFI, PTPI, TFI, PFS, OS) for a single regimen.
 * 
 * Props:
 * - timingFeatures: TimingFeatureRecord object
 * - showDetails: boolean (default: true)
 * - highlightPFI: boolean (default: true)
 * - highlightPTPI: boolean (default: true)
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import PFICategoryBadge from './PFICategoryBadge';

const TimingFeaturesCard = ({
  timingFeatures,
  showDetails = true,
  highlightPFI = true,
  highlightPTPI = true,
}) => {
  if (!timingFeatures) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Timing features data unavailable</Typography>
        </CardContent>
      </Card>
    );
  }

  const {
    regimen_id,
    regimen_type,
    line_of_therapy,
    setting,
    PFI_days,
    PFI_category,
    PTPI_days,
    TFI_days,
    PFS_from_regimen_days,
    PFS_event,
    OS_from_regimen_days,
    OS_event,
    has_prior_platinum,
    has_progression_date,
    has_death_or_followup,
    has_ca125_data,
  } = timingFeatures;

  // Format days to months/years
  const formatDays = (days) => {
    if (days === null || days === undefined) return 'N/A';
    const months = Math.round(days / 30.44);
    if (months < 12) {
      return `${months}m (${days}d)`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years}y ${remainingMonths}m (${days}d)`;
  };

  // Data quality warnings
  const dataQualityWarnings = [];
  if (!has_prior_platinum && PFI_days !== null) {
    dataQualityWarnings.push('PFI computed without prior platinum history');
  }
  if (!has_progression_date && PFS_event === 0) {
    dataQualityWarnings.push('PFS censored - progression date missing');
  }
  if (!has_death_or_followup && OS_event === 0) {
    dataQualityWarnings.push('OS censored - follow-up date missing');
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">
              Line {line_of_therapy} - {regimen_type || 'Unknown Regimen'}
            </Typography>
            {setting && (
              <Chip label={setting.replace(/_/g, ' ')} size="small" variant="outlined" />
            )}
          </Box>
        }
        subheader={`Regimen ID: ${regimen_id}`}
      />
      <CardContent>
        <Stack spacing={2}>
          {/* PFI (Platinum-Free Interval) */}
          {highlightPFI && PFI_days !== null && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ClockIcon fontSize="small" />
                <Typography variant="subtitle2">Platinum-Free Interval (PFI)</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PFICategoryBadge pfiDays={PFI_days} pfiCategory={PFI_category} />
                <Typography variant="body2" color="text.secondary">
                  {formatDays(PFI_days)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Time from last platinum dose to next platinum or progression
              </Typography>
            </Box>
          )}

          {/* PTPI (Platinum-to-PARPi Interval) */}
          {highlightPTPI && PTPI_days !== null && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarIcon fontSize="small" />
                <Typography variant="subtitle2">Platinum-to-PARPi Interval (PTPI)</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={formatDays(PTPI_days)}
                  size="small"
                  color="info"
                  icon={<TrendingUpIcon />}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Time from last platinum to PARPi start (predictive for PARPi response)
              </Typography>
            </Box>
          )}

          {/* TFI (Treatment-Free Interval) */}
          {TFI_days !== null && (
            <Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarIcon fontSize="small" />
                <Typography variant="subtitle2">Treatment-Free Interval (TFI)</Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {formatDays(TFI_days)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gap between consecutive treatment regimens
              </Typography>
            </Box>
          )}

          {/* PFS (Progression-Free Survival) */}
          {PFS_from_regimen_days !== null && showDetails && (
            <Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon fontSize="small" />
                <Typography variant="subtitle2">Progression-Free Survival (PFS)</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="body1" fontWeight={600}>
                  {formatDays(PFS_from_regimen_days)}
                </Typography>
                {PFS_event === 1 ? (
                  <Chip
                    icon={<ErrorIcon />}
                    label="Event"
                    size="small"
                    color="error"
                  />
                ) : (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Censored"
                    size="small"
                    color="info"
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Time from regimen start to progression (or censoring)
              </Typography>
            </Box>
          )}

          {/* OS (Overall Survival) */}
          {OS_from_regimen_days !== null && showDetails && (
            <Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon fontSize="small" />
                <Typography variant="subtitle2">Overall Survival (OS)</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="body1" fontWeight={600}>
                  {formatDays(OS_from_regimen_days)}
                </Typography>
                {OS_event === 1 ? (
                  <Chip
                    icon={<ErrorIcon />}
                    label="Event"
                    size="small"
                    color="error"
                  />
                ) : (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Censored"
                    size="small"
                    color="info"
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Time from regimen start to death (or last follow-up)
              </Typography>
            </Box>
          )}

          {/* Data Quality Flags */}
          {showDetails && (
            <Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Data Quality:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  icon={has_prior_platinum ? <CheckCircleIcon /> : <WarningIcon />}
                  label={`Prior Platinum: ${has_prior_platinum ? 'Yes' : 'No'}`}
                  size="small"
                  color={has_prior_platinum ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Chip
                  icon={has_progression_date ? <CheckCircleIcon /> : <WarningIcon />}
                  label={`Progression Date: ${has_progression_date ? 'Yes' : 'No'}`}
                  size="small"
                  color={has_progression_date ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Chip
                  icon={has_death_or_followup ? <CheckCircleIcon /> : <WarningIcon />}
                  label={`Follow-up: ${has_death_or_followup ? 'Yes' : 'No'}`}
                  size="small"
                  color={has_death_or_followup ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Chip
                  icon={has_ca125_data ? <CheckCircleIcon /> : <WarningIcon />}
                  label={`CA-125 Data: ${has_ca125_data ? 'Yes' : 'No'}`}
                  size="small"
                  color={has_ca125_data ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>
            </Box>
          )}

          {/* Data Quality Warnings */}
          {dataQualityWarnings.length > 0 && (
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="caption">
                {dataQualityWarnings.join('; ')}
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TimingFeaturesCard;
