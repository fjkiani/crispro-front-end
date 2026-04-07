/**
 * Shared display helpers for SL UI — avoid NaN% and fake zeros for missing numeric fields.
 */

export function isFinite01(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

/** Human-readable percent from a [0,1] value, or absent label when unknown. */
export function formatPercent01(x, absentLabel = 'Not reported') {
  if (!isFinite01(x)) return absentLabel;
  return `${(x * 100).toFixed(0)}%`;
}

/** MUI Chip props for aggregate synthetic lethality score (pathway diagram). */
export function syntheticLethalityScoreChipProps(score) {
  if (!isFinite01(score)) {
    return { label: 'Unknown', color: 'default' };
  }
  return {
    label: `${(score * 100).toFixed(0)}%`,
    color: score >= 0.7 ? 'success' : score >= 0.5 ? 'warning' : 'default'
  };
}

export function getSyntheticLethalityTierBucket(tier) {
  const normalized = String(tier || '').trim().toLowerCase();

  if (!normalized) return 'unknown';
  if (normalized.includes('validated')) return 'validated';
  if (normalized.includes('strong candidate')) return 'strong';
  if (normalized.includes('mechanistic')) return 'mechanistic';
  if (
    normalized.includes('not supported') ||
    normalized.includes('unsupported') ||
    normalized.includes('confounded') ||
    normalized.includes('negative')
  ) {
    return 'unsupported';
  }

  return 'unknown';
}

export function syntheticLethalityTierChipProps(tier) {
  const label = String(tier || '').trim() || 'Tier not reported';
  const bucket = getSyntheticLethalityTierBucket(tier);

  switch (bucket) {
    case 'validated':
      return {
        label,
        color: 'success',
        tooltip: 'Backend-classified validated synthetic lethality therapeutic lever.'
      };
    case 'strong':
      return {
        label,
        color: 'warning',
        tooltip: 'Backend-classified strong candidate dependency axis.'
      };
    case 'mechanistic':
      return {
        label,
        color: 'info',
        tooltip: 'Backend-classified mechanistic candidate only.'
      };
    case 'unsupported':
      return {
        label,
        color: 'default',
        tooltip: 'Backend-classified unsupported, negative, or confounded axis.'
      };
    default:
      return {
        label,
        color: 'default',
        tooltip: 'Synthetic lethality tier not reported by the backend.'
      };
  }
}
