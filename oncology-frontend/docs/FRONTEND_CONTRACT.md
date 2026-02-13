### Ayesha MVP – Frontend Contract (No Ambiguity)

**Scope**: This contract covers the **4 endpoints** used by the Ayesha Therapy‑Fit MVP UI:

- `POST /api/ayesha/therapy-fit/analyze`
- `GET /api/ayesha/therapy-fit/drug/{drugname}`
- `GET /api/ayesha/therapy-fit/scenarios`
- `GET /api/ayesha/therapy-fit/panel_catalog`

**Hard anti-hallucination rule**: the UI must only render fields present in these responses. If a field is not present, do not infer it.

---

### 1) Endpoint: Analyze (Top‑3 per level)

**Method/Path**: `POST /api/ayesha/therapy-fit/analyze`

**Query params**:
- **`level`**: `"l1" | "l2" | "l3" | "all"` (default `"all"`)
- **`scenario_id`**: `string | null` (L2 scenario ID)
- **`l3_scenario_id`**: `string | null` (L3 scenario ID)
- **`ctdna_status_override`**: `string | null` (validation/testing override)

**Response**: object with keys `L1`, `L2`, `L3` (or subset) each containing:
- **`drugs`**: ordered list (Top‑3 = first 3)
- **`pathway_scores`**
- **`inputs_used`**: `{ mutations: [], tumor_context: {} }` (Context for UI rendering)
- **`provenance`**

**Contract invariant**: when `level=all`, each returned level has `drugs.length >= 3` and ordering is deterministic.

---

### Frontend Filter Bar (Manager-requested spec)

Implement **two independent UI toggles** (both default **OFF**):

- **Toggle A**: “Include off‑label + unknown (RUO)”
  - OFF: show only `label_status === "ON_LABEL"`
  - ON: show `ON_LABEL | OFF_LABEL | UNKNOWN` (no label_status filtering)

- **Toggle B**: “Show only drugs with surfaced citations”
  - OFF: no citations filtering
  - ON: filter to `citations_count > 0` (**render-gating only**)

Filtering must be **pure and local** (no inference):

```ts
const allowRUO = includeRUO;
const allowCitedOnly = citationsOnly;

const visible = drugs.filter(d =>
  (allowRUO ? true : d.label_status === 'ON_LABEL') &&
  (allowCitedOnly ? (d.citations_count ?? 0) > 0 : true)
);
```

---

### 2) Endpoint: Drug Query (Strict “Is drug X a fit?”)

**Method/Path**: `GET /api/ayesha/therapy-fit/drug/{drugname}`

**Query params**:
- **`level`**: `"l1" | "l2" | "l3" | "all"` (default `"all"`)
- **`scenario_id`**: `string | null`
- **`l3_scenario_id`**: `string | null`
- **`ctdna_status_override`**: `string | null`

**Response**:
- Top-level `drug_query: string`
- Per-level keys (`L1`/`L2`/`L3`) with:
  - **`found: true`** and **`drug: DrugCard`**, OR
  - **`found: false`** and **`message: "not found in drug panel"` (exact string when absent)

**Explicit refusal behavior (required)**: when a drug is absent from the level panel, this endpoint returns:
- `found: false`
- `message: "not found in drug panel"`

The UI must render that message verbatim and **must not speculate**.

---

### 3) Endpoint: Scenarios (L2/L3 catalog + preview cache)

**Method/Path**: `GET /api/ayesha/therapy-fit/scenarios`

**Query params**: none

**Response**:
- `l2_scenarios: ScenarioCardL2[]` (each may include `preview` + `mechanism_panel`)
- `l3_scenarios: ScenarioCardL3[]` (each includes `preview_matrix.by_l2[l2_id]` entries)
- `preview_cache`: cache metadata for previews:
  - `status`, `generated_at`, `ttl_seconds`, `scenario_version_hash`, `pipeline_version_hash`, `errors`

**Preview cache behavior (backend config; not query params)**:
- `AYESHA_THERAPY_FIT_SCENARIO_PREVIEW_MODE`: `"none" | "lazy" | "refresh"`
- `AYESHA_THERAPY_FIT_SCENARIO_PREVIEW_TTL_SECONDS`: integer seconds (default `3600`)

---

### 4) Endpoint: Panel Catalog (Unique drug list per level)

**Method/Path**: `GET /api/ayesha/therapy-fit/panel_catalog`

**Query params**:
- **`level`**: `"l1" | "l2" | "l3" | "all"` (default `"all"`)
- **`scenario_id`**: `string | null`
- **`l3_scenario_id`**: `string | null`

**Response**: per-level objects containing:
- `drugs: Array<{ name, evidence_tier, badges, citations_count, label_status }>`
Plus a top-level:
- `generated_at: string`

---

### TypeScript Types (Source of Truth)

Frontend types live in:
- `src/types/ayeshaTherapyFit.ts`

---

### Example JSON Payloads (Real, clipped)

The following examples are **clipped from real responses** generated from the backend code (TestClient + forced preview cache completion).

#### Example A: `POST /api/ayesha/therapy-fit/analyze?level=all` (Top‑3 ≥ 3)

