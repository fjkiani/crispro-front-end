/**
 * ResearchIntelligenceHeader - Header section for Research Intelligence page
 * 
 * Displays:
 * - Title and description
 * - Example questions
 * - RUO disclaimer alert
 */

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';

const EXAMPLE_QUESTIONS = [
  "How do purple potatoes help with ovarian cancer?",
  "What mechanisms does resveratrol use against breast cancer?",
  "How does curcumin affect inflammation pathways in cancer?"
];

const ResearchIntelligenceHeader = ({ onExampleClick }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <ScienceIcon color="primary" fontSize="large" />
        Research Intelligence
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Full LLM-based research with deep parsing and MOAT integration. Ask complex questions like "How do purple potatoes help with ovarian cancer?"
      </Typography>
      
      {/* Example Questions */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Example Questions:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {EXAMPLE_QUESTIONS.map((example, idx) => (
            <Button
              key={idx}
              size="small"
              variant="outlined"
              onClick={() => onExampleClick?.(example)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              {example}
            </Button>
          ))}
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <strong>Research Use Only</strong> - This tool provides evidence-based research intelligence but should not replace medical advice.
      </Alert>
    </Box>
  );
};

export default ResearchIntelligenceHeader;
