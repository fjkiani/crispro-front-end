/**
 * Ayesha Trials — Full List Page
 * 
 * Dedicated page showing ALL matched trials.
 * Reached via "View All Trials" from the 360° Dashboard.
 * Navigation back via sidebar or "Back to Dashboard" button.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  Paper,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import TrialMatchCard from '../../components/trials/TrialMatchCard';
import TrialSafetyGate from '../../components/safety/TrialSafetyGate';
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';
import { useAyeshaCareData } from '../../hooks/ayesha/useAyeshaCareData';
import { CompleteCareLoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/orchestrator/Common/index';

const isRecruiting = (t) =>
  t?.recruitment_status?.toLowerCase() === 'recruiting' ||
  t?.OverallStatus?.toLowerCase() === 'recruiting';

const AyeshaTrialsOnly = () => {
  const navigate = useNavigate();
  const { profile } = useAyeshaProfile();
  const [filter, setFilter] = useState('all');

  const { result, loading, error, refresh } = useAyeshaCareData({
    include_trials: true,
    include_soc: false,
    include_ca125: false,
    include_wiwfm: false,
    include_food: false,
    include_resistance: false,
    include_resistance_prediction: false,
    include_io_selection: false,
    max_trials: 1200,
  });

  const trials = result?.trials?.trials || [];

  const filteredTrials = useMemo(() => {
    if (filter === 'recruiting') return trials.filter(isRecruiting);
    if (filter === 'non-recruiting') return trials.filter(t => !isRecruiting(t));
    return trials;
  }, [trials, filter]);

  const recruitingCount = useMemo(() => trials.filter(isRecruiting).length, [trials]);
  const nonRecruitingCount = trials.length - recruitingCount;

  if (loading) return <CompleteCareLoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/ayesha-trials')}
            sx={{ textTransform: 'none' }}
          >
            ← Back to 360° Dashboard
          </Button>
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Clinical Trials ({trials.length})
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          All matched trials for {profile?.patient?.display_name || 'Patient'} • Ranked by holistic match score
        </Typography>

        {/* Filter */}
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, v) => { if (v !== null) setFilter(v); }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              px: 2,
              py: 0.5,
              fontWeight: 500,
              fontSize: '0.8rem',
              borderColor: 'divider',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            },
          }}
        >
          <ToggleButton value="all">
            All <Chip label={trials.length} size="small" sx={{ ml: 0.75, height: 20, fontSize: '0.7rem' }} />
          </ToggleButton>
          <ToggleButton value="recruiting">
            Recruiting <Chip label={recruitingCount} size="small" color="success" sx={{ ml: 0.75, height: 20, fontSize: '0.7rem' }} />
          </ToggleButton>
          <ToggleButton value="non-recruiting">
            Non-Recruiting <Chip label={nonRecruitingCount} size="small" sx={{ ml: 0.75, height: 20, fontSize: '0.7rem' }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Trials List */}
      {filteredTrials.length === 0 ? (
        <Alert severity="info">
          No {filter !== 'all' ? filter.replace('-', ' ') : ''} trials found matching {profile?.patient?.display_name || 'Patient'}'s profile.
          {filter !== 'all' && ' Try switching the filter to see all trials.'}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredTrials.map((trial, index) => (
            <Box key={trial.nct_id || index}>
              <TrialMatchCard trial={trial} rank={index + 1} />
              {trial?.pgx_safety && <TrialSafetyGate trial={trial} />}
            </Box>
          ))}
        </Box>
      )}

      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 4, borderRadius: '8px' }}>
        <Typography variant="body2">
          <strong>Research Use Only (RUO):</strong> Trial recommendations should be reviewed by a qualified
          oncologist before making treatment decisions.
        </Typography>
      </Alert>
    </Container>
  );
};

export default AyeshaTrialsOnly;
