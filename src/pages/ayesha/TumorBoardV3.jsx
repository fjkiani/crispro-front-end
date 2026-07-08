/**
 * TumorBoardV3.jsx
 *
 * v3 Tumor Board — weaponized BD demo for AK (60F HGSOC, Stage IV surveillance).
 *
 * Route: /ayesha/tumor-board/v3
 *
 * Fan-out:
 *   - Railway  → /api/ayesha/therapy-fit/bundle       (existing AK bundle + SL + mutations)
 *   - Render   → /v1/case/full                         (MedSigLIP + LUNA16 + ClinicalBERT)
 *   - Render   → /v1/elo/rank                          (new proxy_rules_lite tournament)
 *
 * Panels (mounted below in Milestones 2-4):
 *   1. Bundle context strip                                        (reused from v1)
 *   2. ImagingPanel        — MedSigLIP-448 on TCIA TCGA-OV pelvic MR
 *   3. CTNodulePanel       — LUNA16 RetinaNet on TCIA TCGA-OV chest CT
 *   4. BiopsyNERPanel      — ClinicalBERT + regex fusion on AK biopsy narrative
 *   5. EloRankingPanel     — proxy_rules_lite tournament, baseline vs enriched diff view
 *   6. SynthesisPane       — cross-modal cross-panel narrative
 *
 * Non-negotiables (from approved PLAN.md):
 *   - No per-panel apologetic disclaimers. One ProvenanceChip top-right, one ModelPedigreeCard drawer.
 *   - All clinical claims in drilldowns cite trial or guideline (GOG-0218, KEYNOTE-100, CAPRI, NCCN Ovarian).
 *   - Bundle context is real data from Railway. Modality panels use real v0.3.0-alpha model outputs.
 */

import React from 'react';

// Placeholder shell for Milestone 1 — real panels wire in Milestones 2-4
export default function TumorBoardV3() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-neutral-400">
              CrisPRO — Tumor Board v3
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              AK &middot; 60F &middot; HGSOC &middot; Stage IV surveillance
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Multi-modal molecular tumor board with Co-Scientist re-ranking
            </p>
          </div>
          {/* ProvenanceChip mounts here in Milestone 2 */}
          <div
            data-testid="provenance-chip-slot"
            className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
          >
            v3 shell &middot; panels mount in M2-M4
          </div>
        </header>

        {/* Panel slots */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PanelSlot id="bundle-context" title="Bundle context" milestone="M2" />
          <PanelSlot id="imaging" title="Imaging — pelvic MR (MedSigLIP-448)" milestone="M3" />
          <PanelSlot id="ct-nodule" title="Thoracic CT — nodule detection (LUNA16)" milestone="M3" />
          <PanelSlot id="biopsy-ner" title="Pathology NER (ClinicalBERT)" milestone="M3" />
          <PanelSlot
            id="elo-ranking"
            title="Co-Scientist Elo — baseline vs enriched"
            milestone="M3"
            wide
          />
          <PanelSlot id="synthesis" title="Cross-modal synthesis" milestone="M4" wide />
        </div>

        <footer className="mt-12 text-xs text-neutral-500">
          Research demonstration. Not for clinical decision-making. Data from TCIA TCGA-OV
          (deidentified public) + synthetic biopsy narrative reconstructed from AK's structured
          biomarker set.
        </footer>
      </div>
    </div>
  );
}

function PanelSlot({ id, title, milestone, wide = false }) {
  return (
    <section
      data-testid={`panel-slot-${id}`}
      className={
        'rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 ' +
        (wide ? 'lg:col-span-2' : '')
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
        <span className="rounded border border-neutral-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
          {milestone}
        </span>
      </div>
      <div className="text-sm text-neutral-500">
        Panel wires in {milestone}. Route reachable. Shell renders. No layout drift on{' '}
        <code className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-400">
          /ayesha/tumor-board
        </code>{' '}
        (v1 untouched).
      </div>
    </section>
  );
}
