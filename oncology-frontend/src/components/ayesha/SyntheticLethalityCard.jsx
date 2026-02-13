import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LaunchIcon from '@mui/icons-material/Launch';

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function safeObj(v) {
  return v && typeof v === 'object' ? v : {};
}

function pct(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return `${Math.round(v * 100)}%`;
}

function prettyJson(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export function SyntheticLethalityCard({ slData, data, onShowTrials }) {
  const payload = slData || data;
  const detected = payload?.synthetic_lethality_detected === true;

  if (!payload || !detected) return null;

  const prov = safeObj(payload?.provenance);
  const status = String(prov?.status || 'unknown');
  const receiptsOk = status === 'ok';

  const broken = safeArray(payload?.broken_pathways);
  const essential = safeArray(payload?.essential_pathways);
  const recs = safeArray(payload?.recommended_drugs);
  const gating = safeObj(payload?.gating);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const opportunity = useMemo(() => {
    const ids = new Set(essential.map((p) => String(p?.pathway_id || '')).filter(Boolean));
    const checkpointAxis = ids.has('ATR') || ids.has('WEE1');
    const parpAxis = ids.has('HR') || ids.has('PARP');
    return { checkpointAxis, parpAxis, essentialIds: ids };
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

        {/* Signal status bar */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
          <Chip
            icon={detected ? <CheckCircleIcon /> : <CancelIcon />}
            label={`SL signal: ${detected ? 'Detected' : 'Not detected'}`}
            color={detected ? 'success' : 'default'}
            variant={detected ? 'filled' : 'outlined'}
          />
          <Chip
            icon={<ReceiptLongIcon />}
            label={`Receipts: ${receiptsOk ? 'OK' : status}`}
            color={receiptsOk ? 'success' : 'warning'}
            variant="outlined"
          />
          <Button size="small" variant="text" onClick={() => setDrawerOpen(true)}>
            View receipts
          </Button>
        </Stack>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: { xs: 340, sm: 520 }, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              Receipts (verbatim; no inference)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These are excerpted directly from the SL payload.
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
              `hgvs_resolution`
            </Typography>
            <Box component="pre" sx={{ mt: 1, p: 1.5, bgcolor: '#0b1220', color: '#e2e8f0', borderRadius: 2, overflow: 'auto' }}>
              {prettyJson(receipts.hgvs_resolution)}
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 2 }}>
              `variants_sent_to_engine`
            </Typography>
            <Box component="pre" sx={{ mt: 1, p: 1.5, bgcolor: '#0b1220', color: '#e2e8f0', borderRadius: 2, overflow: 'auto' }}>
              {prettyJson(receipts.variants_sent_to_engine)}
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 2 }}>
              `variants_excluded`
            </Typography>
            <Box component="pre" sx={{ mt: 1, p: 1.5, bgcolor: '#0b1220', color: '#e2e8f0', borderRadius: 2, overflow: 'auto' }}>
              {prettyJson(receipts.variants_excluded)}
            </Box>
          </Box>
        </Drawer>

        {/* 3 stacked blocks (collapsible by default) */}
        <Accordion defaultExpanded={false} sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 900 }}>What’s broken (inputs → disruption)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {broken.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No broken pathways reported.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {broken.map((p, idx) => {
                  const pid = String(p?.pathway_id || '');
                  const unmapped = pid === 'UNKNOWN';
                  return (
                    <Box
                      key={`${pid}-${idx}`}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: unmapped ? '#cbd5e1' : '#e2e8f0',
                        bgcolor: unmapped ? '#f8fafc' : '#ffffff',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 900 }}>
                          {unmapped ? 'Unmapped/VUS pathway impact' : String(p?.pathway_name || pid || 'Pathway')}
                        </Typography>
                        <Chip size="small" label={String(p?.status || 'unknown')} variant="outlined" />
                        <Chip size="small" label={`disruption ${pct(p?.disruption_score)}`} variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Genes: {safeArray(p?.genes_affected).filter(Boolean).join(', ') || '—'}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={false} sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 900 }}>Opportunities (axis cards)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              {/* Card A: checkpoint axis */}
              {opportunity.checkpointAxis ? (
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 900 }}>Checkpoint-axis opportunity</Typography>
                    <Chip size="small" label="Mechanism-aligned (RUO)" color="primary" variant="outlined" />
                    {depmapLines.length > 0 ? (
                      <Tooltip title={prettyJson(depmapLines)} placement="top" arrow>
                        <Chip size="small" label="DepMap boost (verbatim)" variant="outlined" />
                      </Tooltip>
                    ) : null}
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Axis: ATR/CHK1 and/or WEE1 (rendered because these pathways appear in `essential_pathways`).
                  </Typography>

                  {checkpointDrugs.length > 0 ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                        Recommended drugs (verbatim)
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 0.75 }}>
                        {checkpointDrugs.slice(0, 3).map((d) => (
                          <Box key={String(d?.drug_name)} sx={{ p: 1, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                              <Typography sx={{ fontWeight: 900 }}>{String(d?.drug_name || 'Drug')}</Typography>
                              <Chip size="small" label={`conf ${pct(d?.confidence)}`} variant="outlined" />
                              <Chip size="small" label={String(d?.approval_status || 'UNKNOWN')} variant="outlined" />
                            </Stack>
                            {d?.mechanism ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                MoA: {String(d.mechanism)}
                              </Typography>
                            ) : null}
                            {safeArray(d?.rationale).length ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {safeArray(d.rationale).slice(0, 2).join(' · ')}
                              </Typography>
                            ) : null}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}

                  <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<LaunchIcon />}
                      onClick={() => (typeof onShowTrials === 'function' ? onShowTrials('checkpoint_axis') : null)}
                      disabled={typeof onShowTrials !== 'function'}
                    >
                      Show trials matching ATR/WEE1 axis
                    </Button>
                    {typeof onShowTrials !== 'function' ? (
                      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                        (Hook not provided on this page)
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Typography sx={{ fontWeight: 900 }}>Checkpoint-axis opportunity</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Not present in this SL payload’s `essential_pathways`.
                  </Typography>
                </Box>
              )}

              {/* Card B: PARP axis gated */}
              {opportunity.parpAxis ? (
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff7ed' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 900 }}>PARP axis</Typography>
                    <Chip size="small" label="GATED — requires HRD/platinum phenotype" color="warning" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Even if HR/PARP appear in `essential_pathways`, patient-level interpretation should be gated by missing data.
                  </Typography>

                  {parpRequires.length > 0 ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                        Request missing data (from backend `gating.parp_axis.requires`)
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
                        {parpRequires.map((req) => (
                          <li key={req}>
                            <Typography variant="body2">{req}</Typography>
                          </li>
                        ))}
                      </Box>
                    </Box>
                  ) : null}

                  {parpDrugs.length > 0 ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                        Drugs surfaced in this axis (verbatim; RUO)
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 0.75 }}>
                        {parpDrugs.slice(0, 2).map((d) => (
                          <Box key={String(d?.drug_name)} sx={{ p: 1, borderRadius: 2, bgcolor: '#fff', border: '1px solid #fed7aa' }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                              <Typography sx={{ fontWeight: 900 }}>{String(d?.drug_name || 'Drug')}</Typography>
                              <Chip size="small" label={String(d?.approval_status || 'UNKNOWN')} variant="outlined" />
                            </Stack>
                            {d?.clinical_context ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Clinical context (gated): {String(d.clinical_context)}
                              </Typography>
                            ) : null}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}
                </Box>
              ) : (
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Typography sx={{ fontWeight: 900 }}>PARP axis</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Not present in this SL payload’s `essential_pathways`.
                  </Typography>
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 900 }}>What tests to order next (highest yield)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Rendered as coordination prompts (RUO). These align to the gating and receipts shown above.
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Confirm MBD4 is truly inactivated in the tumor</strong> — Tumor NGS should clarify this with copy number + VAF context (second hit / LOH).
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Zygosity / LOH / second hit</strong> — biallelic loss matters a lot for repair genes; consider matched normal if feasible.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>HRD testing</strong> — if HRD is high, PARP sensitivity becomes more defensible (and not just “BER → PARP” logic).
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Genomic instability / mutational-signature support</strong> — look for signatures consistent with DNA repair defects (plus overall TMB context).
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Functional evidence (research setting)</strong> — RAD51 foci / replication stress markers (γ‑H2AX), or ex vivo sensitivity assays.
                </Typography>
              </li>
            </Box>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default SyntheticLethalityCard;
