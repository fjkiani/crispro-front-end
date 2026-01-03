/**
 * Clinical Trial Recommendations Card Component
 * 
 * Displays mechanism-fit ranked clinical trials with NCT IDs, phases, and status
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
  Paper,
  Divider
} from '@mui/material';
import ClinicalTrialsIcon from '@mui/icons-material/ClinicalTrials';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function ClinicalTrialRecsCard({ trials = [] }) {
  if (!trials || trials.length === 0) {
    return null;
  }

  const getPhaseColor = (phase) => {
    if (phase?.toLowerCase().includes('phase i')) return 'error';
    if (phase?.toLowerCase().includes('phase ii')) return 'warning';
    if (phase?.toLowerCase().includes('phase iii')) return 'success';
    return 'default';
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('recruiting')) return 'success';
    if (statusLower.includes('active')) return 'info';
    if (statusLower.includes('completed')) return 'default';
    if (statusLower.includes('terminated')) return 'error';
    return 'default';
  };

  // Sort by mechanism fit score (highest first)
  const sortedTrials = [...trials].sort((a, b) => {
    const scoreA = a.mechanism_fit_score || a.fit_score || 0;
    const scoreB = b.mechanism_fit_score || b.fit_score || 0;
    return scoreB - scoreA;
  });

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ClinicalTrialsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Clinical Trial Recommendations</Typography>
          <Chip
            label={`${trials.length} trial${trials.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ ml: 2 }}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Trials ranked by mechanism fit to your research query
        </Typography>

        <List>
          {sortedTrials.map((trial, idx) => {
            const nctId = trial.nct_id || trial.nct || '';
            const title = trial.title || trial.name || 'Untitled Trial';
            const mechanismFit = trial.mechanism_fit_score || trial.fit_score || 0;
            const phase = trial.phase || 'Unknown';
            const status = trial.status || 'Unknown';
            const sponsor = trial.sponsor || trial.sponsor_name || null;
            const url = `https://clinicaltrials.gov/ct2/show/${nctId}`;

            return (
              <React.Fragment key={idx}>
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.paper',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    '&:hover': {
                      boxShadow: 2,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            fontWeight: 'medium',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {title}
                        </Link>
                        <OpenInNewIcon fontSize="small" color="action" />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {nctId && (
                          <Chip
                            label={nctId}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace' }}
                          />
                        )}
                        <Chip
                          label={phase}
                          size="small"
                          color={getPhaseColor(phase)}
                        />
                        <Chip
                          label={status}
                          size="small"
                          color={getStatusColor(status)}
                          variant="outlined"
                        />
                        {sponsor && (
                          <Chip
                            label={sponsor}
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Mechanism Fit Score */}
                  <Box sx={{ width: '100%', pl: 7 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Mechanism Fit Score
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {(mechanismFit * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={mechanismFit * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor:
                            mechanismFit >= 0.8 ? 'success.main' :
                            mechanismFit >= 0.6 ? 'warning.main' : 'info.main'
                        }
                      }}
                    />
                  </Box>
                </ListItem>
                {idx < sortedTrials.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}


