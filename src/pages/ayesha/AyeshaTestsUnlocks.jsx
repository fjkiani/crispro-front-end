import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { useAyeshaTestsUnlocksBundle } from '../../hooks/useAyeshaTestsUnlocksBundle';
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function formatPct(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return `${Math.round(v * 100)}%`;
}

function formatDate(d) {
  if (!d) return '—';
  try {
    // Keep it simple and deterministic: YYYY-MM-DD in, show YYYY-MM-DD out.
    return String(d);
  } catch {
    return '—';
  }
}

function groupTests(tests) {
  const out = { l2: [], l3: [], other: [] };
  for (const t of safeArray(tests)) {
    const unlocks = safeArray(t?.unlocks).join(' ').toLowerCase();
    if (unlocks.includes('l2')) out.l2.push(t);
    else if (unlocks.includes('l3') || unlocks.includes('resistance')) out.l3.push(t);
    else out.other.push(t);
  }
  return out;
}

function getTestDetailByName(testName) {
  const name = String(testName || '').toLowerCase();
  if (!name) return null;

  // Lightweight, non-claimy metadata. This supplements backend-driven `tests_needed`.
  // Keep it conservative and RUO-framed.
  if (name.includes('ca-125') || name.includes('ca125')) {
    return {
      specimen: 'Blood (serum)',
      outputs: ['CA-125 value (U/mL)', 'Serial trend over time'],
      unlocks: ['Burden classification', 'On-therapy kinetics (early resistance signals)'],
      notes: 'Best value is serial measurements (baseline + during therapy).',
      uploadHint: 'Enter value + date (and cycle if known).',
    };
  }
  if (name.includes('ctdna') || name.includes('circulating tumor dna')) {
    return {
      specimen: 'Blood (plasma)',
      outputs: ['Somatic variants (often without full tumor tissue)', 'Variant allele fractions (VAFs)'],
      unlocks: ['Faster somatic signal', 'Serial molecular response trend (early resistance)'],
      notes: 'Useful when tissue NGS is pending or limited.',
      uploadHint: 'Upload JSON summary or paste key variants.',
    };
  }
  if (name.includes('hrd')) {
    return {
      specimen: 'Tumor tissue (preferred) or validated tumor assay output',
      outputs: ['HRD score', 'LOH/TAI/LST (if reported)', 'BRCA1/2 somatic (if included)'],
      unlocks: ['DDR mechanism confidence', 'PARP / platinum sensitivity context', 'Mechanism map DDR axis'],
      notes: 'HRD is a core unlock for DDR/PARP mechanism.',
      uploadHint: 'Upload the numeric score + assay details (or paste report JSON).',
    };
  }
  if (name.includes('ngs') || name.includes('cgp') || name.includes('comprehensive genomic')) {
    return {
      specimen: 'Tumor tissue (FFPE) ± matched normal (if available)',
      outputs: ['Somatic variants (with HGVS + coordinates)', 'Copy number alterations', 'Fusions', 'TMB/MSI (if reported)'],
      unlocks: ['Real sequence scoring (coords)', 'Broader pathway burden', 'More stable WIWFM outputs'],
      notes: 'Coordinates unlock Evo/Fusion scoring and reduce heuristics.',
      uploadHint: 'Upload report JSON (preferred) or paste key results.',
    };
  }
  if (name.includes('rna') || name.includes('expression')) {
    return {
      specimen: 'Tumor tissue (RNA)',
      outputs: ['Expression signatures', 'Pathway activation proxies'],
      unlocks: ['Mechanism map beyond DNA-only signals', 'Activity confirmation'],
      notes: 'Best used with DNA results (NGS/HRD).',
      uploadHint: 'Upload summary (pathway activity) if available.',
    };
  }
  if (name.includes('proteomic') || name.includes('proteomics')) {
    return {
      specimen: 'Tumor tissue (protein)',
      outputs: ['Protein abundance / pathway activation proxies'],
      unlocks: ['Activity confirmation for targets and pathways'],
      notes: 'Optional; higher depth when available.',
      uploadHint: 'Upload summary if available.',
    };
  }
  return null;
}

