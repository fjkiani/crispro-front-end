/**
 * AyeshaTestsUnlocks — Tests & Unlocks page (orchestrator)
 *
 * This file is intentionally thin. All rendering logic lives in:
 *   src/components/ayesha/tests-unlocks/
 *     ├── testsUnlocksUtils.js       — pure utilities
 *     ├── SLConfirmationsCard.jsx    — synthetic lethality confirmations
 *     ├── ProfileSummaryCard.jsx     — patient profile + tests on record
 *     ├── DataGapPanel.jsx           — have vs missing inputs
 *     └── RecommendedTestsCard.jsx   — backend-driven test recommendations
 *   src/components/ayesha/inputs/
 *     └── DataEntryPanel.jsx         — CA-125 entry, HRD entry, NGS prompt
 */
import React, { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, Container, Snackbar, Stack, Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { useAyeshaTestsUnlocksBundle } from '../../hooks/useAyeshaTestsUnlocksBundle';
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';

// Extracted components
import SLConfirmationsCard from '../../components/ayesha/tests-unlocks/SLConfirmationsCard';
import ProfileSummaryCard from '../../components/ayesha/tests-unlocks/ProfileSummaryCard';
import DataGapPanel from '../../components/ayesha/tests-unlocks/DataGapPanel';
import RecommendedTestsCard from '../../components/ayesha/tests-unlocks/RecommendedTestsCard';
import DataEntryPanel from '../../components/ayesha/inputs/DataEntryPanel';

// Utils
import { buildTestsOnRecord, toMarkdownChecklist, safeArray, formatPct } from '../../components/ayesha/tests-unlocks/testsUnlocksUtils';

// ─── helpers ─────────────────────────────────────────────────────────────────

export default function AyeshaTestsUnlocks() {
  const { data: bundle, isLoading, error } = useAyeshaTestsUnlocksBundle();
  const { profile } = useAyeshaProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copiedOpen, setCopiedOpen] = useState(false);
  const [copyErr, setCopyErr] = useState(null);

  // ─── Derived data ──────────────────────────────────────────────────────────
  const l1 = bundle?.levels?.L1 || null;
  const testsNeeded = safeArray(bundle?.tests_needed);
  const sl = bundle?.synthetic_lethality || l1?.synthetic_lethality || null;
  const slDetected = Boolean(sl?.synthetic_lethality_detected === true);
  const inputsUsed = l1?.inputs_used || {};
  const mutations = safeArray(inputsUsed?.mutations);
  const tc = inputsUsed?.tumor_context || {};
  const completeness = l1?.completeness || null;
  const missing = safeArray(completeness?.missing);
  const completenessScore = tc?.completeness_score ?? completeness?.completeness_score ?? null;

  const testsOnRecord = useMemo(() => buildTestsOnRecord(profile), [profile]);
  const uploadTarget = searchParams.get('upload') || '';

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    setCopyErr(null);
    try {
      await navigator.clipboard.writeText(toMarkdownChecklist(testsNeeded));
      setCopiedOpen(true);
    } catch (e) {
      setCopyErr(e?.message || 'Copy failed');
    }
  };

  const handleUpload = (target) => {
    const next = new URLSearchParams(searchParams);
    next.set('upload', String(target));
    setSearchParams(next, { replace: true });
  };

  const handleClearUploadTarget = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('upload');
    setSearchParams(next, { replace: true });
  };

  // ─── Loading / error ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Tests &amp; Unlocks (RUO)</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Loading…</Typography>
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" sx={{ py: 6, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>

        {/* ── Page Header ── */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 900, color: '#64748b' }}>
              AYESHA · TESTS &amp; UNLOCKS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a' }}>
              What to order next (RUO)
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              What data we have today (L1) and the minimal next tests that unlock mechanism, resistance, and higher-confidence therapy fit.
            </Typography>
          </Box>
          <Stack direction="row" gap={1} alignItems="center">
            <Chip
              label={`Completeness: ${typeof completenessScore === 'number' ? formatPct(completenessScore) : '—'}`}
              sx={{ fontWeight: 800, bgcolor: '#e2e8f0' }}
            />
            <Button variant="contained" onClick={handleCopy}>Copy test orders</Button>
          </Stack>
        </Stack>

        {/* ── Alerts ── */}
        {copyErr && <Alert severity="warning" sx={{ mb: 2 }}>{copyErr}</Alert>}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Research Use Only (RUO).</strong> Coordination guidance only — must be reviewed by clinicians.
        </Alert>
        {uploadTarget && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Upload target: <strong>{uploadTarget}</strong>{' '}
            <Button size="small" sx={{ ml: 1 }} onClick={handleClearUploadTarget}>Clear</Button>
          </Alert>
        )}

        {/* ── Sections ── */}
        <Stack gap={3}>
          {/* 1. SL confirmations (conditional) */}
          <SLConfirmationsCard sl={sl} slDetected={slDetected} onUpload={handleUpload} />

          {/* 2. Profile + tests on record + data entry */}
          <ProfileSummaryCard profile={profile} testsOnRecord={testsOnRecord} missing={missing} />

          {/* 3. Data entry panel (CA-125 + HRD + NGS prompt) */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
              Add / update readings
            </Typography>
            <DataEntryPanel profile={profile} missing={missing} />
          </Box>

          {/* 4. Data gap: have vs missing */}
          <DataGapPanel mutations={mutations} tumorContext={tc} missing={missing} />

          {/* 5. Recommended tests */}
          <RecommendedTestsCard testsNeeded={testsNeeded} onUpload={handleUpload} />
        </Stack>
      </Box>

      <Snackbar open={copiedOpen} autoHideDuration={2500} onClose={() => setCopiedOpen(false)}>
        <Alert severity="success" onClose={() => setCopiedOpen(false)} sx={{ width: '100%' }}>
          Copied test order checklist.
        </Alert>
      </Snackbar>
    </Container>
  );
}
