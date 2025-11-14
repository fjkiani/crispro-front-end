import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Paper,
  Chip,
  Stack,
  Grid,
  Fade,
  Container,
  Divider,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Science as ScienceIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  CompareArrows as CompareArrowsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Insights as InsightsIcon,
  Sparkles as SparklesIcon
} from '@mui/icons-material';
import HolisticInput from '../components/holistic/HolisticInput';
import HolisticResultsDisplay from '../components/holistic/HolisticResultsDisplay';
import HolisticProgressTracker from '../components/holistic/HolisticProgressTracker';
import LLMInsightsPanel from '../components/holistic/LLMInsightsPanel';
import ComparativeAnalysisPanel from '../components/comparison/ComparativeAnalysisPanel';
import { useHolisticValidation } from '../hooks/useHolisticValidation';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

/**
 * Holistic Hypothesis Tester
 * 
 * Beautiful, intelligent testing interface for ANY hypothesis, claim, or theory.
 * Features:
 * - Natural language input (LLM-powered parsing)
 * - Grounded LLM insights (based on our validation results)
 * - Beautiful, modern UI
 * - Component-based architecture
 */
export default function HolisticHypothesisTester() {
  const [inputMode, setInputMode] = useState<'natural' | 'structured'>('natural');
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [compounds, setCompounds] = useState([]);
  const [diseaseContext, setDiseaseContext] = useState({
    disease: 'ovarian_cancer_hgs',
    mutations: [{ gene: 'TP53', hgvs_p: 'R248Q' }],
    biomarkers: { HRD: 'POSITIVE', TMB: 8.2 }
  });
  const [showComparison, setShowComparison] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const {
    results,
    loading,
    progress,
    error,
    llmInsights,
    testHolistic,
    parseNaturalLanguage,
    clearResults,
    exportResults
  } = useHolisticValidation();

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageQuery.trim()) return;
    
    // Parse natural language query with LLM
    const parsed = await parseNaturalLanguage(naturalLanguageQuery);
    if (parsed && parsed.compounds && parsed.compounds.length > 0) {
      setCompounds(parsed.compounds);
      setDiseaseContext(prev => ({
        ...prev,
        disease: parsed.disease || prev.disease
      }));
      // Auto-start testing
      await testHolistic(parsed.compounds, parsed.diseaseContext || diseaseContext);
    }
  };

  const handleStructuredTest = async () => {
    if (compounds.length === 0) return;
    await testHolistic(compounds, diseaseContext);
  };

  const handleExport = () => {
    exportResults(results, 'holistic_hypothesis_validation_results');
  };

  const canCompare = results.length >= 2 && !loading;
  const hasInsights = llmInsights && Object.keys(llmInsights).length > 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xl">
        {/* Hero Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
              <ScienceIcon sx={{ fontSize: 48, color: 'white' }} />
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 20px rgba(0,0,0,0.3)'
                }}
              >
                Holistic Hypothesis Tester
              </Typography>
              <SparklesIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: alpha('#fff', 0.9),
                maxWidth: 800,
                mx: 'auto',
                mb: 3
              }}
            >
              Test ANY hypothesis, claim, or theory with AI-powered validation. 
              Natural language input, grounded insights, and comprehensive analysis.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Chip 
                icon={<AutoAwesomeIcon />} 
                label="LLM-Powered" 
                sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 'bold' }}
              />
              <Chip 
                icon={<PsychologyIcon />} 
                label="Grounded Insights" 
                sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 'bold' }}
              />
              <Chip 
                icon={<InsightsIcon />} 
                label="Comprehensive Analysis" 
                sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 'bold' }}
              />
            </Stack>
          </Box>
        </Fade>

        {/* Main Content Card */}
        <Fade in timeout={1000}>
          <Card 
            sx={{ 
              p: 4,
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              background: 'white'
            }}
          >
            {/* Input Mode Toggle */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant={inputMode === 'natural' ? 'contained' : 'outlined'}
                  onClick={() => setInputMode('natural')}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Natural Language
                </Button>
                <Button
                  variant={inputMode === 'structured' ? 'contained' : 'outlined'}
                  onClick={() => setInputMode('structured')}
                  startIcon={<ScienceIcon />}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Structured Input
                </Button>
              </Stack>
            </Box>

            {/* Input Section */}
            <HolisticInput
              mode={inputMode}
              naturalLanguageQuery={naturalLanguageQuery}
              onNaturalLanguageChange={setNaturalLanguageQuery}
              onNaturalLanguageSubmit={handleNaturalLanguageSubmit}
              compounds={compounds}
              onCompoundsChange={setCompounds}
              diseaseContext={diseaseContext}
              onDiseaseContextChange={setDiseaseContext}
              onTest={handleStructuredTest}
              disabled={loading}
            />

            {/* Progress Tracker */}
            {loading && (
              <Box sx={{ mb: 4, mt: 4 }}>
                <HolisticProgressTracker progress={progress} total={compounds.length} />
              </Box>
            )}

            {/* Error Display */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)'
                }}
              >
                {error}
              </Alert>
            )}

            {/* Results Section */}
            {results.length > 0 && (
              <Box sx={{ mt: 4 }}>
                {/* Action Bar */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {results.length} Results Complete
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Tooltip title="Export results to CSV">
                      <IconButton
                        onClick={handleExport}
                        disabled={results.length === 0}
                        sx={{ 
                          bgcolor: 'white',
                          '&:hover': { bgcolor: alpha('#667eea', 0.1) }
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="outlined"
                      startIcon={<CompareArrowsIcon />}
                      onClick={() => setShowComparison(!showComparison)}
                      disabled={!canCompare}
                      sx={{ borderRadius: 2 }}
                    >
                      {showComparison ? 'Hide Comparison' : 'Compare Results'}
                    </Button>
                    {hasInsights && (
                      <Button
                        variant="outlined"
                        startIcon={<InsightsIcon />}
                        onClick={() => setShowInsights(!showInsights)}
                        sx={{ borderRadius: 2 }}
                      >
                        {showInsights ? 'Hide Insights' : 'AI Insights'}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      onClick={clearResults}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Paper>

                {/* LLM Insights Panel */}
                {showInsights && hasInsights && (
                  <Box sx={{ mb: 3 }}>
                    <LLMInsightsPanel 
                      insights={llmInsights}
                      results={results}
                    />
                  </Box>
                )}

                {/* Comparison Panel */}
                {showComparison && canCompare && (
                  <Box sx={{ mb: 3 }}>
                    <ComparativeAnalysisPanel results={results} />
                  </Box>
                )}

                {/* Results Display */}
                <HolisticResultsDisplay results={results} />
              </Box>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && (
              <Fade in timeout={500}>
                <Paper 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    border: '2px dashed',
                    borderColor: alpha('#667eea', 0.3)
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 64, color: alpha('#667eea', 0.5), mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Ready to Test Your Hypothesis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    {inputMode === 'natural' 
                      ? 'Enter a natural language query like "Test these 10 cancer-fighting foods: green tea, broccoli, papaya..." and let AI extract compounds automatically.'
                      : 'Add compounds above and click "Test All" to begin holistic validation with comprehensive analysis.'
                    }
                  </Typography>
                </Paper>
              </Fade>
            )}

            {/* RUO Disclaimer */}
            <Alert 
              severity="info" 
              sx={{ 
                mt: 4,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)'
              }}
            >
              <strong>Research Use Only</strong> - This tool provides evidence-based recommendations but should not replace medical advice.
            </Alert>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}






