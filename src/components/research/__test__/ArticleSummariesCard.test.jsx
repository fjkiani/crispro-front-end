/**
 * Tests for ArticleSummariesCard Component
 * 
 * Tests accordion per article, summary text, key findings, PubMed links, and empty state
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ArticleSummariesCard from '../findings/ArticleSummariesCard';

describe('ArticleSummariesCard', () => {
  const mockSummaries = [
    {
      title: 'Curcumin inhibits NF-κB in breast cancer',
      summary: 'This study demonstrates that curcumin effectively inhibits NF-κB pathway activation in breast cancer cells.',
      key_findings: [
        'NF-κB inhibition observed at 10μM concentration',
        'Apoptosis induction in 60% of cells',
        'No significant toxicity in normal cells'
      ],
      pmid: '12345678'
    },
    {
      paper_title: 'Anthocyanins and colorectal cancer',
      llm_summary: 'Anthocyanins from berries show anti-cancer effects in colorectal cancer models.',
      findings: [
        'Wnt pathway inhibition',
        'Reduced tumor growth by 40%'
      ],
      pubmed_id: '23456789'
    }
  ];

  describe('Rendering', () => {
    it('renders component with summaries', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      expect(screen.getByText(/Article Summaries/i)).toBeInTheDocument();
      expect(screen.getByText(/2 article/i)).toBeInTheDocument();
    });

    it('handles empty array gracefully', () => {
      const { container } = render(<ArticleSummariesCard summaries={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<ArticleSummariesCard summaries={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accordion Functionality', () => {
    it('renders accordion for each article', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      expect(screen.getByText(/Curcumin inhibits NF-κB/i)).toBeInTheDocument();
      expect(screen.getByText(/Anthocyanins and colorectal cancer/i)).toBeInTheDocument();
    });

    it('expands accordion on click', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      const accordion = screen.getByText(/Curcumin inhibits NF-κB/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/This study demonstrates/i)).toBeInTheDocument();
    });
  });

  describe('Summary Text', () => {
    it('displays summary text when expanded', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      const accordion = screen.getByText(/Curcumin inhibits NF-κB/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/curcumin effectively inhibits NF-κB pathway/i)).toBeInTheDocument();
    });

    it('handles llm_summary field', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      const accordion = screen.getByText(/Anthocyanins and colorectal cancer/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/Anthocyanins from berries show anti-cancer effects/i)).toBeInTheDocument();
    });
  });

  describe('Key Findings', () => {
    it('displays key findings as bullet list', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      const accordion = screen.getByText(/Curcumin inhibits NF-κB/i).closest('[role="button"]');
      fireEvent.click(accordion);
      
      expect(screen.getByText(/NF-κB inhibition observed at 10μM concentration/i)).toBeInTheDocument();
      expect(screen.getByText(/Apoptosis induction in 60% of cells/i)).toBeInTheDocument();
      expect(screen.getByText(/No significant toxicity in normal cells/i)).toBeInTheDocument();
    });

    it('handles findings field', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      const accordion = screen.getByText(/Anthocyanins and colorectal cancer/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/Wnt pathway inhibition/i)).toBeInTheDocument();
    });

    it('handles empty key findings gracefully', () => {
      const summariesWithoutFindings = [
        {
          title: 'Test article',
          summary: 'Test summary',
          pmid: '12345678'
        }
      ];
      render(<ArticleSummariesCard summaries={summariesWithoutFindings} />);
      const accordion = screen.getByText(/Test article/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.queryByText(/Key Findings:/i)).not.toBeInTheDocument();
    });
  });

  describe('PubMed Links', () => {
    it('renders PubMed link with correct URL', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      const accordion = screen.getByText(/Curcumin inhibits NF-κB/i).closest('[role="button"]');
      fireEvent.click(accordion);
      
      const link = screen.getByText(/View on PubMed/i).closest('a');
      expect(link).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/12345678');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('handles pmid field', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      const accordion = screen.getByText(/Curcumin inhibits NF-κB/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/PMID: 12345678/i)).toBeInTheDocument();
    });

    it('handles pubmed_id field', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      const accordion = screen.getByText(/Anthocyanins and colorectal cancer/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/PMID: 23456789/i)).toBeInTheDocument();
    });

    it('handles missing PMID gracefully', () => {
      const summariesWithoutPMID = [
        {
          title: 'Test article',
          summary: 'Test summary'
        }
      ];
      render(<ArticleSummariesCard summaries={summariesWithoutPMID} />);
      const accordion = screen.getByText(/Test article/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.queryByText(/View on PubMed/i)).not.toBeInTheDocument();
    });
  });

  describe('Flexible Data Handling', () => {
    it('handles title field', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      expect(screen.getByText(/Curcumin inhibits NF-κB/i)).toBeInTheDocument();
    });

    it('handles paper_title field', () => {
      render(<ArticleSummariesCard summaries={mockSummaries} />);
      expect(screen.getByText(/Anthocyanins and colorectal cancer/i)).toBeInTheDocument();
    });
  });
});