```json
{
  "L1": {
    "drugs": [
      {
        "name": "olaparib",
        "efficacy_score": 0.67,
        "confidence": 0.6,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      },
      {
        "name": "niraparib",
        "efficacy_score": 0.67,
        "confidence": 0.6,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      },
      {
        "name": "rucaparib",
        "efficacy_score": 0.67,
        "confidence": 0.6,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      }
    ]
  },
  "L2": {
    "drugs": [
      {
        "name": "olaparib",
        "efficacy_score": 0.67,
        "confidence": 0.61,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      },
      {
        "name": "niraparib",
        "efficacy_score": 0.67,
        "confidence": 0.61,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      },
      {
        "name": "rucaparib",
        "efficacy_score": 0.67,
        "confidence": 0.61,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      }
    ]
  },
  "L3": {
    "drugs": [
      {
        "name": "olaparib",
        "efficacy_score": 0.67,
        "confidence": 0.61,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      },
      {
        "name": "niraparib",
        "efficacy_score": 0.67,
        "confidence": 0.61,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      },
      {
        "name": "rucaparib",
        "efficacy_score": 0.67,
        "confidence": 0.61,
        "evidence_tier": "consider",
        "badges": ["PathwayAligned", "SL-Detected"],
        "citations_count": 0,
        "clinical_band": "B (Good)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label"
      }
    ]
  }
}
```

#### Example B: `GET /api/ayesha/therapy-fit/drug/foobar?level=all` (found=false refusal)

```json
{
  "drug_query": "foobar",
  "L1": { "found": false, "message": "not found in drug panel" },
  "L2": { "found": false, "message": "not found in drug panel" },
  "L3": { "found": false, "message": "not found in drug panel" }
}
```

#### Example C: `GET /api/ayesha/therapy-fit/scenarios` (cache meta + one L2 card + one L3 card)

```json
{
  "preview_cache": {
    "status": "ok",
    "generated_at": "2026-02-05T02:03:09Z",
    "ttl_seconds": 3600,
    "scenario_version_hash": "0c02636456d3593a65b18d1d3a3173f0",
    "pipeline_version_hash": "34a6fd72a54619a8dc7de453f7281106",
    "errors": []
  },
  "l2_card_example": {
    "id": "L2A_HRDhi_TMBhi",
    "name": "Sensitivity Test: High HRD context (Soft Knob) + TP53 Only",
    "locked": true,
    "requires": ["NGS somatic mutations", "HRD score", "TMB score"],
    "preview_status": "ok",
    "preview": {
      "top_drug": "olaparib",
      "efficacy_score": 0.67,
      "confidence": "Low",
      "evidence_tier": "consider",
      "citations_count": 0,
      "badges": ["PathwayAligned", "SL-Detected"],
      "top_k": [
        { "name": "olaparib", "efficacy_score": 0.67, "confidence": 0.61, "evidence_tier": "consider", "clinical_band": "B (Good)", "badges": ["PathwayAligned", "SL-Detected"] },
        { "name": "niraparib", "efficacy_score": 0.67, "confidence": 0.61, "evidence_tier": "consider", "clinical_band": "B (Good)", "badges": ["PathwayAligned", "SL-Detected"] },
        { "name": "rucaparib", "efficacy_score": 0.67, "confidence": 0.61, "evidence_tier": "consider", "clinical_band": "B (Good)", "badges": ["PathwayAligned", "SL-Detected"] }
      ]
    },
    "mechanism_panel": {
      "mechanism_axes": ["DDR", "MAPK", "PI3K", "VEGF", "HER2", "IO", "Efflux"],
      "baseline_mechanism_vector": [0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      "current_mechanism_vector": [0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      "mechanism_delta": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      "escape_warnings": [],
      "provenance": { "baseline_source": "L1", "threshold": 0.15, "scenario_version_hash": "0c02636456d3593a65b18d1d3a3173f0", "pipeline_version_hash": "34a6fd72a54619a8dc7de453f7281106" }
    }
  },
  "l3_card_example": {
    "id": "L3A_VEGFhigh_CA125high",
    "name": "High angiogenesis (Bev-sensitive) + High CA-125 burden",
    "locked": true,
    "requires": ["RNA expression data", "CA-125 lab values"],
    "preview_matrix": {
      "by_l2": {
        "L2A_HRDhi_TMBhi": {
          "status": "ok",
          "ttl_seconds": 3600,
          "scenario_version_hash": "0c02636456d3593a65b18d1d3a3173f0",
          "pipeline_version_hash": "34a6fd72a54619a8dc7de453f7281106",
          "preview": { "top_drug": "olaparib", "efficacy_score": 0.67, "confidence": "Low", "evidence_tier": "consider", "citations_count": 0, "badges": ["PathwayAligned", "SL-Detected"] },
          "mechanism_panel": { "mechanism_axes": ["DDR", "MAPK", "PI3K", "VEGF", "HER2", "IO", "Efflux"], "mechanism_delta": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "escape_warnings": [] }
        }
      }
    }
  }
}
```

---

### UI Policy (RUO Rendering)

Render policy is **deterministic** and must use only structured fields.

- **RUO badge on each drug row**:
  - Show **RUO** if `label_status !== "ON_LABEL"`.
  - Also show **RUO** if `ruo_reason != null` (even if `label_status === "ON_LABEL"`).
- **Citations indicator**:
  - If `citations_count <= 0`, render a **“No citations surfaced”** indicator and keep RUO framing (do not claim evidence exists).
- **Language constraints**:
  - If `label_status === "UNKNOWN"`: say “Label status not evaluated (RUO).”
  - If `label_status === "OFF_LABEL"`: say “Off‑label hypothesis (RUO).”
  - If `label_status === "ON_LABEL"` and `citations_count > 0` and `ruo_reason == null`: you may render “On‑label (per tag)” but **do not invent** guideline category, NCCN statements, or safety claims.

