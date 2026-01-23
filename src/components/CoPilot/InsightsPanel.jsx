import React from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import { Lightbulb as InsightIcon, Science as ScienceIcon } from '@mui/icons-material';
import { useCoPilot } from './context/CoPilotContext';
import { useRadOncGuidance } from './hooks/useRadOncGuidance';
import { useChemoGuidance } from './hooks/useChemoGuidance';
import { RadOncGuidanceCard } from './integrations/RadOncGuidanceCard';
import { ChemoGuidanceCard } from './integrations/ChemoGuidanceCard';

/**
 * Insights Panel Component
 * Shows context-aware insights and proactive suggestions
 */
export const InsightsPanel = ({ getContextSuggestions, onSuggestionClick }) => {
  const { currentVariant, currentDisease, currentPage } = useCoPilot();
  const { loading: radLoading, error: radError, guidance: radGuidance, fetchGuidance: fetchRad } = useRadOncGuidance();
  const { loading: chemoLoading, error: chemoError, guidance: chemoGuidance, fetchGuidance: fetchChemo } = useChemoGuidance();

  // Generate context-aware insights
  const getContextInsights = () => {
    if (!currentVariant) return [];

    const insights = [
      {
        title: "Variant Context",
        content: `Currently analyzing ${currentVariant.gene} ${currentVariant.hgvs_p}`,
        type: "info"
      },
      {
        title: "Disease Focus",
        content: currentDisease ? `Focused on ${currentDisease}` : "General cancer research",
        type: "info"
      },
      {
        title: "Quick Actions",
        content: "Ask me about functional impact, treatment options, or clinical significance",
        type: "action"
      }
    ];

    return insights;
  };

  const insights = getContextInsights();
  const suggestions = getContextSuggestions().slice(0, 3);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <InsightIcon sx={{ mr: 1 }} />
        Context Insights
      </Typography>

      {insights.map((insight, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {insight.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {insight.content}
          </Typography>
        </Paper>
      ))}

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2, mt: 3, display: 'flex', alignItems: 'center' }}>
        <ScienceIcon sx={{ mr: 1 }} />
        Quick Actions
      </Typography>

      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => onSuggestionClick(suggestion)}
          sx={{ mb: 1, justifyContent: 'flex-start', textAlign: 'left' }}
        >
          {suggestion}
        </Button>
      ))}

      {/* PrecisionRad quick action */}
      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="contained" size="small" disabled={radLoading} onClick={() => fetchRad()}>
          {radLoading ? 'Getting Radiation Guidance…' : 'Get Radiation Guidance'}
        </Button>
        <Button variant="outlined" size="small" disabled={chemoLoading} onClick={() => fetchChemo()}>
          {chemoLoading ? 'Getting Chemo Guidance…' : 'Get Chemo Guidance'}
        </Button>
      </Box>

      {(radError || chemoError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(radError || chemoError)?.message}
        </Alert>
      )}

      {radGuidance && <RadOncGuidanceCard guidance={radGuidance} />}
      {chemoGuidance && <ChemoGuidanceCard guidance={chemoGuidance} />}
    </Box>
  );
};

