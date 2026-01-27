/**
 * SAE Features Card Component
 * 
 * Displays Strategic Alignment and Efficacy features:
 * - DNA repair capacity
 * - 7D mechanism vector (DDR, MAPK, PI3K, VEGF, HER2, IO, Efflux)
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DnaIcon from '@mui/icons-material/AccountTree';

export default function SAEFeaturesCard({ saeFeatures }) {
  if (!saeFeatures) {
    return null;
  }

  const dnaRepairCapacity = saeFeatures.dna_repair_capacity || saeFeatures.dna_repair || 0;
  const mechanismVector = saeFeatures.mechanism_vector_7d || saeFeatures.mechanism_vector || [];
  const pathwayLabels = saeFeatures.pathway_labels || [
    'DDR', 'MAPK', 'PI3K', 'VEGF', 'HER2', 'IO', 'Efflux'
  ];

  // Ensure we have 7 values
  const vector7d = mechanismVector.length === 7
    ? mechanismVector
    : [...mechanismVector, ...Array(7 - mechanismVector.length).fill(0)].slice(0, 7);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AnalyticsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">SAE Features</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Strategic Alignment and Efficacy features for treatment line appropriateness
        </Typography>

        <Grid container spacing={2}>
          {/* DNA Repair Capacity */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DnaIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  DNA Repair Capacity
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  {(dnaRepairCapacity * 100).toFixed(0)}%
                </Typography>
                <Chip
                  label={
                    dnaRepairCapacity >= 0.7 ? 'High' :
                    dnaRepairCapacity >= 0.4 ? 'Moderate' : 'Low'
                  }
                  size="small"
                  color={
                    dnaRepairCapacity >= 0.7 ? 'success' :
                    dnaRepairCapacity >= 0.4 ? 'warning' : 'error'
                  }
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={dnaRepairCapacity * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      dnaRepairCapacity >= 0.7 ? 'success.main' :
                      dnaRepairCapacity >= 0.4 ? 'warning.main' : 'error.main'
                  }
                }}
              />
            </Paper>
          </Grid>

          {/* 7D Mechanism Vector */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                7D Mechanism Vector
              </Typography>
              <Box>
                {vector7d.map((value, idx) => {
                  const label = pathwayLabels[idx] || `Pathway ${idx + 1}`;
                  return (
                    <Box key={idx} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight="medium">
                          {label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(value * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={value * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'primary.main'
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
          Note: Radar chart visualization can be added for better visual representation
        </Typography>
      </CardContent>
    </Card>
  );
}















