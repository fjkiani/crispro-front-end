import React, { useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { safeArray } from './slUtils';

function findPrimaryDriver(essentialityScores, brokenPathways) {
  const scoreHit = safeArray(essentialityScores).find(
    (entry) => String(entry?.gene || '').toUpperCase() === 'MBD4'
  );
  if (scoreHit) return scoreHit;

  const pathwayHit = safeArray(brokenPathways).find((entry) =>
    safeArray(entry?.genes_affected).some((gene) => String(gene || '').toUpperCase() === 'MBD4')
  );
  if (!pathwayHit) return null;

  return {
    gene: 'MBD4',
    essentiality_score: pathwayHit?.disruption_score,
    pathway_impact: pathwayHit?.description,
    functional_consequence: 'Pathway-level BER loss detected from bundle context',
  };
}

function findCheckpointCoDriver(brokenPathways) {
  return safeArray(brokenPathways).find(
    (entry) =>
      String(entry?.pathway_id || '').toUpperCase() === 'CHECKPOINT' ||
      safeArray(entry?.genes_affected).some((gene) => String(gene || '').toUpperCase() === 'TP53')
  );
}

export function SlMutationContextCard({
  detected,
  doubleHitDescription,
  essentialityScores,
  brokenPathways,
}) {
  const primaryDriver = useMemo(
    () => findPrimaryDriver(essentialityScores, brokenPathways),
    [essentialityScores, brokenPathways]
  );
  const checkpointCoDriver = useMemo(
    () => findCheckpointCoDriver(brokenPathways),
    [brokenPathways]
  );

  if (!primaryDriver && !checkpointCoDriver && !doubleHitDescription) return null;

  const score =
    typeof primaryDriver?.essentiality_score === 'number'
      ? primaryDriver.essentiality_score.toFixed(3)
      : null;

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: '#f8fafc',
        border: '1px solid #cbd5e1',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 900, color: '#7c3aed', display: 'block', mb: 0.75 }}>
        LETHAL MUTATION CONTEXT
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#111827', mb: 1 }}>
        {primaryDriver?.gene
          ? `${primaryDriver.gene} loss is the anchor lesion for this synthetic lethality readout.`
          : 'Synthetic lethality context is anchored to the bundle-defined repair lesion.'}
      </Typography>

      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', mb: 1 }}>
        {primaryDriver?.gene ? (
          <Chip size="small" label={`${primaryDriver.gene} loss`} sx={{ fontWeight: 700 }} />
        ) : null}
        {score ? <Chip size="small" label={`score ${score}`} variant="outlined" /> : null}
        {detected ? <Chip size="small" label="SL detected" color="success" variant="outlined" /> : null}
        {checkpointCoDriver ? (
          <Chip size="small" label="TP53 / checkpoint compromise" color="warning" variant="outlined" />
        ) : null}
      </Stack>

      {doubleHitDescription ? (
        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 0.75 }}>
          Bundle call: {String(doubleHitDescription)}.
        </Typography>
      ) : null}

      {primaryDriver?.pathway_impact || primaryDriver?.functional_consequence ? (
        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
          {primaryDriver?.pathway_impact
            ? `${String(primaryDriver.pathway_impact)}. `
            : ''}
          {primaryDriver?.functional_consequence
            ? `${String(primaryDriver.functional_consequence)}. `
            : ''}
          Canonical recommendations below should be interpreted against this {primaryDriver?.gene || 'anchor'}-driven {primaryDriver?.pathway_impact || 'pathway disruption'} first, not against the legacy drug list.
        </Typography>
      ) : null}

      {checkpointCoDriver?.description ? (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1 }}>
          Cooperating lesion: {String(checkpointCoDriver.description)}
        </Typography>
      ) : null}
    </Box>
  );
}
