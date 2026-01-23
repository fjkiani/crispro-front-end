/**
 * Tests for DrugInteractionsCard Component
 * 
 * Tests interaction table, severity indicators, pathways checked, and empty state
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import DrugInteractionsCard from '../moat/DrugInteractionsCard';

describe('DrugInteractionsCard', () => {
  const mockDrugInteractions = {
    interactions: [
      {
        drug_a: 'Carboplatin',
        drug_b: 'Paclitaxel',
        pathway: 'DNA repair',
        severity: 'Moderate',
        recommendation: 'Monitor for increased toxicity'
      },
      {
        drug1: 'Olaparib',
        drug2: 'CYP3A4 inhibitor',
        pathway_name: 'CYP3A4 metabolism',
        risk_level: 'Severe',
        action: 'Dose adjustment required'
      }
    ],
    pathways_checked: ['DNA repair', 'CYP3A4 metabolism', 'Efflux']
  };

  describe('Rendering', () => {
    it('renders component with interactions', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText(/Drug Interactions/i)).toBeInTheDocument();
      expect(screen.getByText(/2 interaction/i)).toBeInTheDocument();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<DrugInteractionsCard drugInteractions={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Interaction Table', () => {
    it('renders interaction table with all columns', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText(/Drug A/i)).toBeInTheDocument();
      expect(screen.getByText(/Drug B/i)).toBeInTheDocument();
      expect(screen.getByText(/Pathway/i)).toBeInTheDocument();
      expect(screen.getByText(/Severity/i)).toBeInTheDocument();
      expect(screen.getByText(/Recommendation/i)).toBeInTheDocument();
    });

    it('displays drug_a and drug_b', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText('Carboplatin')).toBeInTheDocument();
      expect(screen.getByText('Paclitaxel')).toBeInTheDocument();
    });

    it('handles drug1 and drug2 fields (alternatives)', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText('Olaparib')).toBeInTheDocument();
      expect(screen.getByText('CYP3A4 inhibitor')).toBeInTheDocument();
    });

    it('displays pathway name', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText('DNA repair')).toBeInTheDocument();
    });

    it('handles pathway_name field (alternative)', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText('CYP3A4 metabolism')).toBeInTheDocument();
    });

    it('displays recommendation', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText(/Monitor for increased toxicity/i)).toBeInTheDocument();
    });

    it('handles action field (alternative)', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText(/Dose adjustment required/i)).toBeInTheDocument();
    });
  });

  describe('Severity Indicators', () => {
    it('displays Severe with red color', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      const severeChip = screen.getByText('Severe');
      expect(severeChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    });

    it('displays Moderate with orange color', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      const moderateChip = screen.getByText('Moderate');
      expect(moderateChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning');
    });

    it('displays Minor with info color', () => {
      const minorInteraction = {
        interactions: [
          {
            drug_a: 'Drug A',
            drug_b: 'Drug B',
            pathway: 'Test pathway',
            severity: 'Minor',
            recommendation: 'Monitor'
          }
        ],
        pathways_checked: []
      };
      render(<DrugInteractionsCard drugInteractions={minorInteraction} />);
      const minorChip = screen.getByText('Minor');
      expect(minorChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorInfo');
    });

    it('handles risk_level field (alternative)', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText('Severe')).toBeInTheDocument();
    });
  });

  describe('Pathways Checked', () => {
    it('displays pathways checked', () => {
      render(<DrugInteractionsCard drugInteractions={mockDrugInteractions} />);
      expect(screen.getByText(/Pathways checked:/i)).toBeInTheDocument();
      expect(screen.getByText(/DNA repair, CYP3A4 metabolism, Efflux/i)).toBeInTheDocument();
    });

    it('handles pathways field (alternative)', () => {
      const withPathwaysField = {
        interactions: [],
        pathways: ['Test pathway']
      };
      render(<DrugInteractionsCard drugInteractions={withPathwaysField} />);
      expect(screen.getByText(/Test pathway/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays success alert when no interactions', () => {
      const noInteractions = {
        interactions: [],
        pathways_checked: ['DNA repair']
      };
      render(<DrugInteractionsCard drugInteractions={noInteractions} />);
      expect(screen.getByText(/No significant drug interactions detected/i)).toBeInTheDocument();
    });

    it('handles missing interactions array', () => {
      const missingInteractions = {
        pathways_checked: []
      };
      render(<DrugInteractionsCard drugInteractions={missingInteractions} />);
      expect(screen.getByText(/No significant drug interactions detected/i)).toBeInTheDocument();
    });
  });
});


