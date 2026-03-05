# Trial Card Render Contract

**Purpose:** Single source of truth for trial object schema, required fields, null/unknown rules, and frontend rendering expectations.

**Last Updated:** 2025-02-17  
**Status:** Active

---

## 1. Trial Object Schema (Full Field List with Sources)

### Core Identity
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `nct_id` | string | discovery/SQLite | Required |
| `title` | string | discovery/SQLite | Required |
| `phase` / `phases` | string | discovery | Normalize for display |
| `status` | string | discovery/refresh | e.g. Recruiting, Suspended |
| `source_url` | string | derived | `https://clinicaltrials.gov/study/{nct_id}` |

### Match & Scoring (Two Distinct Scoring Systems)

**Mechanism ranking (mechanism_fit_ranker):**
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `mechanism_rank_score` | number (0–1) | mechanism_fit_ranker | **0.7 × eligibility_score + 0.3 × mechanism_fit_score**; use when both inputs exist |
| `combined_score` | number (0–1) | mechanism_fit_ranker | Alias for mechanism_rank_score (same formula) |
| `mechanism_fit_score` | number (0–1) | mechanism_fit_ranker / holistic_score_service | Magnitude-weighted similarity |
| `eligibility_score` | number (0–1) | mechanism_fit_ranker / holistic_score_service | |
| `mechanism_rank_weights` | object | mechanism_fit_ranker | `{ eligibility: 0.7, mechanism_fit: 0.3 }` |

**Holistic scoring (holistic_score_service) – 4 components:**
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `holistic_score` | number (0–1) | holistic_score_service | 4-component weighted sum (mechanism + eligibility + PGx + resistance) |
| `holistic_score_total` | number (0–1) | holistic_score_service | Alias for holistic_score |
| `holistic_weights` | object | holistic_score_service | `{ mechanism_fit, eligibility, pgx_safety, resistance_risk }` – distinct from mechanism_rank_weights |
| `pgx_safety_score` | number (0–1) | holistic_score_service | 1.0 = safe |
| `resistance_risk_score` | number (0–1) | holistic_score_service | Optional |

**Fallback / assembly:**
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `match_score` | number (0–1) | routes (final assembly) | Prefer holistic_score, mechanism_rank_score, mechanism_fit_score, moa_confidence |

### Mechanism Alignment (Key Convention)

**Machine vectors (lowercase keys):**
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `moa_vector` | `Record<string, number>` | trial_data_enricher / enrichment | 7D, **lowercase**: ddr, mapk, pi3k, vegf, her2, io, efflux |
| `mechanism_alignment` | `Record<string, number>` | mechanism_fit_ranker / holistic_score_service | Per-pathway, **lowercase** in API; UI maps to uppercase for display chips |
| `alignment_breakdown` | `Record<string, number>` | mechanism_fit_ranker | Same as mechanism_alignment |
| `rss_alignment` | object \| undefined | mechanism_fit_ranker | **Optional — present only when patient `vector_version = 8D.v1`.** Schema: `{score, patient_rss, trial_rss, version, note}`. `rss` NEVER appears as a key inside `moa_vector` or `mechanism_alignment`. Frontend must opt in explicitly to render this field. |

**UI layer:** Use a deterministic mapper (e.g. `toDisplayChipKeys`) to convert lowercase → uppercase for display chips. Canonical display order: DDR, MAPK, PI3K, VEGF, HER2, IO, Efflux.
| `moa_confidence` | number (0–1) | enrichment | 0.95 manual, 0.7 runtime |
| `moa_source` | string | enrichment | "manual_intelligence_report", "runtime_keyword_matching", "none" |
| `moa_tags` | string[] | enrichment / pipeline | Human-readable tags (parp_inhibitor, ddr, etc.) |

### Holistic / Breakdown
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `holistic_interpretation` | string | holistic_score_service | "HIGH", "MEDIUM", "LOW", "CONTRAINDICATED" |
| `holistic_recommendation` | string | holistic_score_service | Human-readable |
| `holistic_caveats` | string[] | holistic_score_service | Warnings |
| `holistic_weights` | Record | holistic_score_service | mechanism_fit, eligibility, pgx_safety, resistance_risk |
| `holistic_provenance` | object | holistic_score_service | |
| `scoring_breakdown` | object | routes (final assembly) | `mechanism_rank_weights` (0.7/0.3), `holistic_weights` (4-component), mechanism_fit_score, eligibility_score, pgx_safety_score, resistance_risk_score |
| `pgx_details` | object | holistic_score_service | Pharmacogene details |
| `eligibility_breakdown` | string[] | holistic_score_service | Human-readable gate messages |

### Reasoning & Eligibility
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `reasoning` | object | routes | why_eligible, why_good_fit, conditional_requirements, red_flags |
| `eligibility_checklist` | object | routes | hard_pass_count, confidence_gate, hard_criteria |
| `inclusion_reason` | string | routes / discovery | Canonical field. Values: `"pinned"`, `"ddr_intervention_match"`, `"discovery"` |
| `why_included` | string | routes | **Deprecated alias for `inclusion_reason`** — same value. Remove in v2. Do not introduce new consumers. |
| `pin_provenance` | object \| undefined | routes | Optional. Present only when `inclusion_reason = "pinned"`. Schema: `{source: string, reason: string, version: string}`. Example source: `"manual_pin_zo"`. |
| `llm_assessment` | object | optional | met_criteria, unclear_criteria, eligibility_status |

