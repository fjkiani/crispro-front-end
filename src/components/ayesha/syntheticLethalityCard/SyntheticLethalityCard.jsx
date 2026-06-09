import React, { useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { BiologicalRationaleAccordion } from './BiologicalRationaleAccordion';
import { BrokenPathwaysAccordion } from './BrokenPathwaysAccordion';
import { NextTestsAccordion } from './NextTestsAccordion';
import { RecommendedDrugsAccordion } from './RecommendedDrugsAccordion';
import { SlEvidenceMatrixAccordion } from './SlEvidenceMatrixAccordion';
import { SlFullJsonDrawer } from './SlFullJsonDrawer';
import { SlOpportunitiesAccordion } from './SlOpportunitiesAccordion';
import { SlReceiptsDrawer } from './SlReceiptsDrawer';
import { SlSignalBar } from './SlSignalBar';
import { SL_DEBUG, safeArray, safeObj } from './slUtils';
import { getSyntheticLethalitySignal, getSyntheticLethalityWarnings } from '../../../utils/ayesha/syntheticLethalitySignals';

const TIER_ORDER = {
  'Validated SL therapeutic lever': 0,
  'Strong candidate dependency axis': 1,
  'Mechanistic candidate only': 2,
  'Not supported / negative': 3,
};

const EVIDENCE_ORDER = {
  High: 0,
  Moderate: 1,
  Low: 2,
  Negative: 3,
  Missing: 4,
};

// Only tiers with positive or mechanistic evidence are shown in the main
// recommendation ladder. "Not supported / negative" rows are excluded here
// but remain visible in SlEvidenceMatrixAccordion for full auditability.
const DISPLAY_TIERS = new Set([
  'Validated SL therapeutic lever',
  'Strong candidate dependency axis',
  'Mechanistic candidate only',
]);

function normalizeMatrixRecommendation(row, index) {
  return {
    ui_rank: index + 1,
    axis_key: row?.axis_key || row?.axis,
    axis_label: row?.axis_label || row?.display_name || row?.axis_key || row?.axis,
    overall_evidence_level: row?.overall_evidence_level || row?.overallEvidenceLevel,
    recommendation_tier:
      row?.recommendation_tier || row?.final_recommendation_tier || row?.tier,
    display_interpretation: row?.display_interpretation || row?.interpretation,
    positive_modalities: safeArray(row?.positive_modalities || row?.positiveModalities),
    mismatch_vs_legacy: row?.mismatch_vs_legacy || row?.legacy_mismatch,
  };
}

function buildCanonicalRecommendations(payload, evidenceMatrix) {
  const explicit = safeArray(payload?.display_recommendations);
  if (explicit.length) {
    return {
      recommendations: explicit,
      source:
        payload?.display_recommendations_source ||
        'synthetic_lethality.provenance.evidence_matrix.rows',
    };
  }

  const rows = safeArray(evidenceMatrix?.rows);
  if (!rows.length) {
    return { recommendations: [], source: null };
  }

  const normalized = rows
    .filter((row) => {
      const tier =
        row?.recommendation_tier || row?.final_recommendation_tier || row?.tier || '';
      return DISPLAY_TIERS.has(String(tier));
    })
    .map((row, index) => normalizeMatrixRecommendation(row, index))
    .sort((a, b) => {
      const tierCmp =
        (TIER_ORDER[a?.recommendation_tier] ?? 99) -
        (TIER_ORDER[b?.recommendation_tier] ?? 99);
      if (tierCmp !== 0) return tierCmp;

      const evidenceCmp =
        (EVIDENCE_ORDER[a?.overall_evidence_level] ?? 99) -
        (EVIDENCE_ORDER[b?.overall_evidence_level] ?? 99);
      if (evidenceCmp !== 0) return evidenceCmp;

      return (a?.ui_rank ?? 99) - (b?.ui_rank ?? 99);
    })
    .map((row, index) => ({ ...row, ui_rank: index + 1 }));

  return {
    recommendations: normalized,
    source:
      evidenceMatrix?.canonical_recommendation_source === 'rows'
        ? 'synthetic_lethality.provenance.evidence_matrix.rows'
        : 'synthetic_lethality.provenance.evidence_matrix',
  };
}

export function SyntheticLethalityCard({ slData, data, onShowTrials, levelKey: levelKeyProp, testsNeeded }) {
  const payload = slData || data;
  const levelKey = String(levelKeyProp || 'L1').toUpperCase();

  const prov = safeObj(payload?.provenance);
  const evidenceMatrix = prov?.evidence_matrix;
  const status = String(prov?.status || 'unknown');
  const receiptsOk = status === 'ok';

  const broken = safeArray(payload?.broken_pathways);
  const essential = safeArray(payload?.essential_pathways);
  const recs = safeArray(payload?.recommended_drugs);
  const essentialityScores = safeArray(payload?.essentiality_scores);
  const gating = safeObj(payload?.gating);
  const slSignal = useMemo(() => getSyntheticLethalitySignal(payload), [payload]);
  const warnings = useMemo(() => getSyntheticLethalityWarnings(payload), [payload]);
  const detected = slSignal.state === 'locked';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullJsonOpen, setFullJsonOpen] = useState(false);

  const opportunity = useMemo(() => {
    // Derive axis presence flags from both `essential_pathways` (legacy
    // contract) and the `matrix_axis` enum values on `recommended_drugs`
    // (current backend contract). For AK, `essential_pathways` is empty in
    // prod (see backend defect B-003) but `recommended_drugs` ships with
    // `matrix_axis` populated, so axis flags must derive from both.
    const pathwayIds = new Set(essential.map((p) => String(p?.pathway_id || '')).filter(Boolean));
    const recAxes = new Set(recs.map((d) => String(d?.matrix_axis || '')).filter(Boolean));

    const checkpointAxis = pathwayIds.has('ATR') || pathwayIds.has('WEE1') || recAxes.has('atr_wee1');
    const parpAxis = pathwayIds.has('HR') || pathwayIds.has('PARP') || recAxes.has('parp_inhibitors');

    // Cytidine + Immunotherapy axes (the manuscript-aligned axes that the
    // legacy PI3K opportunity card slot now surfaces).
    const cytidineAxis = recAxes.has('cytidine_analogs');
    const immunotherapyAxis = recAxes.has('immunotherapy');

    // Legacy PI3K pathway lookup — kept for backward-compat with any payload
    // that ever ships PI3K_AKT_MTOR in essential_pathways. AK does not.
    const pi3kPathway =
      essential.find((p) => String(p?.pathway_name || '').toUpperCase() === 'PI3K_AKT_MTOR') ||
      essential.find((p) => String(p?.pathway_id || '').toUpperCase() === 'PI3K_AKT_MTOR') ||
      null;

    const checkpointMeta =
      essential.find((p) => p?.pathway_id === 'ATR' || p?.pathway_id === 'WEE1')?.essentiality_metadata || {};
    const parpMeta =
      essential.find((p) => p?.pathway_id === 'HR' || p?.pathway_id === 'PARP')?.essentiality_metadata || {};

    return {
      checkpointAxis,
      parpAxis,
      cytidineAxis,
      immunotherapyAxis,
      pathwayIds,
      recAxes,
      checkpointDepMap: safeArray(checkpointMeta.depmap_lines),
      parpDepMap: safeArray(parpMeta.depmap_lines),
      pi3kPathway,
    };
  }, [essential, recs]);

  // Filter `recommended_drugs` by `matrix_axis` enum (current backend
  // contract) rather than `target_pathway` prose. The backend now ships
  // axis short codes (atr_wee1, parp_inhibitors, cytidine_analogs,
  // immunotherapy) on `matrix_axis`; `target_pathway` holds long-form prose
  // and was never a stable filter key. For backward compatibility, fall
  // back to `target_pathway` short-code matching when `matrix_axis` is
  // absent.
  const checkpointDrugs = useMemo(() => {
    const axisAllow = new Set(['atr_wee1']);
    const legacyAllow = new Set(['ATR', 'WEE1']);
    return recs.filter((d) => {
      const axis = String(d?.matrix_axis || '');
      if (axis) return axisAllow.has(axis);
      return legacyAllow.has(String(d?.target_pathway || ''));
    });
  }, [recs]);

  const parpDrugs = useMemo(() => {
    const axisAllow = new Set(['parp_inhibitors']);
    const legacyAllow = new Set(['HR', 'PARP']);
    return recs.filter((d) => {
      const axis = String(d?.matrix_axis || '');
      if (axis) return axisAllow.has(axis);
      return legacyAllow.has(String(d?.target_pathway || ''));
    });
  }, [recs]);

  // The "PI3K" card slot now surfaces manuscript-aligned axes that don't
  // have a dedicated card: cytidine_analogs (Validated SL therapeutic lever)
  // and immunotherapy (Mechanistic candidate). The card title is dynamic
  // (rendered inside SlPi3kOpportunityCard) based on which axes have drugs.
  // Legacy fallback: PI3K/AKT/MTOR short codes on target_pathway.
  const pi3kDrugs = useMemo(() => {
    const axisAllow = new Set(['cytidine_analogs', 'immunotherapy']);
    const legacyAllow = new Set(['PI3K', 'AKT', 'MTOR', 'PI3K_AKT_MTOR']);
    return recs.filter((d) => {
      const axis = String(d?.matrix_axis || '');
      if (axis) return axisAllow.has(axis);
      return legacyAllow.has(String(d?.target_pathway || '').toUpperCase());
    });
  }, [recs]);

  const depmapLines = useMemo(() => {
    const lines = [];
    for (const d of checkpointDrugs) {
      for (const r of safeArray(d?.rationale)) {
        if (String(r || '').toLowerCase().includes('depmap lineage boost')) lines.push(String(r));
      }
    }
    return Array.from(new Set(lines));
  }, [checkpointDrugs]);

  const parpGating = safeObj(gating?.parp_axis);
  const parpRequires = safeArray(parpGating?.requires);

  const receipts = useMemo(() => {
    const hgvs = prov?.hgvs_resolution;
    const sent = prov?.sequence_scoring?.variants_sent_to_engine;
    const excluded = prov?.sequence_scoring?.variants_excluded;
    return {
      hgvs_resolution: hgvs,
      variants_sent_to_engine: sent,
      variants_excluded: excluded,
    };
  }, [prov]);

  const missingPayload = !payload;
  const headerMsg = missingPayload
    ? 'SL payload is missing from this bundle.'
    : detected
      ? 'SL signal detected (bundle-derived).'
      : slSignal.state === 'consider'
        ? 'Mechanistic candidate present (bundle-derived).'
        : 'No strong SL signal detected (bundle-derived).';

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ScienceIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Synthetic Lethality (RUO)
          </Typography>
          <Chip size="small" label="RUO" variant="outlined" />
        </Box>

        <SlSignalBar
          detected={detected}
          signalState={slSignal.state}
          receiptsOk={receiptsOk}
          status={status}
          hasPayload={!!payload}
          onOpenReceipts={() => setDrawerOpen(true)}
          onOpenFullJson={() => setFullJsonOpen(true)}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {headerMsg}
        </Typography>

        {warnings.map((warning) => (
          <Alert key={warning.key} severity={warning.severity} sx={{ mb: 2 }}>
            <strong>{warning.title}:</strong> {warning.message}
          </Alert>
        ))}

        <SlReceiptsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} receipts={receipts} />

        {SL_DEBUG && (
          <SlFullJsonDrawer open={fullJsonOpen} onClose={() => setFullJsonOpen(false)} payload={payload} />
        )}

        <RecommendedDrugsAccordion
          missingPayload={missingPayload}
          recs={recs}
          isSuperseded={false}
        />

        <BiologicalRationaleAccordion
          doubleHitDescription={payload?.double_hit_description}
          explanationSummary={payload?.explanation?.summary}
        />

        <BrokenPathwaysAccordion missingPayload={missingPayload} levelKey={levelKey} broken={broken} />

        <SlOpportunitiesAccordion
          missingPayload={missingPayload}
          opportunity={opportunity}
          checkpointDrugs={checkpointDrugs}
          depmapLines={depmapLines}
          parpRequires={parpRequires}
          parpDrugs={parpDrugs}
          pi3kDrugs={pi3kDrugs}
          levelKey={levelKey}
          onShowTrials={onShowTrials}
        />

        <NextTestsAccordion testsNeeded={testsNeeded} essentialityScores={essentialityScores} />

        <SlEvidenceMatrixAccordion evidenceMatrix={evidenceMatrix} />
      </CardContent>
    </Card>
  );
}

export default SyntheticLethalityCard;
