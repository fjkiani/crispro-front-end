### Ayesha MVP – Frontend Contract (No Ambiguity)

**Version**: vNext (updated 2026-02-18)
**Scope**: This contract covers the **4 endpoints** used by the Ayesha Therapy‑Fit MVP UI:

- `POST /api/ayesha/therapy-fit/analyze`
- `GET /api/ayesha/therapy-fit/drug/{drugname}`
- `GET /api/ayesha/therapy-fit/scenarios`
- `GET /api/ayesha/therapy-fit/panel_catalog`

**Route prefix**: `/api/ayesha/therapy-fit` (slashed). The dashed variant `/api/ayesha-therapy-fit` returns **404** and is not a valid prefix.

**Hard anti-hallucination rule**: the UI must only render fields present in these responses. If a field is not present, do not infer it.

---

### 1) Endpoint: Analyze (Top‑3 per level)

**Method/Path**: `POST /api/ayesha/therapy-fit/analyze`

**Query params**:
- **`level`**: `"l1" | "l2" | "l3" | "all"` (default `"all"`)
- **`scenario_id`**: `string | null` (L2 scenario ID)
- **`l3_scenario_id`**: `string | null` (L3 scenario ID)
- **`ctdna_status_override`**: `string | null` (validation/testing override)
- **`efficacy_mode`**: `"fast" | "comprehensive"` (default `"comprehensive"`)
  - `fast`: skip citation lookups for lower latency
  - `comprehensive`: enable full evidence pipeline

**Response**: object with keys `L1`, `L2`, `L3` (or subset) each containing:
- **`drugs`**: ordered list (Top‑3 = first 3). See **Drug Object Shape** below.
- **`pathway_scores`**: `Record<string, number | null>` — includes 7 canonical axes (`ddr`, `mapk`, `pi3k`, `vegf`, `her2`, `io`, `efflux`), plus any upstream keys. Null means "not evaluated" (do not render as 0).
- **`pathway_scores_meta`**: normalization provenance (`normalized`, `defaulted`, `defaulted_keys`, `upstream_keys_present`, `normalization_version`)
- **`inputs_used`**: `Record<string, unknown>` (upstream context; shape may vary across versions — do not destructure narrowly)
- **`provenance`**: `{ run_id, profile, cache, flags, ... }`
- **`completeness`**: `{ level, level_name, completeness_score, has_germline, has_somatic_ngs, ... }`
- **`analysis_date`**: ISO-8601 timestamp (canonical)
- **`analysisdate`**: ISO-8601 timestamp (legacy alias, **deprecated** — will be removed in v2)
- **`contract_warning`**: *(optional)* present when `drugs.length < 3` — soft warning instead of HTTP 500

**Contract invariant**: when `level=all`, each returned level ordering is deterministic. If drug count < 3, a `contract_warning` string is included but the response still returns 200.

---

### Drug Object Shape

All drug keys use **snake_case**. This is the canonical wire format.

| Field | Type | Always present | Notes |
|-------|------|----------------|-------|
| `name` | `string` | ✅ | Drug name (lowercase) |
| `moa` | `string` | ✅ | Mechanism of action |
| `efficacy_score` | `number` | ✅ | Raw computed score (never mutated) |
| `confidence` | `number` | ✅ | Confidence in the score |
| `evidence_tier` | `string` | ✅ | `"supported"`, `"consider"`, `"insufficient"`, `"unknown"` |
| `badges` | `string[]` | ✅ | E.g. `["PathwayAligned", "SL-Detected"]` |
| `citations_count` | `number` | ✅ | Count of surfaced PubMed citations |
| `clinical_band` | `string` | ✅ | E.g. `"B (Good)"`, `"D (Low/VUS)"` |
| `label_status` | `string` | ✅ | `"ON_LABEL"`, `"OFF_LABEL"`, `"UNKNOWN"` |
| `ruo_reason` | `string\|null` | ✅ | First RUO reason, or null |
| `ruo_reasons` | `string[]` | ✅ | All applicable RUO reasons |
| `final_score` | `number` | ✅ | **Required.** `= efficacy_score` when no adjustment; `= efficacy_score × modifier` when adjusted |
| `therapy_fit_adjustment` | `object\|undefined` | ❌ | **Only present when resistance gate adjusts this drug**. Shape: `{ modifier: number, risk_level: string, reason: string }` |
| `clinvar` | `object` | ✅ | ClinVar classification data |
| `evidence_manifest` | `object` | ✅ | PubMed query + citations + ClinVar evidence |
| `insights` | `object` | ✅ | Functional scores (`functionality`, `chromatin`, `essentiality`, `regulatory`) |
| `rationale` | `array` | ✅ | Scoring breakdown (sequence, pathway, evidence) |
| `sporadic_gates_provenance` | `object` | ✅ | Sporadic/germline gate audit trail |

