/**
 * Tests for ToxicityMitigationCard Component
 * 
 * Tests risk level colors, pathway overlap percentage, mitigating foods, and alerts
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ToxicityMitigationCard from '../moat/ToxicityMitigationCard';

describe('ToxicityMitigationCard', () => {
  const mockToxicityMitigation = {
    risk_level: 'HIGH',
    pathway_overlap: 0.75,
    mitigating_foods: ['Turmeric', 'Green tea', 'Broccoli'],
    alerts: [
      {
        message: 'High pathway overlap detected. Monitor closely.',
        severity: 'error'
      }
    ]
  };

  describe('Rendering', () => {
    it('renders component with toxicity data', () => {
      render(<ToxicityMitigationCard toxicityMitigation={mockToxicityMitigation} />);
      expect(screen.getByText(/Toxicity Risk & Mitigation/i)).toBeInTheDocument();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<ToxicityMitigationCard toxicityMitigation={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Risk Level Colors', () => {
    it('displays HIGH risk with red color', () => {
      render(<ToxicityMitigationCard toxicityMitigation={mockToxicityMitigation} />);
      const riskChip = screen.getByText('HIGH');
      expect(riskChip).toBeInTheDocument();
      expect(riskChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    });

    it('displays MODERATE risk with orange color', () => {
      const moderateRisk = { ...mockToxicityMitigation, risk_level: 'MODERATE' };
      render(<ToxicityMitigationCard toxicityMitigation={moderateRisk} />);
      const riskChip = screen.getByText('MODERATE');
      expect(riskChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning');
    });

    it('displays LOW risk with green color', () => {
      const lowRisk = { ...mockToxicityMitigation, risk_level: 'LOW' };
      render(<ToxicityMitigationCard toxicityMitigation={lowRisk} />);
      const riskChip = screen.getByText('LOW');
      expect(riskChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    });

    it('handles risk field (alternative to risk_level)', () => {
      const withRiskField = {
        risk: 'HIGH',
        pathway_overlap: 0.75,
        mitigating_foods: []
      };
      render(<ToxicityMitigationCard toxicityMitigation={withRiskField} />);
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });
  });

  describe('Pathway Overlap', () => {
    it('displays pathway overlap percentage', () => {
      render(<ToxicityMitigationCard toxicityMitigation={mockToxicityMitigation} />);
      expect(screen.getByText(/75%/i)).toBeInTheDocument();
      expect(screen.getByText(/overlap between patient variants and drug MoA pathways/i)).toBeInTheDocument();
    });

    it('handles overlap_score field', () => {
      const withOverlapScore = {
        risk_level: 'HIGH',
        overlap_score: 0.60,
        mitigating_foods: []
      };
      render(<ToxicityMitigationCard toxicityMitigation={withOverlapScore} />);
      expect(screen.getByText(/60%/i)).toBeInTheDocument();
    });

    it('handles missing pathway overlap gracefully', () => {
      const withoutOverlap = {
        risk_level: 'HIGH',
        mitigating_foods: []
      };
      render(<ToxicityMitigationCard toxicityMitigation={withoutOverlap} />);
      expect(screen.queryByText(/Pathway Overlap/i)).not.toBeInTheDocument();
    });
  });

  describe('Mitigating Foods', () => {
    it('displays mitigating foods as chips', () => {
      render(<ToxicityMitigationCard toxicityMitigation={mockToxicityMitigation} />);
      expect(screen.getByText('Turmeric')).toBeInTheDocument();
      expect(screen.getByText('Green tea')).toBeInTheDocument();
      expect(screen.getByText('Broccoli')).toBeInTheDocument();
    });

    it('displays count of mitigating foods', () => {
      render(<ToxicityMitigationCard toxicityMitigation={mockToxicityMitigation} />);
      expect(screen.getByText(/Mitigating Foods \(3\)/i)).toBeInTheDocument();
    });

    it('handles foods field (alternative to mitigating_foods)', () => {
      const withFoodsField = {
        risk_level: 'HIGH',
        pathway_overlap: 0.75,
        foods: ['Ginger', 'Garlic']
      };
      render(<ToxicityMitigationCard toxicityMitigation={withFoodsField} />);
      expect(screen.getByText('Ginger')).toBeInTheDocument();
      expect(screen.getByText('Garlic')).toBeInTheDocument();
    });

    it('handles food objects with name field', () => {
      const withFoodObjects = {
        risk_level: 'HIGH',
        pathway_overlap: 0.75,
        mitigating_foods: [
          { name: 'Turmeric' },
          { food: 'Green tea' }
        ]
      };
      render(<ToxicityMitigationCard toxicityMitigation={withFoodObjects} />);
      expect(screen.getByText('Turmeric')).toBeInTheDocument();
      expect(screen.getByText('Green tea')).toBeInTheDocument();
    });

    it('handles empty mitigating foods gracefully', () => {
      const withoutFoods = {
        risk_level: 'LOW',
        pathway_overlap: 0.20,
        mitigating_foods: []
      };
      render(<ToxicityMitigationCard toxicityMitigation={withoutFoods} />);
      expect(screen.queryByText(/Mitigating Foods/i)).not.toBeInTheDocument();
    });
  });

  describe('Alert System', () => {
    it('displays alert messages', () => {
      render(<ToxicityMitigationCard toxicityMitigation={mockToxicityMitigation} />);
      expect(screen.getByText(/High pathway overlap detected/i)).toBeInTheDocument();
    });

    it('handles warnings field', () => {
      const withWarnings = {
        risk_level: 'HIGH',
        pathway_overlap: 0.75,
        mitigating_foods: [],
        warnings: ['Test warning message']
      };
      render(<ToxicityMitigationCard toxicityMitigation={withWarnings} />);
      expect(screen.getByText(/Test warning message/i)).toBeInTheDocument();
    });

    it('handles string alerts', () => {
      const withStringAlerts = {
        risk_level: 'HIGH',
        pathway_overlap: 0.75,
        mitigating_foods: [],
        alerts: ['Simple alert message']
      };
      render(<ToxicityMitigationCard toxicityMitigation={withStringAlerts} />);
      expect(screen.getByText(/Simple alert message/i)).toBeInTheDocument();
    });
  });

  describe('Low Risk Success Message', () => {
    it('displays success message for low risk with no foods/alerts', () => {
      const lowRiskClean = {
        risk_level: 'LOW',
        pathway_overlap: 0.20,
        mitigating_foods: [],
        alerts: []
      };
      render(<ToxicityMitigationCard toxicityMitigation={lowRiskClean} />);
      expect(screen.getByText(/Low toxicity risk detected/i)).toBeInTheDocument();
      expect(screen.getByText(/Standard monitoring recommended/i)).toBeInTheDocument();
    });

    it('does not show success message if foods or alerts exist', () => {
      const lowRiskWithFoods = {
        risk_level: 'LOW',
        pathway_overlap: 0.20,
        mitigating_foods: ['Turmeric'],
        alerts: []
      };
      render(<ToxicityMitigationCard toxicityMitigation={lowRiskWithFoods} />);
      expect(screen.queryByText(/Low toxicity risk detected/i)).not.toBeInTheDocument();
    });
  });
});


