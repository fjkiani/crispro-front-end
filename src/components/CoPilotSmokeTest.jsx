import React, { useState } from 'react';
import { API_ROOT } from '../lib/apiConfig';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

/**
 * Co-Pilot Doctrine Smoke Test Suite
 *
 * Tests all capabilities outlined in the Co-Pilot Doctrine:
 * - Q2C Router (6 intents)
 * - Evidence Amplification (S/P/E integration)
 * - Deep Analysis Orchestration
 * - Audit & Provenance
 * - API Matrix compliance
 * - Answer Shape validation
 */
const CoPilotSmokeTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  // Test cases from doctrine
  const testCases = {
    q2cRouter: {
      title: "Q2C Router - Intent Classification",
      description: "Tests the 6 core intent patterns and API routing",
      tests: [
        {
          name: "Variant Impact Intent",
          query: "What is the functional impact of BRAF V600E in multiple myeloma?",
          expectedIntent: "variant_impact",
          expectedEndpoint: "/api/evidence/deep_analysis"
        },
        {
          name: "Drug Efficacy Intent",
          query: "Is dabrafenib likely to benefit patients with BRAF V600E in multiple myeloma?",
          expectedIntent: "drug_efficacy",
          expectedEndpoint: "/api/efficacy/predict"
        },
        {
          name: "Literature Retrieval Intent",
          query: "Find RCTs for BRAF inhibitors in multiple myeloma with BRAF variants",
          expectedIntent: "literature_retrieval",
          expectedEndpoint: "/api/evidence/literature"
        },
        {
          name: "ClinVar Context Intent",
          query: "What does ClinVar say about BRAF V600E pathogenicity?",
          expectedIntent: "clinvar_context",
          expectedEndpoint: "/api/evidence/deep_analysis"
        },
        {
          name: "Design Request Intent",
          query: "Design 3 gRNAs near chr7:140453136 with PAM=NGG",
          expectedIntent: "design_request",
          expectedEndpoint: "/api/design/guide_rna"
        },
        {
          name: "Explain Result Intent",
          query: "Why did the LoB prediction show moderate efficacy for this variant?",
          expectedIntent: "explain_result",
          expectedEndpoint: "/api/evidence/deep_analysis"
        }
      ]
    },
    evidenceSystem: {
      title: "Evidence System - S/P/E Integration",
      description: "Tests S/P/E scoring, ClinVar integration, and evidence amplification",
      tests: [
        {
          name: "S/P/E LoB Prediction",
          endpoint: "/api/efficacy/predict",
          payload: { gene: "BRAF", hgvs_p: "p.Val600E", disease: "multiple_myeloma" },
          expectedFields: ["lob_score", "sequence_score", "pathway_score", "evidence_score"]
        },
        {
          name: "ClinVar Deep Analysis",
          endpoint: "/api/evidence/deep_analysis",
          payload: { gene: "BRAF", hgvs_p: "p.Val600E" },
          expectedFields: ["clinvar_classification", "pathogenicity", "evidence_level"]
        },
        {
          name: "Evidence Literature Search",
          endpoint: "/api/evidence/literature",
          payload: { gene: "BRAF", hgvs_p: "p.Val600E", disease: "multiple_myeloma", max_results: 5 },
          expectedFields: ["results", "synthesis", "badges"]
        }
      ]
    },
    deepAnalysis: {
      title: "Deep Analysis Orchestration",
      description: "Tests Evo profiles, evidence bundles, and design capabilities",
      tests: [
        {
          name: "Evo2 Variant Profile",
          endpoint: "/api/evo/score_variant_profile",
          payload: { gene: "BRAF", hgvs_p: "p.Val600E" },
          expectedFields: ["delta_score", "exon_scores", "profile_data"]
        },
        {
          name: "Evo2 Variant Probe",
          endpoint: "/api/evo/score_variant_probe",
          payload: { gene: "BRAF", hgvs_p: "p.Val600E" },
          expectedFields: ["probe_score", "functional_impact"]
        },
        {
          name: "Evidence Bundle",
          endpoint: "/api/command/run_evidence_bundle",
          payload: { gene: "BRAF", hgvs_p: "p.Val600E", disease: "multiple_myeloma" },
          expectedFields: ["run_signature", "evidence_summary", "citations"]
        }
      ]
    },
    answerShapes: {
      title: "Answer Shape Validation",
      description: "Validates JSON response structures match doctrine specifications",
      tests: [
        {
          name: "Minimal Answer Shape",
          description: "Tests summary + actions + evidence structure",
          requiredFields: ["summary", "evidence", "actions", "provenance"]
        },
        {
          name: "Literature Answer Shape",
          description: "Tests query + results + synthesis structure",
          requiredFields: ["query", "results", "synthesis", "badges"]
        },
        {
          name: "Evidence Badges",
          description: "Tests RCT/Guideline/ClinVar-Strong badges",
          badgeTypes: ["RCT", "Guideline", "ClinVar-Strong", "Cohort", "Case Report"]
        }
      ]
    },
    guardrails: {
      title: "Guardrails & Governance",
      description: "Tests operational modes, confidence levels, and feature flags",
      tests: [
        {
          name: "Operational Mode Awareness",
          description: "Should reflect research vs clinical mode",
          expectedFields: ["operational_mode", "feature_flags"]
        },
        {
          name: "Confidence Labeling",
          description: "Should label fallback calibrations appropriately",
          confidenceIndicators: ["percentile based on fallback", "limited evidence"]
        },
        {
          name: "Evidence Tier Surface",
          description: "Should show supported/consider/insufficient tiers",
          tierLevels: ["supported", "consider", "insufficient"]
        }
      ]
    }
  };

  const runTest = async (testCase) => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${API_ROOT}${testCase.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload || {})
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        return {
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
          duration
        };
      }

      const data = await response.json();

      // Validate expected fields
      const missingFields = testCase.expectedFields?.filter(field => !data[field]) || [];

      return {
        status: missingFields.length === 0 ? 'success' : 'warning',
        data,
        missingFields,
        duration
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  };

  const runIntentTest = async (testCase) => {
    const startTime = Date.now();
    try {
      // Simulate Q2C router call
      const response = await fetch(`${API_ROOT}/api/copilot/q2c`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query,
          context: { gene: "BRAF", hgvs_p: "p.Val600E", disease: "multiple_myeloma" }
        })
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        return {
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
          duration
        };
      }

      const data = await response.json();

      // Check if intent matches expected
      const correctIntent = data.intent === testCase.expectedIntent;
      const correctEndpoint = data.endpoint === testCase.expectedEndpoint;

      return {
        status: (correctIntent && correctEndpoint) ? 'success' : 'warning',
        data,
        intentMatch: correctIntent,
        endpointMatch: correctEndpoint,
        duration
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const results = {};

    // Test Q2C Router
    results.q2cRouter = {};
    for (const test of testCases.q2cRouter.tests) {
      results.q2cRouter[test.name] = await runIntentTest(test);
    }

    // Test Evidence System
    results.evidenceSystem = {};
    for (const test of testCases.evidenceSystem.tests) {
      results.evidenceSystem[test.name] = await runTest(test);
    }

    // Test Deep Analysis
    results.deepAnalysis = {};
    for (const test of testCases.deepAnalysis.tests) {
      results.deepAnalysis[test.name] = await runTest(test);
    }

    // Test Answer Shapes (mock validation)
    results.answerShapes = {};
    for (const test of testCases.answerShapes.tests) {
      results.answerShapes[test.name] = {
        status: 'warning',
        message: 'Answer shape validation requires backend implementation',
        duration: 0
      };
    }

    // Test Guardrails (mock validation)
    results.guardrails = {};
    for (const test of testCases.guardrails.tests) {
      results.guardrails[test.name] = {
        status: 'warning',
        message: 'Guardrails validation requires backend implementation',
        duration: 0
      };
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'warning': return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error': return <ErrorIcon sx={{ color: 'error.main' }} />;
      default: return <CircularProgress size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Co-Pilot Doctrine Smoke Test Suite
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Comprehensive testing of all Co-Pilot capabilities as defined in the doctrine.
        Tests Q2C routing, evidence amplification, deep analysis orchestration, and compliance with API matrix.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={runAllTests}
          disabled={isRunning}
          startIcon={isRunning ? <CircularProgress size={16} /> : <ScienceIcon />}
          size="large"
        >
          {isRunning ? 'Running Tests...' : 'Run Full Doctrine Test Suite'}
        </Button>
      </Box>

      {Object.keys(testResults).length > 0 && (
        <Grid container spacing={3}>
          {Object.entries(testCases).map(([category, categoryData]) => (
            <Grid item xs={12} key={category}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {category === 'q2cRouter' && <AssessmentIcon sx={{ mr: 1 }} />}
                    {category === 'evidenceSystem' && <ScienceIcon sx={{ mr: 1 }} />}
                    {category === 'deepAnalysis' && <CodeIcon sx={{ mr: 1 }} />}
                    {category === 'answerShapes' && <StorageIcon sx={{ mr: 1 }} />}
                    {category === 'guardrails' && <SecurityIcon sx={{ mr: 1 }} />}
                    <Typography variant="h6">{categoryData.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {categoryData.description}
                  </Typography>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Test Case</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(testResults[category] || {}).map(([testName, result]) => (
                          <TableRow key={testName}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {testName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(result.status)}
                                label={result.status.toUpperCase()}
                                color={getStatusColor(result.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {result.duration ? `${result.duration}ms` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {result.error && (
                                <Typography variant="caption" color="error">
                                  {result.error}
                                </Typography>
                              )}
                              {result.message && (
                                <Typography variant="caption" color="text.secondary">
                                  {result.message}
                                </Typography>
                              )}
                              {result.missingFields?.length > 0 && (
                                <Typography variant="caption" color="warning.main">
                                  Missing: {result.missingFields.join(', ')}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {Object.keys(testResults).length === 0 && !isRunning && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Click "Run Full Doctrine Test Suite" to begin comprehensive testing of all Co-Pilot capabilities.
          This will test Q2C routing, evidence amplification, deep analysis orchestration, and API compliance.
        </Alert>
      )}
    </Box>
  );
};

export default CoPilotSmokeTest;
