# SL Agent v4 — Multi-Modal Engine Patch

Plug-in instructions for upgrading a v3 installation to v4.

---

## What's in this patch

```
sl_agent/
├── __init__.py                         ← updated: version bump → 4.0.0
├── .env.example                        ← updated: multi-modal section added
├── api/
│   ├── app.py                          ← updated: registers mm_router
│   └── multimodal_routes.py            ← NEW: 3 new endpoints
└── multimodal/                         ← NEW directory (entire subtree)
    ├── __init__.py
    ├── models.py
    ├── pharmacologic_analyzer.py
    ├── literature_receipts.py
    ├── modality_fuser.py
    ├── matrix_builder.py
    └── tests/
        ├── __init__.py
        └── test_multimodal.py
```

**Total**: 9 new files · 3 modified files · 0 deletions

---

## Installation (3 steps)

### Step 1 — Drop new files into your existing sl_agent directory

```bash
# From the directory containing sl_agent/
cp -r patch/sl_agent/multimodal      sl_agent/
cp    patch/sl_agent/api/multimodal_routes.py  sl_agent/api/
```

### Step 2 — Apply the 3 modified files

```bash
cp patch/sl_agent/api/app.py   sl_agent/api/app.py
cp patch/sl_agent/__init__.py  sl_agent/__init__.py
cp patch/sl_agent/.env.example sl_agent/.env.example
```

> **If you have local edits to `app.py`**: the only change is 2 lines.
> Add this import at the top (line ~18):
> ```python
> from .multimodal_routes import mm_router
> ```
> And register the router at the bottom of `create_app()`:
> ```python
> app.include_router(mm_router, prefix="/api/v1")
> ```

### Step 3 — Verify

```bash
# Run full suite — should be 84 passed
cd /path/to/project   # parent of sl_agent/
python -m pytest sl_agent/tests/ sl_agent/kb/tests/ sl_agent/multimodal/tests/ -v

# Start server
uvicorn sl_agent.api.app:app --reload --port 8000
```

No new dependencies required — all modules use packages already in `requirements.txt`.

---

## New Endpoints

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/api/v1/analyze/multimodal` | Full multi-modal evidence matrix + narrative |
| `GET`  | `/api/v1/analyze/calibration` | Cytidine-analog gold-standard calibration |
| `GET`  | `/api/v1/analyze/evidence_matrix` | Frozen-receipt matrix (no live data required) |

---

## POST `/api/v1/analyze/multimodal`

Minimal request:
```json
{
  "gene": "MBD4",
  "mutation_type": "loss_of_function"
}
```

Full request:
```json
{
  "gene": "MBD4",
  "mutation_type": "loss_of_function",
  "cancer_type": "Colorectal Cancer",
  "axes": [
    "cytidine_analogs",
    "parp_inhibitors",
    "atr_wee1",
    "wrn",
    "immunotherapy"
  ],
  "include_pharmacologic_stratification": true,
  "include_literature_receipts": true,
  "include_calibration_narrative": true,
  "stratify_by_msi": true
}
```

Response shape (`MultiModalResult`):
```json
{
  "query_gene": "MBD4",
  "cancer_type": "Colorectal Cancer",
  "evidence_matrix": {
    "rows": [
      {
        "axis": "cytidine_analogs",
        "axis_label": "Cytidine Analogs (gemcitabine, cytarabine)",
        "mechanism": "BER substrate accumulation ...",
        "recommendation_tier": "Validated SL therapeutic lever",
        "overall_evidence_level": "High",
        "positive_modalities": ["clinical", "in_vivo", "in_vitro", "expression"],
        "missing_modalities": ["prism"],
        "crispr_pharmacologic_agreement": "insufficient_data",
        "interpretation": "Validated across multiple modalities ..."
      },
      {
        "axis": "parp_inhibitors",
        "recommendation_tier": "Mechanistic candidate only",
        "overall_evidence_level": "Mechanistic-only",
        "crispr_pharmacologic_agreement": "insufficient_data",
        "interpretation": "CRISPR dependency is negative ... pharmacologic screens have NOT been examined ..."
      }
    ],
    "gold_standard_summary": "=== CALIBRATION GOLD STANDARD: MBD4 + Cytidine Analogs ===\n..."
  },
  "agreement_report": [
    {
      "axis_label": "PARP Inhibitors ...",
      "agreement_category": "insufficient_data",
      "interpretation_change": false,
      "conclusion": "Insufficient data to compare modalities. Pharmacologic interrogation needed ..."
    }
  ],
  "updated_narrative": "=== MULTI-MODAL EVIDENCE NARRATIVE: MBD4 ===\n...",
  "recommendation_map": {
    "Cytidine Analogs (gemcitabine, cytarabine)": "Validated SL therapeutic lever",
    "PARP Inhibitors (olaparib, niraparib, talazoparib, rucaparib)": "Mechanistic candidate only",
    "ATR / WEE1 Inhibitors (berzosertib, adavosertib, ceralasertib)": "Mechanistic candidate only",
    "WRN Helicase Inhibitors (VX-803, MRTX1719)": "Mechanistic candidate only",
    "Immunotherapy / Checkpoint Inhibitors (PD-1/PD-L1)": "Mechanistic candidate only"
  },
  "guardrails_applied": [
    "[PARP Inhibitors] CRISPR is negative but pharmacologic screens have NOT been examined. Cannot declare 'no vulnerability' — axis remains 'Mechanistic candidate only' ..."
  ],
  "warnings": []
}
```

---

## Recommendation Tiers

| Tier | Meaning | MBD4 example |
|------|---------|-------------|
| **Validated SL therapeutic lever** | ≥3 modalities positive including clinical/in vivo | Cytidine analogs |
| **Strong candidate dependency axis** | CRISPR and/or compound screens + mechanism | — |
| **Mechanistic candidate only** | Expression/pathway rationale; CRISPR/compound weak or absent | PARP, ATR/WEE1, WRN, IO |
| **Not supported / negative** | Flat or conflicting across ALL examined modalities | — |

---

## Doctrine Guardrails

Two hard rules are enforced by the fuser and tested by the test suite:

### 1. CRISPR negative ≠ dead (most important)

```
IF   CRISPR is negative
AND  PRISM / GDSC screens have NOT been examined
THEN axis = "Mechanistic candidate only"    ← enforced
NOT  axis = "Not supported / negative"      ← blocked
```

Test: `test_crispr_neg_pharma_missing_is_not_negative`

### 2. Disagreement changes the interpretation

```
IF   CRISPR negative
AND  pharmacologic screens show a clear, reproducible sensitivity shift
THEN agreement_category = "disagree_crispr_neg_pharma_pos"
     interpretation_change = true
     conclusion = "compound-level vulnerability without genetic dependency"
