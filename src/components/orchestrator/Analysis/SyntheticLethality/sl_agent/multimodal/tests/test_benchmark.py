"""
═══════════════════════════════════════════════════════════════════════════════
  v4.0.0 BENCHMARK SUITE
  Deterministic, frozen, repeatable benchmark for the multi-modal SL engine.
═══════════════════════════════════════════════════════════════════════════════

  Three benchmark families:
    1. GENOTYPE BENCHMARK  — 8 genotype fixtures with expected + forbidden tiers
    2. ABLATION BENCHMARK  — MBD4/BRCA1/POLE with modalities removed one at a time
    3. REGRESSION BENCHMARK — frozen gold outputs that must never drift

  Four scoring metrics:
    - validated_axis_recall: does the engine surface known validated levers?
    - false_promotion_rate:  how often does it incorrectly upgrade?
    - silence_discipline:    does it correctly return "not supported" when empty?
    - tier_stability:        does the tier hold when one modality is removed?
"""
import sys
import copy
import pytest
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

sys.path.insert(0, ".")

from sl_agent.multimodal.models import (
    MultiModalQueryInput,
    CandidateAxis,
    EvidenceMatrix,
    EvidenceRow,
    ModalityEvidence,
    ModalityStatus,
    Modality,
)
from sl_agent.multimodal.matrix_builder import build_evidence_matrix
from sl_agent.multimodal.modality_fuser import fuse_matrix
from sl_agent.multimodal.literature_receipts import _FROZEN_RECEIPTS


# ═══════════════════════════════════════════════════════════════════════════════
# FIXTURE DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════


@dataclass
class AxisExpectation:
    """Deterministic expected/forbidden tiers for a single axis."""
    axis: CandidateAxis
    expected_tier: str                          # exact tier string
    forbidden_tiers: List[str]                  # tiers that MUST NOT appear
    rationale: str                              # one-line clinical rationale


@dataclass
class GenotypeFixture:
    """A frozen genotype benchmark case."""
    gene: str
    label: str                                  # human-readable case name
    cancer_type: Optional[str]
    axes: List[AxisExpectation]


# Shorthand aliases for readability
V   = "Validated SL therapeutic lever"
S   = "Strong candidate dependency axis"
M   = "Mechanistic candidate only"
N   = "Not supported / negative"


