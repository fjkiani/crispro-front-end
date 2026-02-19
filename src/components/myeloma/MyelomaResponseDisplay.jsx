import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Divider, Grid, Link as MuiLink, Button, Alert, Stack, Tooltip, Table, TableBody, TableCell, TableRow, Drawer } from '@mui/material';
import BaseCard from '../common/BaseCard';
import { Link, useNavigate } from 'react-router-dom';
import useAppStore from '../../store';
import EvidencePanel from './EvidencePanel';
import useApiClient from '../../hooks/useApiClient';
import useResultCache from '../../hooks/useResultCache';
import DeltaProfileChart from './DeltaProfileChart';
import SensitivityProbeTable from './SensitivityProbeTable';
import DualModelAgreement from './DualModelAgreement';
import DeepAnalysisPanel from './DeepAnalysisPanel';
import { API_ROOT as API_BASE_URL } from '../../lib/apiConfig';


const getImpactColor = (impact_level) => {
  if (typeof impact_level !== 'number') {
    return "grey"; // Default color for errors or non-numeric values
  }
  if (impact_level >= 3) return "error.main"; // Red
  if (impact_level >= 2) return "warning.main"; // Orange
  if (impact_level >= 1) return "info.main"; // Gold/Blue
  return "success.main"; // Green
};

const getVariantCall = (detail) => {
  const conf = detail?.evo2_result?.confidence_score;
  const zeta = detail?.evo2_result?.zeta_score;
  const impact = detail?.calculated_impact_level;
  const gating = detail?.evo2_result?.gating;
  
  if (typeof conf !== 'number' || conf < 0.4) {
    // Check if this is specifically due to low sequence evidence
    const isLowSequenceEvidence = gating?.magnitude_ok === false || 
                                 (Math.abs(zeta || 0) < 0.01 && Math.abs(detail?.evo2_result?.min_delta || 0) < 0.1);
    return { 
      label: isLowSequenceEvidence ? 'Unknown (low sequence evidence)' : 'Unknown', 
      color: 'default' 
    };
  }
  if (typeof impact === 'number' && impact >= 1.0 && typeof zeta === 'number' && zeta < 0) {
    return { label: 'Likely Disruptive', color: 'error' };
  }
  return { label: 'Likely Neutral', color: 'success' };
};

