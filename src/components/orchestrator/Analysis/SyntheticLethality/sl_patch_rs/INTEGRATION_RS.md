# SL Agent — RS Axis Patch (v4.0.0 → v4.1.0)

## What's New
- Replication Stress (RS) scoring axis (ATR/WEE1 and PKMYT1)
- RS-aware tier modulation: Mechanistic → Strong when rs_score.level=="high" AND (CRISPR or pharma evidence present)
- PKMYT1 frozen receipts: CCNE1-amp → PKMYT1 dependency (Sanger/DepMap); RP-6306 Phase I ongoing
- RS score is fully transparent — all weights documented in replication_stress.py

## Files Changed
| File | Status | Description |
|------|--------|-------------|
| sl_agent/multimodal/replication_stress.py | NEW | RSFeatureSet, RSScore, compute_rs_score() |
| sl_agent/multimodal/models.py | MODIFIED | +PKMYT1 axis, +rs_features field, +rs_score field |
| sl_agent/multimodal/modality_fuser.py | MODIFIED | RS-aware tier modulation |
| sl_agent/multimodal/matrix_builder.py | MODIFIED | RS wiring, PKMYT1 axis metadata |
| sl_agent/multimodal/literature_receipts.py | MODIFIED | PKMYT1 frozen receipts |
| sl_agent/multimodal/pharmacologic_analyzer.py | MODIFIED | PKMYT1 inhibitor entries |
| sl_agent/multimodal/tests/test_rs_benchmark.py | NEW | RS unit + benchmark + regression tests |

## Installation
1. Overwrite the 7 files listed above (keep all other files unchanged)
2. Run tests: `python -m pytest sl_agent/tests/ sl_agent/kb/tests/ sl_agent/multimodal/tests/ -v`
3. All tests must pass (existing 84 + new RS tests)

## RS Score Weights
| Feature | Weight |
|---------|--------|
| CCNE1 amplified | 0.30 |
| MYC amplified | 0.20 |
| ARID1A LOF | 0.20 |
| MSI-H | 0.15 |
| TP53 LOF | 0.10 |
| High ploidy | 0.10 |
| MBD4 LOF | 0.05 |

Thresholds: high ≥ 0.40 | moderate ≥ 0.20 | low > 0.00 | none = 0.0

## RS Tier Promotion Rules (Strict)
- RS modulation is ATR/WEE1 and PKMYT1 ONLY
- Promotion: Mechanistic → Strong ONLY when (rs_score.level == "high") AND (CRISPR+ OR pharma+)
- RS CANNOT promote to Validated
- MBD4 alone → rs=0.05 (low) → no promotion
- All other axes: unaffected by RS score
