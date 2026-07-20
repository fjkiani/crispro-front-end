/**
 * Tests for ValidationProvenancePanel — real-outcome earned-tier evidence grades.
 *
 * Verifies the panel fetches the canonical provenance registry (v3.0) and renders:
 *   - per-gene earned tiers (strongest-first ordering)
 *   - per-gene survival outcome-validation (OS Cox meta, BH-FDR) for validated markers
 *   - the honest "not clinically validated" disclaimer (regulatory boundary)
 *   - the base 5.3 genomic-logit model as DISCOVERY_ONLY (never a bare calibrated-success chip)
 *   - the v3 recalibration: Track A survival risk score + Track B parsimonious classifier
 *     (Track B legitimately reaches CALIBRATED_RUO via permutation p<0.05)
 *   - the ctDNA prognostic-only outcome channel and the PLCO honest-null outcome context
 *   - the two 5.1 gap closures (ctDNA prognostic-only, KELIM Signal 6)
 *   - graceful handling of fetch failure
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ValidationProvenancePanel from '../ValidationProvenancePanel';

// Fixture mirroring the real registry v3.0 shape: genes_52 (with per-gene survival_outcome),
// model_53 (base, DISCOVERY_ONLY), model_53_v2 (borderline), model_53_v3 (Track A + Track B),
// ctdna_outcome (prognostic-only), plco_outcome_context (honest null), analytical_validation,
// and gap_5_1.
const REGISTRY_FIXTURE = {
  registry_version: '3.0',
  genes_52: {
    MFAP4: {
      earned_tier: 'EXTERNALLY_VALIDATED_RUO',
      os_HR: null, os_CI: [null, null], os_p: null, n_exposed: null,
      expr_OR_per_SD: 1.915, expr_OR_CI: [1.134, 3.236], expr_AUROC: 0.684, expr_p: 0.0152,
      external_replication: {
        n_independent_cohorts: 17, pooled_HR_per_SD: 1.214, pooled_CI: [1.153, 1.277],
        I2_pct: 0.0, verdict: 'EXTERNALLY_VALIDATED_RUO',
      },
      survival_outcome: {
        endpoint: 'OS, per-SD z-scored expression, univariable Cox',
        pooled_HR_per_SD: 1.2263, pooled_CI: [1.154, 1.3031], p_bh_fdr: 6.96e-10,
        I2_pct: 0.0, n_independent_cohorts: 15, mean_c_index: 0.5552,
        verdict: 'OUTCOME_VALIDATED__EXTERNALLY_VALIDATED_RUO',
      },
    },
    CCNE1: {
      earned_tier: 'EXTERNALLY_VALIDATED_RUO',
      os_HR: 1.508, os_CI: [1.169, 1.944], os_p: 0.0015, n_exposed: 110,
      survival_outcome: {
        pooled_HR_per_SD: 1.128, pooled_CI: [1.0605, 1.1999], p_bh_fdr: 0.00099,
        I2_pct: 0.0, n_independent_cohorts: 16, mean_c_index: 0.5461,
        verdict: 'OUTCOME_VALIDATED__EXTERNALLY_VALIDATED_RUO',
      },
    },
    KRAS: {
      earned_tier: 'EXTERNALLY_VALIDATED_RUO',
      os_HR: null, os_CI: [null, null], n_exposed: 6,
      pooled_expr_os_retest: {
        n_cohorts: 16, pooled_HR_per_SD: 1.124, pooled_CI: [1.060, 1.191], I2_pct: 0.0,
        verdict: 'COHORT_VALIDATED_RUO',
      },
      survival_outcome: {
        pooled_HR_per_SD: 1.1202, pooled_CI: [1.0371, 1.2099], p_bh_fdr: 0.0147,
        I2_pct: 17.5, n_independent_cohorts: 14, mean_c_index: 0.545,
        verdict: 'OUTCOME_VALIDATED__EXTERNALLY_VALIDATED_RUO',
      },
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
  model_53_v2: {
    logit_resistance_probability_expr: {
      verdict: 'CALIBRATED_RUO_BORDERLINE',
      n: 518, events: 52, oof_auc: 0.597, oof_auc_ci95: [0.508, 0.684],
      permutation_p: 0.055,
      honesty_statement: 'Bootstrap OOF-AUC CI stably excludes 0.5 but permutation p=0.055 does NOT confirm; labeled CALIBRATED_RUO_BORDERLINE, NOT robustly calibrated. NOT clinically validated.',
    },
  },
  model_53_v3: {
    track_A_survival_risk_score: {
      derivation: 'TCGA.RNASeqV2_eset',
      locked_tertile_cutoffs: [-0.1667, 0.1404],
      pooled_c_index: { mean_c_index: 0.5544, ci: [0.5312, 0.5813], n_heldout_cohorts: 9, 'ci_excludes_0.5': true },
    },
    track_B_parsimonious_resistance_classifier: {
      feature_set: ['MFAP4', 'KRAS', 'CCNE1', 'NF1', 'PTEN'],
      n_cohorts: 5, oof_auc: 0.6438, oof_auc_ci: [0.5578, 0.7207],
      brier: 0.2272, permutation_p: 0.004975, n_events: 52, raw_epv: 10.4,
      locked_threshold: 0.5, 'ci_excludes_0.5': true, verdict: 'CALIBRATED_RUO',
    },
    honesty: 'Track A features derived on TCGA and LOCKED; evaluated only on independent held-out cohorts. Track B uses independent cohorts only. No clinically validated claim.',
  },
  ctdna_outcome: {
    source: 'Paracchini et al. 2026, ESMO Open 11(3):106087 (MITO16a/MaNGO-OV2a), reproduced in silico',
    n_patients: 167,
    cox_results: {
      pfs: { tf: { hr_per_sd: 1.3354, ci: [1.1523, 1.5477], p: 0.0001216, c_index: 0.5829 } },
      os: { tf: { hr_per_sd: 1.256, ci: [1.08, 1.46], p: 0.003, c_index: 0.564 } },
    },
    locked_group_km: { pfs_logrank_p: 0.00037, os_logrank_p: 0.014 },
    prognostic_channel_verdict: 'OUTCOME_VALIDATED_PROGNOSTIC__EXTERNALLY_VALIDATED_RUO',
    decision_scope: 'PROGNOSTIC ONLY, WIRED_PROGNOSTIC_ONLY_V1, structurally excluded from resistance/routing; cutoffs exploratory; NOT clinically validated.',
  },
  plco_outcome_context: {
    scope: 'SCREENING cohort outcome context; NOT a treatment-resistance predictor; NEVER clinically validated.',
    n_joined_cases: 202,
    analysis_1_stage: { auroc_advanced_by_logslope: 0.531, mwu_p: 0.5214, tier: 'OUTCOME_CONTEXT_NULL_RUO' },
    analysis_2_survival_after_dx: { cox_HR_per_SD_logslope: 1.057, ci95: [0.923, 1.209], p: 0.423, c_index: 0.503, tier: 'OUTCOME_CONTEXT_NULL_RUO' },
    screening_anchor_unchanged: { log_slope_auroc_incident_cancer: 0.652, ci95: [0.605, 0.695] },
  },
  analytical_validation: {
    disclaimer: 'IN-SILICO analytical validation (precision/reproducibility/robustness analogs). NOT wet-lab analytical validation (LoD/LoQ/precision) under a quality system. RUO.',
    mfap4_marker: { precision_by_normalization: { zscore: { cv_pct: 2.9917 } } },
    ctdna_grouping: { precision: { tf_os_c_index: { cv_pct: 4.7719 } } },
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
    // Regulatory boundary: the phrase "clinically validated" appears ONLY inside a negation.
    const flat = container.textContent.replace(/\s+/g, ' ');
    expect(flat).toMatch(/No component is labeled .*clinically validated/i);
    expect(flat).toMatch(/strongest honest/i);
  });

  it('renders per-gene earned tiers including validated and tested-null cases', async () => {
    render(<ValidationProvenancePanel />);
    expect(await screen.findByText('CCNE1')).toBeInTheDocument();
    expect(screen.getByText('MFAP4')).toBeInTheDocument();
    expect(screen.getByText('TP53')).toBeInTheDocument();
    // Three markers reach EXTERNALLY_VALIDATED_RUO in this fixture.
    expect(screen.getAllByText('EXTERNALLY_VALIDATED_RUO').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('COHORT_TESTED_NULL')).toBeInTheDocument();
    expect(screen.getByText('LITERATURE_ONLY')).toBeInTheDocument();
  });

  it('surfaces the per-gene survival outcome-validation (OS HR/SD with BH-FDR q)', async () => {
    const { container } = render(<ValidationProvenancePanel />);
    await screen.findByText('MFAP4');
    const flat = container.textContent.replace(/\s+/g, ' ');
    // MFAP4 outcome-validated survival column: OS HR/SD 1.2263 and its q value.
    expect(flat).toMatch(/OS HR\/SD 1\.2263/);
    expect(flat).toMatch(/q=7\.0e-10/);
  });

  it('surfaces the CCNE1 OS hazard ratio with CI', async () => {
    render(<ValidationProvenancePanel />);
    expect(await screen.findByText(/OS HR 1\.508/)).toBeInTheDocument();
    expect(screen.getByText(/1\.169/)).toBeInTheDocument();
  });

  it('shows the base 5.3 model as DISCOVERY_ONLY but Track B as legitimately CALIBRATED_RUO', async () => {
    const { container } = render(<ValidationProvenancePanel />);
    // Base 5.3 genomic-logit model: DISCOVERY_ONLY.
    expect(await screen.findByText(/DISCOVERY_ONLY — NOT CALIBRATED/i)).toBeInTheDocument();
    expect(screen.getByText(/OOF AUC 0\.489/)).toBeInTheDocument();
    // v2 pooled model surfaces its honest borderline verdict + permutation caveat.
    expect(screen.getByText('CALIBRATED_RUO_BORDERLINE')).toBeInTheDocument();
    expect(screen.getByText(/permutation p=0\.055/)).toBeInTheDocument();
    // v3 Track B parsimonious classifier legitimately clears the bar (permutation p<0.05):
    // CALIBRATED_RUO here is EARNED, not an overclaim.
    expect(screen.getByText('CALIBRATED_RUO')).toBeInTheDocument();
    const flat = container.textContent.replace(/\s+/g, ' ');
    expect(flat).toMatch(/permutation p=0\.005/);
    // The honesty statement still explicitly denies clinical validation.
    expect(screen.getByText(/NOT clinically validated/i)).toBeInTheDocument();
  });

  it('shows the v3 Track A survival risk score held-out C-index', async () => {
    const { container } = render(<ValidationProvenancePanel />);
    await screen.findByText(/Track A/i);
    const flat = container.textContent.replace(/\s+/g, ' ');
    expect(flat).toMatch(/held-out pooled C-index 0\.554/);
  });

  it('shows the ctDNA prognostic-only channel and the PLCO honest-null context', async () => {
    const { container } = render(<ValidationProvenancePanel />);
    await screen.findByText(/ctDNA outcome channel/i);
    const flat = container.textContent.replace(/\s+/g, ' ');
    expect(flat).toMatch(/PROGNOSTIC ONLY/i);
    // PLCO honest null: incident-cancer screening AUROC preserved, outcome context null.
    expect(screen.getByText('OUTCOME_CONTEXT_NULL_RUO')).toBeInTheDocument();
    expect(flat).toMatch(/screening AUROC 0\.652/);
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
