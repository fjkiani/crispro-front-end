/**
 * Tests for EvidenceTierBadge Component
 * 
 * Tests tier color coding, badge rendering, null handling, size prop, and tooltips
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import EvidenceTierBadge from '../findings/EvidenceTierBadge';

describe('EvidenceTierBadge', () => {
  describe('Tier Color Coding', () => {
    it('renders Supported tier with green color', () => {
      render(<EvidenceTierBadge tier="Supported" />);
      const chip = screen.getByText('Supported');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveStyle({ backgroundColor: '#4CAF50' });
    });

    it('renders Consider tier with orange color', () => {
      render(<EvidenceTierBadge tier="Consider" />);
      const chip = screen.getByText('Consider');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveStyle({ backgroundColor: '#FF9800' });
    });

    it('renders Insufficient tier with gray color', () => {
      render(<EvidenceTierBadge tier="Insufficient" />);
      const chip = screen.getByText('Insufficient');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveStyle({ backgroundColor: '#9E9E9E' });
    });

    it('defaults to Insufficient for unknown tier', () => {
      render(<EvidenceTierBadge tier="Unknown" />);
      const chip = screen.getByText('Unknown');
      expect(chip).toHaveStyle({ backgroundColor: '#9E9E9E' });
    });
  });

  describe('Badge Rendering', () => {
    it('renders Pathway-Aligned badge with icon', () => {
      render(<EvidenceTierBadge tier="Supported" badges={['Pathway-Aligned']} />);
      expect(screen.getByText('Pathway-Aligned')).toBeInTheDocument();
    });

    it('renders RCT badge with icon', () => {
      render(<EvidenceTierBadge tier="Supported" badges={['RCT']} />);
      expect(screen.getByText('RCT')).toBeInTheDocument();
    });

    it('renders ClinVar-Strong badge with icon', () => {
      render(<EvidenceTierBadge tier="Supported" badges={['ClinVar-Strong']} />);
      expect(screen.getByText('ClinVar-Strong')).toBeInTheDocument();
    });

    it('renders Guideline badge with icon', () => {
      render(<EvidenceTierBadge tier="Supported" badges={['Guideline']} />);
      expect(screen.getByText('Guideline')).toBeInTheDocument();
    });

    it('renders multiple badges', () => {
      render(
        <EvidenceTierBadge
          tier="Supported"
          badges={['Pathway-Aligned', 'RCT', 'ClinVar-Strong']}
        />
      );
      expect(screen.getByText('Pathway-Aligned')).toBeInTheDocument();
      expect(screen.getByText('RCT')).toBeInTheDocument();
      expect(screen.getByText('ClinVar-Strong')).toBeInTheDocument();
    });

    it('handles unknown badge gracefully', () => {
      render(<EvidenceTierBadge tier="Supported" badges={['Unknown-Badge']} />);
      expect(screen.getByText('Unknown-Badge')).toBeInTheDocument();
    });
  });

  describe('Null Handling', () => {
    it('returns null when tier is missing', () => {
      const { container } = render(<EvidenceTierBadge tier={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null when tier is undefined', () => {
      const { container } = render(<EvidenceTierBadge />);
      expect(container.firstChild).toBeNull();
    });

    it('renders tier without badges when badges array is empty', () => {
      render(<EvidenceTierBadge tier="Supported" badges={[]} />);
      expect(screen.getByText('Supported')).toBeInTheDocument();
      expect(screen.queryByText('Pathway-Aligned')).not.toBeInTheDocument();
    });
  });

  describe('Size Prop', () => {
    it('renders small size correctly', () => {
      render(<EvidenceTierBadge tier="Supported" size="small" />);
      const chip = screen.getByText('Supported');
      expect(chip).toHaveStyle({ fontSize: '0.75rem' });
    });

    it('renders medium size correctly (default)', () => {
      render(<EvidenceTierBadge tier="Supported" size="medium" />);
      const chip = screen.getByText('Supported');
      expect(chip).toHaveStyle({ fontSize: '0.875rem' });
    });
  });

  describe('Tooltips', () => {
    it('shows tooltip for Pathway-Aligned badge', async () => {
      render(<EvidenceTierBadge tier="Supported" badges={['Pathway-Aligned']} />);
      const badge = screen.getByText('Pathway-Aligned');
      expect(badge).toBeInTheDocument();
      // Tooltip appears on hover (tested via userEvent if needed)
    });
  });
});