const MyelomaResponseDisplay = ({ results }) => {
  const navigate = useNavigate();
  const { setActiveMutation } = useAppStore();
  const [profiles, setProfiles] = useState({});
  const [probes, setProbes] = useState({});
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [deepIdx, setDeepIdx] = useState(null);
  const [deepData, setDeepData] = useState(null);

  if (!results) {
    return <BaseCard title="Awaiting Analysis..."><Typography>Submit patient mutations to analyze drug response.</Typography></BaseCard>;
  }

  const { prediction, pathway_scores, detailed_analysis, mode, upstream_service, selected_model } = results;
  const api = useApiClient(selected_model);
  const cache = useResultCache();

  const runProfile = async (idx, detail) => {
    try {
      setLoadingIdx(idx);
      const { chrom, pos } = detail;
      const vi = detail?.original_variant_data?.variant_info || '';
      const parts = vi.split(/\s+/);
      const alleles = parts[1] || '';
      const [ref, alt] = alleles.split('>');
      const key = cache.makeKey(['profile', selected_model, chrom, pos, ref, alt]);
      if (cache.has(key)) { setProfiles((p) => ({ ...p, [idx]: cache.get(key) })); return; }
      const payload = { assembly: 'GRCh38', chrom: String(chrom), pos: Number(pos), ref: String(ref).toUpperCase(), alt: String(alt).toUpperCase(), flank: 600, radius: 100 };
      const j = await api.post('/api/evo/score_variant_profile', payload);
      cache.set(key, j);
      setProfiles((p) => ({ ...p, [idx]: j }));
    } catch (e) {
      setProfiles((p) => ({ ...p, [idx]: { error: String(e?.message || e) } }));
    } finally {
      setLoadingIdx(null);
    }
  };

  const runProbe = async (idx, detail) => {
    try {
      setLoadingIdx(idx);
      const { chrom, pos } = detail;
      const vi = detail?.original_variant_data?.variant_info || '';
      const parts = vi.split(/\s+/);
      const alleles = parts[1] || '';
      const [ref] = alleles.split('>');
      const key = cache.makeKey(['probe', selected_model, chrom, pos, ref]);
      if (cache.has(key)) { setProbes((p) => ({ ...p, [idx]: cache.get(key) })); return; }
      const payload = { assembly: 'GRCh38', chrom: String(chrom), pos: Number(pos), ref: String(ref).toUpperCase() };
      const j = await api.post('/api/evo/score_variant_probe', payload);
      cache.set(key, j);
      setProbes((p) => ({ ...p, [idx]: j }));
    } catch (e) {
      setProbes((p) => ({ ...p, [idx]: { error: String(e?.message || e) } }));
    } finally {
      setLoadingIdx(null);
    }
  };

  const runDeep = async (idx, detail) => {
    try {
      setDeepIdx(idx);
      setDeepData({ loading: true });
      const vi = detail?.original_variant_data?.variant_info || '';
      const parts = vi.split(/\s+/);
      const alleles = parts[1] || '';
      const [ref, alt] = alleles.split('>');
      const payload = {
        gene: detail.gene,
        hgvs_p: (detail?.variant || '').split(' ')[1] || '',
        assembly: 'GRCh38',
        chrom: String(detail.chrom),
        pos: Number(detail.pos),
        ref: String(ref || '').toUpperCase(),
        alt: String(alt || '').toUpperCase(),
        our_interpretation: detail?.evo2_result?.interpretation,
        our_confidence: detail?.evo2_result?.confidence_score,
        clinvar_url: (detail?.variant && detail?.variant.includes('TP53')) ? undefined : undefined
      };
      const j = await api.post('/api/evidence/deep_analysis', payload);
      // Attach meta for downstream explain/extract actions
      j.meta = {
        gene: detail.gene,
        hgvs_p: (detail?.variant || '').split(' ')[1] || '',
      };
      // Trigger literature query in parallel based on gene/hgvs_p and myeloma context
      try {
        const lit = await api.post('/api/evidence/literature', {
          gene: detail.gene,
          hgvs_p: (detail?.variant || '').split(' ')[1] || '',
          disease: 'multiple myeloma',
          time_window: 'since 2015',
          max_results: 5,
          include_abstracts: true,
          synthesize: Boolean(window?.__mdt_synthesize_lit || false),
        });
        j.literature = lit;
      } catch (e) {
        j.literature = { error: String(e?.message || e) };
      }
      // AI Explanation synthesis
      try {
        const explain = await api.post('/api/evidence/explain', {
          gene: detail.gene,
          hgvs_p: (detail?.variant || '').split(' ')[1] || '',
          evo2_result: detail?.evo2_result || {},
          clinvar: j?.clinvar || {},
          literature: j?.literature || {},
        });
        j.ai_explanation = explain?.explanation || null;
      } catch (e) {
        j.ai_explanation = null;
      }
      setDeepData(j);
    } catch (e) {
      setDeepData({ error: String(e?.message || e) });
    }
  };

  const runAllProfiles = async () => {
    if (!Array.isArray(detailed_analysis)) return;
    for (let i = 0; i < detailed_analysis.length; i++) {
      await runProfile(i, detailed_analysis[i]);
    }
  };

  const runAllProbes = async () => {
    if (!Array.isArray(detailed_analysis)) return;
    for (let i = 0; i < detailed_analysis.length; i++) {
      await runProbe(i, detailed_analysis[i]);
    }
  };

  const summaryCounts = (() => {
    let unknown = 0, disruptive = 0, neutral = 0;
    (detailed_analysis || []).forEach((d) => {
      const call = getVariantCall(d);
      if (call.label === 'Unknown') unknown += 1;
      else if (call.label === 'Likely Disruptive') disruptive += 1;
      else neutral += 1;
    });
    return { unknown, disruptive, neutral };
  })();

  return (
    <Box>
      <BaseCard title="Analysis Complete" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" color="primary">
            Final Prediction: {prediction}
          </Typography>
          <Stack direction="row" spacing={1}>
            {mode && <Chip label={`Mode: ${mode}`} color={mode === 'live' ? 'success' : 'default'} size="small" />}
            {upstream_service && <Chip label="Evo2" variant="outlined" size="small" />}
            <Button size="small" variant="outlined" onClick={runAllProfiles} disabled={!detailed_analysis?.length}>Run All Profiles</Button>
            <Button size="small" variant="outlined" onClick={runAllProbes} disabled={!detailed_analysis?.length}>Run All Probes</Button>
            <Button size="small" variant="outlined" onClick={() => setEvidenceOpen(true)}>Evidence</Button>
          </Stack>
        </Stack>
        {upstream_service && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Upstream: {upstream_service}
          </Typography>
        )}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">RAS/MAPK Pathway Impact Score:</Typography>
            <Chip label={pathway_scores.summed_impact_ras_pathway.toFixed(2)} color="primary" size="medium" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">TP53 Pathway Impact Score:</Typography>
            <Chip label={pathway_scores.summed_impact_tp53.toFixed(2)} color="primary" size="medium" />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1}>
          <Chip label={`Disruptive: ${summaryCounts.disruptive}`} color="error" size="small" />
          <Chip label={`Neutral: ${summaryCounts.neutral}`} color="success" size="small" />
          <Chip label={`Unknown: ${summaryCounts.unknown}`} size="small" />
        </Stack>
      </BaseCard>

      <BaseCard title="Detailed Variant-Level Analysis">
        {detailed_analysis && detailed_analysis.length > 0 ? (
          detailed_analysis.map((detail, index) => (
            <Box key={index} sx={{
              borderLeft: `6px solid ${getImpactColor(detail.calculated_impact_level)}`,
              pl: 2,
              mb: 3,
              pb: 1,
              bgcolor: 'background.paper',
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ mt: 1 }}>Variant: {detail.variant}</Typography>
                  {(() => { const c = getVariantCall(detail); return <Chip label={c.label} color={c.color} size="small"/>; })()}
                </Stack>
                {typeof detail.evo2_result?.confidence_score === 'number' && (
                  <Tooltip title={detail.evo2_result?.confidence_reason || ''}>
                    <Chip label={`Confidence: ${detail.evo2_result.confidence_score}`} size="small" color={detail.evo2_result.confidence_score >= 0.7 ? 'success' : detail.evo2_result.confidence_score >= 0.4 ? 'warning' : 'default'} />
                  </Tooltip>
                )}
              </Stack>
              {detail.evo2_result?.error && (
                <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                  Evo2 error: {detail.evo2_result.error}
                </Alert>
              )}
              <Typography variant="body1">
                <b>Calculated Impact Level: {typeof detail.calculated_impact_level === 'number' ? detail.calculated_impact_level.toFixed(1) : detail.calculated_impact_level}</b><br/>
                Zeta Oracle Interpretation: <i>'{detail.evo2_result?.interpretation || 'N/A'}'</i><br/>
                Zeta Score (Δ): {typeof detail.evo2_result?.zeta_score === 'number' ? detail.evo2_result.zeta_score.toFixed(6) : 'N/A'}
              </Typography>
              {typeof detail.evo2_result?.min_delta === 'number' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Min Δ (multi-window): {detail.evo2_result.min_delta.toFixed(6)}
                  {detail.evo2_result.window_used ? ` @ window ${detail.evo2_result.window_used} bp` : ''}
                </Typography>
              )}
              {typeof detail.evo2_result?.exon_delta === 'number' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Exon-view Δ (±600 bp): {detail.evo2_result.exon_delta.toFixed(6)}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                <b>Explanation:</b> The Zeta Score measures the change in the protein's stability and function caused by the mutation. A negative score indicates disruption; values close to 0 are near-neutral.
              </Typography>
              {detail.variant && (
                <MuiLink 
                  href={`https://www.ncbi.nlm.nih.gov/clinvar/?term=${detail.variant}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}
                >
                  View on ClinVar ↗
                </MuiLink>
              )}
              {(detail.chrom && detail.pos) && (
                <>
                  {' '}
                  <MuiLink
                    href={`https://www.ensembl.org/Homo_sapiens/Location/View?r=${detail.chrom}%3A${Math.max(1, Number(detail.pos) - 600)}-${Number(detail.pos) + 600}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', marginLeft: 8 }}
                  >
                    View region on Ensembl ↗
                  </MuiLink>
                </>
              )}
              {detail.evo2_result?.rationale && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <b>Rationale:</b> {detail.evo2_result.rationale}
                </Typography>
              )}

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="outlined" size="small" disabled={loadingIdx===index} onClick={() => runProfile(index, detail)}>Run Delta Profile</Button>
                <Button variant="outlined" size="small" disabled={loadingIdx===index} onClick={() => runProbe(index, detail)}>Run Sensitivity Probe</Button>
                <Button variant="contained" size="small" onClick={() => runDeep(index, detail)}>Deeper analysis</Button>
              </Stack>

              {/* Profile render */}
              {profiles[index]?.error && <Alert severity="error" sx={{ mt: 1 }}>{profiles[index].error}</Alert>}
              {profiles[index]?.profile && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Local Delta Profile (±100 bp)</Typography>
                  <DeltaProfileChart profile={profiles[index]?.profile || []} />
                  <Typography variant="caption" color="text.secondary">Peak Δ: {profiles[index].peak_delta?.toFixed?.(6)} @ offset {profiles[index].peak_offset}</Typography>
                  {typeof profiles[index]?.fallback_used === 'boolean' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Upstream: {profiles[index]?.upstream_service} {profiles[index]?.fallback_used ? '(fallback to 7B)' : ''}
                    </Typography>
                  )}
                </Box>
              )}
              {/* Probe render */}
              {probes[index]?.error && <Alert severity="error" sx={{ mt: 1 }}>{probes[index].error}</Alert>}
              {probes[index]?.probes && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Sensitivity Probe (alts at locus)</Typography>
                  <SensitivityProbeTable probes={probes[index]?.probes || []} />
                  <Typography variant="caption" color="text.secondary">Top alt: {probes[index].top_alt} (Δ {probes[index].top_delta?.toFixed?.(6)})</Typography>
                  {typeof probes[index]?.fallback_used === 'boolean' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Upstream: {probes[index]?.upstream_service} {profiles[index]?.fallback_used ? '(fallback to 7B)' : ''}
                    </Typography>
                  )}
                </Box>
              )}

              {/* --- Call to Action Button (Design CRISPR Therapy) --- */}
              {typeof detail.calculated_impact_level === 'number' && detail.calculated_impact_level >= 2 && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => {
                      const mutationForHandoff = {
                        hugo_gene_symbol: detail.gene,
                        protein_change: detail.variant.split(' ')[1],
                        genomic_coordinate_hg38: `${detail.chrom}:${detail.pos}`,
                        sequence_for_perplexity: "",
                      };
                      setActiveMutation(mutationForHandoff);
                      navigate('/crispr-designer');
                    }}
                  >
                    🎯 Design CRISPR Therapy
                  </Button>
                </Box>
              )}
              {index < detailed_analysis.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))
        ) : (
          <Typography>No detailed analysis available.</Typography>
        )}
      </BaseCard>

      {/* Dual Model Agreement */}
      <DualModelAgreement data={results} />

      {/* Deep analysis drawer */}
      <Drawer anchor="right" open={deepIdx !== null} onClose={() => { setDeepIdx(null); setDeepData(null); }} PaperProps={{ sx: { width: 400 } }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Deeper Analysis</Typography>
          <DeepAnalysisPanel data={deepData} api={api} runSignature={results?.run_signature} />
        </Box>
      </Drawer>

      <EvidencePanel
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        provenance={{ mode, upstream_service, selected_model }}
        requestJson={{}}
        responseJson={results}
      />
    </Box>
  );
};

export default MyelomaResponseDisplay; 