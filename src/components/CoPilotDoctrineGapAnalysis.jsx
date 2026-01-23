import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Science as ScienceIcon
} from '@mui/icons-material';

/**
 * Co-Pilot Doctrine Gap Analysis
 *
 * Comprehensive analysis of current implementation vs doctrine requirements
 * Identifies what's working, what's missing, and prioritization for fixes
 */
const CoPilotDoctrineGapAnalysis = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Current implementation status by doctrine section
  const doctrineAnalysis = {
    q2cRouter: {
      title: "1) Q2C Router - Intent Classification",
      status: "partial",
      implemented: ["Frontend UI components", "Intent pattern matching", "Route to backend endpoints"],
      missing: ["Backend Q2C endpoint (/api/copilot/q2c)", "Intent classification logic", "Payload building from page context"],
      priority: "high",
      tests: [
        { name: "Intent Pattern Matching", status: "partial", notes: "Frontend patterns exist but no backend validation" },
        { name: "API Routing", status: "partial", notes: "Routes defined but endpoints may not exist" },
        { name: "Context Extraction", status: "missing", notes: "No extraction of gene/hgvs_p from page context" }
      ]
    },
    evidenceAmplification: {
      title: "2) Evidence Amplification",
      status: "complete",
      implemented: [
        "Frontend evidence display components",
        "Citation cards",
        "Evidence badges UI",
        "Backend evidence endpoints",
        "ClinVar deep analysis",
        "PubMed search with caching",
        "Gemini API integration for clinical query building",
        "Enhanced PubMed agent with clinical terminology",
        "Multiple fallback search strategies (enhanced → basic → E-utilities)",
        "Async compatibility fixes for FastAPI",
        "Variant synonym extraction (p.Val600E → V600E)",
        "Clinical evidence ranking and scoring",
        "Publication type classification (RCT, guidelines, reviews)"
      ],
      missing: ["Diffbot integration"],
      priority: "medium",
      tests: [
        { name: "S/P/E Scoring Integration", status: "complete", notes: "✅ Full S/P/E scoring with evidence gates" },
        { name: "ClinVar Context", status: "complete", notes: "✅ ClinVar integration working" },
        { name: "Literature Search", status: "complete", notes: "✅ Enhanced PubMed search with Gemini-powered clinical queries" },
        { name: "Query Intelligence", status: "complete", notes: "✅ Builds clinical-grade PubMed queries with medical terminology" },
        { name: "Fallback Resilience", status: "complete", notes: "✅ Multiple fallback strategies when LLM fails" },
        { name: "Diffbot Extraction", status: "missing", notes: "No full-text extraction capability" }
      ]
    },
    confidenceGovernance: {
      title: "3) Confidence & Governance Awareness",
      status: "partial",
      implemented: ["UI for displaying confidence levels", "Feature flag placeholders"],
      missing: ["Operational mode detection", "Feature flag integration", "Evidence tier calculation", "Fallback calibration labeling"],
      priority: "medium",
      tests: [
        { name: "Operational Mode Reflection", status: "missing", notes: "No research vs clinical mode detection" },
        { name: "Evidence Tier Surfacing", status: "missing", notes: "No supported/consider/insufficient logic" },
        { name: "Confidence Labeling", status: "partial", notes: "UI exists but no backend logic" }
      ]
    },
    deepAnalysis: {
      title: "4) Deep Analysis Orchestration",
      status: "partial",
      implemented: ["UI placeholders for action buttons", "Evidence bundle orchestration", "Run signature generation"],
      missing: ["Evo2 probe endpoints", "Design bundle orchestration", "Forge integration"],
      priority: "medium",
      tests: [
        { name: "Evo2 Profile Scoring", status: "complete", notes: "✅ Evo2 profile scoring working" },
        { name: "Evidence Bundle", status: "complete", notes: "✅ Command center orchestration working" },
        { name: "Design Bundle", status: "missing", notes: "No Forge integration" },
        { name: "Provenance Tracking", status: "complete", notes: "✅ Run signatures generated" }
      ]
    },
    auditLearning: {
      title: "5) Audit & Learning Loop",
      status: "missing",
      implemented: [],
      missing: ["Supabase integration", "Interaction logging", "Configuration snapshots", "Run signature tracking"],
      priority: "medium",
      tests: [
        { name: "Supabase Logging", status: "missing", notes: "No database integration" },
        { name: "Run Signatures", status: "missing", notes: "No signature generation" },
        { name: "Configuration Snapshots", status: "missing", notes: "No config persistence" }
      ]
    },
    answerShapes: {
      title: "6) Answer Shape Compliance",
      status: "partial",
      implemented: ["UI components for displaying answers", "Citation structures"],
      missing: ["Backend JSON structure compliance", "Action payload generation", "Provenance metadata"],
      priority: "high",
      tests: [
        { name: "Minimal Answer Structure", status: "partial", notes: "UI exists but backend format inconsistent" },
        { name: "Literature Answer Structure", status: "missing", notes: "No synthesis or badge logic" },
        { name: "Action Payloads", status: "missing", notes: "No dynamic payload generation" }
      ]
    },
    knowledgeBase: {
      title: "7) Knowledge Base - S/P/E Alignment",
      status: "partial",
      implemented: ["Basic KB structure", "Paper storage"],
      missing: ["Study type classification", "Drug normalization", "Evidence tag mapping", "Embedding management"],
      priority: "medium",
      tests: [
        { name: "Variant Indexing", status: "partial", notes: "Basic fields exist but incomplete" },
        { name: "Study Metadata", status: "missing", notes: "No RCT/guideline classification" },
        { name: "Evidence Mapping", status: "missing", notes: "No LoB implication logic" },
        { name: "Embedding Integration", status: "partial", notes: "Structure exists but no vector ops" }
      ]
    },
    ragPipeline: {
      title: "8) RAG Pipeline Enhancements",
      status: "partial",
      implemented: ["Basic retrieval logic", "Query processing"],
      missing: ["Study type boosting", "LLM reranking", "Diffbot integration", "Answer confidence mapping"],
      priority: "high",
      tests: [
        { name: "Retrieval Boosting", status: "missing", notes: "No study type or recency weighting" },
        { name: "LLM Reranking", status: "missing", notes: "No secondary ranking" },
        { name: "Full-text Integration", status: "missing", notes: "No Diffbot loop" },
        { name: "Confidence Mapping", status: "missing", notes: "No evidence level to badge conversion" }
      ]
    },
    backendContract: {
      title: "9) Backend Usage Contract",
      status: "partial",
      implemented: ["Frontend API calls", "Error handling"],
      missing: ["All backend endpoints", "Proper payload structures", "Response format compliance"],
      priority: "critical",
      tests: [
        { name: "External I/O Routing", status: "partial", notes: "Some endpoints exist but incomplete" },
        { name: "Secret Management", status: "missing", notes: "No Diffbot/NCBI key handling" },
        { name: "Response Standardization", status: "missing", notes: "Inconsistent return formats" }
      ]
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'partial': return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'missing': return <ErrorIcon sx={{ color: 'error.main' }} />;
      default: return <BuildIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'success';
      case 'partial': return 'warning';
      case 'missing': return 'error';
      default: return 'info';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getImplementationScore = () => {
    const sections = Object.values(doctrineAnalysis);
    const complete = sections.filter(s => s.status === 'complete').length;
    const partial = sections.filter(s => s.status === 'partial').length;
    const missing = sections.filter(s => s.status === 'missing').length;

    const score = ((complete * 100) + (partial * 50)) / sections.length;
    return Math.round(score);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        📊 Co-Pilot Doctrine Gap Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Comprehensive analysis of current implementation vs doctrine requirements.
        Score: {getImplementationScore()}% complete across all doctrine sections.
        <br />
        <strong>Recent Achievements:</strong> Gemini API integration, enhanced PubMed search with clinical intelligence, multiple fallback strategies, async compatibility fixes.
      </Typography>

      {/* Backend & API Map (for Agents) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🗺️ Backend & API Map — Start Here (for API/Orchestrator Agent)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                FastAPI Backend (oncology-backend-minimal)
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2">
                  Entry: <code>api/main.py</code> — includes routers; conditional via <code>get_api_flags()</code>
                </Typography>
                <Typography component="li" variant="body2">
                  Config: <code>api/config.py</code> — weights/gates, feature flags, EVO URLs, API flags
                </Typography>
                <Typography component="li" variant="body2">
                  Startup: <code>api/startup.py</code> — calibration preload/refresh lifecycle
                </Typography>
                <Typography component="li" variant="body2">
                  Services: <code>api/services/gene_calibration.py</code>, <code>api/services/supabase_service.py</code>
                </Typography>
                <Typography component="li" variant="body2">
                  Evo Proxy: <code>api/routers/evo.py</code> — HTTP proxy to Modal Evo2 (score/generate/profile/probe)
                </Typography>
                <Typography component="li" variant="body2">
                  Evidence: <code>api/routers/evidence.py</code> — literature/clinvar/deep analysis (caching/backoff)
                </Typography>
                <Typography component="li" variant="body2">
                  Efficacy: <code>api/routers/efficacy.py</code> — S/P/E integration, Evidence Gates, explain endpoint
                </Typography>
                <Typography component="li" variant="body2">
                  Insights (new): <code>api/routers/insights.py</code> — discriminative <code>predict_*</code> endpoints
                </Typography>
                <Typography component="li" variant="body2">
                  Design (new): <code>api/routers/design.py</code> — generative <code>generate_*</code> endpoints
                </Typography>
                <Typography component="li" variant="body2">
                  Orchestrator (new): <code>api/routers/command_center.py</code> — evidence/design bundles
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Evo2 Modal Service (deployed)
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2">
                  Source: <code>src/services/evo_service/main.py</code>
                </Typography>
                <Typography component="li" variant="body2">
                  40B webhook → set in <code>.env</code> as <code>EVO_URL_40B</code>
                </Typography>
                <Typography component="li" variant="body2">
                  7B webhook → set in <code>.env</code> as <code>EVO_URL_7B</code>
                </Typography>
                <Typography component="li" variant="body2">
                  Backend proxy health: <code>GET /api/evo/health</code>
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Feature Flags & Modes
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2">
                  Flags: <code>get_feature_flags()</code> in <code>api/config.py</code> (insights/design/command enablement)
                </Typography>
                <Typography component="li" variant="body2">
                  Include: routers are conditionally mounted in <code>api/main.py</code> via <code>get_api_flags()</code>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Quick Smoke (local backend)
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2">
              Evo health: <code>GET /api/evo/health</code>
            </Typography>
            <Typography component="li" variant="body2">
              Essentiality: <code>POST /api/insights/predict_gene_essentiality</code>
            </Typography>
            <Typography component="li" variant="body2">
              Profile: <code>POST /api/evo/score_variant_profile</code>
            </Typography>
            <Typography component="li" variant="body2">
              Evidence bundle: <code>POST /api/command/run_evidence_bundle</code>
            </Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Curl Examples
          </Typography>
          <Typography component="pre" variant="body2" sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, overflowX: 'auto' }}>
{`# Evo proxy health
curl -sS http://127.0.0.1:8000/api/evo/health

# Evo profile scoring
curl -sS -X POST http://127.0.0.1:8000/api/evo/score_variant_profile \
  -H 'Content-Type: application/json' \
  -d '{"assembly":"GRCh38","chrom":"7","pos":140753336,"ref":"A","alt":"T","model_id":"evo2_7b"}'

# Insights: gene essentiality
curl -sS -X POST http://127.0.0.1:8000/api/insights/predict_gene_essentiality \
  -H 'Content-Type: application/json' \
  -d '{"gene":"TP53","variants":[{"gene":"TP53","chrom":"17","pos":7579472,"ref":"C","alt":"T","consequence":"missense_variant"}],"model_id":"evo2_7b"}'

# Command Center: evidence bundle
curl -sS -X POST http://127.0.0.1:8000/api/command/run_evidence_bundle \
  -H 'Content-Type: application/json' \
  -d '{"mutations":[{"gene":"BRAF","chrom":"7","pos":140753336,"ref":"A","alt":"T"}],"model_id":"evo2_7b"}'`}
          </Typography>
        </CardContent>
      </Card>

      {/* Overall Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏗️ Implementation Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {Object.entries(doctrineAnalysis).map(([key, section]) => (
                  <Chip
                    key={key}
                    icon={getStatusIcon(section.status)}
                    label={section.title.split(')')[0]}
                    color={getStatusColor(section.status)}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Priority Breakdown
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['critical', 'high', 'medium', 'low'].map(priority => {
                  const count = Object.values(doctrineAnalysis).filter(s => s.priority === priority).length;
                  return (
                    <Chip
                      key={priority}
                      label={`${priority}: ${count}`}
                      color={getPriorityColor(priority)}
                      size="small"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Analysis */}
      {Object.entries(doctrineAnalysis).map(([key, section]) => (
        <Accordion
          key={key}
          expanded={expanded === key}
          onChange={handleChange(key)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {key === 'q2cRouter' && <AssessmentIcon sx={{ mr: 1 }} />}
                {key === 'evidenceAmplification' && <ScienceIcon sx={{ mr: 1 }} />}
                {key === 'confidenceGovernance' && <SecurityIcon sx={{ mr: 1 }} />}
                {key === 'deepAnalysis' && <CodeIcon sx={{ mr: 1 }} />}
                {key === 'auditLearning' && <StorageIcon sx={{ mr: 1 }} />}
                {key === 'answerShapes' && <BuildIcon sx={{ mr: 1 }} />}
                {key === 'knowledgeBase' && <StorageIcon sx={{ mr: 1 }} />}
                {key === 'ragPipeline' && <AssessmentIcon sx={{ mr: 1 }} />}
                {key === 'backendContract' && <CodeIcon sx={{ mr: 1 }} />}
                <Typography variant="h6">{section.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  icon={getStatusIcon(section.status)}
                  label={section.status.toUpperCase()}
                  color={getStatusColor(section.status)}
                  size="small"
                />
                <Chip
                  label={`Priority: ${section.priority}`}
                  color={getPriorityColor(section.priority)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  ✅ Implemented
                </Typography>
                {section.implemented.length > 0 ? (
                  <Box component="ul" sx={{ pl: 2 }}>
                    {section.implemented.map((item, index) => (
                      <Typography key={index} component="li" variant="body2">
                        {item}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nothing implemented yet
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="error.main" gutterBottom>
                  ❌ Missing
                </Typography>
                {section.missing.length > 0 ? (
                  <Box component="ul" sx={{ pl: 2 }}>
                    {section.missing.map((item, index) => (
                      <Typography key={index} component="li" variant="body2">
                        {item}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    All requirements implemented
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              🧪 Test Results
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test Case</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {section.tests.map((test, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {test.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(test.status)}
                          label={test.status.toUpperCase()}
                          color={getStatusColor(test.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {test.notes}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Critical Path Summary */}
      <Alert severity="success" sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          🎉 Doctrine Compliance Testing Results
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>✅ VERIFIED WORKING ENDPOINTS:</strong>
        </Typography>
        <Box component="ul" sx={{ mt: 1, mb: 2 }}>
          <li>✅ <code>/api/evo/health</code> - Evo2 model status</li>
          <li>✅ <code>/api/evo/score_variant_profile</code> - Real Evo2 scoring</li>
          <li>✅ <code>/api/efficacy/predict</code> - Full S/P/E scoring with evidence gates</li>
          <li>✅ <code>/api/evidence/literature</code> - Enhanced PubMed search with Gemini clinical intelligence</li>
          <li>✅ <code>/api/command/run_evidence_bundle</code> - Evidence orchestration</li>
          <li>✅ <code>/api/evidence/test</code> - Gemini API availability verification</li>
          <li>✅ All endpoints return proper JSON structures with run signatures</li>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>🧠 AI-POWERED FEATURES UNLOCKED:</strong>
        </Typography>
        <Box component="ul" sx={{ mt: 1, mb: 2 }}>
          <li>🧠 Gemini API integration for clinical query generation</li>
          <li>🔍 Advanced PubMed queries with medical terminology (pathogenic, deleterious, functional impact)</li>
          <li>📊 Clinical evidence ranking and scoring (RCT, guidelines, reviews)</li>
          <li>🔄 Multiple fallback strategies (LLM → basic → E-utilities direct)</li>
          <li>⚡ Async compatibility fixes for FastAPI integration</li>
          <li>🧬 Variant synonym extraction (p.Val600E → V600E)</li>
        </Box>

        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>🔧 Remaining Work:</strong>
        </Typography>
        <Box component="ul" sx={{ mt: 1 }}>
          <li>Implement Q2C intent classification endpoint</li>
          <li>Add Diffbot full-text extraction</li>
          <li>Complete Forge/design bundle endpoints</li>
          <li>Integrate Supabase for audit logging</li>
          <li>Add LLM reranking and answer confidence</li>
        </Box>
      </Alert>
    </Box>
  );
};

export default CoPilotDoctrineGapAnalysis;



