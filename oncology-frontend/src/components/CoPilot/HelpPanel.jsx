import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField
} from '@mui/material';
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

/**
 * Help Panel Component
 * Provides help and documentation for CoPilot features
 */
export const HelpPanel = ({ copilotConfig, onSuggestionClick }) => {
  const [message, setMessage] = useState('');

  const handleTopicClick = (topic) => {
    setMessage(`Tell me about ${topic}`);
    onSuggestionClick(`Tell me about ${topic}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <HelpIcon sx={{ mr: 1 }} />
        How to Use Co-Pilot
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Ask Clinical Questions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            Ask natural language questions about genetic variants, treatments, and clinical research.
            Examples: "What is the functional impact of BRAF p.Val600Glu?" or "How common are KRAS mutations?"
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Context-Aware Assistance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            The Co-Pilot automatically detects what page you're on and what variant you're analyzing,
            providing relevant suggestions and insights based on your current context.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Evidence-Based Answers</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            All answers include evidence levels (Strong/Moderate/Limited) and confidence scores,
            with links to supporting research papers for transparency.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* System Status & Governance */}
      {copilotConfig && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            🏛️ System Status
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              size="small"
              label={`Mode: ${copilotConfig.operational_mode || 'research'}`}
              color={copilotConfig.operational_mode === 'clinical' ? 'warning' : 'default'}
            />
            {copilotConfig.feature_flags?.enable_massive_modes && (
              <Chip size="small" label="Demo Mode" color="warning" />
            )}
            {copilotConfig.feature_flags?.enable_calibration_preload && (
              <Chip size="small" label="Calibrated" color="success" />
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Popular Topics:
        </Typography>
        {[
          "Genetic variant interpretation",
          "Treatment recommendations",
          "Clinical trial information",
          "Research paper analysis",
          "Functional impact assessment"
        ].map((topic, index) => (
          <Chip
            key={index}
            size="small"
            label={topic}
            sx={{ mr: 1, mb: 1 }}
            onClick={() => handleTopicClick(topic)}
          />
        ))}
      </Box>
    </Box>
  );
};
