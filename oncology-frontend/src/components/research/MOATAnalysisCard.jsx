/**
 * MOAT Analysis Card Component
 * 
 * Displays MOAT integration results from Research Intelligence:
 * - Pathways mapped
 * - Treatment line analysis
 * - Biomarker analysis
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
  Paper,
  Grid,
  Divider
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import BiotechIcon from '@mui/icons-material/Biotech';

export default function MOATAnalysisCard({ moatAnalysis, context }) {
  if (!moatAnalysis) {
    return null;
  }

  const pathways = moatAnalysis.pathways || [];
  const treatmentLineAnalysis = moatAnalysis.treatment_line_analysis || {};
  const biomarkerAnalysis = moatAnalysis.biomarker_analysis || {};
  const pathwayAlignment = moatAnalysis.pathway_alignment || {};

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountTreeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">MOAT Analysis</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Research findings mapped to MOAT pathways with treatment line and biomarker context
        </Typography>

        <Grid container spacing={2}>
          {/* Pathways */}
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountTreeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Pathways Mapped ({pathways.length})
                </Typography>
              </Box>
              {pathways.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {pathways.map((pathway, idx) => (
                    <Chip
                      key={idx}
                      label={pathway}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No pathways identified
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Treatment Line Analysis */}
          <Grid item xs={12} md={6}>
            {Object.keys(treatmentLineAnalysis).length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimelineIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Treatment Line Analysis
                  </Typography>
                </Box>
                <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                  {treatmentLineAnalysis.score !== undefined && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Score:</strong> {(treatmentLineAnalysis.score * 100).toFixed(0)}%
                    </Typography>
                  )}
                  {treatmentLineAnalysis.status && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Status:</strong>{' '}
                      <Chip
                        label={treatmentLineAnalysis.status}
                        size="small"
                        color={
                          treatmentLineAnalysis.status === 'appropriate' ? 'success' :
                          treatmentLineAnalysis.status === 'moderate' ? 'warning' : 'default'
                        }
                      />
                    </Typography>
                  )}
                  {treatmentLineAnalysis.reason && (
                    <Typography variant="caption" color="text.secondary">
                      {treatmentLineAnalysis.reason}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}
          </Grid>

          {/* Biomarker Analysis */}
          <Grid item xs={12}>
            {Object.keys(biomarkerAnalysis).length > 0 && (
              <Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BiotechIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Biomarker Analysis
                  </Typography>
                </Box>
                <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                  {biomarkerAnalysis.total_matches !== undefined && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Total Matches:</strong> {biomarkerAnalysis.total_matches}
                    </Typography>
                  )}
                  {biomarkerAnalysis.matches && Array.isArray(biomarkerAnalysis.matches) && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {biomarkerAnalysis.matches.map((match, idx) => (
                        <Chip
                          key={idx}
                          label={match}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                  {biomarkerAnalysis.analysis && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {biomarkerAnalysis.analysis}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}
          </Grid>

          {/* Pathway Alignment (if available) */}
          {Object.keys(pathwayAlignment).length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pathway Alignment Scores
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(pathwayAlignment).map(([pathway, score]) => (
                  <Chip
                    key={pathway}
                    label={`${pathway}: ${(score * 100).toFixed(0)}%`}
                    size="small"
                    color={score >= 0.7 ? 'success' : score >= 0.5 ? 'warning' : 'default'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}




