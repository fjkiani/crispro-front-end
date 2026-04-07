import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { BiologicalRationaleAccordion } from './BiologicalRationaleAccordion';
import { BrokenPathwaysAccordion } from './BrokenPathwaysAccordion';
import { NextTestsAccordion } from './NextTestsAccordion';
import { RecommendedDrugsAccordion } from './RecommendedDrugsAccordion';
import { SlCanonicalRecommendations } from './SlCanonicalRecommendations';
import { SlEvidenceMatrixAccordion } from './SlEvidenceMatrixAccordion';
import { SlFullJsonDrawer } from './SlFullJsonDrawer';
import { SlMutationContextCard } from './SlMutationContextCard';
import { SlOpportunitiesAccordion } from './SlOpportunitiesAccordion';
import { SlReceiptsDrawer } from './SlReceiptsDrawer';
import { SlSignalBar } from './SlSignalBar';
import { SuggestedTherapyBanner } from './SuggestedTherapyBanner';
import { SL_DEBUG, safeArray, safeObj } from './slUtils';

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

export function SyntheticLethalityCard({ slData, data, onShowTrials, levelKey: levelKeyProp }) {
  const payload = slData || data;
  const detected = payload?.synthetic_lethality_detected === true;
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
  const canonical = useMemo(
    () => buildCanonicalRecommendations(payload, evidenceMatrix),
    [payload, evidenceMatrix]
  );
  const hasCanonicalRecommendations = canonical.recommendations.length > 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullJsonOpen, setFullJsonOpen] = useState(false);

  const opportunity = useMemo(() => {
    const ids = new Set(essential.map((p) => String(p?.pathway_id || '')).filter(Boolean));
    const checkpointAxis = ids.has('ATR') || ids.has('WEE1');
    const parpAxis = ids.has('HR') || ids.has('PARP');

    const checkpointMeta =
      essential.find((p) => p?.pathway_id === 'ATR' || p?.pathway_id === 'WEE1')?.essentiality_metadata || {};
    const parpMeta =
      essential.find((p) => p?.pathway_id === 'HR' || p?.pathway_id === 'PARP')?.essentiality_metadata || {};

    return {
      checkpointAxis,
      parpAxis,
      essentialIds: ids,
      checkpointDepMap: safeArray(checkpointMeta.depmap_lines),
      parpDepMap: safeArray(parpMeta.depmap_lines),
    };
  }, [essential]);

  const checkpointDrugs = useMemo(() => {
    const allow = new Set(['ATR', 'WEE1']);
    return recs.filter((d) => allow.has(String(d?.target_pathway || '')));
  }, [recs]);

  const parpDrugs = useMemo(() => {
    const allow = new Set(['HR', 'PARP']);
    return recs.filter((d) => allow.has(String(d?.target_pathway || '')));
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
          receiptsOk={receiptsOk}
          status={status}
          hasPayload={!!payload}
          onOpenReceipts={() => setDrawerOpen(true)}
          onOpenFullJson={() => setFullJsonOpen(true)}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {headerMsg}
        </Typography>

        <SlMutationContextCard
          detected={detected}
          doubleHitDescription={payload?.double_hit_description}
          essentialityScores={essentialityScores}
          brokenPathways={broken}
        />

        <SlCanonicalRecommendations
          recommendations={canonical.recommendations}
          source={canonical.source}
          onShowTrials={onShowTrials}
        />

        <SuggestedTherapyBanner
          text={payload?.suggested_therapy}
          isSuperseded={hasCanonicalRecommendations}
        />

        <SlReceiptsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} receipts={receipts} />

        {SL_DEBUG && (
          <SlFullJsonDrawer open={fullJsonOpen} onClose={() => setFullJsonOpen(false)} payload={payload} />
        )}

        <RecommendedDrugsAccordion
          missingPayload={missingPayload}
          recs={recs}
          isSuperseded={hasCanonicalRecommendations}
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
          levelKey={levelKey}
          onShowTrials={onShowTrials}
        />

        <NextTestsAccordion />

        <SlEvidenceMatrixAccordion evidenceMatrix={evidenceMatrix} />
      </CardContent>
    </Card>
  );
}

export default SyntheticLethalityCard;
