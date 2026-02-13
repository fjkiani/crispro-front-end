import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import TrialMatchCard from '../../trials/TrialMatchCard';
import TrialSafetyGate from '../../safety/TrialSafetyGate';

const TrialsTab = ({ trials, patientName }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Top {trials.length} Clinical Trials
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Ranked by match score with transparent reasoning • PD-L1+ and p53 mutant boost IO and DDR trials
      </Typography>

      {trials.length === 0 ? (
        <Alert severity="info">
          No trials found matching {patientName || 'Patient'}'s profile. Try adjusting filters or check back later.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {trials.map((trial, index) => (
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
