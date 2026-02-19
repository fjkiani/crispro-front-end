import React, { useState, useMemo } from 'react';
import { Box, Typography, Alert, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import TrialMatchCard from '../../trials/TrialMatchCard';
import TrialSafetyGate from '../../safety/TrialSafetyGate';

/**
 * Determine if a trial is actively recruiting.
 * Must be strictly "RECRUITING" — NOT "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING", etc.
 */
const isRecruiting = (trial) => {
  const status = (trial?.status || '').toUpperCase().trim();
  return status === 'RECRUITING';
};

const TrialsTab = ({ trials, patientName }) => {
  const [filter, setFilter] = useState('all');

  const filteredTrials = useMemo(() => {
    if (filter === 'recruiting') return trials.filter(isRecruiting);
    if (filter === 'non-recruiting') return trials.filter(t => !isRecruiting(t));
    return trials;
  }, [trials, filter]);

  const recruitingCount = useMemo(() => trials.filter(isRecruiting).length, [trials]);
  const nonRecruitingCount = trials.length - recruitingCount;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            {filteredTrials.length} Clinical Trials
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ranked by holistic match score • PD-L1+ and p53 mutant boost IO and DDR trials
          </Typography>
        </Box>

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
      </Box>

      {filteredTrials.length === 0 ? (
        <Alert severity="info">
          No {filter !== 'all' ? filter.replace('-', ' ') : ''} trials found matching {patientName || 'Patient'}'s profile.
          {filter !== 'all' && ' Try switching the filter to see all trials.'}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredTrials.map((trial, index) => (
            <Box key={trial.nct_id || index}>
              <TrialMatchCard
                trial={trial}
                rank={index + 1}
              />
              {/* PGx Trial Safety Gate (RUO) */}
              {trial?.pgx_safety && (
                <TrialSafetyGate trial={trial} />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TrialsTab;