### Pipeline-Hardened
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `interventions` | array | enrichment.parse_interventions_for_drug_names | Drug names from interventions_json |
| `trial_line_bucket` | string | discovery | "frontline", "maintenance", "recurrent", "platinum_resistant" |
| `freshness` | object | routes.compute_freshness_metadata | stale, last_refreshed_at |
| `last_refreshed_at` | string (ISO) | refresh_top_trials_bounded | |
| `locations` | array | discovery | facility, city, state |
| `location_match` | object | routes | matched, matched_sites_count |
| `eligibility_requirements` | array | routes.extract_eligibility_requirements | |
| `keyword_matches` | object | optional | |
| `is_tagged` | boolean | optional | MoA vector available |

### Gating (Optional – Future Use)
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `trial_gating` | object | optional | `{ hard_fail: boolean, severity: string, rankable: boolean, requires_biomarkers: string[], blockers: string[] }` – include even if all false so UI can render hard-fail states later |

---

## 2. Required Fields for MoA + Mechanism Fit + Eligibility

**Minimum for mechanism fit display:**
- `mechanism_fit_score` (number)
- `combined_score` or `holistic_score` (number)
- `mechanism_alignment` or `alignment_breakdown` (Record<string, number>) for per-pathway chips

**Minimum for eligibility display:**
- `eligibility_score` or `match_score` (number)
- `reasoning` or `eligibility_checklist` (object)

**Minimum for gating (when implemented):**
- `trial_gating.hard_fail` (boolean)
- `trial_gating.rankable` (boolean)
- `trial_gating.blockers` (string[])

---

## 3. Null / Unknown Rules

| Scenario | Rule | UI Behavior |
|----------|------|-------------|
| `mechanism_fit_score` absent | Show "Mechanism fit not computed" / omit score | Do not display mechanism fit bar; show "N/A" or hide section |
| `moa_vector` all zeros (default) | Treat as untagged | Show "Needs MoA tagging" chip; **never** treat as "real tagging present" |
| `moa_vector` truthiness check | **Bug:** `if (moa_vector)` passes for default zero object | Use `moa_confidence > 0` or `moa_source !== "none"` or `hasRealMoATag(moa_vector)` (non-zero magnitude) |
| `holistic_score` absent | Fall back to match_score, combined_score, or 0.5 | Display best available; do not fabricate |
| `mechanism_alignment` absent | Omit per-pathway chips | Do not render pathway chips |
| `reasoning` absent | Omit reasoning accordion | Show minimal eligibility if checklist present |
| Unknown RS (e.g. HRD) | Show "needs-test" chip | Do not speculate; flag as data gap |

---

## 4. Axis Order for Per-Pathway Chips

Canonical display order: **DDR, MAPK, PI3K, VEGF, HER2, IO, Efflux**

- API / machine: **lowercase** (ddr, mapk, pi3k, vegf, her2, io, efflux)
- Display chips: **uppercase** via deterministic mapper in UI layer

---

## 5. MoA Tag Semantics

- **MoA tag** = human-readable class (e.g. `parp_inhibitor`, `ddr`, `checkpoint_inhibitor`)
- **moa_vector** = 7D numeric vector (ddr, mapk, pi3k, vegf, her2, io, efflux). Always 7D on the wire.
- **mechanism_alignment** = per-pathway alignment scores using **magnitude-weighted projection `(p·t)/‖t‖`** where `‖t‖` is the L2 norm of the trial vector. NOTE: `retroactive_prediction_run.py` uses its own `cosine_sim()` for research validation — this is a separate, independent code path from the production ranker.
- **rss_alignment** = separate optional object (see Mechanism Alignment table). Never a key inside `mechanism_alignment` or `moa_vector`.
- Human-readable tags exist in `moa_tags` array; `MOA_TAG_COLORS` maps tag → color

### Kill Chain Output (Trials Search Response)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `kill_chain_output` | object \| null | `/api/ayesha/trials/search` | **Optional in response. Correctly computed and structured. No current frontend consumer on the trials search page.** Future consumer: `KillChainStatusWidget` in `AyeshaHolisticScoring.jsx`. Not a shipped UX fix — infrastructure for next frontend sprint. Always present (null when no CA-125 supplied). Fields: `policy_ran`, `state`, `active_signals`, `ca125_history`, `resistance_risk_score`, `ruo_banner`. |

---

## 6. FRONTEND_CONTRACT Policy

- Render only structured fields that are present
- Do not speculate or invent values when absent
- Use explicit fallbacks (e.g. "N/A", "Not computed") rather than guessing

---

## 7. Backward Compatibility

- All new fields (`trial_gating`, extended `mechanism_alignment`) MUST be optional
- Existing consumers must continue to work without these fields
- Frontend must handle missing fields gracefully (no crashes, sensible defaults)
