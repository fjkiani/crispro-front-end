# The Synthetic Lethality Arsenal

Research Use Only.

## Why Call It An Arsenal

The Synthetic Lethality feature is not one drug picker and not one dependency score. It is a compact arsenal of therapeutic axes that the platform can evaluate against a patient genotype and then sort into four honest buckets:

- validated
- strong candidate
- mechanistic-only
- not supported

That matters because the hard problem in synthetic lethality is not merely finding a signal. The hard problem is deciding whether that signal is:

- already strong enough to act on in a research workflow,
- promising but incomplete,
- merely mechanistic biology without direct leverage,
- or flat-out not supported.

The arsenal exists to make those distinctions visible.

## The Core Promise

The current SL stack answers a narrower, more useful question than "can we discover every possible synthetic lethality relationship in biology?"

It answers:

> Given a query gene or genotype context, which curated therapeutic axes currently have validated, strong, mechanistic, or unsupported evidence receipts?

That is a more honest product promise, and right now it is the correct one.

## What The Arsenal Contains Right Now

The active axis registry currently centers on six therapeutic families:

- `cytidine_analogs`
- `parp_inhibitors`
- `atr_wee1`
- `wrn`
- `immunotherapy`
- `pkmyt1`

These axes are not arbitrary. Each one is tied to a mechanistic rationale in the matrix builder and then fused with modality-level evidence.

### 1. Cytidine Analogs

This is the clearest example of a validated lever in the current system. In the MBD4 context, cytidine analogs are treated as the calibration gold standard.

What the arsenal is really saying:

- there is strong BER-related mechanistic rationale,
- there are in vitro receipts,
- there are in vivo receipts,
- and there is clinical receipt support,
- so this axis qualifies as validated.

This is the engine at its strongest: not speculative, not vague, not "AI vibes," but a multi-modal evidence stack.

### 2. PARP Inhibitors

PARP behaves differently depending on context.

- In `BRCA1` and `BRCA2`, the axis currently lands as validated.
- In `MBD4`, the axis lands as mechanistic-only.

That distinction is exactly why the arsenal matters. A weak frontend would show both as simply "PARP relevant." A good frontend has to show that one is a validated vulnerability and the other is a mechanistic hypothesis with contradictory or incomplete support.

### 3. ATR / WEE1

This is the replication-stress checkpoint family.

Current behavior:

- `ARID1A -> ATR/WEE1` is currently strong
- `MBD4 -> ATR/WEE1` is mechanistic-only
- `TP53 -> ATR/WEE1` is mechanistic-only
- `BRCA1/2 -> ATR/WEE1` remain mechanistic-only in current receipt-driven probes

This is one of the most useful "middle" classes in the arsenal because it shows how the engine handles biologically plausible axes that are not yet validated strongly enough to be overcalled.

### 4. WRN

WRN is where context matters hard.

- `MLH1 -> WRN` is strong
- `MBD4 -> WRN` is only mechanistic/confounded in the current stack

This is a good example of the engine correctly refusing to over-attribute a dependency. If the signal is really MSI-context driven rather than directly MBD4-driven, the platform should not lie. Right now, the tiering logic is trying to preserve exactly that distinction.

### 5. Immunotherapy

Immunotherapy is in the arsenal, but it is not treated as a pure genetic SL story. It is treated as a clinically relevant downstream therapeutic axis linked to hypermutation, neoantigen load, or dMMR/MSI context.

Current examples:

- `MLH1 -> Immunotherapy` is validated
- `MBD4 -> Immunotherapy` is strong
- `BRCA1/2 -> Immunotherapy` are mechanistic-only
- `KRAS -> Immunotherapy` is mechanistic-only

This is important product-wise because users often think "SL" must only mean direct A-B gene dependency. The arsenal is already broader than that and includes clinically actionable leverage classes where the mechanism is indirect but still useful.

### 6. PKMYT1

PKMYT1 is a narrower, context-sensitive axis.

- `CCNE1 -> PKMYT1` currently surfaces as strong
- outside that context it is generally unsupported in the current probe set

This is a good example of a specialized weapon in the arsenal: not broadly available, but highly interesting in the right genomic setup.

## How The Arsenal Functions Internally

The system operates in layers.

### Layer 1: Axis Registry

The platform begins with a curated set of candidate axes. Each axis has:

- a label,
- a mechanistic explanation,
- and an expected therapeutic interpretation.

This means the system is **registry-driven**, not open-ended de novo discovery.

That is a limitation, but also a strength:

- it keeps the output interpretable,
- it prevents ontology sprawl,
- and it makes the frontend understandable to real users.

### Layer 2: Evidence Matrix

For each axis, the engine builds a row in a multi-modal evidence matrix.

Each row can carry evidence from:

- CRISPR dependency
- expression association
- PRISM pharmacology
- GDSC pharmacology
- in vitro functional receipts
- in vivo receipts
- clinical receipts

Each cell gets a status:

- positive
- negative
- mixed
- missing
- confounded

This matrix is the real heart of the arsenal. It is the receipt layer.

### Layer 3: Modality Fusion

The modality fuser applies weighted logic and converts raw matrix rows into:

