/**
 * Research Intelligence Results Component
 * 
 * IMPROVED: Reorganized layout with value synthesis and dossier prominent
 * - Top: Value Synthesis + Dossier (most important)
 * - Middle: Research Plan + Findings + MOAT
 * - Bottom: Portal Results + Papers + Provenance
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
import SubQuestionAnswersCard from './findings/SubQuestionAnswersCard';
import ArticleSummariesCard from './findings/ArticleSummariesCard';
import ProvenanceCard from './provenance/ProvenanceCard';
import ValueSynthesisCard from './ValueSynthesisCard';
import DossierDisplayCard from './DossierDisplayCard'; // NEW

export default function ResearchIntelligenceResults({ result, context, compact = false, persona = 'patient' }) {
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
      {/* TOP SECTION: Most Important Insights - PROMINENT */}
      
      {/* Value Synthesis - FIRST (Executive Summary) */}
      {result.value_synthesis && (
        <Box sx={{ mb: 3 }}>
          <ValueSynthesisCard 
            insights={result.value_synthesis} 
            persona={persona}
          />
        </Box>
      )}

      {/* Dossier - SECOND (if available) */}
      {result.dossier && result.dossier.markdown && (
        <Box sx={{ mb: 3 }}>
          <DossierDisplayCard 
            dossier={result.dossier}
            persona={persona}
          />
        </Box>
      )}

      {/* MIDDLE SECTION: Research Details */}
      
      {/* Research Plan */}
      {!compact && (
        <Box sx={{ mb: 3 }}>
          <ResearchPlanCard researchPlan={researchPlan} />
        </Box>
      )}

      {/* Synthesized Findings */}
      <Box sx={{ mb: 3 }}>
        <SynthesizedFindingsCard findings={synthesizedFindings} />
      </Box>

      {/* Sub-Question Answers */}
      {result.sub_question_answers && (
        <Box sx={{ mb: 3 }}>
          <SubQuestionAnswersCard answers={result.sub_question_answers} />
        </Box>
      )}

      {/* Article Summaries */}
      {synthesizedFindings.article_summaries && (
        <Box sx={{ mb: 3 }}>
          <ArticleSummariesCard summaries={synthesizedFindings.article_summaries} />
        </Box>
      )}

      {/* MOAT Analysis */}
      <Box sx={{ mb: 3 }}>
        <MOATAnalysisCard moatAnalysis={moatAnalysis} context={context} />
      </Box>

      {/* BOTTOM SECTION: Supporting Data */}
      
      {/* Portal Results */}
      <Box sx={{ mb: 3 }}>
        <Card>
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
      </Box>

      {/* Parsed Content */}
      {parsedContent.parsed_count !== undefined && (
        <Box sx={{ mb: 3 }}>
          <Card>
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
        </Box>
      )}

      {/* Provenance */}
      {result.provenance && (
        <Box sx={{ mb: 3 }}>
          <ProvenanceCard provenance={result.provenance} />
        </Box>
      )}
    </Box>
  );
}
