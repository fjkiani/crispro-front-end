import React from 'react';
import { Box, Paper, Typography, Button, Avatar, Chip } from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';
import { useCoPilot } from '../context/CoPilotContext';
import { useCoPilotIntegration } from '../hooks/useCoPilotIntegration';
import { useAnalysisCoPilot } from '../hooks/useAnalysisCoPilot';
import { useProactiveInsights } from '../hooks/useProactiveInsights';
import { CoPilotUtils } from '../utils/CoPilotUtils';

/**
 * Integration component for Myeloma Digital Twin
 * Provides CoPilot functionality within the digital twin interface
 */
export const MyelomaDigitalTwinIntegration = ({ variant, disease = 'multiple myeloma', analysisResults }) => {
  const { setIsOpen } = useCoPilot();
  const { askAboutVariant, askAboutTreatment, getSuggestedQuestions } = useCoPilotIntegration({
    page: 'myeloma-digital-twin',
    variant,
    disease
  });

  const { getAnalysisInsights, suggestFollowUpQuestions } = useAnalysisCoPilot(analysisResults, variant);
  const { getProactiveInsights, hasHighPriorityInsights } = useProactiveInsights();

  const analysisInsights = getAnalysisInsights();
  const proactiveInsights = getProactiveInsights();
  const suggestedQuestions = getSuggestedQuestions(variant, disease);
  const followUpQuestions = suggestFollowUpQuestions();

  return (
    <Box sx={{ mb: 3 }}>
      {/* CoPilot Quick Actions */}
      <Paper sx={{ mb: 2, border: '2px solid', borderColor: 'primary.main', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
            <AIIcon />
          </Avatar>
          <Typography variant="h6" color="primary">
            Clinical Co-Pilot Integration
          </Typography>
          <Chip
            label="AI Assistant"
            color="primary"
            size="small"
            sx={{ ml: 1 }}
          />
          {hasHighPriorityInsights() && (
            <Chip
              label="Insights Available"
              color="success"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your AI clinical assistant is analyzing {CoPilotUtils.formatVariant(variant)} in the context of {disease}.
          Click any question below to get evidence-based answers from the latest research.
        </Typography>

        {/* Quick Action Buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AIIcon />}
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Ask Co-Pilot
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const question = askAboutVariant(variant);
              setIsOpen(true);
            }}
          >
            Functional Impact
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const question = askAboutTreatment(variant, disease);
              setIsOpen(true);
            }}
          >
            Treatment Options
          </Button>
        </Box>
      </Paper>

      {/* Analysis Insights */}
      {analysisInsights.length > 0 && (
        <Paper sx={{ mb: 2, bgcolor: 'info.light', p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <AIIcon sx={{ mr: 1 }} />
            Analysis Insights
          </Typography>

          {analysisInsights.map((insight, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="primary">
                {insight.title}
              </Typography>
              <Typography variant="body2">
                {insight.content}
              </Typography>
            </Box>
          ))}

          {followUpQuestions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Suggested Follow-up Questions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {followUpQuestions.slice(0, 2).map((question, index) => (
                  <Chip
                    key={index}
                    label={question.length > 40 ? question.substring(0, 37) + '...' : question}
                    size="small"
                    variant="outlined"
                    onClick={() => setIsOpen(true)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Proactive Insights */}
      {proactiveInsights.length > 0 && (
        <Paper sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            💡 Proactive Insights
          </Typography>

          {proactiveInsights.slice(0, 2).map((insight, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {insight.content}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setIsOpen(true)}
                  sx={{ ml: 1, flexShrink: 0 }}
                >
                  {insight.action}
                </Button>
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🔍 Suggested Questions
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click any question to ask the Co-Pilot for evidence-based answers:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {suggestedQuestions.slice(0, 4).map((question, index) => (
              <Button
                key={index}
                variant="text"
                size="small"
                onClick={() => setIsOpen(true)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              >
                <Typography variant="body2">
                  {question}
                </Typography>
              </Button>
            ))}
          </Box>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => setIsOpen(true)}
            sx={{ mt: 2 }}
          >
            View All Questions & Open Co-Pilot
          </Button>
        </Paper>
      )}
    </Box>
  );
};
