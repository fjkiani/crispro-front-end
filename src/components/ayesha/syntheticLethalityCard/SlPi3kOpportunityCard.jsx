import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

// NOTE: This card originally targeted only PI3K/AKT/mTOR via the legacy
// `essential_pathways` contract. AK's prod payload ships an empty
// `essential_pathways` list but populates `recommended_drugs` with
// `matrix_axis` enum values per the manuscript-aligned taxonomy:
//   - cytidine_analogs  (Validated SL therapeutic lever — Supported tier)
//   - immunotherapy      (Mechanistic candidate)
//   - parp_inhibitors    (Mechanistic candidate — handled by SlParpOpportunityCard)
//   - atr_wee1           (Mechanistic candidate — handled by SlCheckpointOpportunityCard)
//
// PI3K/AKT/mTOR does not appear in the current axis set. To keep the
// opportunity card slot useful, this component now surfaces the
// manuscript-aligned axes that don't have a dedicated card — i.e.
// cytidine_analogs and immunotherapy — derived from `pi3kDrugs` filtered
// upstream by `matrix_axis`. Card title is dynamic based on which axes
// have drugs present.
//
// Backward compatibility: the legacy `pi3kPathway` prop is still consumed.
// If a future payload ships `essential_pathways[].pathway_id ==
// 'PI3K_AKT_MTOR'`, this card will surface that pathway alongside any
// matrix_axis drugs.

function titleForAxes({ hasCytidine, hasImmunotherapy, hasPi3k }) {
  if (hasPi3k && (hasCytidine || hasImmunotherapy)) {
    return 'PI3K/AKT/mTOR · Cytidine & IO checkpoint axes';
  }
  if (hasPi3k) {
    return 'PI3K/AKT/mTOR axis';
  }
  if (hasCytidine && hasImmunotherapy) {
    return 'Cytidine analogs & IO checkpoint axes';
  }
  if (hasCytidine) {
    return 'Cytidine analog axis';
  }
  if (hasImmunotherapy) {
    return 'IO checkpoint axis';
  }
  return 'Other recommended axes';
}

export function SlPi3kOpportunityCard({
  missingPayload,
  pi3kPathway,
  pi3kDrugs,
}) {
  if (missingPayload) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography sx={{ fontWeight: 900 }}>PI3K/AKT/mTOR · Cytidine & IO axes</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Cannot evaluate: SL payload missing.
        </Typography>
      </Box>
    );
  }

  const drugs = Array.isArray(pi3kDrugs) ? pi3kDrugs : [];
  const hasCytidine = drugs.some((d) => String(d?.matrix_axis || '') === 'cytidine_analogs');
  const hasImmunotherapy = drugs.some((d) => String(d?.matrix_axis || '') === 'immunotherapy');
  const hasPi3k = !!pi3kPathway;

  // B-003 widen: render the card if there is a PI3K pathway in
  // essential_pathways OR there are drugs in pi3kDrugs (cytidine/IO via
  // matrix_axis upstream).
  if (!hasPi3k && drugs.length === 0) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography sx={{ fontWeight: 900 }}>PI3K/AKT/mTOR · Cytidine & IO axes</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          No matching axes in this SL payload (no PI3K in essential_pathways and
          no cytidine_analogs or immunotherapy drugs in recommended_drugs).
        </Typography>
      </Box>
    );
  }

  const title = titleForAxes({ hasCytidine, hasImmunotherapy, hasPi3k });
  const score = Number(pi3kPathway?.disruption_score);
  const genes = Array.isArray(pi3kPathway?.genes_affected) ? pi3kPathway.genes_affected : [];

  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f5f3ff' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
        {hasPi3k ? (
          <Chip size="small" label="Consider-tier pathway opportunity" color="warning" variant="outlined" />
        ) : null}
        {hasCytidine ? (
          <Chip size="small" label="Cytidine: Validated SL lever (Supported)" color="success" variant="outlined" />
        ) : null}
        {hasImmunotherapy ? (
          <Chip size="small" label="IO: Mechanistic candidate" color="warning" variant="outlined" />
        ) : null}
        <Chip size="small" label="UI-derived" variant="outlined" />
        {hasPi3k && Number.isFinite(score) ? (
          <Chip size="small" label={`disruption ${score.toFixed(2)}`} variant="outlined" />
        ) : null}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {hasPi3k
          ? 'This pathway is present in `essential_pathways`, so the UI surfaces a mechanistic opportunity even when legacy `recommended_drugs` is empty.'
          : 'These axes were derived from `recommended_drugs[*].matrix_axis` (cytidine_analogs, immunotherapy) since `essential_pathways` is empty in this payload.'}
      </Typography>

      {hasPi3k && genes.length > 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Genes affected: {genes.join(', ')}
        </Typography>
      ) : null}

      {drugs.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
            Recommended drugs (verbatim from bundle, filtered by matrix_axis)
          </Typography>
          <Stack spacing={1} sx={{ mt: 0.75 }}>
            {drugs.slice(0, 4).map((drug, index) => {
              const axis = String(drug?.matrix_axis || '');
              const axisLabel =
                axis === 'cytidine_analogs' ? 'cytidine_analogs · Supported' :
                axis === 'immunotherapy' ? 'immunotherapy · Mechanistic' :
                axis || 'unknown axis';
              return (
                <Box key={`${String(drug?.drug_name || drug?.drug_class)}-${index}`} sx={{ p: 1, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #ddd6fe' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 900 }}>{String(drug?.drug_name || drug?.drug_class || 'Drug')}</Typography>
                    <Chip size="small" label={axisLabel} variant="outlined" />
                    {drug?.evidence_tier ? (
                      <Chip size="small" label={String(drug.evidence_tier)} variant="outlined" />
                    ) : null}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No matching drugs in the current bundle. Discuss with your oncologist.
        </Typography>
      )}
    </Box>
  );
}
