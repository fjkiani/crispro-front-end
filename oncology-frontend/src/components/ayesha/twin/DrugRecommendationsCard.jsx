import React from 'react';
import { Card, Typography, Divider, List, ListItem, Box, Chip, Alert } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

/**
 * Drug Recommendations Card component
 * Displays WIWFM (Will It Work For Me) drug efficacy rankings
 */
export default function DrugRecommendationsCard({ drugRecommendations }) {
  if (!drugRecommendations || drugRecommendations.error) return null;

  // Support multiple shapes:
  // - `wiwfm` object: { status, drugs: [...] }
  // - direct array of drugs: [...]
  // - legacy object: { drugs: [...] }
  const drugs = Array.isArray(drugRecommendations)
    ? drugRecommendations
    : (drugRecommendations.drugs || []);

  if (drugs.length === 0) {
    return (
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital color="primary" />
          💊 Drug Recommendations (WIWFM)
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Alert severity="info">
          No drug rankings available for this run.
          {typeof drugRecommendations?.status === 'string' ? ` (status: ${drugRecommendations.status})` : ''}
        </Alert>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalHospital color="primary" />
        💊 Drug Recommendations (WIWFM)
      </Typography>
      <Divider sx={{ my: 2 }} />

      <List>
        {drugs.slice(0, 5).map((drug, idx) => (
          <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mb: 1 }}>
              <Chip label={`#${idx + 1}`} color="primary" size="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                {drug.name || drug.drug_name || drug.drug || 'Unknown'}
              </Typography>
              <Chip
                label={`Efficacy: ${((drug.efficacy_score || 0) * 100).toFixed(0)}%`}
                color={drug.efficacy_score > 0.6 ? 'success' : drug.efficacy_score > 0.4 ? 'warning' : 'default'}
                size="small"
              />
              <Chip
                label={`Confidence: ${((drug.confidence || 0) * 100).toFixed(0)}%`}
                variant="outlined"
                size="small"
              />
            </Box>
            {drug.evidence_tier && (
              <Typography variant="caption" color="text.secondary">
                Evidence Tier: {drug.evidence_tier}
              </Typography>
            )}
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
