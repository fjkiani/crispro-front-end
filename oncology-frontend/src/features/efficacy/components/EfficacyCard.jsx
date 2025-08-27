import React, { useMemo, useState } from 'react';
import { Card, CardContent, Stack, Typography, Chip, Tooltip, Button, IconButton } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import EfficacyRationaleDrawer from './EfficacyRationaleDrawer';

const fmt = (v) => (typeof v === 'number' ? v.toFixed(3) : String(v||''));

export default function EfficacyCard({ drug, scoringMode, seqDetail, pathwayScores, explainFn, resultData }) {
  const [open, setOpen] = useState(false);
  
  const handleCopyRunLink = () => {
    const runSignature = resultData?.run_signature;
    if (runSignature) {
      const runUrl = `${window.location.origin}/myeloma-digital-twin?run=${runSignature}`;
      navigator.clipboard.writeText(runUrl);
      // Could add a toast notification here
    }
  };
  const seq = (drug.rationale||[]).find(r=>r.type==='sequence');
  const path = (drug.rationale||[]).find(r=>r.type==='pathway');
  const evd = (drug.rationale||[]).find(r=>r.type==='evidence');
  const clin = drug.clinvar || {};
  const isMassive = scoringMode && scoringMode.startsWith('massive_');
  const modeLabel = scoringMode === 'massive_impact' ? 'Massive (synthetic 50kb)' : (scoringMode === 'massive_real' ? 'Massive (real ±25kb)' : 'Standard');
  const weightedPath = useMemo(() => {
    const w = drug?.pathway_weights || {};
    const ras = Number(pathwayScores?.ras_mapk || 0);
    const tp53 = Number(pathwayScores?.tp53 || 0);
    const wras = Number(w?.ras_mapk || 0);
    const wtp53 = Number(w?.tp53 || 0);
    const val = wras * ras + wtp53 * tp53;
    return Number.isFinite(val) ? val : 0;
  }, [drug?.pathway_weights, pathwayScores]);
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{drug.name}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={`Score: ${fmt(drug.efficacy_score)}`} color="primary" />
            {drug.rank_delta != null && (
              <Chip size="small" label={`Δ${drug.rank_delta >= 0 ? '+' : ''}${fmt(drug.rank_delta)}`} 
                    color={drug.rank_delta > 0 ? 'success' : (drug.rank_delta < 0 ? 'error' : 'default')} />
            )}
            <Chip size="small" label={`Conf: ${fmt(drug.confidence)}`} />
            <Tooltip title={isMassive ? 'Demonstration mode, not clinical evidence' : 'Standard Evo2 scoring'}>
              <Chip size="small" label={modeLabel} color={isMassive ? 'warning' : 'default'} />
            </Tooltip>
            <Button size="small" onClick={() => setOpen(true)}>Details</Button>
            {resultData?.run_signature && (
              <Tooltip title="Copy run link">
                <IconButton size="small" onClick={handleCopyRunLink}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary">{drug.moa}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={`Seq ${fmt(seq?.value)}`} />
          <Chip size="small" label={`Path RAS ${fmt(path?.ras_mapk)} / TP53 ${fmt(path?.tp53)}`} />
          <Chip size="small" label={`Path (wtd) ${fmt(weightedPath)}`} />
          <Chip size="small" label={`Evd ${fmt(evd?.strength)}`} />
          {drug?.evidence_tier && (
            <Chip size="small" label={`Tier: ${drug.evidence_tier}`} color={drug.evidence_tier==='supported' ? 'success' : (drug.evidence_tier==='consider' ? 'default' : 'error')} />
          )}
          {drug?.meets_evidence_gate && (
            <Chip size="small" label="Meets Gate" color="success" />
          )}
          {Array.isArray(drug.badges) && drug.badges.map((b) => (
            <Chip key={b} size="small" label={b} color={b==='PathwayAligned' ? 'success' : (b==='ClinVar-Strong' ? 'secondary' : 'default')} />
          ))}
          {drug.citations_count > 0 && (
            <Chip size="small" label={`Citations ${drug.citations_count}`} />
          )}
          {clin?.classification && (
            <Chip size="small" label={`ClinVar ${clin.classification}${clin.review_status ? ` (${clin.review_status})` : ''}`} />
          )}
        </Stack>
      </CardContent>
      <EfficacyRationaleDrawer open={open} onClose={() => setOpen(false)} drug={drug} scoringMode={scoringMode} seqDetail={seqDetail} pathwayScores={pathwayScores} explainFn={explainFn} resultData={resultData} />
    </Card>
  );
}
            <Button size="small" onClick={() => setOpen(true)}>Details</Button>
            {resultData?.run_signature && (
              <Tooltip title="Copy run link">
                <IconButton size="small" onClick={handleCopyRunLink}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary">{drug.moa}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={`Seq ${fmt(seq?.value)}`} />
          <Chip size="small" label={`Path RAS ${fmt(path?.ras_mapk)} / TP53 ${fmt(path?.tp53)}`} />
          <Chip size="small" label={`Path (wtd) ${fmt(weightedPath)}`} />
          <Chip size="small" label={`Evd ${fmt(evd?.strength)}`} />
          {drug?.evidence_tier && (
            <Chip size="small" label={`Tier: ${drug.evidence_tier}`} color={drug.evidence_tier==='supported' ? 'success' : (drug.evidence_tier==='consider' ? 'default' : 'error')} />
          )}
          {drug?.meets_evidence_gate && (
            <Chip size="small" label="Meets Gate" color="success" />
          )}
          {Array.isArray(drug.badges) && drug.badges.map((b) => (
            <Chip key={b} size="small" label={b} color={b==='PathwayAligned' ? 'success' : (b==='ClinVar-Strong' ? 'secondary' : 'default')} />
          ))}
          {drug.citations_count > 0 && (
            <Chip size="small" label={`Citations ${drug.citations_count}`} />
          )}
          {clin?.classification && (
            <Chip size="small" label={`ClinVar ${clin.classification}${clin.review_status ? ` (${clin.review_status})` : ''}`} />
          )}
        </Stack>
      </CardContent>
      <EfficacyRationaleDrawer open={open} onClose={() => setOpen(false)} drug={drug} scoringMode={scoringMode} seqDetail={seqDetail} pathwayScores={pathwayScores} explainFn={explainFn} resultData={resultData} />
    </Card>
  );
}
            <Button size="small" onClick={() => setOpen(true)}>Details</Button>
            {resultData?.run_signature && (
              <Tooltip title="Copy run link">
                <IconButton size="small" onClick={handleCopyRunLink}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary">{drug.moa}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={`Seq ${fmt(seq?.value)}`} />
          <Chip size="small" label={`Path RAS ${fmt(path?.ras_mapk)} / TP53 ${fmt(path?.tp53)}`} />
          <Chip size="small" label={`Path (wtd) ${fmt(weightedPath)}`} />
          <Chip size="small" label={`Evd ${fmt(evd?.strength)}`} />
          {drug?.evidence_tier && (
            <Chip size="small" label={`Tier: ${drug.evidence_tier}`} color={drug.evidence_tier==='supported' ? 'success' : (drug.evidence_tier==='consider' ? 'default' : 'error')} />
          )}
          {drug?.meets_evidence_gate && (
            <Chip size="small" label="Meets Gate" color="success" />
          )}
          {Array.isArray(drug.badges) && drug.badges.map((b) => (
            <Chip key={b} size="small" label={b} color={b==='PathwayAligned' ? 'success' : (b==='ClinVar-Strong' ? 'secondary' : 'default')} />
          ))}
          {drug.citations_count > 0 && (
            <Chip size="small" label={`Citations ${drug.citations_count}`} />
          )}
          {clin?.classification && (
            <Chip size="small" label={`ClinVar ${clin.classification}${clin.review_status ? ` (${clin.review_status})` : ''}`} />
          )}
        </Stack>
      </CardContent>
      <EfficacyRationaleDrawer open={open} onClose={() => setOpen(false)} drug={drug} scoringMode={scoringMode} seqDetail={seqDetail} pathwayScores={pathwayScores} explainFn={explainFn} resultData={resultData} />
    </Card>
  );
}