/**
 * Tests for ClinicalTrialRecsCard Component
 * 
 * Tests mechanism-fit ranking, NCT ID links, phase/status chips, sponsor info, and mechanism fit score
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ClinicalTrialRecsCard from '../moat/ClinicalTrialRecsCard';

describe('ClinicalTrialRecsCard', () => {
  const mockTrials = [
    {
      nct_id: 'NCT12345678',
      title: 'PARP Inhibitor Trial for BRCA-Mutated Ovarian Cancer',
      mechanism_fit_score: 0.92,
      phase: 'Phase III',
      status: 'Recruiting',
      sponsor: 'PharmaCorp'
    },
    {
      nct: 'NCT87654321',
      name: 'Platinum-Based Chemotherapy Study',
      fit_score: 0.65,
      phase: 'Phase II',
      status: 'Active, not recruiting',
      sponsor_name: 'Research Institute'
    }
  ];

  describe('Rendering', () => {
    it('renders component with trials', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText(/Clinical Trial Recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/2 trial/i)).toBeInTheDocument();
    });

    it('handles empty array gracefully', () => {
      const { container } = render(<ClinicalTrialRecsCard trials={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles null/undefined gracefully', () => {
      const { container } = render(<ClinicalTrialRecsCard trials={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Mechanism-Fit Ranking', () => {
    it('sorts trials by mechanism fit score (highest first)', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      const trialTitles = screen.getAllByText(/PARP Inhibitor|Platinum-Based/i);
      // Higher score (0.92) should appear first
      expect(trialTitles[0].textContent).toContain('PARP Inhibitor');
    });

    it('displays mechanism fit score', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText(/92%/i)).toBeInTheDocument();
      expect(screen.getByText(/65%/i)).toBeInTheDocument();
    });

    it('displays mechanism fit progress bar', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('handles fit_score field (alternative)', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText(/65%/i)).toBeInTheDocument();
    });
  });

  describe('NCT ID Links', () => {
    it('renders NCT ID as clickable link', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      const link = screen.getByText('NCT12345678').closest('a');
      expect(link).toHaveAttribute('href', 'https://clinicaltrials.gov/ct2/show/NCT12345678');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('handles nct field (alternative to nct_id)', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      const link = screen.getByText('NCT87654321').closest('a');
      expect(link).toHaveAttribute('href', 'https://clinicaltrials.gov/ct2/show/NCT87654321');
    });

    it('handles missing NCT ID gracefully', () => {
      const trialWithoutNCT = [
        {
          title: 'Test Trial',
          mechanism_fit_score: 0.8,
          phase: 'Phase I',
          status: 'Recruiting'
        }
      ];
      render(<ClinicalTrialRecsCard trials={trialWithoutNCT} />);
      expect(screen.getByText(/Test Trial/i)).toBeInTheDocument();
    });
  });

  describe('Phase Chips', () => {
    it('displays phase with color coding', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText('Phase III')).toBeInTheDocument();
      expect(screen.getByText('Phase II')).toBeInTheDocument();
    });

    it('colors Phase I as red', () => {
      const phaseITrial = [
        {
          nct_id: 'NCT11111111',
          title: 'Phase I Trial',
          mechanism_fit_score: 0.5,
          phase: 'Phase I',
          status: 'Recruiting'
        }
      ];
      render(<ClinicalTrialRecsCard trials={phaseITrial} />);
      const phaseChip = screen.getByText('Phase I');
      expect(phaseChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    });
  });

  describe('Status Chips', () => {
    it('displays status with color coding', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText('Recruiting')).toBeInTheDocument();
      expect(screen.getByText('Active, not recruiting')).toBeInTheDocument();
    });

    it('colors Recruiting as green', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      const recruitingChip = screen.getByText('Recruiting');
      expect(recruitingChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    });
  });

  describe('Sponsor Information', () => {
    it('displays sponsor when available', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText('PharmaCorp')).toBeInTheDocument();
    });

    it('handles sponsor_name field (alternative)', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText('Research Institute')).toBeInTheDocument();
    });

    it('handles missing sponsor gracefully', () => {
      const trialWithoutSponsor = [
        {
          nct_id: 'NCT11111111',
          title: 'Test Trial',
          mechanism_fit_score: 0.8,
          phase: 'Phase I',
          status: 'Recruiting'
        }
      ];
      render(<ClinicalTrialRecsCard trials={trialWithoutSponsor} />);
      expect(screen.getByText(/Test Trial/i)).toBeInTheDocument();
    });
  });

  describe('Flexible Data Handling', () => {
    it('handles title field', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText(/PARP Inhibitor Trial/i)).toBeInTheDocument();
    });

    it('handles name field (alternative)', () => {
      render(<ClinicalTrialRecsCard trials={mockTrials} />);
      expect(screen.getByText(/Platinum-Based Chemotherapy Study/i)).toBeInTheDocument();
    });
  });
});