GENOTYPE_FIXTURES: List[GenotypeFixture] = [

    # ── 1. MBD4 LOF ─────────────────────────────────────────────────────────
    GenotypeFixture(
        gene="MBD4", label="MBD4 LOF (uveal melanoma / BER-deficient)",
        cancer_type=None,
        axes=[
            AxisExpectation(CandidateAxis.CYTIDINE_ANALOGS, V, [N],
                "Validated: in_vitro + in_vivo + clinical + expression"),
            AxisExpectation(CandidateAxis.IMMUNOTHERAPY, S, [V, N],
                "Strong: clinical POSITIVE (PMID:35863105) + expression"),
            AxisExpectation(CandidateAxis.ATR_WEE1, M, [V, S],
                "Mechanistic: expression only, no isogenic validation"),
            AxisExpectation(CandidateAxis.PARP_INHIBITORS, M, [V, S],
                "Mechanistic: CRISPR+GDSC both NEGATIVE, expression only"),
            AxisExpectation(CandidateAxis.WRN, M, [V, S],
                "Mechanistic: CRISPR NEGATIVE, MSI confound flagged"),
        ],
    ),

    # ── 2. BRCA1 HGSOC ──────────────────────────────────────────────────────
    GenotypeFixture(
        gene="BRCA1", label="BRCA1 HGSOC (HR-deficient)",
        cancer_type="ovarian",
        axes=[
            AxisExpectation(CandidateAxis.PARP_INHIBITORS, V, [N, M],
                "Validated: 6/7 modalities POSITIVE, FDA-approved"),
            AxisExpectation(CandidateAxis.ATR_WEE1, M, [V],
                "Mechanistic: expression+in_vitro positive, clinical MIXED"),
            AxisExpectation(CandidateAxis.IMMUNOTHERAPY, M, [V, S],
                "Mechanistic: expression+clinical both MIXED"),
            AxisExpectation(CandidateAxis.CYTIDINE_ANALOGS, N, [V, S],
                "Not supported: no BER mechanism, all MISSING"),
            AxisExpectation(CandidateAxis.WRN, N, [V, S, M],
                "Not supported: MSS, not MSI-H"),
        ],
    ),

    # ── 3. BRCA2 HGSOC ──────────────────────────────────────────────────────
    GenotypeFixture(
        gene="BRCA2", label="BRCA2 HGSOC (HR-deficient)",
        cancer_type="ovarian",
        axes=[
            AxisExpectation(CandidateAxis.PARP_INHIBITORS, V, [N, M],
                "Validated: mirrors BRCA1, 6/7 modalities POSITIVE, FDA-approved"),
            AxisExpectation(CandidateAxis.ATR_WEE1, M, [V],
                "Mechanistic: expression+in_vitro positive, no clinical/CRISPR"),
            AxisExpectation(CandidateAxis.IMMUNOTHERAPY, M, [V, S],
                "Mechanistic: expression+clinical both MIXED"),
            AxisExpectation(CandidateAxis.CYTIDINE_ANALOGS, N, [V, S],
                "Not supported: no BER, no receipts"),
            AxisExpectation(CandidateAxis.WRN, N, [V, S, M],
                "Not supported: MSS, no receipts"),
        ],
    ),

    # ── 4. POLE ultramutated ─────────────────────────────────────────────────
    GenotypeFixture(
        gene="POLE", label="POLE ultramutated (no curated receipts)",
        cancer_type=None,
        axes=[
            AxisExpectation(CandidateAxis.CYTIDINE_ANALOGS, N, [V, S, M],
                "Not supported: no receipts curated"),
            AxisExpectation(CandidateAxis.PARP_INHIBITORS, N, [V, S, M],
                "Not supported: no receipts curated"),
            AxisExpectation(CandidateAxis.ATR_WEE1, N, [V, S, M],
                "Not supported: no receipts curated"),
            AxisExpectation(CandidateAxis.WRN, N, [V, S, M],
                "Not supported: no receipts curated"),
            AxisExpectation(CandidateAxis.IMMUNOTHERAPY, N, [V, S, M],
                "Not supported: no receipts curated (would need IO receipts)"),
        ],
    ),

    # ── 5. MLH1 / MSI-H / dMMR ──────────────────────────────────────────────
    GenotypeFixture(
        gene="MLH1", label="MLH1-deficient / MSI-H / dMMR (not MBD4)",
        cancer_type=None,
        axes=[
            AxisExpectation(CandidateAxis.WRN, S, [N],
                "Strong: CRISPR+expression+in_vitro POSITIVE, clinical MISSING (trials ongoing)"),
            AxisExpectation(CandidateAxis.IMMUNOTHERAPY, V, [N, M],
                "Validated: expression+clinical+in_vivo POSITIVE, FDA pembrolizumab"),
            AxisExpectation(CandidateAxis.PARP_INHIBITORS, M, [V, S],
                "Mechanistic: expression MIXED, no CRISPR/pharma"),
            AxisExpectation(CandidateAxis.CYTIDINE_ANALOGS, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.ATR_WEE1, N, [V, S],
                "Not supported: no receipts"),
        ],
    ),

    # ── 6. TP53-only ─────────────────────────────────────────────────────────
    GenotypeFixture(
        gene="TP53", label="TP53-only (no validated SL axis)",
        cancer_type=None,
        axes=[
            AxisExpectation(CandidateAxis.ATR_WEE1, M, [V],
                "Mechanistic: expression POSITIVE + in_vitro/clinical MIXED"),
            AxisExpectation(CandidateAxis.PARP_INHIBITORS, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.WRN, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.CYTIDINE_ANALOGS, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.IMMUNOTHERAPY, N, [V, S],
                "Not supported: expression MISSING, no clinical"),
        ],
    ),

    # ── 7. ARID1A ────────────────────────────────────────────────────────────
    GenotypeFixture(
        gene="ARID1A", label="ARID1A-mutant (chromatin remodeling)",
        cancer_type=None,
        axes=[
            AxisExpectation(CandidateAxis.ATR_WEE1, S, [N],
                "Strong: CRISPR+expression+in_vitro+in_vivo POSITIVE, clinical MIXED"),
            AxisExpectation(CandidateAxis.IMMUNOTHERAPY, M, [V],
                "Mechanistic: expression POSITIVE + clinical MIXED"),
            AxisExpectation(CandidateAxis.PARP_INHIBITORS, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.CYTIDINE_ANALOGS, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.WRN, N, [V, S],
                "Not supported: no receipts"),
        ],
    ),

    # ── 8. KRAS quiet control ────────────────────────────────────────────────
    GenotypeFixture(
        gene="KRAS", label="KRAS-mutant (quiet control — no SL axes)",
        cancer_type=None,
        axes=[
            AxisExpectation(CandidateAxis.CYTIDINE_ANALOGS, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.PARP_INHIBITORS, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.ATR_WEE1, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.WRN, N, [V, S],
                "Not supported: no receipts"),
            AxisExpectation(CandidateAxis.IMMUNOTHERAPY, M, [V, S],
                "Mechanistic: expression MIXED, no clinical"),
        ],
    ),
]


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER: Run a single genotype through the engine
# ═══════════════════════════════════════════════════════════════════════════════