- `overall_evidence_level`
- `recommendation_tier`
- `crispr_pharmacologic_agreement`
- interpretation text

The current weights intentionally make CRISPR important but **not dominant**. That is a design choice worth calling out.

Why?

Because a clean product should not imply that a single CRISPR dependency result is the whole truth. Compound data, in vivo evidence, and clinical receipts can matter more.

### Layer 4: Frontend Rendering

The frontend then has one job:

do not distort what the backend concluded.

That sounds obvious, but it is exactly where systems often go to hell.

## What We Just Fixed On The Frontend

Before the recent cleanup, the frontend had two ugly failure modes:

1. The matrix summary could overcount "validated" if any modality was positive.
2. Therapy cards were collapsing rich backend semantics into Roman evidence labels only.

That meant the UI could visually flatten:

- validated levers,
- strong candidates,
- mechanistic-only hypotheses,
- and unsupported rows

into a muddier picture than the backend actually produced.

The fix was straightforward but important:

- matrix summary now counts by actual backend `recommendation_tier`
- therapy normalization preserves backend evidence posture
- therapy cards now show distinct SL posture chips

So now the user can actually see the difference between:

- a validated lever,
- a strong candidate dependency axis,
- a mechanistic-only idea,
- and an unsupported/confounded row

That makes the frontend behave like a trustworthy scientific interface instead of a marketing skin.

## What The Arsenal Offers To Users

### For Researchers

The arsenal offers a triage system.

Researchers can use it to separate:

- things worth immediate follow-up,
- things worth assay design,
- things worth literature expansion,
- and things not worth touching yet.

That saves time and keeps the pipeline from getting polluted with weak stories.

### For Translational Teams

The arsenal offers a structured bridge from genotype to therapeutic family.

Instead of asking:

> what random drug list should I inspect?

they can ask:

> which vulnerability axis is actually supported in this context, and how strong is that support?

That makes downstream ranking, trial logic, and mechanistic narratives much cleaner.

### For Frontend / Product

The arsenal offers a clean language model for UI surfaces:

- validated
- strong
- mechanistic
- unsupported

That is much better than pretending everything can be mapped into one generic evidence ladder.

### For Clinical/Research Use Review

The arsenal offers an audit trail.

Because every axis is grounded in a matrix row with modality receipts, users can inspect:

- what was actually positive,
- what was missing,
- what was confounded,
- and why the tier landed where it did.

That is essential for research-facing credibility.

## What We Tested

The current state is mixed but interpretable.

### Green

- The core multimodal SL unit suite passes: `43 passed`
- Receipt-driven matrix probes return coherent tiers for current gene/axis contexts

### Red

- The strict frozen benchmark suite currently fails in this environment
- The benchmark path expects pharmacologic mutant/WT inputs when pharmacology is enabled
- The API test harness currently fails import because `structlog` is missing here

This means the arsenal itself is not imaginary, but the full validation harness around it is not fully green right now.

That is exactly the kind of distinction the platform should be honest about.

## What The Arsenal Can Capture Right Now

Today, the stack can credibly capture:

- BER / cytidine analog vulnerability
- HRD / PARP vulnerability
- replication-stress checkpoint vulnerability
- MSI/dMMR-linked WRN vulnerability
- hypermutator / immunotherapy sensitivity
- CCNE1 / PKMYT1 dependence

That is already useful. It is not universal, but it is not trivial either.

## What It Cannot Honestly Claim Yet

The arsenal cannot yet honestly claim:

- universal discovery of arbitrary new SL classes
- complete green benchmark validation in the current environment
- complete endpoint-level testing in this shell without dependency cleanup
- unlimited generalization outside the curated axis registry

That does not make it weak. It makes it correctly bounded.

## The Real Product Value

The value is not "we found all synthetic lethalities."

The value is:

> we can take known and semi-known vulnerability classes, organize them into a transparent arsenal, fuse evidence across modalities, and show users exactly which levers are validated, which are strong, which are merely mechanistic, and which are unsupported.

That alone is a big upgrade over flat recommendation lists.

## Where This Goes Next

There are four obvious next steps.

### 1. Repair The Frozen Benchmark Path

Right now the benchmark harness is over-strict about pharmacology inputs in this environment. That needs to be fixed so the canonical benchmark can run green without requiring a live external setup every time.

### 2. Expand The Receipt Registry

The most direct way to make the arsenal stronger is to add more curated gene-axis receipt sets with explicit confound handling.

### 3. Deepen Combinatorial Vulnerability Logic

The engine already hints at combined-pathway vulnerabilities. That should become a first-class surfaced capability, not just a side note.

### 4. Keep The Frontend Honest

The frontend has to stay aligned with backend semantics. If the backend says "mechanistic-only," the UI must never visually imply "validated."

That discipline is part of the product moat.

## Bottom Line

The Synthetic Lethality Arsenal is already useful because it does three things well:

- it structures a curated therapeutic vulnerability space,
- it fuses evidence across modalities instead of trusting one signal,
- and it now shows those distinctions honestly in the frontend.

It is not yet a universal SL discovery machine.

But it is a credible, explainable, auditable arsenal of current vulnerability classes, and that is exactly the right place to stand before claiming anything bigger.
