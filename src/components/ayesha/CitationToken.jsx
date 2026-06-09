import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import LockIcon from '@mui/icons-material/Lock';
import GitHubIcon from '@mui/icons-material/GitHub';

// CitationToken renders an arbitrary PMID-like value safely. Backend ships
// three kinds of values in `pmids` arrays:
//   1. Numeric PMIDs (e.g. "35428381")        -> clickable PubMed link
//   2. github: anchors (after PR-B1)          -> outlined chip with github icon
//   3. internal: anchors (pre-B1, transitional) -> outlined chip with lock icon,
//                                                  non-clickable, surfaces a
//                                                  short tooltip explaining
//                                                  this is an internal repo
//                                                  reference not yet published
//
// Anything else (e.g. a DOI, freeform string) renders as inline plain text
// without a link. The component does NOT template raw values into href URLs;
// it gates the PubMed link on a strict numeric regex to prevent PMID-injection
// (e.g. someone shipping a string like "12345?q=evil#x" would otherwise become
// a working URL via raw string concatenation, as DrugRankingPanel.jsx:155 does
// today before PR-F2 lands).
//
// Props:
//   value: string|number — the raw PMID-like token from backend
//   size: 'small' | 'medium' (default 'small')
//   variant: 'chip' | 'inline' (default 'chip') — inline = plain underlined link
//   onUnknown: optional callback for telemetry when an unrecognized token type appears
//
// Single source of truth for PMID rendering across the app.

const NUMERIC_PMID_RE = /^[0-9]{1,9}$/;
const GITHUB_ANCHOR_RE = /^github:[A-Za-z0-9_./-]+$/;
const INTERNAL_ANCHOR_RE = /^internal:[A-Za-z0-9_.:/-]+$/;
const DOI_RE = /^(doi:|10\.)[A-Za-z0-9_./-]+$/i;

function classifyToken(raw) {
  if (raw == null) return { kind: 'empty', value: '' };
  const s = String(raw).trim();
  if (s.length === 0) return { kind: 'empty', value: s };
  if (NUMERIC_PMID_RE.test(s)) return { kind: 'pubmed', value: s };
  if (GITHUB_ANCHOR_RE.test(s)) return { kind: 'github', value: s };
  if (INTERNAL_ANCHOR_RE.test(s)) return { kind: 'internal', value: s };
  if (DOI_RE.test(s)) return { kind: 'doi', value: s };
  return { kind: 'unknown', value: s };
}

function pubmedUrl(pmid) {
  // pmid passed through NUMERIC_PMID_RE upstream; safe to interpolate.
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
}

function githubUrl(anchor) {
  // anchor matches /^github:[A-Za-z0-9_./-]+$/ — strip prefix and build URL.
  const path = anchor.slice('github:'.length);
  return `https://github.com/${path}`;
}

function doiUrl(anchor) {
  const v = anchor.toLowerCase().startsWith('doi:') ? anchor.slice(4) : anchor;
  return `https://doi.org/${v}`;
}

export function CitationToken({ value, size = 'small', variant = 'chip', onUnknown, tooltipOverride }) {
  const { kind, value: v } = classifyToken(value);

  if (kind === 'empty') return null;

  if (kind === 'pubmed') {
    const url = pubmedUrl(v);
    if (variant === 'inline') {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          PMID:{v}
        </a>
      );
    }
    return (
      <Tooltip title={`Open PubMed entry ${v}`} placement="top" arrow>
        <Chip
          size={size}
          label={`PMID:${v}`}
          variant="outlined"
          clickable
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          deleteIcon={<LaunchIcon fontSize="inherit" />}
          onDelete={() => {}}
        />
      </Tooltip>
    );
  }

  if (kind === 'github') {
    const url = githubUrl(v);
    return (
      <Tooltip title="Open internal evidence anchor on GitHub" placement="top" arrow>
        <Chip
          size={size}
          icon={<GitHubIcon fontSize="inherit" />}
          label={v.replace(/^github:/, '')}
          variant="outlined"
          clickable
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        />
      </Tooltip>
    );
  }

  if (kind === 'internal') {
    // Non-clickable: this token refers to an internal Phylo evidence receipt
    // (e.g. internal:crispro-mbd4-atr-gdsc-v1 carries the GDSC1 pharmacologic
    // stratification statistics, not a public PMID). Renders honestly with a
    // lock icon; consumers can pass tooltipOverride to surface the receipt
    // summary text (e.g. EvidenceMatrixTable passes cell.summary).
    const tip = tooltipOverride
      ? tooltipOverride
      : 'Internal Phylo evidence receipt. The anchor identifies a backend-computed evidence cell; the receipt prose lives on the surrounding payload (e.g. cell.summary in evidence_matrix.rows).';
    return (
      <Tooltip
        title={tip}
        placement="top"
        arrow
      >
        <Chip
          size={size}
          icon={<LockIcon fontSize="inherit" />}
          label={v.replace(/^internal:/, 'internal:')}
          variant="outlined"
          color="warning"
          sx={{ cursor: 'help' }}
        />
      </Tooltip>
    );
  }

  if (kind === 'doi') {
    const url = doiUrl(v);
    if (variant === 'inline') {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
          {v}
        </a>
      );
    }
    return (
      <Chip
        size={size}
        label={v}
        variant="outlined"
        clickable
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      />
    );
  }

  // Unknown / unrecognized token. Render as plain text. Optionally emit a
  // telemetry callback so we can detect new backend token formats in the
  // wild without crashing.
  if (typeof onUnknown === 'function') {
    try { onUnknown(v); } catch (_e) { /* noop */ }
  }
  if (variant === 'inline') {
    return <Typography component="span" variant="caption">{v}</Typography>;
  }
  return <Chip size={size} label={v} variant="outlined" />;
}

// Convenience: render a list of tokens as a horizontal stack with the right
// spacing. Limits to `max` tokens and shows "+N more" tail when truncated.
export function CitationTokenList({ values, max = 5, size = 'small', variant = 'chip', tooltipOverride }) {
  const list = Array.isArray(values) ? values : [];
  if (list.length === 0) return null;
  const shown = list.slice(0, max);
  const overflow = list.length - shown.length;
  return (
    <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      {shown.map((v, i) => (
        <CitationToken key={`${String(v)}-${i}`} value={v} size={size} variant={variant} tooltipOverride={tooltipOverride} />
      ))}
      {overflow > 0 ? (
        <Typography variant="caption" color="text.secondary">+{overflow} more</Typography>
      ) : null}
    </Box>
  );
}

export default CitationToken;
