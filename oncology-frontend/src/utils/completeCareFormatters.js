/**
 * Complete Care Plan Data Formatters
 * 
 * Utilities for formatting validated metrics and MOAT data for display.
 */

/**
 * Format relative risk with p-value
 * @param {number} rr - Relative risk value
 * @param {number|string} pValue - P-value (number or string like "<0.05")
 * @returns {string} Formatted string like "RR=2.10 (p<0.05)"
 */
export function formatRelativeRisk(rr, pValue) {
  if (!rr) return 'N/A';
  
  const rrFormatted = typeof rr === 'number' ? rr.toFixed(2) : rr;
  const pFormatted = pValue ? ` (p${pValue})` : '';
  
  return `RR=${rrFormatted}${pFormatted}`;
}

/**
 * Format efficacy score as percentage
 * @param {number} score - Efficacy score (0-1)
 * @returns {string} Formatted string like "Efficacy: 0.94 (94%)"
 */
export function formatEfficacyScore(score) {
  if (score === null || score === undefined) return 'N/A';
  
  const percent = Math.round(score * 100);
  return `Efficacy: ${score.toFixed(2)} (${percent}%)`;
}

/**
 * Format mechanism fit score
 * @param {number} fit - Mechanism fit score (0-1)
 * @returns {string} Formatted string like "Mechanism Fit: 0.94 (94%)"
 */
export function formatMechanismFit(fit) {
  if (fit === null || fit === undefined) return 'N/A';
  
  const percent = Math.round(fit * 100);
  return `Mechanism Fit: ${fit.toFixed(2)} (${percent}%)`;
}

/**
 * Format pathway vector (7D mechanism map)
 * @param {Array<number>|Object} vector - 7D vector array or object with pathway names
 * @returns {string} Formatted string like "DDR: 0.92, MAPK: 0.0, PI3K: 0.15, ..."
 */
export function formatPathwayVector(vector) {
  if (!vector) return 'N/A';
  
  const pathwayNames = ['DDR', 'MAPK', 'PI3K', 'VEGF', 'HER2', 'IO', 'Efflux'];
  
  if (Array.isArray(vector)) {
    return vector
      .map((value, idx) => {
        const name = pathwayNames[idx] || `Pathway${idx + 1}`;
        return `${name}: ${value.toFixed(2)}`;
      })
      .join(', ');
  } else if (typeof vector === 'object') {
    return Object.entries(vector)
      .map(([pathway, value]) => {
        const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
        return `${pathway}: ${formattedValue}`;
      })
      .join(', ');
  }
  
  return 'N/A';
}

/**
 * Format confidence tier
 * @param {string} tier - Confidence tier (HIGH, MEDIUM, LOW)
 * @returns {string} Formatted string with percentage range
 */
export function formatConfidenceTier(tier) {
  const tierMap = {
    'HIGH': 'HIGH (90-100%)',
    'MEDIUM-HIGH': 'MEDIUM-HIGH (75-90%)',
    'MEDIUM': 'MEDIUM (70-85%)',
    'LOW-MEDIUM': 'LOW-MEDIUM (50-70%)',
    'LOW': 'LOW (50-70%)'
  };
  
  return tierMap[tier?.toUpperCase()] || tier || 'UNKNOWN';
}

/**
 * Format evidence tier
 * @param {string} tier - Evidence tier (supported, consider, insufficient)
 * @returns {string} Formatted string with capitalization
 */
export function formatEvidenceTier(tier) {
  if (!tier) return 'Insufficient';
  
  const tierMap = {
    'supported': 'Supported',
    'consider': 'Consider',
    'insufficient': 'Insufficient',
    'tier_i': 'Tier I',
    'tier_ii': 'Tier II',
    'tier_iii': 'Tier III',
    'research': 'Research'
  };
  
  return tierMap[tier.toLowerCase()] || tier.charAt(0).toUpperCase() + tier.slice(1);
}

/**
 * Get validation badge text
 * @param {string} marker - Marker name (e.g., "NF1", "DIS3")
 * @param {string} dataset - Dataset name (e.g., "TCGA-OV", "MMRF")
 * @param {number} n - Sample size
 * @returns {string} Formatted badge like "Validated on 469 TCGA patients"
 */
export function getValidationBadge(marker, dataset, n) {
  if (!marker || !dataset || !n) return '';
  
  return `Validated on ${n} ${dataset} patients`;
}

/**
 * Get confidence badge color
 * @param {string|number} confidence - Confidence level or score
 * @returns {string} MUI color name
 */
export function getConfidenceBadgeColor(confidence) {
  if (typeof confidence === 'number') {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.75) return 'info';
    if (confidence >= 0.7) return 'warning';
    return 'default';
  }
  
  const upperConfidence = confidence?.toUpperCase() || '';
  if (upperConfidence.includes('HIGH')) return 'success';
  if (upperConfidence.includes('MEDIUM')) return 'info';
  return 'default';
}

/**
 * Format TMB value
 * @param {number} tmb - TMB value (mutations per Mb)
 * @param {string} classification - TMB classification (TMB-H, TMB-L)
 * @returns {string} Formatted string like "TMB: 3.2 mut/Mb (TMB-L)"
 */
export function formatTMB(tmb, classification) {
  if (tmb === null || tmb === undefined) return 'TMB: N/A';
  
  const classificationText = classification ? ` (${classification})` : '';
  return `TMB: ${tmb.toFixed(1)} mut/Mb${classificationText}`;
}

/**
 * Format HRD status
 * @param {Object|string} hrd - HRD data object or status string
 * @returns {string} Formatted string
 */
export function formatHRD(hrd) {
  if (!hrd) return 'HRD: N/A';
  
  if (typeof hrd === 'string') {
    return `HRD: ${hrd}`;
  }
  
  const status = hrd.status || hrd.hrd_status || 'Unknown';
  const score = hrd.score || hrd.hrd_score;
  
  if (score !== undefined) {
    return `HRD: ${status} (Score: ${score.toFixed(1)})`;
  }
  
  return `HRD: ${status}`;
}

/**
 * Format MSI status
 * @param {Object|string} msi - MSI data object or status string
 * @returns {string} Formatted string
 */
export function formatMSI(msi) {
  if (!msi) return 'MSI: N/A';
  
  if (typeof msi === 'string') {
    return `MSI: ${msi}`;
  }
  
  const status = msi.status || msi.msi_status || 'Unknown';
  return `MSI: ${status}`;
}




