/**
 * Tests for SubQuestionAnswersCard Component
 * 
 * Tests accordion expansion, confidence display, source links, empty state, and flexible data handling
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SubQuestionAnswersCard from '../findings/SubQuestionAnswersCard';

describe('SubQuestionAnswersCard', () => {
  const mockAnswers = [
    {
      question: 'What mechanisms does curcumin target?',
      answer: 'Curcumin targets NF-κB pathway and induces apoptosis.',
      confidence: 0.85,
      sources: ['12345678', '23456789']
    },
    {
      sub_question: 'How does curcumin affect inflammation?',
      response: 'Curcumin reduces inflammation by inhibiting NF-κB activation.',
      confidence_score: 0.72,
      source_pmids: ['34567890']
    }
  ];

  describe('Rendering', () => {
    it('renders component with answers', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      expect(screen.getByText(/Sub-Question Answers/i)).toBeInTheDocument();
      expect(screen.getByText(/2 answered/i)).toBeInTheDocument();
    });

    it('handles empty array gracefully', () => {
      const { container } = render(<SubQuestionAnswersCard answers={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<SubQuestionAnswersCard answers={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accordion Functionality', () => {
    it('renders accordion for each answer', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      expect(screen.getByText(/What mechanisms does curcumin target\?/i)).toBeInTheDocument();
      expect(screen.getByText(/How does curcumin affect inflammation\?/i)).toBeInTheDocument();
    });

    it('expands accordion on click', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/What mechanisms does curcumin target\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/Curcumin targets NF-κB pathway/i)).toBeInTheDocument();
    });

    it('shows answer text when expanded', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/What mechanisms does curcumin target\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/Curcumin targets NF-κB pathway and induces apoptosis/i)).toBeInTheDocument();
    });
  });

  describe('Confidence Display', () => {
    it('displays confidence percentage', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/What mechanisms does curcumin target\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/85%/i)).toBeInTheDocument();
    });

    it('displays confidence progress bar', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/What mechanisms does curcumin target\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '85');
    });

    it('handles missing confidence gracefully', () => {
      const answersWithoutConfidence = [
        {
          question: 'Test question',
          answer: 'Test answer',
          sources: ['12345678']
        }
      ];
      render(<SubQuestionAnswersCard answers={answersWithoutConfidence} />);
      const accordion = screen.getByText(/Test question/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.queryByText(/%/i)).not.toBeInTheDocument();
    });
  });

  describe('Source Links', () => {
    it('renders source links as clickable', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/What mechanisms does curcumin target\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      
      const links = screen.getAllByText(/PMID:/i);
      expect(links.length).toBeGreaterThan(0);
      
      const firstLink = screen.getByText(/PMID: 12345678/i);
      expect(firstLink.closest('a')).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/12345678');
      expect(firstLink.closest('a')).toHaveAttribute('target', '_blank');
    });

    it('handles sources array', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/What mechanisms does curcumin target\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/PMID: 12345678/i)).toBeInTheDocument();
      expect(screen.getByText(/PMID: 23456789/i)).toBeInTheDocument();
    });

    it('handles source_pmids array', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/How does curcumin affect inflammation\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/PMID: 34567890/i)).toBeInTheDocument();
    });

    it('handles empty sources gracefully', () => {
      const answersWithoutSources = [
        {
          question: 'Test question',
          answer: 'Test answer'
        }
      ];
      render(<SubQuestionAnswersCard answers={answersWithoutSources} />);
      const accordion = screen.getByText(/Test question/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.queryByText(/Sources:/i)).not.toBeInTheDocument();
    });
  });

  describe('Flexible Data Handling', () => {
    it('handles question field', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      expect(screen.getByText(/What mechanisms does curcumin target\?/i)).toBeInTheDocument();
    });

    it('handles sub_question field', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      expect(screen.getByText(/How does curcumin affect inflammation\?/i)).toBeInTheDocument();
    });

    it('handles answer field', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/What mechanisms does curcumin target\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/Curcumin targets NF-κB pathway/i)).toBeInTheDocument();
    });

    it('handles response field', () => {
      render(<SubQuestionAnswersCard answers={mockAnswers} />);
      const accordion = screen.getByText(/How does curcumin affect inflammation\?/i).closest('[role="button"]');
      fireEvent.click(accordion);
      expect(screen.getByText(/Curcumin reduces inflammation/i)).toBeInTheDocument();
    });
  });
});