**Reading the score in the UI**: Since `final_score` is always present (required), prefer it directly:
```ts
const displayScore = drug.final_score;
```

---

### Frontend Filter Bar (Manager-requested spec)

Implement **two independent UI toggles** (both default **OFF**):

- **Toggle A**: "Include off‑label + unknown (RUO)"
  - OFF: show only `label_status === "ON_LABEL"`
  - ON: show `ON_LABEL | OFF_LABEL | UNKNOWN` (no label_status filtering)

- **Toggle B**: "Show only drugs with surfaced citations"
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

### 2) Endpoint: Drug Query (Strict "Is drug X a fit?")

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

**Scenario preview object shape** (nested inside each scenario's `preview` field):

| Field | Type | Notes |
|-------|------|-------|
| `top_drug` | `string` | Name of highest-ranked drug |
| `efficacy_score` | `number` | Score of top drug |
| `confidence` | `string` | Formatted confidence (e.g. `"67%"`) |
| `evidence_tier` | `string` | Tier of top drug |
| `badges` | `string[]` | Badges of top drug |
| `citations_count` | `number` | Citations count of top drug |
| `rationale` | `string\|null` | Best rationale snippet |
| `top_k` | `array` | Top-3 drugs as `{ name, efficacy_score, confidence, evidence_tier, badges, clinical_band }` |

> Note: The preview builder (`_preview_from_efficacy_result`) already uses **snake_case** keys. There are no concatenated-key variants (`efficacyscore`, `citationscount`) in preview objects.

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

### 5) Compatibility Policy

**Canonical wire format**: All keys from the backend — in both `/analyze` drug objects and `/scenarios` preview objects — use **snake_case** (`efficacy_score`, `citations_count`, `label_status`). The preview builder (`_preview_from_efficacy_result`) has been verified to emit snake_case exclusively.

**Query parameter naming**: Both the backend router and frontend hooks use `scenario_id` / `l3_scenario_id` (snake_case). There is no `scenarioid` parameter in the live router. Archived documentation may reference `scenarioid` — treat those references as stale.

**Dual-alias fields** (transitional — one release window):

| Canonical (keep) | Legacy alias (deprecated) | Timeline |
|-------------------|--------------------------|----------|
| `analysis_date` | `analysisdate` | Remove legacy in v2 |

**Frontend backward-compat parsing**: The UI should use `??` coalescing for one release window to handle any cached or stale responses:

```ts
// Canonical first, legacy fallback
const citCount = drug.citations_count ?? (drug as any).citationscount ?? 0;
const date = level.analysis_date ?? level.analysisdate;
```

After v2, remove the fallback aliases.

---

### 6) Performance Status (Decision-Grade Assessment)

This section documents what offline evaluation evidence exists for the scoring pipeline.

| Component | Status | Evidence |
|-----------|--------|----------|
| Efficacy scoring (`efficacy_score`) | **Computed, not validated** | Real pipeline output (mutations → orchestrator → drugs). No AUROC/AUPRC/calibration receipt against labeled outcomes. |
| Resistance adjustment (`final_score`) | **Computed, not validated** | `therapy_fit_modifier` from resistance gate applied correctly. No offline metric for modifier accuracy. |
| Escape classifier (resistance signals) | **RUO only** | MSK-Spectrum replay: TP=0, FP=105, TN=432, FN=1. Sensitivity=0.0, specificity≈0.80. Not decision-grade. |
| Sporadic gates | **Computed** | Provenance logged per drug (`sporadic_gates_provenance`). Deterministic rule-based, not ML. |

**Implication**: The UI should frame all scores as research-use-only (RUO) and not make clinical claims.

---

### Example JSON Payloads (Real, from live server 2026-02-18)

The following examples are **verbatim from curl against localhost:8000**.

#### Example A: `POST /api/ayesha/therapy-fit/analyze?level=l1&efficacy_mode=fast` (L1 baseline, passthrough)

```json
{
  "L1": {
    "analysis_date": "2026-02-17T23:24:10.882876",
    "analysisdate": "2026-02-17T23:24:10.882876",
    "drugs": [
      {
        "name": "paclitaxel",
        "moa": "taxane chemotherapy",
        "efficacy_score": 0.32,
        "confidence": 0.6,
        "evidence_tier": "insufficient",
        "badges": ["PathwayAligned"],
        "citations_count": 0,
        "clinical_band": "D (Low/VUS)",
        "label_status": "UNKNOWN",
        "ruo_reason": "unknown-label",
        "ruo_reasons": ["unknown-label", "no-citations", "low-evidence"],
        "final_score": 0.32
      }
    ],
    "pathway_scores": { "ddr": null, "mapk": null, "tp53": 0.4 },
    "pathway_scores_meta": {
      "normalized": true, "defaulted": true,
      "defaulted_keys": ["ddr", "mapk", "pi3k", "vegf", "her2", "io", "efflux"]
    },
    "provenance": { "run_id": "70f8377c-...", "cache": "miss" },
    "completeness": { "level": "L1", "completeness_score": 0.55 },
    "inputs_used": { "mutations": [], "tumor_context": {} }
  }
}
```

Note: `final_score == efficacy_score` (no resistance adjustment at L1).

#### Example B: `GET /api/ayesha/therapy-fit/drug/foobar?level=all` (found=false refusal)

```json
{
  "drug_query": "foobar",
  "L1": { "found": false, "message": "not found in drug panel" },
  "L2": { "found": false, "message": "not found in drug panel" },
  "L3": { "found": false, "message": "not found in drug panel" }
}
```

#### Example C: `GET /api/ayesha/therapy-fit/scenarios` (scenario IDs)

```json
{
  "l2_scenarios": [
    { "id": "L2A_HRDhi_TMBhi", "name": "Sensitivity Test: High HRD context..." },
    { "id": "L2K_BestCase_Kinetic", "name": "..." },
    { "id": "L2K_WorstCase_Kinetic", "name": "..." }
  ],
  "l3_scenarios": [
    { "id": "L3A_VEGFhigh_CA125high", "name": "..." }
  ],
  "preview_cache": {
    "status": "ok", "generated_at": "2026-02-18T03:36:19Z",
    "ttl_seconds": 3600
  }
}
```

#### Example D: `POST /api/ayesha/therapy-fit/analyze?level=l2&scenario_id=L2K_WorstCase_Kinetic&efficacy_mode=fast` (PARP adjusted)

```json
{
  "L2": {
    "drugs": [
      {
        "name": "paclitaxel",
        "efficacy_score": 0.32,
        "final_score": 0.32,
        "confidence": 0.67,
        "label_status": "UNKNOWN"
      },
      {
        "name": "olaparib",
        "moa": "PARP inhibitor",
        "efficacy_score": 0.12,
        "final_score": 0.0295,
        "confidence": 0.43,
        "label_status": "UNKNOWN",
        "therapy_fit_adjustment": {
          "modifier": 0.246,
          "risk_level": "NOT_APPLICABLE",
          "reason": "Resistance gate: NOT_APPLICABLE risk (0.25x)"
        }
      }
    ]
  }
}
```

Note: `therapy_fit_adjustment` only present on PARP drugs. Non-PARP drugs have `final_score == efficacy_score`.

---

### UI Policy (RUO Rendering)

Render policy is **deterministic** and must use only structured fields.

- **RUO badge on each drug row**:
  - Show **RUO** if `label_status !== "ON_LABEL"`.
  - Also show **RUO** if `ruo_reason != null` (even if `label_status === "ON_LABEL"`).
- **Citations indicator**:
  - If `citations_count <= 0`, render a **"No citations surfaced"** indicator and keep RUO framing (do not claim evidence exists).
- **Language constraints**:
  - If `label_status === "UNKNOWN"`: say "Label status not evaluated (RUO)."
  - If `label_status === "OFF_LABEL"`: say "Off‑label hypothesis (RUO)."
  - If `label_status === "ON_LABEL"` and `citations_count > 0` and `ruo_reason == null`: you may render "On‑label (per tag)" but **do not invent** guideline category, NCCN statements, or safety claims.

### Resistance Adjustment Rendering

When `therapy_fit_adjustment` is present on a drug:
- Show the `final_score` as the primary "% fit" number
- Display a **"Resistance-adjusted"** badge or indicator
- On hover/expand, show: `reason` text and `modifier` as percentage (e.g., "0.25× due to resistance risk")
- Do **not** hide `efficacy_score` — show it as "original score" for transparency
