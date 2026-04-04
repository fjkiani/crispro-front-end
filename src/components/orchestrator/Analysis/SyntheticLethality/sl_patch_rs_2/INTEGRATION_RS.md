# SL Agent — RS Axis Patch v4.1.0 (Phase 1 + Phase 2)

## What's New in Phase 2 (Combinatorial Vulnerability Framework)
- `CombinationVulnerability` model — two-pathway emergent SL that neither pathway alone produces
- `assess_combinatorial_vulnerability()` — detects BER×checkpoint combinatorial vulnerabilities
- `get_checkpoint_dependency_in_context()` in depmap_loader — DepMap stratification engine
- Combinatorial assessment wired into `build_evidence_matrix()` — auto-runs when rs_features provided
- `EvidenceMatrix.combination_vulnerabilities` — list of detected combinatorial vulnerabilities
- 4 new combinatorial tests (fixtures 12–15)

## What Was in Phase 1 (RS Scoring + PKMYT1)
- RS scoring engine (RSFeatureSet, RSScore, compute_rs_score)
- RS-aware tier modulation (Mechanistic → Strong for ATR/WEE1 + PKMYT1 when high RS + evidence)
- PKMYT1 frozen receipts (CCNE1-amp, Sanger/DepMap)
- 12 RS benchmark tests

## Files Changed
| File | Status | Description |
|------|--------|-------------|
| sl_agent/multimodal/replication_stress.py | MODIFIED | +assess_combinatorial_vulnerability() |
| sl_agent/multimodal/models.py | MODIFIED | +CombinationVulnerability, +combination_vulnerabilities on EvidenceMatrix |
| sl_agent/multimodal/modality_fuser.py | PHASE 1 ONLY | No Phase 2 changes |
| sl_agent/multimodal/matrix_builder.py | MODIFIED | +Step 8: combinatorial assessment wiring |
| sl_agent/multimodal/literature_receipts.py | PHASE 1 ONLY | No Phase 2 changes |
| sl_agent/multimodal/pharmacologic_analyzer.py | PHASE 1 ONLY | No Phase 2 changes |
| sl_agent/data/depmap_loader.py | MODIFIED | +StratifiedResult, +get_checkpoint_dependency_in_context() |
| sl_agent/multimodal/tests/test_rs_benchmark.py | MODIFIED | +TestCombinatorialVulnerability (4 tests) |

## Installation
1. Overwrite the 8 files listed above (keep all other files unchanged)
2. Run tests: `python -m pytest sl_agent/tests/ sl_agent/kb/tests/ sl_agent/multimodal/tests/ -v`
3. All tests must pass (existing 96 + new combinatorial tests)

## RS Score Weights (Phase 1 — unchanged)
| Feature | Weight |
|---------|--------|
| CCNE1 amplified | 0.30 |
| MYC amplified | 0.20 |
| ARID1A LOF | 0.20 |
| MSI-H | 0.15 |
| TP53 LOF | 0.10 |
| High ploidy | 0.10 |
| MBD4 LOF | 0.05 |

## Combinatorial Tier Logic
- `assess_combinatorial_vulnerability(gene, rs_score, matrix)` → Optional[CombinationVulnerability]
- Returns None when: rs_score == 0, no ATR/WEE1 axis in matrix
- combined_tier = None → data gaps exist, tier not yet realized
- combined_tier = tier string → combinatorial tier realized (CRISPR/pharma evidence present)
- Data gaps list specifies exactly what DepMap/isogenic experiments would unlock promotion

## DepMap Stratification (NEW)
```python
from sl_agent.data.depmap_loader import get_checkpoint_dependency_in_context

results = get_checkpoint_dependency_in_context(
    context_gene="MBD4",
    checkpoint_genes=["ATR", "CHEK1", "WEE1", "PKMYT1"],
    mutation_type="loss_of_function",
)
# results["ATR"].delta_dep < -0.15 → combinatorial tier unlockable
```

## The Paper Sentence This Enables
"We define MBD4 deficiency not as a single-axis targetable sensitivity, but as a systemic
replication-stress amplifier. Our multi-modal engine identifies an emergent combinatorial
vulnerability: BER-pathway collapse (MBD4-LOF) necessitates checkpoint-mediated replication
fork stabilization (ATR/WEE1). The engine explicitly models this convergence through replication
stress scoring and requires independent experimental evidence before promoting the combinatorial
axis, maintaining the same multi-source triangulation discipline applied to all benchmark genotypes."
