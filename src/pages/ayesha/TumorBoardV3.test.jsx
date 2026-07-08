/**
 * Smoke test for TumorBoardV3 shell (Milestone 1).
 * Confirms the shell renders without crashing, all six panel slots are present,
 * and the AK / HGSOC / Stage IV header wording is in place.
 */

import { render, screen } from '@testing-library/react';
import TumorBoardV3 from './TumorBoardV3';

describe('TumorBoardV3 shell (M1)', () => {
  test('renders AK HGSOC Stage IV header (single h1)', () => {
    render(<TumorBoardV3 />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/AK/);
    expect(h1.textContent).toMatch(/60F/);
    expect(h1.textContent).toMatch(/HGSOC/);
    expect(h1.textContent).toMatch(/Stage IV surveillance/i);
  });

  test('renders all six panel slots', () => {
    render(<TumorBoardV3 />);
    expect(screen.getByTestId('panel-slot-bundle-context')).toBeInTheDocument();
    expect(screen.getByTestId('panel-slot-imaging')).toBeInTheDocument();
    expect(screen.getByTestId('panel-slot-ct-nodule')).toBeInTheDocument();
    expect(screen.getByTestId('panel-slot-biopsy-ner')).toBeInTheDocument();
    expect(screen.getByTestId('panel-slot-elo-ranking')).toBeInTheDocument();
    expect(screen.getByTestId('panel-slot-synthesis')).toBeInTheDocument();
  });

  test('renders provenance chip slot', () => {
    render(<TumorBoardV3 />);
    expect(screen.getByTestId('provenance-chip-slot')).toBeInTheDocument();
  });
});
