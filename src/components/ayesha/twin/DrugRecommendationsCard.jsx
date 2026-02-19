import React from 'react';
import { Card, Typography, Divider, List, ListItem, Box, Chip, Alert } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

/**
 * Drug Recommendations Card component
 * Displays WIWFM (Will It Work For Me) drug efficacy rankings
 * 
 * Contract rules:
 * - Show final_score when present, fall back to efficacy_score
 * - Show resistance badge ONLY when therapy_fit_adjustment exists
 * - When no drugs: explain WHY and suggest next action
 * - When preview_l1: show drugs with RUO label
 */
export default function DrugRecommendationsCard({ drugRecommendations }) {
  if (!drugRecommendations || drugRecommendations.error) return null;

  // Support multiple shapes:
  // - `wiwfm` object: { status, drugs: [...] }
  // - `wiwfm` object with recommendations: { status, recommendations: [...] }
  // - direct array of drugs: [...]
  // - legacy object: { drugs: [...] }
  const drugs = Array.isArray(drugRecommendations)
    ? drugRecommendations
    : (drugRecommendations.drugs || drugRecommendations.recommendations || []);

  const status = drugRecommendations?.status;
  const isPreview = status === 'preview_l1';

  if (drugs.length === 0) {
    // Explain WHY rankings are empty and suggest next action
    let reason;
    let nextStep;
    if (status === 'awaiting_ngs') {
      reason = 'Personalized drug rankings require tumor NGS data (HRD, TMB, somatic variants).';
      nextStep = 'Order HRD score (MyChoice CDx) or ctDNA panel (Guardant360).';
    } else if (isPreview) {
      reason = 'Preview mode — limited data available. Full ranking requires tumor NGS.';
      nextStep = 'Order tumor NGS to unlock Evo2-powered drug efficacy scoring.';
    } else {
      reason = 'Drug rankings were not computed for this run.';
      nextStep = 'Run analysis to generate drug efficacy predictions.';
    }

    return (
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital color="primary" />
          💊 Therapy Fit Rankings
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Alert severity="info">
          <Typography variant="body2">{reason}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Next step:</strong> {nextStep}
          </Typography>
        </Alert>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital color="primary" />
          💊 Therapy Fit Rankings
        </Typography>
        {isPreview && (
          <Chip label="RUO · Preview" size="small" variant="outlined" color="warning" />
        )}
      </Box>
      <Divider sx={{ my: 2 }} />

      {isPreview && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="caption">
            Preview computed from germline + IHC context. Full personalized ranking requires tumor NGS.
          </Typography>
        </Alert>
      )}

      <List>
        {drugs.slice(0, 5).map((drug, idx) => {
          // Contract: final_score preferred, efficacy_score fallback
          const primaryScore = drug.final_score ?? drug.efficacy_score ?? null;
          const hasResistanceAdj = !!drug.therapy_fit_adjustment;

          return (
            <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mb: 1 }}>
                <Chip label={`#${idx + 1}`} color="primary" size="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {drug.name || drug.drug_name || drug.drug || 'Unknown'}
                </Typography>
                {primaryScore != null ? (
                  <Chip
                    label={`${(primaryScore * 100).toFixed(0)}%`}
                    color={primaryScore > 0.6 ? 'success' : primaryScore > 0.4 ? 'warning' : 'default'}
                    size="small"
                  />
                ) : (
                  <Chip label="Not scored" size="small" variant="outlined" />
                )}
                {drug.confidence != null && (
                  <Chip
                    label={`Confidence: ${((drug.confidence) * 100).toFixed(0)}%`}
                    variant="outlined"
                    size="small"
                  />
                )}
                {/* Resistance badge — ONLY when therapy_fit_adjustment exists */}
                {hasResistanceAdj && (
                  <Chip
                    label={`${drug.therapy_fit_adjustment.modifier?.toFixed(2) || '?'}× resistance adj.`}
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              {drug.evidence_tier && (
                <Typography variant="caption" color="text.secondary">
                  Evidence Tier: {drug.evidence_tier}
                </Typography>
              )}
              {/* Show original score if final_score differs */}
              {drug.final_score != null && drug.efficacy_score != null && drug.final_score !== drug.efficacy_score && (
                <Typography variant="caption" color="text.secondary">
                  Original score: {(drug.efficacy_score * 100).toFixed(0)}%
                </Typography>
              )}
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
}
