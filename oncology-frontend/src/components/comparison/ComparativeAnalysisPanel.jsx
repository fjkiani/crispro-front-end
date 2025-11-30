import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

/**
 * ComparativeAnalysisPanel Component
 * 
 * Provides side-by-side comparison of batch validation results.
 * Shows:
 * - Score distribution
 * - Top performers
 * - Mechanism overlap
 * - Evidence strength comparison
 */
export default function ComparativeAnalysisPanel({ results }) {
  if (results.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No results to compare
        </Typography>
      </Paper>
    );
  }

  // Sort by overall score
  const sortedResults = [...results].sort((a, b) => 
    (b.overall_score || 0) - (a.overall_score || 0)
  );

  // Calculate statistics
  const avgScore = results.reduce((sum, r) => sum + (r.overall_score || 0), 0) / results.length;
  const maxScore = Math.max(...results.map(r => r.overall_score || 0));
  const minScore = Math.min(...results.map(r => r.overall_score || 0));

  // Count mechanisms
  const mechanismCounts = {};
  results.forEach(result => {
    (result.mechanisms || []).forEach(mech => {
      mechanismCounts[mech] = (mechanismCounts[mech] || 0) + 1;
    });
  });

  const topMechanisms = Object.entries(mechanismCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mech]) => mech);

  // Evidence grade distribution
  const evidenceGrades = {
    STRONG: results.filter(r => r.evidence?.evidence_grade === 'STRONG').length,
    MODERATE: results.filter(r => r.evidence?.evidence_grade === 'MODERATE').length,
    WEAK: results.filter(r => r.evidence?.evidence_grade === 'WEAK').length,
    INSUFFICIENT: results.filter(r => r.evidence?.evidence_grade === 'INSUFFICIENT' || !r.evidence?.evidence_grade).length
  };

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon color="primary" />
        Comparative Analysis
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Statistics Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Score Statistics
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Average</Typography>
                  <Typography variant="h6">{(avgScore * 100).toFixed(1)}%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Highest</Typography>
                  <Typography variant="h6" color="success.main">
                    {(maxScore * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Lowest</Typography>
                  <Typography variant="h6" color="error.main">
                    {(minScore * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Top Performers
              </Typography>
              <Stack spacing={1}>
                {sortedResults.slice(0, 3).map((result, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {index + 1}. {result.compound}
                    </Typography>
                    <Chip
                      label={(result.overall_score * 100).toFixed(1) + '%'}
                      size="small"
                      color={index === 0 ? 'success' : 'default'}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Evidence Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Evidence Quality
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip label="STRONG" size="small" color="success" />
                  <Typography variant="body2">{evidenceGrades.STRONG}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip label="MODERATE" size="small" color="info" />
                  <Typography variant="body2">{evidenceGrades.MODERATE}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip label="WEAK" size="small" color="warning" />
                  <Typography variant="body2">{evidenceGrades.WEAK}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip label="INSUFFICIENT" size="small" color="default" />
                  <Typography variant="body2">{evidenceGrades.INSUFFICIENT}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Common Mechanisms */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Common Mechanisms
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {topMechanisms.map((mech) => (
                  <Chip
                    key={mech}
                    label={`${mech} (${mechanismCounts[mech]})`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}







