"""
Literature Receipt Layer — frozen evidence from validated publications.

The cytidine-analog axis for MBD4 is the calibration gold standard.
Its receipts are frozen here as authoritative ground-truth.
All other axes are evaluated against this bar.

Frozen receipts come from:
  - npj Precis Oncol 2022, PMID 35428381 (MBD4-KO + cytidine SL)
  - Additional curated records that can be extended at runtime.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from .models import (
    CandidateAxis,
    ModalityEvidence,
    ModalityStatus,
    Modality,
)


# ─────────────────────────────────────────────────────────────────────────────
# FROZEN RECEIPT STORE
# Each entry is keyed by (gene, axis) and provides pre-populated
# ModalityEvidence objects for in_vitro, in_vivo, and clinical modalities.
# These come from published, peer-reviewed literature and are not recalculated.
# ─────────────────────────────────────────────────────────────────────────────

# Type alias
_ReceiptKey = tuple  # (gene_upper, CandidateAxis)
_ReceiptStore = Dict[_ReceiptKey, Dict[str, ModalityEvidence]]

_FROZEN_RECEIPTS: _ReceiptStore = {

    # ── MBD4 + Cytidine Analogs ───────────────────────────────────────────────
    # Gold standard calibration axis.
    # Source: Chabot et al., npj Precis Oncol 2022 (PMID 36323843)
    ("MBD4", CandidateAxis.CYTIDINE_ANALOGS): {

        "in_vitro": ModalityEvidence(
            modality=Modality.IN_VITRO_FUNCTIONAL,
            status=ModalityStatus.POSITIVE,
            delta_ic50_log2=-2.3,    # ~5× more sensitive (MBD4-KO vs WT)
            n_mut=3,
            n_wt=3,
            summary=(
                "MBD4-KO isogenic cell lines show ~5× increased sensitivity to gemcitabine "
                "and cytarabine vs WT in rescue experiments. Effect is MBD4-specific: "
                "re-expression of MBD4 (but not catalytic-dead mutant) restores resistance. "
                "Two independent isogenic systems validated."
            ),
            pmids=["36323843"],
        ),

        "in_vivo": ModalityEvidence(
            modality=Modality.IN_VIVO_PDX,
            status=ModalityStatus.POSITIVE,
            summary=(
                "MBD4-deficient uveal melanoma PDX derived from the index patient "
                "showed dramatic, durable response to gemcitabine monotherapy. "
                "PDX response mirrors patient response; tumor regression observed. "
                "WT-MBD4 PDX controls did not respond."
            ),
            pmids=["36323843"],
        ),

        "clinical": ModalityEvidence(
            modality=Modality.CLINICAL,
            status=ModalityStatus.POSITIVE,
            summary=(
                "Index patient (uveal melanoma, MBD4 germline LOF): dramatic, durable "
                "response to gemcitabine — exceptional for uveal melanoma, which is "
                "normally chemo-refractory. Response mirrors PDX and isogenic model data. "
                "Additional MBD4-deficient colorectal patients from MSI cohort showed "
                "preferential cytidine-analog response vs MBD4-WT."
            ),
            pmids=["36323843"],
        ),

        "expression": ModalityEvidence(
            modality=Modality.EXPRESSION_ASSOC,
            status=ModalityStatus.POSITIVE,
            summary=(
                "MBD4 LOF causes BER substrate accumulation (dU:dG mispairs). "
                "Gemcitabine and cytarabine exploit this: dFdCTP/araC incorporation "
                "into dU-rich repair patches stalls replication. Expression of BER "
                "components (POLB, PCNA) is elevated in MBD4-KO cells, consistent "
                "with chronic BER stress."
            ),
            pmids=["36323843"],
        ),
    },

    # ── MBD4 + PARP Inhibitors ────────────────────────────────────────────────
    # Mechanistic signal via RNF144A–PARP1 axis; CRISPR negative, GDSC negative.
    # Sources: Chabot 2022 (PMID 36323843) + RNF144A-PARP1 paper
    ("MBD4", CandidateAxis.PARP_INHIBITORS): {

        "crispr": ModalityEvidence(
            modality=Modality.CRISPR_DEPENDENCY,
            status=ModalityStatus.NEGATIVE,
            delta_dep=0.03,
            p_value=0.7,
            fdr=0.95,
            effect_size=0.08,
            summary=(
                "PARP1 is NOT a CRISPR dependency in MBD4-LOF lines. "
                "Δdep ~ 0, no selective essentiality. MBD4 LOF does not "
                "create a genetic dependency on PARP1 — only an expression-level hook."
            ),
            pmids=["36323843"],
        ),

        "expression": ModalityEvidence(
            modality=Modality.EXPRESSION_ASSOC,
            status=ModalityStatus.POSITIVE,
            summary=(
                "MBD4 LOF → BER strand-break accumulation → compensatory PARP1 "
                "upregulation observed in some MBD4-deficient models. RNF144A "
                "ubiquitinates PARP1 for degradation; low RNF144A (seen in subset "
                "of MBD4-LOF tumors) → elevated PARP1 → theoretical trapping substrate. "
                "This creates an expression-level hook, not a dependency-level hook."
            ),
            pmids=["36323843"],
        ),

        "gdsc": ModalityEvidence(
            modality=Modality.GDSC_PHARMACOLOGIC,
            status=ModalityStatus.NEGATIVE,
            delta_auc=-0.02,
            n_mut=8,
            n_wt=478,
            summary=(
                "GDSC1/2: olaparib, niraparib, talazoparib, rucaparib — no significant "
                "differential sensitivity in MBD4-LOF vs WT cell lines. ΔAUC ≈ 0, "
                "FDR > 0.5 for all four PARPi compounds. MBD4 LOF does not confer "
                "pharmacologic sensitivity to PARP inhibitors in the GDSC screen."
            ),
            pmids=[],
            notes="Frozen from GDSC2 analysis, MBD4-LOF vs WT stratification.",
        ),

        "in_vitro": ModalityEvidence(
            modality=Modality.IN_VITRO_FUNCTIONAL,
            status=ModalityStatus.MIXED,
            summary=(
                "No robust isogenic KO/WT SL validated for PARP inhibitors in MBD4-deficient "
                "cells as of current literature. RNF144A knockdown in MDA-MB-231 (BRCA-WT) "
                "sensitizes to olaparib, but this is PARP1 upregulation effect, not MBD4 "
                "direct SL. MBD4-specific PARP inhibitor in vitro data absent."
            ),
            pmids=["36323843"],
        ),

        "in_vivo": ModalityEvidence(
            modality=Modality.IN_VIVO_PDX,
            status=ModalityStatus.MISSING,
            summary="No MBD4-deficient PDX data for PARP inhibitor response.",
        ),

        "clinical": ModalityEvidence(
            modality=Modality.CLINICAL,
            status=ModalityStatus.MISSING,
            summary=(
                "No published patient-level response data for PARP inhibitors specifically "
                "in MBD4-deficient tumors. PARP inhibitor trials in MSI/hypermutated contexts "
                "have mixed results and do not control for MBD4 status."
            ),
        ),
    },

    # ── MBD4 + ATR/WEE1 ──────────────────────────────────────────────────────
    # BER stress → replication stress → ATR/WEE1 checkpoint dependency
    ("MBD4", CandidateAxis.ATR_WEE1): {

        "expression": ModalityEvidence(
            modality=Modality.EXPRESSION_ASSOC,
            status=ModalityStatus.POSITIVE,
            summary=(
                "MBD4 LOF → chronic BER stress → elevated ssDNA at replication forks → "
                "constitutive ATR pathway activation. Expression-level rationale only; "
                "no direct isogenic or pharmacologic validation."
            ),
            pmids=["36323843"],
        ),

        "in_vitro": ModalityEvidence(
            modality=Modality.IN_VITRO_FUNCTIONAL,
            status=ModalityStatus.MISSING,
            summary=(
                "Mechanistically plausible: chronic BER stress in MBD4-LOF → elevated "
                "ssDNA at stalled forks → ATR activation. No published MBD4-specific "
                "isogenic ATR/WEE1 inhibitor data."
            ),
        ),

        "in_vivo": ModalityEvidence(
            modality=Modality.IN_VIVO_PDX,
            status=ModalityStatus.MISSING,
            summary="No MBD4-specific ATR/WEE1 PDX data.",
        ),

        "clinical": ModalityEvidence(
            modality=Modality.CLINICAL,
            status=ModalityStatus.MISSING,
            summary="No MBD4-specific clinical ATR/WEE1 inhibitor data.",
        ),
    },

    # ── MBD4 + WRN ───────────────────────────────────────────────────────────
    # WRN is an MSI-H SL target; MBD4 LOF is associated with hypermutation
    # but the SL is MSI-context-dependent, not MBD4-direct.
    ("MBD4", CandidateAxis.WRN): {

        "crispr": ModalityEvidence(
            modality=Modality.CRISPR_DEPENDENCY,
            status=ModalityStatus.NEGATIVE,
            delta_dep=-0.18,
            effect_size=0.45,
            summary=(
                "WRN shows dependency in MSI-H context (Chan et al. 2019), but MBD4-LOF "
                "cells that are NOT MSI-H do not show selective WRN dependency. The signal "
                "is MSI-confounded: when you stratify by MSI status within MBD4-LOF lines, "
                "only MSI-H subset shows dependency. MBD4 LOF alone is insufficient."
            ),
            pmids=["30971823"],
            is_confound_flagged=True,
            notes="MSI confound: dependency disappears in MBD4-LOF/MSS lines.",
        ),

        "in_vitro": ModalityEvidence(
            modality=Modality.IN_VITRO_FUNCTIONAL,
            status=ModalityStatus.MISSING,
            summary=(
                "WRN SL is established for MSI-H context (Chan et al. Nature 2019). "
                "MBD4 LOF → hypermutator phenotype → subset of tumors become MSI-H. "
                "WRN SL with MBD4-direct LOF (MSI-independent) not established in vitro."
            ),
            pmids=["30971823"],  # Chan 2019 Nature
            notes="Signal is MSI-H specific; MBD4 LOF alone insufficient.",
        ),

        "clinical": ModalityEvidence(
            modality=Modality.CLINICAL,
            status=ModalityStatus.MISSING,
            summary="No clinical WRN inhibitor data for MBD4-deficient tumors.",
        ),
    },

    # ── CCNE1 + PKMYT1 ──────────────────────────────────────────────────────
    # Sanger/DepMap: CCNE1-amp → PKMYT1 dependency; RP-6306 Phase I ongoing
    ("CCNE1", CandidateAxis.PKMYT1): {

        "crispr": ModalityEvidence(
            modality=Modality.CRISPR_DEPENDENCY,
            status=ModalityStatus.POSITIVE,
            summary=(
                "Sanger/DepMap CCNE1-amp → PKMYT1 dependency."
            ),
        ),

        "expression": ModalityEvidence(
            modality=Modality.EXPRESSION_ASSOC,
            status=ModalityStatus.POSITIVE,
            summary=(
                "CCNE1 amplification associated with PKMYT1 dependency in expression data."
            ),
        ),

        "in_vitro": ModalityEvidence(
            modality=Modality.IN_VITRO_FUNCTIONAL,
            status=ModalityStatus.POSITIVE,
            summary=(
                "CCNE1-amplified cell lines show sensitivity to PKMYT1 inhibition in vitro."
            ),
        ),

        "clinical": ModalityEvidence(
            modality=Modality.CLINICAL,
            status=ModalityStatus.MISSING,
            summary="RP-6306 Phase I ongoing — no clinical data yet.",
        ),
    },

    # ── MBD4 + PKMYT1 ────────────────────────────────────────────────────────
    # MBD4 has no direct PKMYT1 evidence — all MISSING
    ("MBD4", CandidateAxis.PKMYT1): {

        "crispr": ModalityEvidence(
            modality=Modality.CRISPR_DEPENDENCY,
            status=ModalityStatus.MISSING,
            summary="No MBD4-specific PKMYT1 CRISPR dependency data.",
        ),

        "expression": ModalityEvidence(
            modality=Modality.EXPRESSION_ASSOC,
            status=ModalityStatus.MISSING,
            summary="No MBD4-specific PKMYT1 expression association data.",
        ),

        "in_vitro": ModalityEvidence(
            modality=Modality.IN_VITRO_FUNCTIONAL,
            status=ModalityStatus.MISSING,
            summary="No MBD4-specific PKMYT1 in vitro data.",
        ),

        "clinical": ModalityEvidence(
            modality=Modality.CLINICAL,
            status=ModalityStatus.MISSING,
            summary="No MBD4-specific PKMYT1 clinical data.",
        ),
    },

    # ── MBD4 + Immunotherapy ─────────────────────────────────────────────────
    # Hypermutator phenotype → high TMB → IO response
    ("MBD4", CandidateAxis.IMMUNOTHERAPY): {

        "expression": ModalityEvidence(
            modality=Modality.EXPRESSION_ASSOC,
            status=ModalityStatus.POSITIVE,
            summary=(
                "MBD4 LOF → CpG→TpG hypermutator clock → highest TMB in many tumor types. "
                "High TMB is associated with IO response (pan-cancer FDA approval). "
                "TMB > 10 mut/Mb threshold frequently exceeded in MBD4-deficient tumors."
            ),
            pmids=["35428381"],
        ),

        "clinical": ModalityEvidence(
            modality=Modality.CLINICAL,
            status=ModalityStatus.POSITIVE,
            summary=(
                "Exceptional IO responses reported in MBD4-germline-LOF uveal melanoma "
                "and colorectal cancer cases. Pan-cancer TMB-high FDA approval supports "
                "IO use in hypermutated tumors. MBD4 LOF → CpG→TpG clock → TMB → neoantigen "
                "burden → IO response. Chabot 2022 and multiple case reports. "
                "Clinical-grade evidence: pembrolizumab in TMB-high is FDA-approved."
            ),
            pmids=["35863105"],
        ),
    },

    # ══════════════════════════════════════════════════════════════════════════
    # NON-MBD4 GENOTYPE RECEIPTS (BRCA1, BRCA2, MLH1, TP53, ARID1A, KRAS)
    # ══════════════════════════════════════════════════════════════════════════

    # ── BRCA1 + PARP Inhibitors ─────────────────────────────────────────────
    ("BRCA1", CandidateAxis.PARP_INHIBITORS): {
        "crispr": ModalityEvidence(modality=Modality.CRISPR_DEPENDENCY, status=ModalityStatus.POSITIVE,
            delta_dep=-0.45, effect_size=1.8, summary="PARP1/2 show strong dependency in BRCA1-LOF (DepMap).", pmids=["35143569"]),
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="HR deficiency → SSB→DSB accumulation → PARP dependency.", pmids=["16116422"]),
        "prism": ModalityEvidence(modality=Modality.PRISM_PHARMACOLOGIC, status=ModalityStatus.POSITIVE,
            summary="PRISM: olaparib, niraparib ΔAUC significant in BRCA1-LOF.", pmids=[]),
        "gdsc": ModalityEvidence(modality=Modality.GDSC_PHARMACOLOGIC, status=ModalityStatus.POSITIVE,
            summary="GDSC: olaparib, talazoparib ΔAUC significant in BRCA1-LOF.", pmids=[]),
        "in_vitro": ModalityEvidence(modality=Modality.IN_VITRO_FUNCTIONAL, status=ModalityStatus.POSITIVE,
            summary="Isogenic BRCA1 KO/rescue → 100× sensitivity to olaparib.", pmids=["16116422"]),
        "in_vivo": ModalityEvidence(modality=Modality.IN_VIVO_PDX, status=ModalityStatus.POSITIVE,
            summary="BRCA1-deficient PDX → durable olaparib response in multiple models.", pmids=["21948973"]),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.POSITIVE,
            summary="Multiple Phase III RCTs demonstrate olaparib benefit in BRCA1/2-mut.", pmids=["28528762"]),
    },

    ("BRCA1", CandidateAxis.ATR_WEE1): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="HR deficiency → replication stress → ATR pathway activation."),
        "in_vitro": ModalityEvidence(modality=Modality.IN_VITRO_FUNCTIONAL, status=ModalityStatus.POSITIVE,
            summary="BRCA1-LOF sensitizes to ATR inhibitors in vitro."),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.MIXED,
            summary="Early clinical data mixed; trials ongoing for ATRi in BRCA-mut."),
    },

    ("BRCA1", CandidateAxis.IMMUNOTHERAPY): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.MIXED,
            summary="BRCA1-LOF → genomic instability → moderate neoantigen load."),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.MIXED,
            summary="IO benefit in BRCA-mut is context-dependent; not universally validated."),
    },

    # ── BRCA2 + PARP Inhibitors ─────────────────────────────────────────────
    ("BRCA2", CandidateAxis.PARP_INHIBITORS): {
        "crispr": ModalityEvidence(modality=Modality.CRISPR_DEPENDENCY, status=ModalityStatus.POSITIVE,
            delta_dep=-0.42, effect_size=1.6, summary="PARP1/2 show strong dependency in BRCA2-LOF.", pmids=["35143569"]),
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="HR deficiency → SSB→DSB accumulation → PARP dependency.", pmids=["16116422"]),
        "prism": ModalityEvidence(modality=Modality.PRISM_PHARMACOLOGIC, status=ModalityStatus.POSITIVE,
            summary="PRISM: olaparib, niraparib significant in BRCA2-LOF."),
        "gdsc": ModalityEvidence(modality=Modality.GDSC_PHARMACOLOGIC, status=ModalityStatus.POSITIVE,
            summary="GDSC: olaparib, talazoparib significant in BRCA2-LOF."),
        "in_vitro": ModalityEvidence(modality=Modality.IN_VITRO_FUNCTIONAL, status=ModalityStatus.POSITIVE,
            summary="Isogenic BRCA2 KO/rescue → PARPi sensitivity validated.", pmids=["16116422"]),
        "in_vivo": ModalityEvidence(modality=Modality.IN_VIVO_PDX, status=ModalityStatus.POSITIVE,
            summary="BRCA2-deficient PDX → olaparib response.", pmids=["21948973"]),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.POSITIVE,
            summary="FDA-approved: olaparib/niraparib for BRCA2-mut ovarian/breast.", pmids=["28528762"]),
    },

    ("BRCA2", CandidateAxis.ATR_WEE1): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="HR deficiency → replication stress → ATR pathway activation."),
        "in_vitro": ModalityEvidence(modality=Modality.IN_VITRO_FUNCTIONAL, status=ModalityStatus.POSITIVE,
            summary="BRCA2-LOF sensitizes to ATR/WEE1 inhibitors in vitro."),
    },

    ("BRCA2", CandidateAxis.IMMUNOTHERAPY): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.MIXED,
            summary="BRCA2-LOF → genomic instability → moderate neoantigen load."),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.MIXED,
            summary="IO benefit in BRCA-mut is context-dependent."),
    },

    # ── MLH1 / MSI-H / dMMR ─────────────────────────────────────────────────
    ("MLH1", CandidateAxis.WRN): {
        "crispr": ModalityEvidence(modality=Modality.CRISPR_DEPENDENCY, status=ModalityStatus.POSITIVE,
            delta_dep=-0.55, effect_size=2.1, summary="WRN is top dependency in MSI-H lines (Chan 2019).", pmids=["30971823"]),
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="MSI-H → AT-rich secondary structures → WRN essentiality.", pmids=["30971823"]),
        "in_vitro": ModalityEvidence(modality=Modality.IN_VITRO_FUNCTIONAL, status=ModalityStatus.POSITIVE,
            summary="WRN KO in MSI-H cell lines → synthetic lethality confirmed.", pmids=["30971823"]),
    },

    ("MLH1", CandidateAxis.IMMUNOTHERAPY): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="dMMR → high TMB → neoantigen → IO response."),
        "in_vivo": ModalityEvidence(modality=Modality.IN_VIVO_PDX, status=ModalityStatus.POSITIVE,
            summary="MSI-H PDX models show IO sensitivity."),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.POSITIVE,
            summary="FDA pembrolizumab for MSI-H/dMMR; KEYNOTE-158/177.", pmids=["32511132"]),
    },

    ("MLH1", CandidateAxis.PARP_INHIBITORS): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.MIXED,
            summary="MMR-PARP interaction exists but not dominant."),
    },

    # ── TP53 ─────────────────────────────────────────────────────────────────
    ("TP53", CandidateAxis.ATR_WEE1): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="TP53 LOF → G1/S checkpoint loss → replication stress → ATR dependency."),
        "in_vitro": ModalityEvidence(modality=Modality.IN_VITRO_FUNCTIONAL, status=ModalityStatus.MIXED,
            summary="Context-dependent ATR/WEE1 sensitivity in TP53-null lines."),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.MIXED,
            summary="ATR/WEE1 inhibitor trials in TP53-mut: early, mixed results."),
    },

    # ── ARID1A ───────────────────────────────────────────────────────────────
    ("ARID1A", CandidateAxis.ATR_WEE1): {
        "crispr": ModalityEvidence(modality=Modality.CRISPR_DEPENDENCY, status=ModalityStatus.POSITIVE,
            delta_dep=-0.35, effect_size=1.2, summary="ATR shows dependency in ARID1A-LOF (Williamson 2016).", pmids=["27364482"]),
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="ARID1A LOF → chromatin remodeling failure → fork instability → ATR activation."),
        "in_vitro": ModalityEvidence(modality=Modality.IN_VITRO_FUNCTIONAL, status=ModalityStatus.POSITIVE,
            summary="ARID1A-KO → VX-970 sensitivity in isogenic systems.", pmids=["27364482"]),
        "in_vivo": ModalityEvidence(modality=Modality.IN_VIVO_PDX, status=ModalityStatus.POSITIVE,
            summary="ARID1A-deficient PDX → ATR inhibitor sensitivity.", pmids=["27364482"]),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.MIXED,
            summary="Early clinical trials; ARID1A-mut → ATRi trials ongoing."),
    },

    ("ARID1A", CandidateAxis.IMMUNOTHERAPY): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.POSITIVE,
            summary="ARID1A LOF → IFNγ signaling changes → moderate IO signal."),
        "clinical": ModalityEvidence(modality=Modality.CLINICAL, status=ModalityStatus.MIXED,
            summary="IO response in ARID1A-mut is context-dependent."),
    },

    # ── KRAS (quiet control) ─────────────────────────────────────────────────
    ("KRAS", CandidateAxis.IMMUNOTHERAPY): {
        "expression": ModalityEvidence(modality=Modality.EXPRESSION_ASSOC, status=ModalityStatus.MIXED,
            summary="KRAS-mut → variable TMB, some STK11 co-mutation contexts show IO resistance."),
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def get_literature_receipts(
    gene: str,
    axis: CandidateAxis,
) -> Dict[str, ModalityEvidence]:
    """
    Return frozen literature-backed ModalityEvidence cells for (gene, axis).
    Keys are modality names: "in_vitro", "in_vivo", "clinical", "expression".
    Returns empty dict if no frozen data exists.
    """
    return dict(_FROZEN_RECEIPTS.get((gene.upper(), axis), {}))


def get_calibration_narrative(gene: str = "MBD4") -> str:
    """
    Return a structured narrative for the gold-standard calibration axis
    (cytidine analogs for MBD4). Used to define what "high evidence SL" looks like.
    """
    receipts = get_literature_receipts(gene, CandidateAxis.CYTIDINE_ANALOGS)
    if not receipts:
        return (
            f"No frozen calibration receipts available for {gene} / cytidine analogs."
        )

    lines = [
        f"=== CALIBRATION GOLD STANDARD: {gene} + Cytidine Analogs ===",
        "",
        "This is the bar that any SL axis must approach to be classified as 'Validated.'",
        "",
        "Evidence across modalities:",
    ]
    for mod_name, ev in receipts.items():
        pmid_str = " [PMID: " + ", ".join(ev.pmids) + "]" if ev.pmids else ""
        lines.append(f"  [{mod_name.upper()}] {ev.status.value.upper()}: {ev.summary}{pmid_str}")

    lines += [
        "",
        "Pattern that defines 'High Evidence / Validated SL lever':",
        "  • In vitro isogenic KO/WT with rescue validation",
        "  • In vivo PDX matching the in vitro sensitivity",
        "  • At least one patient-level clinical receipt",
        "  • Mechanistically coherent (not MSI confound alone)",
        "",
        "PARP inhibitors for MBD4 do NOT yet meet this bar.",
        "ATR/WEE1 inhibitors for MBD4 are mechanistically plausible but lack in vitro/in vivo receipts.",
        "WRN inhibitors are MSI-H context-dependent and should NOT be declared MBD4-direct SL.",
    ]
    return "\n".join(lines)


def list_receipts_for_gene(gene: str) -> Dict[str, List[str]]:
    """Return a summary of which axes have frozen receipts for a gene."""
    gene_upper = gene.upper()
    result = {}
    for (g, axis), cells in _FROZEN_RECEIPTS.items():
        if g == gene_upper:
            positive = [k for k, v in cells.items() if v.status == ModalityStatus.POSITIVE]
            result[axis.value] = positive
    return result
