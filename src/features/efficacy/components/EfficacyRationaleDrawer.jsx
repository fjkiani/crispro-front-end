import React, { useEffect, useState } from 'react';
import { Drawer, Box, Stack, Typography, Chip, Divider, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const fmt = (v) => (typeof v === 'number' ? v.toFixed(3) : String(v||''));

export default function EfficacyRationaleDrawer({ open, onClose, drug, scoringMode, seqDetail, pathwayScores, explainFn, resultData }) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!open) return;
      if (!explainFn || !resultData) return;
      setLoading(true); setError(null);
      try {
        const res = await explainFn(resultData);
        const found = (res?.explanations || []).find((e) => e.name === drug?.name);
        setExplanation(found || null);
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, explainFn, JSON.stringify(resultData), drug?.name]);

  const isMassive = scoringMode && scoringMode.startsWith('massive_');
  const modeLabel = scoringMode === 'massive_impact' ? 'Massive (synthetic 50kb)' : (scoringMode === 'massive_real' ? 'Massive (real ±25kb)' : 'Standard');
  const clin = drug?.clinvar || {};
  const seq = (drug?.rationale||[]).find(r=>r.type==='sequence');
  const path = (drug?.rationale||[]).find(r=>r.type==='pathway');
  const evd = (drug?.rationale||[]).find(r=>r.type==='evidence');
  const windowMeta = seqDetail?.massive_oracle_result?.window;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420 } }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{drug?.name} — Rationale</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{drug?.moa}</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
          <Chip size="small" label={`Score ${fmt(drug?.efficacy_score)}`} color="primary" />
          {drug?.rank_delta != null && (
            <Chip size="small" label={`Δ${drug.rank_delta >= 0 ? '+' : ''}${fmt(drug.rank_delta)}`} 
                  color={drug.rank_delta > 0 ? 'success' : (drug.rank_delta < 0 ? 'error' : 'default')} />
          )}
          <Chip size="small" label={`Conf ${fmt(drug?.confidence)}`} />
          <Chip size="small" label={modeLabel} color={isMassive ? 'warning' : 'default'} />
          {Array.isArray(drug?.badges) && drug.badges.map((b) => (
            <Chip key={b} size="small" label={b} color={b==='PathwayAligned' ? 'success' : (b==='ClinVar-Strong' ? 'secondary' : 'default')} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
          <Chip size="small" label={`Seq ${fmt(seq?.value)} (pct ~${fmt(seq?.percentile)})`} />
          <Chip size="small" label={`Path RAS ${fmt(path?.ras_mapk)} / TP53 ${fmt(path?.tp53)} (pct ~${fmt(path?.percentile)})`} />
          {path?.breakdown && (
            <Chip size="small" label={`Path (wtd) ${fmt(path?.weighted)} [RAS ${fmt(path.breakdown.ras_mapk)} + TP53 ${fmt(path.breakdown.tp53)}]`} variant="outlined" />
          )}
          <Chip size="small" label={`Evd ${fmt(evd?.strength)}`} />
          {clin?.classification && (
            <Chip size="small" label={`ClinVar ${clin.classification}${clin.review_status ? ` (${clin.review_status})` : ''}`} />
          )}
        </Stack>
        
        {/* Enhanced S field details */}
        {seqDetail && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
              Enhanced Sequence Analysis
            </Typography>
            {seqDetail.best_model && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                Best Model: {seqDetail.best_model}
              </Typography>
            )}
            {seqDetail.best_window_bp && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                Best Window: {seqDetail.best_window_bp} bp
              </Typography>
            )}
            {seqDetail.gene_z_score !== undefined && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                Gene Z-Score: {fmt(seqDetail.gene_z_score)}
              </Typography>
            )}
            {seqDetail.calibration_source && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                Calibration: {seqDetail.calibration_source} (n={seqDetail.sample_size || 0})
              </Typography>
            )}
            {seqDetail.worst_case_exon_delta !== undefined && seqDetail.worst_case_exon_delta !== seqDetail.exon_delta && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                Worst-case exon Δ: {fmt(seqDetail.worst_case_exon_delta)} (multi-transcript)
              </Typography>
            )}
            {seqDetail.transcript_count > 0 && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                Transcripts analyzed: {seqDetail.transcript_count}
              </Typography>
            )}
          </Box>
        )}
        {windowMeta && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Window: {windowMeta.start}–{windowMeta.end}
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Explanation</Typography>
        {loading ? (
          <CircularProgress size={20} />
        ) : error ? (
          <Typography variant="body2" color="error">{error}</Typography>
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {explanation?.explanation || 'No explanation available.'}
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Citations</Typography>
        {(drug?.evidence_manifest?.citations || []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">None</Typography>
        ) : (
          <Stack spacing={0.5}>
            {drug.evidence_manifest.citations.map((citation, idx) => (
              <Box key={citation.pmid || idx}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  PMID {citation.pmid}
                </Typography>
                {citation.title && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {citation.title}
                  </Typography>
                )}
                {citation.publication_types && citation.publication_types.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {citation.publication_types.join(', ')}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
} 
 
