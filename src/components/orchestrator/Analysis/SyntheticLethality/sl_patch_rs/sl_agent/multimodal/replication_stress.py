"""
Replication Stress (RS) Scoring Module — SL Agent v4.1

Computes a transparent, weighted RS score from patient genomic features.
Used exclusively to modulate tier promotion for ATR/WEE1 and PKMYT1 axes.

Design constraints (DO NOT RELAX):
  - MBD4 alone (0.05) → RS = "low". Cannot reach "moderate" or "high".
  - RS can NEVER promote an axis directly to "Validated".
  - RS can only promote Mechanistic → Strong, AND only when CRISPR or pharma
    evidence already exists (RS is a co-factor, not a standalone promoter).
  - All weights and thresholds are explicitly documented here.

Documented weights (sum to 1.10 — intentionally > 1 to allow partial feature
scores while keeping normalized output in 0.0–1.0 range):
  CCNE1_amp   0.30  strongest single RS driver (replication origin over-firing)
  MYC_amp     0.20  oncogene-induced replication stress
  ARID1A_LOF  0.20  chromatin remodeling loss → fork instability
  MSI_H       0.15  dMMR → elevated RS, fork stalling at microsatellites
  TP53_LOF    0.10  G1/S checkpoint loss → replication without arrest
  high_ploidy 0.10  genome doubling → centrosome stress, mitotic RS
  MBD4_LOF    0.05  BER deficiency → modest fork lesion accumulation

Level thresholds:
  score ≥ 0.40 → "high"
  score ≥ 0.20 → "moderate"
  score >  0.00 → "low"
  score == 0.00 → "none"

Validation cases (enforced by test_rs_benchmark.py):
  MBD4 alone                           → 0.05  → "low"
  MBD4 + TP53                          → 0.15  → "low"
  MBD4 + TP53 + ARID1A                 → 0.35  → "moderate"
  CCNE1 + TP53                         → 0.40  → "high"
  CCNE1 + MYC + ARID1A                 → 0.70  → "high"  (capped at 1.0)
"""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


# ── Feature set ───────────────────────────────────────────────────────────────

class RSFeatureSet(BaseModel):
    """
    Binary + optional continuous genomic features used to compute RS score.
    All boolean fields default False (absent).
    """
    # Binary features (each contributes its documented weight if True)
    ccne1_amplified: bool = Field(False, description="CCNE1 amp → premature S-phase / origin over-firing")
    myc_amplified:   bool = Field(False, description="MYC amp → transcription-replication collision, RS")
    arid1a_lof:      bool = Field(False, description="Chromatin remodeling loss → fork instability")
    tp53_lof:        bool = Field(False, description="G1/S checkpoint loss → cells enter S-phase with damage")
    mbd4_lof:        bool = Field(False, description="BER deficiency → modest fork lesion accumulation")
    msi_h:           bool = Field(False, description="dMMR / MSI-H → fork stalling at microsatellites")
    high_ploidy:     bool = Field(False, description="Aneuploidy / genome doubling → centrosome + mitotic RS")

    # Optional continuous features (reserved for future quantitative integration)
    tmb:          Optional[float] = Field(None, description="Tumor mutational burden (mut/Mb)")
    ploidy_score: Optional[float] = Field(None, description="Numeric ploidy value if available")


# ── RS score output ───────────────────────────────────────────────────────────

class RSScore(BaseModel):
    """
    Computed Replication Stress score with full audit trail.
    Transparent: every weight, contributing feature, and threshold is documented.
    """
    score: float = Field(..., description="Weighted sum, capped at 1.0, floor 0.0")
    level: str   = Field(..., description="'high' / 'moderate' / 'low' / 'none'")
    contributing_features: List[str]       = Field(default_factory=list)
    weights_applied:       Dict[str, float] = Field(default_factory=dict)
    rationale: str = Field(..., description="One-line human rationale for the score and level")


# ── Documented weights ────────────────────────────────────────────────────────

_RS_WEIGHTS: Dict[str, float] = {
    "ccne1_amplified": 0.30,
    "myc_amplified":   0.20,
    "arid1a_lof":      0.20,
    "msi_h":           0.15,
    "tp53_lof":        0.10,
    "high_ploidy":     0.10,
    "mbd4_lof":        0.05,   # deliberately lowest — BER modest RS contributor
}

# Level thresholds
_HIGH_THRESHOLD     = 0.40
_MODERATE_THRESHOLD = 0.20


# ── Core function ─────────────────────────────────────────────────────────────

def compute_rs_score(features: RSFeatureSet) -> RSScore:
    """
    Compute a transparent weighted RS score from binary genomic features.

    Algorithm:
      1. For each True boolean feature, accumulate its documented weight.
      2. Cap result at 1.0, floor at 0.0.
      3. Assign level: high / moderate / low / none.
      4. Record all contributing features and weights for audit.

    CRITICAL CONSTRAINTS:
      - MBD4 alone: score = 0.05 → "low"   (verified by test)
      - MBD4 + TP53: score = 0.15 → "low"   (verified by test)
      - MBD4 + TP53 + ARID1A: score = 0.35 → "moderate" (verified by test)
      - CCNE1 + TP53: score = 0.40 → "high"  (verified by test)
    """
    raw_score = 0.0
    contributing: List[str] = []
    weights_applied: Dict[str, float] = {}

    feature_dict = {
        "ccne1_amplified": features.ccne1_amplified,
        "myc_amplified":   features.myc_amplified,
        "arid1a_lof":      features.arid1a_lof,
        "msi_h":           features.msi_h,
        "tp53_lof":        features.tp53_lof,
        "high_ploidy":     features.high_ploidy,
        "mbd4_lof":        features.mbd4_lof,
    }

    for feature_name, is_present in feature_dict.items():
        if is_present:
            w = _RS_WEIGHTS[feature_name]
            raw_score += w
            contributing.append(feature_name)
            weights_applied[feature_name] = w

    # Cap at 1.0
    score = min(1.0, max(0.0, raw_score))

    # Level assignment
    if score >= _HIGH_THRESHOLD:
        level = "high"
    elif score >= _MODERATE_THRESHOLD:
        level = "moderate"
    elif score > 0.0:
        level = "low"
    else:
        level = "none"

    # Build rationale
    if not contributing:
        rationale = "No RS features present. RS score = 0 (none)."
    else:
        feature_str = " + ".join(contributing)
        rationale = (
            f"RS features: {feature_str}. "
            f"Weighted sum = {raw_score:.2f} → capped score = {score:.2f} → level = '{level}'. "
            f"{'MBD4 contributes modest RS (0.05 weight); co-mutations required to reach moderate/high.' if features.mbd4_lof and not features.ccne1_amplified else ''}"
        ).strip()

    return RSScore(
        score=round(score, 4),
        level=level,
        contributing_features=contributing,
        weights_applied=weights_applied,
        rationale=rationale,
    )


# ── Convenience predicates ────────────────────────────────────────────────────

def rs_is_high(rs: Optional[RSScore]) -> bool:
    return rs is not None and rs.level == "high"


def rs_is_moderate_or_higher(rs: Optional[RSScore]) -> bool:
    return rs is not None and rs.level in ("moderate", "high")


def rs_is_actionable(rs: Optional[RSScore]) -> bool:
    """True if RS score is high enough to be considered in tier promotion logic."""
    return rs_is_high(rs)
