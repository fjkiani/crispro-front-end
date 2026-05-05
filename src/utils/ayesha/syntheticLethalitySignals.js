const POSITIVE_TIERS = new Set([
  'Validated SL therapeutic lever',
  'Strong candidate dependency axis',
  'Mechanistic candidate only',
]);

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function normalizeLabel(raw) {
  const label = String(raw || '').trim();
  if (!label) return '';
  return label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectCandidateRows(slResult) {
  const payload = safeObject(slResult);
  const explicit = safeArray(payload.display_recommendations);
  const matrixRows = safeArray(payload?.provenance?.evidence_matrix?.rows);
  const rows = explicit.length ? explicit : matrixRows;
  return rows.filter((row) => POSITIVE_TIERS.has(String(row?.recommendation_tier || row?.tier || row?.final_recommendation_tier || '')));
}

function collectCandidateLabels(slResult) {
  const rows = collectCandidateRows(slResult);
  if (rows.length) {
    return rows
      .map((row) => normalizeLabel(row?.axis_label || row?.display_name || row?.axis_key || row?.axis))
      .filter(Boolean);
  }

  return safeArray(slResult?.essential_pathways)
    .map((pathway) => normalizeLabel(pathway?.pathway_name || pathway?.pathway_id))
    .filter(Boolean);
}

export function getSyntheticLethalitySignal(slResult) {
  const payload = safeObject(slResult);
  const detected = payload.synthetic_lethality_detected === true;
  const labels = Array.from(new Set(collectCandidateLabels(payload))).slice(0, 2);
  const labelText = labels.join(' + ');
  const hasCandidate = !detected && labels.length > 0;

  if (detected) {
    const hit = String(payload.double_hit_description || '').split('→')[0].trim();
    return {
      state: 'locked',
      status: 'LOCKED',
      color: 'secondary',
      evidenceLevel: 'L3',
      text: hit ? `${hit} Detected` : 'Validated synthetic lethality signal',
      hasCandidate: true,
    };
  }

  if (hasCandidate) {
    return {
      state: 'consider',
      status: 'CONSIDER',
      color: 'warning',
      evidenceLevel: 'L2',
      text: labelText ? `Mechanistic candidate: ${labelText}` : 'Mechanistic candidate present',
      hasCandidate: true,
    };
  }

  return {
    state: 'none',
    status: 'SCANNING',
    color: 'default',
    evidenceLevel: 'L1',
    text: 'No Mechanistic Vulnerability',
    hasCandidate: false,
  };
}

export function getSyntheticLethalityDirective(slResult) {
  const signal = getSyntheticLethalitySignal(slResult);
  if (signal.state !== 'consider') return null;

  const labels = Array.from(new Set(collectCandidateLabels(slResult))).slice(0, 2);
  const target = labels.join(' + ') || 'Mechanistic vulnerability';

  return {
    headline: 'INVESTIGATE MECHANISTIC CANDIDATE',
    subheadline: target,
    reasoning: [
      'Evidence matrix surfaces a mechanistic candidate axis even though the top-level SL boolean is not locked.',
      'Treat as a consider-tier discovery signal, not as absence of vulnerability.',
    ],
    receipts: {
      level: 'L2',
      inputs: ['NGS', 'Pathway Map', 'Evidence Matrix'],
      missing: ['Functional validation'],
    },
    actionLabel: 'REVIEW DIGITAL TWIN',
    actionRoute: '/ayesha-digital-twin',
    color: 'warning',
  };
}

export function getSyntheticLethalityWarnings(slResult) {
  const payload = safeObject(slResult);
  const evo2 = safeObject(payload?.provenance?.evo2);
  const note = String(evo2.note || '');
  const essentialityScores = safeArray(payload.essentiality_scores);

  const evo2Offline =
    evo2.evo2_used === false ||
    note.toLowerCase().includes('not_evo2_deltas') ||
    essentialityScores.some((item) => item?.evo2_used === false);

  if (!evo2Offline) return [];

  return [
    {
      key: 'genomic-scoring-offline',
      severity: 'warning',
      title: 'Genomic Scoring Offline',
      message:
        'This SL bundle fell back to DepMap/matrix-gated evidence instead of live Evo2 deltas. Treat the signal as degraded provenance until Evo2 receipts are restored.',
    },
  ];
}
