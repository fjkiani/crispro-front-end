import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { Q2C_ROUTER } from './intents';

/**
 * Q2C Router Test Component (for development/testing)
 * Interactive testing interface for the Q2C routing system
 */
export const Q2CRouterTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [smokeTestResults, setSmokeTestResults] = useState([]);
  const [isRunningSmokeTest, setIsRunningSmokeTest] = useState(false);

  const testCases = [
    "What is the functional impact of BRAF V600E?",
    "Will dabrafenib work for this patient?",
    "Find me papers on KRAS mutations in lung cancer",
    "What does ClinVar say about TP53 variants?",
    "Design a guide RNA for EGFR exon 19 deletion",
    "Explain why this variant matters for treatment",
    "How common is this mutation in the population?",
    "What are the latest clinical trials for immunotherapy?"
  ];

  // Individual smoke test functions
  const testQ2CRouter = async () => {
    const testQuestion = "What is the functional impact of BRAF V600E?";
    const intent = Q2C_ROUTER.classifyIntent(testQuestion);

    if (!intent) {
      return { success: false, message: "Intent classification failed" };
    }

    const context = {
      variant: { gene: 'BRAF', hgvs_p: 'p.Val600Glu' },
      disease: 'melanoma',
      page: 'variant-analysis'
    };

    const payload = Q2C_ROUTER.generatePayload(intent, context);
    const actions = Q2C_ROUTER.getSuggestedActions(intent, context);

    return {
      success: intent.intent === 'variant_impact' && payload && actions.length > 0,
      message: `Intent: ${intent.intent}, Confidence: ${intent.confidence}, Actions: ${actions.length}`,
      details: `Payload contains: ${Object.keys(payload).join(', ')}`
    };
  };

  // Real API integration test - test actual backend endpoints
  const testRAGQueryEndpoint = async () => {
    try {
      const payload = {
        query: "What is the functional impact of BRAF V600E?",
        gene: "BRAF",
        hgvs_p: "p.Val600Glu",
        disease: "melanoma",
        max_context_papers: 3
      };

      const response = await fetch('http://localhost:8000/api/evidence/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return { success: false, message: `API returned ${response.status}`, details: 'RAG query endpoint failed' };
      }

      const data = await response.json();
      const hasAnswer = data.answer || data.query;
      const hasEvidence = data.evidence_level || data.confidence_score;

      return {
        success: hasAnswer && hasEvidence,
        message: `RAG Query: ${hasAnswer ? '✅' : '❌'} Answer, ${hasEvidence ? '✅' : '❌'} Evidence`,
        details: `Response keys: ${Object.keys(data).join(', ')}`
      };
    } catch (error) {
      return { success: false, message: 'RAG Query endpoint error', details: error.message };
    }
  };

  // Comprehensive smoke test for all CoPilot functionality
  const runSmokeTest = async () => {
    setIsRunningSmokeTest(true);
    setSmokeTestResults([]);

    const smokeTests = [
      { name: "Q2C Router Intent Classification", test: testQ2CRouter },
      { name: "🧠 RAG Query API Integration", test: testRAGQueryEndpoint }
    ];

    const results = [];

    for (const test of smokeTests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          status: result.success ? '✅ PASS' : '❌ FAIL',
          message: result.message,
          details: result.details
        });
      } catch (error) {
        results.push({
          name: test.name,
          status: '❌ ERROR',
          message: error.message,
          details: 'Test execution failed'
        });
      }
    }

    setSmokeTestResults(results);
    setIsRunningSmokeTest(false);
  };

  const runTests = () => {
    const results = testCases.map(question => {
      const intent = Q2C_ROUTER.classifyIntent(question);
      const context = {
        variant: { gene: 'BRAF', hgvs_p: 'p.Val600Glu' },
        disease: 'melanoma',
        page: 'variant-analysis',
        question: question
      };

      const payload = intent ? Q2C_ROUTER.generatePayload(intent, context) : null;
      const actions = intent ? Q2C_ROUTER.getSuggestedActions(intent, context) : [];

      return {
        question,
        intent: intent?.intent || 'unclassified',
        confidence: intent?.confidence || 'none',
        endpoint: intent?.endpoint || 'fallback',
        payload: payload ? JSON.stringify(payload, null, 2) : 'N/A',
        actions: actions.length,
        routingStatus: intent ? '✅ Routed to API' : '❌ General RAG fallback'
      };
    });

    setTestResults(results);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 CoPilot Smoke Tests
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive testing suite for all CoPilot functionality - Q2C routing, evidence processing, and action integration.
      </Typography>

      {/* Smoke Test Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          🚀 Comprehensive Smoke Test
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Run all CoPilot functionality tests to verify the complete system is working.
        </Typography>

        <Button
          variant="contained"
          onClick={runSmokeTest}
          disabled={isRunningSmokeTest}
          size="large"
          sx={{ mb: 3 }}
        >
          {isRunningSmokeTest ? 'Running Tests...' : 'Run Full Smoke Test Suite'}
        </Button>

        {smokeTestResults.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Test Results:
            </Typography>
            {smokeTestResults.map((result, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid',
                  borderColor: result.status.includes('✅') ? 'success.main' : 'error.main',
                  backgroundColor: result.status.includes('✅') ? 'rgba(76, 175, 80, 0.04)' : 'rgba(244, 67, 54, 0.04)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {result.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={result.status}
                    color={result.status.includes('✅') ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {result.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {result.details}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Q2C Router Tests Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🧠 Q2C Router Intent Classification Tests
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Test the question-to-capability routing system with various clinical questions.
        </Typography>

        <Button variant="contained" onClick={runTests} sx={{ mb: 3 }}>
          Run Q2C Classification Tests
        </Button>

        {testResults.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Intent Classification Results:
            </Typography>
            {testResults.map((result, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Question: "{result.question}"
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`Intent: ${result.intent}`} color="info" />
                  <Chip size="small" label={`Confidence: ${result.confidence}`} color="warning" />
                  <Chip size="small" label={`Endpoint: ${result.endpoint}`} color="success" />
                  <Chip size="small" label={`Actions: ${result.actions}`} color="default" />
                  <Chip
                    size="small"
                    label={result.routingStatus}
                    color={result.routingStatus.includes('✅') ? 'success' : 'error'}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

