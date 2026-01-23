/**
 * AIExplanationPanel Component
 * 
 * Displays AI-generated explanations for synthetic lethality analysis.
 * Supports multiple audience types (clinician, patient, researcher) and Q&A.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  CircularProgress,
  Collapse,
  IconButton,
  Divider,
  Stack,
  Chip,
  Alert,
  Fade
} from '@mui/material';
import {
  Psychology,
  LocalHospital,
  Person,
  Science,
  Send,
  ExpandMore,
  ExpandLess,
  AutoAwesome,
  QuestionAnswer,
  ContentCopy,
  CheckCircle
} from '@mui/icons-material';
import { useLLMExplanation } from '../hooks/useLLMExplanation';

const AIExplanationPanel = ({ results }) => {
  const [audienceType, setAudienceType] = useState('clinician');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const {
    generateExplanation,
    askQuestion,
    explanation,
    loading,
    error,
    clearExplanation
  } = useLLMExplanation();

  const handleGenerateExplanation = async () => {
    await generateExplanation(results, audienceType);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    const answer = await askQuestion(question, results);
    if (answer) {
      setChatHistory(prev => [...prev, { q: question, a: answer }]);
      setQuestion('');
    }
  };

  const handleCopyExplanation = async () => {
    if (!explanation) return;
    
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        background: 'linear-gradient(145deg, #f5f7fa 0%, #e8ecf1 100%)',
        border: '1px solid',
        borderColor: 'primary.light'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoAwesome sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            AI Clinical Interpretation
          </Typography>
          <Chip 
            label="Powered by LLM" 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Stack>
        <IconButton onClick={() => setExpanded(!expanded)} size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {/* Audience Selector */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Generate explanation for:
          </Typography>
          <ToggleButtonGroup
            value={audienceType}
            exclusive
            onChange={(e, v) => {
              if (v) {
                setAudienceType(v);
                clearExplanation(); // Clear when switching audiences
              }
            }}
            size="small"
            fullWidth
            sx={{ mt: 1 }}
          >
            <ToggleButton value="clinician">
              <LocalHospital sx={{ mr: 1, fontSize: 18 }} /> Clinician
            </ToggleButton>
            <ToggleButton value="patient">
              <Person sx={{ mr: 1, fontSize: 18 }} /> Patient
            </ToggleButton>
            <ToggleButton value="researcher">
              <Science sx={{ mr: 1, fontSize: 18 }} /> Researcher
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Generate Button */}
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Psychology />}
          onClick={handleGenerateExplanation}
          disabled={loading || !results}
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? 'Generating...' : 'Generate AI Explanation'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">{error}</Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Make sure GEMINI_API_KEY is configured in your .env file.
            </Typography>
          </Alert>
        )}

        {/* Explanation Display */}
        {explanation && (
          <Fade in={true}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2.5, 
                mb: 3, 
                backgroundColor: 'white',
                maxHeight: 400,
                overflow: 'auto',
                position: 'relative',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="medium">
                  Explanation for: {audienceType === 'clinician' ? '👨‍⚕️ Clinician' : audienceType === 'patient' ? '👤 Patient' : '🔬 Researcher'}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={handleCopyExplanation}
                  sx={{ ml: 1 }}
                >
                  {copied ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  color: 'text.primary'
                }}
              >
                {explanation}
              </Typography>
            </Paper>
          </Fade>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Q&A Section */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <QuestionAnswer color="secondary" />
            <Typography variant="subtitle1" fontWeight="medium">
              Ask a Question
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g., Why is PARP inhibitor recommended over platinum?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
              disabled={loading}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAskQuestion}
              disabled={loading || !question.trim()}
              sx={{ minWidth: 48 }}
            >
              {loading ? <CircularProgress size={20} /> : <Send />}
            </Button>
          </Stack>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Previous Questions:
              </Typography>
              {chatHistory.map((chat, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 2
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="primary.main" 
                    fontWeight="medium"
                    sx={{ mb: 1 }}
                  >
                    Q: {chat.q}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      pl: 2,
                      color: 'text.primary',
                      lineHeight: 1.6
                    }}
                  >
                    {chat.a}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AIExplanationPanel;