function buildTestsOnRecord(profile) {
  const tests = [];
  if (!profile) return tests;

  // Imaging
  const imaging = profile.imaging || {};
  for (const key of Object.keys(imaging)) {
    const item = imaging[key];
    if (!item) continue;
    tests.push({
      category: 'Imaging',
      name: item.modality || key,
      date: item.performed_date || null,
      details: item.impression || (safeArray(item.key_findings).join('; ') || ''),
    });
  }

  // Pathology / IHC (surface the “known” biomarkers as tests-on-record)
  const tc = profile.tumor_context || {};
  const bm = tc.biomarkers || {};
  const ihcBits = [];
  if (bm.pd_l1_status) ihcBits.push(`PD‑L1 ${bm.pd_l1_status}${typeof bm.pd_l1_cps === 'number' ? ` (CPS ${bm.pd_l1_cps})` : ''}`);
  if (bm.mmr_status) ihcBits.push(`MMR ${bm.mmr_status}`);
  if (bm.msi_status) ihcBits.push(`MSI ${bm.msi_status}`);
  if (bm.her2_status) ihcBits.push(`HER2 ${bm.her2_status}${typeof bm.her2_score === 'number' ? ` (${bm.her2_score})` : ''}`);
  if (bm.folr1_status) ihcBits.push(`FOLR1 ${bm.folr1_status}${bm.folr1_percent ? ` (${bm.folr1_percent})` : ''}`);
  if (bm.p53_status) ihcBits.push(`p53 ${bm.p53_status}`);
  if (bm.er_status) ihcBits.push(`ER ${bm.er_status}${typeof bm.er_percent === 'number' ? ` (${bm.er_percent}%)` : ''}`);
  if (bm.pr_status) ihcBits.push(`PR ${bm.pr_status}${bm.pr_percent ? ` (${bm.pr_percent})` : ''}`);
  if (ihcBits.length) {
    tests.push({
      category: 'Pathology / IHC',
      name: 'Tumor biomarker panel (IHC)',
      date: null,
      details: ihcBits.join(' · '),
    });
  }

  // Germline genetic test
  const gl = profile.germline || {};
  if (gl?.panel || gl?.lab) {
    const muts = safeArray(gl.mutations);
    const top = muts
      .slice(0, 4)
      .map((m) => `${m?.gene || 'GENE'} ${m?.protein_change || m?.variant || '—'}${m?.classification ? ` (${m.classification})` : ''}`)
      .filter(Boolean);
    tests.push({
      category: 'Genetics (germline)',
      name: gl.panel ? `Germline panel: ${gl.panel}` : 'Germline genetic test',
      date: gl.test_date || null,
      details: [
        gl.lab ? `Lab: ${gl.lab}` : null,
        gl.accession_number ? `Accession: ${gl.accession_number}` : null,
        top.length ? `Findings: ${top.join(' · ')}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
    });
  }

  // Labs (CA-125)
  const labs = profile.labs || {};
  tests.push({
    category: 'Labs',
    name: 'CA‑125',
    date: null,
    details:
      typeof labs.ca125_value === 'number'
        ? `${labs.ca125_value} ${labs.ca125_units || 'U/mL'}`
        : 'No CA‑125 value on record (needs upload).',
  });

  return tests;
}

function toMarkdownChecklist(tests) {
  const lines = [];
  lines.push('## Ayesha — Next Tests & Unlocks (RUO)');
  lines.push('');
  for (const t of safeArray(tests)) {
    const name = t?.test || 'Test';
    const why = t?.why || '';
    const unlocks = safeArray(t?.unlocks);
    lines.push(`- [ ] **${name}**`);
    if (why) lines.push(`  - Why: ${why}`);
    if (unlocks.length) lines.push(`  - Unlocks: ${unlocks.join(', ')}`);
  }
  lines.push('');
  lines.push('> Research Use Only (RUO): These are coordination prompts, not medical advice.');
  return lines.join('\n');
}

export default function AyeshaTestsUnlocks() {
  const { data: bundle, isLoading, error } = useAyeshaTestsUnlocksBundle();
  const { profile } = useAyeshaProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copiedOpen, setCopiedOpen] = useState(false);
  const [copyErr, setCopyErr] = useState(null);
  const [uploadErr, setUploadErr] = useState(null);
  const [ca125Value, setCa125Value] = useState('');
  const [ca125Date, setCa125Date] = useState('');

  const l1 = bundle?.levels?.L1 || null;
  const testsNeeded = safeArray(bundle?.tests_needed);
  const sl = bundle?.synthetic_lethality || l1?.synthetic_lethality || null;
  const slDetected = Boolean(sl?.synthetic_lethality_detected === true);
  const slReceiptsOk = String(sl?.provenance?.status || 'unknown') === 'ok';
  const slGating = sl?.gating || {};

  const inputsUsed = l1?.inputs_used || {};
  const mutations = safeArray(inputsUsed?.mutations);
  const tc = inputsUsed?.tumor_context || {};
  const completeness = l1?.completeness || null;
  const missing = safeArray(completeness?.missing);

  const grouped = useMemo(() => groupTests(testsNeeded), [testsNeeded]);
  const completenessScore = tc?.completeness_score ?? completeness?.completeness_score ?? null;

  const testsOnRecord = useMemo(() => buildTestsOnRecord(profile), [profile]);
  const uploadTarget = searchParams.get('upload') || '';

  useEffect(() => {
    if (!uploadTarget) return;
    // Best-effort UX: prefill CA-125 if upload target suggests it.
    const t = uploadTarget.toLowerCase();
    if (t.includes('ca-125') || t.includes('ca125')) {
      // No-op; the CA-125 entry form is visible on the page.
    }
  }, [uploadTarget]);

  const handleCopy = async () => {
    setCopyErr(null);
    try {
      const md = toMarkdownChecklist(testsNeeded);
      await navigator.clipboard.writeText(md);
      setCopiedOpen(true);
    } catch (e) {
      setCopyErr(e?.message || 'Copy failed');
    }
  };

  const handleClearUploadTarget = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('upload');
    setSearchParams(next, { replace: true });
  };

  const handleSaveCA125 = () => {
    setUploadErr(null);
    const v = Number(ca125Value);
    if (!Number.isFinite(v) || v <= 0) {
      setUploadErr('Enter a valid CA‑125 numeric value.');
      return;
    }
    if (!ca125Date.trim()) {
      setUploadErr('Enter a date (YYYY‑MM‑DD).');
      return;
    }
    try {
      const key = 'ayesha_ca125_history_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const next = Array.isArray(existing) ? existing.slice() : [];
      next.push({ value: v, date: ca125Date.trim() });
      // Stable ordering by date for display
      next.sort((a, b) => String(a?.date || '').localeCompare(String(b?.date || '')));
      localStorage.setItem(key, JSON.stringify(next));
      setCopiedOpen(true);
      // Keep form values for quick entry; don't clear unless you want.
    } catch (e) {
      setUploadErr(e?.message || 'Failed to save CA‑125 entry.');
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Tests & Unlocks (RUO)
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Loading…
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">Failed to load: {String(error?.message || error)}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 900, color: '#64748b' }}>
              AYESHA · TESTS & UNLOCKS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a' }}>
              What to order next (RUO)
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              This page shows what data we have today (L1) and the minimal next tests that unlock mechanism, resistance, and higher-confidence therapy fit.
            </Typography>
          </Box>

          <Stack direction="row" gap={1} alignItems="center">
            <Chip
              label={`Completeness: ${typeof completenessScore === 'number' ? formatPct(completenessScore) : '—'}`}
              sx={{ fontWeight: 800, bgcolor: '#e2e8f0' }}
            />
            <Button variant="contained" onClick={handleCopy}>
              Copy test orders
            </Button>
          </Stack>
        </Stack>

        {copyErr ? <Alert severity="warning" sx={{ mb: 2 }}>{copyErr}</Alert> : null}
        {uploadErr ? <Alert severity="warning" sx={{ mb: 2 }}>{uploadErr}</Alert> : null}

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Research Use Only (RUO).</strong> This is coordination guidance (what data unlocks which analyses). It must be reviewed by clinicians.
        </Alert>

        {uploadTarget ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Upload target: <strong>{uploadTarget}</strong>{' '}
            <Button size="small" sx={{ ml: 1 }} onClick={handleClearUploadTarget}>
              Clear
            </Button>
          </Alert>
        ) : null}

        {/* NEW: SL-driven highest-yield confirmations (rendered only when SL detected; RUO) */}
        {slDetected ? (
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
                  Synthetic Lethality (RUO) — what we need next (highest yield)
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Receipts: ${slReceiptsOk ? 'OK' : String(sl?.provenance?.status || 'unknown')}`}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                These items are the main “confidence gates” for interpreting axis-level opportunities (especially PARP/DDR).
              </Typography>

              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>
                  <Typography variant="body2">
                    <strong>Confirm MBD4 is truly inactivated in the tumor</strong> — Tumor NGS clarifies this via copy number + VAF context.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Zygosity / LOH / second hit</strong> — biallelic loss matters a lot for repair genes; tumor NGS (± matched normal) helps establish this.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>HRD testing</strong> — if HRD is high, PARP-axis plausibility becomes much more defensible (not just “BER → PARP” logic).
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Genomic instability / mutational-signature support</strong> — repair-defect signatures + overall TMB context help distinguish passenger LoF vs real repair impairment.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Functional evidence (research setting)</strong> — RAD51 foci / replication-stress markers (e.g., γ‑H2AX), or ex vivo sensitivity assays (best confirmation when feasible).
                  </Typography>
                </li>
              </Box>

              {Array.isArray(slGating?.parp_axis?.requires) && slGating.parp_axis.requires.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                    PARP-axis gating requirements (verbatim from backend)
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
                    {slGating.parp_axis.requires.map((r) => (
                      <li key={String(r)}>
                        <Typography variant="body2">{String(r)}</Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              ) : null}

              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={() => setSearchParams({ upload: 'Tumor NGS' })}>
                  Upload Tumor NGS
                </Button>
                <Button variant="outlined" onClick={() => setSearchParams({ upload: 'HRD score' })}>
                  Upload HRD score
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                  Ayesha profile (from record constant)
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Snapshot of the patient profile on record (see `src/constants/patients/ayesha_11_17_25.js`).
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                  <Chip label={`Disease: ${profile?.disease?.type || '—'}`} sx={{ fontWeight: 900 }} />
                  <Chip label={`Stage: ${profile?.disease?.stage || '—'}`} sx={{ fontWeight: 900 }} />
                  <Chip label={`Histology: ${profile?.disease?.histology || '—'}`} sx={{ fontWeight: 900 }} />
                  <Chip label={`Primary: ${profile?.disease?.primary_site || '—'}`} sx={{ fontWeight: 900 }} />
                  <Chip
                    label={`Germline: ${profile?.germline?.status || '—'}`}
                    color={String(profile?.germline?.status || '').toUpperCase() === 'POSITIVE' ? 'error' : 'default'}
                    sx={{ fontWeight: 900 }}
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                  Tests on record (already available)
                </Typography>
                <Grid container spacing={1}>
                  {testsOnRecord.length ? (
                    testsOnRecord.map((t, idx) => (
                      <Grid item xs={12} md={6} key={`${t.category}-${idx}`}>
                        <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                          <CardContent sx={{ py: 1.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                              <Box>
                                <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>{t.name}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>
                                  {t.category}{t.date ? ` · ${formatDate(t.date)}` : ''}
                                </Typography>
                              </Box>
                              <Chip size="small" label="on record" color="success" sx={{ fontWeight: 900 }} />
                            </Stack>
                            {t.details ? (
                              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                {t.details}
                              </Typography>
                            ) : null}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography color="text.secondary">No record items found.</Typography>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                  Quick upload: CA‑125 (fills a known gap)
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Save serial CA‑125 values locally (this browser) so the platform can use kinetics/resistance logic once wired end‑to‑end.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <input
                    value={ca125Date}
                    onChange={(e) => setCa125Date(e.target.value)}
                    placeholder="Date (YYYY-MM-DD)"
                    style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
                  />
                  <input
                    value={ca125Value}
                    onChange={(e) => setCa125Value(e.target.value)}
                    placeholder="CA-125 value (U/mL)"
                    style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
                  />
                  <Button variant="outlined" onClick={handleSaveCA125}>
                    Save
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                  What we have (inputs used)
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mt: 2, mb: 1 }}>
                  Genomics / variants
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {mutations.length ? (
                    mutations.map((m, idx) => {
                      const gene = m?.gene || 'GENE';
                      const hgvs = m?.hgvs_p || m?.hgvs_c || '—';
                      const cls = m?.classification || null;
                      return (
                        <Chip
                          key={`${gene}-${idx}`}
                          label={`${gene} ${hgvs}${cls ? ` · ${cls}` : ''}`}
                          sx={{ fontWeight: 800 }}
                        />
                      );
                    })
                  ) : (
                    <Typography color="text.secondary">No variants provided.</Typography>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                  Tumor context (available badges)
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {tc?.msi_status ? <Chip label={`MSI: ${tc.msi_status}`} sx={{ fontWeight: 800 }} /> : null}
                  {typeof tc?.pd_l1_cps === 'number' ? <Chip label={`PD‑L1 CPS: ${tc.pd_l1_cps}`} sx={{ fontWeight: 800 }} /> : null}
                  {tc?.pd_l1_status ? <Chip label={`PD‑L1: ${tc.pd_l1_status}`} sx={{ fontWeight: 800 }} /> : null}
                  {tc?.er_status ? <Chip label={`ER: ${tc.er_status}${typeof tc?.er_percent === 'number' ? ` (${tc.er_percent}%)` : ''}`} sx={{ fontWeight: 800 }} /> : null}
                  {typeof tc?.ca125_value === 'number' ? <Chip label={`CA‑125: ${tc.ca125_value} ${tc?.ca125_units || 'U/mL'}`} sx={{ fontWeight: 800 }} /> : null}
                  {!tc?.msi_status && tc?.pd_l1_cps == null && !tc?.er_status && tc?.ca125_value == null ? (
                    <Typography color="text.secondary">No tumor-context fields available.</Typography>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                  What’s missing (bottlenecks)
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  These missing items are what cap confidence and block mechanism/resistance depth.
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {missing.length ? (
                    missing.map((m, idx) => (
                      <Chip key={`${m}-${idx}`} label={String(m)} color="warning" variant="outlined" sx={{ fontWeight: 800 }} />
                    ))
                  ) : (
                    <Typography color="text.secondary">No missing fields reported.</Typography>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                  Why these matter (capabilities)
                </Typography>
                <Box component="ul" sx={{ mt: 0, mb: 0, pl: 2, color: '#334155' }}>
                  <li><strong>HRD</strong> unlocks DDR/PARP mechanism and improves therapy fit stability.</li>
                  <li><strong>CGP/TMB + somatic coordinates</strong> unlocks IO axis and enables real sequence scoring instead of heuristics.</li>
                  <li><strong>RNA‑seq</strong> unlocks pathway activation (mechanism map) beyond DNA-only signals.</li>
                  <li><strong>Serial CA‑125 / ctDNA trend</strong> unlocks early resistance detection (kinetics).</li>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
                    Recommended tests (next actions)
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Backend-driven recommendations based on current L1 state.
                  </Typography>
                </Box>
                <Chip label={`Total: ${testsNeeded.length}`} sx={{ fontWeight: 900, bgcolor: '#e2e8f0' }} />
              </Stack>

              <Divider sx={{ my: 2 }} />

              {testsNeeded.length === 0 ? (
                <Alert severity="warning">No test recommendations returned from backend.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {[
                    { title: 'Unlock L2 (core biomarkers)', items: grouped.l2 },
                    { title: 'Unlock L3 (mechanism + resistance)', items: grouped.l3 },
                    { title: 'Other', items: grouped.other },
                  ].map((g) => (
                    <Grid item xs={12} md={4} key={g.title}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                        {g.title}
                      </Typography>
                      <Stack gap={2}>
                        {g.items.length ? (
                          g.items.map((t, idx) => (
                            <Card key={`${g.title}-${idx}`} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                              <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                  <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>
                                    {t?.test || 'Test'}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={String(t?.status || 'missing')}
                                    color={String(t?.status || '').toLowerCase() === 'missing' ? 'warning' : 'success'}
                                    sx={{ fontWeight: 900 }}
                                  />
                                </Stack>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                  {t?.why || '—'}
                                </Typography>

                                {(() => {
                                  const detail = getTestDetailByName(t?.test);
                                  if (!detail) return null;
                                  return (
                                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                      <Typography variant="caption" sx={{ fontWeight: 900, color: '#334155' }}>
                                        DETAILS
                                      </Typography>
                                      <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2, color: '#334155' }}>
                                        <li><strong>Specimen:</strong> {detail.specimen}</li>
                                        <li><strong>Outputs:</strong> {safeArray(detail.outputs).join(', ')}</li>
                                        <li><strong>Unlocks:</strong> {safeArray(detail.unlocks).join(', ')}</li>
                                      </Box>
                                      {detail.notes ? (
                                        <Typography variant="body2" sx={{ mt: 1, color: '#475569' }}>
                                          {detail.notes}
                                        </Typography>
                                      ) : null}
                                    </Box>
                                  );
                                })()}

                                <Box sx={{ mt: 1.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>
                                    UNLOCKS
                                  </Typography>
                                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                                    {safeArray(t?.unlocks).map((u, uidx) => (
                                      <Chip key={`${u}-${uidx}`} size="small" label={String(u)} sx={{ fontWeight: 800 }} />
                                    ))}
                                  </Stack>
                                </Box>

                                <Stack direction="row" gap={1} sx={{ mt: 1.5 }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                      const next = new URLSearchParams(searchParams);
                                      next.set('upload', String(t?.test || ''));
                                      setSearchParams(next, { replace: true });
                                    }}
                                  >
                                    Upload / add result
                                  </Button>
                                </Stack>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Typography color="text.secondary">—</Typography>
                        )}
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar open={copiedOpen} autoHideDuration={2500} onClose={() => setCopiedOpen(false)}>
        <Alert severity="success" onClose={() => setCopiedOpen(false)} sx={{ width: '100%' }}>
          Copied test order checklist.
        </Alert>
      </Snackbar>
    </Container>
  );
}

