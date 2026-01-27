/**
 * Tests for CitationNetworkCard Component
 * 
 * Tests key papers list, publication trends, top journals, and PMID links
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CitationNetworkCard from '../moat/CitationNetworkCard';

describe('CitationNetworkCard', () => {
  const mockCitationNetwork = {
    key_papers: [
      {
        pmid: '12345678',
        title: 'Key Paper on Curcumin Mechanisms',
        citation_count: 150
      },
      {
        pubmed_id: '23456789',
        title: 'Anthocyanins in Cancer',
        citations: 89
      }
    ],
    publication_trends: {
      '2024': 15,
      '2023': 12,
      '2022': 8
    },
    top_journals: ['Nature', 'Cell', 'Cancer Research']
  };

  describe('Rendering', () => {
    it('renders component with citation network data', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      expect(screen.getByText(/Citation Network/i)).toBeInTheDocument();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<CitationNetworkCard citationNetwork={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Key Papers List', () => {
    it('displays key papers with titles', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      expect(screen.getByText(/Key Papers \(2\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Key Paper on Curcumin Mechanisms/i)).toBeInTheDocument();
      expect(screen.getByText(/Anthocyanins in Cancer/i)).toBeInTheDocument();
    });

    it('displays citation counts', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      expect(screen.getByText(/150 citations/i)).toBeInTheDocument();
      expect(screen.getByText(/89 citations/i)).toBeInTheDocument();
    });

    it('renders PMID links', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      const link = screen.getByText(/Key Paper on Curcumin Mechanisms/i).closest('a');
      expect(link).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/12345678');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('handles pubmed_id field (alternative)', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      const link = screen.getByText(/Anthocyanins in Cancer/i).closest('a');
      expect(link).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/23456789');
    });

    it('displays PMID chips', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      expect(screen.getByText(/PMID: 12345678/i)).toBeInTheDocument();
    });

    it('handles missing citation count gracefully', () => {
      const paperWithoutCitations = {
        key_papers: [
          {
            pmid: '11111111',
            title: 'Paper Without Citations'
          }
        ],
        publication_trends: {},
        top_journals: []
      };
      render(<CitationNetworkCard citationNetwork={paperWithoutCitations} />);
      expect(screen.getByText(/Paper Without Citations/i)).toBeInTheDocument();
      expect(screen.queryByText(/citations/i)).not.toBeInTheDocument();
    });

    it('handles empty key papers gracefully', () => {
      const emptyPapers = {
        key_papers: [],
        publication_trends: {},
        top_journals: []
      };
      render(<CitationNetworkCard citationNetwork={emptyPapers} />);
      expect(screen.getByText(/No key papers identified/i)).toBeInTheDocument();
    });
  });

  describe('Publication Trends', () => {
    it('displays publication trends by year', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      expect(screen.getByText(/Publication Trends/i)).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getByText('2022')).toBeInTheDocument();
    });

    it('displays count for each year', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      expect(screen.getByText('15')).toBeInTheDocument(); // 2024
      expect(screen.getByText('12')).toBeInTheDocument(); // 2023
      expect(screen.getByText('8')).toBeInTheDocument(); // 2022
    });

    it('sorts years descending', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      const yearElements = screen.getAllByText(/202[234]/);
      // Should be sorted: 2024, 2023, 2022
      expect(yearElements[0].textContent).toBe('2024');
    });

    it('handles empty trends gracefully', () => {
      const emptyTrends = {
        key_papers: [],
        publication_trends: {},
        top_journals: []
      };
      render(<CitationNetworkCard citationNetwork={emptyTrends} />);
      expect(screen.getByText(/No trend data available/i)).toBeInTheDocument();
    });
  });

  describe('Top Journals', () => {
    it('displays top journals as chips', () => {
      render(<CitationNetworkCard citationNetwork={mockCitationNetwork} />);
      expect(screen.getByText('Nature')).toBeInTheDocument();
      expect(screen.getByText('Cell')).toBeInTheDocument();
      expect(screen.getByText('Cancer Research')).toBeInTheDocument();
    });

    it('handles empty journals gracefully', () => {
      const emptyJournals = {
        key_papers: [],
        publication_trends: {},
        top_journals: []
      };
      render(<CitationNetworkCard citationNetwork={emptyJournals} />);
      expect(screen.queryByText(/Top Journals/i)).not.toBeInTheDocument();
    });
  });
});


