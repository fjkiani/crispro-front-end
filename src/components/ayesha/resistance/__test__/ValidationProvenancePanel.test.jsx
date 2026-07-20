/**
 * Tests for ValidationProvenancePanel — real-outcome earned-tier evidence grades.
 *
 * Verifies the panel fetches the canonical provenance registry and renders:
 *   - per-gene earned tiers (strongest-first ordering)
 *   - the honest "not clinically validated" disclaimer (regulatory boundary)
 *   - the 5.3 DISCOVERY_ONLY (not calibrated) verdict
 *   - the two 5.1 gap closures (ctDNA prognostic-only, KELIM Signal 6)
 *   - graceful handling of fetch failure
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ValidationProvenancePanel from '../ValidationProvenancePanel';

// Minimal fixture mirroring the real registry shape (subset of genes_52 + model_53 + gap_5_1).
const REGISTRY_FIXTURE = {
  registry_version: '1.0',
  genes_52: {
    CCNE1: {
      earned_tier: 'COHORT_VALIDATED_RUO',
      os_HR: 1.508, os_CI: [1.169, 1.944], os_p: 0.0015, n_exposed: 110,
    },
    MFAP4: {
      earned_tier: 'COHORT_VALIDATED_RUO',
      os_HR: null, os_CI: [null, null], os_p: null, n_exposed: null,
      expr_OR_per_SD: 1.915, expr_OR_CI: [1.134, 3.236], expr_AUROC: 0.684, expr_p: 0.0152,
    },
    TP53: {
      earned_tier: 'COHORT_TESTED_NULL',
      os_HR: 1.023, os_CI: [0.822, 1.273], os_p: 0.8391, n_exposed: 370,
    },
    SHLD1: { earned_tier: 'LITERATURE_ONLY', os_HR: null, os_CI: [null, null], n_exposed: null },
  },
  model_53: {
    logit_resistance_probability: {
      verdict: 'DISCOVERY_ONLY — NOT upgraded to CALIBRATED_RUO',
      reason: 'OOF AUC 95% CI spans 0.5 on both attempts (honest refusal to overclaim)',
      prespecified_genomic_logit_TCGA: { n: 571, n_resistant: 44, oof_auc: 0.489, oof_auc_ci95: [0.396, 0.586], brier: 0.071 },
      refit_coefficients_real: { intercept: -2.5694, b_brca: 0.092, b_mapk: 0.8056 },
    },
  },
  gap_5_1: {
    'RES-OV-P0-006_ctdna': { status: 'CLOSED — WIRED_PROGNOSTIC_ONLY_V1' },
    'RES-OV-P0-009_kelim_signal6': { status: 'CLOSED — reads kelim_obj.k' },
  },
};

describe('ValidationProvenancePanel', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(REGISTRY_FIXTURE) })
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the honest header and the not-clinically-validated disclaimer', async () => {
    const { container } = render(<ValidationProvenancePanel />);
    expect(await screen.findByText(/Real-Outcome Validation/i)).toBeInTheDocument();
    // Regulatory boundary: the phrase "clinically validated" appears ONLY inside the negation.
    // The caption is split into multiple text nodes by &ldquo;/&rdquo; entities, so normalise
    // the whole subtree's text content and assert on the flattened string.
    const flat = container.textContent.replace(/\s+/g, ' ');
    expect(flat).toMatch(/No component is labeled .*clinically validated/i);
    expect(flat).toMatch(/strongest honest evidence grade/i);
  });

  it('renders per-gene earned tiers including the validated and tested-null cases', async () => {
    render(<ValidationProvenancePanel />);
    expect(await screen.findByText('CCNE1')).toBeInTheDocument();
    expect(screen.getByText('MFAP4')).toBeInTheDocument();
    expect(screen.getByText('TP53')).toBeInTheDocument();
    // Tier chips render the raw tier token.
    expect(screen.getAllByText('COHORT_VALIDATED_RUO').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('COHORT_TESTED_NULL')).toBeInTheDocument();
    expect(screen.getByText('LITERATURE_ONLY')).toBeInTheDocument();
  });

  it('surfaces the CCNE1 OS hazard ratio with CI', async () => {
    render(<ValidationProvenancePanel />);
    expect(await screen.findByText(/OS HR 1\.508/)).toBeInTheDocument();
    expect(screen.getByText(/1\.169/)).toBeInTheDocument();
  });

  it('shows the 5.3 DISCOVERY_ONLY (not calibrated) verdict, never CALIBRATED', async () => {
    render(<ValidationProvenancePanel />);
    expect(await screen.findByText(/DISCOVERY_ONLY — NOT CALIBRATED/i)).toBeInTheDocument();
    expect(screen.getByText(/OOF AUC 0\.489/)).toBeInTheDocument();
    // Must not claim calibration succeeded.
    expect(screen.queryByText(/CALIBRATED_RUO/)).not.toBeInTheDocument();
  });

  it('shows both 5.1 gap closures', async () => {
    render(<ValidationProvenancePanel />);
    expect(await screen.findByText(/WIRED_PROGNOSTIC_ONLY_V1/)).toBeInTheDocument();
    expect(screen.getByText(/reads kelim_obj\.k/)).toBeInTheDocument();
  });

  it('handles fetch failure gracefully', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) }));
    render(<ValidationProvenancePanel />);
    await waitFor(() => expect(screen.getByText(/Validation provenance unavailable/i)).toBeInTheDocument());
  });
});
