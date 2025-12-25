/**
 * Research Intelligence Results Component
 * 
 * Main component for displaying Research Intelligence results:
 * - Research Plan
 * - Portal Results (PubMed articles, keyword analysis)
 * - Parsed Content (full-text articles count)
 * - Synthesized Findings (mechanisms, evidence summary, confidence)
 * - MOAT Analysis (pathways, treatment line, biomarkers)
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import ResearchPlanCard from './ResearchPlanCard';
import KeywordAnalysisCard from './KeywordAnalysisCard';
import SynthesizedFindingsCard from './SynthesizedFindingsCard';
import MOATAnalysisCard from './MOATAnalysisCard';
import PapersList from './PapersList';

export default function ResearchIntelligenceResults({ result, context, compact = false }) {
  if (!result) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>No Results</AlertTitle>
        <Typography variant="body2">
          No research intelligence results available. Try running a research query.
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          <strong>Tip:</strong> Ask specific questions like "How do [compound] help with [disease]?" for best results.
        </Typography>
      </Alert>
    );
  }

  const researchPlan = result.research_plan || {};
  const portalResults = result.portal_results || {};
  const parsedContent = result.parsed_content || {};
  const synthesizedFindings = result.synthesized_findings || {};
  const moatAnalysis = result.moat_analysis || {};

  // Extract portal-specific data
  const pubmedResults = portalResults.pubmed || {};
  const articles = pubmedResults.articles || [];
  const keywordAnalysis = portalResults.keyword_analysis || {};
  const topKeywords = portalResults.top_keywords || [];

  return (
    <Box>
      {/* Research Plan */}
      {!compact && <ResearchPlanCard researchPlan={researchPlan} />}

      {/* Portal Results */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portal Results
          </Typography>

          {/* Keyword Analysis */}
          <KeywordAnalysisCard
            keywordAnalysis={keywordAnalysis}
            topKeywords={topKeywords}
          />

          <Divider sx={{ my: 2 }} />

          {/* Papers List */}
          <PapersList papers={articles} maxDisplay={compact ? 5 : 10} />
        </CardContent>
      </Card>

      {/* Parsed Content */}
      {parsedContent.parsed_count !== undefined && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Deep Parsing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {parsedContent.parsed_count} full-text article{parsedContent.parsed_count !== 1 ? 's' : ''} parsed
            </Typography>
            {parsedContent.full_text_articles && parsedContent.full_text_articles.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Includes Methods/Results sections extraction
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Synthesized Findings */}
      <SynthesizedFindingsCard findings={synthesizedFindings} />

      {/* MOAT Analysis */}
      <MOATAnalysisCard moatAnalysis={moatAnalysis} context={context} />
    </Box>
  );
}