```

Test: `test_crispr_pharma_agreement_disagree`

---

## Calibration Endpoint

```
GET /api/v1/analyze/calibration?gene=MBD4
```

Returns the full evidence pattern for the gold-standard axis (cytidine analogs for MBD4).
Use this to show what "Validated SL therapeutic lever" looks like across all 4 modalities.

Source: npj Precis Oncol 2022, PMID 35428381

---

## Evidence Matrix (frozen receipts, no DepMap required)

```
GET /api/v1/analyze/evidence_matrix?gene=MBD4&cancer_type=Colorectal+Cancer
```

Returns the full matrix populated from the frozen literature receipt store only.
Works without DepMap data loaded — useful for auditing, demos, and static exports.

---

## Module Reference

| File | Key exports |
|------|------------|
| `multimodal/models.py` | `EvidenceMatrix`, `EvidenceRow`, `ModalityEvidence`, `CandidateAxis`, `ModalityStatus`, `MultiModalQueryInput`, `MultiModalResult` |
| `multimodal/literature_receipts.py` | `get_literature_receipts(gene, axis)`, `get_calibration_narrative(gene)`, `list_receipts_for_gene(gene)` |
| `multimodal/pharmacologic_analyzer.py` | `analyze_drug_screen(...)`, `aggregate_by_axis(results, stratifier)` |
| `multimodal/modality_fuser.py` | `fuse_matrix(matrix)`, `build_agreement_report(matrix)`, `build_updated_narrative(...)` |
| `multimodal/matrix_builder.py` | `build_evidence_matrix(query, ...)`, `run_multimodal_analysis(query, ...)` |

---

## Extending the Receipt Store

To add new frozen receipts (e.g., for a different gene or new axis):

```python
# in multimodal/literature_receipts.py → _FROZEN_RECEIPTS dict

("BRCA1", CandidateAxis.PARP_INHIBITORS): {
    "clinical": ModalityEvidence(
        modality=Modality.CLINICAL,
        status=ModalityStatus.POSITIVE,
        summary="Multiple Phase III RCTs demonstrate olaparib benefit in BRCA1/2-mut ...",
        pmids=["29606581"],
    ),
    "in_vitro": ModalityEvidence(...),
}
```

Keys are `(GENE_UPPER, CandidateAxis)` tuples.
Modality cells: `in_vitro`, `in_vivo`, `clinical`, `expression`.

---

## Adding a New Candidate Axis

1. Add to `CandidateAxis` enum in `models.py`
2. Add metadata entry to `_AXIS_META` in `matrix_builder.py`
3. Add drug name → axis mapping to `_DRUG_TO_AXIS` in `pharmacologic_analyzer.py`
4. Add CRISPR target genes to `_axis_to_target_genes()` in `matrix_builder.py`
5. Add frozen receipts to `_FROZEN_RECEIPTS` in `literature_receipts.py`
6. Add tests to `multimodal/tests/test_multimodal.py`
