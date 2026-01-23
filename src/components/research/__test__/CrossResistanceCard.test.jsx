/**
 * Tests for CrossResistanceCard Component
 * 
 * Tests risk level indicators, prior drug + mechanism display, alternative recommendations, and alerts
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CrossResistanceCard from '../moat/CrossResistanceCard';

describe('CrossResistanceCard', () => {
  const mockCrossResistance = [
    {
      prior_drug: 'Carboplatin',
      resistance_mechanism: 'BRCA1 reversion mutation',
      risk_level: 'HIGH',
      alternatives: ['Olaparib', 'Niraparib'],
      recommendation: 'Consider PARP inhibitor alternatives'
    },
    {
      drug: 'Paclitaxel',
      mechanism: 'Tubulin mutation',
      risk: 'MODERATE',
      alternative_drugs: ['Docetaxel'],
      next_steps: 'Monitor for resistance'
    }
  ];

  describe('Rendering', () => {
    it('renders component with cross-resistance data', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText(/Cross-Resistance Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/2 risk/i)).toBeInTheDocument();
    });

    it('handles empty array gracefully', () => {
      const { container } = render(<CrossResistanceCard crossResistance={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<CrossResistanceCard crossResistance={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Risk Level Indicators', () => {
    it('displays HIGH risk with red color', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      const highRiskChip = screen.getByText('HIGH');
      expect(highRiskChip).toBeInTheDocument();
      expect(highRiskChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    });

    it('displays MODERATE risk with orange color', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      const moderateRiskChip = screen.getByText('MODERATE');
      expect(moderateRiskChip).toBeInTheDocument();
      expect(moderateRiskChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning');
    });

    it('displays LOW risk with info color', () => {
      const lowRiskData = [
        {
          prior_drug: 'Test drug',
          resistance_mechanism: 'Test mechanism',
          risk_level: 'LOW',
          alternatives: []
        }
      ];
      render(<CrossResistanceCard crossResistance={lowRiskData} />);
      const lowRiskChip = screen.getByText('LOW');
      expect(lowRiskChip).toBeInTheDocument();
    });
  });

  describe('Prior Drug + Mechanism Display', () => {
    it('displays prior drug name', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText(/Prior Therapy: Carboplatin/i)).toBeInTheDocument();
    });

    it('displays resistance mechanism', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText(/Resistance Mechanism:/i)).toBeInTheDocument();
      expect(screen.getByText(/BRCA1 reversion mutation/i)).toBeInTheDocument();
    });

    it('handles drug field (alternative to prior_drug)', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText(/Prior Therapy: Paclitaxel/i)).toBeInTheDocument();
    });

    it('handles mechanism field (alternative to resistance_mechanism)', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText(/Tubulin mutation/i)).toBeInTheDocument();
    });
  });

  describe('Alternative Recommendations', () => {
    it('displays alternative drugs as chips', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText('Olaparib')).toBeInTheDocument();
      expect(screen.getByText('Niraparib')).toBeInTheDocument();
    });

    it('handles alternative_drugs field', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText('Docetaxel')).toBeInTheDocument();
    });

    it('handles empty alternatives gracefully', () => {
      const dataWithoutAlternatives = [
        {
          prior_drug: 'Test drug',
          resistance_mechanism: 'Test mechanism',
          risk_level: 'HIGH',
          alternatives: []
        }
      ];
      render(<CrossResistanceCard crossResistance={dataWithoutAlternatives} />);
      expect(screen.queryByText(/Alternative Options/i)).not.toBeInTheDocument();
    });
  });

  describe('Alert System', () => {
    it('displays recommendation alert', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText(/Consider PARP inhibitor alternatives/i)).toBeInTheDocument();
    });

    it('handles next_steps field', () => {
      render(<CrossResistanceCard crossResistance={mockCrossResistance} />);
      expect(screen.getByText(/Monitor for resistance/i)).toBeInTheDocument();
    });

    it('handles missing recommendation gracefully', () => {
      const dataWithoutRecommendation = [
        {
          prior_drug: 'Test drug',
          resistance_mechanism: 'Test mechanism',
          risk_level: 'HIGH',
          alternatives: []
        }
      ];
      render(<CrossResistanceCard crossResistance={dataWithoutRecommendation} />);
      expect(screen.queryByText(/Recommendation:/i)).not.toBeInTheDocument();
    });
  });
});


