# FE manual verification (post–patch A–E, stabilization)

Backend on `127.0.0.1:8000` (or prod URL). RUO.

## Therapy Fit

- [ ] Open Therapy Fit flow; confirm drug rows show labels (no blank primary text, no `NaN%`).
- [ ] Collapse/expand SL sections; essentiality and drug confidence show **Not reported** / **Unknown** or **—** when numbers missing (not `NaN%`).

## Tests & Unlocks

- [ ] `/ayesha/tests` loads; bundle empty/error shows friendly state (no white screen).
- [ ] Copy checklist works; markdown has no `NaN%`.

## Complete Care

- [ ] Run Complete Care with profile that triggers parallel SL + WIWFM; if guidance returns `{}`, WIWFM SL provenance still appears when present.
- [ ] Synthetic Lethality card: missing `drug_name` shows **Not specified**; confidence chip never `NaN%`.

## MOAT

- [ ] Open MOAT / orchestrator analysis view with SL card; same checks as Complete Care SL card.
- [ ] Pathway diagram (if visible): aggregate SL score missing → chip **Unknown**, not **0%**.
