/**
 * Tests for SAEFeaturesCard Component
 * 
 * Tests DNA repair capacity gauge, 7D mechanism vector display, pathway labels, and data normalization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SAEFeaturesCard from '../moat/SAEFeaturesCard';

describe('SAEFeaturesCard', () => {
  const mockSAEFeatures = {
    dna_repair_capacity: 0.75,
    mechanism_vector_7d: [0.88, 0.12, 0.05, 0.02, 0, 0, 0],
    pathway_labels: ['DDR', 'MAPK', 'PI3K', 'VEGF', 'HER2', 'IO', 'Efflux']
  };

  describe('Rendering', () => {
    it('renders component with SAE features', () => {
      render(<SAEFeaturesCard saeFeatures={mockSAEFeatures} />);
      expect(screen.getByText(/SAE Features/i)).toBeInTheDocument();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<SAEFeaturesCard saeFeatures={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('DNA Repair Capacity', () => {
    it('displays DNA repair capacity percentage', () => {
      render(<SAEFeaturesCard saeFeatures={mockSAEFeatures} />);
      expect(screen.getByText(/75%/i)).toBeInTheDocument();
    });

    it('displays High label for capacity >= 0.7', () => {
      render(<SAEFeaturesCard saeFeatures={mockSAEFeatures} />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('displays Moderate label for capacity 0.4-0.7', () => {
      const moderateCapacity = {
        ...mockSAEFeatures,
        dna_repair_capacity: 0.55
      };
      render(<SAEFeaturesCard saeFeatures={moderateCapacity} />);
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('displays Low label for capacity < 0.4', () => {
      const lowCapacity = {
        ...mockSAEFeatures,
        dna_repair_capacity: 0.25
      };
      render(<SAEFeaturesCard saeFeatures={lowCapacity} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('displays progress bar with correct value', () => {
      render(<SAEFeaturesCard saeFeatures={mockSAEFeatures} />);
      const progressBars = screen.getAllByRole('progressbar');
      const dnaRepairBar = progressBars[0];
      expect(dnaRepairBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('handles dna_repair field (alternative)', () => {
      const withAltField = {
        dna_repair: 0.65,
        mechanism_vector_7d: [0.5, 0.3, 0.2, 0, 0, 0, 0]
      };
      render(<SAEFeaturesCard saeFeatures={withAltField} />);
      expect(screen.getByText(/65%/i)).toBeInTheDocument();
    });
  });

  describe('7D Mechanism Vector', () => {
    it('displays all 7 pathway values', () => {
      render(<SAEFeaturesCard saeFeatures={mockSAEFeatures} />);
      expect(screen.getByText(/DDR/i)).toBeInTheDocument();
      expect(screen.getByText(/MAPK/i)).toBeInTheDocument();
      expect(screen.getByText(/PI3K/i)).toBeInTheDocument();
      expect(screen.getByText(/VEGF/i)).toBeInTheDocument();
      expect(screen.getByText(/HER2/i)).toBeInTheDocument();
      expect(screen.getByText(/IO/i)).toBeInTheDocument();
      expect(screen.getByText(/Efflux/i)).toBeInTheDocument();
    });

    it('displays percentage for each pathway', () => {
      render(<SAEFeaturesCard saeFeatures={mockSAEFeatures} />);
      expect(screen.getByText(/88%/i)).toBeInTheDocument(); // DDR
      expect(screen.getByText(/12%/i)).toBeInTheDocument(); // MAPK
    });

    it('normalizes vector to 7 values if shorter', () => {
      const shortVector = {
        dna_repair_capacity: 0.75,
        mechanism_vector_7d: [0.5, 0.3],
        pathway_labels: ['DDR', 'MAPK']
      };
      render(<SAEFeaturesCard saeFeatures={shortVector} />);
      const progressBars = screen.getAllByRole('progressbar');
      // Should have 1 DNA repair + 7 pathway bars = 8 total
      expect(progressBars.length).toBeGreaterThanOrEqual(8);
    });

    it('handles mechanism_vector field (alternative)', () => {
      const withAltField = {
        dna_repair_capacity: 0.75,
        mechanism_vector: [0.5, 0.3, 0.2, 0, 0, 0, 0]
      };
      render(<SAEFeaturesCard saeFeatures={withAltField} />);
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });
  });

  describe('Pathway Labels', () => {
    it('uses default labels if not provided', () => {
      const withoutLabels = {
        dna_repair_capacity: 0.75,
        mechanism_vector_7d: [0.5, 0.3, 0.2, 0, 0, 0, 0]
      };
      render(<SAEFeaturesCard saeFeatures={withoutLabels} />);
      // Should still render 7 pathways
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThanOrEqual(8);
    });
  });
});


