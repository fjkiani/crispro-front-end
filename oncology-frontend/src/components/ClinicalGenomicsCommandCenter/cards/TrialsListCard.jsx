/**
 * ⚔️ CLINICAL TRIALS LIST CARD ⚔️
 */

import React from 'react';
import { Paper, Typography, LinearProgress, Alert, Box, Card, CardContent, Chip, Link } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

export const TrialsListCard = ({ result, loading, error }) => {
  if (loading) return (<Paper sx={{ p: 3 }}><Typography variant="h6">🔬 Clinical Trials</Typography><LinearProgress /></Paper>);
  if (error) return (<Paper sx={{ p: 3 }}><Typography variant="h6">🔬 Clinical Trials</Typography><Alert severity="error">{error}</Alert></Paper>);
  if (!result || !result.trials || result.trials.length === 0) {
    return (<Paper sx={{ p: 3 }}><Typography variant="h6">🔬 Clinical Trials</Typography><Typography variant="body2" color="text.secondary">No trials found</Typography></Paper>);
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>🔬 Clinical Trials ({result.trials.length} found)</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {result.trials.map((trial, i) => (
          <Card key={i} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">{trial.title}</Typography>
                <Chip label={trial.phase} size="small" color="primary" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{trial.summary}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={trial.status} size="small" variant="outlined" />
                {trial.location && <Chip label={trial.location} size="small" variant="outlined" />}
                {trial.match_score && <Chip label={`Match: ${(trial.match_score * 100).toFixed(0)}%`} size="small" color="success" />}
              </Box>
              {trial.nct_id && (
                <Link href={`https://clinicaltrials.gov/study/${trial.nct_id}`} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption">{trial.nct_id}</Typography>
                  <OpenInNew fontSize="small" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};

export default TrialsListCard;


