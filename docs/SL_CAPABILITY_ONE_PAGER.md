# Synthetic Lethality Capability One-Pager

Research Use Only.

## What The SL Engine Can Capture Right Now

The current Synthetic Lethality engine is best understood as a **receipt-backed axis classifier and tierer**. It does not yet discover arbitrary new synthetic lethality classes from scratch. Instead, it evaluates a curated set of therapeutic axes and assigns each one a backend recommendation tier using a multi-modal evidence matrix.

Current axis families:

- `cytidine_analogs`
- `parp_inhibitors`
- `atr_wee1`
- `wrn`
- `immunotherapy`
- `pkmyt1`

## Recommendation Tiers

The backend currently emits four distinct postures:

- `Validated SL therapeutic lever`
- `Strong candidate dependency axis`
- `Mechanistic candidate only`
- `Not supported / negative`

These are now surfaced explicitly in the frontend instead of being collapsed into a Roman-only evidence label.

## What We Tested

### Green

- Core multimodal unit suite: `43 passed`
- Receipt-driven matrix probing works and returns stable tier outputs for known contexts

### Red / Not Fully Green

- Frozen benchmark suite: `27 failed, 6 skipped`
- Primary benchmark failure mode: pharmacologic stratification is enabled in the benchmark path, but mutant/WT pharmacology inputs are missing, so `matrix_builder.py` fails loudly
- API test harness currently fails import in this environment because `structlog` is missing

Interpretation:

- The **SL reasoning layer is live**
- The **strict benchmark and API packaging around it are not fully green in this environment**

## Current Capture Map

### Validated

- `MBD4 -> Cytidine analogs`
- `BRCA1 -> PARP inhibitors`
- `BRCA2 -> PARP inhibitors`
- `MLH1 -> Immunotherapy`

### Strong Candidates

- `MBD4 -> Immunotherapy`
- `MLH1 -> WRN`
- `ARID1A -> ATR/WEE1`
- `CCNE1 -> PKMYT1`

### Mechanistic Only

- `MBD4 -> PARP inhibitors`
- `MBD4 -> ATR/WEE1`
- `MBD4 -> WRN`
- `BRCA1 -> ATR/WEE1`
- `BRCA1 -> Immunotherapy`
- `BRCA2 -> ATR/WEE1`
- `BRCA2 -> Immunotherapy`
- `MLH1 -> PARP inhibitors`
- `TP53 -> ATR/WEE1`
- `KRAS -> Immunotherapy`

### Not Supported / Negative In Current Registry

- `POLE` across the current registry
- `TP53` across everything except mechanistic `ATR/WEE1`
- `KRAS` across everything except mechanistic `Immunotherapy`
- `PKMYT1` outside the `CCNE1` context in current probes

## What This Means In Practice

The platform can currently capture these SL or near-SL classes:

- BER / cytidine analog vulnerability
- HRD / PARP vulnerability
- Replication-stress checkpoint vulnerability
- MSI/dMMR-linked WRN vulnerability
- Hypermutator / IO sensitivity
- CCNE1 / PKMYT1 dependency

## What The Frontend Now Does Correctly

Recent frontend cleanup brought the UI into alignment with backend semantics:

- Matrix summaries no longer overcount any positive modality as "validated"
- Therapy cards preserve backend SL posture instead of flattening to `Tier I/II/III`
- Distinct chips now surface:
  - validated
  - strong candidate
  - mechanistic-only
  - unsupported / confounded

## Current Honest Limitation

This is **not yet a universal novel-SL discovery engine**. It is strongest today as a **structured, transparent, auditable SL arsenal over a curated axis registry**.

That is still useful:

- It gives clinicians and researchers a clear separation between validated leverage and mechanistic hypothesis
- It prevents overcalling weak or confounded signals
- It provides a frontend surface that now matches the backend receipts

## Next Hardening Priorities

- Fix the frozen benchmark path so it can run without full live pharmacology inputs or provide test fixtures for those inputs
- Repair the API test harness environment so endpoint-level tests are green
- Expand curated receipt coverage to additional genes and axes
- Add more explicit combinatorial vulnerability handling beyond the current axis set
