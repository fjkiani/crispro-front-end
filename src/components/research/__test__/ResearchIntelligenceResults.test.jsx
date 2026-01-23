/**
 * Test file for Research Intelligence Components
 * 
 * This file tests the Research Intelligence components with mock data
 * to ensure they render correctly.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ResearchIntelligenceResults from '../ResearchIntelligenceResults';
import ResearchPlanCard from '../ResearchPlanCard';
import KeywordAnalysisCard from '../KeywordAnalysisCard';
import SynthesizedFindingsCard from '../SynthesizedFindingsCard';
import MOATAnalysisCard from '../MOATAnalysisCard';

// Mock data matching backend response structure
const mockResearchIntelligenceResult = {
  research_plan: {
    primary_question: "How do purple potatoes help with ovarian cancer?",
    entities: {
      compound: "purple potatoes",
      disease: "ovarian cancer",
      mechanisms: ["angiogenesis", "inflammation"]
    },
    sub_questions: [
      "What compounds in purple potatoes have anti-cancer effects?",
      "How do these compounds affect ovarian cancer pathways?",
      "What is the evidence for purple potatoes in cancer treatment?"
    ],
    portal_queries: {
      pubmed: [
        "purple potatoes AND ovarian cancer",
        "anthocyanins AND ovarian cancer AND angiogenesis"
      ]
    }
  },
  portal_results: {
    pubmed: {
      articles: [
        {
          title: "Anthocyanins from purple potatoes inhibit angiogenesis in ovarian cancer",
          pmid: "12345678",
          journal: "Cancer Research",
          year: "2024",
          authors: ["Smith, J.", "Doe, A."],
          abstract: "This study demonstrates that anthocyanins from purple potatoes..."
        },
        {
          title: "Anti-inflammatory effects of purple potato compounds",
          pmid: "87654321",
          journal: "Oncology Reports",
          year: "2023",
          authors: ["Johnson, B."],
          abstract: "Purple potatoes contain compounds that reduce inflammation..."
        }
      ],
      article_count: 2
    },
    keyword_analysis: {
      frequencies: {
        "angiogenesis": 15,
        "inflammation": 12,
        "VEGF": 8,
        "NF-κB": 7
      }
    },
    top_keywords: [
      { word: "angiogenesis", count: 15 },
      { word: "inflammation", count: 12 },
      { word: "VEGF", count: 8 },
      { word: "NF-κB", count: 7 },
      { word: "anthocyanins", count: 6 }
    ]
  },
  parsed_content: {
    parsed_count: 2,
    full_text_articles: [
      {
        pmid: "12345678",
        methods: "Cell culture and xenograft models were used...",
        results: "Anthocyanins reduced VEGF expression by 60%..."
      }
    ]
  },
  synthesized_findings: {
    mechanisms: [
      {
        mechanism: "angiogenesis inhibition",
        target: "VEGF",
        confidence: 0.85
      },
      {
        mechanism: "anti-inflammatory",
        target: "NF-κB",
        confidence: 0.78
      },
      {
        mechanism: "DNA repair support",
        target: "BRCA1",
        confidence: 0.65
      }
    ],
    evidence_summary: "Purple potatoes contain anthocyanins that inhibit angiogenesis and inflammation in ovarian cancer. Multiple studies demonstrate VEGF inhibition and NF-κB pathway modulation.",
    overall_confidence: 0.78
  },
  moat_analysis: {
    pathways: ["angiogenesis", "inflammation"],
    treatment_line_analysis: {
      score: 0.85,
      status: "appropriate",
      reason: "Mechanisms align with L2 treatment goals"
    },
    biomarker_analysis: {
      total_matches: 1,
      matches: ["HRD+"],
      analysis: "DNA repair mechanism aligns with HRD biomarker"
    },
    pathway_alignment: {
      "angiogenesis": 0.85,
      "inflammation": 0.78
    }
  }
};

describe('Research Intelligence Components', () => {
  describe('ResearchPlanCard', () => {
    it('renders research plan correctly', () => {
      render(<ResearchPlanCard researchPlan={mockResearchIntelligenceResult.research_plan} />);
      
      expect(screen.getByText(/Research Plan/i)).toBeInTheDocument();
      expect(screen.getByText(/How do purple potatoes help with ovarian cancer\?/i)).toBeInTheDocument();
      expect(screen.getByText(/purple potatoes/i)).toBeInTheDocument();
    });
  });

  describe('KeywordAnalysisCard', () => {
    it('renders keyword hotspots correctly', () => {
      render(
        <KeywordAnalysisCard
          keywordAnalysis={mockResearchIntelligenceResult.portal_results.keyword_analysis}
          topKeywords={mockResearchIntelligenceResult.portal_results.top_keywords}
        />
      );
      
      expect(screen.getByText(/Keyword Hotspots/i)).toBeInTheDocument();
      expect(screen.getByText(/angiogenesis/i)).toBeInTheDocument();
      expect(screen.getByText(/inflammation/i)).toBeInTheDocument();
    });
  });

  describe('SynthesizedFindingsCard', () => {
    it('renders synthesized findings correctly', () => {
      render(<SynthesizedFindingsCard findings={mockResearchIntelligenceResult.synthesized_findings} />);
      
      expect(screen.getByText(/Synthesized Findings/i)).toBeInTheDocument();
      expect(screen.getByText(/angiogenesis inhibition/i)).toBeInTheDocument();
      expect(screen.getByText(/78%/i)).toBeInTheDocument(); // Overall confidence
    });
  });

  describe('MOATAnalysisCard', () => {
    it('renders MOAT analysis correctly', () => {
      render(
        <MOATAnalysisCard
          moatAnalysis={mockResearchIntelligenceResult.moat_analysis}
          context={{ disease: "ovarian_cancer_hgs" }}
        />
      );
      
      expect(screen.getByText(/MOAT Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/angiogenesis/i)).toBeInTheDocument();
      expect(screen.getByText(/inflammation/i)).toBeInTheDocument();
    });
  });

  describe('ResearchIntelligenceResults', () => {
    it('renders all sections correctly', () => {
      render(
        <ResearchIntelligenceResults
          result={mockResearchIntelligenceResult}
          context={{ disease: "ovarian_cancer_hgs" }}
        />
      );
      
      expect(screen.getByText(/Portal Results/i)).toBeInTheDocument();
      expect(screen.getByText(/Deep Parsing/i)).toBeInTheDocument();
      expect(screen.getByText(/Synthesized Findings/i)).toBeInTheDocument();
      expect(screen.getByText(/MOAT Analysis/i)).toBeInTheDocument();
    });

    it('handles null result gracefully', () => {
      render(<ResearchIntelligenceResults result={null} />);
      expect(screen.getByText(/No research intelligence results available/i)).toBeInTheDocument();
    });
  });
});




