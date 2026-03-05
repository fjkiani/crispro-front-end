# Trial Card Acceptance Checklist

**Purpose:** Acceptance criteria for trial card rendering aligned to strategic plan success criteria.

**Reference:** `TrialCardRenderContract.md`, `trial_card_render_fixtures.json`

---

## Concrete Acceptance Assertions (Fixtures a–d)

Use these deterministic expectations to drive UI verification.

| Case | Fixture ID | Inputs | Expected UI |
|------|------------|--------|-------------|
| **(a)** | `high_eligibility_high_mechanism` | eligibility=0.90, mechanism_fit=0.85 | Show **"Mechanism-aligned"** badge; show mechanism fit value (85%); show combined score (88.5%); show pathway chips (ddr, vegf) |
| **(b)** | `high_eligibility_low_mechanism` | eligibility=0.85, mechanism_fit=0.35 | Show **"Low mechanism fit"** warning badge; do **not** hide the trial; show combined score (70%); show pathway chips |
| **(c)** | `missing_moa_default_vector` | eligibility=0.70, mechanism_fit=null, moa_vector=zeros, moa_source="none" | Show **"N/A"** or **"Needs MoA tagging"** for mechanism fit; **no** pathway chips; **combined score hidden**; never treat zero-vector as "real tagging" (use `moa_confidence > 0` or `moa_source !== "none"`) |
| **(d)** | `partial_ranking_eligibility_missing` | eligibility=null, mechanism_fit=0.72 | Show **"Eligibility missing"**; combined score **null/hidden**; mechanism fit shown (72%); pathway chips shown |

### Zero-Vector Bug Prevention (Case c)

**Bug:** `if (moa_vector)` passes even when it's the default all-zeros vector, causing UI to show "tagged" when not.

**Fix:** Do **not** use `if (moa_vector)` to detect tagging. Use:
- `moa_confidence > 0`, or
- `moa_source !== "none"` / `moa_source !== null`

---

## Path-Truthing Commands (Verification)

Run these to validate bug claims and trace data flow. Demand **file paths + exact snippets** for any "bugs discovered."

```bash
# SAE / mechanism vector wiring
rg -n "sae_mechanism_vector|saeMechanismVector|saemechanismvector" api src

# Mechanism ranker + combined score
rg -n "rank_trials_by_mechanism|rankTrialsByMechanism|mechanism_fit_score|combined_score" api src

# Alignment + holistic breakdown
rg -n "mechanism_alignment|alignment_breakdown|boost_applied" api src
```

**Deliverable:** Show the exact object shape at each stage (enrichment → ranking → holistic scoring → route assembly) so we avoid overwriting fields with incompatible schemas.

---

## Checklist

### Mechanism Fit Display
- [ ] `mechanism_fit_score` displayed when present (progress bar or percentage)
- [ ] `mechanism_fit_score` not shown or labeled "N/A" when absent
- [ ] No crash when `mechanism_fit_score` is null/undefined
- [ ] Zero-vector (`moa_source === "none"`) never treated as real tagging

### Combined Score Display
- [ ] `combined_score` or `mechanism_rank_score` displayed when **both** eligibility and mechanism_fit exist
- [ ] Combined score **hidden** when either eligibility or mechanism_fit is null (cases c, d)
- [ ] Fallback to `match_score` when combined/holistic absent
- [ ] Score displayed as percentage (0–100%) with correct scaling
- [ ] Formula enforced: `0.7 × eligibility_score + 0.3 × mechanism_fit_score`

### Per-Pathway Chips
- [ ] Per-pathway chips rendered in correct order: DDR, MAPK, PI3K, VEGF, HER2, IO, Efflux
- [ ] Chips use `mechanism_alignment` (lowercase keys in data; uppercase for display)
- [ ] Pathway chips omitted when `mechanism_alignment` is absent or when `moa_confidence === 0` / `moa_source === "none"`
- [ ] UI layer has deterministic mapper: lowercase (machine) → uppercase (display chips)

### Badges
- [ ] "Mechanism-aligned" badge when `mechanism_fit_score` ≥ 0.50 and present
- [ ] "Low mechanism fit" warning badge when `mechanism_fit_score` < 0.50 and present
- [ ] No mechanism badge when `mechanism_fit_score` is absent
- [ ] "Needs MoA tagging" / "N/A" when `moa_confidence === 0` or `moa_source === "none"`
- [ ] "Eligibility missing" when `eligibility_score` is null but mechanism_fit present (case d)

### Tooltip / Formula
- [ ] Tooltip or caption explains 0.7 × Eligibility + 0.3 × Mechanism Fit
- [ ] Formula visible in at least one component (ClinicalTrialMatchingSection)

### FRONTEND_CONTRACT
- [ ] No speculation when fields are absent
- [ ] No fabricated values; use "N/A", "Not computed", or omit
- [ ] Graceful handling of null/undefined for all optional fields

### Fixture Verification
- [ ] Fixture (a) high_eligibility_high_mechanism: shows "Mechanism-aligned" badge, mechanism fit 85%, combined 88.5%
- [ ] Fixture (b) high_eligibility_low_mechanism: shows "Low mechanism fit" badge; trial visible; combined 70%
- [ ] Fixture (c) missing_moa_default_vector: shows "N/A" or "Needs MoA tagging"; no pathway chips; combined hidden; no zero-vector-as-tagged bug
- [ ] Fixture (d) partial_ranking_eligibility_missing: shows "Eligibility missing"; combined hidden; mechanism fit 72%

---

## Component Coverage

| Component | Location | Expected Fields |
|-----------|----------|-----------------|
| TrialMatchCard | `src/components/trials/TrialMatchCard.jsx` | holistic_score, mechanism_fit_score, moa_tags, scoring_breakdown, HolisticScoreCard |
| TrialMatchesCard | `src/components/orchestrator/Analysis/TrialMatchesCard.jsx` | holistic_score, combined_score, mechanism_fit_score, eligibility_score |
| ClinicalTrialMatchingSection | `src/components/ClinicalDossier/components/ClinicalTrialMatchingSection.jsx` | combined_score, mechanism_fit_score, eligibility_score, formula caption |

---

## Sign-Off

- [ ] All checklist items pass for TrialMatchCard
- [ ] All checklist items pass for TrialMatchesCard
- [ ] All checklist items pass for ClinicalTrialMatchingSection
- [ ] Fixtures render correctly in manual/automated tests
