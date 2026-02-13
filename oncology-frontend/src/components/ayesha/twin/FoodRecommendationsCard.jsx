import React from 'react';
import { Card, Typography, Divider, Grid, Chip, Alert, Box } from '@mui/material';
import { Science } from '@mui/icons-material';

/**
 * Food Recommendations Card component
 * Displays A→B validated food/supplement recommendations
 */
export default function FoodRecommendationsCard({ foodRecommendations, analysisSummary }) {
  if (!foodRecommendations || foodRecommendations.length === 0) return null;

  const getVerdictColor = (verdict) => {
    if (verdict === 'SUPPORTED') return 'success';
    if (verdict === 'WEAK_SUPPORT') return 'warning';
    return 'default';
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Science color="primary" />
        🥗 Food/Supplement Recommendations (A→B Validated)
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        {foodRecommendations.map((food, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {food.compound || 'Unknown'}
                </Typography>
                {food.verdict && (
                  <Chip
                    label={food.verdict_explanation || food.verdict}
                    color={getVerdictColor(food.verdict)}
                    size="small"
                  />
                )}
              </Box>

              {food.status === 'ERROR' ? (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {food.error || 'Analysis failed'}
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Score: {food.overall_score || 'N/A'} | Confidence: {food.confidence || 'N/A'}
                  </Typography>
                  {food.llm_evidence && food.llm_evidence.paper_count > 0 && (
                    <Chip
                      label={`📚 ${food.llm_evidence.paper_count} papers`}
                      size="small"
                      color="info"
                      sx={{ mb: 1 }}
                    />
                  )}
                  {food.recommendation && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      <strong>Dosage:</strong> {food.recommendation.dosage}
                    </Typography>
                  )}
                </>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {analysisSummary && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Summary:</strong> {analysisSummary.supported_foods} supported,{' '}
            {analysisSummary.weak_support_foods} weak support out of{' '}
            {analysisSummary.total_foods_analyzed} analyzed
          </Typography>
        </Box>
      )}
    </Card>
  );
}