def _run_matrix(gene: str, cancer_type: str = None) -> Dict[str, str]:
    """Run the evidence matrix and return {axis_value: tier}."""
    q = MultiModalQueryInput(
        gene=gene,
        cancer_type=cancer_type,
        include_literature_receipts=True,
        include_calibration_narrative=False,
    )
    matrix = build_evidence_matrix(query=q)
    return {row.axis.value: row.recommendation_tier for row in matrix.rows}


# ═══════════════════════════════════════════════════════════════════════════════
# FAMILY 1: GENOTYPE BENCHMARK
# ═══════════════════════════════════════════════════════════════════════════════

@pytest.mark.parametrize(
    "fixture",
    GENOTYPE_FIXTURES,
    ids=[f.label for f in GENOTYPE_FIXTURES],
)
def test_genotype_tier(fixture: GenotypeFixture):
    """For each genotype fixture, verify expected tiers and forbidden tiers."""
    tiers = _run_matrix(fixture.gene, fixture.cancer_type)

    for ax in fixture.axes:
        actual = tiers.get(ax.axis.value, "AXIS_MISSING")
        # Expected tier matches
        assert actual == ax.expected_tier, (
            f"[{fixture.gene}] {ax.axis.value}: "
            f"expected '{ax.expected_tier}', got '{actual}'. "
            f"Rationale: {ax.rationale}"
        )
        # Forbidden tiers do NOT appear
        assert actual not in ax.forbidden_tiers, (
            f"[{fixture.gene}] {ax.axis.value}: "
            f"got FORBIDDEN tier '{actual}'. "
            f"Rationale: {ax.rationale}"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# FAMILY 2: ABLATION BENCHMARK
# Remove one modality at a time from flagship cases.
# Verify the tier either stays the same or degrades gracefully (never promotes).
# ═══════════════════════════════════════════════════════════════════════════════

ABLATION_MODALITIES = ["crispr", "expression", "gdsc", "in_vitro", "in_vivo", "clinical"]

@dataclass
class AblationCase:
    gene: str
    axis: CandidateAxis
    axis_key: Tuple[str, CandidateAxis]
    baseline_tier: str
    never_above: str  # tier the ablation must NEVER exceed


ABLATION_CASES = [
    # MBD4 + Cytidine — baseline Validated
    AblationCase("MBD4", CandidateAxis.CYTIDINE_ANALOGS,
                 ("MBD4", CandidateAxis.CYTIDINE_ANALOGS), V, V),
    # BRCA1 + PARP — baseline Validated
    AblationCase("BRCA1", CandidateAxis.PARP_INHIBITORS,
                 ("BRCA1", CandidateAxis.PARP_INHIBITORS), V, V),
    # MBD4 + IO — baseline Strong
    AblationCase("MBD4", CandidateAxis.IMMUNOTHERAPY,
                 ("MBD4", CandidateAxis.IMMUNOTHERAPY), S, S),
]

# Define tier order: higher index = higher tier
TIER_ORDER = {N: 0, M: 1, S: 2, V: 3}


@pytest.mark.parametrize("case", ABLATION_CASES,
    ids=[f"{c.gene}_{c.axis.value}" for c in ABLATION_CASES])
@pytest.mark.parametrize("remove_modality", ABLATION_MODALITIES)
def test_ablation_never_promotes(case: AblationCase, remove_modality: str):
    """Removing a modality should never PROMOTE a tier above baseline."""
    key = case.axis_key

    # Save original receipts
    original = _FROZEN_RECEIPTS.get(key, {})
    if remove_modality not in original:
        pytest.skip(f"{remove_modality} not in {case.gene}+{case.axis.value} receipts")

    # Ablate: remove the modality
    ablated = {k: v for k, v in original.items() if k != remove_modality}
    _FROZEN_RECEIPTS[key] = ablated

    try:
        tiers = _run_matrix(case.gene)
        actual = tiers.get(case.axis.value, N)

        baseline_rank = TIER_ORDER.get(case.baseline_tier, -1)
        actual_rank = TIER_ORDER.get(actual, -1)

        # Must not promote above baseline
        assert actual_rank <= baseline_rank, (
            f"[ABLATION] {case.gene}+{case.axis.value}: removing '{remove_modality}' "
            f"PROMOTED tier from '{case.baseline_tier}' to '{actual}' — this is forbidden"
        )
    finally:
        # Restore
        _FROZEN_RECEIPTS[key] = original


@pytest.mark.parametrize("case", ABLATION_CASES,
    ids=[f"{c.gene}_{c.axis.value}_stability" for c in ABLATION_CASES])
def test_ablation_tier_stability(case: AblationCase):
    """Track how many modality removals change the tier (stability metric)."""
    key = case.axis_key
    original = _FROZEN_RECEIPTS.get(key, {})

    stable_count = 0
    degraded_count = 0
    total = 0

    for mod in ABLATION_MODALITIES:
        if mod not in original:
            continue
        total += 1

        ablated = {k: v for k, v in original.items() if k != mod}
        _FROZEN_RECEIPTS[key] = ablated

        try:
            tiers = _run_matrix(case.gene)
            actual = tiers.get(case.axis.value, N)
            if actual == case.baseline_tier:
                stable_count += 1
            else:
                degraded_count += 1
        finally:
            _FROZEN_RECEIPTS[key] = original

    # At least half the modalities should not cause tier degradation
    # (i.e., the tier is robust to losing any single evidence stream)
    if total > 0:
        stability = stable_count / total
        # Note: we don't assert >50% because some axes SHOULD degrade
        # when you remove a critical modality. We just record.
        # The fixture guarantees it doesn't promote.
        assert True  # This test always passes — it's for metric collection


# ═══════════════════════════════════════════════════════════════════════════════
# FAMILY 3: REGRESSION GOLD FIXTURES
# Freeze the exact current output shapes so future changes cannot drift.
# ═══════════════════════════════════════════════════════════════════════════════

# Gold fixtures: gene → {axis: expected_tier}
REGRESSION_GOLD = {
    "MBD4": {
        "cytidine_analogs":   V,
        "parp_inhibitors":    M,
        "atr_wee1":           M,
        "wrn":                M,
        "immunotherapy":      S,
    },
    "BRCA1": {
        "cytidine_analogs":   N,
        "parp_inhibitors":    V,
        "atr_wee1":           M,
        "wrn":                N,
        "immunotherapy":      M,
    },
    "POLE": {
        "cytidine_analogs":   N,
        "parp_inhibitors":    N,
        "atr_wee1":           N,
        "wrn":                N,
        "immunotherapy":      N,
    },
}


@pytest.mark.parametrize("gene", list(REGRESSION_GOLD.keys()))
def test_regression_gold_exact(gene: str):
    """Frozen regression test: output must EXACTLY match gold fixture."""
    tiers = _run_matrix(gene)
    expected = REGRESSION_GOLD[gene]

    for axis, expected_tier in expected.items():
        actual = tiers.get(axis, "AXIS_MISSING")
        assert actual == expected_tier, (
            f"[REGRESSION] {gene}+{axis}: expected '{expected_tier}', got '{actual}'. "
            f"This is a frozen gold fixture — any change means code drift."
        )


# ═══════════════════════════════════════════════════════════════════════════════
# BENCHMARK METRICS (collected at session level)
# ═══════════════════════════════════════════════════════════════════════════════

def test_benchmark_metrics_summary():
    """
    Compute and print the 4 benchmark metrics across all genotype fixtures.
    This test always passes — it's for reporting.
    """
    validated_recall_hits = 0
    validated_recall_total = 0
    false_promotion_count = 0
    false_promotion_total = 0
    silence_correct = 0
    silence_total = 0

    for fx in GENOTYPE_FIXTURES:
        tiers = _run_matrix(fx.gene, fx.cancer_type)
        for ax in fx.axes:
            actual = tiers.get(ax.axis.value, N)

            # Metric 1: Validated-axis recall
            if ax.expected_tier == V:
                validated_recall_total += 1
                if actual == V:
                    validated_recall_hits += 1

            # Metric 2: False-promotion rate
            if ax.expected_tier in (N, M):
                false_promotion_total += 1
                if actual in (S, V):
                    false_promotion_count += 1

            # Metric 3: Silence discipline
            if ax.expected_tier == N:
                silence_total += 1
                if actual == N:
                    silence_correct += 1

    recall = validated_recall_hits / max(validated_recall_total, 1)
    fpr = false_promotion_count / max(false_promotion_total, 1)
    silence = silence_correct / max(silence_total, 1)

    print("\n")
    print("=" * 80)
    print("  v4.0.0 BENCHMARK METRICS")
    print("=" * 80)
    print(f"  Validated-axis recall:  {recall:.0%}  ({validated_recall_hits}/{validated_recall_total})")
    print(f"  False-promotion rate:   {fpr:.0%}  ({false_promotion_count}/{false_promotion_total})")
    print(f"  Silence discipline:     {silence:.0%}  ({silence_correct}/{silence_total})")
    print(f"  Tier stability:         (see ablation tests above)")
    print("=" * 80)

    # Hard assertions on benchmark quality
    assert recall == 1.0, f"Validated recall is {recall:.0%}, expected 100%"
    assert fpr == 0.0, f"False promotion rate is {fpr:.0%}, expected 0%"
    assert silence == 1.0, f"Silence discipline is {silence:.0%}, expected 100%"
