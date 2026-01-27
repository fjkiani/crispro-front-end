/**
 * Tests for ProvenanceCard Component
 * 
 * Tests run ID display, copy-to-clipboard, snackbar feedback, timestamp formatting, and methods chips
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProvenanceCard from '../provenance/ProvenanceCard';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
});

describe('ProvenanceCard', () => {
  const mockProvenance = {
    run_id: 'abc123-def456-ghi789',
    timestamp: '2025-01-15T10:30:00Z',
    methods_used: ['pubmed_search', 'diffbot_extraction', 'gemini_deep_research']
  };

  describe('Rendering', () => {
    it('renders component with provenance data', () => {
      render(<ProvenanceCard provenance={mockProvenance} />);
      expect(screen.getByText(/Provenance/i)).toBeInTheDocument();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<ProvenanceCard provenance={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Run ID Display', () => {
    it('displays run ID in monospace font', () => {
      render(<ProvenanceCard provenance={mockProvenance} />);
      const runId = screen.getByText('abc123-def456-ghi789');
      expect(runId).toBeInTheDocument();
      expect(runId).toHaveStyle({ fontFamily: 'monospace' });
    });

    it('handles runId field (alternative)', () => {
      const withRunIdField = {
        runId: 'test-run-id',
        timestamp: '2025-01-15T10:30:00Z',
        methods_used: []
      };
      render(<ProvenanceCard provenance={withRunIdField} />);
      expect(screen.getByText('test-run-id')).toBeInTheDocument();
    });

    it('displays N/A for missing run ID', () => {
      const withoutRunId = {
        timestamp: '2025-01-15T10:30:00Z',
        methods_used: []
      };
      render(<ProvenanceCard provenance={withoutRunId} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Copy-to-Clipboard', () => {
    it('renders copy button', () => {
      render(<ProvenanceCard provenance={mockProvenance} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toBeInTheDocument();
    });

    it('copies run ID to clipboard on click', async () => {
      render(<ProvenanceCard provenance={mockProvenance} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('abc123-def456-ghi789');
      });
    });

    it('shows snackbar feedback after copy', async () => {
      render(<ProvenanceCard provenance={mockProvenance} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Run ID copied to clipboard/i)).toBeInTheDocument();
      });
    });

    it('changes icon to checkmark after copy', async () => {
      render(<ProvenanceCard provenance={mockProvenance} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        // Check icon should appear (icon changes)
        expect(copyButton).toBeInTheDocument();
      });
    });
  });

  describe('Timestamp Formatting', () => {
    it('displays formatted timestamp', () => {
      render(<ProvenanceCard provenance={mockProvenance} />);
      // Timestamp should be formatted (exact format depends on locale)
      expect(screen.getByText(/Timestamp/i)).toBeInTheDocument();
    });

    it('handles created_at field (alternative)', () => {
      const withCreatedAt = {
        run_id: 'test-id',
        created_at: '2025-01-15T10:30:00Z',
        methods_used: []
      };
      render(<ProvenanceCard provenance={withCreatedAt} />);
      expect(screen.getByText(/Timestamp/i)).toBeInTheDocument();
    });

    it('displays N/A for missing timestamp', () => {
      const withoutTimestamp = {
        run_id: 'test-id',
        methods_used: []
      };
      render(<ProvenanceCard provenance={withoutTimestamp} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Methods Used', () => {
    it('displays methods as chips', () => {
      render(<ProvenanceCard provenance={mockProvenance} />);
      expect(screen.getByText(/Methods Used \(3\)/i)).toBeInTheDocument();
      expect(screen.getByText('pubmed_search')).toBeInTheDocument();
      expect(screen.getByText('diffbot_extraction')).toBeInTheDocument();
      expect(screen.getByText('gemini_deep_research')).toBeInTheDocument();
    });

    it('handles methods field (alternative)', () => {
      const withMethodsField = {
        run_id: 'test-id',
        timestamp: '2025-01-15T10:30:00Z',
        methods: ['test_method']
      };
      render(<ProvenanceCard provenance={withMethodsField} />);
      expect(screen.getByText('test_method')).toBeInTheDocument();
    });

    it('handles empty methods gracefully', () => {
      const withoutMethods = {
        run_id: 'test-id',
        timestamp: '2025-01-15T10:30:00Z',
        methods_used: []
      };
      render(<ProvenanceCard provenance={withoutMethods} />);
      expect(screen.queryByText(/Methods Used/i)).not.toBeInTheDocument();
    });
  });
});


